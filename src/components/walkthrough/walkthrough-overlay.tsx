'use client'

import { useEffect, useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useWalkthrough } from './walkthrough-provider'
import { WalkthroughPlacement } from '@/types/walkthrough'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { X, ChevronLeft, ChevronRight, SkipForward, CheckCircle2 } from 'lucide-react'

interface Position {
  top: number
  left: number
  width: number
  height: number
}

interface TooltipPosition {
  top: number
  left: number
}

function getTargetElement(target: string): HTMLElement | null {
  // Try data-tour attribute first
  let element = document.querySelector(`[data-tour="${target}"]`) as HTMLElement
  if (element) return element
  
  // Try CSS selector
  element = document.querySelector(target) as HTMLElement
  return element
}

function getElementPosition(element: HTMLElement): Position {
  const rect = element.getBoundingClientRect()
  // Use viewport-relative positions (no scroll offset) for fixed positioning
  return {
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
  }
}

function calculateTooltipPosition(
  targetPos: Position,
  tooltipWidth: number,
  tooltipHeight: number,
  placement: WalkthroughPlacement,
  padding: number = 16
): TooltipPosition {
  const gap = 12 // Gap between target and tooltip
  const viewportWidth = window.innerWidth
  const viewportHeight = window.innerHeight

  let top = 0
  let left = 0

  switch (placement) {
    case 'top':
      top = targetPos.top - tooltipHeight - gap
      left = targetPos.left + (targetPos.width / 2) - (tooltipWidth / 2)
      break
    case 'top-start':
      top = targetPos.top - tooltipHeight - gap
      left = targetPos.left
      break
    case 'top-end':
      top = targetPos.top - tooltipHeight - gap
      left = targetPos.left + targetPos.width - tooltipWidth
      break
    case 'bottom':
      top = targetPos.top + targetPos.height + gap
      left = targetPos.left + (targetPos.width / 2) - (tooltipWidth / 2)
      break
    case 'bottom-start':
      top = targetPos.top + targetPos.height + gap
      left = targetPos.left
      break
    case 'bottom-end':
      top = targetPos.top + targetPos.height + gap
      left = targetPos.left + targetPos.width - tooltipWidth
      break
    case 'left':
      top = targetPos.top + (targetPos.height / 2) - (tooltipHeight / 2)
      left = targetPos.left - tooltipWidth - gap
      break
    case 'left-start':
      top = targetPos.top
      left = targetPos.left - tooltipWidth - gap
      break
    case 'left-end':
      top = targetPos.top + targetPos.height - tooltipHeight
      left = targetPos.left - tooltipWidth - gap
      break
    case 'right':
      top = targetPos.top + (targetPos.height / 2) - (tooltipHeight / 2)
      left = targetPos.left + targetPos.width + gap
      break
    case 'right-start':
      top = targetPos.top
      left = targetPos.left + targetPos.width + gap
      break
    case 'right-end':
      top = targetPos.top + targetPos.height - tooltipHeight
      left = targetPos.left + targetPos.width + gap
      break
    case 'center':
      top = (viewportHeight / 2) - (tooltipHeight / 2)
      left = (viewportWidth / 2) - (tooltipWidth / 2)
      break
  }

  // Keep tooltip within viewport bounds
  if (left < 16) left = 16
  if (left + tooltipWidth > viewportWidth - 16) {
    left = viewportWidth - tooltipWidth - 16
  }
  if (top < 16) top = 16
  if (top + tooltipHeight > viewportHeight - 16) {
    top = viewportHeight - tooltipHeight - 16
  }

  return { top, left }
}

