import { Broker } from "../types/types";

export class SimulatedBroker implements Broker {
  private balance: number = 10000; // начальный баланс
  private openPositions: {
    symbol: string;
    qty: number;
    entryPrice: number;
    stopLoss: number;
    takeProfit: number;
  }[] = [];
  private closedTrades: {
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    qty: number;
    pnl: number;
  }[] = [];

  async getAvailableBalance(): Promise<number> {
    return this.balance;
  }

  async hasOpenPosition(symbol: string): Promise<boolean> {
    return this.openPositions.some((pos) => pos.symbol === symbol);
  }

  async openPositionsCount(): Promise<number> {
    return this.openPositions.length;
  }

  async setLeverage(symbol: string, leverage: number): Promise<void> {
    // Симуляция, ничего не делаем
    console.log(`Set leverage ${leverage} for ${symbol}`);
  }

  async submitShortOrder(params: {
    symbol: string;
    qty: number;
    price: number;
    stopLoss: number;
    takeProfit: number;
  }): Promise<any> {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Симулируем открытие шорта
    this.openPositions.push({
      symbol: params.symbol,
      qty: params.qty,
      entryPrice: params.price,
      stopLoss: params.stopLoss,
      takeProfit: params.takeProfit,
    });
    console.log(
      `Opened short position for ${params.symbol}, qty: ${params.qty}, entry: ${params.price}`,
    );
    return { success: true }; // mock
  }

  // Метод для проверки и закрытия позиций на текущей цене
  async checkAndClosePositions(
    currentPrice: number,
    symbol: string,
  ): Promise<void> {
    const positionIndex = this.openPositions.findIndex(
      (pos) => pos.symbol === symbol,
    );
    if (positionIndex === -1) return;

    const position = this.openPositions[positionIndex];
    const exitPrice = currentPrice;
    let pnl = 0;

    // Для шорта: прибыль если цена падает
    if (currentPrice <= position.takeProfit) {
      // Take profit
      pnl = (position.entryPrice - currentPrice) * position.qty;
      console.log(
        `Closed short position for ${symbol} at take profit: ${currentPrice}, PnL: ${pnl}`,
      );
    } else if (currentPrice >= position.stopLoss) {
      // Stop loss
      pnl = (position.entryPrice - currentPrice) * position.qty;
      console.log(
        `Closed short position for ${symbol} at stop loss: ${currentPrice}, PnL: ${pnl}`,
      );
    } else {
      return; // Не закрываем
    }

    this.balance += pnl;
    this.closedTrades.push({
      symbol: position.symbol,
      entryPrice: position.entryPrice,
      exitPrice,
      qty: position.qty,
      pnl,
    });
    this.openPositions.splice(positionIndex, 1);
  }

  // Закрыть все позиции по текущей цене
  async closeAllPositions(currentPrice: number): Promise<void> {
    for (const position of [...this.openPositions]) {
      const pnl = (position.entryPrice - currentPrice) * position.qty;
      this.balance += pnl;
      this.closedTrades.push({
        symbol: position.symbol,
        entryPrice: position.entryPrice,
        exitPrice: currentPrice,
        qty: position.qty,
        pnl,
      });
      console.log(
        `Force closed short position for ${position.symbol} at ${currentPrice}, PnL: ${pnl}`,
      );
    }
    this.openPositions = [];
  }

  getClosedTrades() {
    return this.closedTrades;
  }
}
