import { AxiosError } from 'axios';

import { Announcement, AnnouncementResponse } from '../../lib';

const ANNOUNCEMENT_RESPONSE: Announcement = {
  announcementId:
    'cc5f331f8689d965b9465d05f259088e3d24959c888eb9b6a1ec5ab1f413bb5d',
  eventId: 'Deribit-BTC-21MAY21',
  offerId: 'teststrategy',
  announcement:
    'fdd824fd02d2f8532ad623069fc921dc7a9013f5e60f03b8c0ed5823abdcf9eb574a7c879c044aea8837061b5a4d595a20af78d3a6a8d59139c2851bd5f056c10ac352943783e2355493913a7d1bafad49e6c2bec7bf4da8ecc7a0af5b15dff57858a249cc5afdd822fd026c0012cd9b7bbdf45d1315e0aa524113cc945d0f31e762ef8f385fab873ae94a49a74e3f477e9dd808faa763e3a9b4e9d5352b1e298d98e7ee266e638f849759a6df9e61f1215ddb14b60c90986a2db1ca0f09638bf2823482b36761e6ffdf8d51749d3a6cbd12d9edc59270d7542393750691f78c7b4b177d8cf293b6ba9877d01ff4d71eb8f45718d110d5e232c9fd525cfb96a1f4f959e7e1e89811a3fd5d56497edad23a843e8dff4820954d51358a75949af21a2c7ddadd96c5f0d2bc1d8bd75a6ec9a15bb8d690a26277a1231fd8e48a587b588689d8996f04fae41bc1edb60da9a86939c1e5a75d8ad272e8d75871f34ae3b334a499e9944ee6e9d507ee935ebd71180b255a6328fcaddcefd000a5f4a11417e59b09373d3d7a920fab0f4d15ec757b92c4f1f22e6336c4d74d45f3b78f5d0545b4fa7d2fe5b7516db5cd9c73c00f3c8abef9e512df05cf6117b7049fe1155ac262cd71540d556107c6c818d8446f29b1f6ecafe7c825bf6741a4734a9401138f93dcc4b9b6c720910df21cabdc674a3e23bd253f4f0fef3282fba5861fd82824c1fd53d6de716298a06463d868aa4180540c2b44bdf6770bd0471c727340b94280a6aca2d91e741321373c2f8ef3c9a6c2e7301ff8ca24051a6edf80019c8c93b5f4d5c28f532f26c5510f449b07fc74b164768d3ec4b1da339413c828a35276d6724ea5e1d5c0d81d20f409390cae9f9b6a0535976d50de1bb20852f0abf54e83c9a7555a4ec9eb2da0c6a301640edb544253c8c03a32d92fb87721490ec2560e6e1b431923fb13e307a81f60aab640fdd80a0e000200046269747300000000001213446572696269742d4254432d32314d41593231',
  cso: true,
  startDate: 1622505600,
  endDate: 1625011200,
  nonces: [
    {
      nonce: 'cd9b7bbdf45d1315e0aa524113cc945d0f31e762ef8f385fab873ae94a49a74e',
    },
    {
      nonce: '3f477e9dd808faa763e3a9b4e9d5352b1e298d98e7ee266e638f849759a6df9e',
    },
    {
      nonce: '61f1215ddb14b60c90986a2db1ca0f09638bf2823482b36761e6ffdf8d51749d',
    },
    {
      nonce: '3a6cbd12d9edc59270d7542393750691f78c7b4b177d8cf293b6ba9877d01ff4',
    },
    {
      nonce: 'd71eb8f45718d110d5e232c9fd525cfb96a1f4f959e7e1e89811a3fd5d56497e',
    },
    {
      nonce: 'dad23a843e8dff4820954d51358a75949af21a2c7ddadd96c5f0d2bc1d8bd75a',
    },
    {
      nonce: '6ec9a15bb8d690a26277a1231fd8e48a587b588689d8996f04fae41bc1edb60d',
    },
    {
      nonce: 'a9a86939c1e5a75d8ad272e8d75871f34ae3b334a499e9944ee6e9d507ee935e',
    },
    {
      nonce: 'bd71180b255a6328fcaddcefd000a5f4a11417e59b09373d3d7a920fab0f4d15',
    },
    {
      nonce: 'ec757b92c4f1f22e6336c4d74d45f3b78f5d0545b4fa7d2fe5b7516db5cd9c73',
    },
    {
      nonce: 'c00f3c8abef9e512df05cf6117b7049fe1155ac262cd71540d556107c6c818d8',
    },
    {
      nonce: '446f29b1f6ecafe7c825bf6741a4734a9401138f93dcc4b9b6c720910df21cab',
    },
    {
      nonce: 'dc674a3e23bd253f4f0fef3282fba5861fd82824c1fd53d6de716298a06463d8',
    },
    {
      nonce: '68aa4180540c2b44bdf6770bd0471c727340b94280a6aca2d91e741321373c2f',
    },
    {
      nonce: '8ef3c9a6c2e7301ff8ca24051a6edf80019c8c93b5f4d5c28f532f26c5510f44',
    },
    {
      nonce: '9b07fc74b164768d3ec4b1da339413c828a35276d6724ea5e1d5c0d81d20f409',
    },
    {
      nonce: '390cae9f9b6a0535976d50de1bb20852f0abf54e83c9a7555a4ec9eb2da0c6a3',
    },
    {
      nonce: '01640edb544253c8c03a32d92fb87721490ec2560e6e1b431923fb13e307a81f',
    },
  ],
};

