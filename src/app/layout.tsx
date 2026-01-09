import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { WalkthroughProvider, WalkthroughOverlay } from '@/components/walkthrough'
import { AuthProvider } from '@/contexts/AuthContext'
import { SettingsProvider } from '@/contexts/SettingsContext'
import { WebViewProvider } from '@/contexts/WebViewContext'
import ThemeLoader from '@/components/theme-loader'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StockInvest - Company Share Investment Platform',
  description: 'Invest in company shares, track performance, and earn profits through transparent investment management.',
  manifest: '/manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'StockInvest',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/apple-touch-icon.png',
  },
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
