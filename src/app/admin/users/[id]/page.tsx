"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  Wallet,
  DollarSign,
  Activity,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react'
import userService from '@/lib/api/services/user.service'
import { formatCurrency } from '@/lib/utils'
import { useSettings } from '@/contexts/SettingsContext'

// Skeleton component for loading state
function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-muted rounded ${className}`} />
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string
  const { loading: themeLoading, settings } = useSettings()

  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true)
        setError('')

        // Fetch user with their details - the backend should return user with investments/wallet data
        const userResponse = await userService.getUser(parseInt(userId))
        setUser(userResponse.data)
      } catch (err: any) {
        console.error('Failed to fetch user:', err)
        setError(err.response?.data?.message || err.message || 'Failed to load user data')
      } finally {
        setLoading(false)
      }
    }

    if (userId) {
      fetchUserData()
    }
  }, [userId])

  // Don't render anything until theme is loaded - prevents flash of unstyled content
  if (themeLoading) {
    return null
  }

  // Loading state with skeletons
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Info card skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-1">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive mb-4">{error || 'User not found'}</p>
          <Button onClick={() => router.back()}>
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Extract investment data from user object
  const userInvestments = user.investments || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{user.name}</h1>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
        <Badge variant={user.is_active ? "default" : "destructive"}>
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Wallet Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(user.wallet?.balance || user.wallet_balance || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available: {formatCurrency(user.wallet?.available_balance || user.wallet_available_balance || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(user.total_invested || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {user.total_shares || userInvestments.reduce((sum: number, i: any) => sum + (i.quantity || 0), 0)} shares
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(user.total_profits || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending: {formatCurrency(user.pending_profits || 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {user.total_investments || userInvestments.length || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Active: {user.active_investments || userInvestments.filter((i: any) => i.status === 'active').length || 0}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* User Information */}
      <Card>
        <CardHeader>
          <CardTitle>User Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
            </div>

            {user.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {new Date(user.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {user.email_verified_at ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Email Status</p>
                <p className="font-medium">
                  {user.email_verified_at ? 'Verified' : 'Not Verified'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Investments */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Investments</CardTitle>
        </CardHeader>
        <CardContent>
          {userInvestments.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No investments found
            </p>
          ) : (
            <div className="space-y-4">
              {userInvestments.slice(0, 5).map((investment: any) => (
                <div key={investment.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">{investment.share?.name || 'Unknown Share'}</p>
                    <p className="text-sm text-muted-foreground">
                      {investment.quantity} shares @ {formatCurrency(investment.price_per_share || 0)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(investment.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-bold">{formatCurrency(investment.amount || investment.total_amount || 0)}</p>
                    <Badge
                      variant={
                        investment.status === 'active' ? 'default' :
                          investment.status === 'completed' ? 'secondary' :
                            'destructive'
                      }
                    >
                      {investment.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {userInvestments.length > 5 && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => router.push(`/admin/investments?user_id=${userId}`)}
                >
                  View All Investments
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
