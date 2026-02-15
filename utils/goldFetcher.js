import "dotenv/config";
import axios from "axios";
import dayjs from "dayjs";
import "dayjs/locale/th.js";
import buddhistEra from "dayjs/plugin/buddhistEra.js";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export async function fetchGoldPrice() {
  try {
    const { data } = await axios.get(
      "https://www.goldtraders.or.th/api/GoldPrices/Latest?readjson=true",
    );

    if (!data || !data.asTime) {
      throw new Error("Invalid data structure from API");
    }

    return {
      goldBarBuy: data.bL_BuyPrice || "N/A",
      goldBarSell: data.bL_SellPrice || "N/A",
      goldJewelryBuy: data.oM965_BuyPrice || "N/A",
      goldJewelrySell: data.oM965_SellPrice || "N/A",
      priceChange: data.priceChangeFromPrevDayLast || "0",
      updatedTime: dayjs(data.asTime).format("DD MMMM BBBB เวลา HH:mm:ss"),
    };
  } catch (error) {
    const errMsg = error.response
      ? `API Error: ${error.response.status}`
      : error.message;
    console.error(`[GoldFetcher]: ${errMsg}`);
    return null;
  }
}
