"use client"

import { Bell, Search, Settings, User, Wallet, TrendingUp, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { TourButton } from '@/components/walkthrough'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getNotifications, getUnreadCount, markAsRead } from '@/lib/api/services/notification.service'

interface HeaderProps {
  userName: string
  userEmail: string
  userRole: 'user' | 'admin'
  userBalance?: number
  onRefreshBalance?: () => Promise<void>
}

import { useSettings } from '@/contexts/SettingsContext'

export function Header({ userName, userEmail, userRole, userBalance = 0, onRefreshBalance }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [refreshingBalance, setRefreshingBalance] = useState(false)
  const router = useRouter()
  const { settings } = useSettings()

  const initials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  const fetchNotifications = useCallback(async () => {
    try {
      setLoadingNotifications(true)
      const [notificationsData, countData] = await Promise.all([
        getNotifications(1, 5),
        getUnreadCount()
      ])
      setNotifications(notificationsData.data?.data || [])
      setUnreadCount(countData.data?.unread_count || 0)
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [])

  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Navigate to shares page with search query
      const basePath = userRole === 'admin' ? '/admin' : '/dashboard'
      router.push(`${basePath}/shares?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }, [searchQuery, userRole, router])

  const handleNotificationClick = useCallback(async (notificationId: number) => {
    try {
      await markAsRead(notificationId)
      await fetchNotifications()
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }, [fetchNotifications])

  const handleRefreshBalance = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onRefreshBalance && !refreshingBalance) {
      setRefreshingBalance(true)
      try {
        await onRefreshBalance()
      } finally {
        setRefreshingBalance(false)
      }
    }
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {/* Spacer for mobile menu button */}
      <div className="lg:hidden w-10" />

      {/* Search */}
      <div className="hidden md:flex flex-1 items-center gap-4 md:gap-8">
        <form onSubmit={handleSearch} className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search investments, shares..."
            className="pl-9 bg-muted/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      {/* Mobile: Show logo in center */}
      <div className="flex-1 lg:hidden flex justify-center">
        <Link href={userRole === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
          {settings.platform_logo ? (
            <img src={settings.platform_logo} alt="Logo" className="h-8 w-8 object-contain" />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
          )}
          <span className="font-bold text-lg hidden sm:inline truncate max-w-[150px]">{settings.platform_name || 'StockInvest'}</span>
        </Link>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Wallet Balance - Only for users */}
        {userRole === 'user' && (
          <div className="flex items-center gap-2">
            <Link href="/dashboard/wallet">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-success/10 border border-success/20 hover:bg-success/20 transition-colors cursor-pointer" data-tour="wallet-balance">
                <Wallet className="h-4 w-4 text-success" />
                <div className="flex flex-col">
                  <span className="text-[10px] text-muted-foreground leading-tight">Balance</span>
                  <span className="text-sm font-semibold text-success leading-tight">{formatCurrency(userBalance)}</span>
                </div>
              </div>
            </Link>
            {onRefreshBalance && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-primary"
                onClick={handleRefreshBalance}
                disabled={refreshingBalance}
                title="Refresh Balance"
              >
                <RefreshCw className={`h-4 w-4 ${refreshingBalance ? 'animate-spin' : ''}`} />
              </Button>
            )}
          </div>
        )}

        {/* Help & Tour Button */}
        <TourButton role={userRole} />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px]">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {loadingNotifications ? (
              <DropdownMenuItem className="text-center py-3">
                <span className="text-sm text-muted-foreground">Loading notifications...</span>
              </DropdownMenuItem>
            ) : notifications.length === 0 ? (
              <DropdownMenuItem className="text-center py-3">
                <span className="text-sm text-muted-foreground">No notifications</span>
              </DropdownMenuItem>
            ) : (
              <>
                {notifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start gap-1 py-3 cursor-pointer"
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <span className="font-medium">{notification.title}</span>
                    <span className="text-sm text-muted-foreground">
                      {notification.message}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-center text-primary cursor-pointer"
              onClick={() => router.push(userRole === 'admin' ? '/admin/notifications' : '/dashboard/notifications')}
            >
              View all notifications
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" alt={userName} />
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{userName}</span>
                <span className="text-xs text-muted-foreground capitalize">{userRole}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{userName}</p>
                <p className="text-xs text-muted-foreground">{userEmail}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={userRole === 'admin' ? '/admin/settings' : '/dashboard/settings'}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={userRole === 'admin' ? '/admin/settings' : '/dashboard/settings'}>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onSelect={async (e) => {
                e.preventDefault()
                const authService = require('@/lib/api/services/auth.service').default
                try {
                  await authService.logout()
                } catch (error) {
                  console.error('Logout error:', error)
                } finally {
                  window.location.href = '/'
                }
              }}
            >
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
