import { AxiosError } from 'axios';

import {
  StrategyResponse,
  StrategyStateResponse,
  StrategyTradesResponse,
} from '../../lib';

const STRATEGY_RESPONSE: StrategyResponse = {
  id: 1,
  offer_id: 'ribbon',
  title: 'test',
  master_length: 10,
  risk_level: 'high',
  splitting: 'biweekly',
  provider: 'ribbon',
  max_loss: 10,
  max_gain: 20,
};

const STRATEGY_TRADES_RESPONSE: StrategyTradesResponse = [
  {
    id: 1,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 1000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
  {
    id: 2,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 2000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
  {
    id: 3,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 3000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
];

const STRATEGY_TRADES_FILTERED_START_RESPONSE: StrategyTradesResponse = [
  {
    id: 2,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 2000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
  {
    id: 3,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 3000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
];

const STRATEGY_TRADES_FILTERED_END_RESPONSE: StrategyTradesResponse = [
  {
    id: 1,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 1000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
  {
    id: 2,
    offer_id: 'ribbon',
    symbol: 'test',
    asset: 'test',
    direction: 'buy',
    price: 10,
    original_price: 10,
    underlying_price: 10,
    timestamp: 2000,
    quantity: 10,
    status: 'filled',
    tag: 'test',
    created_at: '2022-10-10T05:36:26.237Z',
    updated_at: '2022-10-10T05:36:26.237Z',
  },
];

const STRATEGY_STATE_RESPONSE: StrategyStateResponse = {
  id: 2,
  offer_id: 'ribbon',
  apy_all: '16',
  apy_2y: '15',
  apy_1y: '11',
  apy_6m: '9',
  apy_3m: '8',
  apy_1m: '7',
  max_drawdown_percentage: '5.23',
  max_drawdown_duration: '6.1',
  longest_gap_duration: '2',
  timestamp: '0',
  strategy_data: '',
  tvl: '0',
  max_capacity: '0',
  created_at: '2022-10-10T05:36:26.237Z',
  updated_at: '2022-10-10T05:36:26.237Z',
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
    baseURL: 'http://localhost:9003/api/v1/',
    url: '/ribbon',
    method: 'get',
    data: '{}',
    responseType: 'json',
  },
} as unknown as AxiosError;

export default {
  STRATEGY_RESPONSE,
  STRATEGY_STATE_RESPONSE,
  STRATEGY_TRADES_RESPONSE,
  STRATEGY_TRADES_FILTERED_START_RESPONSE,
  STRATEGY_TRADES_FILTERED_END_RESPONSE,
  ECONNREFUSED,
};
