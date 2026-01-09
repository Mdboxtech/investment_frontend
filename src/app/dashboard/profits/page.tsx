'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProfitBarChart, ROIPercentageChart, CumulativeProfitChart } from '@/components/dashboard/charts'
import profitService, { type UserProfit, type ProfitSummary } from '@/lib/api/services/profit.service'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, Download, Calendar, Wallet, ArrowUpRight, Loader2, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react'

export default function ProfitsPage() {
  const [profits, setProfits] = useState<UserProfit[]>([])
  const [summary, setSummary] = useState<ProfitSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadProfits()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage])

  const loadProfits = async () => {
    try {
      setLoading(true)
      setError(null)

      const [profitsResponse, summaryResponse] = await Promise.all([
        profitService.getUserProfits(currentPage, 20),
        profitService.getSummary().catch(() => ({ success: false, data: null })),
      ])

      // Extract profits from nested response
      const responseData = profitsResponse.data as any
      const profitsData = responseData?.profits || []
      setProfits(Array.isArray(profitsData) ? profitsData : [])
      setTotalPages(responseData?.pagination?.last_page || 1)

      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data)
      }
    } catch (err: any) {
      console.error('Failed to load profits:', err)
      setError(err.response?.data?.message || 'Failed to load profit data')
    } finally {
      setLoading(false)
    }
  }

  // Filter profits based on tab
  const allProfits = profits
  const paidProfits = profits.filter((p) => p.status === 'distributed' || p.status === 'completed')
  const pendingProfits = profits.filter((p) => p.status === 'pending')
  const lossProfits = profits.filter((p) => (p.monthly_profit as any)?.type === 'loss')

  const totalPaid = paidProfits.reduce((sum, p) => sum + parseFloat(p.net_profit?.toString() || '0'), 0)
  const totalPending = pendingProfits.reduce((sum, p) => sum + parseFloat(p.net_profit?.toString() || '0'), 0)

  // Prepare chart data
  const chartData = profits.map((profit, index) => ({
    month: profit.monthly_profit?.title || `Month ${index + 1}`,
    profit: parseFloat(profit.net_profit?.toString() || '0'),
    percentage: profit.monthly_profit?.distribution_progress || 0,
    cumulative: 0,
  }))

  // Calculate cumulative
  let cumulative = 0
  chartData.forEach((item) => {
    cumulative += item.profit
    item.cumulative = cumulative
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your profit history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={loadProfits}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profit History</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Track your monthly profit distributions and earnings
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export History
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Earned</p>
                <p className="text-lg md:text-xl font-bold text-success">
                  {formatCurrency(summary?.net_earnings || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Paid</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(summary?.distributed_profits || totalPaid)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Calendar className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-lg md:text-xl font-bold text-warning">{formatCurrency(summary?.pending_profits || totalPending)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Avg. Monthly</p>
                <p className="text-lg md:text-xl font-bold">
                  {formatCurrency(summary?.average_monthly_profit || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      {chartData.length > 0 && (
        <>
          <div className="grid gap-6 lg:grid-cols-2">
            <ProfitBarChart
              data={chartData}
              title="Monthly Profit Breakdown"
              description="Your profit distribution by month"
            />
            <ROIPercentageChart
              data={chartData}
              title="ROI Percentage Trend"
              description="Monthly return on investment rates"
            />
          </div>

          {/* Cumulative Chart */}
          <CumulativeProfitChart
            data={chartData}
            title="Cumulative Earnings Growth"
            description="Total earnings accumulation over time"
          />
        </>
      )}

      {/* Profit Records */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Profit Records</CardTitle>
            <CardDescription>Detailed monthly profit history</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({allProfits.length})</TabsTrigger>
              <TabsTrigger value="paid">Paid ({paidProfits.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({pendingProfits.length})</TabsTrigger>
              <TabsTrigger value="losses" className="text-destructive">
                Losses ({lossProfits.length})
                {lossProfits.length > 0 && (
                  <Badge variant="destructive" className="ml-2">{lossProfits.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {allProfits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No profit records yet</p>
                  <p className="text-sm mt-1">Your profit history will appear here</p>
                </div>
              ) : (
                allProfits.map((profit) => (
                  <ProfitRecord key={profit.id} profit={profit} />
                ))
              )}
            </TabsContent>

            <TabsContent value="paid" className="space-y-4">
              {paidProfits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No paid profits yet</p>
                </div>
              ) : (
                paidProfits.map((profit) => (
                  <ProfitRecord key={profit.id} profit={profit} />
                ))
              )}
            </TabsContent>

            <TabsContent value="pending" className="space-y-4">
              {pendingProfits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending profits</p>
                </div>
              ) : (
                pendingProfits.map((profit) => (
                  <ProfitRecord key={profit.id} profit={profit} />
                ))
              )}
            </TabsContent>

            <TabsContent value="losses" className="space-y-4">
              {/* Info alert explaining losses */}
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Losses are recorded for informational purposes only and do not affect your wallet balance.
                </AlertDescription>
              </Alert>
              {lossProfits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No losses recorded</p>
                  <p className="text-sm mt-1">Investment losses will appear here if any occur</p>
                </div>
              ) : (
                lossProfits.map((profit) => (
                  <ProfitRecord key={profit.id} profit={profit} />
                ))
              )}
            </TabsContent>
          </Tabs>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function ProfitRecord({ profit }: { profit: UserProfit }) {
  const isPaid = profit.status === 'distributed' || profit.status === 'completed'
  const isLoss = (profit.monthly_profit as any)?.type === 'loss'

  // Determine icon and colors based on type and status
  const getIconBg = () => {
    if (isLoss) return 'bg-destructive/10'
    if (isPaid) return 'bg-success/10'
    return 'bg-warning/10'
  }

  const getAmountColor = () => {
    if (isLoss) return 'text-destructive'
    if (isPaid) return 'text-success'
    return 'text-warning'
  }

  const getIcon = () => {
    if (isLoss) return <TrendingDown className="h-6 w-6 text-destructive" />
    if (isPaid) return <TrendingUp className="h-6 w-6 text-success" />
    return <Calendar className="h-6 w-6 text-warning" />
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-4">
        <div
          className={`h-12 w-12 rounded-lg flex items-center justify-center ${getIconBg()}`}
        >
          {getIcon()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{profit.monthly_profit?.title || 'Monthly Profit'}</p>
            {isLoss && (
              <Badge variant="destructive" className="text-xs">Loss</Badge>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>{profit.share_count} {profit.share_count === 1 ? 'share' : 'shares'}</span>
            {profit.distributed_at && (
              <>
                <span>•</span>
                <span>{formatDate(profit.distributed_at)}</span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="text-right">
        <p className={`text-lg font-bold ${getAmountColor()}`}>
          {isLoss ? '-' : '+'}{formatCurrency(parseFloat(profit.net_profit?.toString() || '0'))}
        </p>
        <Badge variant={isLoss ? 'destructive' : isPaid ? 'success' : 'warning'}>
          {isLoss ? 'Loss' : profit.status}
        </Badge>
      </div>
    </div>
  )
}
