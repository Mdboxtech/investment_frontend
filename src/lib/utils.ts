import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Get cached currency settings from localStorage
export function getCurrencySettings(): { code: string; symbol: string; position: 'before' | 'after' } {
  if (typeof window === 'undefined') {
    return { code: 'NGN', symbol: '₦', position: 'before' }
  }

  try {
    // Try theme cache first (includes all cached settings)
    const themeCache = localStorage.getItem('stockinvest_theme_cache')
    if (themeCache) {
      const parsed = JSON.parse(themeCache)
      if (parsed.currency_code && parsed.currency_symbol) {
        return {
          code: parsed.currency_code,
          symbol: parsed.currency_symbol,
          position: parsed.currency_position || 'before'
        }
      }
    }

    // Fallback: try to read full settings cache
    const settingsCache = localStorage.getItem('stockinvest_settings_cache')
    if (settingsCache) {
      const parsed = JSON.parse(settingsCache)
      if (parsed.currency_code && parsed.currency_symbol) {
        return {
          code: parsed.currency_code,
          symbol: parsed.currency_symbol,
          position: parsed.currency_position || 'before'
        }
      }
    }
  } catch (e) {
    // Ignore errors, use default
  }

  // Default to Nigerian Naira
  return { code: 'NGN', symbol: '₦', position: 'before' }
}

export function formatCurrency(amount: number): string {
  const { code, symbol, position } = getCurrencySettings()

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)

  if (position === 'before') {
    return `${symbol}${formatted}`
  }
  return `${formatted}${symbol}`
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A'

  const dateObj = new Date(date)
  if (isNaN(dateObj.getTime())) return 'Invalid Date'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function formatMonthYear(month: number, year: number): string {
  if (!month || !year || month < 1 || month > 12) return 'Invalid Date'

  const date = new Date(year, month - 1)
  if (isNaN(date.getTime())) return 'Invalid Date'

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

export function calculateROI(invested: number, currentValue: number): number {
  if (invested === 0) return 0
  return ((currentValue - invested) / invested) * 100
}

export function calculateProfitShare(
  userShares: number,
  totalShares: number,
  totalProfit: number
): number {
  if (totalShares === 0) return 0
  return (userShares / totalShares) * totalProfit
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'published':
    case 'active':
      return 'text-success'
    case 'pending':
    case 'draft':
      return 'text-warning'
    case 'locked':
      return 'text-muted-foreground'
    default:
      return 'text-foreground'
  }
}

export function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status.toLowerCase()) {
    case 'paid':
    case 'published':
    case 'active':
      return 'default'
    case 'pending':
    case 'draft':
      return 'secondary'
    case 'locked':
      return 'outline'
    default:
      return 'default'
  }
}
