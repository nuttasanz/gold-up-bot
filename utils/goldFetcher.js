import "dotenv/config";
import axios from "axios";
import * as cheerio from "cheerio";
import dayjs from "dayjs";
import "dayjs/locale/th.js";
import buddhistEra from "dayjs/plugin/buddhistEra.js";

dayjs.extend(buddhistEra);
dayjs.locale("th");

export async function fetchGoldPrice() {
  const url = "https://xn--42cah7d0cxcvbbb9x.com/";

  try {
    const { data } = await axios.get(url, {
      headers: {
        // หัวใจสำคัญ: ต้องปลอมตัวเป็น Browser และบอกที่มา (Referer)
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
        "Accept-Language": "th-TH,th;q=0.9",
        Referer: "https://www.google.com/",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);
    const getVal = (colName) => {
      const rawValue = $(`td[data-column="${colName}"]`).first().text().trim();
      const cleanValue = rawValue.replace(/[^0-9.-]/g, "");
      return cleanValue ? Number(cleanValue) : 0;
    };
    // ดึงข้อมูลผ่าน ID (ตรวจสอบแล้วว่าเป็น ID มาตรฐานของหน้าเว็บสมาคมฯ)
    const goldBarBuy = Number(getVal("ทองคำแท่งรับซื้อ"));
    const goldBarSell = Number(getVal("ทองคำแท่งขายออก"));
    const goldJewelryBuy = Number(getVal("ฐานภาษี"));
    const goldJewelrySell = Number(getVal("ทองรูปพรรณขายออก"));
    const priceChange = Number(getVal("เคลื่อนไหว"));
    const updatedTime = getVal("วันที่/เวลา");

    return {
      goldBarBuy,
      goldBarSell,
      goldJewelryBuy,
      goldJewelrySell,
      priceChange,
      updatedTime,
    };
  } catch (error) {
    const status = error.response ? `Status: ${error.response.status}` : "";
    console.error(`[GoldFetcher Scraping]: ${error.message} ${status}`);
    return null;
  }
}
