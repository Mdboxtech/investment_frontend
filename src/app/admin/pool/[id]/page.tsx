"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Users,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Download
} from 'lucide-react'
import profitService from '@/lib/api/services/profit.service'
import { formatCurrency, formatDate } from '@/lib/utils'

export default function ProfitPoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const poolId = parseInt(params.id as string)

  const [pool, setPool] = useState<any>(null)
  const [distributions, setDistributions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (poolId) {
      loadPoolDetails()
    }
  }, [poolId])

  const loadPoolDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      const [poolResponse, distributionsResponse] = await Promise.all([
        profitService.getProfitById(poolId),
        profitService.getProfitDistributions(poolId)
      ])

      setPool(poolResponse.data)
      // Handle various response structures
      const distData = distributionsResponse.data
      if (Array.isArray(distData)) {
        setDistributions(distData)
      } else if (distData && typeof distData === 'object' && 'data' in distData) {
        const nestedData = (distData as any).data
        setDistributions(Array.isArray(nestedData) ? nestedData : [])
      } else {
        setDistributions([])
      }
    } catch (err: any) {
      console.error('Failed to load pool details:', err)
      setError(err.response?.data?.message || 'Failed to load profit pool details')
      setDistributions([]) // Ensure distributions is always an array
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-success" />
      case 'distributing':
      case 'pending':
        return <Clock className="h-4 w-4 text-warning" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      completed: 'bg-success/10 text-success',
      distributing: 'bg-warning/10 text-warning',
      pending: 'bg-muted text-muted-foreground',
      cancelled: 'bg-destructive/10 text-destructive'
    }
    return variants[status] || 'bg-muted text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading profit pool details...</p>
        </div>
      </div>
    )
  }

  if (error || !pool) {
    return (
      <div className="space-y-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            {error || 'Profit pool not found'}
            <Button variant="outline" size="sm" onClick={loadPoolDetails}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">{pool.title}</h1>
            <p className="text-muted-foreground">
              Created on {formatDate(pool.created_at)}
            </p>
          </div>
        </div>
        <Badge className={getStatusBadge(pool.status)}>
          <div className="flex items-center gap-1">
            {getStatusIcon(pool.status)}
            {pool.status}
          </div>
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(parseFloat(String(pool.total_amount || 0)))}
            </div>
            <p className="text-xs text-muted-foreground">
              Initial profit pool
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Distributed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">
              {formatCurrency(parseFloat(String(pool.distributed_amount || 0)))}
            </div>
            <p className="text-xs text-muted-foreground">
              {pool.distribution_progress || 0}% distributed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                parseFloat(String(pool.total_amount || 0)) - 
                parseFloat(String(pool.distributed_amount || 0))
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Pending distribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Investors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {distributions.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Eligible recipients
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pool Information */}
      <Card>
        <CardHeader>
          <CardTitle>Pool Information</CardTitle>
          <CardDescription>Details about this profit pool</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Distribution Date</p>
                <p className="font-medium">
                  {pool.distribution_date ? formatDate(pool.distribution_date) : 'Not scheduled'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-medium capitalize">{pool.status}</p>
              </div>
            </div>
          </div>

          {pool.description && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Description</p>
              <p className="text-sm">{pool.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Distribution Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Distribution Details</CardTitle>
              <CardDescription>Individual investor distributions</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {distributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No distributions found for this profit pool</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Investor</th>
                    <th className="text-right py-3 px-4 font-medium">Amount</th>
                    <th className="text-right py-3 px-4 font-medium">Shares</th>
                    <th className="text-right py-3 px-4 font-medium">Status</th>
                    <th className="text-right py-3 px-4 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {distributions.map((dist) => (
                    <tr key={dist.id} className="border-b last:border-0 hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{dist.user?.name || 'Unknown'}</p>
                          <p className="text-sm text-muted-foreground">{dist.user?.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-success">
                        {formatCurrency(parseFloat(String(dist.amount || 0)))}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {dist.quantity || 0}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Badge className={getStatusBadge(dist.status)}>
                          {dist.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-muted-foreground">
                        {formatDate(dist.created_at)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t bg-muted/30">
                  <tr>
                    <td className="py-3 px-4 font-semibold">Total</td>
                    <td className="py-3 px-4 text-right font-semibold text-success">
                      {formatCurrency(
                        distributions.reduce((sum, d) => sum + parseFloat(String(d.amount || 0)), 0)
                      )}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold">
                      {distributions.reduce((sum, d) => sum + (d.quantity || 0), 0)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
