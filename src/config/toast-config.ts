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
  /**
   * Muestra una notificación de éxito.
   */
  success: (message: string, options?: ExternalToast) => {
    return toast.success(message, {
      id: options?.id ?? message,
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 3000
    })
  },

  /**
   * Muestra una notificación de error con mayor duración por defecto.
   */
  error: (message: string, options?: ExternalToast) => {
    return toast.error(message, {
      id: options?.id ?? message,
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 5000
    })
  },

  /**
   * Muestra una notificación informativa.
   */
  info: (message: string, options?: ExternalToast) => {
    return toast.info(message, {
      id: options?.id ?? message,
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  /**
   * Muestra una notificación de advertencia.
   */
  warning: (message: string, options?: ExternalToast) => {
    return toast.warning(message, {
      id: options?.id ?? message,
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  /**
   * Muestra una notificación de carga persistente que debe ser actualizada o cerrada manualmente.
   * @returns El ID del toast para poder actualizarlo posteriormente.
   */
  loading: (message: string, options?: ExternalToast) => {
    return toast.loading(message, {
      id: options?.id ?? message,
      ...defaultOptions,
      ...options
    })
  },

  /**
   * Muestra un mensaje básico sin iconos de estado.
   */
  custom: (message: string, options?: ExternalToast) => {
    return toast(message, {
      id: options?.id ?? message,
      ...defaultOptions,
      ...options,
      duration: options?.duration ?? 4000
    })
  },

  /**
   * Actualiza un toast existente (útil para estados de carga que han terminado).
   * @param toastId - ID del toast obtenido al usar "loading".
   * @param message - Nuevo mensaje a mostrar.
   * @param type - El nuevo tipo visual (success, error, etc.).
   */
  update: (toastId: string | number, message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    toast[type](message, { id: toastId })
  },

  /**
   * Cierra uno o todos los toasts activos.
   * @param toastId - Si se omite, se cerrarán todos los toasts.
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
 * Gancho (Hook) para acceder a las funcionalidades de notificación desde componentes React.
 */
export const useToast = () => showToast
