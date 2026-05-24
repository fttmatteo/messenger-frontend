const isDev = import.meta.env.DEV;

/**
 * Clase para la gestión centralizada de registros (logs) de la aplicación.
 * Proporciona un formato estandarizado que incluye marcas de tiempo,
 * prefijos de contexto e identificación de correlación para errores.
 */
class Logger {
    private prefix: string;

    constructor(prefix: string = 'App') {
        this.prefix = prefix;
    }

    private formatMessage(message: string, correlationId?: string): string {
        const timestamp = new Date().toISOString();
        const cid = correlationId ? ` [CID:${correlationId}]` : '';
        return `${timestamp} [${this.prefix}]${cid} ${message}`;
    }

    /**
     * Registra un mensaje de depuración. Solo visible en entorno de desarrollo.
     * @param message - Mensaje descriptivo.
     * @param args - Datos adicionales opcionales.
     */
    public debug(message: string, ...args: unknown[]) {
        if (isDev) {
            console.debug(this.formatMessage(message), ...args);
        }
    }

    /**
     * Registra un mensaje informativo. Solo visible en entorno de desarrollo.
     * @param message - Mensaje descriptivo.
     * @param args - Datos adicionales opcionales.
     */
    public info(message: string, ...args: unknown[]) {
        if (isDev) {
            console.info(this.formatMessage(message), ...args);
        }
    }

    /**
     * Registra una advertencia. Solo visible en entorno de desarrollo.
     * @param message - Mensaje descriptivo.
     * @param args - Datos adicionales opcionales.
     */
    public warn(message: string, ...args: unknown[]) {
        if (isDev) {
            console.warn(this.formatMessage(message), ...args);
        }
    }

    /**
     * Registra un error grave. Visible tanto en desarrollo como en producción.
     * @param message - Mensaje descriptivo del error.
     * @param args - Objetos de error o datos adicionales.
     */
    public error(message: string, ...args: unknown[]) {
        console.error(this.formatMessage(message), ...args);
    }

    /**
     * Registra específicamente errores provenientes de peticiones API (Axios).
     * Extrae automáticamente el ID de correlación si está disponible en las cabeceras.
     * @param message - Contexto donde ocurrió el error.
     * @param error - El objeto de error interceptado.
     */
    public apiError(message: string, error: unknown) {
        // Castear a any para acceso simple a propiedades tipo axios, o usar un tipo más específico
        const err = error as {
            response?: {
                headers?: Record<string, string>;
                status?: number;
                data?: unknown;
            };
            config?: { url?: string };
            message: string
        };

        const correlationId = err?.response?.headers?.['x-correlation-id'];
        const status = err?.response?.status;
        const url = err?.config?.url;

        console.error(
            this.formatMessage(`${message} | URL: ${url} | Status: ${status}`, correlationId),
            {
                data: err?.response?.data,
                message: err.message
            }
        );
    }
}

/**
 * Instancia global del logger para uso general del sistema.
 */
export const logger = new Logger('System');

/**
 * Crea una nueva instancia de Logger con un prefijo específico.
 * @param prefix - Etiqueta de contexto para el nuevo logger.
 */
export const createLogger = (prefix: string) => new Logger(prefix);
