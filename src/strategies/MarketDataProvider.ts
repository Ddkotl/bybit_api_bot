import { getLastMarketPrice } from "../modules/get_last_market_price";
import { getPriceChange } from "../modules/get_price_change";
import { MarketDataProvider } from "../types/types";

export class BybitMarketData implements MarketDataProvider {
  async getLastPrice(symbol: string, timestamp?: number): Promise<number> {
    if (timestamp) {
      // For historical, but since live, ignore timestamp
      return await getLastMarketPrice(symbol);
    }
    const price = await getLastMarketPrice(symbol);

    if (!price || isNaN(price)) {
      throw new Error(`Last price unavailable for ${symbol}`);
    }

    return Number(price);
  }

  async getPriceChange(
    symbol: string,
    startTimestamp: number,
    endTimestamp?: number,
  ): Promise<number | null> {
    return await getPriceChange(symbol, startTimestamp, endTimestamp);
  }
}
