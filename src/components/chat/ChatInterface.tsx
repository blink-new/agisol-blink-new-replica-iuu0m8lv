import { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Send, Paperclip, Zap } from 'lucide-react'
import { blink } from '@/blink/client'
import type { ChatMessage, User } from '@/types'
import ReactMarkdown from 'react-markdown'

interface ChatInterfaceProps {
  projectId: string
  onCodeGenerated?: (code: string, fileName: string) => void
}

export function ChatInterface({ projectId, onCodeGenerated }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const loadMessages = useCallback(async () => {
    try {
      const chatMessages = await blink.db.chatMessages.list({
        where: { projectId },
        orderBy: { timestamp: 'asc' },
        limit: 100
      })
      setMessages(chatMessages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }, [projectId])

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
    })
    return unsubscribe
  }, [])

  useEffect(() => {
    loadMessages()
  }, [projectId, loadMessages])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendWithTemplate = useCallback(async (messageContent: string, template?: string) => {
    if (!messageContent.trim() || !user || isStreaming) return

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}_user`,
      role: 'user',
      content: messageContent.trim(),
      timestamp: Date.now(),
      projectId,
      userId: user.id
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsStreaming(true)

    try {
      // Save user message to database
      await blink.db.chatMessages.create({
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        timestamp: userMessage.timestamp,
        projectId: userMessage.projectId,
        userId: userMessage.userId
      })

      // Create assistant message placeholder
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}_assistant`,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        projectId,
        userId: user.id,
        isStreaming: true
      }

      setMessages(prev => [...prev, assistantMessage])

      // Call our AI backend function with template
      const response = await fetch('https://iuu0m8lv--ai-chat.functions.blink.new', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.slice(-5), // Include last 5 messages for context
            userMessage
          ].map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          template: template
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      const fullResponse = data.response;
      
      // Update the message with the full response
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, content: fullResponse }
          : msg
      ))

      // Save final assistant message
      await blink.db.chatMessages.create({
        id: assistantMessage.id,
        role: 'assistant',
        content: fullResponse,
        timestamp: assistantMessage.timestamp,
        projectId,
        userId: user.id
      })

      // Update message to remove streaming state
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessage.id 
          ? { ...msg, isStreaming: false }
          : msg
      ))

      // Check if HTML was generated and trigger code generation
      if (data.html && onCodeGenerated) {
        onCodeGenerated(data.html, 'index.html')
      }

      // Check if response contains code and trigger code generation
      if (fullResponse.includes('```') && onCodeGenerated) {
        const codeBlocks = fullResponse.match(/```[\s\S]*?```/g)
        if (codeBlocks) {
          codeBlocks.forEach(block => {
            const lines = block.split('\n')
            const language = lines[0].replace('```', '').trim()
            const code = lines.slice(1, -1).join('\n')
            if (code.trim()) {
              onCodeGenerated(code, `generated.${language || 'txt'}`)
            }
          })
        }
      }

    } catch (error) {
      console.error('Failed to send message:', error)
      setMessages(prev => prev.slice(0, -1)) // Remove assistant message on error
    } finally {
      setIsStreaming(false)
    }
  }, [user, isStreaming, messages, projectId, onCodeGenerated])

  // Auto-send initial prompt from landing page
  useEffect(() => {
    if (user && (window as any).initialChatPrompt) {
      const initialPrompt = (window as any).initialChatPrompt
      const initialTemplate = (window as any).initialChatTemplate
      
      // Clear the global variables
      delete (window as any).initialChatPrompt
      delete (window as any).initialChatTemplate
      
      // Auto-send the initial message
      setTimeout(() => {
        setInput(initialPrompt)
        // Trigger the send automatically
        setTimeout(() => {
          if (initialPrompt.trim()) {
            handleSendWithTemplate(initialPrompt, initialTemplate)
          }
        }, 500)
      }, 1000)
    }
  }, [user, handleSendWithTemplate])

  const handleSend = async () => {
    if (!input.trim() || !user || isStreaming) return
    
    await handleSendWithTemplate(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-card">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AGISOL AI</h3>
            <p className="text-xs text-muted-foreground">Your AI development assistant</p>
          </div>
        </div>
      </div>

      <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="h-12 w-12 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-accent" />
              </div>
              <h4 className="font-medium mb-2">Start building with AGISOL AI</h4>
              <p className="text-sm text-muted-foreground">
                Describe what you want to build and I'll help you create it.
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex space-x-3 animate-fade-in-up ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-accent text-white text-xs">
                    AI
                  </AvatarFallback>
                </Avatar>
              )}
              
              <div
                className={`max-w-[80%] rounded-lg px-4 py-2 ${
                  message.role === 'user'
                    ? 'bg-accent text-white ml-auto'
                    : 'bg-muted'
                }`}
              >
                {message.role === 'assistant' ? (
                  <div className="prose prose-sm prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                    {message.isStreaming && (
                      <div className="flex items-center space-x-1 mt-2">
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                        <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                )}
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8 mt-1">
                  <AvatarFallback className="bg-secondary text-xs">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Describe what you want to build..."
              className="min-h-[44px] max-h-32 resize-none pr-12"
              disabled={isStreaming}
            />
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              disabled
            >
              <Paperclip className="w-4 h-4" />
            </Button>
          </div>
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            size="sm"
            className="h-11 px-4 bg-accent hover:bg-accent/90"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}