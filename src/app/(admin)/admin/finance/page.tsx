import { FinanceService } from "@/lib/services/finance.service";
import DebtOverview from "@/components/admin/finance/DebtOverview";
import DebtByCustomer from "@/components/admin/finance/DebtByCustomer";
import { Coins, AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminFinancePage() {
  const [summary, customersRes] = await Promise.all([
    FinanceService.getDebtSummary(),
    FinanceService.getDebtByCustomer({ page: 1, pageSize: 50 }),
  ]);

  if (!summary || !customersRes) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-canvas border border-border/40 rounded-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 stroke-[1.5]" />
        <h3 className="font-playfair text-lg font-bold text-primary">Lỗi tải dữ liệu</h3>
        <p className="text-sm text-secondary mt-1">Không thể lấy thông tin báo cáo công nợ từ hệ thống.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Page Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Coins className="w-6 h-6 text-accent" />
          <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
            Quản Lý Công Nợ B2B
          </h1>
        </div>
        <p className="text-xs text-secondary mt-0.5 pl-8">
          Hệ thống theo dõi công nợ, quản lý sổ nợ sỉ đối tác, ký gửi và tất toán hợp đồng thương mại Cốc Nối.
        </p>
      </div>

      {/* Global Debt Overview Stats */}
      <DebtOverview summary={summary} />

      {/* Debt Ledger list by customer */}
      <DebtByCustomer customers={customersRes.data} />
    </div>
  );
}
