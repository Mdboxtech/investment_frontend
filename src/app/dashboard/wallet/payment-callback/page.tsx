'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { handlePaymentCallback } from '@/lib/api/services/paystack.service'
import { useWebView } from '@/contexts/WebViewContext'

type PaymentStatus = 'verifying' | 'success' | 'failed' | 'error'

export default function PaymentCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isWebView, sendToNativeApp } = useWebView()
  
  const [status, setStatus] = useState<PaymentStatus>('verifying')
  const [message, setMessage] = useState('')
  const [newBalance, setNewBalance] = useState<number | null>(null)

  useEffect(() => {
    const verifyPayment = async () => {
      // Get reference from URL parameters
      const reference = searchParams.get('reference') || searchParams.get('trxref')
      
      if (!reference) {
        setStatus('error')
        setMessage('Payment reference not found')
        return
      }

      try {
        const result = await handlePaymentCallback(reference)
        
        if (result.success) {
          setStatus('success')
          setMessage(result.message)
          setNewBalance(result.data?.new_balance || null)
          
          // Notify native app of successful payment
          if (isWebView) {
            sendToNativeApp('PAYMENT_SUCCESS', {
              reference,
              newBalance: result.data?.new_balance,
            })
          }
        } else {
          setStatus('failed')
          setMessage(result.message)
          
          // Notify native app of failed payment
          if (isWebView) {
            sendToNativeApp('PAYMENT_FAILED', {
              reference,
              message: result.message,
            })
          }
        }
      } catch (error: any) {
        setStatus('error')
        setMessage(error.message || 'Failed to verify payment')
        
        // Notify native app of error
        if (isWebView) {
          sendToNativeApp('PAYMENT_ERROR', {
            message: error.message || 'Failed to verify payment',
          })
        }
      }
    }

    verifyPayment()
  }, [searchParams, isWebView, sendToNativeApp])

  const handleContinue = () => {
    router.push('/dashboard/wallet')
  }

  const handleRetry = () => {
    router.push('/dashboard/wallet')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          {status === 'verifying' && (
            <>
              <div className="mx-auto mb-4">
                <Loader2 className="h-16 w-16 animate-spin text-primary" />
              </div>
              <CardTitle>Verifying Payment</CardTitle>
              <CardDescription>
                Please wait while we confirm your payment...
              </CardDescription>
            </>
          )}
          
          {status === 'success' && (
            <>
              <div className="mx-auto mb-4">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
              <CardTitle className="text-success">Payment Successful!</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}
          
          {status === 'failed' && (
            <>
              <div className="mx-auto mb-4">
                <XCircle className="h-16 w-16 text-destructive" />
              </div>
              <CardTitle className="text-destructive">Payment Failed</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}
          
          {status === 'error' && (
            <>
              <div className="mx-auto mb-4">
                <AlertCircle className="h-16 w-16 text-warning" />
              </div>
              <CardTitle className="text-warning">Verification Error</CardTitle>
              <CardDescription>
                {message}
              </CardDescription>
            </>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {status === 'success' && newBalance !== null && (
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <p className="text-sm text-muted-foreground">New Wallet Balance</p>
              <p className="text-2xl font-bold text-success">
                ₦{newBalance.toLocaleString('en-NG', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}
          
          {status !== 'verifying' && (
            <div className="flex flex-col gap-2">
              {status === 'success' && (
                <Button onClick={handleContinue} className="w-full">
                  Continue to Wallet
                </Button>
              )}
              
              {(status === 'failed' || status === 'error') && (
                <>
                  <Button onClick={handleRetry} className="w-full">
                    Back to Wallet
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => router.push('/dashboard')}
                    className="w-full"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
