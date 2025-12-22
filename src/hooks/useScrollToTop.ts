import { useState, useEffect, useCallback } from "react"

interface UseScrollToTopOptions {
    /** Scroll threshold in pixels to show the button (default: 300) */
    threshold?: number
    /** Whether this hook should be active (typically only on mobile) */
    enabled?: boolean
}

interface UseScrollToTopReturn {
    /** Whether the scroll-to-top button should be shown */
    showScrollTop: boolean
    /** Scroll to the top of the page with smooth animation */
    scrollToTop: () => void
}

/**
 * A hook to manage scroll-to-top functionality.
 * Tracks scroll position and provides a function to scroll back to top.
 */
export function useScrollToTop({
    threshold = 300,
    enabled = true
}: UseScrollToTopOptions = {}): UseScrollToTopReturn {
    const [showScrollTop, setShowScrollTop] = useState(false)

    useEffect(() => {
        if (!enabled) {
            setShowScrollTop(false)
            return
        }

        const handleScroll = () => {
            const scrolled = window.scrollY > threshold
            setShowScrollTop(scrolled)
        }

        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [enabled, threshold])

    const scrollToTop = useCallback(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }, [])

    return {
        showScrollTop,
        scrollToTop,
    }
}
