import { toast } from "sonner"
import type React from "react"

/**
 * Utility for handling map navigation safely across devices and contexts (PWA vs Web).
 * 
 * - PWA (Installed): Opens native Maps application
 * - Web (Browser): Opens Google Maps in a new tab
 */

interface Location {
    latitude?: number;
    longitude?: number;
    address?: string;
}

/**
 * Detects if the app is running as a PWA (installed) or as a web app (browser).
 */
const isPWA = (): boolean => {
    // Check for standalone mode (iOS PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                        (window.navigator as Navigator & { standalone?: boolean }).standalone;
    
    // Check for fullscreen mode (Android PWA installed)
    const isFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;
    
    return isStandalone || isFullscreen;
}

/**
 * Opens the native maps application (PWA) or Google Maps in browser (Web).
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

    // Build web URL for fallback
    let webUrl = '';
    if (latitude && longitude) {
        webUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
        if (originLat && originLng) {
            webUrl += `&origin=${originLat},${originLng}`;
        }
    } else if (address) {
        webUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    }

    // Check if running as PWA
    const runningAsPWA = isPWA();

    // Web Browser Context - Open in new tab
    if (!runningAsPWA) {
        window.open(webUrl, '_blank', 'noopener,noreferrer');
        return;
    }

    // PWA Context - Try to open native app
    if (isIOS) {
        // iOS PWA - Try to open Google Maps app
        let iosUrl = '';
        if (latitude && longitude) {
            iosUrl = `comgooglemaps://?daddr=${latitude},${longitude}&directionsmode=driving`;
        } else if (address) {
            iosUrl = `comgooglemaps://?daddr=${encodeURIComponent(address)}&directionsmode=driving`;
        }

        // App Store URL using iTunes scheme (more reliable on iOS)
        const appStoreUrl = "itms-apps://apps.apple.com/us/app/google-maps/id585027354";
        
        toast.info("Abriendo Google Maps...", {
            description: "¿No abre? Toca aquí para instalar la App.",
            action: {
                label: "Instalar",
                onClick: (event: React.MouseEvent<HTMLButtonElement>) => {
                    event.preventDefault();
                    try {
                        // Create a link element and click it for better compatibility with PWA
                        const link = document.createElement('a');
                        link.href = appStoreUrl;
                        link.rel = 'noopener noreferrer';
                        link.target = '_blank';
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                    } catch (error) {
                        console.error('Error opening App Store:', error);
                        // Fallback to web URL if iTunes scheme fails
                        const webLink = document.createElement('a');
                        webLink.href = "https://apps.apple.com/us/app/google-maps/id585027354";
                        webLink.rel = 'noopener noreferrer';
                        webLink.target = '_blank';
                        document.body.appendChild(webLink);
                        webLink.click();
                        document.body.removeChild(webLink);
                    }
                },
            },
            duration: 5000,
        });

        // Iframe Injection Technique to trigger the app
        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', iosUrl);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Clean up
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        }, 1000);
    } else {
        // Android PWA - Use intent URL to trigger Google Maps
        const androidIntentUrl = `intent://maps.google.com/maps/search/?api=1${latitude && longitude ? `&destination=${latitude},${longitude}` : `&query=${encodeURIComponent(address || '')}`}#Intent;scheme=https;package=com.google.android.apps.maps;end`;
        
        // Fallback to web URL if intent doesn't work
        toast.info("Abriendo Google Maps...", {
            duration: 3000,
        });

        const iframe = document.createElement('iframe');
        iframe.setAttribute('src', androidIntentUrl);
        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        // Fallback to web URL after a short delay
        setTimeout(() => {
            if (document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
            // If app didn't open, open web version
            window.open(webUrl, '_blank', 'noopener,noreferrer');
        }, 2000);
    }
};
