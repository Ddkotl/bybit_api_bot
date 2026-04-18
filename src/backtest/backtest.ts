// import { getTradingPairs } from "../modules/get_tradings_pair";
// import { RollbackShortStrategy } from "../strategies/RollbackShortStrategy";

// async function backtest() {
//   try {
//     const tradingPairs = await getTradingPairs();
//     const strategy = new RollbackShortStrategy(
//       new HistoricalMarketData(),
//       new SimulatedBroker(),
//     );

//     for (const tradingPair of tradingPairs) {
//       await strategy.execute(tradingPair);
//     }
//   } catch (error) {
//     console.error("Ошибка в стратегии:", error);
//   }
// }
// (async () => {
//   await backtest();
// })();
