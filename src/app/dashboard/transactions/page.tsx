'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import walletService from '@/lib/api/services/wallet.service'
import investmentService from '@/lib/api/services/investment.service'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Download, 
  Filter,
  CreditCard,
  Wallet,
  Clock,
  Loader2
} from 'lucide-react'

interface Transaction {
  id: number
  type: string
  amount: string | number
  description: string
  status: string
  created_at: string
  reference?: string
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('all')
  const [totalInvested, setTotalInvested] = useState(0)
  const [totalCredits, setTotalCredits] = useState(0)

  useEffect(() => {
    loadTransactions()
  }, [currentPage, filter])

  const loadTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build filter params
      const filters: Record<string, string> = {}
      if (filter !== 'all') {
        filters.type = filter
      }

      // Fetch transactions
      const response = await walletService.getTransactions(currentPage, 20, filters)
      const responseData = response.data as any

      const transactionsData = responseData?.transactions || []
      setTransactions(Array.isArray(transactionsData) ? transactionsData : [])
      setTotalPages(responseData?.pagination?.last_page || 1)

      // Calculate totals
      const purchases = transactionsData.filter((t: Transaction) => 
        t.type === 'purchase' || t.type === 'withdrawal'
      )
      const credits = transactionsData.filter((t: Transaction) => 
        t.type === 'profit_credit' || t.type === 'profit' || t.type === 'deposit'
      )

      setTotalInvested(
        purchases.reduce((sum: number, t: Transaction) => sum + parseFloat(String(t.amount) || '0'), 0)
      )
      setTotalCredits(
        credits.reduce((sum: number, t: Transaction) => sum + parseFloat(String(t.amount) || '0'), 0)
      )
    } catch (err: any) {
      console.error('Failed to load transactions:', err)
      setError(err.response?.data?.message || 'Failed to load transactions')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (value: string) => {
    setFilter(value)
    setCurrentPage(1)
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading transactions...</p>
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
            <Button variant="outline" size="sm" onClick={loadTransactions}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Transactions</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            View all your account activity and transactions
          </p>
        </div>
        <Button variant="outline" className="gap-2 w-full sm:w-auto">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Invested</p>
                <p className="text-lg md:text-xl font-bold">{formatCurrency(totalInvested)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Wallet className="h-4 w-4 md:h-5 md:w-5 text-success" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Profits Received</p>
                <p className="text-lg md:text-xl font-bold text-success">{formatCurrency(totalCredits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg bg-muted flex items-center justify-center">
                <Clock className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Total Transactions</p>
                <p className="text-lg md:text-xl font-bold">{transactions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle className="text-lg md:text-xl">Transaction History</CardTitle>
            <CardDescription className="text-sm">All your account transactions</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={filter} onValueChange={handleFilterChange}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="profit">Profits</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="withdrawal">Withdrawals</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="font-medium">No transactions found</p>
              <p className="text-sm">Your transactions will appear here</p>
            </div>
          ) : (
            <div className="space-y-3 md:space-y-4">
              {transactions.map((transaction) => {
                const amount = parseFloat(String(transaction.amount) || '0')
                const isCredit = transaction.type === 'profit_credit' || 
                                transaction.type === 'profit' || 
                                transaction.type === 'deposit'

                return (
                  <div
                    key={transaction.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 md:p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 md:gap-4">
                      <div
                        className={`h-10 w-10 md:h-12 md:w-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          transaction.type === 'purchase' || transaction.type === 'withdrawal'
                            ? 'bg-primary/10'
                            : isCredit
                            ? 'bg-success/10'
                            : 'bg-muted'
                        }`}
                      >
                        {transaction.type === 'purchase' || transaction.type === 'withdrawal' ? (
                          <ArrowDownRight className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                        ) : isCredit ? (
                          <ArrowUpRight className="h-5 w-5 md:h-6 md:w-6 text-success" />
                        ) : (
                          <Clock className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm md:text-base truncate">
                          {transaction.description || transaction.type.replace('_', ' ')}
                        </p>
                        <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs md:text-sm text-muted-foreground">
                          <span>{formatDate(transaction.created_at)}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="capitalize">{transaction.type.replace('_', ' ')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right sm:text-right pl-13 sm:pl-0">
                      <p
                        className={`text-base md:text-lg font-bold ${
                          isCredit
                            ? 'text-success'
                            : transaction.type === 'purchase' || transaction.type === 'withdrawal'
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {isCredit ? '+' : '-'}
                        {formatCurrency(amount)}
                      </p>
                      <Badge
                        variant={
                          transaction.status === 'completed'
                            ? 'default'
                            : transaction.status === 'pending'
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
