import apiClient, { ApiResponse } from '../client'
import { isWebView, getPaymentCallbackUrl, openExternalUrl } from '@/lib/webview'

// ===========================
// Type Definitions
// ===========================

export interface PaystackInitResponse {
  authorization_url: string
  access_code: string
  reference: string
  funding_request_id: number
}

export interface PaystackVerifyResponse {
  status: string
  message: string
  funding_request: any
  transaction?: any
  new_balance?: number
}

// ===========================
// API Service Functions
// ===========================

/**
 * Get Paystack public key
 */
export const getPublicKey = async (): Promise<ApiResponse<{ public_key: string }>> => {
  const response = await apiClient.get('/v1/paystack/public-key')
  return response.data
}

/**
 * Initialize a Paystack payment
 * @param amount - Amount in main currency unit (e.g., NGN)
 * @param callbackUrl - URL to redirect after payment (optional, defaults to current page)
 */
export const initializePayment = async (
  amount: number,
  callbackUrl?: string
): Promise<ApiResponse<PaystackInitResponse>> => {
  // Build callback URL with proper handling for WebView
  let finalCallbackUrl = callbackUrl

  if (!finalCallbackUrl && typeof window !== 'undefined') {
    // Default to wallet page payment callback route
    const baseUrl = `${window.location.origin}/dashboard/wallet/payment-callback`
    finalCallbackUrl = baseUrl
  }

  const response = await apiClient.post<ApiResponse<PaystackInitResponse>>(
    '/v1/paystack/initialize',
    {
      amount,
      callback_url: finalCallbackUrl,
    }
  )
  return response.data
}

/**
 * Verify a Paystack payment
 */
export const verifyPayment = async (
  reference: string
): Promise<ApiResponse<PaystackVerifyResponse>> => {
  const response = await apiClient.get<ApiResponse<PaystackVerifyResponse>>(
    `/v1/paystack/verify/${reference}`
  )
  return response.data
}

/**
 * Open Paystack payment
 * Uses redirect for WebView, popup for regular browser
 */
export const openPaystackPayment = async (config: {
  publicKey: string
  email: string
  amount: number // in main currency unit (e.g., NGN)
  reference: string
  callbackUrl?: string
  onSuccess?: (reference: string) => void
  onClose?: () => void
}): Promise<void> => {
  // Check if we're in WebView
  if (isWebView()) {
    // In WebView: Use redirect method instead of popup
    const response = await initializePayment(config.amount, config.callbackUrl)

    if (response.success && response.data?.authorization_url) {
      // Redirect to Paystack checkout page
      openExternalUrl(response.data.authorization_url, {
        target: '_self',
        returnUrl: config.callbackUrl,
      })
    } else {
      throw new Error('Failed to initialize payment')
    }
  } else {
    // In regular browser: Use popup method
    openPaystackPopup(config)
  }
}

/**
 * Open Paystack payment in popup (browser only)
 * @deprecated Use openPaystackPayment instead for WebView compatibility
 */
export const openPaystackPopup = (config: {
  publicKey: string
  email: string
  amount: number // in main currency unit (e.g., NGN)
  reference: string
  onSuccess?: (reference: string) => void
  onClose?: () => void
}) => {
  // This function should only be called on the client side
  if (typeof window === 'undefined') {
    console.error('Paystack popup can only be opened in browser')
    return
  }

  // Check if Paystack script is loaded
  const PaystackPop = (window as any).PaystackPop
  if (!PaystackPop) {
    console.error('Paystack script not loaded. Please add the Paystack script to your page.')
    return
  }

  const handler = PaystackPop.setup({
    key: config.publicKey,
    email: config.email,
    amount: config.amount * 100, // Convert to kobo/cents
    ref: config.reference,
    onClose: config.onClose,
    callback: (response: { reference: string }) => {
      config.onSuccess?.(response.reference)
    },
  })

  handler.openIframe()
}

/**
 * Handle payment callback (for redirect-based payments)
 * Call this on the callback page to verify payment
 */
export const handlePaymentCallback = async (reference: string): Promise<{
  success: boolean
  message: string
  data?: PaystackVerifyResponse
}> => {
  try {
    const response = await verifyPayment(reference)

    if (response.success) {
      return {
        success: true,
        message: response.data?.message || 'Payment successful',
        data: response.data,
      }
    } else {
      return {
        success: false,
        message: response.message || 'Payment verification failed',
      }
    }
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to verify payment',
    }
  }
}

export default {
  getPublicKey,
  initializePayment,
  verifyPayment,
  openPaystackPayment,
  openPaystackPopup,
  handlePaymentCallback,
}
