import { formatCurrency } from "@/lib/utils/format";
import { Coins, Package, MessageSquare, AlertTriangle, Star, TrendingUp, TrendingDown, Clock, CreditCard } from "lucide-react";
import Link from "next/link";

interface CockpitAlertsProps {
  alerts: {
    todayRevenue: number;
    yesterdayRevenue: number;
    urgentRetailOrdersCount: number;
    pendingB2BOrdersCount: number;
    pendingInquiriesCount: number;
    staleInquiriesCount: number;
    overdueDebtOrdersCount: number;
    lowStockCount: number;
    badReviewsCount: number;
  };
}

export default function CockpitAlerts({ alerts }: CockpitAlertsProps) {
  // Tính % tăng trưởng doanh thu so với hôm qua
  const revenueGrowth = alerts.yesterdayRevenue > 0 
    ? ((alerts.todayRevenue - alerts.yesterdayRevenue) / alerts.yesterdayRevenue) * 100 
    : 0;

  const cards = [
    {
      title: "Doanh thu hôm nay",
      value: formatCurrency(alerts.todayRevenue),
      icon: Coins,
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: (
        <div className="flex items-center gap-1 font-bold">
          {revenueGrowth > 0 ? (
            <><TrendingUp className="w-3 h-3 text-emerald-500" /><span className="text-emerald-500">+{revenueGrowth.toFixed(1)}%</span></>
          ) : revenueGrowth < 0 ? (
            <><TrendingDown className="w-3 h-3 text-rose-500" /><span className="text-rose-500">{revenueGrowth.toFixed(1)}%</span></>
          ) : (
            <span className="text-gray-400">0%</span>
          )}
          <span className="text-[10px] text-gray-400 font-normal">so với hôm qua</span>
        </div>
      ),
      link: "/admin/orders",
      urgent: false,
    },
    {
      title: "B2C chậm đóng gói",
      value: `${alerts.urgentRetailOrdersCount} đơn`,
      icon: Clock,
      bgColor: alerts.urgentRetailOrdersCount > 0 ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100",
      description: <span className={alerts.urgentRetailOrdersCount > 0 ? "text-rose-600 font-medium" : ""}>Treo &gt; 24h chưa gửi</span>,
      link: "/admin/orders?status=PENDING",
      urgent: alerts.urgentRetailOrdersCount > 0,
    },
    {
      title: "Khách sỉ ngâm tư vấn",
      value: `${alerts.staleInquiriesCount} yêu cầu`,
      icon: MessageSquare,
      bgColor: alerts.staleInquiriesCount > 0 ? "bg-amber-50 text-amber-600 border-amber-100 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100",
      description: <span className={alerts.staleInquiriesCount > 0 ? "text-amber-600 font-medium" : ""}>Thương lượng &gt; 3 ngày</span>,
      link: "/admin/inquiries?status=NEGOTIATING",
      urgent: alerts.staleInquiriesCount > 0,
    },
    {
      title: "Công nợ quá hạn",
      value: `${alerts.overdueDebtOrdersCount} khoản`,
      icon: CreditCard,
      bgColor: alerts.overdueDebtOrdersCount > 0 ? "bg-red-50 text-red-600 border-red-100 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100",
      description: <span className={alerts.overdueDebtOrdersCount > 0 ? "text-red-600 font-medium" : ""}>Giam vốn &gt; 30 ngày</span>,
      link: "/admin/orders?status=DEBT",
      urgent: alerts.overdueDebtOrdersCount > 0,
    },
    {
      title: "Hàng sắp cạn kho",
      value: `${alerts.lowStockCount} mã`,
      icon: AlertTriangle,
      bgColor: alerts.lowStockCount > 0 ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-slate-50 text-slate-500 border-slate-100",
      description: "Cần lên mẻ nung mới",
      link: "/admin/products?stock=low",
      urgent: alerts.lowStockCount > 0,
    },
    {
      title: "Đánh giá 1-2★",
      value: `${alerts.badReviewsCount} review`,
      icon: Star,
      bgColor: alerts.badReviewsCount > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-slate-50 text-slate-500 border-slate-100",
      description: "Vỡ hỏng / Lỗi sản phẩm",
      link: "/admin/reviews?rating=bad",
      urgent: alerts.badReviewsCount > 0,
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;

        return (
          <Link
            href={card.link}
            key={idx}
            className={`bg-canvas border rounded-3 p-4 shadow-sm hover:shadow-md transition-all duration-300 group flex flex-col justify-between ${
              card.urgent ? "border-accent/40" : "border-border/40 hover:border-accent/30"
            }`}
          >
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-2.5 border ${card.bgColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
                {card.urgent && (
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent"></span>
                  </span>
                )}
              </div>
              
              <span className="text-[10px] font-bold text-secondary uppercase tracking-wider block mb-1 truncate">
                {card.title}
              </span>
              <span className={`font-playfair text-xl font-bold block tracking-tight transition-transform group-hover:translate-x-1 duration-300 truncate ${
                card.urgent ? "text-accent" : "text-primary"
              }`}>
                {card.value}
              </span>
            </div>

            <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-secondary">
              {card.description}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
