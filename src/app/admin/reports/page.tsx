'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ProfitBarChart, CumulativeProfitChart, ROIPercentageChart } from '@/components/dashboard/charts'
import dashboardService from '@/lib/api/services/dashboard.service'
import profitService, { type MonthlyProfit } from '@/lib/api/services/profit.service'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { Download, FileText, TrendingUp, Users, DollarSign, PieChart, Loader2 } from 'lucide-react'

interface DashboardSummary {
  totalInvestedCapital: number
  totalProfitGenerated: number
  totalSharesSold: number
  activeInvestorsCount: number
}

export default function ReportsPage() {
  const router = useRouter()
  const [summary, setSummary] = useState<DashboardSummary>({
    totalInvestedCapital: 0,
    totalProfitGenerated: 0,
    totalSharesSold: 0,
    activeInvestorsCount: 0,
  })
  const [profits, setProfits] = useState<MonthlyProfit[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadReportData()
  }, [])

  const loadReportData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [overviewResponse, profitsResponse] = await Promise.all([
        dashboardService.getDashboardOverview(),
        profitService.getMonthlyProfits(1, 12),
      ])

      // Extract summary from overview
      // Backend returns: { success, message, data: { investments: {...}, profits: {...}, ... } }
      const responseWrapper = overviewResponse as any
      const overview = responseWrapper.data || responseWrapper
      setSummary({
        totalInvestedCapital: overview.investments?.total_invested_amount || 0,
        totalProfitGenerated: overview.profits?.total_distributed || 0,
        totalSharesSold: overview.shares?.total_shares_sold || 0,
        activeInvestorsCount: overview.users?.active_investors || overview.users?.active_users || 0,
      })

      // Extract profits from response - handle various response structures
      const responseData = profitsResponse.data as any
      const profitsData = responseData?.profits || responseData?.data || []
      const profitsList = Array.isArray(profitsData) ? profitsData : []
      setProfits(profitsList)

      // Transform for charts - use title and total_amount since these exist on Profit
      const chartTransformed = profitsList.map((profit: MonthlyProfit, index: number) => ({
        month: profit.title || `Profit ${index + 1}`,
        profit: parseFloat(String(profit.total_amount || 0)),
        roi: profit.distribution_progress || 0,
        cumulative: 0,
      }))

      // Calculate cumulative
      let cumulative = 0
      chartTransformed.forEach((item: any) => {
        cumulative += item.profit
        item.cumulative = cumulative
      })

      setChartData(chartTransformed)
    } catch (err: any) {
      console.error('Failed to load report data:', err)
      setError(err.response?.data?.message || 'Failed to load report data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading reports...</p>
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
            <Button variant="outline" size="sm" onClick={loadReportData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Comprehensive platform analytics and reporting
          </p>
        </div>
        <div className="flex gap-2">
          <Select defaultValue="2025">
            <SelectTrigger className="w-24 md:w-32">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export Report</span>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Capital</p>
                <p className="text-lg md:text-2xl font-bold">{formatCurrency(summary.totalInvestedCapital)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Profit</p>
                <p className="text-lg md:text-2xl font-bold text-success">
                  {formatCurrency(summary.totalProfitGenerated)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <PieChart className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Shares Sold</p>
                <p className="text-lg md:text-2xl font-bold">{formatNumber(summary.totalSharesSold)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 md:p-6">
            <div className="flex items-center gap-2 md:gap-4">
              <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Active Investors</p>
                <p className="text-lg md:text-2xl font-bold">{formatNumber(summary.activeInvestorsCount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfitBarChart
          data={chartData}
          title="Monthly Profit Distribution"
          description="Platform profit by month"
        />
        <ROIPercentageChart
          data={chartData}
          title="ROI Percentage Trend"
          description="Monthly return on investment"
        />
      </div>

      <CumulativeProfitChart
        data={chartData}
        title="Cumulative Profit Growth"
        description="Total profit accumulation over time"
      />

      {/* Profit Pools Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Profit Pool Summary</CardTitle>
          <CardDescription>Detailed breakdown of profit pools</CardDescription>
        </CardHeader>
        <CardContent>
          {profits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No profit records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-right py-3 px-4 font-medium">Total Amount</th>
                    <th className="text-right py-3 px-4 font-medium">Distributed</th>
                    <th className="text-right py-3 px-4 font-medium">Status</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...profits]
                    .reverse()
                    .map((profit) => (
                      <tr key={profit.id} className="border-b last:border-0 hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">
                          {profit.title}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {formatCurrency(parseFloat(String(profit.total_amount || 0)))}
                        </td>
                        <td className="py-3 px-4 text-right text-success">
                          {formatCurrency(parseFloat(String(profit.distributed_amount || 0)))}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${profit.status === 'completed'
                                ? 'bg-success/10 text-success'
                                : profit.status === 'distributing'
                                  ? 'bg-warning/10 text-warning'
                                  : profit.status === 'cancelled'
                                    ? 'bg-destructive/10 text-destructive'
                                    : 'bg-muted text-muted-foreground'
                              }`}
                          >
                            {profit.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="gap-1"
                            onClick={() => router.push(`/admin/pool/${profit.id}`)}
                          >
                            <FileText className="h-3 w-3" />
                            Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td className="py-3 px-4 font-semibold">Total</td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {formatCurrency(
                        profits.reduce((sum, p) => sum + parseFloat(String(p.total_amount || 0)), 0)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-success">
                      {formatCurrency(
                        profits.reduce((sum, p) => sum + parseFloat(String(p.distributed_amount || 0)), 0)
                      )}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Reports */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Investment Report</p>
                <p className="text-sm text-muted-foreground">Download detailed investment data</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="font-medium">Profit Distribution</p>
                <p className="text-sm text-muted-foreground">Download profit distribution logs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-hover cursor-pointer">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Investor Report</p>
                <p className="text-sm text-muted-foreground">Download investor summary</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
