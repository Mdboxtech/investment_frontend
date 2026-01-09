'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import settingsService from '@/lib/api/services/settings.service'

// Types for platform settings
export interface ThemeSettings {
  theme_mode: 'light' | 'dark' | 'system'
  primary_color: string
  secondary_color: string
  success_color: string
  warning_color: string
  danger_color: string
  border_radius: string
  font_family: string
}

export interface GeneralSettings {
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
  min_investment_amount: number
  max_investment_amount: number
}

export interface PlatformSettings extends ThemeSettings, GeneralSettings { }

// Default settings
const defaultSettings: PlatformSettings = {
  // General
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
  min_investment_amount: 100,
  max_investment_amount: 100000,
  // Theme
  theme_mode: 'light',
  primary_color: '#3b82f6',
  secondary_color: '#64748b',
  success_color: '#22c55e',
  warning_color: '#eab308',
  danger_color: '#ef4444',
  border_radius: '0.5rem',
  font_family: 'Inter',
}

// LocalStorage key for theme cache
const THEME_CACHE_KEY = 'stockinvest_theme_cache'

// Context type
interface SettingsContextType {
  settings: PlatformSettings
  loading: boolean
  error: string | null
  refreshSettings: () => Promise<void>
  updateSettings: (newSettings: Partial<PlatformSettings>) => void
  formatCurrency: (amount: number) => string
}

// Create context
const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// Helper to convert hex to HSL for CSS variables
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '')

  // Parse hex values
  const r = parseInt(hex.substring(0, 2), 16) / 255
  const g = parseInt(hex.substring(2, 4), 16) / 255
  const b = parseInt(hex.substring(4, 6), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6
        break
      case g:
        h = ((b - r) / d + 2) / 6
        break
      case b:
        h = ((r - g) / d + 4) / 6
        break
    }
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`
}

// Apply theme to CSS variables
function applyTheme(settings: PlatformSettings) {
  if (typeof window === 'undefined') return

  const root = document.documentElement

  // Apply theme mode
  if (settings.theme_mode === 'dark') {
    root.classList.add('dark')
  } else if (settings.theme_mode === 'light') {
    root.classList.remove('dark')
  } else {
    // System preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (prefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }

  // Apply custom colors as CSS variables
  if (settings.primary_color) {
    root.style.setProperty('--primary', hexToHSL(settings.primary_color))
  }
  if (settings.success_color) {
    root.style.setProperty('--success', hexToHSL(settings.success_color))
  }
  if (settings.warning_color) {
    root.style.setProperty('--warning', hexToHSL(settings.warning_color))
  }
  if (settings.danger_color) {
    root.style.setProperty('--destructive', hexToHSL(settings.danger_color))
  }
  if (settings.border_radius) {
    root.style.setProperty('--radius', settings.border_radius)
  }

  // Update page title
  if (settings.platform_name) {
    document.title = `${settings.platform_name} - ${settings.platform_tagline || 'Investment Platform'}`
  }

  // Mark theme as applied
  document.documentElement.dataset.themeApplied = 'true'
}

// Cache theme and currency settings to localStorage
function cacheTheme(settings: PlatformSettings) {
  if (typeof window === 'undefined') return

  const themeData = {
    theme_mode: settings.theme_mode,
    primary_color: settings.primary_color,
    secondary_color: settings.secondary_color,
    success_color: settings.success_color,
    warning_color: settings.warning_color,
    danger_color: settings.danger_color,
    border_radius: settings.border_radius,
    // Include currency settings for formatCurrency in utils.ts
    currency_code: settings.currency_code,
    currency_symbol: settings.currency_symbol,
    currency_position: settings.currency_position,
  }

  try {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(themeData))
  } catch (e) {
    console.warn('Failed to cache theme:', e)
  }
}

// Load cached theme from localStorage
function loadCachedTheme(): Partial<PlatformSettings> | null {
  if (typeof window === 'undefined') return null

  try {
    const cached = localStorage.getItem(THEME_CACHE_KEY)
    if (cached) {
      return JSON.parse(cached)
    }
  } catch (e) {
    console.warn('Failed to load cached theme:', e)
  }

  return null
}

// Provider component
export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PlatformSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Immediately apply cached theme to prevent flash
      const cachedTheme = loadCachedTheme()
      if (cachedTheme) {
        const cachedSettings = { ...defaultSettings, ...cachedTheme } as PlatformSettings
        setSettings(cachedSettings)
        applyTheme(cachedSettings)
      }

      // Fetch public settings (no auth required)
      const response = await settingsService.getPublicSettings()

      if (response.success && response.data) {
        const newSettings = { ...defaultSettings, ...response.data } as PlatformSettings
        setSettings(newSettings)
        applyTheme(newSettings)
        // Cache the theme for next page load
        cacheTheme(newSettings)
      }
    } catch (err: any) {
      console.error('Failed to load platform settings:', err)
      setError(err.message || 'Failed to load settings')
      // Apply default theme on error (or keep cached if available)
      const cachedTheme = loadCachedTheme()
      if (!cachedTheme) {
        applyTheme(defaultSettings)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  const refreshSettings = useCallback(async () => {
    await loadSettings()
  }, [loadSettings])

  const updateSettings = useCallback((newSettings: Partial<PlatformSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings }
      applyTheme(updated)
      return updated
    })
  }, [])

  const formatCurrency = useCallback((amount: number): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)

    if (settings.currency_position === 'before') {
      return `${settings.currency_symbol}${formatted}`
    }
    return `${formatted}${settings.currency_symbol}`
  }, [settings.currency_symbol, settings.currency_position])

  // Load settings on mount
  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  // Listen for system theme changes
  useEffect(() => {
    if (settings.theme_mode !== 'system') return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => applyTheme(settings)

    mediaQuery.addEventListener('change', handler)
    return () => mediaQuery.removeEventListener('change', handler)
  }, [settings])

  return (
    <SettingsContext.Provider value={{
      settings,
      loading,
      error,
      refreshSettings,
      updateSettings,
      formatCurrency,
    }}>
      {children}
    </SettingsContext.Provider>
  )
}

// Hook to use settings
export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Hook for just the theme
export function useTheme() {
  const { settings, updateSettings } = useSettings()

  const setTheme = useCallback((mode: 'light' | 'dark' | 'system') => {
    updateSettings({ theme_mode: mode })
  }, [updateSettings])

  return {
    mode: settings.theme_mode,
    setTheme,
    isDark: settings.theme_mode === 'dark' ||
      (settings.theme_mode === 'system' &&
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches),
  }
}

export default SettingsContext
