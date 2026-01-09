'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useWebView } from '@/contexts/WebViewContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TrendingUp, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AxiosError } from 'axios'

import { useSettings } from '@/contexts/SettingsContext'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, isAuthenticated, isLoading: authLoading, setAuthToken } = useAuth()
  const { isWebView, sendToNativeApp } = useWebView()
  const { settings } = useSettings()

  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({})

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  // Check for session expiry message
  useEffect(() => {
    if (searchParams.get('session') === 'expired') {
      setError('Your session has expired. Please login again.')
    }
  }, [searchParams])

  // Handle token from URL params (WebView deep linking)
  useEffect(() => {
    const tokenFromUrl = searchParams.get('token')
    if (tokenFromUrl && typeof setAuthToken === 'function') {
      // Set the token from URL (for WebView deep linking)
      setAuthToken(tokenFromUrl)
      // Navigate to dashboard after setting token
      router.push('/dashboard')
    }
  }, [searchParams, setAuthToken, router])

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard')
    }
  }, [authLoading, isAuthenticated, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors
    setError(null)
    setValidationErrors({})

    // Client-side validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields')
      return
    }

    setIsLoading(true)

    try {
      await login(formData.email, formData.password)
      // Login function handles redirect based on role
    } catch (err: any) {
      const axiosError = err as AxiosError<any>

      if (axiosError.response) {
        const { status, data } = axiosError.response

        // Handle validation errors (422)
        if (status === 422 && data.errors) {
          setValidationErrors(data.errors)
          setError('Please fix the errors below')
        }
        // Handle authentication errors (401)
        else if (status === 401) {
          setError(data.message || 'Invalid email or password')
        }
        // Handle other errors
        else {
          setError(data.message || 'Login failed. Please try again.')
        }
      } else if (axiosError.request) {
        // Network error
        setError('Unable to connect to server. Please check your internet connection.')
      } else {
        // Other errors
        setError('An unexpected error occurred. Please try again.')
      }

      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted">
        <div className="text-center">
          <div className="h-12 w-12 mx-auto rounded-lg bg-primary flex items-center justify-center mb-4">
            <TrendingUp className="h-7 w-7 text-primary-foreground animate-pulse" />
          </div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          {settings.platform_logo ? (
            <img src={settings.platform_logo} alt="Logo" className="h-12 w-12 object-contain" />
          ) : (
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-7 w-7 text-primary-foreground" />
            </div>
          )}
          <span className="font-bold text-2xl">{settings.platform_name || 'StockInvest'}</span>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Enter your credentials to access your investment dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Error Alert */}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="investor@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                  required
                  className={validationErrors.email ? 'border-destructive' : ''}
                />
                {validationErrors.email && (
                  <p className="text-sm text-destructive">{validationErrors.email[0]}</p>
                )}
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    disabled={isLoading}
                    required
                    className={validationErrors.password ? 'border-destructive' : ''}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {validationErrors.password && (
                  <p className="text-sm text-destructive">{validationErrors.password[0]}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Quick Login</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => {
                    setFormData({ email: 'user@stockinvest.com', password: 'password123' })
                  }}
                >
                  User Demo
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isLoading}
                  onClick={() => {
                    setFormData({ email: 'admin@stockinvest.com', password: 'password123' })
                  }}
                >
                  Admin Demo
                </Button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="text-primary hover:underline">
                Create account
              </Link>
            </p>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          By signing in, you agree to our{' '}
          <Link href="#" className="hover:underline">Terms of Service</Link>
          {' '}and{' '}
          <Link href="#" className="hover:underline">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
