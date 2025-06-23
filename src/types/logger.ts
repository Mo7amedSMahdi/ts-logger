export interface LogLevel {
  name: string;
  priority: number;
  color?: string;
}

export interface LogRecord {
  level: string;
  message: string;
  args?: unknown[];
  timestamp: Date;
  context?: Record<string, any>;
  source?: {
    file?: string;
    function?: string;
    line?: number;
    column?: number;
  };
  originalError?: Error;
}

export interface LogSink {
  log: (record: LogRecord) => void;
  flush?: () => void;
  clear?: () => void;
}

export interface LoggerOptions {
  minLevel?: string;
  levels?: LogLevel[];
  sinks?: LogSink[];
  enableColors?: boolean;
  enableTimestamp?: boolean;
  enableSourceTagging?: boolean;
  contextProvider?: () => Record<string, any>;
  rateLimit?: {
    enabled: boolean;
    intervalMs: number;
    maxLogs: number;
  };
  storeLimit?: number;
}
