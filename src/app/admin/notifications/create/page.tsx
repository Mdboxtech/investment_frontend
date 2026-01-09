'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import notificationService, { 
  type NotificationType, 
  type NotificationPriority 
} from '@/lib/api/services/notification.service'
import userService from '@/lib/api/services/user.service'
import { formatNumber } from '@/lib/utils'
import { 
  Bell, 
  Send, 
  Users, 
  Megaphone,
  Loader2, 
  AlertCircle,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Wallet,
  Settings,
  Search,
  UserCheck,
  Globe,
  Zap,
  X
} from 'lucide-react'

const typeOptions: { value: NotificationType; label: string; icon: React.ReactNode; description: string }[] = [
  { value: 'system', label: 'System', icon: <Settings className="h-4 w-4" />, description: 'System updates and maintenance' },
  { value: 'announcement', label: 'Announcement', icon: <Megaphone className="h-4 w-4" />, description: 'Important announcements' },
  { value: 'investment', label: 'Investment', icon: <TrendingUp className="h-4 w-4" />, description: 'Investment related updates' },
  { value: 'profit', label: 'Profit', icon: <DollarSign className="h-4 w-4" />, description: 'Profit distribution notices' },
  { value: 'wallet', label: 'Wallet', icon: <Wallet className="h-4 w-4" />, description: 'Wallet transactions' },
]

const priorityOptions: { value: NotificationPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-muted text-muted-foreground' },
  { value: 'normal', label: 'Normal', color: 'bg-primary/10 text-primary' },
  { value: 'high', label: 'High', color: 'bg-warning/10 text-warning' },
  { value: 'urgent', label: 'Urgent', color: 'bg-destructive/10 text-destructive' },
]

interface UserWithStats {
  id: number
  name: string
  email: string
  role: string
  is_active: boolean
}

