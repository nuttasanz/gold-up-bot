import { GoogleGenerativeAI } from "@google/generative-ai";

export async function getInvestmentAdvice(goldData) {
  if (!goldData || typeof goldData !== "object") {
    console.error("[Analyzer Error]: No gold data provided.");
    return "ไม่สามารถวิเคราะห์ได้เนื่องจากไม่มีข้อมูลราคาทอง";
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

  // System Instruction: สั่งให้ AI สวมบทบาทที่ชัดเจน
  const prompt = `
    คุณคือผู้เชี่ยวชาญด้านการลงทุนทองคำในประเทศไทย 
    นี่คือราคาทองล่าสุด:
    - ทองแท่ง รับซื้อ: ${goldData.goldBarBuy}, ขายออก: ${goldData.goldBarSell}
    - ทองรูปพรรณ รับซื้อ: ${goldData.goldJewelryBuy}, ขายออก: ${goldData.goldJewelrySell}
    - การเปลี่ยนแปลงจากเมื่อวาน: ${goldData.priceChange}
    - อัปเดตเมื่อ: ${goldData.updatedTime}

    ช่วยวิเคราะห์สั้นๆ ว่าวันนี้ควร ซื้อ, ขาย หรือ ถือ? 
    (ตอบเป็นภาษาไทย ไม่เกิน 2-3 ประโยค และให้เหตุผลสั้นๆ)
  `;
  console.log(prompt);

  try {
    const result = await model.generateContent(prompt);
    console.log(result.response.text());
    return result.response.text();
  } catch (error) {
    console.error("[Gemini Error]:", error.message);
    return "ขออภัย Gemini ไม่สามารถวิเคราะห์ข้อมูลได้ในขณะนี้";
  }
}

getInvestmentAdvice();
