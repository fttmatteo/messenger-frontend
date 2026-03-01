import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSmartLocation } from './use-smart-location'
import { trackingService } from '@/services/tracking.service'
import { Geolocation } from '@capacitor/geolocation'
import * as capacitorLib from '@/lib/capacitor'

// Mocks
vi.mock('@/services/tracking.service', () => ({
    trackingService: {
        getLastKnownLocation: vi.fn(),
        setLastLocation: vi.fn(),
    }
}))

vi.mock('@capacitor/geolocation', () => ({
    Geolocation: {
        checkPermissions: vi.fn(),
        requestPermissions: vi.fn(),
        getCurrentPosition: vi.fn(),
    }
}))

vi.mock('@/lib/capacitor', () => ({
    isNative: vi.fn(),
}))

vi.mock('@/utils/logger', () => ({
    createLogger: () => ({
        error: vi.fn(),
        debug: vi.fn(),
        warn: vi.fn(),
        info: vi.fn()
    })
}))

vi.mock('@/config/toast-config', () => ({
    showToast: {
        warning: vi.fn(),
        error: vi.fn(),
    }
}))

describe('useSmartLocation', () => {
    const mockGeolocation = window.navigator.geolocation;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock web geolocation
        const mockGetCurrentPosition = vi.fn().mockImplementation((success) =>
            success({ coords: { latitude: 40, longitude: -70 } })
        );

        Object.defineProperty(window.navigator, 'geolocation', {
            configurable: true,
            value: {
                getCurrentPosition: mockGetCurrentPosition,
            }
        });
    })

    afterEach(() => {
        // Restore
        if (mockGeolocation) {
            Object.defineProperty(window.navigator, 'geolocation', {
                configurable: true,
                value: mockGeolocation
            });
        }
    })

    it('should return cached location if recent', async () => {
        vi.mocked(trackingService.getLastKnownLocation).mockReturnValue({
            latitude: 10,
            longitude: 20,
            timestamp: Date.now() - 1000 // 1 sec ago (recent)
        });

        const { result } = renderHook(() => useSmartLocation())

        let location;
        await act(async () => {
            location = await result.current.getCurrentLocation();
        });

        expect(location).toEqual({ latitude: 10, longitude: 20 });
        expect(capacitorLib.isNative).not.toHaveBeenCalled(); // Should not even check native
    })

    it('should fetch from Capacitor Geolocation with maximumAge 0 if isNative is true', async () => {
        vi.mocked(trackingService.getLastKnownLocation).mockReturnValue(null);
        vi.mocked(capacitorLib.isNative).mockReturnValue(true);
        vi.mocked(Geolocation.checkPermissions).mockResolvedValue({ location: 'granted', coarseLocation: 'granted' });
        vi.mocked(Geolocation.getCurrentPosition).mockResolvedValue({
            coords: { latitude: 50, longitude: 50, accuracy: 10, altitude: null, altitudeAccuracy: null, heading: null, speed: null },
            timestamp: 123
        });

        const { result } = renderHook(() => useSmartLocation())

        let location;
        await act(async () => {
            location = await result.current.getCurrentLocation();
        });

        expect(location).toEqual({ latitude: 50, longitude: 50 });
        expect(Geolocation.getCurrentPosition).toHaveBeenCalledWith({
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0 // Verifying the fresh coordinate requirement
        });
        expect(trackingService.setLastLocation).toHaveBeenCalledWith(50, 50);
    })

    it('should fetch from Web API with maximumAge 0 if isNative is false', async () => {
        vi.mocked(trackingService.getLastKnownLocation).mockReturnValue(null);
        vi.mocked(capacitorLib.isNative).mockReturnValue(false);

        const { result } = renderHook(() => useSmartLocation())

        let location;
        await act(async () => {
            location = await result.current.getCurrentLocation();
        });

        expect(location).toEqual({ latitude: 40, longitude: -70 });

        // Ensure standard navigator gets called
        expect(window.navigator.geolocation.getCurrentPosition).toHaveBeenCalled();

        // Assert tracking service saves last location
        expect(trackingService.setLastLocation).toHaveBeenCalledWith(40, -70);
    })
})
