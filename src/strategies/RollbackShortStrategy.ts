import moment from "moment";
import {
  leverage,
  orderLimit,
  riskPercentage,
  short_founding_rate_ok,
  stopLossRatio,
  takeProfitRatio,
  week_prise_change,
} from "../config";
import { Broker, MarketDataProvider } from "../types/types";

export class RollbackShortStrategy {
  constructor(
    private market: MarketDataProvider,
    private broker: Broker,
  ) {}

  async execute(tradingPair: string, timestamp?: number) {
    console.log("---------------------------------- ");
    console.log("---------------------------------- ");
    console.log("Start checking to pair : ", tradingPair);
    const fundingRate = await this.market.getFundingRate(
      tradingPair,
      timestamp,
    );

    if (
      fundingRate < short_founding_rate_ok ||
      fundingRate < short_founding_rate_ok
    ) {
      console.log("Funding rate too low for shorting: ", fundingRate);
      return;
    }

    if ((await this.broker.openPositionsCount()) >= orderLimit) return;

    if (await this.broker.hasOpenPosition(tradingPair)) return;

    const lastPrice = await this.market.getLastPrice(tradingPair, timestamp);

    const weekChange = await this.market.getPriceChange(
      tradingPair,
      timestamp
        ? timestamp - 7 * 24 * 60 * 60 * 1000
        : moment().subtract(7, "days").valueOf(),
      timestamp,
    );

    if (weekChange === null) return;

    if (weekChange < week_prise_change) return;

    const balance = await this.broker.getAvailableBalance();

    const positionUsd = balance * riskPercentage * leverage;

    const qty = Math.floor(positionUsd / lastPrice);
    if (qty < 1) return;
    const stopLoss = lastPrice * (1 + stopLossRatio);

    const takeProfit = lastPrice * (1 - takeProfitRatio);

    await this.broker.setLeverage(tradingPair, leverage);

    const order = await this.broker.submitShortOrder({
      symbol: tradingPair,
      qty,
      price: lastPrice,
      stopLoss,
      takeProfit,
    });
    if (!order) return;
  }
}
