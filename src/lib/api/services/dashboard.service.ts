import apiClient from '../client'

// ===========================
// Type Definitions
// ===========================

export interface AdminDashboardSummary {
  totalInvestedCapital: number
  totalSharesSold: number
  activeInvestorsCount: number
  totalProfitGenerated: number
  totalProfitDistributed: number
  pendingDistributions: number
  availablePoolBalance: number
}

export interface InvestmentPool {
  totalInvested: number
  totalProfit: number
  availableBalance: number
  totalShares: number
  activeInvestors: number
}

export interface MonthlyProfitRecord {
  id: number
  month: number
  year: number
  totalProfit: number
  profitPercentage: number
  status: 'draft' | 'published' | 'locked'
  createdAt: string
}

export interface PendingDistribution {
  id: number
  userName: string
  month: number
  year: number
  sharesOwned: number
  profitAmount: number
  status: 'pending' | 'distributed'
}

export interface UserStatistics {
  totalUsers: number
  activeUsers: number
  newUsersThisMonth: number
  inactiveUsers: number
}

export interface InvestmentStatistics {
  totalInvestments: number
  activeInvestments: number
  completedInvestments: number
  totalValue: number
}

export interface WalletStatistics {
  totalDeposits: number
  totalWithdrawals: number
  pendingWithdrawals: number
  availableBalance: number
}

export interface ShareStatistics {
  totalShares: number
  activeShares: number
  soldShares: number
  availableShares: number
}

export interface ProfitStatistics {
  totalProfit: number
  distributedProfit: number
  pendingProfit: number
  averageROI: number
}

export interface RecentActivity {
  id: number
  type: 'investment' | 'withdrawal' | 'deposit' | 'profit'
  description: string
  amount?: number
  user?: string
  timestamp: string
}

export interface PendingAction {
  id: number
  type: 'withdrawal' | 'investment' | 'verification'
  description: string
  priority: 'low' | 'medium' | 'high'
  timestamp: string
}

// ===========================
// API Service Functions
// ===========================

/**
 * Get admin dashboard overview
 */
export const getDashboardOverview = async (): Promise<AdminDashboardSummary> => {
  const response = await apiClient.get<AdminDashboardSummary>('/v1/admin/dashboard/overview')
  return response.data
}

/**
 * Get user statistics
 */
export const getUserStatistics = async (): Promise<UserStatistics> => {
  const response = await apiClient.get<UserStatistics>('/v1/admin/dashboard/statistics/users')
  return response.data
}

/**
 * Get investment statistics
 */
export const getInvestmentStatistics = async (): Promise<InvestmentStatistics> => {
  const response = await apiClient.get<InvestmentStatistics>('/v1/admin/dashboard/statistics/investments')
  return response.data
}

/**
 * Get wallet statistics
 */
export const getWalletStatistics = async (): Promise<WalletStatistics> => {
  const response = await apiClient.get<WalletStatistics>('/v1/admin/dashboard/statistics/wallets')
  return response.data
}

/**
 * Get share statistics
 */
export const getShareStatistics = async (): Promise<ShareStatistics> => {
  const response = await apiClient.get<ShareStatistics>('/v1/admin/dashboard/statistics/shares')
  return response.data
}

/**
 * Get profit statistics
 */
export const getProfitStatistics = async (): Promise<ProfitStatistics> => {
  const response = await apiClient.get<ProfitStatistics>('/v1/admin/dashboard/statistics/profits')
  return response.data
}

/**
 * Get recent activities
 */
export const getRecentActivities = async (): Promise<RecentActivity[]> => {
  const response = await apiClient.get<RecentActivity[]>('/v1/admin/dashboard/activities/recent')
  return response.data
}

/**
 * Get pending actions
 */
export const getPendingActions = async (): Promise<PendingAction[]> => {
  const response = await apiClient.get<PendingAction[]>('/v1/admin/dashboard/actions/pending')
  return response.data
}

// ===========================
// Helper Functions
// ===========================

/**
 * Format currency - uses cached settings from @/lib/utils
 */
import { formatCurrency as utilsFormatCurrency } from '@/lib/utils'
export const formatCurrency = utilsFormatCurrency

/**
 * Format number
 */
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Format month and year
 */
export const formatMonthYear = (month: number, year: number): string => {
  const date = new Date(year, month - 1, 1)
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

/**
 * Get status color
 */
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    draft: 'warning',
    published: 'success',
    locked: 'secondary',
    pending: 'warning',
    distributed: 'success',
    active: 'success',
    inactive: 'secondary',
  }
  return colors[status] || 'secondary'
}

/**
 * Get priority color
 */
export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    low: 'secondary',
    medium: 'warning',
    high: 'destructive',
  }
  return colors[priority] || 'secondary'
}

const dashboardService = {
  getDashboardOverview,
  getUserStatistics,
  getInvestmentStatistics,
  getWalletStatistics,
  getShareStatistics,
  getProfitStatistics,
  getRecentActivities,
  getPendingActions,
  formatCurrency,
  formatNumber,
  formatMonthYear,
  getStatusColor,
  getPriorityColor,
}

export default dashboardService
