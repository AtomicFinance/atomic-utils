import { Logger } from '@node-dlc/logger';
export type ApiPrefix = 'api';

export interface IStrategyOptions {
  uri: string;
  logger: Logger;
  headers?: [string, string][];
  prefix?: string;
}
