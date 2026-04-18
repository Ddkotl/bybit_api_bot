import moment from "moment";
import { client } from "../api/bybit_api_client_v5";
import {
  leverage,
  orderLimit,
  riskPercentage,
  short_founding_rate_ok,
  stopLossRatio,
  takeProfitRatio,
  week_prise_change,
} from "../config";
import { checkOpenPositions } from "../modules/check_open_position";
import { checkOpenPositionsCount } from "../modules/check_open_positions_count";
import { getAvalibleBalance } from "../modules/get_avalible_ballance";
import { getFoundingRate } from "../modules/get_founding_rate";
import { getLastMarketPrice } from "../modules/get_last_market_price";
import { getPriceChange } from "../modules/get_price_change";
import { setLeverage } from "../modules/set_leverage";

export const RollbackShortStrategy = async (tradingPair: string) => {
  console.log("---------------------------------- ");
  console.log("---------------------------------- ");
  console.log("Start checking to pair : ", tradingPair);
  try {
    const founding_rate = await getFoundingRate(tradingPair);
    console.log("founding rate :", founding_rate);
    if (Number(founding_rate) < short_founding_rate_ok) {
      console.log("founding rate too bad");
      return;
    }
    const positionsCount = await checkOpenPositionsCount();
    if (positionsCount > orderLimit) {
      console.log("too many open positions");
      return;
    }
    const hasOpenPosition = await checkOpenPositions(tradingPair);
    if (hasOpenPosition) {
      console.log(`Elready exist open position to ${tradingPair}`);
      return;
    }
    const lastPrice = await getLastMarketPrice(tradingPair);

    const priceMonthAgo = await getPriceChange(
      tradingPair,
      moment().subtract(1, "month").valueOf(),
    );
    if (!priceMonthAgo) {
      return;
    }

    const price7dayAgo = await getPriceChange(
      tradingPair,
      moment().subtract(7, "days").valueOf(),
    );
    console.log("7 day change", price7dayAgo, "%");
    if (!price7dayAgo || price7dayAgo < week_prise_change) {
      console.log("7 day change too small");
      return;
    }

    const availableBalance = await getAvalibleBalance();
    if (!availableBalance || isNaN(availableBalance) || availableBalance <= 0) {
      console.error("Ошибка: баланс недоступен или равен 0.");
      return;
    }

    const positionSizeInUSD = +availableBalance * riskPercentage * leverage;
    const positionSize = Math.floor(positionSizeInUSD / lastPrice);

    const stopLossPrice = lastPrice * (1 + stopLossRatio);
    const takeProfitPrice = lastPrice * (1 - takeProfitRatio);
    await setLeverage(tradingPair, leverage);

    console.log(`📊 Данные перед открытием ордера:
      🔹 Доступный баланс: ${availableBalance}
      🔹 Размер позиции (в USD): ${positionSizeInUSD}
      🔹 Размер позиции (контракты): ${positionSize}
      🔹 Текущая цена: ${lastPrice}
      🔹 Стоп-лосс: ${stopLossPrice}
      🔹 Тейк-профит: ${takeProfitPrice}
      🔹 Плече: ${leverage}
    `);

    const orderResponse = await client.submitOrder({
      category: "linear",
      symbol: tradingPair,
      side: "Sell",
      orderType: "Market",
      qty: `${positionSize}`,
      timeInForce: "GTC",
      takeProfit: takeProfitPrice.toFixed(9),
      stopLoss: stopLossPrice.toFixed(9),
    });

    console.log("Position open:", JSON.stringify(orderResponse));
  } catch (error) {
    console.error("Strategy error:", error);
  }
};
