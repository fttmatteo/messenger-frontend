import { useState, useEffect } from "react"

export function useDeviceType() {
    const [device, setDevice] = useState({
        isIOS: false,
        isAndroid: false,
        isMobile: false, // General mobile check
    })

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined' || !window.navigator) return

        const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera

        // iOS detection from StackOverflow / standard regex
        // Checks for iPhone, iPad, iPod and explicitly excludes Windows Stream identifiers
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream

        // Android detection
        const isAndroid = /android/i.test(userAgent)

        setDevice({
            isIOS,
            isAndroid,
            isMobile: isIOS || isAndroid
        })
    }, [])

    return device
}
