'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { UserTourRegistry } from '@/components/walkthrough'
import { WebViewErrorHandler, OfflineBanner } from '@/components/webview'
import { useEffect, useState } from 'react'
import authService, { type User } from '@/lib/api/services/auth.service'
import walletService, { type Wallet } from '@/lib/api/services/wallet.service'
import { EmailVerificationModal } from '@/components/auth/email-verification-modal'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [showVerificationModal, setShowVerificationModal] = useState(false)

  // Fetch wallet data
  const loadWallet = async () => {
    try {
      const response = await walletService.getWallet()
      if (response.success && response.data) {
        setWallet(response.data)
      }
    } catch (error) {
      console.error('Failed to load wallet:', error)
    }
  }

  useEffect(() => {
    const init = async () => {
      // Check if modal was recently dismissed (within 24 hours)
      const dismissedUntil = localStorage.getItem('email_verification_dismissed_until')
      const isDismissed = dismissedUntil && parseInt(dismissedUntil) > Date.now()

      // Get stored user first
      const storedUser = authService.getUser()
      if (storedUser) {
        setUser(storedUser)
        // Check verification immediately for stored user
        if (!storedUser.email_verified_at && !isDismissed) {
          setShowVerificationModal(true)
        }
      }

      // Fetch fresh user data to get latest verification status
      try {
        const userResponse = await authService.getCurrentUser()
        // API returns { success: true, data: { user: User, ... } }
        const userData = (userResponse.data as any)?.user || userResponse.data

        if (userData) {
          setUser(userData)
          // Update modal visibility based on fresh data
          // Only show if explicitly NOT verified and NOT dismissed
          if (!userData.email_verified_at && !isDismissed) {
            setShowVerificationModal(true)
          } else if (userData.email_verified_at) {
            // If verified, ensure modal is closed and cleanup storage
            setShowVerificationModal(false)
            localStorage.removeItem('email_verification_dismissed_until')
          }
        }
      } catch (err) {
        console.error('Failed to refresh user data', err)
      }

      await loadWallet()
    }

    init()
  }, [])

  const handleModalOpenChange = (open: boolean) => {
    setShowVerificationModal(open)
    if (!open && user && !user.email_verified_at) {
      // If closing while still unverified (clicked "Later"), set sub-24h dismissal
      // or set it for the session. Let's do 24 hours.
      const tomorrow = Date.now() + 24 * 60 * 60 * 1000
      localStorage.setItem('email_verification_dismissed_until', tomorrow.toString())
    }
  }

  // Use default values while loading
  const userName = user?.name || 'User'
  const userEmail = user?.email || ''
  const userBalance = wallet?.available_balance || 0
  const isAdmin = user?.role === 'admin'

  return (
    <div className="min-h-screen bg-muted/30">
      <OfflineBanner />
      <WebViewErrorHandler />
      <UserTourRegistry />
      <EmailVerificationModal
        user={user}
        open={showVerificationModal}
        onOpenChange={handleModalOpenChange}
      />
      <Sidebar userRole="user" isAdmin={isAdmin} />
      <div className="lg:pl-64 transition-all duration-300">
        <Header
          userName={userName}
          userEmail={userEmail}
          userRole="user"
          userBalance={userBalance}
          onRefreshBalance={loadWallet}
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
