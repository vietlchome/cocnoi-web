import { ContentService } from "@/lib/services/content.service";

/**
 * Gửi tin nhắn Telegram tự động dựa vào cấu hình ThemeSettings.
 * @param message Nội dung tin nhắn (Hỗ trợ định dạng HTML/Markdown cơ bản)
 */
export async function sendTelegramNotification(message: string): Promise<boolean> {
  try {
    // 1. Lấy cấu hình Token và ChatID từ DB
    const settings = await ContentService.getAllThemeSettings();
    if (!settings) return false;

    const token = settings.telegram_token;
    const chatId = settings.telegram_chat_id;

    // Nếu quản trị viên chưa cấu hình thì bỏ qua (Không gửi)
    if (!token || !chatId) {
      return false;
    }

    // 2. Gọi API Telegram
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "HTML",
        disable_web_page_preview: true
      }),
    });

    if (!response.ok) {
      console.error("Telegram API Error:", await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error("Lỗi khi gửi thông báo Telegram:", error);
    return false;
  }
}
