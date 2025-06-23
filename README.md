# 🪵 ts-logger-utils

A powerful, modular, and extensible TypeScript logger designed for modern web and Node.js applications. Supports custom log levels, pluggable sinks, rate limiting, source tagging, and Sentry integration.

**✨ Lightweight Core**: Only ~3-4k gzipped for core functionality, with optional integrations loaded on-demand.

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
- ✅ **Lazy-loaded integrations** (Sentry, FileSink)
- ✅ ESM compatible

---

## 📦 Installation

### Core Package

```bash
npm install @mohamed-s/ts-logger
# or
yarn add @mohamed-s/ts-logger
```

### Optional Integrations

For **Sentry integration**, install Sentry SDK in your project:

```bash
# For browser/React projects
npm install @sentry/browser

# For Node.js projects
npm install @sentry/node
```

---

## 🚀 Quick Start

### For React/Browser Projects

**`src/utils/loggerInstance.ts`**

```ts
import { Logger, ConsoleSink, SentrySink } from '@mohamed-s/ts-logger';

export const logger = new Logger({
  minLevel: 'DEBUG',
  enableSourceTagging: true,
  sinks: [
    new ConsoleSink(),
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

### For Node.js Projects

**`src/utils/loggerInstance.ts`**

```ts
import { Logger, ConsoleSink, SentrySink } from '@mohamed-s/ts-logger';
import { FileSink } from '@mohamed-s/ts-logger/node'; // Node.js only

export const logger = new Logger({
  minLevel: 'DEBUG',
  enableSourceTagging: true,
  sinks: [
    new ConsoleSink(),
    new FileSink('./logs/app.log'),
    new SentrySink({
      dsn: 'https://your-project@sentry.io/123456',
      environment: 'production',
      release: '1.0.0',
      levelThreshold: 'ERROR',
    }),
  ],
  contextProvider: () => ({
    nodeVersion: process.version,
    pid: process.pid,
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
import { FileSink } from '@mohamed-s/ts-logger/node';
new FileSink('./logs/app.log');
```

- Writes logs to disk (Node only)
- Guards against browser usage
- **Import separately** to avoid bundling in browser apps

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

- **Lazy-loaded**: Sentry SDK is only loaded when first log is sent
- Sends warnings/errors to Sentry
- Automatically uses `originalError` stack if passed
- Adds tags and custom context

**📋 Prerequisites**: Install Sentry SDK separately:

```bash
# Choose based on your environment
npm install @sentry/browser    # For React/browser
npm install @sentry/node       # For Node.js
```

> **Best practice:** Always pass the actual `Error` to preserve stack trace in Sentry

---

## 🌍 Environment-Specific Usage

### Browser/React Applications

```ts
import { Logger, ConsoleSink, SentrySink, RemoteSink } from '@mohamed-s/ts-logger';

const logger = new Logger({
  sinks: [new ConsoleSink(), new SentrySink({ dsn: 'your-dsn' }), new RemoteSink('/api/logs')],
});
```

### Node.js Applications

```ts
import { Logger, ConsoleSink, SentrySink } from '@mohamed-s/ts-logger';
import { FileSink } from '@mohamed-s/ts-logger/node';

const logger = new Logger({
  sinks: [new ConsoleSink(), new FileSink('./logs/app.log'), new SentrySink({ dsn: 'your-dsn' })],
});
```

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

## 📦 Bundle Size

- **Core package**: ~3-4k gzipped
- **With Sentry**: Sentry SDK loaded only when used
- **With FileSink**: Node.js only, separate import
- **Tree-shakeable**: Only import what you need

---

## 📃 License

MIT

---

Crafted with ❤️ to make structured logging delightful and extensible.
