import { getFoundingRate } from "../modules/get_founding_rate";
import { getLastMarketPrice } from "../modules/get_last_market_price";
import { getPriceChange } from "../modules/get_price_change";
import { MarketDataProvider } from "../types/types";

export class BybitMarketData implements MarketDataProvider {
  async getFundingRate(symbol: string): Promise<number> {
    const rate = await getFoundingRate(symbol);

    if (rate === null || rate === undefined) {
      throw new Error(`Funding rate unavailable for ${symbol}`);
    }

    return Number(rate);
  }

  async getLastPrice(symbol: string): Promise<number> {
    const price = await getLastMarketPrice(symbol);

    if (!price || isNaN(price)) {
      throw new Error(`Last price unavailable for ${symbol}`);
    }

    return Number(price);
  }

  async getPriceChange(
    symbol: string,
    timestamp: number,
  ): Promise<number | null> {
    const change = await getPriceChange(symbol, timestamp);

    if (change === undefined || change === null) {
      return null;
    }

    return Number(change);
  }
}
