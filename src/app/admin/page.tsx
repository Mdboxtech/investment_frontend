'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProfitBarChart, CumulativeProfitChart } from '@/components/dashboard/charts'
import {
  DollarSign,
  Users,
  PieChart,
  TrendingUp,
  Wallet,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import dashboardService from '@/lib/api/services/dashboard.service'
import profitService from '@/lib/api/services/profit.service'
import { formatCurrency, formatNumber } from '@/lib/utils'
import Link from 'next/link'

export default function AdminDashboard() {
  const [summary, setSummary] = useState<any>(null)
  const [pool, setPool] = useState<any>(null)
  const [recentProfits, setRecentProfits] = useState<any[]>([])
  const [pendingDistributions, setPendingDistributions] = useState<any[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch dashboard overview and profit summary in parallel
      const [overviewData, profitSummaryData] = await Promise.all([
        dashboardService.getDashboardOverview(),
        profitService.getSummary(),
      ])

      // Backend returns: { success, message, data: { users: {...}, investments: {...}, wallets: {...}, shares: {...}, profits: {...} } }
      // The actual overview data is inside the 'data' property of the response
      const responseWrapper: any = overviewData
      const overview: any = responseWrapper.data || responseWrapper

      // Flatten the nested structure for easier access
      // Note: Use investor-specific counts from backend:
      // - totalInvestors/activeInvestorsCount = users with role='user' only (excludes admins)
      // - activeInvestments = count of active investment records
      const flatSummary = {
        totalInvestedCapital: overview.investments?.total_invested_amount || 0,
        totalInvestors: overview.users?.total_investors || 0, // Total investors (role='user')
        activeInvestorsCount: overview.users?.active_investors || 0, // Active investors only
        activeInvestments: overview.investments?.active_investments || 0, // Count of active investment records
        totalProfitGenerated: overview.profits?.total_distributed || 0,
        availablePoolBalance: overview.wallets?.total_balance || 0,
        totalSharesSold: overview.shares?.total_shares_sold || 0,
        totalProfitDistributed: overview.profits?.total_distributed || 0,
        pendingDistributions: overview.profits?.pending_distribution || 0,
        totalUsers: overview.users?.total_users || 0, // All users including admins
        averageMonthlyRoi: overview.profits?.average_monthly_roi || 0, // Dynamic ROI from backend
      }
      setSummary(flatSummary)

      // Calculate pool data from overview
      const poolData = {
        totalInvested: overview.investments?.total_invested_amount || 0,
        totalProfit: overview.profits?.total_distributed || 0,
        availableBalance: overview.wallets?.total_balance || 0,
        totalShares: overview.shares?.total_shares_sold || 0,
        activeInvestors: overview.users?.active_investors || 0, // Use investor-specific count
      }
      setPool(poolData)

      // Fetch monthly profits for chart and recent list
      const profitsResponse = await profitService.getMonthlyProfits(1, 12)
      // Backend returns { data: { profits: [...], pagination: {...} } }
      const responseData = profitsResponse.data as any
      const profitsData = Array.isArray(responseData?.profits) ? responseData.profits : []

      // Show the 4 most recent profits (any status) in the records list
      setRecentProfits(profitsData.slice(-4).reverse())

      // Transform profits data for charts
      // Only include non-cancelled profits in chart data
      const chartProfits = profitsData.filter((p: any) => p.status !== 'cancelled')

      const formattedChartData = chartProfits.map((profit: any) => {
        // Use title for X-axis (e.g., "Q1 2024 Platform Profits")
        // Or format distribution_date if available, otherwise use a short title
        let label = profit.title || 'Profit'
        // Truncate long titles for chart readability
        if (label.length > 15) {
          label = label.substring(0, 12) + '...'
        }

        // Use distributed_amount for completed profits, total_amount for pending/distributing
        const amount = profit.status === 'completed'
          ? parseFloat(profit.distributed_amount || profit.total_amount || 0)
          : parseFloat(profit.total_amount || 0)

        return {
          month: label,
          profit: amount,
          cumulative: 0, // Will be calculated below
          status: profit.status,
        }
      })

      // Calculate cumulative (only for completed and distributing profits)
      let cumulative = 0
      formattedChartData.forEach((item: any) => {
        if (item.status === 'completed' || item.status === 'distributing') {
          cumulative += item.profit
        }
        item.cumulative = cumulative
      })

      setChartData(formattedChartData)

      // Filter pending distributions from profits data
      const pendingProfits = profitsData.filter((p: any) => p.status === 'pending')
      setPendingDistributions(pendingProfits)

    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Overview of platform performance and investments
          </p>
        </div>
        <Link href="/admin/profits">
          <Button className="gap-2 w-full sm:w-auto">
            <TrendingUp className="h-4 w-4" />
            Record Monthly Profit
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div data-tour="admin-stats-grid" className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Invested Capital"
          value={formatCurrency(summary?.totalInvestedCapital || 0)}
          subtitle={`${formatNumber(summary?.totalSharesSold || 0)} shares sold`}
          icon={DollarSign}
          iconClassName="bg-primary/10"
        />
        <StatCard
          title="Active Investors"
          value={formatNumber(summary?.activeInvestorsCount || 0)}
          subtitle={`${formatNumber(summary?.activeInvestments || 0)} active investments`}
          icon={Users}
          iconClassName="bg-success/10"
        />
        <StatCard
          title="Profit Generated"
          value={formatCurrency(summary?.totalProfitGenerated || 0)}
          subtitle="All-time"
          icon={TrendingUp}
          iconClassName="bg-success/10"
        />
        <StatCard
          title="Available Pool"
          value={formatCurrency(summary?.availablePoolBalance || 0)}
          subtitle="For business operations"
          icon={Wallet}
          iconClassName="bg-warning/10"
        />
      </div>

      {/* Investment Pool Overview */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5 md:gap-6">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Pool Total</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{formatCurrency(pool?.totalInvested || 0)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Total Profit</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-success truncate">{formatCurrency(pool?.totalProfit || 0)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Available Balance</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold truncate">{formatCurrency(pool?.availableBalance || 0)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Total Shares</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold">{formatNumber(pool?.totalShares || 0)}</p>
            </div>
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Active Investors</p>
              <p className="text-base sm:text-lg md:text-2xl font-bold">{formatNumber(pool?.activeInvestors || 0)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfitBarChart
          data={chartData}
          title="Monthly Profit Distribution"
          description="Platform-wide profit by month"
        />
        <CumulativeProfitChart
          data={chartData}
          title="Cumulative Profit Growth"
          description="Total profit generated over time"
        />
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Profit Records */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Monthly Profit Records</CardTitle>
              <CardDescription>Recent profit distributions</CardDescription>
            </div>
            <Link href="/admin/profits">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProfits.length === 0 ? (
                <div className="text-center py-8">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">No profit records yet</p>
                </div>
              ) : (
                recentProfits.map((profit) => (
                  <div
                    key={profit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center ${profit.status === 'cancelled'
                          ? 'bg-muted'
                          : profit.status === 'completed'
                            ? 'bg-success/10'
                            : 'bg-warning/10'
                          }`}
                      >
                        {profit.status === 'pending' ? (
                          <Clock className="h-5 w-5 text-warning" />
                        ) : profit.status === 'distributing' ? (
                          <TrendingUp className="h-5 w-5 text-primary animate-pulse" />
                        ) : (
                          <TrendingUp
                            className={`h-5 w-5 ${profit.status === 'cancelled' ? 'text-muted-foreground' : 'text-success'
                              }`}
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {profit.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profit.expected_roi_percentage ? `${profit.expected_roi_percentage}%` : 'N/A'} • {profit.distribution_type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(parseFloat(profit.total_amount))}</p>
                      <Badge
                        variant={
                          profit.status === 'cancelled'
                            ? 'outline'
                            : profit.status === 'completed'
                              ? 'success'
                              : 'warning'
                        }
                      >
                        {profit.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pending Distributions */}
        <Card data-tour="pending-distributions">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                Pending Distributions
                {pendingDistributions.length > 0 && (
                  <Badge variant="warning">{pendingDistributions.length}</Badge>
                )}
              </CardTitle>
              <CardDescription>Profits awaiting distribution</CardDescription>
            </div>
            <Link href="/admin/profits">
              <Button variant="ghost" size="sm">Process</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingDistributions.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                  <AlertCircle className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No pending distributions</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingDistributions.slice(0, 5).map((profit: any) => (
                  <div
                    key={profit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                        <Clock className="h-5 w-5 text-warning" />
                      </div>
                      <div>
                        <p className="font-medium">{profit.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {profit.distribution_type} • {profit.beneficiaries_count || 0} beneficiaries
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-warning">
                        {formatCurrency(parseFloat(profit.total_amount || 0))}
                      </p>
                      <Badge variant="warning">Pending</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Profit Distributed</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-success truncate">
                  {formatCurrency(summary?.totalProfitDistributed || 0)}
                </p>
              </div>
              <PieChart className="h-6 w-6 sm:h-8 sm:w-8 text-success flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Pending Distributions</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold text-warning truncate">
                  {formatCurrency(summary?.pendingDistributions || 0)}
                </p>
              </div>
              <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-warning flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground">Avg. Monthly ROI</p>
                <p className="text-lg sm:text-xl md:text-2xl font-bold">{summary?.averageMonthlyRoi || 0}%</p>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
