'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useWalkthrough } from './walkthrough-provider'
import { WalkthroughRole } from '@/types/walkthrough'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  HelpCircle, 
  PlayCircle, 
  RotateCcw, 
  CheckCircle2,
  BookOpen
} from 'lucide-react'

interface TourButtonProps {
  role: WalkthroughRole
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function TourButton({ 
  role, 
  variant = 'ghost', 
  size = 'icon',
  showLabel = false 
}: TourButtonProps) {
  const router = useRouter()
  const { 
    getToursByRole, 
    startTour, 
    isTourCompleted, 
    resetAllTours,
    state 
  } = useWalkthrough()
  
  const tours = getToursByRole(role)
  const [isOpen, setIsOpen] = useState(false)

  const handleStartTour = (tourId: string) => {
    setIsOpen(false)
    // Small delay to allow dropdown to close
    setTimeout(() => {
      startTour(tourId)
    }, 100)
  }

  const handleResetTours = () => {
    setIsOpen(false)
    resetAllTours()
    // Use router.refresh() for WebView compatibility instead of window.location.reload()
    router.refresh()
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant={variant} 
          size={size}
          className={showLabel ? 'gap-2' : ''}
          disabled={state.isActive}
        >
          <HelpCircle className="h-5 w-5" />
          {showLabel && <span>Help & Tour</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Interactive Tours
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {tours.length > 0 ? (
          tours.map((tour) => {
            const completed = isTourCompleted(tour.id)
            return (
              <DropdownMenuItem
                key={tour.id}
                onClick={() => handleStartTour(tour.id)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {completed ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <PlayCircle className="h-4 w-4 text-primary" />
                )}
                <div className="flex-1">
                  <p className="font-medium text-sm">{tour.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {tour.steps.length} steps
                    {completed && ' • Completed'}
                  </p>
                </div>
              </DropdownMenuItem>
            )
          })
        ) : (
          <DropdownMenuItem disabled className="text-muted-foreground text-sm">
            Loading tours...
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleResetTours}
          className="flex items-center gap-2 cursor-pointer text-muted-foreground"
        >
          <RotateCcw className="h-4 w-4" />
          Reset All Tours
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Simple button to start a specific tour
interface StartTourButtonProps {
  tourId: string
  children?: React.ReactNode
  variant?: 'default' | 'ghost' | 'outline' | 'secondary'
  size?: 'default' | 'sm' | 'lg'
  className?: string
}

export function StartTourButton({ 
  tourId, 
  children,
  variant = 'default',
  size = 'default',
  className
}: StartTourButtonProps) {
  const { startTour, state } = useWalkthrough()

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => startTour(tourId)}
      disabled={state.isActive}
    >
      {children || (
        <>
          <PlayCircle className="h-4 w-4 mr-2" />
          Start Tour
        </>
      )}
    </Button>
  )
}
