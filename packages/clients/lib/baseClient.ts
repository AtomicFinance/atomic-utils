import axios, {
  AxiosBasicCredentials,
  AxiosError,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
  Method,
} from 'axios';

import { IOptions } from './options';

const API_PREFIX = 'api/v1';

/**
 * Oracle client
 */
export class BaseClient {
  public opts: IOptions;

  constructor(opts: IOptions) {
    this.opts = opts;
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
      data: method === 'GET' ? undefined : data,
      responseType: 'json',
    };

    if (headers) {
      config.headers = headers;
    }

    if (this.opts.apiKey) {
      const auth: AxiosBasicCredentials = {
        username: 'admin',
        password: this.opts.apiKey,
      };

      config.auth = auth;
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
      this.opts.logger.debug(
        'Make sure the Service is running and that you are connecting to the correct port',
      );
      throw Error(`Could not connect to Service ${this.opts.uri}`);
    } else if (error.code === 'EPIPE') {
      throw Error(`EPIPE error ${this.opts.uri}`);
    } else if (error.response) {
      if (typeof error.response.data === 'string') {
        throw new Error(error.response.data);
      } else if (typeof (error.response.data as any).error === 'string') {
        throw new Error((error.response.data as any).error as string);
      } else {
        throw new Error(JSON.stringify(error.response.data));
      }
    } else {
      throw new Error(error.message);
    }
  };
}

interface IParams {
  [x: string]: unknown;
}
