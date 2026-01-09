'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import fundingRequestService, { type FundingRequest, type FundingRequestSummary } from '@/lib/api/services/funding-request.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Wallet,
  Clock, 
  CheckCircle, 
  XCircle,
  Loader2, 
  AlertCircle, 
  ChevronLeft, 
  ChevronRight,
  DollarSign,
  Users,
  Filter,
  RefreshCw
} from 'lucide-react'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/30',
  approved: 'bg-success/10 text-success border-success/30',
  rejected: 'bg-destructive/10 text-destructive border-destructive/30',
  cancelled: 'bg-muted text-muted-foreground',
}

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="h-4 w-4" />,
  approved: <CheckCircle className="h-4 w-4" />,
  rejected: <XCircle className="h-4 w-4" />,
  cancelled: <XCircle className="h-4 w-4" />,
}

export default function AdminFundingRequestsPage() {
  const [requests, setRequests] = useState<FundingRequest[]>([])
  const [summary, setSummary] = useState<FundingRequestSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  
  // Dialog state
  const [selectedRequest, setSelectedRequest] = useState<FundingRequest | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null)
  const [notes, setNotes] = useState('')
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    loadRequests()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  const loadRequests = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fundingRequestService.adminGetFundingRequests(
        currentPage,
        15,
        statusFilter
      )

      if (response.success && response.data) {
        setRequests(response.data.requests || [])
        setTotalPages(response.data.pagination?.last_page || 1)
        setSummary(response.data.summary || null)
      }
    } catch (err: any) {
      console.error('Failed to load funding requests:', err)
      setError(err.response?.data?.message || 'Failed to load funding requests')
    } finally {
      setLoading(false)
    }
  }

  const openActionDialog = (request: FundingRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request)
    setActionType(action)
    setNotes('')
  }

  const handleAction = async () => {
    if (!selectedRequest || !actionType) return

    try {
      setProcessing(true)
      setError(null)

      if (actionType === 'approve') {
        await fundingRequestService.approveFundingRequest(selectedRequest.id, notes || undefined)
        setSuccess(`Funding request approved and wallet funded with ${formatCurrency(selectedRequest.amount)}`)
      } else {
        if (!notes.trim()) {
          setError('Please provide a reason for rejection')
          setProcessing(false)
          return
        }
        await fundingRequestService.rejectFundingRequest(selectedRequest.id, notes)
        setSuccess('Funding request rejected')
      }

      setSelectedRequest(null)
      setActionType(null)
      loadRequests()
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to process request:', err)
      setError(err.response?.data?.message || 'Failed to process request')
    } finally {
      setProcessing(false)
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading funding requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => setError(null)}>
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Funding Requests</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Review and process user wallet funding requests
          </p>
        </div>
        <Button variant="outline" className="gap-2" onClick={loadRequests} disabled={loading}>
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-warning">{summary.pending}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-2xl font-bold text-success">{summary.approved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="col-span-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(summary.total_pending_amount)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Funding Requests</CardTitle>
          <CardDescription>
            {requests.length} request{requests.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <div className="text-center py-12">
              <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No funding requests found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {request.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{request.user?.name || 'Unknown User'}</p>
                        <Badge className={statusColors[request.status]}>
                          {statusIcons[request.status]}
                          <span className="ml-1 capitalize">{request.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{request.user?.email}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Requested: {formatDate(request.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 lg:gap-6">
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-muted-foreground">Amount</p>
                      <p className="text-lg font-bold text-primary">{formatCurrency(request.amount)}</p>
                    </div>
                    <div className="text-left lg:text-right">
                      <p className="text-xs text-muted-foreground">Method</p>
                      <p className="font-medium capitalize">{request.payment_method || 'Manual'}</p>
                    </div>
                    
                    {request.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          className="gap-2 bg-success hover:bg-success/90"
                          onClick={() => openActionDialog(request, 'approve')}
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="gap-2"
                          onClick={() => openActionDialog(request, 'reject')}
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    )}
                    
                    {request.status !== 'pending' && request.processor && (
                      <div className="text-left lg:text-right">
                        <p className="text-xs text-muted-foreground">Processed by</p>
                        <p className="text-sm">{request.processor.name}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t">
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
        </CardContent>
      </Card>

      {/* Action Dialog */}
      <Dialog open={!!selectedRequest && !!actionType} onOpenChange={() => { setSelectedRequest(null); setActionType(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {actionType === 'approve' ? (
                <>
                  <CheckCircle className="h-5 w-5 text-success" />
                  Approve Funding Request
                </>
              ) : (
                <>
                  <XCircle className="h-5 w-5 text-destructive" />
                  Reject Funding Request
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Approve and fund ${selectedRequest?.user?.name}'s wallet with ${formatCurrency(selectedRequest?.amount || 0)}`
                : `Reject ${selectedRequest?.user?.name}'s funding request`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 rounded-lg bg-muted">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedRequest?.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedRequest?.user?.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest?.user?.email}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">{formatCurrency(selectedRequest?.amount || 0)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">
                {actionType === 'approve' ? 'Notes (optional)' : 'Reason for rejection (required)'}
              </Label>
              <Textarea
                id="notes"
                placeholder={actionType === 'approve' ? 'Add any notes...' : 'Please provide a reason for rejection...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setSelectedRequest(null); setActionType(null); }}>
              Cancel
            </Button>
            <Button
              onClick={handleAction}
              disabled={processing || (actionType === 'reject' && !notes.trim())}
              className={actionType === 'approve' ? 'bg-success hover:bg-success/90' : ''}
              variant={actionType === 'reject' ? 'destructive' : 'default'}
            >
              {processing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : actionType === 'approve' ? (
                <CheckCircle className="h-4 w-4 mr-2" />
              ) : (
                <XCircle className="h-4 w-4 mr-2" />
              )}
              {processing ? 'Processing...' : actionType === 'approve' ? 'Approve & Fund' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
