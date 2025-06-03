import { LogLevel } from '@node-dlc/logger';
import * as Sentry from '@sentry/node';

export class SentryTransport implements ITransport {
  constructor(
    nodeOptions?: Sentry.NodeOptions & { transport?: any },
    tags: ITag[] = [],
  ) {
    // Only initialize Sentry if it hasn't been initialized yet
    // In test scenarios, Sentry may already be initialized by sentry-testkit
    try {
      const currentClient = Sentry.getCurrentHub().getClient();
      if (!currentClient && nodeOptions) {
        Sentry.init(nodeOptions);
      }
    } catch (e) {
      // If Sentry hasn't been initialized at all, initialize it
      if (nodeOptions) {
        Sentry.init(nodeOptions);
      }
    }

    tags.forEach((tag) => {
      Sentry.setTag(tag.key, tag.value);
    });
  }

  public write(line: string, level?: LogLevel, error?: Error): void {
    // Parse log level from the formatted message since @node-dlc/logger@0.24.0
    // doesn't pass the level parameter correctly
    const parsedLevel = this.parseLogLevel(line);

    switch (parsedLevel) {
      case LogLevel.Warn:
        Sentry.captureMessage(line);
        break;
      case LogLevel.Error:
        Sentry.withScope((scope) => {
          scope.setExtra('log', line);
          // Extract error message from formatted log and create Error object
          const errorMessage = this.extractErrorMessage(line);
          if (errorMessage) {
            Sentry.captureException(new Error(errorMessage));
          } else {
            Sentry.captureException(line);
          }
        });
        break;
      default:
    }
  }

  private parseLogLevel(line: string): LogLevel | undefined {
    if (line.includes('[WRN]:') || line.includes('[WARN]:')) {
      return LogLevel.Warn;
    }
    if (line.includes('[ERR]:') || line.includes('[ERROR]:')) {
      return LogLevel.Error;
    }
    return undefined;
  }

  private extractErrorMessage(line: string): string | null {
    // Extract error message from formatted log like: "2025-06-03T15:52:24.761Z [ERR]: Error: testing"
    const errorMatch = line.match(/\[ERR\]: Error: (.+)/);
    if (errorMatch && errorMatch[1]) {
      // Get just the first line of the error message (before stack trace)
      return errorMatch[1].split('\n')[0];
    }
    return null;
  }
}

export interface ITransport {
  write(line: string, level?: LogLevel, error?: Error): void;
}

export interface ITag {
  key: string;
  value: string;
}

export const SentryHandlers = Sentry.Handlers;
