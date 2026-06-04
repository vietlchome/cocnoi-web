import { formatCurrency } from "@/lib/utils/format";
import { Coins, CircleDollarSign, ShieldAlert, Sparkles, CheckCircle } from "lucide-react";

interface DebtSummary {
  totalB2BAmount: number;
  totalB2BPaid: number;
  totalB2BDebt: number;
  activeDebtOrdersCount: number;
  clearedDebtOrdersCount: number;
  totalOrdersCount: number;
}

interface DebtOverviewProps {
  summary: DebtSummary;
}

export default function DebtOverview({ summary }: DebtOverviewProps) {
  const collectionRate = summary.totalB2BAmount > 0
    ? Math.round((summary.totalB2BPaid / summary.totalB2BAmount) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-6">
      {/* 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total B2B Amount */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                Tổng giá trị sỉ B2B
              </span>
              <span className="font-playfair text-2xl font-bold text-primary block tracking-tight transition-transform group-hover:translate-x-1 duration-300">
                {formatCurrency(summary.totalB2BAmount)}
              </span>
            </div>
            <div className="p-3 rounded-2.5 bg-accent/10 text-accent border border-accent/20">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-secondary mt-3">
            Lũy kế từ {summary.totalOrdersCount} hợp đồng/đơn hàng sỉ sỉ
          </p>
        </div>

        {/* Total Collected */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                Tổng tiền đã thu
              </span>
              <span className="font-playfair text-2xl font-bold text-emerald-600 block tracking-tight transition-transform group-hover:translate-x-1 duration-300">
                {formatCurrency(summary.totalB2BPaid)}
              </span>
            </div>
            <div className="p-3 rounded-2.5 bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CircleDollarSign className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-secondary mt-3">
            Tương đương với hiệu suất thu hồi {collectionRate}%
          </p>
        </div>

        {/* Total Outstanding Debt */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:shadow-md transition-all group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                Dư nợ B2B còn lại
              </span>
              <span className="font-playfair text-2xl font-bold text-rose-500 block tracking-tight transition-transform group-hover:translate-x-1 duration-300">
                {formatCurrency(summary.totalB2BDebt)}
              </span>
            </div>
            <div className="p-3 rounded-2.5 bg-rose-50 text-rose-600 border border-rose-100">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-secondary mt-3">
            Từ {summary.activeDebtOrdersCount} đơn đang nợ / {summary.clearedDebtOrdersCount} đơn đã tất toán
          </p>
        </div>
      </div>

      {/* Collection Progress Bar */}
      <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm">
        <div className="flex items-center justify-between text-xs font-bold text-primary mb-3">
          <span>Tiến trình thu hồi công nợ B2B</span>
          <span className="text-accent">{collectionRate}% Hoàn tất</span>
        </div>
        <div className="w-full h-3.5 bg-subtle/30 rounded-full overflow-hidden border border-border/20 p-0.5">
          <div
            className="h-full bg-gradient-to-r from-accent to-emerald-500 rounded-full transition-all duration-500 shadow-xs"
            style={{ width: `${collectionRate}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3 text-[10px] text-secondary">
          <span className="flex items-center gap-1">
            <Coins className="w-3.5 h-3.5 text-accent" />
            Đã thu: {formatCurrency(summary.totalB2BPaid)}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
            Cần thu tiếp: {formatCurrency(summary.totalB2BDebt)}
          </span>
        </div>
      </div>
    </div>
  );
}
