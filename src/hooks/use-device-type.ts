import { useState } from "react"

// Extended window interface to satisfy TS without using 'any'
interface ExtendedWindow extends Window {
    opera?: string;
    MSStream?: unknown;
}

export function useDeviceType() {
    // Initialize state lazily to avoid "setState in useEffect" error and support SSR
    const [device] = useState(() => {
        if (typeof window === 'undefined' || !window.navigator) {
            return {
                isIOS: false,
                isAndroid: false,
                isMobile: false
            }
        }

        const extWindow = window as ExtendedWindow;
        // Check for Opera property safely
        const userAgent = navigator.userAgent || navigator.vendor || (extWindow.opera ? String(extWindow.opera) : "");

        // iOS detection
        // Explicitly cast MSStream check
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !extWindow.MSStream;

        // Android detection
        const isAndroid = /android/i.test(userAgent);

        return {
            isIOS,
            isAndroid,
            isMobile: isIOS || isAndroid
        }
    })

    // No need for useEffect if the UserAgent doesn't change dynamically.
    // However, if we wanted to listen to resize events for responsiveness we would add that here.
    // For UA detection, static initialization is correct.

    return device
}
