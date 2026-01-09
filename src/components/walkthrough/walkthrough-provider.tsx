'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  WalkthroughState,
  WalkthroughStep,
  WalkthroughConfig,
  WalkthroughRole,
  DEFAULT_WALKTHROUGH_STATE,
  WALKTHROUGH_STORAGE_KEY,
} from '@/types/walkthrough'

interface WalkthroughContextType {
  // State
  state: WalkthroughState
  currentStep: WalkthroughStep | null
  currentTour: WalkthroughConfig | null
  totalSteps: number
  
  // Actions
  startTour: (tourId: string) => void
  endTour: () => void
  nextStep: () => void
  prevStep: () => void
  goToStep: (index: number) => void
  skipTour: () => void
  resetAllTours: () => void
  
  // Registration
  registerTour: (tour: WalkthroughConfig) => void
  unregisterTour: (tourId: string) => void
  
  // Queries
  isTourCompleted: (tourId: string) => boolean
  getToursByRole: (role: WalkthroughRole) => WalkthroughConfig[]
  
  // First login
  triggerFirstLoginTour: (role: WalkthroughRole, tourId: string) => void
  markFirstLoginSeen: () => void
}

const WalkthroughContext = createContext<WalkthroughContextType | null>(null)

export function useWalkthrough() {
  const context = useContext(WalkthroughContext)
  if (!context) {
    throw new Error('useWalkthrough must be used within a WalkthroughProvider')
  }
  return context
}

interface WalkthroughProviderProps {
  children: React.ReactNode
}

