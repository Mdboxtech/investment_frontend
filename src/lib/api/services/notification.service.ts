import apiClient, { ApiResponse, PaginatedResponse } from '../client'

// ===========================
// Type Definitions
// ===========================

export type NotificationType = 'investment' | 'profit' | 'wallet' | 'system' | 'announcement'
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent'

export interface Notification {
  id: number
  user_id: number
  type: NotificationType
  title: string
  message: string
  data: Record<string, any> | null
  priority: NotificationPriority
  is_read: boolean
  read_at: string | null
  created_at: string
  updated_at: string
}

export interface NotificationFilters {
  type?: NotificationType
  is_read?: boolean
  priority?: NotificationPriority
  from_date?: string
  to_date?: string
}

export interface NotificationPreferences {
  email_notifications: boolean
  profit_alerts: boolean
  investment_updates: boolean
  system_announcements: boolean
  marketing_emails: boolean
}

export interface NotificationStats {
  total: number
  unread: number
  by_type: Record<NotificationType, number>
  by_priority: Record<NotificationPriority, number>
}

// ===========================
// API Service Functions
// ===========================

/**
 * Get user's notifications with pagination and filters
 */
export const getNotifications = async (
  page: number = 1,
  perPage: number = 20,
  filters?: NotificationFilters
): Promise<ApiResponse<PaginatedResponse<Notification>>> => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  })

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString())
      }
    })
  }

  const response = await apiClient.get<ApiResponse<PaginatedResponse<Notification>>>(
    `/v1/notifications?${params}`
  )
  return response.data
}

/**
 * Get unread notifications count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ unread_count: number }>> => {
  const response = await apiClient.get<ApiResponse<{ unread_count: number }>>(
    '/v1/notifications/unread-count'
  )
  return response.data
}

/**
 * Mark a specific notification as read
 */
export const markAsRead = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(
    `/v1/notifications/${id}/read`
  )
  return response.data
}

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (): Promise<ApiResponse<{ marked_count: number }>> => {
  const response = await apiClient.post<ApiResponse<{ marked_count: number }>>(
    '/v1/notifications/read-all'
  )
  return response.data
}

/**
 * Delete a specific notification
 */
export const deleteNotification = async (id: number): Promise<ApiResponse<void>> => {
  const response = await apiClient.delete<ApiResponse<void>>(
    `/v1/notifications/${id}`
  )
  return response.data
}

/**
 * Delete all notifications
 */
export const deleteAllNotifications = async (): Promise<ApiResponse<{ deleted_count: number }>> => {
  const response = await apiClient.delete<ApiResponse<{ deleted_count: number }>>(
    '/v1/notifications'
  )
  return response.data
}

/**
 * Get notification preferences
 */
export const getPreferences = async (): Promise<ApiResponse<NotificationPreferences>> => {
  const response = await apiClient.get<ApiResponse<NotificationPreferences>>(
    '/v1/notifications/preferences'
  )
  return response.data
}

/**
 * Update notification preferences
 */
export const updatePreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<ApiResponse<NotificationPreferences>> => {
  const response = await apiClient.put<ApiResponse<NotificationPreferences>>(
    '/v1/notifications/preferences',
    preferences
  )
  return response.data
}

// ===========================
// Admin Functions
// ===========================

/**
 * Broadcast notification to all users (admin only)
 */
export const broadcastNotification = async (data: {
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
}): Promise<ApiResponse<{ sent_count: number }>> => {
  const response = await apiClient.post<ApiResponse<{ sent_count: number }>>(
    '/v1/admin/notifications/broadcast',
    data
  )
  return response.data
}

/**
 * Send notification to specific users (admin only)
 */
export const sendToUsers = async (data: {
  user_ids: number[]
  title: string
  message: string
  type?: NotificationType
  priority?: NotificationPriority
}): Promise<ApiResponse<{ sent_count: number }>> => {
  const response = await apiClient.post<ApiResponse<{ sent_count: number }>>(
    '/v1/admin/notifications/send',
    data
  )
  return response.data
}

/**
 * Get notification statistics (admin only)
 */
export const getStatistics = async (): Promise<ApiResponse<NotificationStats>> => {
  const response = await apiClient.get<ApiResponse<NotificationStats>>(
    '/v1/admin/notifications/statistics'
  )
  return response.data
}

// ===========================
// Helper Functions
// ===========================

export const getNotificationIcon = (type: NotificationType): string => {
  const icons: Record<NotificationType, string> = {
    investment: 'trending-up',
    profit: 'dollar-sign',
    wallet: 'wallet',
    system: 'settings',
    announcement: 'megaphone',
  }
  return icons[type] || 'bell'
}

export const getPriorityColor = (priority: NotificationPriority): string => {
  const colors: Record<NotificationPriority, string> = {
    low: 'text-muted-foreground',
    normal: 'text-foreground',
    high: 'text-warning',
    urgent: 'text-destructive',
  }
  return colors[priority] || 'text-foreground'
}

// Default export with all functions
const notificationService = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getPreferences,
  updatePreferences,
  broadcastNotification,
  sendToUsers,
  getStatistics,
  getNotificationIcon,
  getPriorityColor,
}

export default notificationService
