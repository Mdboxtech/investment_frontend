'use client'

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { 
  detectWebView, 
  getWebViewInfo, 
  setupNativeMessageListener,
  requestNativeToken,
  postToNativeApp,
  type WebViewInfo 
} from '@/lib/webview'

interface WebViewContextType {
  /**
   * WebView environment information
   */
  webViewInfo: WebViewInfo
  
  /**
   * Whether the app is running in a WebView
   */
  isWebView: boolean
  
  /**
   * Whether the WebView context has been initialized
   */
  isInitialized: boolean
  
  /**
   * Current network status
   */
  isOnline: boolean
  
  /**
   * Send a message to the native app
   */
  sendToNativeApp: (type: string, payload?: any) => void
  
  /**
   * Request authentication token from native app or URL
   */
  requestToken: () => Promise<string | null>
  
  /**
   * Notify native app of navigation
   */
  notifyNavigation: (path: string) => void
  
  /**
   * Notify native app of authentication state change
   */
  notifyAuthChange: (isAuthenticated: boolean, user?: any) => void
  
  /**
   * Show native loading indicator
   */
  showNativeLoading: (show: boolean) => void
  
  /**
   * Show native error/alert
   */
  showNativeAlert: (title: string, message: string) => void
}

const WebViewContext = createContext<WebViewContextType | undefined>(undefined)

interface WebViewProviderProps {
  children: ReactNode
  onNativeMessage?: (message: { type: string; payload?: any }) => void
}

export function WebViewProvider({ children, onNativeMessage }: WebViewProviderProps) {
  const [webViewInfo, setWebViewInfo] = useState<WebViewInfo>({
    isWebView: false,
    isAndroidWebView: false,
    isIOSWebView: false,
    source: 'unknown',
    userAgent: '',
  })
  const [isInitialized, setIsInitialized] = useState(false)
  const [isOnline, setIsOnline] = useState(true)

  // Initialize WebView detection
  useEffect(() => {
    const info = detectWebView()
    setWebViewInfo(info)
    setIsInitialized(true)

    // Log WebView detection for debugging
    if (info.isWebView) {
      console.log('[WebView] Detected WebView environment:', info.source)
    }
  }, [])

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      postToNativeApp({ type: 'NETWORK_STATUS', payload: { online: true } })
    }

    const handleOffline = () => {
      setIsOnline(false)
      postToNativeApp({ type: 'NETWORK_STATUS', payload: { online: false } })
    }

    // Set initial state
    setIsOnline(navigator.onLine)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Set up native message listener
  useEffect(() => {
    if (!webViewInfo.isWebView) return

    const cleanup = setupNativeMessageListener((message) => {
      console.log('[WebView] Received native message:', message.type)
      
      // Handle common message types
      switch (message.type) {
        case 'SET_TOKEN':
          // Native app is providing auth token
          if (message.payload?.token) {
            localStorage.setItem('auth_token', message.payload.token)
            if (message.payload?.user) {
              localStorage.setItem('auth_user', JSON.stringify(message.payload.user))
            }
            // Trigger page refresh to apply new auth state
            window.dispatchEvent(new CustomEvent('auth-token-updated'))
          }
          break
          
        case 'LOGOUT':
          // Native app is requesting logout
          localStorage.removeItem('auth_token')
          localStorage.removeItem('auth_user')
          window.dispatchEvent(new CustomEvent('auth-logout-requested'))
          break
          
        case 'NAVIGATE':
          // Native app is requesting navigation
          if (message.payload?.path) {
            window.location.href = message.payload.path
          }
          break
          
        case 'REFRESH':
          // Native app is requesting data refresh
          window.dispatchEvent(new CustomEvent('webview-refresh-requested'))
          break
      }
      
      // Forward to custom handler if provided
      onNativeMessage?.(message)
    })

    return cleanup
  }, [webViewInfo.isWebView, onNativeMessage])

  // Send message to native app
  const sendToNativeApp = useCallback((type: string, payload?: any) => {
    postToNativeApp({ type, payload })
  }, [])

  // Request token from native app or URL
  const requestToken = useCallback(async () => {
    return requestNativeToken()
  }, [])

  // Notify native app of navigation
  const notifyNavigation = useCallback((path: string) => {
    if (webViewInfo.isWebView) {
      postToNativeApp({ type: 'NAVIGATION', payload: { path } })
    }
  }, [webViewInfo.isWebView])

  // Notify native app of auth state change
  const notifyAuthChange = useCallback((isAuthenticated: boolean, user?: any) => {
    if (webViewInfo.isWebView) {
      postToNativeApp({ 
        type: 'AUTH_STATE_CHANGE', 
        payload: { isAuthenticated, user } 
      })
    }
  }, [webViewInfo.isWebView])

  // Show native loading indicator
  const showNativeLoading = useCallback((show: boolean) => {
    if (webViewInfo.isWebView) {
      postToNativeApp({ type: 'SHOW_LOADING', payload: { show } })
    }
  }, [webViewInfo.isWebView])

  // Show native alert
  const showNativeAlert = useCallback((title: string, message: string) => {
    if (webViewInfo.isWebView) {
      postToNativeApp({ type: 'SHOW_ALERT', payload: { title, message } })
    } else {
      // Fallback to browser alert
      alert(`${title}\n\n${message}`)
    }
  }, [webViewInfo.isWebView])

  const value: WebViewContextType = {
    webViewInfo,
    isWebView: webViewInfo.isWebView,
    isInitialized,
    isOnline,
    sendToNativeApp,
    requestToken,
    notifyNavigation,
    notifyAuthChange,
    showNativeLoading,
    showNativeAlert,
  }

  return (
    <WebViewContext.Provider value={value}>
      {children}
    </WebViewContext.Provider>
  )
}

/**
 * Hook to access WebView context
 */
export function useWebView() {
  const context = useContext(WebViewContext)
  if (context === undefined) {
    throw new Error('useWebView must be used within a WebViewProvider')
  }
  return context
}

/**
 * Hook to check if running in WebView (safe to use outside provider)
 */
export function useIsWebView(): boolean {
  const [isWebView, setIsWebView] = useState(false)
  
  useEffect(() => {
    setIsWebView(getWebViewInfo().isWebView)
  }, [])
  
  return isWebView
}

export default WebViewContext