export function WalkthroughProvider({ children }: WalkthroughProviderProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [state, setState] = useState<WalkthroughState>(DEFAULT_WALKTHROUGH_STATE)
  const [tours, setTours] = useState<Map<string, WalkthroughConfig>>(new Map())
  const [isInitialized, setIsInitialized] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(WALKTHROUGH_STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setState(prev => ({
            ...prev,
            completedTours: parsed.completedTours || [],
            hasSeenFirstLogin: parsed.hasSeenFirstLogin || false,
            isActive: parsed.isActive || false,
            currentTourId: parsed.currentTourId || null,
            currentStepIndex: parsed.currentStepIndex || 0,
          }))
        }
      } catch (e) {
        console.error('Failed to load walkthrough state:', e)
      }
      setIsInitialized(true)
    }
  }, [])

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && isInitialized) {
      try {
        localStorage.setItem(
          WALKTHROUGH_STORAGE_KEY,
          JSON.stringify({
            completedTours: state.completedTours,
            hasSeenFirstLogin: state.hasSeenFirstLogin,
            isActive: state.isActive,
            currentTourId: state.currentTourId,
            currentStepIndex: state.currentStepIndex,
          })
        )
      } catch (e) {
        console.error('Failed to save walkthrough state:', e)
      }
    }
  }, [state.completedTours, state.hasSeenFirstLogin, state.isActive, state.currentTourId, state.currentStepIndex, isInitialized])

  // Get current tour and step
  const currentTour = state.currentTourId ? tours.get(state.currentTourId) || null : null
  const currentStep = currentTour?.steps[state.currentStepIndex] || null
  const totalSteps = currentTour?.steps.length || 0

  // Register a tour
  const registerTour = useCallback((tour: WalkthroughConfig) => {
    setTours(prev => new Map(prev).set(tour.id, tour))
  }, [])

  // Unregister a tour
  const unregisterTour = useCallback((tourId: string) => {
    setTours(prev => {
      const next = new Map(prev)
      next.delete(tourId)
      return next
    })
  }, [])

  // Start a tour
  const startTour = useCallback((tourId: string) => {
    const tour = tours.get(tourId)
    if (!tour) {
      console.warn(`Tour "${tourId}" not found`)
      return
    }

    // Don't restart if already on this tour
    if (state.isActive && state.currentTourId === tourId) {
      return
    }

    // Navigate to first step's route if specified and not already there
    const firstStep = tour.steps[0]
    if (firstStep?.route && pathname !== firstStep.route) {
      router.push(firstStep.route)
    }

    setState(prev => ({
      ...prev,
      isActive: true,
      currentTourId: tourId,
      currentStepIndex: 0,
    }))
  }, [tours, pathname, router, state.isActive, state.currentTourId])

  // End the current tour
  const endTour = useCallback(() => {
    if (state.currentTourId) {
      setState(prev => ({
        ...prev,
        isActive: false,
        currentTourId: null,
        currentStepIndex: 0,
        completedTours: prev.completedTours.includes(prev.currentTourId!)
          ? prev.completedTours
          : [...prev.completedTours, prev.currentTourId!],
        hasSeenFirstLogin: true,
      }))
    }
  }, [state.currentTourId])

  // Go to next step
  const nextStep = useCallback(() => {
    if (!currentTour) return

    const nextIndex = state.currentStepIndex + 1
    if (nextIndex >= currentTour.steps.length) {
      endTour()
      return
    }

    const nextStepData = currentTour.steps[nextIndex]
    
    // Execute onNext callback if exists
    currentStep?.onNext?.()

    // Update step first
    setState(prev => ({
      ...prev,
      currentStepIndex: nextIndex,
    }))

    // Then navigate if needed (after state update)
    if (nextStepData?.route && pathname !== nextStepData.route) {
      router.push(nextStepData.route)
    }
  }, [currentTour, currentStep, state.currentStepIndex, pathname, router, endTour])

  // Go to previous step
  const prevStep = useCallback(() => {
    if (!currentTour || state.currentStepIndex === 0) return

    const prevIndex = state.currentStepIndex - 1
    const prevStepData = currentTour.steps[prevIndex]
    
    // Execute onPrev callback if exists
    currentStep?.onPrev?.()

    // Update step first
    setState(prev => ({
      ...prev,
      currentStepIndex: prevIndex,
    }))

    // Then navigate if needed
    if (prevStepData?.route && pathname !== prevStepData.route) {
      router.push(prevStepData.route)
    }
  }, [currentTour, currentStep, state.currentStepIndex, pathname, router])

  // Go to specific step
  const goToStep = useCallback((index: number) => {
    if (!currentTour || index < 0 || index >= currentTour.steps.length) return

    const targetStep = currentTour.steps[index]
    
    // Update step first
    setState(prev => ({
      ...prev,
      currentStepIndex: index,
    }))

    // Then navigate if needed
    if (targetStep?.route && pathname !== targetStep.route) {
      router.push(targetStep.route)
    }
  }, [currentTour, pathname, router])

  // Skip/cancel tour
  const skipTour = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      currentTourId: null,
      currentStepIndex: 0,
      hasSeenFirstLogin: true,
    }))
  }, [])

  // Reset all tours
  const resetAllTours = useCallback(() => {
    setState({
      ...DEFAULT_WALKTHROUGH_STATE,
    })
  }, [])

  // Check if tour is completed
  const isTourCompleted = useCallback((tourId: string) => {
    return state.completedTours.includes(tourId)
  }, [state.completedTours])

  // Get tours by role
  const getToursByRole = useCallback((role: WalkthroughRole) => {
    return Array.from(tours.values()).filter(tour => tour.role === role)
  }, [tours])

  // Trigger first login tour
  const triggerFirstLoginTour = useCallback((role: WalkthroughRole, tourId: string) => {
    if (!state.hasSeenFirstLogin && tours.has(tourId)) {
      // Small delay to ensure page is rendered
      setTimeout(() => {
        startTour(tourId)
      }, 500)
    }
  }, [state.hasSeenFirstLogin, tours, startTour])

  // Mark first login as seen
  const markFirstLoginSeen = useCallback(() => {
    setState(prev => ({
      ...prev,
      hasSeenFirstLogin: true,
    }))
  }, [])

  const value: WalkthroughContextType = {
    state,
    currentStep,
    currentTour,
    totalSteps,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    skipTour,
    resetAllTours,
    registerTour,
    unregisterTour,
    isTourCompleted,
    getToursByRole,
    triggerFirstLoginTour,
    markFirstLoginSeen,
  }

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  )
}
