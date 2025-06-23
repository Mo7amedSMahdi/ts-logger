import type { LogSink, LogRecord } from '../types/logger';

const isBrowser = typeof window !== 'undefined';

export class ConsoleSink implements LogSink {
  log(record: LogRecord): void {
    const { level, message, args = [], timestamp, source } = record;
    const base = `[${level}]${timestamp ? ` [${timestamp.toISOString()}]` : ''}`;
    const sourceMeta = formatSourceInfo(source);
    const outputLines = [
      `${base} ${message}`,
      sourceMeta ? `↪ ${sourceMeta}` : undefined
    ].filter(Boolean);

    const levelFn = {
      DEBUG: console.debug,
      INFO: console.info,
      WARN: console.warn,
      ERROR: console.error
    }[level] || console.log;

    if (isBrowser && level in levelColorMap) {
      const color = levelColorMap[level];
      outputLines.forEach(line => {
        levelFn(`%c${line}`, color, ...args);
      });
    } else {
      outputLines.forEach(line => {
        levelFn(line, ...args);
      });
    }
  }
}

function formatSourceInfo(source?: LogRecord['source']): string | undefined {
  if (!source) return;
  const loc = `${source.file ?? 'unknown'}:${source.line ?? '?'}:${source.column ?? '?'}`;
  const fn = source.function ? ` @ ${source.function}` : '';
  return `${loc}${fn}`;
}

const levelColorMap: Record<string, string> = {
  DEBUG: 'color: #9E9E9E',
  INFO: 'color: #2196F3',
  WARN: 'color: #FFC107',
  ERROR: 'color: #F44336',
};

export class MemorySink implements LogSink {
  private records: LogRecord[] = [];
  private max: number;

  constructor(max: number = 1000) {
    this.max = max;
  }

  log(record: LogRecord): void {
    this.records.push(record);
    if (this.records.length > this.max) {
      this.records.shift();
    }
  }

  getLogs(): LogRecord[] {
    return [...this.records];
  }

  clear(): void {
    this.records = [];
  }
}