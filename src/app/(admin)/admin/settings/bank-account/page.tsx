import { ContentService } from "@/lib/services/content.service";
import BankAccountClient from "@/components/admin/settings/BankAccountClient";
import { CreditCard, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBankSettingsPage() {
  const settings = await ContentService.getAllThemeSettings();

  if (!settings) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-canvas border border-border/40 rounded-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 stroke-[1.5]" />
        <h3 className="font-playfair text-lg font-bold text-primary">Lỗi tải cấu hình</h3>
        <p className="text-sm text-secondary mt-1">Không thể kết nối đến bảng cấu hình trong hệ thống database.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-accent" />
          <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
            Tài Khoản Ngân Hàng
          </h1>
        </div>
        <p className="text-xs text-secondary mt-0.5 pl-8">
          Thiết lập số tài khoản để in tự động vào hóa đơn và báo giá gửi khách hàng B2B/B2C.
        </p>
      </div>

      <BankAccountClient initialSettings={settings} />
    </div>
  );
}