const ANNOUNCEMENTS_RESPONSE: AnnouncementResponse = {
  announcements: [ANNOUNCEMENT_RESPONSE],
};

const ECONNREFUSED = {
  code: 'ECONNREFUSED',
  config: {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false,
    },
    timeout: 20000,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'User-Agent': 'axios/0.27.2',
      'Content-Length': 2,
    },
    baseURL: 'http://localhost:9002/api/v1/',
    url: '/announcements',
    method: 'get',
    data: '{}',
    responseType: 'json',
  },
} as unknown as AxiosError;

const INCORRECT_API_KEY = {
  code: 'ERR_BAD_REQUEST',
  config: {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false,
    },
    timeout: 20000,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    headers: {
      Accept: 'application/json, text/plain, */*',
      'Content-Type': 'application/json',
      'User-Agent': 'axios/0.27.2',
      'Content-Length': 22,
    },
    baseURL: 'http://localhost:9002/api/v1/',
    url: '/announcements/Deribit-BTC-21MAY21/quantity',
    method: 'post',
    params: {},
    data: '{"quantity":100000000}',
    responseType: 'json',
  },
  response: {
    data: 'Unauthorized: Incorrect API Key. IP ::ffff:127.0.0.1',
  },
} as unknown as AxiosError;

const ANNOUNCEMENT_QUANTITY_RESPONSE = {
  ...ANNOUNCEMENT_RESPONSE,
  quantity: 1e8,
};

const REACT_NATIVE_INCORRECT_BASE_URL_ERROR = {
  message: 'Request failed with status code 404',
  name: 'AxiosError',
  config: {
    transitional: {
      silentJSONParsing: true,
      forcedJSONParsing: true,
      clarifyTimeoutError: false,
    },
    transformRequest: [null],
    transformResponse: [null],
    timeout: 20000,
    xsrfCookieName: 'XSRF-TOKEN',
    xsrfHeaderName: 'X-XSRF-TOKEN',
    maxContentLength: -1,
    maxBodyLength: -1,
    env: { FormData: null },
    headers: { Accept: 'application/json, text/plain, */*' },
    baseURL: 'http://127.0.0.1:8575/api/announcements/api/v1/',
    url: '/announcements',
    method: 'get',
    params: {},
    responseType: 'json',
  },
  code: 'ERR_BAD_REQUEST',
  status: 404,
  response: {
    data: {
      error: 'Invalid endpoint: GET /api/announcements/api/v1/announcements',
    },
  },
};

export default {
  ANNOUNCEMENT_RESPONSE,
  ANNOUNCEMENTS_RESPONSE,
  ANNOUNCEMENT_QUANTITY_RESPONSE,
  ECONNREFUSED,
  INCORRECT_API_KEY,
  REACT_NATIVE_INCORRECT_BASE_URL_ERROR,
};
