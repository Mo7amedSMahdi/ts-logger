import { LoggerOptions, LogRecord, LogSink, LogLevel } from '../types/logger';
import { getSourceInfo } from './stackParser';
import { RateLimiter } from './rateLimiter';

const DEFAULT_LEVELS: LogLevel[] = [
  { name: 'DEBUG', priority: 0, color: 'color: #9E9E9E' },
  { name: 'INFO', priority: 1, color: 'color: #2196F3' },
  { name: 'WARN', priority: 2, color: 'color: #FFC107' },
  { name: 'ERROR', priority: 3, color: 'color: #F44336' },
];

export class Logger {
  private levels: Record<string, LogLevel>;
  private minPriority: number;
  private sinks: LogSink[];
  private enableColors: boolean;
  private enableTimestamp: boolean;
  private enableSourceTagging: boolean;
  private contextProvider?: () => Record<string, any>;
  private rateLimiter?: RateLimiter;

  constructor(options: LoggerOptions = {}) {
    const levelMap = (options.levels || DEFAULT_LEVELS).reduce(
      (acc, level) => ({ ...acc, [level.name]: level }),
      {} as Record<string, LogLevel>
    );
    this.levels = levelMap;
    this.minPriority = levelMap[options.minLevel || 'DEBUG']?.priority ?? 0;
    this.sinks = options.sinks || [];
    this.enableColors = options.enableColors ?? true;
    this.enableTimestamp = options.enableTimestamp ?? true;
    this.enableSourceTagging = options.enableSourceTagging ?? false;
    this.contextProvider = options.contextProvider;

    if (options.rateLimit?.enabled) {
      this.rateLimiter = new RateLimiter(options.rateLimit.intervalMs, options.rateLimit.maxLogs);
    }
  }

  private createRecord(level: string, message: string, args: unknown[]): LogRecord {
    const now = new Date();

    const originalError = args.find((arg) => arg instanceof Error) as Error | undefined;

    return {
      level,
      message,
      args,
      timestamp: now,
      context: this.contextProvider?.(),
      source: this.enableSourceTagging ? getSourceInfo(4) : undefined,
      ...(originalError && { originalError }),
    };
  }

  private shouldLog(levelName: string): boolean {
    return this.levels[levelName]?.priority >= this.minPriority;
  }

  private emit(record: LogRecord) {
    for (const sink of this.sinks) {
      sink.log(record);
    }
  }

  public log(level: string, message: string, ...args: unknown[]) {
    if (!this.shouldLog(level)) return;
    if (this.rateLimiter && !this.rateLimiter.shouldLog()) return;
    const record = this.createRecord(level, message, args);
    this.emit(record);
  }

  public debug(msg: string, ...args: unknown[]) {
    this.log('DEBUG', msg, ...args);
  }
  public info(msg: string, ...args: unknown[]) {
    this.log('INFO', msg, ...args);
  }
  public warn(msg: string, ...args: unknown[]) {
    this.log('WARN', msg, ...args);
  }
  public error(msg: string, ...args: unknown[]) {
    this.log('ERROR', msg, ...args);
  }
}
