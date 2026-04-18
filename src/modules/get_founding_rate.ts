import { client } from "../api/bybit_api_client_v5";

export async function getFoundingRate(symbol: string, timestamp?: number) {
  try {
    const params: {
      category: "linear";
      symbol: string;
      limit: number;
      startTime?: number;
    } = {
      category: "linear",
      symbol: symbol,
      limit: 1,
    };
    if (timestamp) {
      params.startTime = timestamp;
    }
    const founding_rate = await client.getFundingRateHistory(params);
    const foundig_rate = founding_rate.result.list[0]?.fundingRate;
    return foundig_rate ? parseFloat(foundig_rate) : 0;
  } catch (error) {
    console.log("Не удалось получить ставку финансирования", error);
    return 0;
  }
}
