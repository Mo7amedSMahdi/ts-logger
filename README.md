# ts-logger-utils

A flexible and testable TypeScript logger with support for custom log levels, sinks, rate limiting, color-coded output, and source tagging. Suitable for both browser and Node.js environments.

## ✅ Features

- Predefined log levels: `DEBUG`, `INFO`, `WARN`, `ERROR`
- Custom log level support
- Console, in-memory, remote (HTTP), and file sinks
- Rate limiting and throttling
- Source tagging via `Error().stack`
- Test-friendly with memory sink and type-safe design

## 🚀 Quick Start

```ts
import { logger } from './utils/loggerInstance';

logger.info('Welcome to the logger!');
```

## 🧱 Configuration

Create a singleton:

```ts
import { Logger } from './core/Logger';
import { ConsoleSink, MemorySink } from './core/sinks';

export const logger = new Logger({
  minLevel: 'DEBUG',
  sinks: [new ConsoleSink(), new MemorySink()],
  enableSourceTagging: true,
});
```

## 📦 Packaging

```bash
pnpm install
pnpm run build
pnpm test
```

---

MIT License.