export default function AdminNotificationCreatePage() {
  // Form state
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState<NotificationType>('announcement')
  const [priority, setPriority] = useState<NotificationPriority>('normal')
  
  // Send mode
  const [sendMode, setSendMode] = useState<'broadcast' | 'selected'>('broadcast')
  
  // User selection
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [userSearch, setUserSearch] = useState('')
  const [loadingUsers, setLoadingUsers] = useState(false)
  
  // Statistics
  const [stats, setStats] = useState<{ total_users: number; active_users: number } | null>(null)
  
  // UI state
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [showUserSelector, setShowUserSelector] = useState(false)
  
  // Templates
  const templates = [
    { 
      name: 'System Maintenance', 
      title: 'Scheduled System Maintenance',
      message: 'Our platform will undergo scheduled maintenance on [DATE] from [START_TIME] to [END_TIME]. During this period, some services may be temporarily unavailable. We apologize for any inconvenience.',
      type: 'system' as NotificationType,
      priority: 'high' as NotificationPriority
    },
    { 
      name: 'New Feature Announcement', 
      title: 'Exciting New Feature Available!',
      message: 'We are thrilled to announce a new feature: [FEATURE_NAME]. This enhancement will help you [BENEFIT]. Check it out now and let us know what you think!',
      type: 'announcement' as NotificationType,
      priority: 'normal' as NotificationPriority
    },
    { 
      name: 'Profit Distribution', 
      title: 'Monthly Profit Distribution Complete',
      message: 'Great news! Your share of this month\'s profit has been credited to your wallet. Log in to view your earnings and transaction details.',
      type: 'profit' as NotificationType,
      priority: 'normal' as NotificationPriority
    },
    { 
      name: 'Investment Opportunity', 
      title: 'New Investment Opportunity Available',
      message: 'A new investment share is now available: [SHARE_NAME]. This opportunity offers [DESCRIPTION]. Don\'t miss out - limited shares available!',
      type: 'investment' as NotificationType,
      priority: 'high' as NotificationPriority
    },
    { 
      name: 'Security Alert', 
      title: 'Important Security Notice',
      message: 'We have enhanced our security measures to better protect your account. Please review your account settings and update your password if you haven\'t done so recently.',
      type: 'system' as NotificationType,
      priority: 'urgent' as NotificationPriority
    },
  ]

  useEffect(() => {
    loadUsers()
    loadStats()
  }, [])

  const loadUsers = async () => {
    try {
      setLoadingUsers(true)
      setError(null)
      console.log('Fetching users...')
      const response = await userService.getUsers(1, 1000) // Get more users for selection
      console.log('Users response:', response)
      // The API returns nested structure: response.data.data contains the users array
      // response = { success, data: { current_page, data: [...users] } }
      const userData = (response as any)?.data?.data || (response as any)?.data || []
      console.log('User data array:', userData)
      setUsers(Array.isArray(userData) ? userData : [])
      console.log('Users set:', Array.isArray(userData) ? userData.length : 0, 'users')
    } catch (err: any) {
      console.error('Failed to load users:', err)
      console.error('Error response:', err.response)
      setError(err.response?.data?.message || err.message || 'Failed to load users')
    } finally {
      setLoadingUsers(false)
    }
  }

  const loadStats = async () => {
    try {
      console.log('Fetching user statistics...')
      const response = await userService.getUserStatistics()
      console.log('Statistics response:', response)
      // API returns snake_case: total_users, active_users
      const statsData = (response as any)?.data || response
      if (statsData) {
        setStats({
          total_users: statsData.total_users || statsData.totalUsers || 0,
          active_users: statsData.active_users || statsData.activeUsers || 0,
        })
        console.log('Stats set:', statsData)
      }
    } catch (err: any) {
      console.error('Failed to load stats:', err)
      console.error('Error response:', err.response)
    }
  }

  const applyTemplate = (template: typeof templates[0]) => {
    setTitle(template.title)
    setMessage(template.message)
    setType(template.type)
    setPriority(template.priority)
  }

  const toggleUserSelection = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const selectAllUsers = () => {
    const filteredUsers = users.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
    )
    setSelectedUsers(filteredUsers.map(u => u.id))
  }

  const clearSelection = () => {
    setSelectedUsers([])
  }

  const handleSend = async () => {
    // Validation
    if (!title.trim()) {
      setError('Please enter a notification title')
      return
    }
    if (!message.trim()) {
      setError('Please enter a notification message')
      return
    }
    if (sendMode === 'selected' && selectedUsers.length === 0) {
      setError('Please select at least one user')
      return
    }

    try {
      setSending(true)
      setError(null)

      let result
      if (sendMode === 'broadcast') {
        result = await notificationService.broadcastNotification({
          title: title.trim(),
          message: message.trim(),
          type,
          priority,
        })
      } else {
        result = await notificationService.sendToUsers({
          user_ids: selectedUsers,
          title: title.trim(),
          message: message.trim(),
          type,
          priority,
        })
      }

      const count = result.data?.sent_count || selectedUsers.length
      setSuccess(`Notification sent successfully to ${count} user${count !== 1 ? 's' : ''}!`)
      
      // Reset form
      setTitle('')
      setMessage('')
      setType('announcement')
      setPriority('normal')
      setSelectedUsers([])
      setSendMode('broadcast')
      
      setTimeout(() => setSuccess(null), 5000)
    } catch (err: any) {
      console.error('Failed to send notification:', err)
      setError(err.response?.data?.message || 'Failed to send notification')
    } finally {
      setSending(false)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  )

  const selectedUserNames = users
    .filter(u => selectedUsers.includes(u.id))
    .map(u => u.name)
    .slice(0, 3)
    .join(', ')

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Send className="h-6 w-6 md:h-8 md:w-8" />
            Send Notification
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Create and send notifications to users
          </p>
        </div>
        {stats && (
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-2xl font-bold">{formatNumber(stats.total_users)}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
            <Separator orientation="vertical" className="h-10" />
            <div className="text-right">
              <p className="text-2xl font-bold text-success">{formatNumber(stats.active_users)}</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </div>
          </div>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {success && (
        <Alert className="bg-success/10 border-success">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Send Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recipients</CardTitle>
              <CardDescription>Choose who should receive this notification</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setSendMode('broadcast')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    sendMode === 'broadcast' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${sendMode === 'broadcast' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Globe className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Broadcast to All</p>
                      <p className="text-xs text-muted-foreground">
                        Send to all {stats?.active_users || 0} active users
                      </p>
                    </div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => { setSendMode('selected'); setShowUserSelector(true) }}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    sendMode === 'selected' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`p-2 rounded-full ${sendMode === 'selected' ? 'bg-primary/10' : 'bg-muted'}`}>
                      <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Select Users</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedUsers.length > 0 
                          ? `${selectedUsers.length} user${selectedUsers.length !== 1 ? 's' : ''} selected`
                          : 'Choose specific users'}
                      </p>
                    </div>
                  </div>
                </button>
              </div>
              
              {sendMode === 'selected' && selectedUsers.length > 0 && (
                <div className="mt-4 p-3 bg-muted rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm">
                      <span className="font-medium">{selectedUsers.length}</span> users selected
                      {selectedUserNames && `: ${selectedUserNames}${selectedUsers.length > 3 ? '...' : ''}`}
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => setShowUserSelector(true)}
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notification Content */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notification Content</CardTitle>
              <CardDescription>Compose your notification message</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select value={type} onValueChange={(v) => setType(v as NotificationType)}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {typeOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            {opt.icon}
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(v) => setPriority(v as NotificationPriority)}>
                    <SelectTrigger id="priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorityOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${opt.color.replace('text-', 'bg-').split(' ')[0]}`} />
                            {opt.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter notification title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={255}
                />
                <p className="text-xs text-muted-foreground text-right">{title.length}/255</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground text-right">{message.length} characters</p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setShowPreview(true)}
              disabled={!title || !message}
            >
              Preview
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setTitle('')
                  setMessage('')
                  setType('announcement')
                  setPriority('normal')
                  setSelectedUsers([])
                }}
              >
                Clear
              </Button>
              <Button
                onClick={handleSend}
                disabled={sending || !title || !message || (sendMode === 'selected' && selectedUsers.length === 0)}
                className="gap-2 min-w-[140px]"
              >
                {sending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Send Notification
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Quick Templates
              </CardTitle>
              <CardDescription>Start with a pre-made template</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {templates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => applyTemplate(template)}
                  className="w-full p-3 text-left rounded-lg border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {typeOptions.find(t => t.value === template.type)?.icon}
                    <span className="font-medium text-sm">{template.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.title}
                  </p>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <p>Keep titles concise and action-oriented</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <p>Use urgent priority sparingly to maintain its impact</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <p>Personalize messages when sending to specific users</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                <p>Test with selected users before broadcasting</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* User Selector Dialog */}
      <Dialog open={showUserSelector} onOpenChange={setShowUserSelector}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Recipients</DialogTitle>
            <DialogDescription>
              Choose which users should receive this notification
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" size="sm" onClick={selectAllUsers}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{filteredUsers.length} users found</span>
              <span>{selectedUsers.length} selected</span>
            </div>

            <div className="h-[300px] border rounded-lg overflow-y-auto">
              {loadingUsers ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  No users found
                </div>
              ) : (
                <div className="divide-y">
                  {filteredUsers.map(user => {
                    const isSelected = selectedUsers.includes(user.id)
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-muted transition-colors ${
                          isSelected ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => {
                          console.log('Toggling user:', user.id, 'Current selected:', selectedUsers)
                          toggleUserSelection(user.id)
                        }}
                      >
                        <div 
                          className={`h-4 w-4 rounded border-2 flex items-center justify-center transition-colors ${
                            isSelected 
                              ? 'bg-primary border-primary' 
                              : 'border-gray-300 bg-white'
                          }`}
                        >
                          {isSelected && (
                            <CheckCircle className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{user.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        </div>
                        <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-xs">
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUserSelector(false)}>
              Cancel
            </Button>
            <Button onClick={() => setShowUserSelector(false)}>
              Confirm Selection ({selectedUsers.length})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Preview</DialogTitle>
            <DialogDescription>
              This is how users will see the notification
            </DialogDescription>
          </DialogHeader>
          
          <div className="border rounded-lg p-4 bg-muted/30">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-primary/10">
                {typeOptions.find(t => t.value === type)?.icon}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold">{title || 'Notification Title'}</h4>
                  <Badge className={priorityOptions.find(p => p.value === priority)?.color}>
                    {priority}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {message || 'Notification message will appear here...'}
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                  <Badge variant="outline">{typeOptions.find(t => t.value === type)?.label}</Badge>
                  <span>• Just now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Recipients:</strong>{' '}
              {sendMode === 'broadcast' 
                ? `All active users (${stats?.active_users || 0})` 
                : `${selectedUsers.length} selected user${selectedUsers.length !== 1 ? 's' : ''}`}
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Close
            </Button>
            <Button onClick={() => { setShowPreview(false); handleSend(); }}>
              Send Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
