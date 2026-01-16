import { toast } from 'sonner'
import type { ExternalToast } from 'sonner'

const defaultOptions: ExternalToast = {
  duration: 4000,
}

export const showToast = {
  success: (message: string, options?: ExternalToast) => {
    toast.success(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 3000
    })
  },

  error: (message: string, options?: ExternalToast) => {
    toast.error(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 5000
    })
  },

  info: (message: string, options?: ExternalToast) => {
    toast.info(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  warning: (message: string, options?: ExternalToast) => {
    toast.warning(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  loading: (message: string, options?: ExternalToast) => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options
    })
  },

  custom: (message: string, options?: ExternalToast) => {
    toast(message, {
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
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
