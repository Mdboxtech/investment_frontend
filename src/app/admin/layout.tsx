'use client'

import { Sidebar } from '@/components/layout/sidebar'
import { Header } from '@/components/layout/header'
import { AdminTourRegistry } from '@/components/walkthrough'
import { useEffect, useState } from 'react'
import authService, { type User } from '@/lib/api/services/auth.service'

import { useRouter } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Get user from localStorage (already authenticated)
    const storedUser = authService.getUser()
    setUser(storedUser)

    if (storedUser && storedUser.role !== 'admin') {
      router.push('/dashboard')
    }
  }, [])

  // Use default values while loading
  const userName = user?.name || 'Admin'
  const userEmail = user?.email || ''

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminTourRegistry />
      <Sidebar userRole="admin" />
      <div className="lg:pl-64 transition-all duration-300">
        <Header
          userName={userName}
          userEmail={userEmail}
          userRole="admin"
        />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
