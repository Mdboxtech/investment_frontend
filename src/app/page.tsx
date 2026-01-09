'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Shield, BarChart3, Users, ArrowRight, CheckCircle } from 'lucide-react'
import { formatCurrency, getCurrencySettings } from '@/lib/utils'
import { useEffect, useState } from 'react'

export default function HomePage() {
  const [currency, setCurrency] = useState({ symbol: '$', code: 'USD' })

  useEffect(() => {
    const settings = getCurrencySettings()
    setCurrency(settings)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">StockInvest</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/register">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm bg-primary/5 text-primary">
            <Shield className="h-4 w-4" />
            <span>Secure & Transparent Investment Platform</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Invest in Company Shares,{' '}
            <span className="text-primary">Grow Your Wealth</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join our investment platform to purchase company shares, track performance in real-time,
            and earn monthly profits from successful business operations.
          </p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Start Investing <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                View Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">{currency.symbol}2.5M+</p>
              <p className="text-sm text-muted-foreground">Total Invested</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">245+</p>
              <p className="text-sm text-muted-foreground">Active Investors</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">15%+</p>
              <p className="text-sm text-muted-foreground">Avg. Annual ROI</p>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-primary">{currency.symbol}375K+</p>
              <p className="text-sm text-muted-foreground">Profits Distributed</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our platform makes share investment simple, transparent, and profitable
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Buy Shares</CardTitle>
              <CardDescription>
                Purchase company shares starting from just {formatCurrency(50)}. Choose from multiple investment options
                tailored to your goals.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Track Performance</CardTitle>
              <CardDescription>
                Monitor your investments in real-time with detailed analytics, charts, and
                comprehensive reporting tools.
              </CardDescription>
            </CardHeader>
          </Card>
          <Card className="card-hover">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Earn Profits</CardTitle>
              <CardDescription>
                Receive monthly profit distributions proportional to your share ownership.
                Full transparency on all earnings.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="bg-card border-y">
        <div className="container mx-auto px-4 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Why Choose StockInvest?</h2>
              <div className="space-y-4">
                {[
                  'Transparent profit distribution based on share ownership',
                  'Real-time investment tracking and analytics',
                  'Monthly profit reports and detailed history',
                  'Secure and audited transaction records',
                  'Professional fund management',
                  'Easy-to-use investor dashboard',
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/register">
                  <Button size="lg">Create Your Account</Button>
                </Link>
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl p-8">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Sample Investment Return</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Investment</span>
                    <span className="font-semibold">{formatCurrency(10000)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Shares Purchased</span>
                    <span className="font-semibold">100 shares</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly ROI (avg)</span>
                    <span className="font-semibold text-success">3.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">6-Month Profit</span>
                    <span className="font-semibold text-success">{formatCurrency(2100)}</span>
                  </div>
                  <div className="border-t pt-4 flex justify-between">
                    <span className="font-medium">Total Value</span>
                    <span className="font-bold text-primary text-xl">{formatCurrency(12100)}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-3xl font-bold">Ready to Start Investing?</h2>
          <p className="text-muted-foreground">
            Join thousands of investors who are growing their wealth through our transparent
            share investment platform.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2">
                Create Account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-bold">StockInvest</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 StockInvest. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
