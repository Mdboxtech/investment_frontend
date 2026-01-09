/**
 * WebView Detection and Utility Functions
 * 
 * This module provides utilities for detecting WebView environments
 * and handling WebView-specific behaviors in the application.
 */

export interface WebViewInfo {
  isWebView: boolean
  isAndroidWebView: boolean
  isIOSWebView: boolean
  source: 'android' | 'ios' | 'web' | 'unknown'
  userAgent: string
}

/**
 * Detect if the app is running in a WebView
 * Checks both User-Agent patterns and URL query parameters
 */
export function detectWebView(): WebViewInfo {
  if (typeof window === 'undefined') {
    return {
      isWebView: false,
      isAndroidWebView: false,
      isIOSWebView: false,
      source: 'unknown',
      userAgent: '',
    }
  }

  const userAgent = navigator.userAgent || ''
  const urlParams = new URLSearchParams(window.location.search)
  
  // Check for explicit source parameter (from mobile app)
  const sourceParam = urlParams.get('source')
  if (sourceParam === 'app' || sourceParam === 'android' || sourceParam === 'ios') {
    // Store in sessionStorage for persistence across navigations
    sessionStorage.setItem('webview_source', sourceParam)
  }
  
  // Get stored source
  const storedSource = sessionStorage.getItem('webview_source')

  // Android WebView detection
  // Common patterns: wv, WebView, Android.*wv
  const isAndroidWebView = 
    /wv/.test(userAgent) ||
    /Android.*Version\/[\d.]+.*Chrome\/[\d.]+/.test(userAgent) && !/Chrome\/[\d.]+ Mobile Safari\/[\d.]+$/.test(userAgent) ||
    storedSource === 'android' ||
    storedSource === 'app'

  // iOS WebView detection
  // WKWebView doesn't include "Safari" in UA, UIWebView is deprecated
  const isIOSWebView = 
    /iPhone|iPad|iPod/.test(userAgent) && !/Safari/.test(userAgent) ||
    /iPhone|iPad|iPod.*AppleWebKit(?!.*Safari)/.test(userAgent) ||
    storedSource === 'ios'

  const isWebView = isAndroidWebView || isIOSWebView

  let source: 'android' | 'ios' | 'web' | 'unknown' = 'web'
  if (isAndroidWebView) source = 'android'
  else if (isIOSWebView) source = 'ios'
  else if (storedSource) source = storedSource as any
  
  return {
    isWebView,
    isAndroidWebView,
    isIOSWebView,
    source,
    userAgent,
  }
}

/**
 * Check if running in WebView (cached result)
 */
let cachedWebViewInfo: WebViewInfo | null = null

export function isWebView(): boolean {
  if (typeof window === 'undefined') return false
  
  if (!cachedWebViewInfo) {
    cachedWebViewInfo = detectWebView()
  }
  return cachedWebViewInfo.isWebView
}

export function getWebViewInfo(): WebViewInfo {
  if (!cachedWebViewInfo) {
    cachedWebViewInfo = detectWebView()
  }
  return cachedWebViewInfo
}

/**
 * Clear cached WebView info (useful for testing)
 */
export function clearWebViewCache(): void {
  cachedWebViewInfo = null
}

/**
 * Safe navigation that works in both browser and WebView
 * Avoids window.location.href hard redirects when possible
 */
export function safeNavigate(url: string, router?: { push: (url: string) => void }): void {
  if (router) {
    router.push(url)
  } else if (typeof window !== 'undefined') {
    // Use replaceState + pushState for soft navigation when possible
    window.location.href = url
  }
}

/**
 * Safe external link opener for WebView
 * In WebView, we redirect in the same window instead of opening popups
 */
export function openExternalUrl(url: string, options?: { 
  target?: '_blank' | '_self',
  returnUrl?: string 
}): void {
  if (typeof window === 'undefined') return

  const webViewInfo = getWebViewInfo()
  
  if (webViewInfo.isWebView) {
    // In WebView, always open in same window to avoid popup issues
    // Store return URL for callback handling
    if (options?.returnUrl) {
      sessionStorage.setItem('external_return_url', options.returnUrl)
    }
    window.location.href = url
  } else {
    // In regular browser, respect the target option
    if (options?.target === '_blank') {
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      window.location.href = url
    }
  }
}

