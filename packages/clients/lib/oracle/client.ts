import axios, {
  AxiosBasicCredentials,
  AxiosError,
  AxiosPromise,
  AxiosRequestConfig,
  AxiosRequestHeaders,
  AxiosResponse,
} from 'axios';

import { IOracleOptions } from './options';

export type Method =
  | 'get'
  | 'GET'
  | 'delete'
  | 'DELETE'
  | 'head'
  | 'HEAD'
  | 'options'
  | 'OPTIONS'
  | 'post'
  | 'POST'
  | 'put'
  | 'PUT'
  | 'patch'
  | 'PATCH'
  | 'purge'
  | 'PURGE'
  | 'link'
  | 'LINK'
  | 'unlink'
  | 'UNLINK';

const API_PREFIX = 'api/v1';

export interface Nonce {
  nonce: string;
}

export interface Announcement {
  announcementId: string;
  eventId: string;
  offerId: string;
  announcement: string;
  cso: boolean;
  startDate: number;
  endDate: number;
  nonces: Nonce[];
  quantity?: number;
}

export interface AnnouncementResponse {
  announcements: Announcement[];
}

/**
 * Oracle client
 */
export class OracleClient {
  public opts: IOracleOptions;

  constructor(opts: IOracleOptions) {
    this.opts = opts;
  }

  /**
   * getAnnouncements
   *
   * Get all announcements
   *
   * @returns
   */
  public async getAnnouncements(
    offerId?: string,
    startDate?: number,
    endDate?: number,
    page?: number,
    limit?: number,
  ): Promise<AnnouncementResponse> {
    return this.get('/announcements', {
      offerId,
      startDate,
      endDate,
      page,
      limit,
    });
  }

  /**
   * getAnnouncementByEventId
   *
   * Get Announcement By Event ID
   *
   * @param {string} eventId the eventId for the DLC OracleAnnouncement
   *                         https://github.com/discreetlogcontracts/dlcspecs/blob/master/Messaging.md#oracle_event
   * @returns {Announcement}
   */
  public async getAnnouncementByEventId(
    eventId: string,
  ): Promise<Announcement> {
    return this.get(`/announcements/${eventId}`);
  }

  /**
   * postAnnouncementQuantity
   *
   * Specify quantity of funds entered for a particular announcement
   * Note: this function does not modify the DLC OracleAnnouncement
   *       itself but rather the Oracle internal DB
   *
   * @param {string} eventId the eventId for the DLC OracleAnnouncement
   *                         https://github.com/discreetlogcontracts/dlcspecs/blob/master/Messaging.md#oracle_event
   * @param {number} quantity the quantity entered in SATS
   * @returns {Announcement} return modified announcement
   */
  public async postAnnouncementQuantity(
    eventId: string,
    quantity: number,
  ): Promise<Announcement> {
    if (!this.opts.apiKey)
      throw Error('API Key required for postAnnouncementQuantity');

    return this.post(`/announcements/${eventId}/quantity`, { quantity });
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
      this.opts.logger.error(
        `Error: Could not connect to Oracle Service ${this.opts.uri}`,
      );
      this.opts.logger.debug(
        'Make sure the Oracle Service is running and that you are connecting to the correct port',
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
