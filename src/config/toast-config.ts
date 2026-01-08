import { toast } from 'sonner'
import type { ExternalToast } from 'sonner'

/**
 * Configuración global y centralizada para notificaciones
 * Proporciona métodos consistentes para todas las notificaciones en la aplicación
 */

const defaultOptions: ExternalToast = {
  duration: 4000,
}

export const showToast = {
  /**
   * Notificación de éxito
   */
  success: (message: string, options?: ExternalToast) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 3000
    })
  },

  /**
   * Notificación de error
   */
  error: (message: string, options?: ExternalToast) => {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 5000
    })
  },

  /**
   * Notificación informativa
   */
  info: (message: string, options?: ExternalToast) => {
    toast.info(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  /**
   * Notificación de advertencia
   */
  warning: (message: string, options?: ExternalToast) => {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  /**
   * Notificación de carga
   */
  loading: (message: string, options?: ExternalToast) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options
    })
  },

  /**
   * Notificación personalizada
   */
  custom: (message: string, options?: ExternalToast) => {
    toast(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  /**
   * Actualizar una notificación existente
   */
  update: (toastId: string | number, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    toast[type](message, { id: toastId })
  },

  /**
   * Cerrar una notificación específica
   */
  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }
}

/**
 * Hook para usar las notificaciones en componentes
 * Alternativa a importar directamente showToast
 */
export const useToast = () => showToast
