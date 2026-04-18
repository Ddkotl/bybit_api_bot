import {
  leverage,
  orderLimit,
  riskPercentage,
  stopLossRatio,
  takeProfitRatio,
  week_prise_change,
} from "../config";

import { Broker, Candle, MarketDataProvider } from "../types/types";

export class RollbackShortStrategy {
  private static readonly WEEK_MS = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private broker: Broker,
    private market?: MarketDataProvider,
  ) {}

  async execute(candleOrSymbol: Candle | string, symbol?: string) {
    let tradingPair: string;
    let lastPrice: number;
    let weekChange = 0;

    if (typeof candleOrSymbol === "string") {
      // Live mode
      if (!this.market) throw new Error("Market required for live mode");
      tradingPair = candleOrSymbol;
      lastPrice = await this.market.getLastPrice(tradingPair);
      const weekStart = Date.now() - RollbackShortStrategy.WEEK_MS;
      const priceChange = await this.market.getPriceChange(
        tradingPair,
        weekStart,
      );
      weekChange = priceChange ?? 0;
    } else {
      // Backtest mode
      const candle = candleOrSymbol;
      tradingPair = symbol!;
      lastPrice = candle.close;

      if (this.market) {
        const weekStart = candle.timestamp - RollbackShortStrategy.WEEK_MS;
        const priceChange = await this.market.getPriceChange(
          tradingPair,
          weekStart,
          candle.timestamp,
        );
        weekChange = priceChange ?? 0;
      }
    }

    if ((await this.broker.openPositionsCount()) >= orderLimit) return;

    if (await this.broker.hasOpenPosition(tradingPair)) return;

    if (weekChange < week_prise_change) return;

    const balance = await this.broker.getAvailableBalance();
    const positionUsd = balance * riskPercentage * leverage;
    const qty = Math.max(1, Math.floor(positionUsd / Math.max(lastPrice, 1)));

    if (qty < 1) return;

    const stopLoss = lastPrice * (1 + stopLossRatio);
    const takeProfit = lastPrice * (1 - takeProfitRatio);

    await this.broker.setLeverage(tradingPair, leverage);
    await this.broker.submitShortOrder({
      symbol: tradingPair,
      qty,
      entryPrice: lastPrice,
      stopLoss,
      takeProfit,
    });
  }
}