/**
 * Get the return URL after external redirect (e.g., payment callback)
 */
export function getReturnUrl(): string | null {
  if (typeof window === 'undefined') return null
  return sessionStorage.getItem('external_return_url')
}

/**
 * Clear the return URL
 */
export function clearReturnUrl(): void {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('external_return_url')
  }
}

/**
 * Post message to native WebView container
 * Used for communication between web app and native mobile app
 */
export function postToNativeApp(message: {
  type: string
  payload?: any
}): void {
  if (typeof window === 'undefined') return

  const webViewInfo = getWebViewInfo()
  
  if (webViewInfo.isAndroidWebView) {
    // Android WebView uses JavascriptInterface
    const androidInterface = (window as any).AndroidInterface
    if (androidInterface?.postMessage) {
      androidInterface.postMessage(JSON.stringify(message))
    }
  } else if (webViewInfo.isIOSWebView) {
    // iOS WKWebView uses webkit.messageHandlers
    const webkit = (window as any).webkit
    if (webkit?.messageHandlers?.nativeApp?.postMessage) {
      webkit.messageHandlers.nativeApp.postMessage(message)
    }
  }
}

/**
 * Request token from native app (for deep link authentication)
 */
export function requestNativeToken(): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null)
      return
    }

    // Check URL for token parameter (from deep link)
    const urlParams = new URLSearchParams(window.location.search)
    const tokenFromUrl = urlParams.get('token')
    if (tokenFromUrl) {
      resolve(tokenFromUrl)
      return
    }

    // Check for token in sessionStorage (may be set by native app)
    const storedToken = sessionStorage.getItem('native_auth_token')
    if (storedToken) {
      sessionStorage.removeItem('native_auth_token')
      resolve(storedToken)
      return
    }

    // No token found
    resolve(null)
  })
}

/**
 * Set up listener for messages from native app
 */
export function setupNativeMessageListener(
  callback: (message: { type: string; payload?: any }) => void
): () => void {
  if (typeof window === 'undefined') return () => {}

  const handler = (event: MessageEvent) => {
    try {
      const message = typeof event.data === 'string' 
        ? JSON.parse(event.data) 
        : event.data
      
      if (message && typeof message.type === 'string') {
        callback(message)
      }
    } catch (e) {
      // Ignore invalid messages
    }
  }

  window.addEventListener('message', handler)
  
  // Also expose a global function for native apps to call directly
  ;(window as any).receiveNativeMessage = callback

  return () => {
    window.removeEventListener('message', handler)
    delete (window as any).receiveNativeMessage
  }
}

/**
 * Check if a feature is available in the current environment
 */
export function isFeatureAvailable(feature: 'popup' | 'cookies' | 'localStorage' | 'sessionStorage'): boolean {
  if (typeof window === 'undefined') return false

  const webViewInfo = getWebViewInfo()

  switch (feature) {
    case 'popup':
      // Popups often don't work well in WebView
      return !webViewInfo.isWebView
    
    case 'cookies':
      // Cookies may be restricted in WebView
      try {
        document.cookie = 'test=1'
        const hasCookies = document.cookie.includes('test=1')
        document.cookie = 'test=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
        return hasCookies
      } catch {
        return false
      }
    
    case 'localStorage':
      try {
        localStorage.setItem('test', '1')
        localStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    
    case 'sessionStorage':
      try {
        sessionStorage.setItem('test', '1')
        sessionStorage.removeItem('test')
        return true
      } catch {
        return false
      }
    
    default:
      return true
  }
}

/**
 * Get appropriate callback URL for payment redirects
 */
export function getPaymentCallbackUrl(baseUrl: string, reference: string): string {
  const webViewInfo = getWebViewInfo()
  const url = new URL(baseUrl)
  
  url.searchParams.set('reference', reference)
  
  if (webViewInfo.isWebView) {
    url.searchParams.set('source', webViewInfo.source)
  }
  
  return url.toString()
}

export default {
  detectWebView,
  isWebView,
  getWebViewInfo,
  clearWebViewCache,
  safeNavigate,
  openExternalUrl,
  getReturnUrl,
  clearReturnUrl,
  postToNativeApp,
  requestNativeToken,
  setupNativeMessageListener,
  isFeatureAvailable,
  getPaymentCallbackUrl,
}
