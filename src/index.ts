import { getTradingPairs } from "./modules/get_tradings_pair";
import { BybitBroker } from "./strategies/Brocker";
import { BybitMarketData } from "./strategies/MarketDataProvider";
import { RollbackShortStrategy } from "./strategies/RollbackShortStrategy";

async function runStrategyLoop() {
  try {
    const tradingPairs = await getTradingPairs();
    const strategy = new RollbackShortStrategy(
      new BybitMarketData(),
      new BybitBroker(),
    );

    for (const tradingPair of tradingPairs) {
      await strategy.execute(tradingPair);
    }
  } catch (error) {
    console.error("Ошибка в стратегии:", error);
  }
}
(async () => {
  await runStrategyLoop();
})();
