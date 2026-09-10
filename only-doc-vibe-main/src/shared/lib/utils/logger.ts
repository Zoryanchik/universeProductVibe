type LogLevel = "info" | "warn" | "error" | "debug";

class Logger {
  private static instance: Logger;

  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }

    return Logger.instance;
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();

    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  public log(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.log(this.formatMessage("info", message), ...args);
    }
  }

  public warn(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.warn(this.formatMessage("warn", message), ...args);
    }
  }

  public error(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.error(this.formatMessage("error", message), ...args);
    }
  }

  public debug(message: string, ...args: unknown[]): void {
    if (import.meta.env.DEV) {
      console.debug(this.formatMessage("debug", message), ...args);
    }
  }
}

export const logger = Logger.getInstance();
