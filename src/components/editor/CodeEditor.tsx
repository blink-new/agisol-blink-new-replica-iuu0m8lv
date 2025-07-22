import { useState, useEffect } from 'react'
import Editor from '@monaco-editor/react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Folder, 
  FolderOpen, 
  ChevronRight, 
  ChevronDown,
  Plus,
  Save,
  Download,
  Play
} from 'lucide-react'
import type { FileNode } from '@/types'

interface CodeEditorProps {
  projectId: string
  files: FileNode[]
  onFileChange?: (path: string, content: string) => void
  onRunProject?: () => void
  isRunning?: boolean
}

export function CodeEditor({ projectId, files, onFileChange, onRunProject, isRunning }: CodeEditorProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [fileContents, setFileContents] = useState<Record<string, string>>({})
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']))
  const [openTabs, setOpenTabs] = useState<string[]>([])

  useEffect(() => {
    // Auto-open main files
    const mainFiles = files.filter(f => 
      f.name === 'App.tsx' || 
      f.name === 'main.tsx' || 
      f.name === 'index.tsx'
    )
    if (mainFiles.length > 0 && openTabs.length === 0) {
      const mainFile = mainFiles[0]
      setOpenTabs([mainFile.path])
      setSelectedFile(mainFile.path)
      if (mainFile.content) {
        setFileContents(prev => ({ ...prev, [mainFile.path]: mainFile.content! }))
      }
    }
  }, [files, openTabs.length])

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(path)) {
        newSet.delete(path)
      } else {
        newSet.add(path)
      }
      return newSet
    })
  }

  const openFile = (file: FileNode) => {
    if (file.type === 'directory') {
      toggleFolder(file.path)
      return
    }

    if (!openTabs.includes(file.path)) {
      setOpenTabs(prev => [...prev, file.path])
    }
    setSelectedFile(file.path)
    
    if (file.content && !fileContents[file.path]) {
      setFileContents(prev => ({ ...prev, [file.path]: file.content! }))
    }
  }

  const closeTab = (path: string) => {
    setOpenTabs(prev => prev.filter(tab => tab !== path))
    if (selectedFile === path) {
      const remainingTabs = openTabs.filter(tab => tab !== path)
      setSelectedFile(remainingTabs.length > 0 ? remainingTabs[remainingTabs.length - 1] : null)
    }
  }

  const handleEditorChange = (value: string | undefined, path: string) => {
    if (value !== undefined) {
      setFileContents(prev => ({ ...prev, [path]: value }))
      onFileChange?.(path, value)
    }
  }

  const getLanguageFromPath = (path: string): string => {
    const ext = path.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'tsx':
      case 'ts':
        return 'typescript'
      case 'jsx':
      case 'js':
        return 'javascript'
      case 'css':
        return 'css'
      case 'html':
        return 'html'
      case 'json':
        return 'json'
      case 'md':
        return 'markdown'
      default:
        return 'plaintext'
    }
  }

  const renderFileTree = (nodes: FileNode[], level = 0): React.ReactNode => {
    return nodes.map((node) => (
      <div key={node.path}>
        <div
          className={`flex items-center space-x-2 px-2 py-1 hover:bg-muted/50 cursor-pointer ${
            selectedFile === node.path ? 'bg-accent/20' : ''
          }`}
          style={{ paddingLeft: `${level * 12 + 8}px` }}
          onClick={() => openFile(node)}
        >
          {node.type === 'directory' ? (
            <>
              {expandedFolders.has(node.path) ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
              {expandedFolders.has(node.path) ? (
                <FolderOpen className="w-4 h-4 text-accent" />
              ) : (
                <Folder className="w-4 h-4 text-accent" />
              )}
            </>
          ) : (
            <>
              <div className="w-4" />
              <FileText className="w-4 h-4 text-muted-foreground" />
            </>
          )}
          <span className="text-sm truncate">{node.name}</span>
        </div>
        {node.type === 'directory' && expandedFolders.has(node.path) && node.children && (
          <div>
            {renderFileTree(node.children, level + 1)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <div className="flex h-full bg-card">
      {/* File Explorer */}
      <div className="w-64 border-r border-border bg-card/50">
        <div className="p-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-sm">Explorer</h3>
            <div className="flex space-x-1">
              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2">
            {renderFileTree(files)}
          </div>
        </ScrollArea>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        {openTabs.length > 0 && (
          <div className="flex items-center border-b border-border bg-card/30">
            <div className="flex-1 flex overflow-x-auto">
              {openTabs.map((tabPath) => {
                const fileName = tabPath.split('/').pop() || tabPath
                return (
                  <div
                    key={tabPath}
                    className={`flex items-center space-x-2 px-3 py-2 border-r border-border cursor-pointer hover:bg-muted/50 ${
                      selectedFile === tabPath ? 'bg-accent/10' : ''
                    }`}
                    onClick={() => setSelectedFile(tabPath)}
                  >
                    <FileText className="w-3 h-3" />
                    <span className="text-xs">{fileName}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        closeTab(tabPath)
                      }}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ×
                    </button>
                  </div>
                )
              })}
            </div>
            <div className="flex items-center space-x-2 px-3">
              <Button
                size="sm"
                variant="ghost"
                onClick={onRunProject}
                disabled={isRunning}
                className="h-7"
              >
                <Play className="w-3 h-3 mr-1" />
                {isRunning ? 'Running...' : 'Run'}
              </Button>
              <Button size="sm" variant="ghost" className="h-7">
                <Save className="w-3 h-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        )}

        {/* Editor */}
        <div className="flex-1">
          {selectedFile ? (
            <Editor
              height="100%"
              language={getLanguageFromPath(selectedFile)}
              value={fileContents[selectedFile] || ''}
              onChange={(value) => handleEditorChange(value, selectedFile)}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                roundedSelection: false,
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 2,
                insertSpaces: true,
                wordWrap: 'on',
                folding: true,
                lineDecorationsWidth: 10,
                lineNumbersMinChars: 3,
                glyphMargin: false,
                scrollbar: {
                  vertical: 'auto',
                  horizontal: 'auto',
                  verticalScrollbarSize: 8,
                  horizontalScrollbarSize: 8,
                },
              }}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Select a file to start editing</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}