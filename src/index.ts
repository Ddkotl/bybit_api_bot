import { orderLimit } from "./config";
import { checkOpenPositionsCount } from "./modules/check_open_positions_count";
import { getTradingPairs } from "./modules/get_tradings_pair";
import { RollbackShortStrategy } from "./strategies/rollback_strategy";

async function runStrategyLoop() {
  try {
    const tradingPairs = await getTradingPairs();
    const positionsCount = await checkOpenPositionsCount();
    if (positionsCount > orderLimit) {
      console.log(`Too many positions already open`);
    } else {
      for (const tradingPair of tradingPairs) {
        await RollbackShortStrategy(tradingPair);
      }
    }
  } catch (error) {
    console.error("Ошибка в стратегии:", error);
  }
}
(async () => {
  await runStrategyLoop();
})();
