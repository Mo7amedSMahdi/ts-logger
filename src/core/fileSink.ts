import type { LogSink, LogRecord } from '../types/logger';
import { appendFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

if (typeof window !== 'undefined') {
  throw new Error('FileSink cannot be used in browser environments.');
}

export class FileSink implements LogSink {
  private path: string;

  constructor(filePath: string) {
    this.path = filePath;
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
  }

  log(record: LogRecord): void {
    const formatted = this.format(record);
    appendFileSync(this.path, formatted + '\n', 'utf-8');
  }

  private format(record: LogRecord): string {
    const { level, message, timestamp, source } = record;
    const meta = source
      ? ` ↪ ${source.file}:${source.line}:${source.column} @${source.function}`
      : '';
    return `[${level}] [${timestamp.toISOString()}] ${message}${meta}`;
  }
}