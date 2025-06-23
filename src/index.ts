export { Logger } from './core/Logger';
export { ConsoleSink, MemorySink } from './core/sinks';
export { RemoteSink } from './core/remoteSink'; // Safe for browser
export { SentrySink } from './core/sentrySink';
// FileSink should be imported manually in Node.js only
export type { LoggerOptions, LogLevel, LogSink, LogRecord } from './types/logger';
