'use client'

import { useEffect, useState } from 'react'
import { useSettings } from '@/contexts/SettingsContext'

/**
 * ThemeLoader component
 * Shows a loading screen until the theme is fully loaded and applied.
 * Prevents flash of unstyled content (FOUC) on page load/refresh.
 */
export function ThemeLoader({ children }: { children: React.ReactNode }) {
    const { loading: settingsLoading } = useSettings()
    const [themeReady, setThemeReady] = useState(false)

    useEffect(() => {
        // Check if theme was applied from cache (set by inline script)
        const themeApplied = document.documentElement.dataset.themeApplied === 'true'

        if (themeApplied || !settingsLoading) {
            // Small delay to ensure CSS variables are fully applied
            const timer = setTimeout(() => {
                setThemeReady(true)
            }, 50)
            return () => clearTimeout(timer)
        }
    }, [settingsLoading])

    // Show loading screen while theme is loading
    if (!themeReady) {
        return (
            <div
                className="fixed inset-0 bg-background flex items-center justify-center z-[9999]"
                style={{
                    // Use inline styles as fallback in case CSS variables aren't loaded
                    backgroundColor: 'var(--background, #ffffff)',
                }}
            >
                <div className="text-center space-y-4">
                    <div className="relative">
                        {/* Animated loader */}
                        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"
                            style={{
                                borderColor: 'rgba(59, 130, 246, 0.2)',
                                borderTopColor: 'var(--primary, #3b82f6)',
                            }}
                        />
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-primary rounded-full animate-spin mx-auto"
                            style={{
                                borderTopColor: 'var(--primary, #3b82f6)',
                                animationDuration: '0.75s',
                            }}
                        />
                    </div>
                    <p className="text-muted-foreground text-sm" style={{ color: 'var(--muted-foreground, #6b7280)' }}>
                        Loading...
                    </p>
                </div>
            </div>
        )
    }

    return <>{children}</>
}

export default ThemeLoader
