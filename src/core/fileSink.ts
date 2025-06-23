import type { LogSink, LogRecord } from '../types/logger';

// Conditional imports to avoid bundler issues
const fs = typeof window === 'undefined' ? require('fs') : null;
const path = typeof window === 'undefined' ? require('path') : null;

if (typeof window !== 'undefined') {
  throw new Error('FileSink cannot be used in browser environments.');
}

export class FileSink implements LogSink {
  private path: string;

  constructor(filePath: string) {
    if (!fs || !path) {
      throw new Error('FileSink requires Node.js environment');
    }

    this.path = filePath;
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  log(record: LogRecord): void {
    if (!fs) return;
    const formatted = this.format(record);
    fs.appendFileSync(this.path, formatted + '\n', 'utf-8');
  }

  private format(record: LogRecord): string {
    const { level, message, timestamp, source } = record;
    const meta = source ? ` ↪ ${source.file}:${source.line}:${source.column} @${source.function}` : '';
    return `[${level}] [${timestamp.toISOString()}] ${message}${meta}`;
  }
}
