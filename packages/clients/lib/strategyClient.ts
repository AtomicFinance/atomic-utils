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

export interface ConsolidatedTrade {
  offer_id: string;
  symbol: string;
  asset: string;
  pnl: number;
  enter_timestamp: number;
  exit_timestamp: number | null;
  quantity: number;
  tag: string;
}

export interface GroupedTrades {
  [key: string]: StrategyTrade[];
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
      start_date: startDate,
      end_date: endDate,
    });
  }
}

export const groupTradesBySymbol = (trades: StrategyTrade[]): GroupedTrades => {
  const groupBySymbol = trades.reduce((group, product) => {
    const { symbol } = product;
    group[symbol] = group[symbol] ?? [];
    group[symbol].push(product);
    return group;
  }, {});

  return groupBySymbol;
};

export const consolidatedTradesBySymbol = (
  groupedTrades: GroupedTrades,
): ConsolidatedTrade[] => {
  return Object.keys(groupedTrades).flatMap((symbol) => {
    const trades = groupedTrades[symbol];

    if (trades.length > 2 || trades.length <= 0) {
      return []; // skip
    }

    trades.sort((a, b) => {
      return a.timestamp - b.timestamp;
    });

    let pnl = 0;

    trades.forEach((trade) => {
      if (trade.direction === 'sell') {
        pnl += trade.price;
      } else if (trade.direction === 'buy') {
        pnl -= trade.price;
      } else {
        return []; // skip
      }
    });

    return {
      offer_id: trades[0].offer_id,
      symbol: trades[0].symbol,
      asset: trades[0].asset,
      pnl,
      enter_timestamp: trades[0].timestamp,
      exit_timestamp: trades[1] ? trades[1].timestamp : null,
      quantity: trades[0].quantity,
      tag: '',
    };
  });
};
