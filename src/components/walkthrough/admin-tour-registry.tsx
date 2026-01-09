'use client'

import { useEffect, useRef } from 'react'
import { useWalkthrough } from '@/components/walkthrough'
import { adminTours } from '@/lib/walkthrough'

interface AdminTourRegistryProps {
  triggerOnFirstLogin?: boolean
}

export function AdminTourRegistry({ triggerOnFirstLogin = true }: AdminTourRegistryProps) {
  const { registerTour, unregisterTour, triggerFirstLoginTour, state } = useWalkthrough()
  const hasTriggeredRef = useRef(false)

  // Register all admin tours on mount
  useEffect(() => {
    adminTours.forEach(tour => registerTour(tour))

    return () => {
      adminTours.forEach(tour => unregisterTour(tour.id))
    }
  }, [registerTour, unregisterTour])

  // Trigger first login tour - only once
  useEffect(() => {
    if (triggerOnFirstLogin && !state.hasSeenFirstLogin && !state.isActive && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true
      // Small delay to ensure tours are registered
      const timer = setTimeout(() => {
        triggerFirstLoginTour('admin', 'admin-dashboard-tour')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [triggerOnFirstLogin, triggerFirstLoginTour, state.hasSeenFirstLogin, state.isActive])

  return null
}
