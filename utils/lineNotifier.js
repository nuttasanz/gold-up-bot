import "dotenv/config";
import axios from "axios";

/**
 * ส่งข้อความไปยัง LINE (รองรับทั้ง User ID และ Group ID)
 * @param {string} message - ข้อความที่ต้องการส่ง
 * @param {string|null} customTargetId - (Optional) ID ปลายทางที่ต้องการส่งไปโดยเฉพาะ
 */
export async function sendLineMessage(message, customTargetId = null) {
  const url = "https://api.line.me/v2/bot/message/push";
  const token = process.env.LINE_ACCESS_TOKEN;

  // High-Clarity Logic:
  // ลำดับความสำคัญ: 1. ค่าที่ส่งเข้าฟังก์ชัน > 2. Group ID ใน .env > 3. User ID ใน .env
  const targetId =
    customTargetId || process.env.LINE_GROUP_ID || process.env.LINE_USER_ID;

  // Guard Clause: ตรวจสอบความพร้อมของข้อมูลสำคัญ
  if (!token) {
    console.error("[LINE Error]: Missing LINE_ACCESS_TOKEN in .env");
    return false;
  }
  if (!targetId) {
    console.error("[LINE Error]: No target ID (User or Group) provided.");
    return false;
  }

  const data = {
    to: targetId,
    messages: [
      {
        type: "text",
        text: message,
      },
    ],
  };

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  };

  try {
    await axios.post(url, data, config);
    console.log(
      `✅ [LINE]: Message sent to ${targetId.startsWith("C") ? "Group" : "User"} successfully!`,
    );
    return true;
  } catch (error) {
    const detail = error.response?.data?.message || error.message;
    console.error(`❌ [LINE Error]: ${detail}`);
    return false;
  }
}
