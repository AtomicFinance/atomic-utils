import axios, {
  AxiosError,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
} from 'axios';

import { IStrategyOptions } from './options';

const API_PREFIX = 'api/v1';

export interface StrategyResponse {
  id: number;
  offer_id: string;
  title: string;
  master_length: number;
  risk_level: string;
  splitting: string;
  provider: string;
  max_loss: number;
  max_gain: number;
}

export interface StrategyTradesRequestOptions {
  startDate?: number;
  endDate?: number;
}
export interface StrategyTrade {
  id: number;
  offer_id: string;
  symbol: string;
  asset: string;
  direction: string;
  price: number;
  underlying_price: number;
  timestamp: number;
  quantity: number;
  status: string;
  tag: string;
}
export type StrategyTradesResponse = StrategyTrade[];

export interface StrategyStateResponse {
  id: number;
  offer_id: string;
  apy_2y: number;
  apy_1y: number;
  apy_6m: number;
  apy_3m: number;
  apy_1m: number;
  sharpe_ratio: number;
  timestamp: string;
  strategy_data: string;
}

/**
 * Strategy service client
 */
export class StrategyClient {
  public opts: IStrategyOptions;

  constructor(opts: IStrategyOptions) {
    this.opts = opts;
  }

  /**
   * Retrieves the high-level information for the given strategy
   *
   * @param strategyName The name of the strategy
   * @returns {Promise<StrategyResponse>}
   */
  public async getStrategy(strategyName: string): Promise<StrategyResponse> {
    return this.get(`/${strategyName}`);
  }

  /**
   * Retrieves the current state for the given strategy
   *
   * @param strategyName The name of the strategy
   * @returns {Promise<StrategyStateResponse>}
   */
  public async getStrategyState(
    strategyName: string,
  ): Promise<StrategyStateResponse> {
    return this.get(`/${strategyName}/state`);
  }

  /**
   * Retrieves the trades for the given strategy, with optional filters for start/end date
   *
   * @param strategyName The name of the strategy
   * @param options Optional filters for start/end date
   * @returns {Promise<StrategyTradesResponse>}
   */
  public async getStrategyTrades(
    strategyName: string,
    { startDate, endDate }: StrategyTradesRequestOptions = {},
  ): Promise<StrategyTradesResponse> {
    return this.get(`/${strategyName}/trades`, {
      startDate,
      endDate,
    });
  }

  public async request(
    method: Method,
    endpoint: string,
    params: IParams = {},
    data: IParams = {},
    headers: AxiosRequestHeaders = {},
  ): Promise<any> {
    const config: AxiosRequestConfig = {
      baseURL: `${this.opts.uri}/${this.opts.prefix || API_PREFIX}/`,
      url: endpoint,
      timeout: 20000,
      method,
      params,
      data,
      responseType: 'json',
    };

    if (headers) {
      config.headers = headers;
    }

    return this.axiosCall(config)
      .then((response: AxiosResponse) => response.data)
      .catch(this.handleError);
  }

  public axiosCall(config: AxiosRequestConfig): AxiosPromise<any> {
    return axios(config);
  }

  public get(
    endpoint: string,
    params: IParams = {},
    headers: AxiosRequestHeaders = {},
  ): any {
    return this.request('GET', endpoint, params, {}, headers);
  }

  public post(
    endpoint: string,
    params: IParams = {},
    headers: AxiosRequestHeaders = {},
  ): any {
    return this.request('POST', endpoint, {}, params, headers);
  }

  public put(
    endpoint: string,
    params: IParams = {},
    headers: AxiosRequestHeaders = {},
  ): any {
    return this.request('PUT', endpoint, {}, params, headers);
  }

  public handleError = (error: AxiosError): void => {
    if (error.code === 'ECONNREFUSED') {
      this.opts.logger.error(
        `Error: Could not connect to Strategy Service ${this.opts.uri}`,
      );
      this.opts.logger.debug(
        'Make sure the Strategy Service is running and that you are connecting to the correct port',
      );
    } else if (error.response) {
      this.opts.logger.error(error.response.data);
      throw new Error(error.response.data as string);
    } else if (error.code === 'EPIPE') {
      this.opts.logger.error(`EPIPE error ${this.opts.uri}`);
    } else {
      this.opts.logger.error(error.message);
      throw new Error(error.message);
    }
  };
}

interface IParams {
  [x: string]: unknown;
}
