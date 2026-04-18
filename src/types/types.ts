import { APIResponseV3WithTime, OrderResultV5 } from "bybit-api";

export interface Broker {
  getAvailableBalance(): Promise<number>;

  hasOpenPosition(symbol: string): Promise<boolean>;

  openPositionsCount(): Promise<number>;

  setLeverage(symbol: string, leverage: number): Promise<void>;

  submitShortOrder(params: {
    symbol: string;
    qty: number;
    price: number;
    stopLoss: number;
    takeProfit: number;
  }): Promise<APIResponseV3WithTime<OrderResultV5>>;
}

export interface MarketDataProvider {
  getFundingRate(symbol: string, timestamp?: number): Promise<number>;

  getLastPrice(symbol: string, timestamp?: number): Promise<number>;

  getPriceChange(
    symbol: string,
    startTimestamp: number,
    endTimestamp?: number,
  ): Promise<number | null>;
}
