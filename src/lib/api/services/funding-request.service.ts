import apiClient, { ApiResponse, PaginatedResponse } from '../client'

// ===========================
// Type Definitions
// ===========================

export interface FundingRequest {
  id: number
  user_id: number
  amount: number
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  payment_method: 'paystack' | 'bank_transfer' | 'manual' | null
  payment_reference: string | null
  description: string | null
  admin_notes: string | null
  processed_by: number | null
  processed_at: string | null
  metadata: Record<string, any> | null
  created_at: string
  updated_at: string
  user?: {
    id: number
    name: string
    email: string
  }
  processor?: {
    id: number
    name: string
  }
}

export interface CreateFundingRequestData {
  amount: number
  payment_method?: 'paystack' | 'bank_transfer' | 'manual'
  description?: string
}

export interface FundingRequestSummary {
  pending: number
  approved: number
  total_pending_amount: number
}

// ===========================
// API Service Functions
// ===========================

/**
 * Get user's funding requests
 */
export const getFundingRequests = async (
  page: number = 1,
  perPage: number = 15
): Promise<ApiResponse<{ requests: FundingRequest[]; pagination: any }>> => {
  const response = await apiClient.get(
    `/v1/funding-requests?page=${page}&per_page=${perPage}`
  )
  return response.data
}

/**
 * Create a new funding request
 */
export const createFundingRequest = async (
  data: CreateFundingRequestData
): Promise<ApiResponse<FundingRequest>> => {
  const response = await apiClient.post<ApiResponse<FundingRequest>>(
    '/v1/funding-requests',
    data
  )
  return response.data
}

/**
 * Cancel a pending funding request
 */
export const cancelFundingRequest = async (
  id: number
): Promise<ApiResponse<FundingRequest>> => {
  const response = await apiClient.post<ApiResponse<FundingRequest>>(
    `/v1/funding-requests/${id}/cancel`
  )
  return response.data
}

// ===========================
// Admin Functions
// ===========================

/**
 * Admin: Get all funding requests
 */
export const adminGetFundingRequests = async (
  page: number = 1,
  perPage: number = 15,
  status?: string
): Promise<ApiResponse<{ requests: FundingRequest[]; pagination: any; summary: FundingRequestSummary }>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })
  if (status && status !== 'all') {
    params.append('status', status)
  }
  const response = await apiClient.get(`/v1/admin/funding-requests?${params}`)
  return response.data
}

/**
 * Admin: Approve funding request
 */
export const approveFundingRequest = async (
  id: number,
  notes?: string
): Promise<ApiResponse<{ funding_request: FundingRequest; transaction: any }>> => {
  const response = await apiClient.post(
    `/v1/admin/funding-requests/${id}/approve`,
    { notes }
  )
  return response.data
}

/**
 * Admin: Reject funding request
 */
export const rejectFundingRequest = async (
  id: number,
  notes: string
): Promise<ApiResponse<FundingRequest>> => {
  const response = await apiClient.post<ApiResponse<FundingRequest>>(
    `/v1/admin/funding-requests/${id}/reject`,
    { notes }
  )
  return response.data
}

// Default export
const fundingRequestService = {
  getFundingRequests,
  createFundingRequest,
  cancelFundingRequest,
  adminGetFundingRequests,
  approveFundingRequest,
  rejectFundingRequest,
}

export default fundingRequestService
