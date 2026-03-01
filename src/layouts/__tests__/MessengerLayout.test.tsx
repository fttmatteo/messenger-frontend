import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import React from 'react'
import { render, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MessengerLayout from '../MessengerLayout'
import { trackingService } from '@/services/tracking.service'
import * as capacitorLib from '@/lib/capacitor'
import * as authContext from '@/context/AuthContext'

// Mocks
vi.mock('@/context/AuthContext', () => ({
    useAuth: vi.fn(),
    AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

vi.mock('@/services/tracking.service', () => ({
    trackingService: {
        isCurrentlyConnected: vi.fn(),
        connect: vi.fn(),
        sendUpdate: vi.fn(),
        setLastLocation: vi.fn(),
        disconnect: vi.fn(),
        sendHeartbeat: vi.fn()
    }
}))

vi.mock('@/services/auth.service', () => ({
    authService: {
        getWsToken: vi.fn().mockResolvedValue('test-token'),
    }
}))

const { mockAddWatcher, mockRemoveWatcher } = vi.hoisted(() => {
    return {
        mockAddWatcher: vi.fn().mockResolvedValue('test-watcher-id'),
        mockRemoveWatcher: vi.fn().mockResolvedValue(undefined)
    }
});

vi.mock('@capacitor/core', () => ({
    registerPlugin: () => ({
        addWatcher: mockAddWatcher,
        removeWatcher: mockRemoveWatcher
    })
}))

vi.mock('@/hooks/use-network', () => ({
    useNetwork: vi.fn().mockReturnValue({ isOnline: true, pendingActionsCount: 0 })
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

describe('MessengerLayout Background Tracking', () => {
    const mockGeolocation = window.navigator.geolocation;
    let mockWatchPosition: ReturnType<typeof vi.fn>;
    let mockClearWatch: ReturnType<typeof vi.fn>;
    let mockGetCurrentPosition: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        vi.clearAllMocks();

        mockWatchPosition = vi.fn().mockReturnValue(12345);
        mockClearWatch = vi.fn();
        mockGetCurrentPosition = vi.fn();

        Object.defineProperty(window.navigator, 'geolocation', {
            configurable: true,
            value: {
                watchPosition: mockWatchPosition,
                clearWatch: mockClearWatch,
                getCurrentPosition: mockGetCurrentPosition
            }
        });

        vi.mocked(authContext.useAuth).mockReturnValue({
            user: { id: 1, name: 'Test', isOnline: true, document: 12345 },
            isAuthenticated: true,
            isLoading: false,
            login: vi.fn(),
            logout: vi.fn(),
            updateUser: vi.fn(),
            hasRole: vi.fn()
        } as unknown as ReturnType<typeof authContext.useAuth>);

        vi.mocked(trackingService.isCurrentlyConnected).mockReturnValue(true);
    })

    afterEach(() => {
        if (mockGeolocation) {
            Object.defineProperty(window.navigator, 'geolocation', {
                configurable: true,
                value: mockGeolocation
            });
        }
    })

    const renderLayout = () => {
        return render(
            <BrowserRouter>
                <MessengerLayout />
            </BrowserRouter>
        );
    }

    it('should use BackgroundGeolocation Native plugin when isNative() is true', async () => {
        vi.mocked(capacitorLib.isNative).mockReturnValue(true);

        renderLayout();

        await waitFor(() => {
            expect(mockAddWatcher).toHaveBeenCalled();
            expect(mockAddWatcher.mock.calls[0][0]).toMatchObject({
                backgroundMessage: expect.any(String),
                requestPermissions: true,
                stale: false
            });
            expect(mockWatchPosition).not.toHaveBeenCalled();
            expect(mockGetCurrentPosition).not.toHaveBeenCalled();
        });
    })

    it('should use navigator.geolocation when isNative() is false', async () => {
        vi.mocked(capacitorLib.isNative).mockReturnValue(false);

        renderLayout();

        await waitFor(() => {
            expect(mockGetCurrentPosition).toHaveBeenCalled();
            expect(mockWatchPosition).toHaveBeenCalled();
            expect(mockWatchPosition.mock.calls[0][2]).toMatchObject({
                enableHighAccuracy: true,
                maximumAge: 0 // New strict logic
            });
            expect(mockAddWatcher).not.toHaveBeenCalled();
        });
    })

    it('should disconnect plugin watchers on unmount if native', async () => {
        vi.mocked(capacitorLib.isNative).mockReturnValue(true);

        const { unmount } = renderLayout();

        // Wait for watcher to register
        await waitFor(() => {
            expect(mockAddWatcher).toHaveBeenCalled();
        });

        // Unmounting should clear the watcher and also the offline lifecycle unmounts
        unmount();

        await waitFor(() => {
            expect(mockRemoveWatcher).toHaveBeenCalledWith({ id: 'test-watcher-id' });
            expect(mockClearWatch).not.toHaveBeenCalled();
        });
    })

    it('should call clearWatch on unmount if web', async () => {
        vi.mocked(capacitorLib.isNative).mockReturnValue(false);

        const { unmount } = renderLayout();

        await waitFor(() => {
            expect(mockWatchPosition).toHaveBeenCalled();
        });

        unmount();

        await waitFor(() => {
            expect(mockClearWatch).toHaveBeenCalledWith(12345);
            expect(mockRemoveWatcher).not.toHaveBeenCalled();
        });
    })
})
