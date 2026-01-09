'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils'
import { TrendingUp, TrendingDown, PieChart, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import investmentService, { type Investment, type InvestmentSummary } from '@/lib/api/services/investment.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function InvestmentsPage() {
  // Data state
  const [investments, setInvestments] = useState<Investment[]>([])
  const [summary, setSummary] = useState<InvestmentSummary | null>(null)
  
  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('active')
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    loadInvestments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab])

  const loadInvestments = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch investments and summary in parallel
      const filters: any = {}
      if (activeTab === 'active') filters.status = 'active'

      const [investmentsResponse, summaryResponse] = await Promise.all([
        investmentService.getInvestments(currentPage, 10, filters),
        investmentService.getSummary().catch(() => ({ success: false, data: null })),
      ])

      // Handle paginated response structure - backend returns { data: { investments: [...], pagination: {...} } }
      const responseData = investmentsResponse.data as any
      if (responseData?.investments && Array.isArray(responseData.investments)) {
        setInvestments(responseData.investments)
        setTotalPages(responseData.pagination?.last_page || 1)
      } else {
        setInvestments([])
      }

      // Summary response is direct data object
      if (summaryResponse.success && summaryResponse.data) {
        setSummary(summaryResponse.data)
      } else {
        setSummary(null)
      }
    } catch (err: any) {
      console.error('Failed to load investments:', err)
      setError(err.response?.data?.message || 'Failed to load investments. Please try again.')
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
          <p className="text-muted-foreground">Loading your investments...</p>
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
            <Button variant="outline" size="sm" onClick={loadInvestments}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Investments</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Track and manage your share investments
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4" data-tour="portfolio-summary">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PieChart className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Shares</p>
                <p className="text-lg md:text-xl font-bold">{summary?.total_quantity || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(summary?.total_invested || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Current Value</p>
                <p className="text-lg md:text-xl font-bold text-success">{formatCurrency(summary?.current_value || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card data-tour="roi-card">
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total ROI</p>
                <p className="text-lg md:text-xl font-bold text-success">{formatPercent(summary?.roi_percentage || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4" data-tour="investments-tabs">
        <TabsList>
          <TabsTrigger value="active">Active Investments</TabsTrigger>
          <TabsTrigger value="all">All Investments</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4" data-tour="investments-list">
          {investments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <PieChart className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
                <p className="text-lg font-medium text-muted-foreground">No investments found</p>
                <p className="text-sm text-muted-foreground mt-1">Start investing to build your portfolio</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {investments.map((investment, index) => {
                const amountInvested = parseFloat(investment.amount_invested || '0')
                const currentValue = parseFloat(investment.current_value || '0')
                const profit = currentValue - amountInvested
                const profitPercent = investmentService.calculateROI(amountInvested, currentValue)
                const isPositive = profit >= 0

                return (
                  <Card key={investment.id} data-tour={index === 0 ? 'investment-card' : undefined}>
                    <CardContent className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Left Section - Investment Info */}
                        <div className="flex items-start gap-4">
                          {investment.share?.logo_url ? (
                            <img src={investment.share.logo_url} alt={investment.share.name} className="h-12 w-12 rounded-lg object-cover" />
                          ) : (
                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                              <PieChart className="h-6 w-6 text-primary" />
                            </div>
                          )}
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{investment.share?.name || `Share #${investment.share_id}`}</h3>
                              <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
                                {investment.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Purchased: {formatDate(investment.invested_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Right Section - Values */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8" data-tour={index === 0 ? 'investment-metrics' : undefined}>
                          <div>
                            <p className="text-sm text-muted-foreground">Shares</p>
                            <p className="text-lg font-semibold">{investment.quantity}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Invested</p>
                            <p className="text-lg font-semibold">{formatCurrency(amountInvested)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Value</p>
                            <p className="text-lg font-semibold">{formatCurrency(currentValue)}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Profit/Loss</p>
                            <div className="flex items-center gap-1">
                              {isPositive ? (
                                <TrendingUp className="h-4 w-4 text-success" />
                              ) : (
                                <TrendingDown className="h-4 w-4 text-destructive" />
                              )}
                              <p className={`text-lg font-semibold ${isPositive ? 'text-success' : 'text-destructive'}`}>
                                {isPositive ? '+' : ''}{formatCurrency(profit)}
                              </p>
                            </div>
                            <p className={`text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
                              ({investmentService.formatPercentage(profitPercent)})
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Investment Performance</span>
                          <span className="font-medium">{investmentService.formatPercentage(profitPercent)} ROI</span>
                        </div>
                        <Progress value={Math.min(Math.abs(profitPercent) + 50, 100)} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                )
              })}

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
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
