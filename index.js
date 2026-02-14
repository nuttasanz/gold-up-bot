import 'dotenv/config';
import { fetchGoldPrice } from './utils/goldFetcher.js';
import { getInvestmentAdvice } from './utils/geminiAnalyzer.js';
import { sendLineMessage } from './utils/lineNotifier.js';

async function main() {
  console.log("🚀 Starting Gold Alert Job...");

  const goldData = await fetchGoldPrice();
  if (!goldData) {
    console.error("❌ Failed to fetch gold prices. Stop process.");
    return;
  }

  const advice = await getInvestmentAdvice(goldData);

  const message = 
    `📢 ราคาทองวันนี้ (${goldData.updatedTime})\n\n` +
    `💰 ทองแท่ง\n` +
    `รับซื้อ: ${goldData.goldBarBuy} บาท\n` +
    `ขายออก: ${goldData.goldBarSell} บาท\n\n` +
    `📉 เปลี่ยนแปลง: ${goldData.priceChange > 0 ? 'เพิ่มขึ้น' : 'ลดลง'} ${goldData.priceChange} บาท\n\n` +
    `🤖 วิเคราะห์จาก Gemini:\n${advice}`;

  // 4. Notify
  await sendLineMessage(message);
}

main();