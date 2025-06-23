# 🪵 ts-logger-utils

A powerful, modular, and extensible TypeScript logger designed for modern web and Node.js applications. Supports custom log levels, pluggable sinks, rate limiting, source tagging, and Sentry integration.

---

## ✨ Features

- ✅ Built-in log levels (`DEBUG`, `INFO`, `WARN`, `ERROR`)
- ✅ Support for **custom log levels**
- ✅ Modular **sink architecture** (console, memory, remote, file, Sentry)
- ✅ Works in both **Node.js** and **Browser**
- ✅ Color-coded console output (browser only)
- ✅ Rate limiting to prevent log spam
- ✅ Source tagging via `Error().stack`
- ✅ In-memory logs for testing
- ✅ Sentry integration with clean error attribution
- ✅ ESM compatible

---

## 📦 Installation

```bash
pnpm add @mohamed-s/ts-logger
# or
yarn add @mohamed-s/ts-logger
```

---

## 🚀 Quick Start

### 1. Create a Preconfigured Singleton Logger

**`src/utils/loggerInstance.ts`**

```ts
import { Logger, ConsoleSink, MemorySink, SentrySink } from '@mohamed-s/ts-logger';

export const logger = new Logger({
  minLevel: 'DEBUG',
  enableSourceTagging: true,
  sinks: [
    new ConsoleSink(),
    new MemorySink(),
    new SentrySink({
      dsn: 'https://your-project@sentry.io/123456',
      environment: 'production',
      release: '1.0.0',
      levelThreshold: 'ERROR',
    }),
  ],
  contextProvider: () => ({
    userId: 'abc123',
    sessionId: 'xyz789',
  }),
});
```

### 2. Use Anywhere

```ts
import { logger } from '../utils/loggerInstance';

logger.info('Welcome!');
logger.error('Something broke', new Error('DB failed'));
```

---

## 🧱 Sink Overview

### 🖥 ConsoleSink

```ts
new ConsoleSink();
```

- Color-coded logs in browser
- Falls back gracefully in Node.js

---

### 🧠 MemorySink

```ts
const memorySink = new MemorySink(1000);
memorySink.getLogs(); // for assertions
memorySink.clear();
```

- Keeps logs in memory for debugging/testing

---

### 🌐 RemoteSink

```ts
new RemoteSink('https://your-api.com/logs', {
  Authorization: 'Bearer TOKEN',
});
```

- Sends logs in batch to a server endpoint
- Retries with exponential backoff

---

### 📁 FileSink (Node.js only)

```ts
import { FileSink } from '@mohamed-s/ts-logger';
new FileSink('./logs/app.log');
```

- Writes logs to disk (Node only)
- Guards against browser usage

---

### ⚠️ SentrySink

```ts
new SentrySink({
  dsn: 'https://your-key@sentry.io/project-id',
  environment: 'production',
  release: '1.0.0',
  levelThreshold: 'ERROR',
});
```

- Sends warnings/errors to Sentry
- Automatically uses `originalError` stack if passed
- Adds tags and custom context

> **Best practice:** Always pass the actual `Error` to preserve stack trace in Sentry

---

## ⚙️ Custom Log Levels

```ts
const logger = new Logger({
  levels: [
    { name: 'TRACE', priority: 0 },
    { name: 'NOTICE', priority: 2 },
    { name: 'ERROR', priority: 3 },
  ],
});
```

---

## 🚦 Rate Limiting

```ts
rateLimit: {
  enabled: true,
  intervalMs: 5000, // 5 seconds
  maxLogs: 10       // max 10 logs per interval
}
```

---

## 📃 License

MIT

---

Crafted with ❤️ to make structured logging delightful and extensible.
