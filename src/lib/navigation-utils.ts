import { toast } from "sonner"

/**
 * Utility for handling map navigation safely across devices, especially for PWAs on iOS.
 */

interface Location {
    latitude?: number;
    longitude?: number;
    address?: string;
}

/**
 * Opens the native maps application or a web fallback.
 * 
 * @param destination The destination location (lat/lng or address).
 * @param isIOS Boolean indicating if the current device is iOS.
 * @param originLat Optional origin latitude.
 * @param originLng Optional origin longitude.
 */
export const openMaps = (
    destination: Location,
    isIOS: boolean,
    originLat?: number,
    originLng?: number
) => {
    const { latitude, longitude, address } = destination;

    if (!latitude && !longitude && !address) {
        console.warn("No location provided for navigation");
        return;
    }

    // Fallback URL for Android/Desktop/Web
    let url = '';
    if (latitude && longitude) {
        url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        if (originLat && originLng) {
            url += `&origin=${originLat},${originLng}`;
        }
    } else if (address) {
        url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    // IOS Handling
    if (isIOS) {
        // Check if running in standalone mode (PWA)
        // 'standalone' property is non-standard but works on iOS Safari
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone;

        if (!isStandalone) {
            // iOS Browser (Safari) -> Open in new tab (Web behavior like Admin)
            // This avoids the 'Open in App' prompts and fallback issues in the browser context
            window.location.href = url;
            return;
        }

        // iOS PWA (Installed) -> Try to open Native App
        let iosUrl = '';
        if (latitude && longitude) {
            iosUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
            // Support for Apple Maps fallback if specific user preference handling is added later
            // But for now sticking to the requested Google Maps strict requirement
        } else if (address) {
            iosUrl = `comgooglemaps://?daddr=${encodeURIComponent(address)}&directionsmode=driving`;
        }

        const appStoreUrl = "https://apps.apple.com/us/app/google-maps/id585027354";
        const start = Date.now();

        // Iframe Injection Technique
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', iosUrl);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Standard clean up
        setTimeout(() => {
            document.body.removeChild(iframe);
        }, 1000);

        // --- Robust Fallback Logic ---
        let appOpened = false;

        const onBlur = () => { appOpened = true; };
        const onVisibilityChange = () => {
            if (document.hidden) appOpened = true;
        };

        window.addEventListener('blur', onBlur);
        document.addEventListener('visibilitychange', onVisibilityChange);

        setTimeout(() => {
            // Clean up listeners
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('visibilitychange', onVisibilityChange);

            const now = Date.now();

            // Heuristic: If detecting app switch failed (still visible/focused) and time hasn't skipped
            if (!appOpened && !document.hidden && (now - start < 3500)) {
                if (confirm("¿No tienes Google Maps instalado? Ir a la tienda.")) {
                    window.location.href = appStoreUrl;
                }
            }
        }, 2500);
    } else {
        // Android / Desktop
        // Using window.location.href maps to intent on Android PWA usually better than window.open
        // ensuring no empty tab is left behind.
        window.location.href = url;
    }
};
