export interface Logger {
  debug(message: string): void;
  info(message: string): void;
  warn(message: string): void;
  error(message: string): void;
}

export interface LoggerOptions {
  verbose: boolean;
}

export function createLogger(options: LoggerOptions): Logger {
  return {
    debug(message: string): void {
      if (options.verbose) {
        process.stderr.write(`[debug] ${message}\n`);
      }
    },
    info(message: string): void {
      process.stderr.write(`[info] ${message}\n`);
    },
    warn(message: string): void {
      process.stderr.write(`[warn] ${message}\n`);
    },
    error(message: string): void {
      process.stderr.write(`[error] ${message}\n`);
    }
  };
}