export function WalkthroughOverlay() {
  const {
    state,
    currentStep,
    currentTour,
    totalSteps,
    nextStep,
    prevStep,
    skipTour,
    endTour,
  } = useWalkthrough()

  const [targetPosition, setTargetPosition] = useState<Position | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0 })
  const [mounted, setMounted] = useState(false)
  const tooltipRef = useRef<HTMLDivElement>(null)

  // Handle mounting for portal
  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  // Update positions when step changes
  useEffect(() => {
    if (!state.isActive || !currentStep) {
      setTargetPosition(null)
      return
    }

    const updatePositions = () => {
      if (currentStep.target) {
        const element = getTargetElement(currentStep.target)
        if (element) {
          // Get fresh position
          const rect = element.getBoundingClientRect()
          const pos: Position = {
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          }
          setTargetPosition(pos)

          // Calculate tooltip position
          if (tooltipRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect()
            const newPos = calculateTooltipPosition(
              pos,
              tooltipRect.width,
              tooltipRect.height,
              currentStep.placement || 'bottom',
              currentStep.spotlightPadding || 8
            )
            setTooltipPosition(newPos)
          }
        } else {
          setTargetPosition(null)
        }
      } else {
        // Center placement for steps without target
        setTargetPosition(null)
        if (tooltipRef.current) {
          const tooltipRect = tooltipRef.current.getBoundingClientRect()
          setTooltipPosition({
            top: (window.innerHeight / 2) - (tooltipRect.height / 2),
            left: (window.innerWidth / 2) - (tooltipRect.width / 2),
          })
        }
      }
    }

    // Initial update with delay to ensure DOM is ready
    const timer = setTimeout(updatePositions, 100)
    
    // Also update after a longer delay to handle any animations
    const timer2 = setTimeout(updatePositions, 300)

    // Update on resize/scroll
    window.addEventListener('resize', updatePositions)
    window.addEventListener('scroll', updatePositions, true)

    return () => {
      clearTimeout(timer)
      clearTimeout(timer2)
      window.removeEventListener('resize', updatePositions)
      window.removeEventListener('scroll', updatePositions, true)
    }
  }, [state.isActive, currentStep, state.currentStepIndex])

  // Handle keyboard navigation
  useEffect(() => {
    if (!state.isActive) return

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          skipTour()
          break
        case 'ArrowRight':
        case 'Enter':
          nextStep()
          break
        case 'ArrowLeft':
          prevStep()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.isActive, nextStep, prevStep, skipTour])

  if (!mounted || !state.isActive || !currentStep) {
    return null
  }

  const isFirstStep = state.currentStepIndex === 0
  const isLastStep = state.currentStepIndex === totalSteps - 1
  const progress = ((state.currentStepIndex + 1) / totalSteps) * 100
  const padding = currentStep.spotlightPadding || 8

  const overlay = (
    <div className="fixed inset-0 z-[9999]" role="dialog" aria-modal="true">
      {/* Overlay using SVG mask for proper cutout */}
      {!currentStep.disableOverlay && (
        <svg className="fixed inset-0 w-full h-full pointer-events-none" style={{ zIndex: 9999 }}>
          <defs>
            <mask id="spotlight-mask">
              {/* White = visible, Black = hidden */}
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              {targetPosition && (
                <rect
                  x={targetPosition.left - padding}
                  y={targetPosition.top - padding}
                  width={targetPosition.width + padding * 2}
                  height={targetPosition.height + padding * 2}
                  rx="8"
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.6)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      )}

      {/* Spotlight border highlight */}
      {targetPosition && !currentStep.disableOverlay && (
        <div
          className="fixed border-2 border-primary rounded-lg pointer-events-none transition-all duration-300 ease-out"
          style={{
            zIndex: 10000,
            top: targetPosition.top - padding,
            left: targetPosition.left - padding,
            width: targetPosition.width + padding * 2,
            height: targetPosition.height + padding * 2,
            boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.4)',
          }}
        />
      )}

      {/* Tooltip card */}
      <Card
        ref={tooltipRef}
        className={cn(
          'fixed w-[360px] max-w-[calc(100vw-32px)] shadow-2xl border-2 border-primary/20 bg-background transition-all duration-300 ease-out',
          !targetPosition && 'transform -translate-x-1/2 -translate-y-1/2'
        )}
        style={{
          zIndex: 10001,
          ...(targetPosition
            ? { top: tooltipPosition.top, left: tooltipPosition.left }
            : { top: '50%', left: '50%' })
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-medium text-primary">
                  Step {state.currentStepIndex + 1} of {totalSteps}
                </span>
                {currentTour && (
                  <>
                    <span>•</span>
                    <span>{currentTour.name}</span>
                  </>
                )}
              </div>
              <CardTitle className="text-lg">{currentStep.title}</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 -mt-1 -mr-2"
              onClick={skipTour}
              aria-label="Close tour"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={progress} className="h-1.5 mt-2" />
        </CardHeader>
        
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {currentStep.content}
          </p>
        </CardContent>

        <CardFooter className="flex items-center justify-between pt-0 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={skipTour}
            className="text-muted-foreground hover:text-foreground"
          >
            <SkipForward className="h-4 w-4 mr-1" />
            Skip Tour
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevStep}
              disabled={isFirstStep}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {isLastStep ? (
              <Button size="sm" onClick={endTour} className="gap-1">
                <CheckCircle2 className="h-4 w-4" />
                Finish
              </Button>
            ) : (
              <Button size="sm" onClick={nextStep}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  )

  return createPortal(overlay, document.body)
}
