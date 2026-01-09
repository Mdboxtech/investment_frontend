'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useDebounce } from '@/hooks/use-debounce'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import investmentService, { Share } from '@/lib/api/services/investment.service'
import { formatCurrency, formatNumber, formatDate } from '@/lib/utils'
import { Plus, TrendingUp, Edit, Trash2, AlertCircle, Loader2, ChevronLeft, ChevronRight, AlertTriangle, Search } from 'lucide-react'

export default function SharesManagementPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [shares, setShares] = useState<Share[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '')
  // Note: Assuming useDebounce hook exists based on common patterns. If not, I'll implement simple effect. 
  // Wait, I should check if useDebounce exists. 
  // Instead of risking a missing hook, I'l use a simplified pattern with useEffect on searchValue

  const [totalPages, setTotalPages] = useState(1)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [selectedShare, setSelectedShare] = useState<Share | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    company_name: '',
    description: '',
    price_per_share: '',
    total_shares: '',
    minimum_investment: '100',
    expected_roi_percentage: '',
    investment_duration_months: '',
    ticker_symbol: '',
    risk_level: 'medium' as 'low' | 'medium' | 'high',
  })
  const [saving, setSaving] = useState(false)
  const [shareToDelete, setShareToDelete] = useState<Share | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchValue)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchValue])

  useEffect(() => {
    loadShares()
  }, [currentPage, searchParams])

  const handleSearch = (term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) {
      params.set('search', term)
    } else {
      params.delete('search')
    }
    params.set('page', '1') // Reset to page 1 on search
    router.replace(`${pathname}?${params.toString()}`)
  }

  const loadShares = async () => {
    try {
      setLoading(true)
      setError(null)
      const search = searchParams.get('search') || undefined
      const response = await investmentService.getShares(currentPage, 10, { search })
      // Backend returns { data: { shares: [...], pagination: {...} } }
      const sharesData = response.data as any
      setShares(Array.isArray(sharesData?.shares) ? sharesData.shares : [])
      setTotalPages(sharesData?.pagination?.last_page || 1)
    } catch (err: any) {
      console.error('Failed to load shares:', err)
      setError(err.response?.data?.message || 'Failed to load shares')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateShare = async () => {
    try {
      setSaving(true)
      await investmentService.createShare({
        name: formData.name,
        company_name: formData.company_name,
        description: formData.description || undefined,
        price_per_share: parseFloat(formData.price_per_share),
        total_shares: parseInt(formData.total_shares),
        minimum_investment: formData.minimum_investment ? parseFloat(formData.minimum_investment) : undefined,
        expected_roi_percentage: formData.expected_roi_percentage ? parseFloat(formData.expected_roi_percentage) : undefined,
        investment_duration_months: formData.investment_duration_months ? parseInt(formData.investment_duration_months) : undefined,
        ticker_symbol: formData.ticker_symbol || undefined,
        risk_level: formData.risk_level,
        is_active: true,
      })
      setShowCreateDialog(false)
      setFormData({
        name: '',
        company_name: '',
        description: '',
        price_per_share: '',
        total_shares: '',
        minimum_investment: '100',
        expected_roi_percentage: '',
        investment_duration_months: '',
        ticker_symbol: '',
        risk_level: 'medium',
      })
      loadShares()
    } catch (err: any) {
      console.error('Failed to create share:', err)
      setError(err.response?.data?.message || 'Failed to create share')
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateShare = async () => {
    if (!selectedShare) return
    try {
      setSaving(true)
      await investmentService.updateShare(selectedShare.id, {
        name: formData.name,
        company_name: formData.company_name,
        description: formData.description || undefined,
        price_per_share: parseFloat(formData.price_per_share),
        total_shares: parseInt(formData.total_shares),
        minimum_investment: formData.minimum_investment ? parseFloat(formData.minimum_investment) : undefined,
        expected_roi_percentage: formData.expected_roi_percentage ? parseFloat(formData.expected_roi_percentage) : undefined,
        investment_duration_months: formData.investment_duration_months ? parseInt(formData.investment_duration_months) : undefined,
        ticker_symbol: formData.ticker_symbol || undefined,
        risk_level: formData.risk_level,
      })
      setSelectedShare(null)
      loadShares()
    } catch (err: any) {
      console.error('Failed to update share:', err)
      setError(err.response?.data?.message || 'Failed to update share')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteShare = async () => {
    if (!shareToDelete) return
    try {
      setDeleting(true)
      await investmentService.deleteShare(shareToDelete.id)
      setShareToDelete(null)
      loadShares()
    } catch (err: any) {
      console.error('Failed to delete share:', err)
      setError(err.response?.data?.message || 'Failed to delete share')
    } finally {
      setDeleting(false)
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await investmentService.toggleShareStatus(id)
      loadShares()
    } catch (err: any) {
      console.error('Failed to toggle status:', err)
      setError(err.response?.data?.message || 'Failed to toggle status')
    }
  }

  const openEditDialog = (share: Share) => {
    setSelectedShare(share)
    setFormData({
      name: share.name,
      company_name: share.company_name || share.name,
      description: share.description || '',
      price_per_share: share.price_per_share?.toString() || '',
      total_shares: share.total_shares?.toString() || '',
      minimum_investment: share.minimum_investment?.toString() || '100',
      expected_roi_percentage: share.expected_roi_percentage?.toString() || '',
      investment_duration_months: share.investment_duration_months?.toString() || '',
      ticker_symbol: share.ticker_symbol || '',
      risk_level: (share.risk_level as 'low' | 'medium' | 'high') || 'medium',
    })
  }

  if (loading && (!shares || shares.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalFunds = shares?.length || 0
  const totalShares = shares?.reduce((sum, s) => sum + (s.total_shares || 0), 0) || 0
  const availableShares = shares?.reduce((sum, s) => sum + (s.available_shares || 0), 0) || 0
  const activeShares = shares?.filter((s) => s.is_active).length || 0

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={loadShares}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Manage Shares</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Create and manage investment shares
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setShowCreateDialog(true)} data-tour="create-share-btn">
          <Plus className="h-4 w-4" />
          Create New Share
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shares..."
            className="pl-8"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4" data-tour="shares-summary">
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Total Funds</p>
            <p className="text-lg md:text-2xl font-bold">{totalFunds}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Total Shares</p>
            <p className="text-lg md:text-2xl font-bold">
              {formatNumber(totalShares)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Available Shares</p>
            <p className="text-lg md:text-2xl font-bold">
              {formatNumber(availableShares)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <p className="text-xs md:text-sm text-muted-foreground">Active Funds</p>
            <p className="text-lg md:text-2xl font-bold">
              {activeShares}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Shares List */}
      <div className="grid gap-4 md:gap-6" data-tour="share-list">
        {!shares || shares.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No shares found</p>
            </CardContent>
          </Card>
        ) : (
          shares.map((share, index) => {
            const soldShares = share.sold_shares || 0
            const soldPercentage = share.percentage_sold || 0
            const totalValue = soldShares * parseFloat(share.price_per_share?.toString() || '0')
            const status = share.is_sold_out ? 'sold_out' : share.is_active ? 'active' : 'inactive'

            return (
              <Card key={share.id} data-tour={index === 0 ? 'share-card' : undefined}>
                <CardHeader className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-3 md:gap-4">
                      <div className="h-10 w-10 md:h-12 md:w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <CardTitle className="text-base md:text-lg">{share.name}</CardTitle>
                          <Badge
                            variant={
                              status === 'active'
                                ? 'success'
                                : status === 'sold_out'
                                  ? 'secondary'
                                  : 'outline'
                            }
                            className="text-xs"
                          >
                            {status === 'sold_out' ? 'Sold Out' : status}
                          </Badge>
                          {share.is_featured && (
                            <Badge variant="default" className="text-xs">
                              Featured
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="mt-1 text-xs md:text-sm">{share.description || 'No description'}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-auto sm:ml-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEditDialog(share)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => setShareToDelete(share)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 mb-4 md:mb-6">
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Price/Share</p>
                      <p className="text-base md:text-lg font-semibold">{formatCurrency(parseFloat(share.price_per_share?.toString() || '0'))}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Total Shares</p>
                      <p className="text-base md:text-lg font-semibold">{formatNumber(share.total_shares || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Sold</p>
                      <p className="text-base md:text-lg font-semibold">{formatNumber(soldShares)}</p>
                    </div>
                    <div>
                      <p className="text-xs md:text-sm text-muted-foreground">Available</p>
                      <p className="text-base md:text-lg font-semibold">{formatNumber(share.available_shares || 0)}</p>
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <p className="text-xs md:text-sm text-muted-foreground">Total Value</p>
                      <p className="text-base md:text-lg font-semibold text-success">{formatCurrency(totalValue)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                      <span>Sales Progress</span>
                      <span>{soldPercentage.toFixed(1)}% sold</span>
                    </div>
                    <Progress value={soldPercentage} className="h-2" />
                  </div>
                </CardContent>
                <CardFooter className="border-t p-4 md:pt-4">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-2 text-xs md:text-sm text-muted-foreground">
                    <span>
                      ROI: {share.expected_roi_percentage || 0}% | Maturity: {share.investment_duration_months || 0} months
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(share.id)}
                    >
                      {share.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Create Share Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Share</DialogTitle>
            <DialogDescription>
              Add a new investment share to the platform
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Row 1: Name and Company */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Share Name *</Label>
                <Input
                  placeholder="e.g., Growth Fund"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Company Name *</Label>
                <Input
                  placeholder="e.g., Acme Corp"
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Row 2: Ticker and Min Investment */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Ticker Symbol</Label>
                <Input
                  placeholder="e.g., ACME"
                  value={formData.ticker_symbol}
                  onChange={(e) => setFormData({ ...formData, ticker_symbol: e.target.value.toUpperCase() })}
                  maxLength={10}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Min Investment</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="100"
                  value={formData.minimum_investment}
                  onChange={(e) => setFormData({ ...formData, minimum_investment: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Row 3: Price and Total Shares */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Price per Share *</Label>
                <Input
                  type="number"
                  step="0.01"
                  placeholder="100.00"
                  value={formData.price_per_share}
                  onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Total Shares *</Label>
                <Input
                  type="number"
                  placeholder="10000"
                  value={formData.total_shares}
                  onChange={(e) => setFormData({ ...formData, total_shares: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Row 4: ROI and Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Expected ROI (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="15.5"
                  value={formData.expected_roi_percentage}
                  onChange={(e) => setFormData({ ...formData, expected_roi_percentage: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Duration (months)</Label>
                <Input
                  type="number"
                  placeholder="12"
                  value={formData.investment_duration_months}
                  onChange={(e) => setFormData({ ...formData, investment_duration_months: e.target.value })}
                  className="h-9"
                />
              </div>
            </div>

            {/* Description - full width */}
            <div className="space-y-1.5">
              <Label className="text-xs">Description</Label>
              <Textarea
                placeholder="Brief description of the investment..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[60px] resize-none"
              />
            </div>

            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted text-xs">
              <AlertCircle className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <p className="text-muted-foreground">
                Shares are created as "inactive". Activate when ready for sale.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(false)} disabled={saving}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleCreateShare} disabled={saving || !formData.name || !formData.company_name || !formData.price_per_share || !formData.total_shares}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Share'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Share Dialog */}
      <Dialog open={!!selectedShare} onOpenChange={() => setSelectedShare(null)}>
        <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Share</DialogTitle>
            <DialogDescription>Update share details</DialogDescription>
          </DialogHeader>
          {selectedShare && (
            <div className="space-y-4 py-2">
              {/* Row 1: Name and Company */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Share Name *</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Company Name *</Label>
                  <Input
                    value={formData.company_name}
                    onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 2: Ticker and Min Investment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Ticker Symbol</Label>
                  <Input
                    value={formData.ticker_symbol}
                    onChange={(e) => setFormData({ ...formData, ticker_symbol: e.target.value.toUpperCase() })}
                    maxLength={10}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min Investment</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.minimum_investment}
                    onChange={(e) => setFormData({ ...formData, minimum_investment: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 3: Price and Total Shares */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Price per Share *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.price_per_share}
                    onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Total Shares *</Label>
                  <Input
                    type="number"
                    value={formData.total_shares}
                    onChange={(e) => setFormData({ ...formData, total_shares: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Row 4: ROI and Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Expected ROI (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.expected_roi_percentage}
                    onChange={(e) => setFormData({ ...formData, expected_roi_percentage: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duration (months)</Label>
                  <Input
                    type="number"
                    value={formData.investment_duration_months}
                    onChange={(e) => setFormData({ ...formData, investment_duration_months: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>

              {/* Description - full width */}
              <div className="space-y-1.5">
                <Label className="text-xs">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[60px] resize-none"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setSelectedShare(null)} disabled={saving}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUpdateShare}
              disabled={saving || !formData.name || !formData.company_name || !formData.price_per_share || !formData.total_shares}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update Share'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!shareToDelete} onOpenChange={() => setShareToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Share
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this share? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {shareToDelete && (
            <div className="py-4">
              <div className="p-4 rounded-lg bg-muted space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Share Name</span>
                  <span className="font-medium">{shareToDelete.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Company</span>
                  <span>{shareToDelete.company_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Shares</span>
                  <span>{formatNumber(shareToDelete.total_shares || 0)}</span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShareToDelete(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteShare} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Share
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
