import { MarketDataProvider } from "../types/types";
import { getFoundingRate } from "../modules/get_founding_rate";
import { getLastMarketPrice } from "../modules/get_last_market_price";
import { getPriceChange } from "../modules/get_price_change";

export class HistoricalMarketData implements MarketDataProvider {
  async getFundingRate(symbol: string, timestamp?: number): Promise<number> {
    return await getFoundingRate(symbol, timestamp);
  }

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
