const isDev = import.meta.env.DEV;

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

    public debug(message: string, ...args: unknown[]) {
        if (isDev) {
            console.debug(this.formatMessage(message), ...args);
        }
    }

    public info(message: string, ...args: unknown[]) {
        if (isDev) {
            console.info(this.formatMessage(message), ...args);
        }
    }

    public warn(message: string, ...args: unknown[]) {
        if (isDev) {
            console.warn(this.formatMessage(message), ...args);
        }
    }

    public error(message: string, ...args: unknown[]) {
        console.error(this.formatMessage(message), ...args);
    }

    public apiError(message: string, error: unknown) {
        // Cast to any for simple access to axios-like properties, or use a more specific type
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

export const logger = new Logger('System');

export const createLogger = (prefix: string) => new Logger(prefix);
