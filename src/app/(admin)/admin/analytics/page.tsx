import { 
  getDashboardStats, 
  getRecentOrders, 
  getRevenueByPeriod, 
  getTopProducts, 
  getOrdersByStatus,
  getStrategicInsights
} from "@/lib/actions/analytics.actions";
import AnalyticsClient from "@/components/admin/analytics/AnalyticsClient";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminAnalyticsPage() {
  // Lấy dữ liệu ban đầu song song từ cơ sở dữ liệu trên Server
  const [
    statsRes,
    recentRes,
    revenueRes,
    topProductsRes,
    statusRes,
    insightsRes
  ] = await Promise.all([
    getDashboardStats("ALL"),
    getRecentOrders(5, "ALL"),
    getRevenueByPeriod("daily", "ALL"),
    getTopProducts(5, "ALL"),
    getOrdersByStatus("ALL"),
    getStrategicInsights("ALL"),
  ]);

  const stats = statsRes.success && statsRes.data ? statsRes.data : null;
  const recentOrders = recentRes.success && recentRes.data ? recentRes.data : [];
  const revenueData = revenueRes.success && revenueRes.data ? revenueRes.data : [];
  const topProducts = topProductsRes.success && topProductsRes.data ? topProductsRes.data : [];
  const ordersByStatus = statusRes.success && statusRes.data ? statusRes.data : [];
  const insights = insightsRes.success && insightsRes.data ? insightsRes.data : null;

  const hasError = !statsRes.success;

  if (hasError || !stats) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-canvas border border-border/40 rounded-3 max-w-xl mx-auto my-8 p-8 text-center shadow-xs">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 stroke-[1.5]" />
        <h3 className="font-playfair text-lg font-bold text-primary">Lỗi tải dữ liệu phân tích</h3>
        <p className="text-sm text-secondary mt-2 mb-6">
          Không thể kết nối đến cơ sở dữ liệu để truy xuất báo cáo doanh thu & đơn hàng. Vui lòng kiểm tra lại cấu hình kết nối database.
        </p>
        <Link 
          href="/admin" 
          className="px-5 py-2.5 rounded-2 bg-accent text-canvas text-xs font-bold hover:bg-accent/90 transition-all flex items-center gap-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Trang chủ Admin
        </Link>
      </div>
    );
  }

  return (
    <AnalyticsClient
      initialStats={stats}
      initialRecentOrders={recentOrders}
      initialRevenueData={revenueData}
      initialTopProducts={topProducts}
      initialOrdersByStatus={ordersByStatus}
      initialInsights={insights}
    />
  );
}
