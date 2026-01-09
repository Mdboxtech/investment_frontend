'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import settingsService, { type SettingsGrouped, themePresets } from '@/lib/api/services/settings.service'
import { useSettings } from '@/contexts/SettingsContext'
import { formatCurrency } from '@/lib/utils'
import { 
  Settings, 
  DollarSign, 
  Calculator, 
  Shield, 
  Bell,
  Save,
  RefreshCw,
  Loader2,
  CheckCircle,
  AlertCircle,
  Palette,
  Building,
  Globe,
  Sun,
  Moon,
  Monitor,
  Eye
} from 'lucide-react'

interface AllSettings {
  // Profit
  profit_calculation_method: 'share_based' | 'investment_based'
  profit_auto_crediting: boolean
  platform_fee_percentage: number
  // Investment
  min_investment_amount: number
  max_investment_amount: number
  // Notification
  notify_profit_distribution: boolean
  notify_new_shares: boolean
  send_monthly_reports: boolean
  // Security
  lock_past_records: boolean
  audit_trail_enabled: boolean
  require_2fa_admin: boolean
  idempotent_distribution: boolean
  // General
  platform_name: string
  platform_tagline: string
  platform_logo: string
  platform_favicon: string
  support_email: string
  support_phone: string
  currency_code: string
  currency_symbol: string
  currency_position: 'before' | 'after'
  registration_enabled: boolean
  maintenance_mode: boolean
  maintenance_message: string
  // Theme
  theme_mode: 'light' | 'dark' | 'system'
  primary_color: string
  secondary_color: string
  success_color: string
  warning_color: string
  danger_color: string
  border_radius: string
  font_family: string
}

const defaultSettings: AllSettings = {
  profit_calculation_method: 'share_based',
  profit_auto_crediting: true,
  platform_fee_percentage: 5,
  min_investment_amount: 100,
  max_investment_amount: 100000,
  notify_profit_distribution: true,
  notify_new_shares: true,
  send_monthly_reports: true,
  lock_past_records: true,
  audit_trail_enabled: true,
  require_2fa_admin: false,
  idempotent_distribution: true,
  platform_name: 'StockInvest',
  platform_tagline: 'Company Share Investment Platform',
  platform_logo: '',
  platform_favicon: '',
  support_email: 'support@stockinvest.com',
  support_phone: '',
  currency_code: 'NGN',
  currency_symbol: '₦',
  currency_position: 'before',
  registration_enabled: true,
  maintenance_mode: false,
  maintenance_message: 'We are currently performing scheduled maintenance. Please check back soon.',
  theme_mode: 'light',
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
  success_color: '#22c55e',
  warning_color: '#eab308',
  danger_color: '#ef4444',
  border_radius: '0.5rem',
  font_family: 'Inter',
}

const currencyOptions = [
  { code: 'NGN', symbol: '₦', name: 'Nigerian Naira' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'GHS', symbol: '₵', name: 'Ghanaian Cedi' },
  { code: 'KES', symbol: 'KSh', name: 'Kenyan Shilling' },
  { code: 'ZAR', symbol: 'R', name: 'South African Rand' },
]

const fontOptions = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Poppins',
  'Montserrat',
  'Source Sans Pro',
  'Nunito',
]

const radiusOptions = [
  { value: '0', label: 'None (Square)' },
  { value: '0.25rem', label: 'Small' },
  { value: '0.5rem', label: 'Medium' },
  { value: '0.75rem', label: 'Large' },
  { value: '1rem', label: 'Extra Large' },
  { value: '9999px', label: 'Full (Pill)' },
]

