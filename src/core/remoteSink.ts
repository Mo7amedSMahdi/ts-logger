import type { LogSink, LogRecord } from '../types/logger';

export class RemoteSink implements LogSink {
  private url: string;
  private headers: Record<string, string>;
  private batch: LogRecord[] = [];
  private flushInterval: number;
  private timer?: NodeJS.Timeout;
  private maxRetries: number;
  private backoffBase: number;

  constructor(
    url: string,
    headers: Record<string, string> = {},
    flushInterval = 3000,
    maxRetries = 3,
    backoffBase = 500
  ) {
    this.url = url;
    this.headers = { 'Content-Type': 'application/json', ...headers };
    this.flushInterval = flushInterval;
    this.maxRetries = maxRetries;
    this.backoffBase = backoffBase;

    this.timer = setInterval(() => this.flush(), this.flushInterval);
  }

  log(record: LogRecord): void {
    this.batch.push(record);
  }

  flush(): void {
    if (this.batch.length === 0) return;
    const payload = [...this.batch];
    this.batch = [];
    this.sendWithRetry(payload, 0);
  }

  private async sendWithRetry(batch: LogRecord[], attempt: number): Promise<void> {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(batch),
      });
    } catch (err) {
      if (attempt < this.maxRetries) {
        const backoff = this.getBackoffDelay(attempt);
        setTimeout(() => this.sendWithRetry(batch, attempt + 1), backoff);
      } else {
        console.warn(`[RemoteSink] Failed after ${this.maxRetries} retries`, err);
      }
    }
  }

  private getBackoffDelay(attempt: number): number {
    const jitter = Math.random() * 100;
    return this.backoffBase * 2 ** attempt + jitter;
  }

  clear(): void {
    this.batch = [];
  }

  stop(): void {
    clearInterval(this.timer);
  }
}
