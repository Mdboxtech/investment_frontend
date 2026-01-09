'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate, getCurrencySettings } from '@/lib/utils'
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Building,
  Smartphone,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import walletService, { type Wallet as WalletType, type WalletTransaction } from '@/lib/api/services/wallet.service'
import profitService, { type ProfitSummary } from '@/lib/api/services/profit.service'
import investmentService, { type InvestmentSummary } from '@/lib/api/services/investment.service'
import bankAccountService, { type BankAccount } from '@/lib/api/services/bank-account.service'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'

export default function WalletPage() {
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [depositAmount, setDepositAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)

  // Data state
  const [wallet, setWallet] = useState<WalletType | null>(null)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [profitSummary, setProfitSummary] = useState<ProfitSummary | null>(null)
  const [investmentSummary, setInvestmentSummary] = useState<InvestmentSummary | null>(null)
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([])
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState<string | null>(null)
  const [withdrawLoading, setWithdrawLoading] = useState(false)
  const [currencySymbol, setCurrencySymbol] = useState('$')

  useEffect(() => {
    const { symbol } = getCurrencySettings()
    setCurrencySymbol(symbol)
  }, [])
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    loadWalletData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, activeTab])

  const loadWalletData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch wallet and stats in parallel
      const [walletResponse, statsResponse, profitsResponse, investmentsResponse, bankAccountsResponse] = await Promise.all([
        walletService.getWallet().catch(() => ({ data: null })),
        walletService.getStatistics().catch(() => ({ data: null })),
        profitService.getSummary().catch(() => ({ data: null })),
        investmentService.getSummary().catch(() => ({ data: null })),
        bankAccountService.getAccounts().catch(() => ({ data: { accounts: [] } })),
      ])

      setWallet(walletResponse.data ?? null)
      setStatistics(statsResponse.data ?? null)
      setProfitSummary(profitsResponse.data ?? null)
      setInvestmentSummary(investmentsResponse.data ?? null)

      const accounts = bankAccountsResponse.data?.accounts || []
      setBankAccounts(accounts)
      // Set default bank account
      const defaultAccount = accounts.find((a: BankAccount) => a.is_default) || accounts[0] || null
      setSelectedBankAccount(defaultAccount)

      // Fetch transactions based on active tab
      const filters: any = {}
      if (activeTab === 'deposits') filters.type = 'deposit'
      else if (activeTab === 'profits') filters.type = 'profit'
      else if (activeTab === 'purchases') filters.type = 'withdrawal'

      const transactionsResponse = await walletService.getTransactions(currentPage, 10, filters)

      // Handle paginated response structure - backend returns { data: { transactions: [...], pagination: {...} } }
      const responseData = transactionsResponse.data as any
      if (responseData?.transactions && Array.isArray(responseData.transactions)) {
        setTransactions(responseData.transactions)
        setTotalPages(responseData.pagination?.last_page || 1)
      } else {
        setTransactions([])
      }
    } catch (err: any) {
      console.error('Failed to load wallet data:', err)
      setError(err.response?.data?.message || 'Failed to load wallet data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) return

    try {
      setDepositLoading(true)
      setDepositError(null)

      // Import paystack service dynamically to avoid circular deps
      const paystackService = await import('@/lib/api/services/paystack.service')

      // Initialize Paystack payment
      const response = await paystackService.initializePayment(parseFloat(depositAmount))

      if (response.success && response.data?.authorization_url) {
        // Redirect to Paystack checkout page
        window.location.href = response.data.authorization_url
      } else {
        throw new Error(response.message || 'Failed to initialize payment')
      }
    } catch (err: any) {
      console.error('Deposit failed:', err)
      setDepositError(err.response?.data?.message || err.message || 'Failed to initialize payment. Please try again.')
      setDepositLoading(false)
    }
    // Note: Don't set depositLoading to false on success - we're redirecting
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) return
    if (!selectedBankAccount) {
      setWithdrawError('Please select a bank account or add one first')
      return
    }

    try {
      setWithdrawLoading(true)
      setWithdrawError(null)

      // Use Paystack transfer for Nigerian accounts
      if (selectedBankAccount.account_type === 'nigerian') {
        await bankAccountService.initiateTransfer({
          amount: parseFloat(withdrawAmount),
          bank_account_id: selectedBankAccount.id,
          reason: 'Wallet withdrawal',
        })
      } else {
        // For international accounts, use the existing wallet withdraw (manual processing)
        await walletService.withdraw({
          amount: parseFloat(withdrawAmount),
        })
      }

      setWithdrawSuccess(true)
      setTimeout(() => {
        setWithdrawSuccess(false)
        setShowWithdrawDialog(false)
        setWithdrawAmount('')
        loadWalletData() // Reload wallet data
      }, 2000)
    } catch (err: any) {
      console.error('Withdrawal failed:', err)
      setWithdrawError(err.response?.data?.message || 'Withdrawal failed. Please try again.')
    } finally {
      setWithdrawLoading(false)
    }
  }

  const quickAmounts = [100, 500, 1000, 5000, 10000, 20000, 50000, 100000]

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading your wallet...</p>
        </div>
      </div>
    )
  }

  const walletBalance = wallet?.available_balance || 0
  const pendingBalance = wallet?.pending_balance || 0
  const totalBalance = wallet?.balance || 0
  const pendingProfits = profitSummary?.pending_profits || 0
  const totalDeposited = statistics?.total_deposited || 0
  const totalWithdrawn = statistics?.total_withdrawn || 0
  const profitsReceived = profitSummary?.net_earnings || 0
  const totalInvested = investmentSummary?.total_invested || 0

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={loadWalletData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}
      {/* Page Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Wallet</h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Manage your wallet balance, add funds, and track transactions
        </p>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main Balance */}
        <Card className="lg:col-span-2 bg-gradient-to-br from-success/10 via-success/5 to-transparent border-success/20">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="h-12 w-12 md:h-16 md:w-16 rounded-2xl bg-success/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6 md:h-8 md:w-8 text-success" />
                </div>
                <div>
                  <p className="text-xs md:text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl md:text-4xl font-bold text-success">{walletService.formatCurrency(walletBalance)}</p>
                  <p className="text-xs md:text-sm text-muted-foreground mt-1">Ready to invest</p>
                </div>
              </div>
              <div className="flex gap-2 md:gap-3">
                <Button
                  className="gap-2 bg-success hover:bg-success/90"
                  onClick={() => setShowDepositDialog(true)}
                >
                  <Plus className="h-4 w-4" />
                  Add Funds
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 border-success/30 text-success hover:bg-success/10"
                  onClick={() => setShowWithdrawDialog(true)}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  Withdraw
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pending Profits */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-warning/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Profits</p>
                <p className="text-2xl font-bold text-warning">{walletService.formatCurrency(pendingProfits)}</p>
                <p className="text-xs text-muted-foreground">Awaiting distribution</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Deposited</p>
              <p className="text-base md:text-lg font-semibold">{walletService.formatCurrency(totalDeposited)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 md:h-5 md:w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Profits Received</p>
              <p className="text-base md:text-lg font-semibold text-success">{walletService.formatCurrency(profitsReceived)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ArrowUpRight className="h-4 w-4 md:h-5 md:w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-base md:text-lg font-semibold">{walletService.formatCurrency(totalInvested)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4 flex items-center gap-2 md:gap-3">
            <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-muted flex items-center justify-center">
              <ArrowDownRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Withdrawn</p>
              <p className="text-base md:text-lg font-semibold">{walletService.formatCurrency(totalWithdrawn)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Recent wallet transactions and profit credits</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="profits">Profits</TabsTrigger>
              <TabsTrigger value="purchases">Withdrawals</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 space-y-3">
              {transactions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <p className="text-sm mt-1">Your wallet transactions will appear here</p>
                </div>
              ) : (
                <>
                  {transactions.map((transaction) => {
                    const typeInfo = walletService.getTypeInfo(transaction.type)
                    const statusColor = walletService.getStatusColor(transaction.status)

                    return (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 sm:p-4 rounded-lg bg-muted/50 gap-2"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div
                            className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 bg-${typeInfo.color}/10`}
                          >
                            {typeInfo.icon === 'up' ? (
                              <ArrowUpRight className={`h-4 w-4 sm:h-5 sm:w-5 text-${typeInfo.color}`} />
                            ) : typeInfo.icon === 'down' ? (
                              <ArrowDownRight className={`h-4 w-4 sm:h-5 sm:w-5 text-${typeInfo.color}`} />
                            ) : (
                              <DollarSign className={`h-4 w-4 sm:h-5 sm:w-5 text-${typeInfo.color}`} />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm sm:text-base truncate">
                              {transaction.description || typeInfo.label}
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                              {formatDate(transaction.created_at)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p
                            className={`font-semibold text-sm sm:text-base ${transaction.type === 'deposit' || transaction.type === 'profit'
                              ? 'text-success'
                              : transaction.type === 'withdrawal'
                                ? 'text-destructive'
                                : ''
                              }`}
                          >
                            {transaction.type === 'deposit' || transaction.type === 'profit' ? '+' : '-'}
                            {walletService.formatCurrency(transaction.amount)}
                          </p>
                          <Badge
                            variant={
                              transaction.status === 'completed'
                                ? 'default'
                                : transaction.status === 'pending'
                                  ? 'secondary'
                                  : 'destructive'
                            }
                            className="text-[10px] sm:text-xs"
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
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
        </CardContent>
      </Card>

      {/* Add Funds Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="sm:max-w-md">
          {depositSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Deposit Initiated!</h3>
              <p className="text-muted-foreground text-center">
                Your deposit of {walletService.formatCurrency(parseFloat(depositAmount) || 0)} is being processed.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
                <DialogDescription>
                  Choose an amount and payment method to add funds to your wallet
                </DialogDescription>
              </DialogHeader>

              {depositError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{depositError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6 py-4">
                {/* Quick Amount Selection */}
                <div className="space-y-2">
                  <Label className="text-sm">Quick Select</Label>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 sm:gap-2">
                    {quickAmounts.map((amount) => (
                      <Button
                        key={amount}
                        variant={depositAmount === amount.toString() ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setDepositAmount(amount.toString())}
                        className="text-xs sm:text-sm px-1 sm:px-3"
                      >
                        {amount >= 1000 ? `${amount / 1000}K` : amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="space-y-2">
                  <Label>Or Enter Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>

                {/* Payment Methods */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-3 p-3 rounded-lg border-2 border-primary bg-primary/5 cursor-pointer">
                      <CreditCard className="h-5 w-5 text-primary" />
                      <div className="flex-1">
                        <p className="font-medium">Card Payment</p>
                        <p className="text-xs text-muted-foreground">Visa, Mastercard, Verve</p>
                      </div>
                      <Badge>Recommended</Badge>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">Bank Transfer</p>
                        <p className="text-xs text-muted-foreground">Direct bank transfer</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50">
                      <Smartphone className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium">USSD</p>
                        <p className="text-xs text-muted-foreground">Pay via USSD code</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowDepositDialog(false)} disabled={depositLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleDeposit}
                  disabled={!depositAmount || parseFloat(depositAmount) <= 0 || depositLoading}
                  className="gap-2"
                >
                  {depositLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay {depositAmount ? walletService.formatCurrency(parseFloat(depositAmount)) : walletService.formatCurrency(0)}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md">
          {withdrawSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Withdrawal Initiated!</h3>
              <p className="text-muted-foreground text-center">
                Your withdrawal of {walletService.formatCurrency(parseFloat(withdrawAmount) || 0)} is being processed.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Withdraw Funds</DialogTitle>
                <DialogDescription>
                  Enter the amount you want to withdraw to your bank account
                </DialogDescription>
              </DialogHeader>

              {withdrawError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{withdrawError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6 py-4">
                {/* Available Balance */}
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">Available Balance</p>
                  <p className="text-2xl font-bold text-success">{walletService.formatCurrency(walletBalance)}</p>
                </div>

                {/* Withdraw Amount */}
                <div className="space-y-2">
                  <Label>Withdraw Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{currencySymbol}</span>
                    <Input
                      type="number"
                      placeholder="0.00"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      className="pl-8"
                      max={walletBalance}
                    />
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    className="px-0 text-primary"
                    onClick={() => setWithdrawAmount(walletBalance.toString())}
                  >
                    Withdraw All
                  </Button>
                </div>

                {/* Bank Account Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Bank Account</Label>
                    <Link href="/dashboard/settings/bank-accounts" className="text-sm text-primary hover:underline">
                      Manage Accounts
                    </Link>
                  </div>

                  {bankAccounts.length === 0 ? (
                    <div className="p-4 rounded-lg border-2 border-dashed text-center">
                      <p className="text-sm text-muted-foreground mb-2">No bank accounts saved</p>
                      <Link href="/dashboard/settings/bank-accounts">
                        <Button variant="outline" size="sm">Add Bank Account</Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {bankAccounts.map((account) => (
                        <div
                          key={account.id}
                          onClick={() => setSelectedBankAccount(account)}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedBankAccount?.id === account.id
                            ? 'border-primary bg-primary/5'
                            : 'hover:bg-muted/50'
                            }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{account.bank_name}</p>
                              <p className="text-sm text-muted-foreground">
                                ****{account.account_number.slice(-4)} • {account.account_name}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {account.is_default && (
                                <Badge variant="secondary" className="text-xs">Default</Badge>
                              )}
                              <Badge variant={account.account_type === 'nigerian' ? 'default' : 'outline'} className="text-xs">
                                {account.account_type === 'nigerian' ? 'NGN' : 'International'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Processing Time */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                  <Clock className="h-4 w-4 mt-0.5" />
                  <p>
                    {selectedBankAccount?.account_type === 'nigerian'
                      ? 'Nigerian bank transfers are typically processed instantly or within minutes.'
                      : 'International withdrawals require manual review and may take 3-5 business days.'}
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setShowWithdrawDialog(false)} disabled={withdrawLoading}>
                  Cancel
                </Button>
                <Button
                  onClick={handleWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0 || parseFloat(withdrawAmount) > walletBalance || withdrawLoading}
                  className="gap-2"
                >
                  {withdrawLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <ArrowUpRight className="h-4 w-4" />
                      Withdraw {withdrawAmount ? walletService.formatCurrency(parseFloat(withdrawAmount)) : '$0.00'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
