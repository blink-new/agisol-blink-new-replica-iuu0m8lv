import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable'
import { Header } from '@/components/layout/Header'
import { ChatInterface } from '@/components/chat/ChatInterface'
import { CodeEditor } from '@/components/editor/CodeEditor'
import { PreviewPanel } from '@/components/preview/PreviewPanel'
import { DatabaseManager } from '@/components/database/DatabaseManager'
import { blink } from '@/blink/client'
import type { Project, FileNode } from '@/types'

export function ProjectEditor() {
  const { projectId } = useParams<{ projectId: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [files, setFiles] = useState<FileNode[]>([])
  const [isRunning, setIsRunning] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string>()

  const loadProject = useCallback(async () => {
    try {
      // In real implementation, load from database
      const mockProject: Project = {
        id: projectId!,
        name: 'AGISOL Project',
        description: 'AI-powered development platform',
        techStack: 'vite-react',
        visibility: 'public',
        userId: 'user_123',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isRunning: true,
        previewUrl: `https://${projectId}.preview.agisol.dev`
      }
      setProject(mockProject)
    } catch (error) {
      console.error('Failed to load project:', error)
    }
  }, [projectId])

  const loadFiles = useCallback(async () => {
    // Mock file structure
    const mockFiles: FileNode[] = [
      {
        name: 'src',
        path: 'src',
        type: 'directory',
        children: [
          {
            name: 'App.tsx',
            path: 'src/App.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react'
import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Welcome to AGISOL</h1>
        <p className="text-xl text-gray-300">
          Your AI-powered development platform is ready!
        </p>
      </div>
    </div>
  )
}

export default App`
          },
          {
            name: 'main.tsx',
            path: 'src/main.tsx',
            type: 'file',
            language: 'typescript',
            content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
          },
          {
            name: 'index.css',
            path: 'src/index.css',
            type: 'file',
            language: 'css',
            content: `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}`
          }
        ]
      },
      {
        name: 'package.json',
        path: 'package.json',
        type: 'file',
        language: 'json',
        content: `{
  "name": "agisol-project",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7",
    "@vitejs/plugin-react": "^4.0.3",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.27",
    "tailwindcss": "^3.3.3",
    "typescript": "^5.0.2",
    "vite": "^4.4.5"
  }
}`
      }
    ]
    setFiles(mockFiles)
  }, [])

  useEffect(() => {
    if (projectId) {
      loadProject()
      loadFiles()
      // Set preview URL (in real implementation, this would come from the project)
      setPreviewUrl(`https://${projectId}.preview.agisol.dev`)
      setIsRunning(true)
    }
  }, [projectId, loadProject, loadFiles])

  const handleFileChange = (path: string, content: string) => {
    // In real implementation, save file changes
    console.log('File changed:', path, content)
  }

  const handleRunProject = () => {
    setIsRunning(true)
    // In real implementation, start dev server
    console.log('Starting project...')
  }

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      // In real implementation, deploy project
      await new Promise(resolve => setTimeout(resolve, 2000))
      console.log('Project published!')
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleConnectSupabase = () => {
    console.log('Connect Supabase')
  }

  const handleConnectStripe = () => {
    console.log('Connect Stripe')
  }

  const handleCodeGenerated = (code: string, fileName: string) => {
    console.log('Code generated:', fileName, code)
  }

  const handlePreviewRefresh = () => {
    console.log('Refreshing preview...')
  }

  const handleOpenExternal = () => {
    if (previewUrl) {
      window.open(previewUrl, '_blank')
    }
  }

  if (!project || !projectId) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      <Header
        currentProject={{
          id: project.id,
          name: project.name,
          isRunning
        }}
        onPublish={handlePublish}
        onConnectSupabase={handleConnectSupabase}
        onConnectStripe={handleConnectStripe}
        isPublishing={isPublishing}
      />

      <div className="flex-1 overflow-hidden">
        <ResizablePanelGroup direction="horizontal">
          {/* Chat Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <ChatInterface
              projectId={projectId}
              onCodeGenerated={handleCodeGenerated}
            />
          </ResizablePanel>

          <ResizableHandle />

          {/* Main Content */}
          <ResizablePanel defaultSize={50} minSize={30}>
            <Tabs defaultValue="code" className="h-full flex flex-col">
              <div className="border-b border-border px-4">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="code">Code</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="database">Database</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="code" className="flex-1 mt-0">
                <CodeEditor
                  projectId={projectId}
                  files={files}
                  onFileChange={handleFileChange}
                  onRunProject={handleRunProject}
                  isRunning={isRunning}
                />
              </TabsContent>

              <TabsContent value="preview" className="flex-1 mt-0">
                <PreviewPanel
                  projectId={projectId}
                  previewUrl={previewUrl}
                  isRunning={isRunning}
                  onRefresh={handlePreviewRefresh}
                  onOpenExternal={handleOpenExternal}
                />
              </TabsContent>

              <TabsContent value="database" className="flex-1 mt-0">
                <DatabaseManager projectId={projectId} />
              </TabsContent>
            </Tabs>
          </ResizablePanel>

          <ResizableHandle />

          {/* Tools Panel */}
          <ResizablePanel defaultSize={25} minSize={20} maxSize={40}>
            <div className="h-full bg-card border-l border-border">
              <div className="p-4 border-b border-border">
                <h3 className="font-semibold">Tools</h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="text-sm text-muted-foreground">
                  Additional tools and integrations will appear here.
                </div>
              </div>
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  )
}