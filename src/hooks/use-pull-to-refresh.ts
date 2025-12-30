import { useRef, useState, useCallback, useEffect } from 'react'

interface UsePullToRefreshOptions {
    onRefresh: () => Promise<void>
    threshold?: number
    disabled?: boolean
}

export function usePullToRefresh({
    onRefresh,
    threshold = 80,
    disabled = false
}: UsePullToRefreshOptions) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [isPulling, setIsPulling] = useState(false)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)

    const startY = useRef(0)
    const currentY = useRef(0)

    const handleTouchStart = useCallback((e: TouchEvent) => {
        if (disabled || isRefreshing) return

        const container = containerRef.current
        if (!container) return

        // Only activate if scrolled to top
        if (container.scrollTop > 0) return

        startY.current = e.touches[0].clientY
        setIsPulling(true)
    }, [disabled, isRefreshing])

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!isPulling || disabled || isRefreshing) return

        currentY.current = e.touches[0].clientY
        const delta = Math.max(0, currentY.current - startY.current)

        // Apply resistance
        const resistance = 0.5
        const distance = Math.min(delta * resistance, threshold * 1.5)

        setPullDistance(distance)

        // Prevent default scroll if pulling
        if (distance > 0) {
            e.preventDefault()
        }
    }, [isPulling, disabled, isRefreshing, threshold])

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling || disabled) return

        setIsPulling(false)

        if (pullDistance >= threshold && !isRefreshing) {
            setIsRefreshing(true)
            try {
                await onRefresh()
            } finally {
                setIsRefreshing(false)
            }
        }

        setPullDistance(0)
    }, [isPulling, pullDistance, threshold, isRefreshing, disabled, onRefresh])

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        container.addEventListener('touchstart', handleTouchStart, { passive: true })
        container.addEventListener('touchmove', handleTouchMove, { passive: false })
        container.addEventListener('touchend', handleTouchEnd)

        return () => {
            container.removeEventListener('touchstart', handleTouchStart)
            container.removeEventListener('touchmove', handleTouchMove)
            container.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTouchStart, handleTouchMove, handleTouchEnd])

    return {
        containerRef,
        isPulling,
        isRefreshing,
        pullDistance,
        pullProgress: Math.min(pullDistance / threshold, 1)
    }
}
