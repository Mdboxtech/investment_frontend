import { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    isPositive: boolean
  }
  className?: string
  iconClassName?: string
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  iconClassName,
}: StatCardProps) {
  return (
    <Card className={cn('card-hover', className)}>
      <CardContent className="p-3 sm:p-4 md:p-6">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1 sm:space-y-2 min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
            <div className="flex flex-wrap items-baseline gap-1 sm:gap-2">
              <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">{value}</p>
              {trend && (
                <span
                  className={cn(
                    'text-xs sm:text-sm font-medium whitespace-nowrap',
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  )}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-[10px] sm:text-xs text-muted-foreground truncate">{subtitle}</p>
            )}
          </div>
          <div
            className={cn(
              'rounded-lg p-2 sm:p-3 bg-primary/10 flex-shrink-0',
              iconClassName
            )}
          >
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface MiniStatProps {
  label: string
  value: string
  className?: string
}

export function MiniStat({ label, value, className }: MiniStatProps) {
  return (
    <div className={cn('space-y-1', className)}>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-base sm:text-lg font-semibold truncate">{value}</p>
    </div>
  )
}
