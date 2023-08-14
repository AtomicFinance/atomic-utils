import { BaseClient } from './baseClient';

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
  created_at: string;
  updated_at: string;
}
export type StrategyTradesResponse = StrategyTrade[];

export interface StrategyStateResponse {
  id: number;
  offer_id: string;
  apy_all: string;
  apy_2y: string;
  apy_1y: string;
  apy_6m: string;
  apy_3m: string;
  apy_1m: string;
  max_drawdown_percentage: string;
  max_drawdown_duration: string;
  longest_gap_duration: string;
  timestamp: string;
  strategy_data: string;
  tvl: string;
  max_capacity: string;
  created_at: string;
  updated_at: string;
}

/**
 * Strategy service client
 */
export class StrategyClient extends BaseClient {
  /**
   * Retrieves the high-level information for the given strategy
   *
   * @param strategyName The name of the strategy
   * @returns {Promise<StrategyResponse>}
   */
  public getStrategy(strategyName: string): Promise<StrategyResponse> {
    return this.get(`/${strategyName}`);
  }

  /**
   * Retrieves the current state for the given strategy
   *
   * @param strategyName The name of the strategy
   * @returns {Promise<StrategyStateResponse>}
   */
  public getStrategyState(
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
  public getStrategyTrades(
    strategyName: string,
    { startDate, endDate }: StrategyTradesRequestOptions = {},
  ): Promise<StrategyTradesResponse> {
    return this.get(`/${strategyName}/trades`, {
      start_date: startDate,
      end_date: endDate,
    });
  }
}
