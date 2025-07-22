import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Settings, User, LogOut, CreditCard, HelpCircle, ExternalLink, Database, DollarSign } from 'lucide-react'
import { blink } from '@/blink/client'
import type { User as UserType } from '@/types'

interface HeaderProps {
  currentProject?: {
    id: string
    name: string
    isRunning?: boolean
  }
  onPublish?: () => void
  onConnectSupabase?: () => void
  onConnectStripe?: () => void
  isPublishing?: boolean
}

export function Header({ currentProject, onPublish, onConnectSupabase, onConnectStripe, isPublishing }: HeaderProps) {
  const [user, setUser] = useState<UserType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user)
      setLoading(state.isLoading)
    })
    return unsubscribe
  }, [])

  const handleLogout = () => {
    blink.auth.logout()
  }

  if (loading) {
    return (
      <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="flex h-full items-center justify-between px-4">
          <div className="flex items-center space-x-4">
            <div className="h-8 w-24 bg-muted animate-pulse rounded" />
          </div>
          <div className="h-8 w-8 bg-muted animate-pulse rounded-full" />
        </div>
      </header>
    )
  }

  return (
    <header className="h-14 border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="font-semibold text-lg">AGISOL</span>
          </div>
          
          {currentProject && (
            <>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{currentProject.name}</span>
                {currentProject.isRunning && (
                  <Badge variant="secondary" className="h-5 text-xs">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1" />
                    Running
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {currentProject && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onConnectSupabase}
                className="h-8"
              >
                <Database className="w-3 h-3 mr-1" />
                Supabase
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onConnectStripe}
                className="h-8"
              >
                <DollarSign className="w-3 h-3 mr-1" />
                Stripe
              </Button>
              
              <Button
                onClick={onPublish}
                disabled={isPublishing}
                size="sm"
                className="h-8 bg-accent hover:bg-accent/90"
              >
                {isPublishing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-1" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <ExternalLink className="w-3 h-3 mr-1" />
                    Publish
                  </>
                )}
              </Button>
            </>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.displayName || user?.email} />
                  <AvatarFallback className="bg-accent text-white">
                    {user?.displayName?.[0] || user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  {user?.displayName && (
                    <p className="font-medium">{user.displayName}</p>
                  )}
                  <p className="w-[200px] truncate text-sm text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Billing</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Help</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}