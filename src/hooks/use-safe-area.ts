import { useState, useEffect } from 'react'

interface SafeAreaInsets {
    top: number
    right: number
    bottom: number
    left: number
}

/**
 * Hook to get safe area insets for iOS devices with notches/home indicators.
 * Uses CSS environment variables and falls back to computed styles.
 * Updates on resize and orientation change.
 */
export function useSafeArea(): SafeAreaInsets {
    const [insets, setInsets] = useState<SafeAreaInsets>({
        top: 0,
        right: 0,
        bottom: 0,
        left: 0
    })

    useEffect(() => {
        const updateInsets = () => {
            // Create a temporary element to measure the safe area insets
            const testElement = document.createElement('div')
            testElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                padding-top: env(safe-area-inset-top, 0px);
                padding-right: env(safe-area-inset-right, 0px);
                padding-bottom: env(safe-area-inset-bottom, 0px);
                padding-left: env(safe-area-inset-left, 0px);
                pointer-events: none;
                visibility: hidden;
                z-index: -9999;
            `
            document.body.appendChild(testElement)

            const computedStyle = getComputedStyle(testElement)
            const newInsets = {
                top: parseFloat(computedStyle.paddingTop) || 0,
                right: parseFloat(computedStyle.paddingRight) || 0,
                bottom: parseFloat(computedStyle.paddingBottom) || 0,
                left: parseFloat(computedStyle.paddingLeft) || 0
            }

            document.body.removeChild(testElement)
            setInsets(newInsets)
        }

        // Initial measurement
        updateInsets()

        // Re-measure on resize and orientation change
        window.addEventListener('resize', updateInsets)
        window.addEventListener('orientationchange', updateInsets)

        return () => {
            window.removeEventListener('resize', updateInsets)
            window.removeEventListener('orientationchange', updateInsets)
        }
    }, [])

    return insets
}

/**
 * Returns just the bottom safe area inset value
 */
export function useSafeAreaBottom(): number {
    const { bottom } = useSafeArea()
    return bottom
}
