import { Logger } from '@node-dlc/logger';
export type ApiPrefix = 'api';

export interface IOptions {
  uri: string;
  logger: Logger;
  apiKey?: string;
  headers?: [string, string][];
  prefix?: string;
}
