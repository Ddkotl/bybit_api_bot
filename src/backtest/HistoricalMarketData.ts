import { getLastMarketPrice } from "../modules/get_last_market_price";
import { getPriceChange } from "../modules/get_price_change";
import { MarketDataProvider } from "../types/types";

export class HistoricalMarketData implements MarketDataProvider {
  async getLastPrice(symbol: string, timestamp?: number): Promise<number> {
    return await getLastMarketPrice(symbol, timestamp);
  }

  async getPriceChange(
    symbol: string,
    startTimestamp: number,
    endTimestamp?: number,
  ): Promise<number | null> {
    return await getPriceChange(symbol, startTimestamp, endTimestamp);
  }
}
