import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Monitor, 
  Smartphone, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react'

interface PreviewPanelProps {
  projectId: string
  previewUrl?: string
  isRunning?: boolean
  onRefresh?: () => void
  onOpenExternal?: () => void
}

export function PreviewPanel({ 
  projectId, 
  previewUrl, 
  isRunning, 
  onRefresh, 
  onOpenExternal 
}: PreviewPanelProps) {
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)

  const handleRefresh = () => {
    setIsLoading(true)
    setLoadError(false)
    onRefresh?.()
    
    // Simulate loading time
    setTimeout(() => {
      setIsLoading(false)
    }, 1000)
  }

  const handleIframeLoad = () => {
    setIsLoading(false)
    setLoadError(false)
  }

  const handleIframeError = () => {
    setIsLoading(false)
    setLoadError(true)
  }

  useEffect(() => {
    if (previewUrl) {
      setIsLoading(true)
      setLoadError(false)
    }
  }, [previewUrl])

  return (
    <div className="flex flex-col h-full bg-card">
      {/* Preview Header */}
      <div className="flex items-center justify-between p-3 border-b border-border">
        <div className="flex items-center space-x-2">
          <h3 className="font-semibold text-sm">Preview</h3>
          {isRunning ? (
            <Badge variant="secondary" className="h-5 text-xs">
              <CheckCircle className="w-3 h-3 mr-1 text-green-500" />
              Running
            </Badge>
          ) : (
            <Badge variant="outline" className="h-5 text-xs">
              <AlertCircle className="w-3 h-3 mr-1 text-yellow-500" />
              Stopped
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-md">
            <Button
              size="sm"
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              onClick={() => setViewMode('desktop')}
              className="h-7 px-2 rounded-r-none"
            >
              <Monitor className="w-3 h-3" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              onClick={() => setViewMode('mobile')}
              className="h-7 px-2 rounded-l-none border-l border-border"
            >
              <Smartphone className="w-3 h-3" />
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isLoading}
            className="h-7"
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <RefreshCw className="w-3 h-3" />
            )}
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={onOpenExternal}
            disabled={!previewUrl}
            className="h-7"
          >
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* URL Bar */}
      {previewUrl && (
        <div className="px-3 py-2 border-b border-border bg-muted/20">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-mono truncate">{previewUrl}</span>
          </div>
        </div>
      )}

      {/* Preview Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        {!previewUrl ? (
          <div className="text-center text-muted-foreground">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">No preview available</p>
            <p className="text-xs">Start your development server to see the preview</p>
          </div>
        ) : loadError ? (
          <div className="text-center text-muted-foreground">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-500 opacity-50" />
            <p className="mb-2">Failed to load preview</p>
            <p className="text-xs mb-4">There might be an issue with your application</p>
            <Button size="sm" onClick={handleRefresh}>
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          </div>
        ) : (
          <div 
            className={`relative bg-white rounded-lg shadow-lg overflow-hidden ${
              viewMode === 'mobile' 
                ? 'w-[375px] h-[667px]' 
                : 'w-full h-full max-w-[1200px] max-h-[800px]'
            }`}
          >
            {isLoading && (
              <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
                <div className="flex items-center space-x-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading preview...</span>
                </div>
              </div>
            )}
            
            <iframe
              src={previewUrl}
              className="w-full h-full border-0"
              title="App Preview"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
            />
          </div>
        )}
      </div>

      {/* Preview Footer */}
      <div className="p-2 border-t border-border bg-muted/10">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>
            {viewMode === 'desktop' ? 'Desktop View' : 'Mobile View (375×667)'}
          </span>
          {previewUrl && (
            <span className="font-mono">
              {projectId}.preview.agisol.dev
            </span>
          )}
        </div>
      </div>
    </div>
  )
}