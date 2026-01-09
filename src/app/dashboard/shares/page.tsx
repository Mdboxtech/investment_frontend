'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { TrendingUp, Minus, Plus, CheckCircle, AlertCircle, Wallet, CreditCard, Loader2, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import investmentService, { type Share } from '@/lib/api/services/investment.service'
import walletService, { type Wallet as WalletType } from '@/lib/api/services/wallet.service'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function SharesPage() {
  const [selectedShare, setSelectedShare] = useState<Share | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [showSuccess, setShowSuccess] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'paystack'>('wallet')

  // Data state
  const [shares, setShares] = useState<Share[]>([])
  const [wallet, setWallet] = useState<WalletType | null>(null)

  // UI state
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [purchaseLoading, setPurchaseLoading] = useState(false)
  const [purchaseError, setPurchaseError] = useState<string | null>(null)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const walletBalance = wallet?.available_balance || 0

  useEffect(() => {
    loadData()
  }, [currentPage])

  const loadData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [sharesResponse, walletResponse] = await Promise.all([
        investmentService.getShares(currentPage, 9),
        walletService.getWallet().catch(() => ({ data: null })),
      ])

      // Backend returns { data: { shares: [...], pagination: {...} } }
      const responseData = sharesResponse.data as any
      if (responseData?.shares && Array.isArray(responseData.shares)) {
        setShares(responseData.shares)
        setTotalPages(responseData.pagination?.last_page || 1)
      } else {
        setShares([])
      }

      setWallet(walletResponse.data ?? null)
    } catch (err: any) {
      console.error('Failed to load shares:', err)
      setError(err.response?.data?.message || 'Failed to load shares. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!selectedShare) return

    try {
      setPurchaseLoading(true)
      setPurchaseError(null)

      if (paymentMethod === 'wallet') {
        // Pay with wallet balance
        await investmentService.buyShares({
          share_id: selectedShare.id,
          quantity: quantity,
        })

        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          setSelectedShare(null)
          setQuantity(1)
          setPaymentMethod('wallet')
          loadData() // Reload data to update wallet balance and share availability
        }, 2000)
      } else {
        // Pay with Paystack - redirect to payment page
        const paystackService = await import('@/lib/api/services/paystack.service')

        // Initialize payment with the total cost and callback to investment purchase
        const callbackUrl = `${window.location.origin}/dashboard/shares/payment-callback?share_id=${selectedShare.id}&quantity=${quantity}`
        const response = await paystackService.initializePayment(totalCost, callbackUrl)

        if (response.success && response.data?.authorization_url) {
          // Store pending purchase info in localStorage for callback
          localStorage.setItem('pending_share_purchase', JSON.stringify({
            share_id: selectedShare.id,
            quantity: quantity,
            amount: totalCost,
            reference: response.data.reference,
          }))

          // Redirect to Paystack checkout
          window.location.href = response.data.authorization_url
        } else {
          throw new Error(response.message || 'Failed to initialize payment')
        }
      }
    } catch (err: any) {
      console.error('Purchase failed:', err)
      setPurchaseError(
        err.response?.data?.message || err.message ||
        'Purchase failed. Please check your balance and try again.'
      )
      setPurchaseLoading(false)
    }
    // Note: Don't set purchaseLoading to false on Paystack success - we're redirecting
  }

  const totalCost = selectedShare ? parseFloat(selectedShare.price_per_share || '0') * quantity : 0
  const canPayWithWallet = walletBalance >= totalCost

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading available shares...</p>
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
            <Button variant="outline" size="sm" onClick={loadData}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Buy Shares</h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Browse available shares and invest in your future
          </p>
        </div>
        {/* Wallet Balance Card */}
        <Card className="bg-gradient-to-r from-success/10 to-success/5 border-success/20" data-tour="wallet-display">
          <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-success/20 flex items-center justify-center">
                <Wallet className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Wallet Balance</p>
                <p className="text-xl font-bold text-success">{walletService.formatCurrency(walletBalance)}</p>
              </div>
            </div>
            <Link href="/dashboard/wallet" className="w-full sm:w-auto sm:ml-auto">
              <Button variant="outline" size="sm" className="w-full sm:w-auto border-success/30 text-success hover:bg-success/10">
                Add Funds
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Available Shares Grid */}
      {shares.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TrendingUp className="h-12 w-12 mb-4 text-muted-foreground opacity-50" />
            <p className="text-lg font-medium text-muted-foreground">No shares available</p>
            <p className="text-sm text-muted-foreground mt-1">Check back later for new investment opportunities</p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" data-tour="shares-grid">
            {shares.map((share, index) => {
              const soldPercentage = share.percentage_sold || 0
              const isSoldOut = share.is_sold_out || !share.is_active

              return (
                <Card
                  key={share.id}
                  className={`card-hover ${isSoldOut ? 'opacity-60' : ''}`}
                  data-tour={index === 0 ? 'share-card-detail' : undefined}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      {share.logo_url ? (
                        <img src={share.logo_url} alt={share.name} className="h-12 w-12 rounded-lg object-cover" />
                      ) : (
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <Badge
                        variant={isSoldOut ? 'secondary' : share.is_featured ? 'default' : 'outline'}
                        data-tour={index === 0 ? 'share-status-badge' : undefined}
                      >
                        {isSoldOut ? 'Sold Out' : share.is_featured ? 'Featured' : 'Active'}
                      </Badge>
                    </div>
                    <CardTitle className="mt-4">{share.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {share.description || 'Investment opportunity'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between" data-tour={index === 0 ? 'share-price' : undefined}>
                      <span className="text-sm text-muted-foreground">Price per Share</span>
                      <span className="text-2xl font-bold text-primary">
                        {formatCurrency(parseFloat(share.price_per_share || '0'))}
                      </span>
                    </div>
                    <div className="space-y-2" data-tour={index === 0 ? 'share-availability' : undefined}>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Availability</span>
                        <span>
                          {formatNumber(share.available_shares || 0)} / {formatNumber(share.total_shares || 0)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${soldPercentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground text-right">
                        {soldPercentage.toFixed(1)}% sold
                      </p>
                    </div>
                    {share.expected_roi_percentage && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Est. ROI</span>
                        <span className="text-success font-medium">{share.expected_roi_percentage}%</span>
                      </div>
                    )}
                    {share.investment_duration_months && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Maturity</span>
                        <span>{share.investment_duration_months} months</span>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={isSoldOut}
                      onClick={() => {
                        setSelectedShare(share)
                        setQuantity(1)
                        setPurchaseError(null)
                      }}
                      data-tour={index === 0 ? 'buy-button' : undefined}
                    >
                      {isSoldOut ? 'Sold Out' : 'Buy Shares'}
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

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

      {/* Purchase Dialog */}
      <Dialog open={!!selectedShare} onOpenChange={() => setSelectedShare(null)}>
        <DialogContent className="sm:max-w-md">
          {showSuccess ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Purchase Successful!</h3>
              <p className="text-muted-foreground text-center">
                You have successfully purchased {quantity} shares of {selectedShare?.name}
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Purchase {selectedShare?.name}</DialogTitle>
                <DialogDescription>
                  Enter the number of shares you want to purchase
                </DialogDescription>
              </DialogHeader>

              {purchaseError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{purchaseError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-6 py-4">
                {/* Quantity Selector */}
                <div className="space-y-2">
                  <Label>Number of Shares</Label>
                  <div className="flex items-center gap-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <Input
                      type="number"
                      value={quantity}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0
                        setQuantity(
                          Math.max(
                            1,
                            Math.min(selectedShare?.available_shares || 100, val)
                          )
                        )
                      }}
                      className="text-center w-24"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() =>
                        setQuantity(
                          Math.min(
                            selectedShare?.available_shares || 100,
                            quantity + 1
                          )
                        )
                      }
                      disabled={quantity >= (selectedShare?.available_shares || 0)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Available: {selectedShare?.available_shares} shares
                  </p>
                </div>

                {/* Price Summary */}
                <Card className="bg-muted/50">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Price per Share</span>
                      <span>{formatCurrency(parseFloat(selectedShare?.price_per_share || '0'))}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Quantity</span>
                      <span>× {quantity}</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between">
                      <span className="font-semibold">Total Cost</span>
                      <span className="text-xl font-bold text-primary">
                        {formatCurrency(totalCost)}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                {/* Payment Method Selection */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'wallet' | 'paystack')}>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${paymentMethod === 'wallet' ? 'border-success bg-success/5' : 'border-muted'} ${!canPayWithWallet ? 'opacity-50' : 'cursor-pointer'}`}>
                      <RadioGroupItem value="wallet" id="wallet" disabled={!canPayWithWallet} />
                      <Label htmlFor="wallet" className={`flex-1 flex items-center justify-between ${canPayWithWallet ? 'cursor-pointer' : ''}`}>
                        <div className="flex items-center gap-2">
                          <Wallet className="h-4 w-4 text-success" />
                          <span>Pay with Wallet</span>
                        </div>
                        <div className="text-right">
                          <p className={`text-sm font-medium ${canPayWithWallet ? 'text-success' : 'text-destructive'}`}>
                            {formatCurrency(walletBalance)}
                          </p>
                          {!canPayWithWallet && (
                            <p className="text-xs text-destructive">Insufficient balance</p>
                          )}
                        </div>
                      </Label>
                    </div>
                    <div className={`flex items-center space-x-3 p-3 rounded-lg border-2 transition-colors ${paymentMethod === 'paystack' ? 'border-primary bg-primary/5' : 'border-muted'} cursor-pointer`}>
                      <RadioGroupItem value="paystack" id="paystack" />
                      <Label htmlFor="paystack" className="flex-1 flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" />
                          <span>Pay with Paystack</span>
                        </div>
                        <Badge variant="outline" className="text-xs">Card/Bank/Transfer</Badge>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Warning */}
                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-warning/10 p-3 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-warning mt-0.5" />
                  <p>
                    Investment involves risk. Please read all terms and conditions before proceeding.
                  </p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setSelectedShare(null)}
                  disabled={purchaseLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  className="gap-2"
                  disabled={purchaseLoading || (!canPayWithWallet && paymentMethod === 'wallet')}
                >
                  {purchaseLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : paymentMethod === 'wallet' ? (
                    <>
                      <Wallet className="h-4 w-4" />
                      Pay {formatCurrency(totalCost)}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4" />
                      Pay with Paystack
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
