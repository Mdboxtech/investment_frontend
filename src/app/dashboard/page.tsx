'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/dashboard/stat-card'
import { ProfitLineChart, CumulativeProfitChart } from '@/components/dashboard/charts'
import {
  DollarSign,
  TrendingUp,
  PieChart,
  Wallet as WalletIcon,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Loader2,
} from 'lucide-react'
import { formatCurrency, formatPercent, formatDate, formatMonthYear } from '@/lib/utils'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import walletService, { type Wallet } from '@/lib/api/services/wallet.service'
import investmentService, { type InvestmentSummary, type Investment } from '@/lib/api/services/investment.service'
import profitService, { type ProfitSummary, type UserProfit } from '@/lib/api/services/profit.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

interface DashboardData {
  wallet: Wallet | null
  investmentSummary: InvestmentSummary | null
  profitSummary: ProfitSummary | null
  recentProfits: UserProfit[]
  recentInvestments: Investment[]
}

export default function UserDashboard() {
  const [data, setData] = useState<DashboardData>({
    wallet: null,
    investmentSummary: null,
    profitSummary: null,
    recentProfits: [],
    recentInvestments: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all data in parallel
      const [walletResponse, investmentSummaryResponse, profitSummaryResponse, recentProfitsResponse, recentInvestmentsResponse] =
        await Promise.all([
          walletService.getWallet().catch(() => ({ success: false, data: null })),
          investmentService.getSummary().catch(() => ({ success: false, data: null })),
          profitService.getSummary().catch(() => ({ success: false, data: null })),
          profitService.getUserProfits(1, 4).catch(() => ({ success: false, data: { profits: [] } })),
          investmentService.getInvestments(1, 6).catch(() => ({ success: false, data: { investments: [] } })),
        ])

      // Extract data from nested response structures
      const recentProfitsData = (recentProfitsResponse.data as any)?.profits || []
      const recentInvestmentsData = (recentInvestmentsResponse.data as any)?.investments || []

      setData({
        wallet: walletResponse.data ?? null,
        investmentSummary: investmentSummaryResponse.data ?? null,
        profitSummary: profitSummaryResponse.data ?? null,
        recentProfits: Array.isArray(recentProfitsData) ? recentProfitsData : [],
        recentInvestments: Array.isArray(recentInvestmentsData) ? recentInvestmentsData : [],
      })
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err)
      setError(err.response?.data?.message || 'Failed to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // Calculate totals from actual data
  const walletBalance = data.wallet?.available_balance || 0
  const totalInvested = data.investmentSummary?.total_invested || 0
  const currentValue = data.investmentSummary?.current_value || 0
  const totalShares = data.investmentSummary?.total_quantity || 0
  const roiPercentage = data.investmentSummary?.roi_percentage || 0
  const totalProfitEarned = data.profitSummary?.net_earnings || 0
  const pendingProfits = data.profitSummary?.pending_profits || 0

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={loadDashboardData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Investment Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Welcome back! Here's an overview of your investments.
          </p>
        </div>
        <Link href="/dashboard/shares">
          <Button className="gap-2 w-full sm:w-auto">
            <TrendingUp className="h-4 w-4" />
            Buy More Shares
          </Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div data-tour="stats-grid" className="grid gap-4 grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <div data-tour="stat-wallet-balance">
          <Card className="bg-gradient-to-br from-success/10 to-success/5 border-success/20">
            <CardContent className="p-3 sm:p-4">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-success/20 flex items-center justify-center flex-shrink-0">
                  <WalletIcon className="h-4 w-4 sm:h-5 sm:w-5 text-success" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs sm:text-sm text-muted-foreground">Wallet Balance</p>
                  <p className="text-base sm:text-lg md:text-xl font-bold text-success truncate">{formatCurrency(walletBalance)}</p>
                </div>
              </div>
              <Link href="/dashboard/wallet">
                <Button variant="outline" size="sm" className="w-full mt-2 sm:mt-3 border-success/30 text-success hover:bg-success/10 text-xs sm:text-sm">
                  Manage Wallet
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <div data-tour="stat-total-investment">
          <StatCard
            title="Total Invested"
            value={formatCurrency(totalInvested)}
            subtitle={`${totalShares} ${totalShares === 1 ? 'share' : 'shares'} owned`}
            icon={DollarSign}
            iconClassName="bg-primary/10"
          />
        </div>
        <div>
          <StatCard
            title="Current Value"
            value={formatCurrency(currentValue)}
            icon={PieChart}
            trend={{
              value: roiPercentage,
              isPositive: roiPercentage > 0,
            }}
            iconClassName="bg-success/10"
          />
        </div>
        <div data-tour="stat-total-profit">
          <StatCard
            title="Total Profit Earned"
            value={formatCurrency(totalProfitEarned)}
            subtitle="All-time earnings"
            icon={TrendingUp}
            iconClassName="bg-success/10"
          />
        </div>
        <div data-tour="stat-roi">
          <StatCard
            title="Pending Profits"
            value={formatCurrency(pendingProfits)}
            subtitle="Awaiting distribution"
            icon={ArrowUpRight}
            iconClassName="bg-success/10 text-success"
          />
        </div>
        <div>
          <StatCard
            title="Pending Losses"
            value={formatCurrency(data.profitSummary?.pending_losses || 0)}
            subtitle="Estimated loss share"
            icon={ArrowDownRight}
            iconClassName="bg-destructive/10 text-destructive"
            className="border-destructive/20"
          />
        </div>
      </div>

      {/* ROI Highlight Card */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Return on Investment</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-bold text-primary">
                  {formatPercent(roiPercentage)}
                </span>
                <span className="text-sm text-muted-foreground">lifetime ROI</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on {formatCurrency(totalInvested)} invested
              </p>
            </div>
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-primary/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 md:h-10 md:w-10 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Section */}
      {data.recentProfits.length > 0 && (
        <div data-tour="profit-chart" className="grid gap-6 lg:grid-cols-2">
          <ProfitLineChart
            data={data.recentProfits.map((profit, index) => {
              const profitAmount = parseFloat(profit.net_profit?.toString() || '0')
              const month = profit.monthly_profit?.title || `Month ${index + 1}`
              return {
                month,
                profit: profitAmount,
                percentage: 0,
                cumulative: 0,
              }
            })}
            title="Monthly Profit Trend"
            description="Your profit earnings over time"
          />
          <CumulativeProfitChart
            data={data.recentProfits.reduce((acc, profit, index) => {
              const currentProfit = parseFloat(profit.net_profit?.toString() || '0')
              const cumulative = index > 0 ? acc[index - 1].cumulative + currentProfit : currentProfit
              const month = profit.monthly_profit?.title || `Month ${index + 1}`
              return [...acc, {
                month,
                profit: currentProfit,
                percentage: 0,
                cumulative: cumulative,
              }]
            }, [] as any[])}
            title="Cumulative Earnings"
            description="Total earnings growth"
          />
        </div>
      )}

      {/* Recent Activity Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Profits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Profits</CardTitle>
              <CardDescription>Your latest profit distributions</CardDescription>
            </div>
            <Link href="/dashboard/profits">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentProfits.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No profit distributions yet</p>
                <p className="text-sm mt-1">Start investing to earn profits!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentProfits.map((profit) => (
                  <div
                    key={profit.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center">
                        <ArrowUpRight className="h-5 w-5 text-success" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {profit.monthly_profit?.title || 'Monthly Profit'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {profit.share_count} {profit.share_count === 1 ? 'share' : 'shares'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">
                        +{profitService.formatCurrency(profit.net_profit || profit.amount || 0)}
                      </p>
                      <Badge variant={profit.status === 'distributed' || profit.status === 'completed' ? 'default' : 'secondary'}>
                        {profit.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Investments */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Investments</CardTitle>
              <CardDescription>Your latest share purchases</CardDescription>
            </div>
            <Link href="/dashboard/investments">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {data.recentInvestments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <p>No investments yet</p>
                <p className="text-sm mt-1">
                  <Link href="/dashboard/shares" className="text-primary hover:underline">
                    Buy your first shares
                  </Link>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {data.recentInvestments.slice(0, 5).map((investment) => (
                  <div
                    key={investment.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowDownRight className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {investment.share?.name || `Share #${investment.share_id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(investment.invested_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(parseFloat(investment.amount_invested || '0'))}
                      </p>
                      <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                        {investment.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Active Investments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Your Investments</CardTitle>
            <CardDescription>Overview of your share holdings</CardDescription>
          </div>
          <Link href="/dashboard/investments">
            <Button variant="ghost" size="sm">View Details</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {data.recentInvestments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No active investments</p>
              <p className="text-sm mt-1">Start building your portfolio today</p>
              <Link href="/dashboard/shares">
                <Button className="mt-4">Browse Shares</Button>
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              {data.recentInvestments.slice(0, 3).map((investment) => {
                const amountInvested = parseFloat(investment.amount_invested || '0')
                const currentValue = parseFloat(investment.current_value || '0')
                const totalReturns = parseFloat(investment.total_returns || '0')
                // Use total_returns if available (includes profit distributions), otherwise calculate from value change
                const profit = totalReturns > 0 ? totalReturns : (currentValue - amountInvested)
                const profitPercent = amountInvested > 0 ? (profit / amountInvested) * 100 : 0

                return (
                  <Card key={investment.id} className="bg-muted/30">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-semibold">
                            {investment.share?.name || `Share #${investment.share_id}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {investment.quantity} {investment.quantity === 1 ? 'share' : 'shares'}
                          </p>
                        </div>
                        <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                          {investment.status}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Invested</span>
                          <span>{formatCurrency(amountInvested)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Value</span>
                          <span className="font-medium">
                            {formatCurrency(currentValue)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Profit</span>
                          <span className={profit >= 0 ? 'text-success font-medium' : 'text-destructive font-medium'}>
                            {profit >= 0 ? '+' : ''}{formatCurrency(profit)} ({investmentService.formatPercentage(profitPercent)})
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
