import { getPriceChange } from "../modules/get_price_change";
import { MarketDataProvider } from "../types/types";

export class BybitMarketData implements MarketDataProvider {
  async getPriceChange(
    symbol: string,
    startTimestamp: number,
    endTimestamp: number,
  ): Promise<number | null> {
    return await getPriceChange(symbol, startTimestamp, endTimestamp);
  }
}
