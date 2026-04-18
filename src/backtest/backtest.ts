// import { getTradingPairs } from "../modules/get_tradings_pair";
import { client } from "../api/bybit_api_client_v5";
import * as tradingModule from "../modules/get_tradings_pair";
import { RollbackShortStrategy } from "../strategies/RollbackShortStrategy";
import { HistoricalMarketData } from "./HistoricalMarketData";
import { SimulatedBroker } from "./SimulatedBroker";

async function loadHistoricalCandles(
  symbol: string,
  days: number = 180,
): Promise<number[][]> {
  const candles: number[][] = [];
  const interval = 60; // 1 hour
  const limit = 1000;
  const totalCandles = days * 24;
  let startTime = Date.now() - days * 24 * 60 * 60 * 1000;

  while (candles.length < totalCandles) {
    const response = await client.getKline({
      category: "linear",
      symbol,
      interval: "60",
      start: startTime,
      limit,
    });
    if (!response.result?.list?.length) break;
    const newCandles = response.result.list.map((c: string[]) => c.map(Number));
    candles.push(...newCandles);
    startTime = newCandles[newCandles.length - 1][0] + interval * 60 * 1000;
    if (newCandles.length < limit) break;
  }
  return candles.slice(0, totalCandles);
}

async function backtest() {
  try {
    const pairs = await tradingModule.getTradingPairs();
    const market = new HistoricalMarketData();
    const broker = new SimulatedBroker();
    const strategy = new RollbackShortStrategy(market, broker);

    // Для теста, возьмем одну пару
    const testPair = pairs[0]; // например, первая пара
    console.log(`Backtesting ${testPair}`);

    const candles = await loadHistoricalCandles(testPair, 30); // 30 дней
    console.log(`Loaded ${candles.length} candles`);

    for (const candle of candles) {
      const timestamp = candle[0]; // open time
      const closePrice = candle[4]; // close price

      // Проверить и закрыть позиции
      await broker.checkAndClosePositions(closePrice, testPair);

      // Выполнить стратегию
      await strategy.execute(testPair, timestamp);
    }

    // Закрыть все оставшиеся позиции по последней цене
    const lastPrice = candles[candles.length - 1][4];
    await broker.closeAllPositions(lastPrice);

    // Финальная статистика
    const closedTrades = broker.getClosedTrades();
    const totalPnL = closedTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const winningTrades = closedTrades.filter((t) => t.pnl > 0).length;
    const losingTrades = closedTrades.filter((t) => t.pnl < 0).length;
    const winRate = closedTrades.length
      ? (winningTrades / closedTrades.length) * 100
      : 0;

    console.log(`\nBacktest Results for ${testPair}:`);
    console.log(`Total Trades: ${closedTrades.length}`);
    console.log(`Winning Trades: ${winningTrades}`);
    console.log(`Losing Trades: ${losingTrades}`);
    console.log(`Win Rate: ${winRate.toFixed(2)}%`);
    console.log(`Total PnL: ${totalPnL.toFixed(2)}`);
    console.log(
      `Final Balance: ${(await broker.getAvailableBalance()).toFixed(2)}`,
    );
  } catch (error) {
    console.error("Ошибка в бэктесте:", error);
  }
}

(async () => {
  await backtest();
})();
