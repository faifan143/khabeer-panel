import { useEffect, useState } from 'react'

/**
 * Hook to prevent hydration mismatches by ensuring client-side only rendering
 * for components that depend on browser-specific APIs like localStorage
 */
export function useHydrationSafe() {
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    return isClient
}
