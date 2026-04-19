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

  for (const symbol of pairs.slice(0, 3)) {
    console.log("\nPAIR:", symbol);

    const candles = await loadHistoricalCandles(symbol, 300);
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

  const pnl = trades.reduce((a, t) => a + t.pnl, 0);

  console.log("\nRESULTS:");
  console.log("Trades:", trades.length);
  console.log("PnL:", pnl);
}

backtest();
