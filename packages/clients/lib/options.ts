import { Logger } from '@node-dlc/logger';
export type ApiPrefix = 'api';

export interface IOptions {
  uri: string;
  logger: Logger;
  timeout?: number;
  apiKey?: string;
  headers?: [string, string][];
  prefix?: string;
}
