import { getTradingPairs } from "../modules/get_tradings_pair";
import { loadHistoricalCandles } from "../modules/loadHistoricalCandles";
import { BybitMarketData } from "../strategies/MarketDataProvider";
import { RollbackShortStrategy } from "../strategies/RollbackShortStrategy";
import { SimulatedBroker } from "./SimulatedBroker";

async function backtest() {
  console.log("Starting backtest...");

  const pairs = await getTradingPairs();

  const broker = new SimulatedBroker(10000);
  const market = new BybitMarketData();

  const strategy = new RollbackShortStrategy(broker, market);

  for (const symbol of pairs.slice(0, 20)) {
    console.log("\nPAIR:", symbol);

    const candles = await loadHistoricalCandles(symbol, 30);
    if (!candles.length) {
      console.log(`No candles for ${symbol}, skip`);
      continue;
    }

    for (const candle of candles) {
      await broker.updateMarket(candle, symbol);
      await strategy.execute(candle, symbol);
    }

    await broker.closeAllPositions(candles[candles.length - 1].close);
  }

  const trades = broker.getTrades();
  const finalBalance = broker.getFinalBalance();
  const totalPnL = finalBalance - 10000;

  // Расчет метрик
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl <= 0);
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;

  const grossProfit = wins.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss === 0 ? grossProfit : grossProfit / grossLoss;

  console.log("-----------------------------------------");
  console.log("📊 BACKTEST REPORT");
  console.log("-----------------------------------------");
  console.log(`Starting Balance: 10000`);
  console.log(`Final Balance:    ${finalBalance.toFixed(2)}`);
  console.log(
    `Total PnL:        ${totalPnL.toFixed(2)} (${((totalPnL / 10000) * 100).toFixed(2)}%)`,
  );
  console.log("-----------------------------------------");
  console.log(`Total Trades:     ${trades.length}`);
  console.log(`Win Rate:         ${winRate.toFixed(2)}%`);
  console.log(`Profit Factor:    ${profitFactor.toFixed(2)}`);
  console.log(
    `Avg Trade PnL:    ${(totalPnL / (trades.length || 1)).toFixed(2)}`,
  );
  console.log("-----------------------------------------");

  if (trades.length > 0) {
    const bestTrade = [...trades].sort((a, b) => b.pnl - a.pnl)[0];
    const worstTrade = [...trades].sort((a, b) => a.pnl - b.pnl)[0];
    console.log(
      `Best Trade:       +${bestTrade.pnl.toFixed(2)} (${bestTrade.symbol})`,
    );
    console.log(
      `Worst Trade:      ${worstTrade.pnl.toFixed(2)} (${worstTrade.symbol})`,
    );
  }
}

backtest();
