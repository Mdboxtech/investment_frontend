"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  History,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PieChart,
  Users,
  DollarSign,
  FileText,
  Shield,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

interface SidebarProps {
  userRole: 'user' | 'admin'
  isAdmin?: boolean
}

const userNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    tourId: 'nav-dashboard',
  },
  {
    title: 'My Wallet',
    href: '/dashboard/wallet',
    icon: Wallet,
    tourId: 'nav-wallet',
  },
  {
    title: 'My Investments',
    href: '/dashboard/investments',
    icon: PieChart,
    tourId: 'nav-investments',
  },
  {
    title: 'Buy Shares',
    href: '/dashboard/shares',
    icon: TrendingUp,
    tourId: 'nav-shares',
  },
  {
    title: 'Profit History',
    href: '/dashboard/profits',
    icon: DollarSign,
    tourId: 'nav-profits',
  },
  {
    title: 'Transactions',
    href: '/dashboard/transactions',
    icon: History,
    tourId: 'nav-transactions',
  },
]

const adminNavItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
    tourId: 'nav-overview',
  },
  {
    title: 'Investment Pool',
    href: '/admin/pool',
    icon: DollarSign,
    tourId: 'nav-pool',
  },
  {
    title: 'Manage Shares',
    href: '/admin/shares',
    icon: PieChart,
    tourId: 'nav-shares',
  },
  {
    title: 'Profit Management',
    href: '/admin/profits',
    icon: TrendingUp,
    tourId: 'nav-profits',
  },
  {
    title: 'Investors',
    href: '/admin/investors',
    icon: Users,
    tourId: 'nav-investors',
  },
  {
    title: 'Reports',
    href: '/admin/reports',
    icon: FileText,
    tourId: 'nav-reports',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
    icon: Settings,
    tourId: 'nav-settings',
  },
]

import { useSettings } from '@/contexts/SettingsContext'

export function Sidebar({ userRole, isAdmin = false }: SidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const navItems = userRole === 'admin' ? adminNavItems : userNavItems
  const { settings } = useSettings()

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {(!collapsed || isMobile) && (
          <Link href={userRole === 'admin' ? '/admin' : '/dashboard'} className="flex items-center gap-2">
            {settings.platform_logo ? (
              <img src={settings.platform_logo} alt="Logo" className="h-8 w-8 object-contain" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <span className="font-bold text-lg truncate max-w-[140px]">{settings.platform_name || 'StockInvest'}</span>
          </Link>
        )}
        {!isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(collapsed && 'mx-auto', 'hidden lg:flex')}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      {/* Role Badge */}
      {(!collapsed || isMobile) && (
        <div className="px-4 py-3">
          <div className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm',
            userRole === 'admin' ? 'bg-primary/10 text-primary' : 'bg-success/10 text-success'
          )}>
            <Shield className="h-4 w-4" />
            <span className="font-medium capitalize">{userRole} Portal</span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav data-tour="sidebar-nav" className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              data-tour={item.tourId}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                !isMobile && collapsed && 'justify-center px-2'
              )}
              title={!isMobile && collapsed ? item.title : undefined}
            >
              <item.icon className={cn('h-5 w-5', !isMobile && collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
              {(isMobile || !collapsed) && <span>{item.title}</span>}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t p-2">
        <Separator className="mb-2" />
        {(isMobile || !collapsed) && userRole === 'user' && isAdmin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Shield className="h-4 w-4" />
            <span>Admin Portal</span>
          </Link>
        )}
        {(isMobile || !collapsed) && userRole === 'admin' && (
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            <Users className="h-4 w-4" />
            <span>User Portal</span>
          </Link>
        )}
        <button
          onClick={async (e) => {
            e.preventDefault()
            const { useRouter } = require('next/navigation')
            const authService = require('@/lib/api/services/auth.service').default
            try {
              await authService.logout()
            } catch (error) {
              console.error('Logout error:', error)
            } finally {
              window.location.href = '/'
            }
          }}
          className={cn(
            'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors',
            !isMobile && collapsed && 'justify-center px-2'
          )}
          title={!isMobile && collapsed ? 'Logout' : undefined}
        >
          <LogOut className={cn('h-5 w-5', !isMobile && collapsed ? 'h-5 w-5' : 'h-4 w-4')} />
          {(isMobile || !collapsed) && <span>Logout</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile Menu Button - rendered in header area */}
      <div className="lg:hidden fixed top-0 left-0 z-50 h-16 flex items-center px-4">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-72">
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 h-screen bg-card border-r transition-all duration-300 hidden lg:block',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        <SidebarContent />
      </aside>
    </>
  )
}
