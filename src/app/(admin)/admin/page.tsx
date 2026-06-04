import { getCockpitAlerts, getRecentOrders } from "@/lib/actions/analytics.actions";
import CockpitAlerts from "@/components/admin/dashboard/CockpitAlerts";
import RecentOrders from "@/components/admin/dashboard/RecentOrders";
import { AlertCircle, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [alertsRes, recentRes] = await Promise.all([
    getCockpitAlerts(),
    getRecentOrders(10), // Hiển thị nhiều đơn hàng hơn trong mini-feed
  ]);

  const alerts = alertsRes.success && alertsRes.data ? alertsRes.data : null;
  const recentOrders = recentRes.success && recentRes.data ? recentRes.data : [];

  if (!alerts) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-canvas border border-border/40 rounded-3">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4 stroke-[1.5]" />
        <h3 className="font-playfair text-lg font-bold text-primary">Lỗi tải dữ liệu Cockpit</h3>
        <p className="text-sm text-secondary mt-1">Không thể truy xuất thông tin vận hành từ cơ sở dữ liệu.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-canvas border border-border/40 p-6 rounded-3 shadow-xs">
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
            Buồng lái Vận hành (Cockpit) ✈️
          </h1>
          <p className="text-sm text-secondary mt-1">
            Chào mừng quay lại. Đây là các điểm nóng cần bạn xử lý trong ngày hôm nay.
          </p>
        </div>
        <div className="flex items-center gap-2.5 text-xs font-bold text-secondary bg-[#FAF7F2] border border-border/40 px-4.5 py-2.5 rounded-2 self-start md:self-center">
          <Calendar className="w-4 h-4 text-accent" />
          <span>Hôm nay: {formatDate(new Date())}</span>
        </div>
      </div>

      {/* Actionable Alerts Widgets */}
      <CockpitAlerts alerts={alerts} />

      {/* Main Feeds Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transaction Feed - Expanded */}
        <div className="lg:col-span-2">
          <h2 className="text-lg font-playfair font-bold text-primary mb-4">Giao dịch gần đây</h2>
          <RecentOrders orders={recentOrders as any} />
        </div>
      </div>
    </div>
  );
}

