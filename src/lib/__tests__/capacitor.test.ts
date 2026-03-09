import { describe, it, expect, vi } from 'vitest'
import { Capacitor } from '@capacitor/core'
import { isNative, getPlatform, isAndroid, isIOS } from '../capacitor'

vi.mock('@capacitor/core', () => ({
    Capacitor: {
        isNativePlatform: vi.fn(),
        getPlatform: vi.fn(),
    }
}))

describe('capacitor lib', () => {
    it('isNative should return true for native platforms', () => {
        vi.mocked(Capacitor.isNativePlatform).mockReturnValue(true)
        expect(isNative()).toBe(true)
    })

    it('getPlatform should return the current platform', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('ios')
        expect(getPlatform()).toBe('ios')
    })

    it('isAndroid should identify android', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('android')
        expect(isAndroid()).toBe(true)
        expect(isIOS()).toBe(false)
    })

    it('isIOS should identify ios', () => {
        vi.mocked(Capacitor.getPlatform).mockReturnValue('ios')
        expect(isIOS()).toBe(true)
        expect(isAndroid()).toBe(false)
    })

    it('should return false for isNative when platform is web', () => {
        vi.mocked(Capacitor.isNativePlatform).mockReturnValue(false)
        expect(isNative()).toBe(false)
    })
})
