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

    public apiError(message: string, error: any) {
        const correlationId = error?.response?.headers?.['x-correlation-id'];
        const status = error?.response?.status;
        const url = error?.config?.url;

        console.error(
            this.formatMessage(`${message} | URL: ${url} | Status: ${status}`, correlationId),
            {
                data: error?.response?.data,
                message: error.message
            }
        );
    }
}

export const logger = new Logger('System');

export const createLogger = (prefix: string) => new Logger(prefix);
