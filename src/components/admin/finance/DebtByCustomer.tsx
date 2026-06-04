import Link from "next/link";
import { formatCurrency, formatPhone } from "@/lib/utils/format";
import { User, Building, ArrowRight, Coins, HelpCircle } from "lucide-react";

interface CustomerDebtItem {
  id: string;
  name: string;
  phone: string;
  companyName: string | null;
  email: string | null;
  debtSummary: {
    totalAmount: number;
    paidAmount: number;
    debtAmount: number;
    debtOrdersCount: number;
  };
}

interface DebtByCustomerProps {
  customers: CustomerDebtItem[];
}

export default function DebtByCustomer({ customers }: DebtByCustomerProps) {
  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm">
      <div className="mb-5">
        <h3 className="font-playfair text-lg font-bold text-primary">
          Bảng kê nợ phải thu theo đối tác (B2B Ledger)
        </h3>
        <p className="text-xs text-secondary mt-0.5">
          Danh sách khách hàng sỉ đang phát sinh dư nợ, sắp xếp từ cao xuống thấp
        </p>
      </div>

      <div className="overflow-x-auto">
        {customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-secondary text-sm">
            <Coins className="w-10 h-10 stroke-[1.5] mb-2 opacity-50 text-accent" />
            <span>Tuyệt vời! Hiện tại không có dư nợ B2B chưa thanh toán.</span>
          </div>
        ) : (
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead>
              <tr className="border-b border-border/40 bg-[#FAF7F2] text-secondary text-[10px] uppercase tracking-wider font-bold">
                <th className="py-4.5 px-6">Đối tác & Liên hệ</th>
                <th className="py-4.5 px-4 text-right">Tổng mua sỉ</th>
                <th className="py-4.5 px-4 text-right">Đã thu</th>
                <th className="py-4.5 px-4 text-right text-rose-600">Còn nợ sếp</th>
                <th className="py-4.5 px-4 text-center">Số hợp đồng</th>
                <th className="py-4.5 px-6 text-right">Chi tiết CRM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/20">
              {customers.map((c) => {
                const hasCompany = !!c.companyName;

                return (
                  <tr
                    key={c.id}
                    className="hover:bg-subtle/5 transition-colors group"
                  >
                    {/* Customer info */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          hasCompany ? "bg-purple-50 text-purple-600" : "bg-accent/10 text-accent"
                        }`}>
                          {hasCompany ? (
                            <Building className="w-4 h-4" />
                          ) : (
                            <User className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <span className="text-sm font-bold text-primary block truncate group-hover:text-accent transition-colors">
                            {c.name}
                          </span>
                          <span className="text-xs text-secondary block mt-0.5">
                            {hasCompany ? `${c.companyName} • ` : ""}{formatPhone(c.phone)}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Total buy */}
                    <td className="py-4.5 px-4 text-right font-medium text-primary">
                      {formatCurrency(c.debtSummary.totalAmount)}
                    </td>

                    {/* Paid */}
                    <td className="py-4.5 px-4 text-right font-medium text-emerald-600">
                      {formatCurrency(c.debtSummary.paidAmount)}
                    </td>

                    {/* Debt remaining */}
                    <td className="py-4.5 px-4 text-right font-bold text-rose-500">
                      {formatCurrency(c.debtSummary.debtAmount)}
                    </td>

                    {/* Contracts count */}
                    <td className="py-4.5 px-4 text-center font-bold text-secondary">
                      {c.debtSummary.debtOrdersCount} đơn nợ
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-right">
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2 bg-accent/10 hover:bg-accent text-accent hover:text-canvas text-xs font-bold transition-all cursor-pointer"
                      >
                        <span>Sổ nợ CRM</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
