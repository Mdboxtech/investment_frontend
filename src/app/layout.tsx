import { Inter } from 'next/font/google'
import './globals.css'
import { WalkthroughProvider, WalkthroughOverlay } from '@/components/walkthrough'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { WebViewProvider } from '@/contexts/WebViewContext'
import ThemeLoader from '@/components/theme-loader'
import { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ['latin'] })

// Helper function to fetch settings server-side using native fetch
async function fetchPublicSettings() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
    const response = await fetch(`${apiUrl}/v1/settings/public`, {
      next: { revalidate: 60 }, // Cache for 60 seconds
    })
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        return data.data as Record<string, any>
      }
    }
  } catch (error) {
    console.error('Failed to fetch settings:', error)
  }
  return null
}

export async function generateMetadata(): Promise<Metadata> {
  let title = 'StockInvest - Company Share Investment Platform'
  let description = 'Invest in company shares, track performance, and earn profits through transparent investment management.'
  let appName = 'StockInvest'

  const settings = await fetchPublicSettings()
  if (settings) {
    if (settings.platform_name) {
      appName = settings.platform_name
      title = `${settings.platform_name} - ${settings.platform_tagline || 'Investment Platform'}`
    }
    if (settings.platform_tagline) {
      description = settings.platform_tagline
    }
  }

  return {
    title,
    description,
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: appName,
    },
    icons: {
      icon: '/icons/icon-192x192.png',
      apple: '/apple-touch-icon.png',
    },
  }
}

export async function generateViewport(): Promise<Viewport> {
  let themeColor = '#3b82f6' // Default Blue

  const settings = await fetchPublicSettings()
  if (settings && settings.primary_color) {
    themeColor = settings.primary_color
  }

  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: themeColor,
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <WebViewProvider>
          <SettingsProvider>
            <ThemeLoader>
              <AuthProvider>
                <WalkthroughProvider>
                  {children}
                  <WalkthroughOverlay />
                </WalkthroughProvider>
              </AuthProvider>
            </ThemeLoader>
          </SettingsProvider>
        </WebViewProvider>
      </body>
    </html>
  )
}
