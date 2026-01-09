'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import dashboardService from '@/lib/api/services/dashboard.service'
import investmentService, { type Share } from '@/lib/api/services/investment.service'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import {
  DollarSign,
  PieChart,
  Users,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Loader2
} from 'lucide-react'

interface PoolData {
  totalInvested: number
  availableBalance: number
  totalProfit: number
  totalShares: number
  activeInvestors: number
}

export default function PoolPage() {
  const [pool, setPool] = useState<PoolData | null>(null)
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadPoolData()
  }, [])

  const loadPoolData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [overviewData, sharesResponse] = await Promise.all([
        dashboardService.getDashboardOverview(),
        investmentService.getShares(1, 20),
      ])

      // Extract pool data from overview
      // Backend returns: { success, message, data: { investments: {...}, wallets: {...}, ... } }
      const responseWrapper: any = overviewData
      const overview: any = responseWrapper.data || responseWrapper

      setPool({
        totalInvested: overview.investments?.total_invested_amount || 0,
        availableBalance: overview.wallets?.total_balance || 0,
        totalProfit: overview.profits?.total_distributed || 0,
        totalShares: overview.shares?.total_shares_sold || 0,
        activeInvestors: overview.users?.active_investors || overview.users?.active_users || 0,
      })

      // Extract shares from response
      const sharesData = (sharesResponse.data as any)?.shares || []
      setShares(Array.isArray(sharesData) ? sharesData : [])
    } catch (err: any) {
      console.error('Failed to load pool data:', err)
      setError(err.response?.data?.message || 'Failed to load pool data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading pool data...</p>
        </div>
      </div>
    )
  }

  // Calculate utilization rate - capped at 0-100%
  // Note: If available balance > total invested, utilization is 0% (all funds available)
  const inUse = Math.max(0, (pool?.totalInvested || 0) - (pool?.availableBalance || 0))
  const utilizationRate = pool && pool.totalInvested > 0
    ? Math.min(100, Math.max(0, (inUse / pool.totalInvested) * 100))
    : 0

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={loadPoolData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Investment Pool</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage and monitor the investment pool
        </p>
      </div>

      {/* Pool Overview Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4" data-tour="pool-overview">
        <Card data-tour="pool-total-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Pool</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{formatCurrency(pool?.totalInvested || 0)}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  From {formatNumber(pool?.activeInvestors || 0)} investors
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-tour="pool-available-card">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Available Balance</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{formatCurrency(pool?.availableBalance || 0)}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  For business operations
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Profit</p>
                <p className="text-lg md:text-2xl font-bold mt-1 text-success">{formatCurrency(pool?.totalProfit || 0)}</p>
                <p className="text-xs md:text-sm text-success mt-1 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  All-time distributed
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Shares Sold</p>
                <p className="text-lg md:text-2xl font-bold mt-1">{formatNumber(pool?.totalShares || 0)}</p>
                <p className="text-xs md:text-sm text-muted-foreground mt-1">
                  Across all funds
                </p>
              </div>
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PieChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pool Utilization */}
      <Card data-tour="pool-utilization">
        <CardHeader>
          <CardTitle>Pool Utilization</CardTitle>
          <CardDescription>How the investment pool is being utilized</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Capital Utilization Rate</span>
              <span className="text-sm font-medium">{utilizationRate.toFixed(1)}%</span>
            </div>
            <Progress value={utilizationRate} className="h-3" />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">In Use</span>
              </div>
              <p className="text-xl font-bold">
                {formatCurrency(inUse)}
              </p>
              <p className="text-sm text-muted-foreground">
                {utilizationRate.toFixed(1)}% of pool
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-success" />
                <span className="text-sm text-muted-foreground">Available</span>
              </div>
              <p className="text-xl font-bold">{formatCurrency(pool?.availableBalance || 0)}</p>
              <p className="text-sm text-muted-foreground">
                {(100 - utilizationRate).toFixed(1)}% of pool
              </p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-warning" />
                <span className="text-sm text-muted-foreground">Profit Generated</span>
              </div>
              <p className="text-xl font-bold text-success">{formatCurrency(pool?.totalProfit || 0)}</p>
              <p className="text-sm text-muted-foreground">
                {pool && pool.totalInvested > 0
                  ? ((pool.totalProfit / pool.totalInvested) * 100).toFixed(1)
                  : 0}% return
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fund Breakdown */}
      <Card data-tour="pool-breakdown">
        <CardHeader>
          <CardTitle>Fund Breakdown</CardTitle>
          <CardDescription>Investment allocation across different funds</CardDescription>
        </CardHeader>
        <CardContent>
          {shares.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No shares available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {shares.map((share) => {
                const soldShares = share.sold_shares || 0
                const totalShares = share.total_shares || 1
                const soldPercentage = (soldShares / totalShares) * 100
                const pricePerShare = parseFloat(share.price_per_share || '0')
                const fundValue = soldShares * pricePerShare

                return (
                  <div key={share.id} className="p-4 rounded-lg border">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="font-semibold">{share.name}</h4>
                        <p className="text-sm text-muted-foreground">{share.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatCurrency(fundValue)}</p>
                        <p className="text-sm text-muted-foreground">Total value</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Price/Share</p>
                        <p className="font-medium">{formatCurrency(pricePerShare)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Shares</p>
                        <p className="font-medium">{formatNumber(totalShares)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Sold</p>
                        <p className="font-medium">{formatNumber(soldShares)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Available</p>
                        <p className="font-medium">{formatNumber(share.available_shares || 0)}</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Sold</span>
                        <span>{soldPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={soldPercentage} className="h-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
