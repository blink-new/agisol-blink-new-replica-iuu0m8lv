import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, 
  Code, 
  Database, 
  Palette, 
  Rocket, 
  Users,
  ArrowRight,
  Sparkles,
  Globe,
  Shield
} from 'lucide-react'
import { blink } from '@/blink/client'
import type { User } from '@/types'

export function LandingPage() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleCreateProject = async () => {
    if (!prompt.trim()) return
    
    setIsCreating(true)
    try {
      // In real implementation, create project with AI
      const projectId = `project_${Date.now()}`
      
      // Simulate project creation
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Navigate to project editor
      navigate(`/project/${projectId}`)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleLogin = () => {
    blink.auth.login()
  }

  const features = [
    {
      icon: Zap,
      title: 'AI-Powered Development',
      description: 'Generate complete applications with natural language prompts'
    },
    {
      icon: Code,
      title: 'Full-Stack Ready',
      description: 'Frontend, backend, database, and deployment - all included'
    },
    {
      icon: Database,
      title: 'Built-in Database',
      description: 'SQLite database with visual management and real-time queries'
    },
    {
      icon: Palette,
      title: 'Beautiful UI',
      description: 'Modern, responsive designs with dark theme and animations'
    },
    {
      icon: Rocket,
      title: 'One-Click Deploy',
      description: 'Instant deployment to production with custom domains'
    },
    {
      icon: Shield,
      title: 'Enterprise Security',
      description: 'Built-in authentication, encryption, and secure hosting'
    }
  ]

  const examples = [
    'Build a todo app with user authentication',
    'Create an e-commerce store with Stripe payments',
    'Make a social media dashboard with real-time updates',
    'Build a project management tool like Notion',
    'Create a chat application with AI assistant',
    'Make a portfolio website with blog functionality'
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-bold text-xl">AGISOL</span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">Welcome, {user.displayName || user.email}</span>
                <Button onClick={() => navigate('/dashboard')} size="sm">
                  Dashboard
                </Button>
              </div>
            ) : (
              <Button onClick={handleLogin} size="sm">
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered Development Platform
            </Badge>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Build Apps with AI in Seconds
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Describe your idea and watch AGISOL create a complete, production-ready application 
              with frontend, backend, database, and deployment - all powered by AI.
            </p>
          </div>

          {/* AI Chat Input */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the app you want to build... (e.g., 'Create a task management app with user authentication and real-time collaboration')"
                className="min-h-[120px] text-base resize-none pr-16"
                disabled={isCreating}
              />
              <Button
                onClick={handleCreateProject}
                disabled={!prompt.trim() || isCreating || !user}
                className="absolute bottom-3 right-3 bg-accent hover:bg-accent/90"
                size="sm"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Build App
                  </>
                )}
              </Button>
            </div>
            
            {!user && (
              <p className="text-sm text-muted-foreground mt-2">
                <Button variant="link" onClick={handleLogin} className="p-0 h-auto text-accent">
                  Sign in
                </Button>
                {' '}to start building your app
              </p>
            )}
          </div>

          {/* Example Prompts */}
          <div className="mb-16">
            <p className="text-sm text-muted-foreground mb-4">Try these examples:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto">
              {examples.map((example, index) => (
                <button
                  key={index}
                  onClick={() => setPrompt(example)}
                  className="text-left p-3 rounded-lg border border-border hover:border-accent/50 hover:bg-accent/5 transition-colors text-sm"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-card/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">Everything You Need to Build</h2>
            <p className="text-muted-foreground text-lg">
              From idea to production in minutes, not months
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-border/50 bg-card/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="h-12 w-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">How AGISOL Works</h2>
            <p className="text-muted-foreground text-lg">
              Three simple steps to your dream application
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="font-semibold mb-2">Describe Your Idea</h3>
              <p className="text-muted-foreground text-sm">
                Tell AGISOL what you want to build in natural language
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="font-semibold mb-2">AI Builds Your App</h3>
              <p className="text-muted-foreground text-sm">
                Watch as AI creates your complete application with all features
              </p>
            </div>

            <div className="text-center">
              <div className="h-16 w-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="font-semibold mb-2">Deploy & Share</h3>
              <p className="text-muted-foreground text-sm">
                One-click deployment to production with your custom domain
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-accent/5">
        <div className="container mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Something Amazing?</h2>
          <p className="text-muted-foreground text-lg mb-8">
            Join thousands of developers who are building faster with AI
          </p>
          
          {user ? (
            <Button onClick={() => navigate('/dashboard')} size="lg" className="bg-accent hover:bg-accent/90">
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleLogin} size="lg" className="bg-accent hover:bg-accent/90">
              Get Started Free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="h-6 w-6 bg-accent rounded flex items-center justify-center">
                  <span className="text-white font-bold text-xs">A</span>
                </div>
                <span className="font-bold">AGISOL</span>
              </div>
              <p className="text-muted-foreground text-sm">
                AI-powered development platform for building production-ready applications.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Features</a></li>
                <li><a href="#" className="hover:text-foreground">Pricing</a></li>
                <li><a href="#" className="hover:text-foreground">Templates</a></li>
                <li><a href="#" className="hover:text-foreground">Examples</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentation</a></li>
                <li><a href="#" className="hover:text-foreground">Tutorials</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Community</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">About</a></li>
                <li><a href="#" className="hover:text-foreground">Contact</a></li>
                <li><a href="#" className="hover:text-foreground">Privacy</a></li>
                <li><a href="#" className="hover:text-foreground">Terms</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 AGISOL. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}