export default function SettingsPage() {
  const [settings, setSettings] = useState<AllSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [originalSettings, setOriginalSettings] = useState<AllSettings>(defaultSettings)
  const [activeTab, setActiveTab] = useState('general')
  
  const { refreshSettings: refreshGlobalSettings, updateSettings: updateGlobalSettings } = useSettings()

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await settingsService.getAll()
      
      if (response.success && response.data) {
        const flat = settingsService.flattenSettings(response.data) as AllSettings
        const merged = { ...defaultSettings, ...flat }
        setSettings(merged)
        setOriginalSettings(merged)
      }
    } catch (err: any) {
      console.error('Failed to load settings:', err)
      setError(err.response?.data?.message || 'Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(null)

      // Filter out empty optional fields to avoid backend validation errors
      const settingsToSave: any = { ...settings }
      
      // Remove empty optional fields entirely from the payload
      const optionalFields: (keyof AllSettings)[] = [
        'platform_logo',
        'platform_favicon',
        'support_phone',
      ]
      
      optionalFields.forEach(field => {
        if (settingsToSave[field] === '' || settingsToSave[field] === null) {
          delete settingsToSave[field]
        }
      })

      const response = await settingsService.updateBatch(settingsToSave)
      
      if (response.success) {
        setSuccess('Settings saved successfully! Changes will take effect immediately.')
        setOriginalSettings(settings)
        setHasChanges(false)
        
        // Refresh global settings so the platform updates
        await refreshGlobalSettings()
        
        setTimeout(() => setSuccess(null), 5000)
      }
    } catch (err: any) {
      console.error('Failed to save settings:', err)
      setError(err.response?.data?.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      setResetting(true)
      setError(null)
      setSuccess(null)

      await settingsService.resetToDefaults()
      await loadSettings()
      await refreshGlobalSettings()
      
      setSuccess('Settings reset to defaults')
      setHasChanges(false)
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      console.error('Failed to reset settings:', err)
      setError(err.response?.data?.message || 'Failed to reset settings')
    } finally {
      setResetting(false)
    }
  }

  const updateSetting = <K extends keyof AllSettings>(key: K, value: AllSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
    
    // Live preview for theme settings
    if (['theme_mode', 'primary_color', 'success_color', 'warning_color', 'danger_color', 'border_radius'].includes(key)) {
      updateGlobalSettings({ [key]: value })
    }
  }

  const applyThemePreset = (presetKey: keyof typeof themePresets) => {
    const preset = themePresets[presetKey]
    setSettings(prev => ({
      ...prev,
      primary_color: preset.primary_color,
      secondary_color: preset.secondary_color,
      success_color: preset.success_color,
      warning_color: preset.warning_color,
      danger_color: preset.danger_color,
    }))
    setHasChanges(true)
    
    // Live preview
    updateGlobalSettings({
      primary_color: preset.primary_color,
      success_color: preset.success_color,
      warning_color: preset.warning_color,
      danger_color: preset.danger_color,
    })
  }

  const handleCurrencyChange = (code: string) => {
    const currency = currencyOptions.find(c => c.code === code)
    if (currency) {
      updateSetting('currency_code', currency.code)
      updateSetting('currency_symbol', currency.symbol)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Success Alert */}
      {success && (
        <Alert className="border-success bg-success/10">
          <CheckCircle className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">{success}</AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            {error}
            <Button variant="outline" size="sm" onClick={loadSettings}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="h-7 w-7" />
            Platform Settings
          </h1>
          <p className="text-muted-foreground text-sm md:text-base">
            Configure platform behavior, branding, and appearance
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-warning border-warning">
              Unsaved changes
            </Badge>
          )}
          <Button 
            className="gap-2" 
            onClick={handleSave}
            disabled={saving || !hasChanges}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 h-auto p-1">
          <TabsTrigger value="general" className="gap-2 py-2">
            <Building className="h-4 w-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="theme" className="gap-2 py-2">
            <Palette className="h-4 w-4" />
            <span className="hidden sm:inline">Theme</span>
          </TabsTrigger>
          <TabsTrigger value="profit" className="gap-2 py-2">
            <Calculator className="h-4 w-4" />
            <span className="hidden sm:inline">Profit</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2 py-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2 py-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-6">
          {/* Branding */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Building className="h-5 w-5 text-primary" />
                <CardTitle>Branding</CardTitle>
              </div>
              <CardDescription>
                Configure your platform's identity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Platform Name</Label>
                  <Input
                    value={settings.platform_name}
                    onChange={(e) => updateSetting('platform_name', e.target.value)}
                    placeholder="StockInvest"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tagline</Label>
                  <Input
                    value={settings.platform_tagline}
                    onChange={(e) => updateSetting('platform_tagline', e.target.value)}
                    placeholder="Company Share Investment Platform"
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    value={settings.platform_logo}
                    onChange={(e) => updateSetting('platform_logo', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                  <p className="text-xs text-muted-foreground">Leave empty for default logo</p>
                </div>
                <div className="space-y-2">
                  <Label>Favicon URL</Label>
                  <Input
                    value={settings.platform_favicon}
                    onChange={(e) => updateSetting('platform_favicon', e.target.value)}
                    placeholder="https://example.com/favicon.ico"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle>Contact & Support</CardTitle>
              </div>
              <CardDescription>
                Support contact information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.support_email}
                    onChange={(e) => updateSetting('support_email', e.target.value)}
                    placeholder="support@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Phone</Label>
                  <Input
                    value={settings.support_phone}
                    onChange={(e) => updateSetting('support_phone', e.target.value)}
                    placeholder="+234 800 000 0000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Currency */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <CardTitle>Currency Settings</CardTitle>
              </div>
              <CardDescription>
                Configure default currency for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={settings.currency_code}
                    onValueChange={handleCurrencyChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Symbol Position</Label>
                  <Select
                    value={settings.currency_position}
                    onValueChange={(value: 'before' | 'after') => 
                      updateSetting('currency_position', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="before">Before ({settings.currency_symbol}100)</SelectItem>
                      <SelectItem value="after">After (100{settings.currency_symbol})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Preview</Label>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                    <span className="font-medium">
                      {settings.currency_position === 'before' 
                        ? `${settings.currency_symbol}1,000.00`
                        : `1,000.00${settings.currency_symbol}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Features */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Features</CardTitle>
              <CardDescription>
                Enable or disable platform features
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border">
                <div>
                  <p className="font-medium">User Registration</p>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register on the platform
                  </p>
                </div>
                <Switch
                  checked={settings.registration_enabled}
                  onCheckedChange={(checked) => updateSetting('registration_enabled', checked)}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-warning/50 bg-warning/5">
                <div>
                  <p className="font-medium text-warning">Maintenance Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Put the platform in maintenance mode (users will see maintenance page)
                  </p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => updateSetting('maintenance_mode', checked)}
                />
              </div>
              {settings.maintenance_mode && (
                <div className="space-y-2">
                  <Label>Maintenance Message</Label>
                  <Input
                    value={settings.maintenance_message}
                    onChange={(e) => updateSetting('maintenance_message', e.target.value)}
                    placeholder="We are currently performing scheduled maintenance..."
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Theme Settings Tab */}
        <TabsContent value="theme" className="space-y-6">
          {/* Theme Mode */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle>Theme Mode</CardTitle>
              </div>
              <CardDescription>
                Choose the default color scheme for the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <button
                  type="button"
                  onClick={() => updateSetting('theme_mode', 'light')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme_mode === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Sun className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">Light</p>
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('theme_mode', 'dark')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme_mode === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Moon className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">Dark</p>
                </button>
                <button
                  type="button"
                  onClick={() => updateSetting('theme_mode', 'system')}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.theme_mode === 'system'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Monitor className="h-6 w-6 mx-auto mb-2" />
                  <p className="font-medium text-sm">System</p>
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Theme Presets */}
          <Card>
            <CardHeader>
              <CardTitle>Color Presets</CardTitle>
              <CardDescription>
                Quick apply a color scheme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {(Object.entries(themePresets) as [keyof typeof themePresets, typeof themePresets[keyof typeof themePresets]][]).map(([key, preset]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => applyThemePreset(key)}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      settings.primary_color === preset.primary_color
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div 
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: preset.primary_color }}
                    />
                    <p className="text-xs font-medium">{preset.name}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Custom Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Custom Colors</CardTitle>
              <CardDescription>
                Fine-tune individual colors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.primary_color}
                      onChange={(e) => updateSetting('primary_color', e.target.value)}
                      placeholder="#3b82f6"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Success Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.success_color}
                      onChange={(e) => updateSetting('success_color', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.success_color}
                      onChange={(e) => updateSetting('success_color', e.target.value)}
                      placeholder="#22c55e"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Warning Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.warning_color}
                      onChange={(e) => updateSetting('warning_color', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.warning_color}
                      onChange={(e) => updateSetting('warning_color', e.target.value)}
                      placeholder="#eab308"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Danger Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.danger_color}
                      onChange={(e) => updateSetting('danger_color', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.danger_color}
                      onChange={(e) => updateSetting('danger_color', e.target.value)}
                      placeholder="#ef4444"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      className="w-12 h-10 p-1 cursor-pointer"
                    />
                    <Input
                      value={settings.secondary_color}
                      onChange={(e) => updateSetting('secondary_color', e.target.value)}
                      placeholder="#64748b"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Typography & Styling */}
          <Card>
            <CardHeader>
              <CardTitle>Typography & Styling</CardTitle>
              <CardDescription>
                Font and component styling options
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={settings.font_family}
                    onValueChange={(value) => updateSetting('font_family', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {fontOptions.map(font => (
                        <SelectItem key={font} value={font}>
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Border Radius</Label>
                  <Select
                    value={settings.border_radius}
                    onValueChange={(value) => updateSetting('border_radius', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {radiusOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                <CardTitle>Live Preview</CardTitle>
              </div>
              <CardDescription>
                See how your changes look
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 border rounded-lg space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button>Primary Button</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="destructive">Destructive</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="p-3 rounded-lg bg-success/10 text-success border border-success/20">
                    Success Message
                  </div>
                  <div className="p-3 rounded-lg bg-warning/10 text-warning border border-warning/20">
                    Warning Message
                  </div>
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
                    Error Message
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profit Settings Tab */}
        <TabsContent value="profit" className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            <CardTitle>Profit Distribution</CardTitle>
          </div>
          <CardDescription>
            Configure how profits are calculated and distributed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Calculation Method</Label>
              <Select
                value={settings.profit_calculation_method}
                onValueChange={(value: 'share_based' | 'investment_based') =>
                  updateSetting('profit_calculation_method', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="share_based">Share-Based</SelectItem>
                  <SelectItem value="investment_based">Investment-Based</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.profit_calculation_method === 'share_based'
                  ? 'Profit = (User Shares / Total Shares) × Monthly Profit'
                  : 'Profit = User Investment × Monthly ROI Percentage'}
              </p>
            </div>
            <div className="space-y-2">
              <Label>Auto Crediting</Label>
              <Select
                value={settings.profit_auto_crediting ? 'enabled' : 'disabled'}
                onValueChange={(value) =>
                  updateSetting('profit_auto_crediting', value === 'enabled')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enabled">Enabled</SelectItem>
                  <SelectItem value="disabled">Disabled</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {settings.profit_auto_crediting
                  ? 'Profits are automatically credited to user wallets'
                  : 'Profits are recorded but require manual distribution'}
              </p>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Platform Fee Percentage</Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={settings.platform_fee_percentage}
                onChange={(e) =>
                  updateSetting('platform_fee_percentage', parseFloat(e.target.value) || 0)
                }
                className="w-32"
              />
              <span className="text-muted-foreground">%</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Fee deducted from profits before distribution
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Investment Limits */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <CardTitle>Investment Limits</CardTitle>
          </div>
          <CardDescription>
            Set minimum and maximum investment amounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Minimum Investment</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{settings.currency_symbol}</span>
                <Input
                  type="number"
                  min="0"
                  value={settings.min_investment_amount}
                  onChange={(e) =>
                    updateSetting('min_investment_amount', parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Minimum amount required to invest
              </p>
            </div>
            <div className="space-y-2">
              <Label>Maximum Investment</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{settings.currency_symbol}</span>
                <Input
                  type="number"
                  min="0"
                  value={settings.max_investment_amount}
                  onChange={(e) =>
                    updateSetting('max_investment_amount', parseInt(e.target.value) || 0)
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Maximum investment amount per user
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Security Settings Tab */}
        <TabsContent value="security" className="space-y-6">
      {/* Security Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Security & Audit</CardTitle>
          </div>
          <CardDescription>
            Security settings and audit controls
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Lock Past Records</p>
              <p className="text-sm text-muted-foreground">
                Automatically lock profit records after 30 days
              </p>
            </div>
            <Switch
              checked={settings.lock_past_records}
              onCheckedChange={(checked: boolean) => updateSetting('lock_past_records', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Audit Trail</p>
              <p className="text-sm text-muted-foreground">
                Log all admin actions for compliance
              </p>
            </div>
            <Switch
              checked={settings.audit_trail_enabled}
              onCheckedChange={(checked: boolean) => updateSetting('audit_trail_enabled', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Two-Factor Authentication</p>
              <p className="text-sm text-muted-foreground">
                Require 2FA for admin operations
              </p>
            </div>
            <Switch
              checked={settings.require_2fa_admin}
              onCheckedChange={(checked: boolean) => updateSetting('require_2fa_admin', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Idempotent Distribution</p>
              <p className="text-sm text-muted-foreground">
                Prevent duplicate profit distributions
              </p>
            </div>
            <Switch
              checked={settings.idempotent_distribution}
              onCheckedChange={(checked: boolean) => updateSetting('idempotent_distribution', checked)}
            />
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        {/* Notification Settings Tab */}
        <TabsContent value="notifications" className="space-y-6">
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Configure notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Profit Distribution Alerts</p>
              <p className="text-sm text-muted-foreground">
                Notify users when profits are distributed
              </p>
            </div>
            <Switch
              checked={settings.notify_profit_distribution}
              onCheckedChange={(checked: boolean) => updateSetting('notify_profit_distribution', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">New Share Notifications</p>
              <p className="text-sm text-muted-foreground">
                Notify users when new shares are available
              </p>
            </div>
            <Switch
              checked={settings.notify_new_shares}
              onCheckedChange={(checked: boolean) => updateSetting('notify_new_shares', checked)}
            />
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg border">
            <div>
              <p className="font-medium">Monthly Reports</p>
              <p className="text-sm text-muted-foreground">
                Send monthly investment reports to users
              </p>
            </div>
            <Switch
              checked={settings.send_monthly_reports}
              onCheckedChange={(checked: boolean) => updateSetting('send_monthly_reports', checked)}
            />
          </div>
        </CardContent>
      </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t">
        <Button 
          variant="outline" 
          className="gap-2"
          onClick={handleReset}
          disabled={resetting}
        >
          {resetting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {resetting ? 'Resetting...' : 'Reset to Defaults'}
        </Button>
        <Button 
          className="gap-2"
          onClick={handleSave}
          disabled={saving || !hasChanges}
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {saving ? 'Saving...' : 'Save All Changes'}
        </Button>
      </div>
    </div>
  )
}
