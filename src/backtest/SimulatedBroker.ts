import { Broker, Candle } from "../types/types";

export class SimulatedBroker implements Broker {
  private balance: number;

  constructor(initialBalance = 10000) {
    this.balance = initialBalance;
  }

  private positions: {
    symbol: string;
    qty: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  }[] = [];

  private trades: { symbol: string; pnl: number }[] = [];

  async getAvailableBalance() {
    return this.balance;
  }

  async hasOpenPosition(symbol: string) {
    return this.positions.some((p) => p.symbol === symbol);
  }

  async openPositionsCount() {
    return this.positions.length;
  }

  async setLeverage() {}

  async submitShortOrder(params: {
    symbol: string;
    qty: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  }): Promise<void> {
    this.positions.push({
      symbol: params.symbol,
      qty: params.qty,
      entryPrice: params.entryPrice,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
    });
  }

  async updateMarket(candle: Candle, symbol: string) {
    for (let i = this.positions.length - 1; i >= 0; i--) {
      const p = this.positions[i];

      let exit = null;

      // STOP LOSS
      if (candle.high >= p.stopLoss) {
        exit = p.stopLoss;
      }

      // TAKE PROFIT
      else if (candle.low <= p.takeProfit) {
        exit = p.takeProfit;
      }

      if (exit !== null) {
        const pnl = (p.entryPrice - exit) * p.qty;

        this.balance += pnl;

        this.trades.push({
          symbol,
          pnl,
        });

        this.positions.splice(i, 1);
      }
    }
  }

  async closeAllPositions(price: number) {
    for (const p of this.positions) {
      const pnl = (p.entryPrice - price) * p.qty;
      this.balance += pnl;
      this.trades.push({ symbol: p.symbol, pnl });
    }
    this.positions = [];
  }

  getTrades() {
    return this.trades;
  }
}
