// src/core/sentrySink.ts
import type { LogSink, LogRecord } from '../types/logger';

export interface SentrySinkOptions {
  dsn: string;
  environment?: string;
  release?: string;
  levelThreshold?: string; // Default: 'ERROR'
  includeArgsInFingerprint?: boolean; // Include args in error grouping
}

const LEVEL_PRIORITY: Record<string, number> = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

// Use string literal instead of Sentry type
const SENTRY_LEVEL_MAP: Record<string, 'debug' | 'info' | 'warning' | 'error'> = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warning',
  ERROR: 'error',
};

export class SentrySink implements LogSink {
  private threshold: number;
  private includeArgsInFingerprint: boolean;
  private sentryPromise?: Promise<typeof import('@sentry/browser')>;
  private options: SentrySinkOptions;

  constructor(options: SentrySinkOptions) {
    this.threshold = LEVEL_PRIORITY[options.levelThreshold ?? 'ERROR'] ?? 3;
    this.includeArgsInFingerprint = options.includeArgsInFingerprint ?? false;
    this.options = options;
  }

  private async getSentry() {
    if (!this.sentryPromise) {
      this.sentryPromise = import('@sentry/browser').then((module) => {
        // Initialize Sentry on first use
        module.init({
          dsn: this.options.dsn,
          environment: this.options.environment ?? 'production',
          release: this.options.release,
        });
        return module;
      });
    }
    return this.sentryPromise;
  }

  async log(record: LogRecord): Promise<void> {
    const Sentry = await this.getSentry();
    const levelPriority = LEVEL_PRIORITY[record.level] ?? 99;
    if (levelPriority < this.threshold) return;

    Sentry.withScope((scope) => {
      // Set the severity level
      scope.setLevel(SENTRY_LEVEL_MAP[record.level] || 'error');

      // Add timestamp as extra context
      scope.setExtra('timestamp', record.timestamp.toISOString());

      // Add source information with better formatting
      if (record.source) {
        const { file, function: fn, line, column } = record.source;
        if (file) {
          scope.setTag('source.file', file);
          scope.setExtra('source.location', `${file}:${line || '?'}:${column || '?'}`);
        }
        if (fn) {
          scope.setTag('source.function', fn);
        }
        if (line) {
          scope.setTag('source.line', line.toString());
        }
      }

      // Add logger context
      if (record.context) {
        Object.entries(record.context).forEach(([key, value]) => {
          scope.setContext(key, { value });
        });
      }

      // Process and add arguments as structured data
      if (record.args && record.args.length > 0) {
        record.args.forEach((arg, index) => {
          if (arg !== null && arg !== undefined) {
            // Serialize the argument for better display
            let serializedArg: any;
            try {
              // Handle different types of arguments
              if (typeof arg === 'object') {
                serializedArg = JSON.parse(JSON.stringify(arg)); // Deep clone to avoid circular refs
              } else {
                serializedArg = arg;
              }
            } catch (e) {
              serializedArg = String(arg); // Fallback to string representation
            }

            scope.setExtra(`arg_${index}`, serializedArg);
          }
        });

        // If the first argument is an object (like error response), add it as main context
        const firstArg = record.args[0];
        if (firstArg && typeof firstArg === 'object' && !record.originalError) {
          scope.setContext('errorObject', firstArg as Record<string, any>);

          // For API errors, add specific tags
          if ('status' in firstArg) {
            scope.setTag('api.status', String(firstArg.status));
          }
          if ('data' in firstArg) {
            scope.setExtra('api.response', firstArg.data);
          }
        }
      }

      // Create a more informative fingerprint for better grouping
      const fingerprint = [record.message];
      if (record.source?.file) {
        fingerprint.push(record.source.file);
      }
      if (this.includeArgsInFingerprint && record.args && record.args.length > 0) {
        const firstArg = record.args[0];
        if (firstArg && typeof firstArg === 'object' && 'status' in firstArg) {
          fingerprint.push(`status:${firstArg.status}`);
        }
      }
      scope.setFingerprint(fingerprint);

      // Capture the error or message
      if (record.originalError instanceof Error) {
        // If there's an original Error object, capture it as an exception
        Sentry.captureException(record.originalError);
      } else if (record.args && record.args.some((arg) => arg instanceof Error)) {
        // If any argument is an Error, capture it
        const errorArg = record.args.find((arg) => arg instanceof Error) as Error;
        Sentry.captureException(errorArg);
      } else {
        // For non-Error cases, create a more detailed message
        let enhancedMessage = record.message;

        // If we have structured data (like API errors), include it in the message
        if (record.args && record.args.length > 0) {
          const firstArg = record.args[0];
          if (firstArg && typeof firstArg === 'object') {
            enhancedMessage += ` | Details: ${JSON.stringify(firstArg)}`;
          }
        }

        Sentry.captureMessage(enhancedMessage, SENTRY_LEVEL_MAP[record.level] || 'error');
      }
    });
  }
}
