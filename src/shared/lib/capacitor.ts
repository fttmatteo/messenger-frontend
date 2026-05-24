import { Capacitor } from '@capacitor/core'

export const isNative = (): boolean => Capacitor.isNativePlatform()

export const getPlatform = (): string => Capacitor.getPlatform()

export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android'

export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios'
