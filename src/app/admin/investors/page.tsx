'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import userService, { type UserWithStats } from '@/lib/api/services/user.service'
import investmentService, { type Share } from '@/lib/api/services/investment.service'
import walletService from '@/lib/api/services/wallet.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Search, Users, TrendingUp, DollarSign, Filter, Eye, Loader2, AlertCircle, ChevronLeft, ChevronRight, Wallet, CheckCircle, Plus } from 'lucide-react'

export default function InvestorsPage() {
  const router = useRouter()
  const [investors, setInvestors] = useState<UserWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('joined')

  // Create user dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  })

  // Assign share dialog state
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [assigning, setAssigning] = useState(false)
  const [shares, setShares] = useState<Share[]>([])
  const [assignForm, setAssignForm] = useState({
    share_id: '',
    quantity: '',
    purchase_date: '',
  })

  // Fund wallet dialog state
  const [fundDialogOpen, setFundDialogOpen] = useState(false)
  const [debitDialogOpen, setDebitDialogOpen] = useState(false)
  const [selectedInvestor, setSelectedInvestor] = useState<UserWithStats | null>(null)
  const [fundAmount, setFundAmount] = useState('')
  const [fundDescription, setFundDescription] = useState('')
  const [debitAmount, setDebitAmount] = useState('')
  const [debitDescription, setDebitDescription] = useState('')
  const [funding, setFunding] = useState(false)
  const [debiting, setDebiting] = useState(false)

  useEffect(() => {
    loadInvestors()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter])

  const loadInvestors = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {
        role: 'user', // Only fetch investors (non-admin users)
      }

      if (statusFilter !== 'all') {
        filters.is_active = statusFilter === 'active'
      }

      if (searchQuery) {
        filters.search = searchQuery
      }

      const response = await userService.getUsers(currentPage, 10, filters)
      // Backend returns paginated response with data array
      const responseData = response.data as any
      // Handle both direct array and paginated response formats
      if (Array.isArray(responseData)) {
        setInvestors(responseData)
        setTotalPages(1)
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        setInvestors(responseData.data)
        setTotalPages(responseData.last_page || 1)
      } else {
        setInvestors([])
        setTotalPages(1)
      }
    } catch (err: any) {
      console.error('Failed to load investors:', err)
      setError(err.response?.data?.message || 'Failed to load investors')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    loadInvestors()
  }

  const handleToggleStatus = async (userId: number) => {
    try {
      await userService.toggleUserStatus(userId)
      loadInvestors()
    } catch (err: any) {
      console.error('Failed to toggle user status:', err)
      setError(err.response?.data?.message || 'Failed to update user status')
    }
  }

  const openFundDialog = (investor: UserWithStats) => {
    setSelectedInvestor(investor)
    setFundAmount('')
    setFundDescription('')
    setFundDialogOpen(true)
  }

  const openDebitDialog = (investor: UserWithStats) => {
    setSelectedInvestor(investor)
    setDebitAmount('')
    setDebitDescription('')
    setDebitDialogOpen(true)
  }

  const handleFundWallet = async () => {
    if (!selectedInvestor || !fundAmount || parseFloat(fundAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setFunding(true)
      setError(null)

      const payload = {
        user_id: selectedInvestor.id,
        amount: parseFloat(fundAmount),
        description: fundDescription || `Admin funding for ${selectedInvestor.name}`,
      }

      console.log('Funding wallet with payload:', payload)

      await walletService.adminFundWallet(payload)

      setSuccess(`Successfully funded ${selectedInvestor.name}'s wallet with ${formatCurrency(parseFloat(fundAmount))}`)
      setFundDialogOpen(false)
      loadInvestors()

      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to fund wallet:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to fund wallet'
      setError(errorMessage)
    } finally {
      setFunding(false)
    }
  }

  const handleCreateUser = async () => {
    if (!createForm.name || !createForm.email) {
      setError('Name and Email are required')
      return
    }

    try {
      setCreating(true)
      setError(null)

      // Only include password if provided, otherwise let backend auto-generate
      const payload = {
        name: createForm.name,
        email: createForm.email,
        phone: createForm.phone || undefined,
        password: createForm.password || undefined,
        role: 'user' as const,
      }

      await userService.createUser(payload)

      setSuccess(`Successfully created investor ${createForm.name}`)
      setCreateDialogOpen(false)
      setCreateForm({ name: '', email: '', phone: '', password: '' })
      loadInvestors()

      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to create user:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to create user'
      setError(errorMessage)
    } finally {
      setCreating(false)
    }
  }

  const handleDebitWallet = async () => {
    if (!selectedInvestor || !debitAmount || parseFloat(debitAmount) <= 0) {
      setError('Please enter a valid amount')
      return
    }

    try {
      setDebiting(true)
      setError(null)

      const payload = {
        user_id: selectedInvestor.id,
        amount: parseFloat(debitAmount),
        description: debitDescription || `Admin debit from ${selectedInvestor.name}`,
      }

      console.log('Debiting wallet with payload:', payload)

      await walletService.adminDebitWallet(payload)

      setSuccess(`Successfully debited ${formatCurrency(parseFloat(debitAmount))} from ${selectedInvestor.name}'s wallet`)
      setDebitDialogOpen(false)
      loadInvestors()

      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to debit wallet:', err)
      console.error('Error response:', err.response?.data)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to debit wallet'
      setError(errorMessage)
    } finally {
      setDebiting(false)
    }
  }

  const openAssignDialog = async (investor: UserWithStats) => {
    console.log('openAssignDialog called for:', investor.name)
    setSelectedInvestor(investor)
    setAssignForm({ share_id: '', quantity: '', purchase_date: '' })
    setAssignDialogOpen(true)

    // Load shares if not loaded
    if (shares.length === 0) {
      try {
        const response = await investmentService.getShares(1, 100)
        // Extract shares from response.data (PaginatedResponse or direct array)
        const data = response.data as any
        const sharesList = Array.isArray(data) ? data : (data.data || data.shares || [])
        setShares(Array.isArray(sharesList) ? sharesList : [])
      } catch (err) {
        console.error('Failed to load shares', err)
      }
    }
  }

  const handleAssignShare = async () => {
    if (!selectedInvestor || !assignForm.share_id || !assignForm.quantity) {
      setError('Please fill in all required fields')
      return
    }

    try {
      setAssigning(true)
      setError(null)

      await investmentService.createManualInvestment({
        user_id: selectedInvestor.id,
        share_id: parseInt(assignForm.share_id),
        quantity: parseInt(assignForm.quantity),
        purchase_date: assignForm.purchase_date || undefined,
      })

      setSuccess(`Successfully assigned shares to ${selectedInvestor.name}`)
      setAssignDialogOpen(false)
      loadInvestors()

      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to assign share:', err)
      const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Failed to assign share'
      setError(errorMessage)
    } finally {
      setAssigning(false)
    }
  }

  if (loading && investors.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const totalInvestors = Array.isArray(investors) ? investors.length : 0
  const activeInvestors = Array.isArray(investors) ? investors.filter((i) => i.is_active).length : 0
  const totalInvested = Array.isArray(investors) ? investors.reduce((sum, i) => sum + (i.total_invested || 0), 0) : 0
  const totalProfits = Array.isArray(investors) ? investors.reduce((sum, i) => sum + (i.total_profits || 0), 0) : 0

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
            <Button variant="outline" size="sm" onClick={loadInvestors}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Investors</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage and view investor accounts
          </p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Create Investor
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Investors</p>
                <p className="text-lg md:text-xl font-bold">{totalInvestors}</p>
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
                <p className="text-xs md:text-sm text-muted-foreground">Active</p>
                <p className="text-lg md:text-xl font-bold">{activeInvestors}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg md:text-xl font-bold">
                  {formatCurrency(totalInvested)}
                </p>
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
                <p className="text-xs md:text-sm text-muted-foreground">Profit Distributed</p>
                <p className="text-lg md:text-xl font-bold text-success">
                  {formatCurrency(totalProfits)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search investors..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="joined">Date Joined</SelectItem>
                <SelectItem value="invested">Total Invested</SelectItem>
                <SelectItem value="profit">Total Profit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Investors List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">Investor List</CardTitle>
          <CardDescription>All registered investors on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {investors.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No investors found</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {investors.map((investor) => {
                const initials = userService.getInitials(investor.name)

                return (
                  <div
                    key={investor.id}
                    className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-3 md:p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <Avatar className="h-10 w-10 md:h-12 md:w-12 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground text-sm md:text-base">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="font-semibold text-sm md:text-base">{investor.name}</h4>
                          <Badge variant={investor.is_active ? 'success' : 'secondary'} className="text-xs">
                            {investor.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-xs md:text-sm text-muted-foreground truncate">{investor.email}</p>
                        <p className="text-xs text-muted-foreground">
                          Joined: {formatDate(investor.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 md:gap-6 lg:gap-8 pl-13 lg:pl-0">
                      <div className="text-left lg:text-right">
                        <p className="text-xs md:text-sm text-muted-foreground">Balance</p>
                        <p className="font-semibold text-sm md:text-base text-primary">{formatCurrency(investor.wallet_balance || 0)}</p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-xs md:text-sm text-muted-foreground">Shares</p>
                        <p className="font-semibold text-sm md:text-base">{investor.total_shares || 0}</p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-xs md:text-sm text-muted-foreground">Invested</p>
                        <p className="font-semibold text-sm md:text-base">{formatCurrency(investor.total_invested || 0)}</p>
                      </div>
                      <div className="text-left lg:text-right">
                        <p className="text-xs md:text-sm text-muted-foreground">Profit Earned</p>
                        <p className="font-semibold text-success text-sm md:text-base">
                          {formatCurrency(investor.total_profits || 0)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openFundDialog(investor)}
                        >
                          <Wallet className="h-4 w-4" />
                          <span className="hidden sm:inline">Fund</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => openDebitDialog(investor)}
                        >
                          <Wallet className="h-4 w-4" />
                          <span className="hidden sm:inline">Debit</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(investor.id)}
                        >
                          {investor.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => router.push(`/admin/users/${investor.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                          <span className="hidden sm:inline">View</span>
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          className="gap-2"
                          onClick={() => openAssignDialog(investor)}
                        >
                          <Plus className="h-4 w-4" />
                          <span className="hidden sm:inline">Assign Share</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-4 border-t">
              <p className="text-xs md:text-sm text-muted-foreground">
                Showing {investors.length} of {investors.length} investors
              </p>
              <div className="flex items-center gap-2">
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
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fund Wallet Dialog */}
      <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Fund Wallet
            </DialogTitle>
            <DialogDescription>
              Manually add funds to {selectedInvestor?.name}'s wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedInvestor ? userService.getInitials(selectedInvestor.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedInvestor?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedInvestor?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={fundAmount}
                onChange={(e) => setFundAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Reason for funding"
                value={fundDescription}
                onChange={(e) => setFundDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFundDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleFundWallet}
              disabled={funding || !fundAmount || parseFloat(fundAmount) <= 0}
              className="gap-2"
            >
              {funding ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )}
              {funding ? 'Processing...' : 'Fund Wallet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Debit Wallet Dialog */}
      <Dialog open={debitDialogOpen} onOpenChange={setDebitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Debit Wallet
            </DialogTitle>
            <DialogDescription>
              Manually deduct funds from {selectedInvestor?.name}'s wallet
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {selectedInvestor ? userService.getInitials(selectedInvestor.name) : ''}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{selectedInvestor?.name}</p>
                <p className="text-sm text-muted-foreground">{selectedInvestor?.email}</p>
                <p className="text-xs text-muted-foreground">
                  Balance: {formatCurrency(selectedInvestor?.wallet_balance || 0)}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="debit-amount">Amount ($)</Label>
              <Input
                id="debit-amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                value={debitAmount}
                onChange={(e) => setDebitAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="debit-description">Description (optional)</Label>
              <Input
                id="debit-description"
                placeholder="Reason for debit"
                value={debitDescription}
                onChange={(e) => setDebitDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDebitDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDebitWallet}
              disabled={debiting || !debitAmount || parseFloat(debitAmount) <= 0}
              className="gap-2"
              variant="destructive"
            >
              {debiting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <DollarSign className="h-4 w-4" />
              )}
              {debiting ? 'Processing...' : 'Debit Wallet'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Investor Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Investor</DialogTitle>
            <DialogDescription>
              Create a new investor account. Credentials will be sent via email.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="John Doe"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                placeholder="+1234567890"
                value={createForm.phone}
                onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to auto-generate"
                value={createForm.password}
                onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                If left blank, a secure password will be generated and emailed to the user.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateUser}
              disabled={creating || !createForm.name || !createForm.email}
              className="gap-2"
            >
              {creating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {creating ? 'Creating...' : 'Create Investor'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Share Dialog */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Shares (Legacy)</DialogTitle>
            <DialogDescription>
              Manually assign shares to {selectedInvestor?.name} without wallet deduction.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="share">Select Share *</Label>
              <Select
                value={assignForm.share_id}
                onValueChange={(val) => setAssignForm({ ...assignForm, share_id: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a share" />
                </SelectTrigger>
                <SelectContent>
                  {shares.map((share) => (
                    <SelectItem key={share.id} value={share.id.toString()}>
                      {share.name} ({formatCurrency(parseFloat(share.price_per_share))})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="Number of shares"
                value={assignForm.quantity}
                onChange={(e) => setAssignForm({ ...assignForm, quantity: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="purchase-date">Purchase Date (Optional)</Label>
              <Input
                id="purchase-date"
                type="date"
                value={assignForm.purchase_date}
                onChange={(e) => setAssignForm({ ...assignForm, purchase_date: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">Original investment date for legacy records.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignShare}
              disabled={assigning || !assignForm.share_id || !assignForm.quantity}
              className="gap-2"
            >
              {assigning ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              {assigning ? 'Assigning...' : 'Assign Shares'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
