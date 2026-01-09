'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react'
import { handlePaymentCallback } from '@/lib/api/services/paystack.service'
import investmentService from '@/lib/api/services/investment.service'

type PaymentStatus = 'verifying' | 'purchasing' | 'success' | 'failed' | 'error'

export default function SharePaymentCallbackPage() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [status, setStatus] = useState<PaymentStatus>('verifying')
    const [message, setMessage] = useState('')

    useEffect(() => {
        const processPayment = async () => {
            // Get reference from URL parameters
            const reference = searchParams.get('reference') || searchParams.get('trxref')
            const shareId = searchParams.get('share_id')
            const quantity = searchParams.get('quantity')

            if (!reference) {
                setStatus('error')
                setMessage('Payment reference not found')
                return
            }

            try {
                // Verify the payment with Paystack
                const result = await handlePaymentCallback(reference)

                if (result.success) {
                    setStatus('purchasing')
                    setMessage('Payment verified! Processing your share purchase...')

                    // Get stored purchase info
                    const storedPurchase = localStorage.getItem('pending_share_purchase')
                    let purchaseInfo = { share_id: 0, quantity: 1 }

                    if (storedPurchase) {
                        purchaseInfo = JSON.parse(storedPurchase)
                        localStorage.removeItem('pending_share_purchase')
                    } else if (shareId && quantity) {
                        purchaseInfo = {
                            share_id: parseInt(shareId),
                            quantity: parseInt(quantity),
                        }
                    }

                    if (!purchaseInfo.share_id) {
                        setStatus('error')
                        setMessage('Share purchase information not found. Please contact support.')
                        return
                    }

                    // Complete the share purchase using the payment reference
                    await investmentService.buyShares({
                        share_id: purchaseInfo.share_id,
                        quantity: purchaseInfo.quantity,
                        payment_reference: reference,
                        payment_method: 'paystack',
                    })

                    setStatus('success')
                    setMessage('Your share purchase has been completed successfully!')
                } else {
                    setStatus('failed')
                    setMessage(result.message || 'Payment verification failed')
                }
            } catch (error: any) {
                console.error('Payment processing error:', error)
                setStatus('error')
                setMessage(error.response?.data?.message || error.message || 'Failed to process payment')
            }
        }

        processPayment()
    }, [searchParams])

    const handleContinue = () => {
        router.push('/dashboard/investments')
    }

    const handleRetry = () => {
        router.push('/dashboard/shares')
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

                    {status === 'purchasing' && (
                        <>
                            <div className="mx-auto mb-4">
                                <Loader2 className="h-16 w-16 animate-spin text-success" />
                            </div>
                            <CardTitle className="text-success">Payment Verified!</CardTitle>
                            <CardDescription>
                                {message}
                            </CardDescription>
                        </>
                    )}

                    {status === 'success' && (
                        <>
                            <div className="mx-auto mb-4">
                                <CheckCircle className="h-16 w-16 text-success" />
                            </div>
                            <CardTitle className="text-success">Purchase Successful!</CardTitle>
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
                            <CardTitle className="text-warning">Something Went Wrong</CardTitle>
                            <CardDescription>
                                {message}
                            </CardDescription>
                        </>
                    )}
                </CardHeader>

                <CardContent>
                    {status !== 'verifying' && status !== 'purchasing' && (
                        <div className="flex flex-col gap-2">
                            {status === 'success' && (
                                <Button onClick={handleContinue} className="w-full">
                                    View My Investments
                                </Button>
                            )}

                            {(status === 'failed' || status === 'error') && (
                                <>
                                    <Button onClick={handleRetry} className="w-full">
                                        Back to Shares
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
