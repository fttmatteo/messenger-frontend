import { toast } from 'sonner'
import type { ExternalToast } from 'sonner'

const defaultOptions: ExternalToast = {
  duration: 4000,
}

/**
 * Objeto de utilidad centralizado para la gestión de notificaciones visuales (Toasts).
 * Utiliza la librería "sonner" y define comportamientos consistentes para toda la app.
 */
export const showToast = {
  success: (message: string, options?: ExternalToast) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
      id: options?.id ?? message,
      duration: options?.duration ?? defaultOptions.duration
    })
  },

  error: (message: string, options?: ExternalToast) => {
    return toast.error(message, {
      ...defaultOptions,
      ...options,
      id: options?.id ?? message,
      duration: options?.duration ?? defaultOptions.duration
    })
  },

  info: (message: string, options?: ExternalToast) => {
    return toast.info(message, {
      ...defaultOptions,
      ...options,
      id: options?.id ?? message,
      duration: options?.duration ?? defaultOptions.duration
    })
  },

  warning: (message: string, options?: ExternalToast) => {
    return toast.warning(message, {
      ...defaultOptions,
      ...options,
      id: options?.id ?? message,
      duration: options?.duration ?? defaultOptions.duration
    })
  },

  loading: (message: string, options?: ExternalToast) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
      id: options?.id ?? message,
    })
  },

  custom: (message: string, options?: ExternalToast) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
      id: options?.id ?? message,
      duration: options?.duration ?? defaultOptions.duration
    })
  },

  update: (toastId: string | number, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    toast[type](message, { id: toastId })
  },

  dismiss: (toastId?: string | number) => {
    if (toastId) {
      toast.dismiss(toastId)
    } else {
      toast.dismiss()
    }
  }
}

export const useToast = () => showToast
