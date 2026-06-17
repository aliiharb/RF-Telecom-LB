// Provides environment-controlled structured logging for server-side helpers.
type LogLevel = "debug" | "info" | "warn" | "error";

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_LOG_LEVEL: LogLevel = "warn";

function getLogLevel() {
  const configuredLevel = process.env.LOG_LEVEL || process.env.VITE_LOG_LEVEL || DEFAULT_LOG_LEVEL;
  return configuredLevel in LOG_LEVELS ? (configuredLevel as LogLevel) : DEFAULT_LOG_LEVEL;
}

function writeLog(level: LogLevel, context: string, message: string, data?: unknown) {
  if (LOG_LEVELS[level] < LOG_LEVELS[getLogLevel()]) {
    return;
  }

  const payload = {
    level,
    context,
    message,
    ...(data === undefined ? {} : { data }),
  };

  process[level === "error" ? "stderr" : "stdout"].write(`${JSON.stringify(payload)}\n`);
}

export const logger = {
  debug: (context: string, message: string, data?: unknown) => writeLog("debug", context, message, data),
  info: (context: string, message: string, data?: unknown) => writeLog("info", context, message, data),
  warn: (context: string, message: string, data?: unknown) => writeLog("warn", context, message, data),
  error: (context: string, message: string, data?: unknown) => writeLog("error", context, message, data),
};
