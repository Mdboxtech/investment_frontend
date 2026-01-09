// Walkthrough Types & Interfaces

export type WalkthroughRole = 'user' | 'admin'

export type WalkthroughPlacement = 
  | 'top' 
  | 'top-start' 
  | 'top-end' 
  | 'bottom' 
  | 'bottom-start' 
  | 'bottom-end' 
  | 'left' 
  | 'left-start' 
  | 'left-end' 
  | 'right' 
  | 'right-start' 
  | 'right-end'
  | 'center'

export interface WalkthroughStep {
  id: string
  title: string
  content: string
  target?: string // CSS selector or data-tour attribute
  placement?: WalkthroughPlacement
  spotlightPadding?: number
  disableOverlay?: boolean
  route?: string // Navigate to this route before showing step
  onNext?: () => void
  onPrev?: () => void
}

export interface WalkthroughConfig {
  id: string
  role: WalkthroughRole
  name: string
  description: string
  steps: WalkthroughStep[]
}

export interface WalkthroughState {
  isActive: boolean
  currentTourId: string | null
  currentStepIndex: number
  completedTours: string[]
  hasSeenFirstLogin: boolean
}

export interface WalkthroughProgress {
  userId: string
  role: WalkthroughRole
  completedTours: string[]
  lastStep: number
  completedAt: string | null
  hasSeenFirstLogin: boolean
}

// Storage key for localStorage
export const WALKTHROUGH_STORAGE_KEY = 'stockp_walkthrough_state'

// Default walkthrough state
export const DEFAULT_WALKTHROUGH_STATE: WalkthroughState = {
  isActive: false,
  currentTourId: null,
  currentStepIndex: 0,
  completedTours: [],
  hasSeenFirstLogin: false,
}
