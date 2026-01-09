import { MetadataRoute } from 'next'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
    // Default values
    let name = 'StockInvest'
    let shortName = 'StockInvest'
    let description = 'Company Share Investment Platform'
    let themeColor = '#3b82f6' // Default Blue
    let backgroundColor = '#ffffff'

    try {
        // Use native fetch for server-side compatibility
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
        const response = await fetch(`${apiUrl}/v1/settings/public`, {
            next: { revalidate: 60 }, // Cache for 60 seconds
        })

        if (response.ok) {
            const data = await response.json()
            if (data.success && data.data) {
                const settings = data.data as Record<string, any>
                name = (settings.platform_name as string) || name
                shortName = (settings.platform_name as string) || shortName
                description = (settings.platform_tagline as string) || description
                themeColor = (settings.primary_color as string) || themeColor
            }
        }
    } catch (error) {
        console.error('Failed to fetch settings for manifest:', error)
    }

    return {
        name,
        short_name: shortName,
        description,
        start_url: '/',
        display: 'standalone',
        background_color: backgroundColor,
        theme_color: themeColor,
        icons: [
            {
                src: '/icons/icon-192x192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512x512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    }
}
