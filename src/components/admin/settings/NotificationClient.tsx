"use client";

import { useState } from "react";
import { setThemeSetting } from "@/lib/actions/content.actions";
import { FormField } from "@/components/ui/FormField";
import { Save, Bell, Mail, Send, Loader2 } from "lucide-react";

interface NotificationClientProps {
  initialSettings: Record<string, any>;
}

export default function NotificationClient({ initialSettings }: NotificationClientProps) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [notifyEmail, setNotifyEmail] = useState(initialSettings.notify_email || "");
  const [telegramToken, setTelegramToken] = useState(initialSettings.telegram_token || "");
  const [telegramChatId, setTelegramChatId] = useState(initialSettings.telegram_chat_id || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [
        { key: "notify_email", value: notifyEmail },
        { key: "telegram_token", value: telegramToken },
        { key: "telegram_chat_id", value: telegramChatId },
      ];

      // Upsert parallelly
      await Promise.all(updates.map((up) => setThemeSetting(up.key, up.value)));

      alert("Cập nhật cài đặt thông báo thành công!");
    } catch (err: any) {
      alert(err.message || "Lỗi lưu cấu hình thông báo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 md:p-8 max-w-3xl shadow-sm">
      <div className="flex flex-col gap-8">
        
        {/* Email notifications */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2">
            <Mail className="w-5 h-5 text-accent" />
            <h3 className="font-playfair font-bold text-base text-primary">Thông báo qua Email</h3>
          </div>
          <FormField label="Email nhận thông báo (khi có khách liên hệ, khiếu nại, yêu cầu báo giá)">
            <input
              type="email"
              value={notifyEmail}
              onChange={(e) => setNotifyEmail(e.target.value)}
              placeholder="admin@cocnoi.vn"
              className="w-full text-xs bg-white border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </FormField>
          <p className="text-[10px] text-secondary">
            Mẹo: Có thể nhập nhiều email cách nhau bằng dấu phẩy (,).
          </p>
        </div>

        {/* Telegram notifications */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-border/20 pb-2">
            <Send className="w-5 h-5 text-[#229ED9]" />
            <h3 className="font-playfair font-bold text-base text-primary">Thông báo qua Telegram Bot (Khuyên dùng)</h3>
          </div>
          
          <div className="bg-[#229ED9]/5 border border-[#229ED9]/20 rounded-2 p-4 mb-2">
            <p className="text-xs text-secondary/80 leading-relaxed mb-2">
              <strong className="text-[#229ED9]">Hướng dẫn nhanh:</strong><br/>
              1. Mở Telegram, tìm <strong>@BotFather</strong> và tạo bot mới để lấy <code className="bg-white px-1 py-0.5 rounded text-primary">Bot Token</code>.<br/>
              2. Tạo một Group Telegram cho team Sale, thêm Bot vừa tạo vào Group.<br/>
              3. Chat một tin nhắn bất kỳ vào Group, sau đó truy cập <code className="bg-white px-1 py-0.5 rounded text-primary text-[10px]">https://api.telegram.org/bot[BOT_TOKEN]/getUpdates</code> để tìm <code className="bg-white px-1 py-0.5 rounded text-primary">Chat ID</code> của Group (thường bắt đầu bằng dấu trừ).
            </p>
          </div>

          <FormField label="Telegram Bot Token">
            <input
              type="text"
              value={telegramToken}
              onChange={(e) => setTelegramToken(e.target.value)}
              placeholder="Ví dụ: 123456789:ABCdefGHIjklmnoPQRstuvwxyz"
              className="w-full font-mono text-[11px] bg-white border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-[#229ED9]/20 focus:border-[#229ED9] transition-all"
            />
          </FormField>

          <FormField label="Telegram Chat ID (ID Nhóm hoặc ID Cá nhân)">
            <input
              type="text"
              value={telegramChatId}
              onChange={(e) => setTelegramChatId(e.target.value)}
              placeholder="Ví dụ: -1001234567890"
              className="w-full font-mono text-[11px] bg-white border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-[#229ED9]/20 focus:border-[#229ED9] transition-all"
            />
          </FormField>
        </div>

        <div className="border-t border-border/20 pt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-3 px-6 rounded-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu cài đặt</span>
          </button>
        </div>
      </div>
    </div>
  );
}
