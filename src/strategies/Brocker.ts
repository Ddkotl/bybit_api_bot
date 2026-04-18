import { client } from "../api/bybit_api_client_v5";
import { checkOpenPositions } from "../modules/check_open_position";
import { checkOpenPositionsCount } from "../modules/check_open_positions_count";
import { getAvalibleBalance } from "../modules/get_avalible_ballance";
import { setLeverage } from "../modules/set_leverage";
import { Broker } from "../types/types";

export class BybitBroker implements Broker {
  async getAvailableBalance() {
    return getAvalibleBalance();
  }

  async hasOpenPosition(symbol: string) {
    return checkOpenPositions(symbol);
  }

  async openPositionsCount() {
    return checkOpenPositionsCount();
  }

  async setLeverage(symbol: string, leverage: number) {
    return setLeverage(symbol, leverage);
  }

  async submitShortOrder(params: {
    symbol: string;
    qty: number;
    stopLoss: number;
    takeProfit: number;
  }) {
    return client.submitOrder({
      category: "linear",
      symbol: params.symbol,
      side: "Sell",
      orderType: "Market",
      qty: String(params.qty),
      stopLoss: String(params.stopLoss),
      takeProfit: String(params.takeProfit),
    });
  }
}
