'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import notificationService, { 
  type Notification, 
  type NotificationType, 
  type NotificationPriority 
} from '@/lib/api/services/notification.service'
import { formatDate } from '@/lib/utils'
import { 
  Bell, 
  BellOff,
  Check, 
  CheckCheck, 
  Trash2, 
  Loader2, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Wallet,
  Settings,
  Megaphone,
  Filter,
  MailOpen,
  RefreshCw
} from 'lucide-react'

const typeIcons: Record<NotificationType, React.ReactNode> = {
  investment: <TrendingUp className="h-4 w-4" />,
  profit: <DollarSign className="h-4 w-4" />,
  wallet: <Wallet className="h-4 w-4" />,
  system: <Settings className="h-4 w-4" />,
  announcement: <Megaphone className="h-4 w-4" />,
}

const typeLabels: Record<NotificationType, string> = {
  investment: 'Investment',
  profit: 'Profit',
  wallet: 'Wallet',
  system: 'System',
  announcement: 'Announcement',
}

const priorityColors: Record<NotificationPriority, string> = {
  low: 'bg-muted text-muted-foreground',
  normal: 'bg-primary/10 text-primary',
  high: 'bg-warning/10 text-warning',
  urgent: 'bg-destructive/10 text-destructive',
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [unreadCount, setUnreadCount] = useState(0)
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [readFilter, setReadFilter] = useState<string>('all')
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [markingAll, setMarkingAll] = useState(false)
  const [deletingAll, setDeletingAll] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadUnreadCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, typeFilter, readFilter])

  const loadNotifications = async () => {
    try {
      setLoading(true)
      setError(null)

      const filters: any = {}
      if (typeFilter !== 'all') {
        filters.type = typeFilter
      }
      if (readFilter !== 'all') {
        filters.is_read = readFilter === 'read'
      }

      const response = await notificationService.getNotifications(currentPage, 15, filters)
      
      if (response.success && response.data) {
        const data = response.data as any
        if (Array.isArray(data)) {
          setNotifications(data)
          setTotalPages(1)
        } else if (data.data && Array.isArray(data.data)) {
          setNotifications(data.data)
          setTotalPages(data.last_page || 1)
        } else {
          setNotifications([])
          setTotalPages(1)
        }
      }
    } catch (err: any) {
      console.error('Failed to load notifications:', err)
      setError(err.response?.data?.message || 'Failed to load notifications')
    } finally {
      setLoading(false)
    }
  }

  const loadUnreadCount = async () => {
    try {
      const response = await notificationService.getUnreadCount()
      if (response.success && response.data) {
        setUnreadCount(response.data.unread_count)
      }
    } catch (err) {
      console.error('Failed to load unread count:', err)
    }
  }

  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.is_read) return
    
    try {
      await notificationService.markAsRead(notification.id)
      setNotifications(prev => 
        prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err: any) {
      console.error('Failed to mark as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setMarkingAll(true)
      await notificationService.markAllAsRead()
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    } catch (err: any) {
      console.error('Failed to mark all as read:', err)
      setError(err.response?.data?.message || 'Failed to mark all as read')
    } finally {
      setMarkingAll(false)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationService.deleteNotification(id)
      const deleted = notifications.find(n => n.id === id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      if (deleted && !deleted.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
      if (selectedNotification?.id === id) {
        setSelectedNotification(null)
      }
    } catch (err: any) {
      console.error('Failed to delete notification:', err)
      setError(err.response?.data?.message || 'Failed to delete notification')
    }
  }

  const handleDeleteAllNotifications = async () => {
    try {
      setDeletingAll(true)
      await notificationService.deleteAllNotifications()
      setNotifications([])
      setUnreadCount(0)
      setShowDeleteDialog(false)
    } catch (err: any) {
      console.error('Failed to delete all notifications:', err)
      setError(err.response?.data?.message || 'Failed to delete all notifications')
    } finally {
      setDeletingAll(false)
    }
  }

  const openNotificationDetail = (notification: Notification) => {
    setSelectedNotification(notification)
    handleMarkAsRead(notification)
  }

  if (loading && notifications.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading notifications...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={() => { setError(null); loadNotifications(); }}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Bell className="h-6 w-6 md:h-8 md:w-8" />
            Notifications
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Stay updated with your account activity
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive" className="text-sm">
              {unreadCount} unread
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={loadNotifications}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters & Actions */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="investment">Investment</SelectItem>
                    <SelectItem value="profit">Profit</SelectItem>
                    <SelectItem value="wallet">Wallet</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="announcement">Announcement</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Select value={readFilter} onValueChange={setReadFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleMarkAllAsRead}
                disabled={markingAll || unreadCount === 0}
              >
                {markingAll ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCheck className="h-4 w-4" />
                )}
                Mark All Read
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 text-destructive hover:text-destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {notifications.length > 0 
              ? `${notifications.length} Notification${notifications.length !== 1 ? 's' : ''}`
              : 'No Notifications'
            }
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No notifications found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {typeFilter !== 'all' || readFilter !== 'all' 
                  ? 'Try adjusting your filters'
                  : 'You\'re all caught up!'}
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                    !notification.is_read ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                  }`}
                  onClick={() => openNotificationDetail(notification)}
                >
                  <div className="flex items-start gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      priorityColors[notification.priority]
                    }`}>
                      {typeIcons[notification.type] || <Bell className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium truncate ${!notification.is_read ? 'text-primary' : ''}`}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="outline" className="text-xs">
                            {typeLabels[notification.type]}
                          </Badge>
                          {!notification.is_read && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          {formatDate(notification.created_at)}
                        </p>
                        <div className="flex items-center gap-1">
                          {!notification.is_read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleMarkAsRead(notification)
                              }}
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Mark Read
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-destructive hover:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNotification(notification.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || loading}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || loading}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Notification Detail Dialog */}
      <Dialog open={!!selectedNotification} onOpenChange={() => setSelectedNotification(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                selectedNotification ? priorityColors[selectedNotification.priority] : ''
              }`}>
                {selectedNotification && (typeIcons[selectedNotification.type] || <Bell className="h-4 w-4" />)}
              </div>
              <div>
                <DialogTitle>{selectedNotification?.title}</DialogTitle>
                <DialogDescription className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {selectedNotification && typeLabels[selectedNotification.type]}
                  </Badge>
                  <span className="text-xs">
                    {selectedNotification && formatDate(selectedNotification.created_at)}
                  </span>
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {selectedNotification?.message}
            </p>
            {selectedNotification?.data && Object.keys(selectedNotification.data).length > 0 && (
              <div className="mt-4 p-3 bg-muted rounded-lg">
                <p className="text-xs font-medium mb-2">Additional Details</p>
                <div className="space-y-1 text-xs text-muted-foreground">
                  {Object.entries(selectedNotification.data).map(([key, value]) => (
                    <div key={key} className="flex justify-between">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedNotification(null)}>
              Close
            </Button>
            {selectedNotification && (
              <Button 
                variant="destructive"
                onClick={() => {
                  handleDeleteNotification(selectedNotification.id)
                }}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Notifications</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete all your notifications? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteAllNotifications}
              disabled={deletingAll}
            >
              {deletingAll ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Delete All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
