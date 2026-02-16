import axios from "axios";
import * as cheerio from "cheerio";

// 1. Constants (Source of Truth)
const GOLD_URL = "https://xn--42cah7d0cxcvbbb9x.com/";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";

/**
 * ฟังก์ชันเดียวที่ใช้สกัดตัวเลขจากข้อความทุกรูปแบบ (Unified Parser)
 * รองรับทั้ง: "40,500", "-500", "วันนี้ +100"
 */
export const extractNumber = (text) => {
  if (!text) return 0;

  // ลบคอมม่าออกก่อนเพื่อไม่ให้ Regex งง
  const cleanStr = text.replace(/,/g, "");

  // Regex: ค้นหาตัวเลขที่อาจมีเครื่องหมาย - หรือ + นำหน้า
  const match = cleanStr.match(/[-+]?\d+(\.\d+)?/);

  // คืนค่าเป็นตัวเลขจริง (parseFloat จะรักษาเครื่องหมายลบไว้ให้เอง)
  return match ? parseFloat(match[0]) : 0;
};

export async function fetchGoldPrice() {
  try {
    const { data } = await axios.get(GOLD_URL, {
      headers: {
        "User-Agent": USER_AGENT,
        Referer: "https://www.google.com/",
      },
      timeout: 10000,
    });

    const $ = cheerio.load(data);

    // 2. Helper สำหรับดึงข้อมูลตามหัวข้อ (Data-driven selection)
    const getValByColumn = (colName) =>
      extractNumber($(`td[data-column="${colName}"]`).first().text());
    const getTextByColumn = (colName) =>
      $(`td[data-column="${colName}"]`).first().text().trim();

    // 3. ปรับปรุงการดึงค่าเปลี่ยนแปลง (เลิกใช้ split ที่เปราะบาง)
    // ใช้คำว่า "วันนี้" ค้นหาทั้งประโยค แล้วส่งให้ extractNumber จัดการเอง
    const rawPriceChangeText = $('td:contains("วันนี้")').first().text();

    const result = {
      goldBarBuy: getValByColumn("ทองคำแท่งรับซื้อ"),
      goldBarSell: getValByColumn("ทองคำแท่งขายออก"),
      goldJewelryBuy: getValByColumn("ฐานภาษี"),
      goldJewelrySell: getValByColumn("ทองรูปพรรณขายออก"),
      priceChange: extractNumber(rawPriceChangeText),
      updatedTime: getTextByColumn("วันที่/เวลา"),
    };

    if (!result.goldBarBuy && !result.updatedTime) {
      throw new Error("Scraping failed: HTML structure might have changed.");
    }

    return result;
  } catch (error) {
    const status = error.response ? `[Status: ${error.response.status}]` : "";
    console.error(`[GoldFetcher Error]: ${error.message} ${status}`);
    throw error;
  }
}
