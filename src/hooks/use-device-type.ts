import { useState } from "react"

interface ExtendedWindow extends Window {
    opera?: string;
    MSStream?: unknown;
}

export function useDeviceType() {
    const [device] = useState(() => {
        if (typeof window === 'undefined' || !window.navigator) {
            return {
                isIOS: false,
                isAndroid: false,
                isMobile: false
            }
        }

        const extWindow = window as ExtendedWindow;
        const userAgent = navigator.userAgent || navigator.vendor || (extWindow.opera ? String(extWindow.opera) : "");
        const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !extWindow.MSStream;
        const isAndroid = /android/i.test(userAgent);

        return {
            isIOS,
            isAndroid,
            isMobile: isIOS || isAndroid
        }
    })

    return device
}
