'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import profitService, { MonthlyProfit } from '@/lib/api/services/profit.service'
import dashboardService from '@/lib/api/services/dashboard.service'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Clock,
  Lock,
  CheckCircle,
  Users,
  Calculator,
  Send,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Edit,
  Play,
} from 'lucide-react'



function ProfitRecord({
  profit,
  onDistribute,
  onCancel,
  onEdit,
  onActivate,
  cancelling = false,
  activating = false,
}: {
  profit: MonthlyProfit
  onDistribute: () => void
  onCancel?: () => void
  onEdit?: () => void
  onActivate?: () => void
  cancelling?: boolean
  activating?: boolean
}) {
  const isLoss = (profit as any).type === 'loss'

  const StatusIcon =
    profit.status === 'pending' ? Clock :
      profit.status === 'distributing' ? Loader2 :
        profit.status === 'completed' ? (isLoss ? TrendingDown : CheckCircle) :
          AlertCircle

  // Determine styles based on status and profit type
  const getIconContainerStyle = () => {
    if (profit.status === 'pending') return 'bg-warning/10'
    if (profit.status === 'distributing') return 'bg-primary/10'
    if (profit.status === 'completed') return isLoss ? 'bg-destructive/10' : 'bg-success/10'
    return 'bg-muted'
  }

  const getIconStyle = () => {
    if (profit.status === 'pending') return 'text-warning'
    if (profit.status === 'distributing') return 'text-primary animate-spin'
    if (profit.status === 'completed') return isLoss ? 'text-destructive' : 'text-success'
    return 'text-muted-foreground'
  }

  const getAmountStyle = () => {
    // For losses, show amount in red
    if (isLoss) return 'text-destructive'
    return ''
  }

  return (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col gap-4">
          {/* Top section: Icon, Title, Description */}
          <div className="flex items-start gap-3 md:gap-4">
            <div
              className={`h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${getIconContainerStyle()}`}
            >
              <StatusIcon
                className={`h-5 w-5 md:h-6 md:w-6 ${getIconStyle()}`}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-semibold text-base md:text-lg truncate">
                  {profit.title}
                </h3>
                <Badge
                  variant={
                    isLoss ? 'destructive' :
                      profit.status === 'pending'
                        ? 'warning'
                        : profit.status === 'distributing'
                          ? 'default'
                          : profit.status === 'completed'
                            ? 'success'
                            : 'outline'
                  }
                  className="text-xs"
                >
                  {isLoss ? 'Loss' : profit.status}
                </Badge>
              </div>
              {profit.description && (
                <p className="text-xs md:text-sm text-muted-foreground mt-1 line-clamp-2">{profit.description}</p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Created: {formatDate(profit.created_at)}
                {profit.completed_at && ` • Completed: ${formatDate(profit.completed_at)}`}
                {profit.distribution_date && ` • Scheduled: ${formatDate(profit.distribution_date)}`}
              </p>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {formatNumber(profit.beneficiaries_count)} beneficiaries
                </span>
                <span className="capitalize">{profit.distribution_type}</span>
                <span>{profit.distribution_progress}% distributed</span>
              </div>
            </div>
          </div>

          {/* Bottom section: Amount and Button */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t">
            <div className="flex-1">
              <p className={`text-xl md:text-2xl font-bold ${getAmountStyle()}`}>
                {isLoss ? '-' : ''}{formatCurrency(parseFloat(profit.total_amount))}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs md:text-sm">
                <span className={`${isLoss ? 'text-destructive' : 'text-success'} font-medium`}>
                  {formatCurrency(parseFloat(profit.distributed_amount))} distributed
                </span>
                <span className="text-muted-foreground">
                  {formatCurrency(parseFloat(profit.remaining_amount))} remaining
                </span>
              </div>
            </div>
            <div className="flex gap-2 sm:flex-shrink-0">
              {profit.status === 'pending' && (
                <>
                  {onEdit && (
                    <Button variant="outline" size="sm" className="w-full sm:w-auto gap-1" onClick={onEdit}>
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                  )}
                  <Button size="sm" className="w-full sm:w-auto" onClick={onDistribute}>
                    <Send className="h-4 w-4 mr-2" />
                    Distribute
                  </Button>
                  {onCancel && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={onCancel}
                      disabled={cancelling}
                    >
                      {cancelling ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                      {cancelling ? 'Cancelling...' : 'Cancel'}
                    </Button>
                  )}
                </>
              )}
              {profit.status === 'distributing' && (
                <Button size="sm" className="w-full sm:w-auto" disabled>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Distributing...
                </Button>
              )}
              {profit.status === 'completed' && profit.is_fully_distributed && (
                <Button variant={isLoss ? 'destructive' : 'success'} size="sm" className="w-full sm:w-auto" disabled>
                  {isLoss ? <TrendingDown className="h-4 w-4 mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                  Completed
                </Button>
              )}
              {profit.status === 'cancelled' && onActivate && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto gap-1"
                  onClick={onActivate}
                  disabled={activating}
                >
                  {activating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
                  {activating ? 'Activating...' : 'Activate'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface Profit {
  id: number
  title: string
  description: string | null
  total_amount: string
  distributed_amount: string
  remaining_amount: string
  distribution_type: 'fixed' | 'proportional'
  status: 'pending' | 'distributing' | 'completed' | 'cancelled'
  distribution_progress: number
  is_fully_distributed: boolean
  beneficiaries_count: number
  distribution_date: string | null
  completed_at: string | null
  metadata: any
  created_at: string
  updated_at: string
}

export default function ProfitsManagementPage() {
  const [profits, setProfits] = useState<Profit[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showDistributeDialog, setShowDistributeDialog] = useState(false)
  const [selectedProfit, setSelectedProfit] = useState<MonthlyProfit | null>(null)
  const [saving, setSaving] = useState(false)
  const [distributing, setDistributing] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [activating, setActivating] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)

  // Form state for create profit
  const [formData, setFormData] = useState({
    type: 'profit' as 'profit' | 'loss',
    title: '',
    description: '',
    total_amount: '',
    distribution_type: 'proportional' as 'fixed' | 'proportional',
    distribution_date: '',
  })

  useEffect(() => {
    loadProfits()
    loadSummary()
  }, [currentPage])

  const loadProfits = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await profitService.getMonthlyProfits(currentPage, 15)
      // Backend returns { data: { profits: [...], pagination: {...} } }
      const responseData = response.data as any
      setProfits(responseData?.profits || [])
      setTotalPages(responseData?.pagination?.last_page || 1)
    } catch (err: any) {
      console.error('Failed to load profits:', err)
      setError(err.response?.data?.message || 'Failed to load profits')
    } finally {
      setLoading(false)
    }
  }

  const loadSummary = async () => {
    try {
      // Use dashboard service for admin profit statistics
      const response = await dashboardService.getProfitStatistics()
      // Backend returns: { success, message, data: { total_profit_pools, total_amount, total_distributed, pending_distribution, ... } }
      const responseWrapper: any = response
      const summaryData = responseWrapper.data || responseWrapper

      // Map backend fields to frontend expected fields
      setSummary({
        total_amount: summaryData?.total_amount || 0,
        total_distributed: summaryData?.total_distributed || 0,
        total_pending: summaryData?.pending_distribution || 0,
        total_profit_pools: summaryData?.total_profit_pools || 0,
        completed_profits: summaryData?.completed_profits || 0,
      })
    } catch (err: any) {
      console.error('Failed to load summary:', err)
    }
  }

  const handleCreateProfit = async () => {
    if (!formData.title || !formData.total_amount) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      setError(null)
      await profitService.createProfit({
        type: formData.type,
        title: formData.title,
        description: formData.description || undefined,
        total_amount: formData.total_amount,
        distribution_type: formData.distribution_type,
        distribution_date: formData.distribution_date || undefined,
      })
      setShowCreateDialog(false)
      setFormData({
        type: 'profit',
        title: '',
        description: '',
        total_amount: '',
        distribution_type: 'proportional',
        distribution_date: '',
      })
      loadProfits()
      loadSummary()
    } catch (err: any) {
      console.error('Failed to create profit:', err)
      setError(err.response?.data?.message || 'Failed to create profit')
    } finally {
      setSaving(false)
    }
  }

  const handleEditProfit = async () => {
    if (!selectedProfit || !formData.title || !formData.total_amount) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setSaving(true)
      setError(null)
      // Call the update endpoint (uses PUT /admin/profits/{id})
      await profitService.updateProfit(selectedProfit.id, {
        title: formData.title,
        description: formData.description || undefined,
        total_amount: formData.total_amount,
        distribution_type: formData.distribution_type,
        distribution_date: formData.distribution_date || undefined,
      })
      setShowEditDialog(false)
      setSelectedProfit(null)
      setFormData({
        type: 'profit',
        title: '',
        description: '',
        total_amount: '',
        distribution_type: 'proportional',
        distribution_date: '',
      })
      loadProfits()
      loadSummary()
    } catch (err: any) {
      console.error('Failed to update profit:', err)
      setError(err.response?.data?.message || 'Failed to update profit')
    } finally {
      setSaving(false)
    }
  }

  const handleDistributeProfit = async () => {
    if (!selectedProfit) return

    try {
      setDistributing(true)
      setError(null)
      await profitService.distributeProfit(selectedProfit.id)
      setShowDistributeDialog(false)
      setSelectedProfit(null)
      loadProfits()
      loadSummary()
    } catch (err: any) {
      console.error('Failed to distribute profit:', err)
      setError(err.response?.data?.message || 'Failed to distribute profit')
    } finally {
      setDistributing(false)
    }
  }

  const handleCancelProfit = async (profitId: number) => {
    if (!confirm('Are you sure you want to cancel this profit pool? This action cannot be undone.')) {
      return
    }

    try {
      setCancelling(true)
      setError(null)
      await profitService.cancelProfit(profitId)
      loadProfits()
      loadSummary()
    } catch (err: any) {
      console.error('Failed to cancel profit:', err)
      setError(err.response?.data?.message || 'Failed to cancel profit')
    } finally {
      setCancelling(false)
    }
  }

  const handleActivateProfit = async (profitId: number) => {
    try {
      setActivating(true)
      setError(null)
      await profitService.activateProfit(profitId)
      loadProfits()
      loadSummary()
    } catch (err: any) {
      console.error('Failed to activate profit:', err)
      setError(err.response?.data?.message || 'Failed to activate profit')
    } finally {
      setActivating(false)
    }
  }

  const openEditDialog = (profit: MonthlyProfit) => {
    setSelectedProfit(profit)
    setFormData({
      type: (profit as any).type || 'profit',
      title: profit.title,
      description: profit.description || '',
      total_amount: profit.total_amount,
      distribution_type: profit.distribution_type,
      distribution_date: profit.distribution_date || '',
    })
    setShowEditDialog(true)
  }

  const pendingProfits = profits.filter((p) => p.status === 'pending')
  const distributingProfits = profits.filter((p) => p.status === 'distributing')
  const completedProfits = profits.filter((p) => p.status === 'completed')
  const cancelledProfits = profits.filter((p) => p.status === 'cancelled')
  const lossProfits = profits.filter((p) => (p as any).type === 'loss')

  if (loading && profits.length === 0) {
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
            <Button variant="outline" size="sm" onClick={() => { loadProfits(); setError(null); }}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Profit Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Record monthly profits and manage distributions
          </p>
        </div>
        <Button data-tour="add-profit-button" className="gap-2 w-full sm:w-auto" onClick={() => setShowCreateDialog(true)}>
          <Plus className="h-4 w-4" />
          Record Profit Pool
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
                <p className="text-xs md:text-sm text-muted-foreground">Total Amount</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(summary?.total_amount || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Distributed</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(summary?.total_distributed || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-warning" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Pending</p>
                <p className="text-lg md:text-xl font-bold text-warning">
                  {formatCurrency(summary?.total_pending || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-muted flex items-center justify-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Pools</p>
                <p className="text-xl font-bold">{formatNumber(summary?.total_profit_pools || 0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profit Records Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Records ({profits.length})</TabsTrigger>
          <TabsTrigger value="pending">
            Pending ({pendingProfits.length})
            {pendingProfits.length > 0 && (
              <Badge variant="warning" className="ml-2">{pendingProfits.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedProfits.length})</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled ({cancelledProfits.length})</TabsTrigger>
          <TabsTrigger value="losses" className="text-destructive">
            Losses ({lossProfits.length})
            {lossProfits.length > 0 && (
              <Badge variant="destructive" className="ml-2">{lossProfits.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4" data-tour="profits-table">
          {!profits || profits.length === 0 ? (
            <EmptyState message="No profit records found" />
          ) : (
            <>
              {profits.map((profit) => (
                <ProfitRecord
                  key={profit.id}
                  profit={profit}
                  onDistribute={() => {
                    setSelectedProfit(profit)
                    setShowDistributeDialog(true)
                  }}
                  onCancel={() => handleCancelProfit(profit.id)}
                  onEdit={() => openEditDialog(profit)}
                  onActivate={() => handleActivateProfit(profit.id)}
                  cancelling={cancelling}
                  activating={activating}
                />
              ))}
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1 || loading}
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
                    disabled={currentPage >= totalPages || loading}
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          {pendingProfits.length === 0 ? (
            <EmptyState message="No pending profit records" />
          ) : (
            pendingProfits.map((profit) => (
              <ProfitRecord
                key={profit.id}
                profit={profit}
                onDistribute={() => {
                  setSelectedProfit(profit)
                  setShowDistributeDialog(true)
                }}
                onCancel={() => handleCancelProfit(profit.id)}
                onEdit={() => openEditDialog(profit)}
                cancelling={cancelling}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedProfits.length === 0 ? (
            <EmptyState message="No completed profit records" />
          ) : (
            completedProfits.map((profit) => (
              <ProfitRecord
                key={profit.id}
                profit={profit}
                onDistribute={() => {
                  setSelectedProfit(profit)
                  setShowDistributeDialog(true)
                }}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="cancelled" className="space-y-4">
          {cancelledProfits.length === 0 ? (
            <EmptyState message="No cancelled profit records" />
          ) : (
            cancelledProfits.map((profit) => (
              <ProfitRecord
                key={profit.id}
                profit={profit}
                onDistribute={() => {
                  setSelectedProfit(profit)
                  setShowDistributeDialog(true)
                }}
                onActivate={() => handleActivateProfit(profit.id)}
                activating={activating}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="losses" className="space-y-4">
          {lossProfits.length === 0 ? (
            <EmptyState message="No loss records found" />
          ) : (
            lossProfits.map((profit) => (
              <ProfitRecord
                key={profit.id}
                profit={profit}
                onDistribute={() => {
                  setSelectedProfit(profit)
                  setShowDistributeDialog(true)
                }}
                onEdit={() => openEditDialog(profit)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Profit Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Record Profit or Loss</DialogTitle>
            <DialogDescription>
              Create a new profit pool or record a loss (informational)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Type Toggle */}
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={formData.type}
                onValueChange={(value: 'profit' | 'loss') =>
                  setFormData({ ...formData, type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="profit">Profit</SelectItem>
                  <SelectItem value="loss">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title *</Label>
              <Input
                placeholder={formData.type === 'loss' ? 'e.g., January 2026 Trading Loss' : 'e.g., January 2026 Profit'}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Total Amount ($) *</Label>
              <Input
                type="number"
                step="0.01"
                placeholder="Enter profit amount"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Distribution Type *</Label>
              <Select
                value={formData.distribution_type}
                onValueChange={(value: 'fixed' | 'proportional') => setFormData({ ...formData, distribution_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proportional">Proportional (By Shares)</SelectItem>
                  <SelectItem value="fixed">Fixed (Manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Distribution Date (Optional)</Label>
              <Input
                type="date"
                value={formData.distribution_date}
                onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this profit pool..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            {/* Info Card */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span className="font-medium text-sm">Distribution Info</span>
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>• Proportional: Distributed based on share ownership</p>
                  <p>• Fixed: Manually specify amounts per investor</p>
                </div>
              </CardContent>
            </Card>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleCreateProfit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {formData.type === 'loss' ? 'Record Loss' : 'Create Profit Pool'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Distribute Profit Dialog */}
      <Dialog open={showDistributeDialog} onOpenChange={setShowDistributeDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Distribute Profit</DialogTitle>
            <DialogDescription>
              {selectedProfit?.title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedProfit && (
              <>
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Amount</span>
                      <span className="font-semibold">
                        {formatCurrency(parseFloat(selectedProfit.total_amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distributed</span>
                      <span className="font-semibold">
                        {formatCurrency(parseFloat(selectedProfit.distributed_amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remaining</span>
                      <span className="font-semibold text-primary">
                        {formatCurrency(parseFloat(selectedProfit.remaining_amount))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Distribution Type</span>
                      <Badge>{selectedProfit.distribution_type}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Beneficiaries</span>
                      <span className="font-semibold">
                        {selectedProfit.beneficiaries_count}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex items-start gap-2 p-3 rounded-lg bg-warning/10">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-warning">Distribution Notice</p>
                    <p className="text-muted-foreground">
                      {selectedProfit.distribution_type === 'proportional'
                        ? 'This will automatically distribute profits to all eligible investors based on their share ownership.'
                        : 'You will need to manually specify distribution amounts for each investor.'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDistributeDialog(false)} disabled={distributing}>
              Cancel
            </Button>
            <Button
              className="gap-2"
              onClick={handleDistributeProfit}
              disabled={distributing || selectedProfit?.is_fully_distributed}
            >
              {distributing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {!distributing && <Send className="h-4 w-4" />}
              Distribute Profits
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Profit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Profit Pool</DialogTitle>
            <DialogDescription>
              Update the profit pool details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                placeholder="e.g., January 2026 Profit"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Total Amount *</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="Enter total profit amount"
                value={formData.total_amount}
                onChange={(e) => setFormData({ ...formData, total_amount: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Distribution Type</Label>
              <Select
                value={formData.distribution_type}
                onValueChange={(value: 'fixed' | 'proportional') =>
                  setFormData({ ...formData, distribution_type: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="proportional">Proportional (Based on shares)</SelectItem>
                  <SelectItem value="fixed">Fixed (Manual amounts)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-date">Distribution Date (Optional)</Label>
              <Input
                id="edit-date"
                type="date"
                value={formData.distribution_date}
                onChange={(e) => setFormData({ ...formData, distribution_date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Description (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this profit pool..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleEditProfit} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}



function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-muted-foreground">{message}</p>
    </div>
  )
}
