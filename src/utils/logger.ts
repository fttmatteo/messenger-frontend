/**
 * Utility for controlled logging.
 * Logs are only output to console in development mode or if explicitly enabled.
 */

const isDev = import.meta.env.DEV;



class Logger {
    private prefix: string;

    constructor(prefix: string = 'App') {
        this.prefix = prefix;
    }

    private formatMessage(message: string): string {
        return `[${this.prefix}] ${message}`;
    }

    public info(message: string, ...args: any[]) {
        if (isDev) {
            console.log(this.formatMessage(message), ...args);
        }
    }

    public warn(message: string, ...args: any[]) {
        // Warnings are usually important enough to show in prod too, 
        // but we can silence them if strictness is required.
        // For now, let's keep them in dev only to meet the "clean console" requirement strictly,
        // or allow them if they are critical. 
        // Providing a safe default:
        if (isDev) {
            console.warn(this.formatMessage(message), ...args);
        }
    }

    public error(message: string, ...args: any[]) {
        // Errors should generally be visible, but maybe not full stack traces to users.
        console.error(this.formatMessage(message), ...args);
    }

    public debug(message: string, ...args: any[]) {
        if (isDev) {
            console.debug(this.formatMessage(message), ...args);
        }
    }
}

export const logger = new Logger('System');

export const createLogger = (prefix: string) => new Logger(prefix);
