import { formatCurrency } from "@/lib/utils/format";
import { Coins, ShoppingBag, Users, AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";

interface StatsCardsProps {
  stats: {
    revenue: number;
    revenueGrowth: number;
    salesCount: number;
    salesGrowth: number;
    customerCount: number;
    lowStockCount: number;
    lifetimeRevenue: number;
  };
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Doanh thu tháng này",
      value: formatCurrency(stats.revenue),
      growth: stats.revenueGrowth,
      icon: Coins,
      bgColor: "bg-emerald-50 text-emerald-600 border-emerald-100",
      description: "So với tháng trước",
    },
    {
      title: "Số lượng đơn hàng",
      value: `${stats.salesCount} đơn`,
      growth: stats.salesGrowth,
      icon: ShoppingBag,
      bgColor: "bg-blue-50 text-blue-600 border-blue-100",
      description: "So với tháng trước",
    },
    {
      title: "Khách hàng CRM",
      value: `${stats.customerCount} khách`,
      growth: null,
      icon: Users,
      bgColor: "bg-amber-50 text-amber-600 border-amber-100",
      description: "Tổng tệp khách hàng lưu trữ",
    },
    {
      title: "Sản phẩm sắp hết hàng",
      value: `${stats.lowStockCount} mã`,
      growth: null,
      icon: AlertTriangle,
      bgColor: stats.lowStockCount > 0 ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-slate-50 text-slate-500 border-slate-100",
      description: "Tồn kho dưới ngưỡng tối thiểu",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isPositive = card.growth !== null && card.growth >= 0;

        return (
          <div
            key={idx}
            className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:shadow-md hover:border-accent/30 transition-all duration-300 group"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-secondary uppercase tracking-wider block mb-1">
                  {card.title}
                </span>
                <span className="font-playfair text-2xl font-bold text-primary block tracking-tight transition-transform group-hover:translate-x-1 duration-300">
                  {card.value}
                </span>
              </div>
              <div className={`p-3 rounded-2.5 border ${card.bgColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between text-xs text-secondary">
              <span>{card.description}</span>
              {card.growth !== null && (
                <div
                  className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                    isPositive
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                      : "bg-rose-50 text-rose-600 border border-rose-100"
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3.5 h-3.5" />
                  ) : (
                    <TrendingDown className="w-3.5 h-3.5" />
                  )}
                  <span>{isPositive ? "+" : ""}{card.growth}%</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
