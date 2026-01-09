'use client'

import { useEffect, useState, useCallback } from 'react'
import { useWebView } from '@/contexts/WebViewContext'
import { AlertCircle, WifiOff, RefreshCcw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ErrorState {
  type: 'network' | 'server' | 'auth' | null
  message: string
}

export function WebViewErrorHandler() {
  const router = useRouter()
  const { isWebView, isOnline, sendToNativeApp } = useWebView()
  const [error, setError] = useState<ErrorState>({ type: null, message: '' })
  const [showDialog, setShowDialog] = useState(false)

  const handleError = useCallback((event: CustomEvent) => {
    const { type, message, status } = event.detail || {}
    
    if (type === 'network') {
      setError({
        type: 'network',
        message: message || 'Unable to connect to the server. Please check your internet connection.',
      })
      setShowDialog(true)
      
      if (isWebView) {
        sendToNativeApp('NETWORK_ERROR', { message })
      }
    } else if (type === 'server') {
      setError({
        type: 'server',
        message: message || 'Something went wrong on our end. Please try again later.',
      })
      setShowDialog(true)
      
      if (isWebView) {
        sendToNativeApp('SERVER_ERROR', { message, status })
      }
    }
  }, [isWebView, sendToNativeApp])

  const handleAuthExpired = useCallback(() => {
    setError({
      type: 'auth',
      message: 'Your session has expired. Please log in again.',
    })
    setShowDialog(true)
    
    if (isWebView) {
      sendToNativeApp('AUTH_EXPIRED', {})
    }
  }, [isWebView, sendToNativeApp])

  useEffect(() => {
    // Listen for custom API error events
    const networkHandler = (e: Event) => handleError(e as CustomEvent)
    const serverHandler = (e: Event) => handleError(e as CustomEvent)
    const authHandler = () => handleAuthExpired()

    window.addEventListener('api-network-error', networkHandler)
    window.addEventListener('api-server-error', serverHandler)
    window.addEventListener('auth-token-expired', authHandler)

    return () => {
      window.removeEventListener('api-network-error', networkHandler)
      window.removeEventListener('api-server-error', serverHandler)
      window.removeEventListener('auth-token-expired', authHandler)
    }
  }, [handleError, handleAuthExpired])

  // Show offline banner when connection is lost
  useEffect(() => {
    if (!isOnline && !showDialog) {
      setError({
        type: 'network',
        message: 'You are currently offline. Some features may not be available.',
      })
      setShowDialog(true)
    }
  }, [isOnline, showDialog])

  const handleRetry = () => {
    setShowDialog(false)
    setError({ type: null, message: '' })
    
    // Soft refresh - refetch current page data
    router.refresh()
  }

  const handleGoHome = () => {
    setShowDialog(false)
    setError({ type: null, message: '' })
    router.push('/dashboard')
  }

  const handleLogin = () => {
    setShowDialog(false)
    setError({ type: null, message: '' })
    router.push('/auth/login')
  }

  const handleDismiss = () => {
    setShowDialog(false)
    setError({ type: null, message: '' })
  }

  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return <WifiOff className="h-12 w-12 text-destructive" />
      case 'server':
        return <AlertCircle className="h-12 w-12 text-warning" />
      case 'auth':
        return <AlertCircle className="h-12 w-12 text-primary" />
      default:
        return <AlertCircle className="h-12 w-12 text-destructive" />
    }
  }

  const getTitle = () => {
    switch (error.type) {
      case 'network':
        return 'Connection Problem'
      case 'server':
        return 'Server Error'
      case 'auth':
        return 'Session Expired'
      default:
        return 'Error'
    }
  }

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4">
            {getIcon()}
          </div>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription className="text-center">
            {error.message}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          {error.type === 'auth' ? (
            <>
              <Button onClick={handleLogin} className="w-full">
                Log In Again
              </Button>
              <Button variant="outline" onClick={handleDismiss} className="w-full">
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button onClick={handleRetry} className="w-full gap-2">
                <RefreshCcw className="h-4 w-4" />
                Try Again
              </Button>
              <Button variant="outline" onClick={handleGoHome} className="w-full gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
              <Button variant="ghost" onClick={handleDismiss} className="w-full">
                Dismiss
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Offline banner component for showing persistent offline status
export function OfflineBanner() {
  const { isOnline } = useWebView()
  
  if (isOnline) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-warning text-warning-foreground text-center py-2 px-4 text-sm">
      <WifiOff className="inline-block h-4 w-4 mr-2" />
      You are offline. Some features may not work.
    </div>
  )
}
