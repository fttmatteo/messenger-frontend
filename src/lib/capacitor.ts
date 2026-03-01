import { Capacitor } from '@capacitor/core'

/**
 * Retorna true si la aplicación se está ejecutando en un dispositivo nativo (iOS o Android)
 * a través de Capacitor. Retorna false si está en un navegador web o PWA.
 */
export const isNative = (): boolean => Capacitor.isNativePlatform()

/**
 * Retorna la plataforma actual ('web', 'ios', 'android')
 */
export const getPlatform = (): string => Capacitor.getPlatform()

/**
 * Retorna true específicamente para Android
 */
export const isAndroid = (): boolean => Capacitor.getPlatform() === 'android'

/**
 * Retorna true específicamente para iOS
 */
export const isIOS = (): boolean => Capacitor.getPlatform() === 'ios'
