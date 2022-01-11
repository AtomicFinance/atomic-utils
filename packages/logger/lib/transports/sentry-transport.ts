import { LogLevel } from '@node-dlc/logger';
import * as Sentry from '@sentry/node';

export class SentryTransport implements ITransport {
  constructor(nodeOptions: Sentry.NodeOptions, tags: ITag[] = []) {
    Sentry.init({ ...nodeOptions, release: 'test', tracesSampleRate: 1 });
    tags.forEach((tag) => {
      Sentry.setTag(tag.key, tag.value);
    });
  }

  public write(line: string, level?: LogLevel, error?: Error): void {
    switch (level) {
      case LogLevel.Warn:
        Sentry.captureMessage(line);
        break;
      case LogLevel.Error:
        error ? Sentry.captureException(error) : Sentry.captureException(line);
        break;
      default:
    }
  }
}

export interface ITransport {
  write(line: string, level?: LogLevel, error?: Error): void;
}

export interface ITag {
  key: string;
  value: string;
}

export default Sentry;
