import apiClient, { ApiResponse, PaginatedResponse } from '../client'

// ===========================
// Type Definitions
// ===========================

export interface User {
  id: number
  name: string
  email: string
  role: 'admin' | 'user'
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface UserWithStats extends User {
  total_investments: number
  active_investments: number
  total_invested: number
  total_shares: number
  total_profits: number
  pending_profits: number
  wallet_balance?: number
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  newUsersThisMonth: number
  totalInvested: number
  totalProfits: number
}

// ===========================
// API Service Functions
// ===========================

/**
 * Get all users with pagination (admin only)
 */
export const getUsers = async (
  page: number = 1,
  perPage: number = 20,
  filters?: {
    role?: string
    is_active?: boolean
    search?: string
  }
): Promise<PaginatedResponse<UserWithStats>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        params.append(key, value.toString())
      }
    })
  }

  const response = await apiClient.get<PaginatedResponse<UserWithStats>>(
    `/v1/admin/users?${params}`
  )
  return response.data
}

/**
 * Get single user details (admin only)
 */
export const getUser = async (id: number): Promise<ApiResponse<UserWithStats>> => {
  const response = await apiClient.get<ApiResponse<UserWithStats>>(
    `/v1/admin/users/${id}`
  )
  return response.data
}

/**
 * Create a new user (admin only)
 */
export const createUser = async (
  data: {
    name: string
    email: string
    role: 'admin' | 'user'
    password?: string
    is_active?: boolean
  }
): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>(
    '/v1/admin/users',
    data
  )
  return response.data
}

/**
 * Update user (admin only)
 */
export const updateUser = async (
  id: number,
  data: Partial<{
    name: string
    email: string
    is_active: boolean
  }>
): Promise<ApiResponse<User>> => {
  const response = await apiClient.put<ApiResponse<User>>(
    `/v1/admin/users/${id}`,
    data
  )
  return response.data
}

/**
 * Delete user (admin only)
 */
export const deleteUser = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/v1/admin/users/${id}`
  )
  return response.data
}

/**
 * Toggle user active status (admin only)
 */
export const toggleUserStatus = async (id: number): Promise<ApiResponse<User>> => {
  const response = await apiClient.post<ApiResponse<User>>(
    `/v1/admin/users/${id}/toggle-status`
  )
  return response.data
}

/**
 * Get user statistics (admin only)
 */
export const getUserStatistics = async (): Promise<ApiResponse<UserStatistics>> => {
  const response = await apiClient.get<ApiResponse<UserStatistics>>(
    '/v1/admin/dashboard/statistics/users'
  )
  return response.data
}

// ===========================
// Helper Functions
// ===========================

/**
 * Format currency - uses cached settings from @/lib/utils
 */
import { formatCurrency } from '@/lib/utils'
export { formatCurrency }

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

/**
 * Get status color
 */
export const getStatusColor = (isActive: boolean): string => {
  return isActive ? 'success' : 'secondary'
}

/**
 * Get role badge variant
 */
export const getRoleBadgeVariant = (role: string): string => {
  return role === 'admin' ? 'default' : 'outline'
}

const userService = {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  toggleUserStatus,
  getUserStatistics,
  formatCurrency,
  getInitials,
  getStatusColor,
  getRoleBadgeVariant,
}

export default userService
