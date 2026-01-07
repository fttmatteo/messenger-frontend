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

    // IOS Handling (PWA Safe)
    if (isIOS) {
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
        // We want to detect if the app opened. If it did, the browser window will likely
        // lose focus (blur) or become hidden (visibilitychange).
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

            // Heuristic 1: If the thread was suspended (e.g. by iOS switching apps), 
            // the actual elapsed time will be significantly larger than the 2500ms timeout 
            // (e.g., if we come back 5 seconds later).
            // However, modern iOS multitasking might keep JS running briefly.

            // Heuristic 2: Check if we detected a blur or visibility change.
            if (!appOpened && !document.hidden && (now - start < 3500)) {
                // If we are still here, visible, focused, and time didn't leap forward:
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
