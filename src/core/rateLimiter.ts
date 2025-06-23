export class RateLimiter {
  private readonly intervalMs: number;
  private readonly maxLogs: number;
  private timestamps: number[] = [];

  constructor(intervalMs: number, maxLogs: number) {
    this.intervalMs = intervalMs;
    this.maxLogs = maxLogs;
  }

  public shouldLog(): boolean {
    const now = Date.now();
    const windowStart = now - this.intervalMs;
    this.timestamps = this.timestamps.filter(ts => ts >= windowStart);
    if (this.timestamps.length < this.maxLogs) {
      this.timestamps.push(now);
      return true;
    }
    return false;
  }

  public reset(): void {
    this.timestamps = [];
  }
}