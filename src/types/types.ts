export interface MarketDataProvider {
  getLastPrice(symbol: string, timestamp?: number): Promise<number>;

  getPriceChange(
    symbol: string,
    startTimestamp: number,
    endTimestamp?: number,
  ): Promise<number | null>;
}

export interface Candle {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  turnover: number;
}

export interface Broker {
  getAvailableBalance(): Promise<number>;

  hasOpenPosition(symbol: string): Promise<boolean>;

  openPositionsCount(): Promise<number>;

  setLeverage(symbol: string, leverage: number): Promise<void>;

  submitShortOrder(params: {
    symbol: string;
    qty: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  }): Promise<void>;

  updateMarket(candle: Candle, symbol: string): Promise<void>;

  closeAllPositions(price: number): Promise<void>;
}
