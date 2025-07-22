export interface User {
  id: string
  email: string
  displayName?: string
  avatar?: string
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  techStack: 'vite-react' | 'expo-react-native' | 'next-js'
  visibility: 'public' | 'private'
  userId: string
  createdAt: string
  updatedAt: string
  previewUrl?: string
  deployUrl?: string
  isRunning?: boolean
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  projectId: string
  userId: string
  isStreaming?: boolean
}

export interface FileNode {
  name: string
  path: string
  type: 'file' | 'directory'
  children?: FileNode[]
  content?: string
  language?: string
}

export interface DatabaseTable {
  name: string
  columns: DatabaseColumn[]
  rowCount: number
}

export interface DatabaseColumn {
  name: string
  type: string
  nullable: boolean
  primaryKey: boolean
}

export interface Integration {
  id: string
  name: string
  type: 'supabase' | 'stripe' | 'openai' | 'custom'
  isConnected: boolean
  config?: Record<string, any>
}