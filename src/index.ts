// Core logger (lightweight)
export { Logger } from './core/Logger';
export { ConsoleSink, MemorySink } from './core/sinks';
export { RemoteSink } from './core/remoteSink'; // Safe for browser
export { SentrySink } from './core/sentrySink';
export type { LoggerOptions, LogLevel, LogSink, LogRecord } from './types/logger';

// Note: FileSink available via '@your-package/node' for Node.js environments
