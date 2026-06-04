import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { ArrowRight, Receipt, User } from "lucide-react";
import { OrderStatus, OrderType } from "@prisma/client";

interface RecentOrder {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  orderType: OrderType;
  createdAt: Date;
  customer: {
    name: string;
    phone: string;
  } | null;
}

interface RecentOrdersProps {
  orders: RecentOrder[];
}

export default function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="font-playfair text-lg font-bold text-primary">
            Đơn hàng mới nhất
          </h3>
          <p className="text-xs text-secondary mt-0.5">
            5 hóa đơn phát sinh gần đây
          </p>
        </div>
        <Link
          href="/admin/orders"
          className="flex items-center gap-1 text-xs font-bold text-accent hover:text-accent-hover transition-colors"
        >
          <span>Xem tất cả</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="flex-grow divide-y divide-border/40 overflow-y-auto">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-secondary text-sm">
            <Receipt className="w-8 h-8 stroke-[1.5] mb-2 opacity-60" />
            <span>Chưa có đơn hàng nào được ghi nhận.</span>
          </div>
        ) : (
          orders.map((order) => {
            const isB2B = order.orderType !== OrderType.RETAIL;
            const customerName = order.customer?.name || "Khách vãng lai";

            return (
              <div
                key={order.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between hover:bg-subtle/5 px-2 rounded-2 transition-colors group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    isB2B ? "bg-purple-50 text-purple-600" : "bg-emerald-50 text-emerald-600"
                  }`}>
                    {isB2B ? (
                      <span className="text-[10px] font-bold">B2B</span>
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-primary block truncate group-hover:text-accent transition-colors">
                      {customerName}
                    </span>
                    <span className="text-xs text-secondary block mt-0.5">
                      Mã: #{order.id.slice(-8).toUpperCase()} • {formatDate(order.createdAt)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5 text-right shrink-0">
                  <span className="text-sm font-bold text-primary">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
