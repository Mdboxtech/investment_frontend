'use client'

import { useEffect, useRef } from 'react'
import { useWalkthrough } from '@/components/walkthrough'
import { userTours } from '@/lib/walkthrough'

interface UserTourRegistryProps {
  triggerOnFirstLogin?: boolean
}

export function UserTourRegistry({ triggerOnFirstLogin = true }: UserTourRegistryProps) {
  const { registerTour, unregisterTour, triggerFirstLoginTour, state } = useWalkthrough()
  const hasTriggeredRef = useRef(false)

  // Register all user tours on mount
  useEffect(() => {
    userTours.forEach(tour => registerTour(tour))

    return () => {
      userTours.forEach(tour => unregisterTour(tour.id))
    }
  }, [registerTour, unregisterTour])

  // Trigger first login tour - only once
  useEffect(() => {
    if (triggerOnFirstLogin && !state.hasSeenFirstLogin && !state.isActive && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      // Small delay to ensure tours are registered
      const timer = setTimeout(() => {
        triggerFirstLoginTour('user', 'user-dashboard-tour')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [triggerOnFirstLogin, triggerFirstLoginTour, state.hasSeenFirstLogin, state.isActive])

  return null
}
