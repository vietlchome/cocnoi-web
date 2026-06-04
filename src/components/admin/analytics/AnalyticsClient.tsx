"use client";

import { useState, useEffect, useTransition } from "react";
import { 
  getDashboardStats, 
  getRecentOrders, 
  getRevenueByPeriod, 
  getTopProducts, 
  getOrdersByStatus,
  getStrategicInsights
} from "@/lib/actions/analytics.actions";
import { formatCurrency, formatDate } from "@/lib/utils/format";
import { 
  TrendingUp, 
  TrendingDown, 
  ShoppingBag, 
  Users, 
  AlertTriangle, 
  Coins, 
  RefreshCw, 
  ChevronRight, 
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Package
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar
} from "recharts";
import Link from "next/link";

export type DashboardChannel = "ALL" | "RETAIL" | "B2B";

// Định nghĩa màu sắc theo hệ màu gốm thủ công Cốc Nối
const BRAND_COLORS = {
  accent: "#C2703E",       // Màu Cam Đất Gốm đặc trưng
  primary: "#322A21",      // Màu Nâu Đen Thạch Anh
  secondary: "#8C8375",    // Màu Xám Đất Sét
  sage: "#5C7C5F",         // Màu Xanh Men Ngọc
  rose: "#D96B6B",         // Màu Đỏ Đất nung
  gold: "#E0A96D",         // Màu Vàng Cát Men rạn
  sky: "#7D9D9C",          // Màu Xanh Lam Nhạt
  cream: "#FAF7F2",        // Màu Kem Đất nung
};

// Nhãn và màu sắc cho các trạng thái đơn hàng
const STATUS_META: { [key: string]: { name: string; color: string } } = {
  PENDING: { name: "Chờ xử lý", color: BRAND_COLORS.gold },
  PROCESSING: { name: "Đang chuẩn bị", color: BRAND_COLORS.sky },
  SHIPPED: { name: "Đang giao hàng", color: BRAND_COLORS.accent },
  DELIVERED: { name: "Đã giao hàng", color: BRAND_COLORS.sage },
  CANCELLED: { name: "Đã hủy đơn", color: BRAND_COLORS.rose },
};

interface AnalyticsClientProps {
  initialStats: any;
  initialRecentOrders: any[];
  initialRevenueData: any[];
  initialTopProducts: any[];
  initialOrdersByStatus: any[];
  initialInsights: any;
}

export default function AnalyticsClient({
  initialStats,
  initialRecentOrders,
  initialRevenueData,
  initialTopProducts,
  initialOrdersByStatus,
  initialInsights,
}: AnalyticsClientProps) {
  // State quản lý kênh và chu kỳ lọc dữ liệu
  const [channel, setChannel] = useState<DashboardChannel>("ALL");
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");

  // State lưu trữ dữ liệu động khi lọc
  const [stats, setStats] = useState(initialStats);
  const [recentOrders, setRecentOrders] = useState(initialRecentOrders);
  const [revenueData, setRevenueData] = useState(initialRevenueData);
  const [topProducts, setTopProducts] = useState(initialTopProducts);
  const [ordersByStatus, setOrdersByStatus] = useState(initialOrdersByStatus);
  const [insights, setInsights] = useState(initialInsights);

  const [isPending, startTransition] = useTransition();
  const safeInsights = insights || {
    customerInsights: { aov: 0, newCustomers: 0, returningCustomers: 0, returningRate: 0 },
    productIntelligence: { inventoryVelocity: {} },
    efficiency: { promotionPenetration: 0, b2bConversionRate: 0 }
  }

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Tránh lỗi Mismatch Hydration khi sử dụng thư viện vẽ biểu đồ
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Hàm tải lại toàn bộ dữ liệu tương ứng với kênh (Channel) và chu kỳ (Period) đã chọn
  const loadFilteredData = (newChannel: DashboardChannel, newPeriod: typeof period) => {
    startTransition(async () => {
      try {
        const [statsRes, recentRes, revenueRes, topProductsRes, statusRes, insightsRes] = await Promise.all([
          getDashboardStats(newChannel),
          getRecentOrders(5, newChannel),
          getRevenueByPeriod(newPeriod, newChannel),
          getTopProducts(5, newChannel),
          getOrdersByStatus(newChannel),
          getStrategicInsights(newChannel)
        ]);

        if (statsRes.success) setStats(statsRes.data);
        if (recentRes.success) setRecentOrders(recentRes.data || []);
        if (revenueRes.success) setRevenueData(revenueRes.data || []);
        if (topProductsRes.success) setTopProducts(topProductsRes.data || []);
        if (statusRes.success) setOrdersByStatus(statusRes.data || []);
        if (insightsRes.success) setInsights(insightsRes.data);
      } catch (err) {
        console.error("Lỗi khi lọc dữ liệu phân tích:", err);
      }
    });
  };

  const handleChannelChange = (newChannel: DashboardChannel) => {
    setChannel(newChannel);
    loadFilteredData(newChannel, period);
  };

  const handlePeriodChange = (newPeriod: typeof period) => {
    setPeriod(newPeriod);
    loadFilteredData(channel, newPeriod);
  };

  const handleRefresh = () => {
    loadFilteredData(channel, period);
  };

  // Tính tổng số lượng đơn hàng hiện tại trong chu kỳ vẽ biểu đồ
  const totalChartOrders = revenueData.reduce((sum, item) => sum + item.ordersCount, 0);
  const totalChartRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);

  if (!isMounted) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <RefreshCw className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 relative pb-12">
      {/* Loading Overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-primary/5 backdrop-blur-[2px] z-50 flex items-center justify-center">
          <div className="bg-canvas border border-border/30 px-6 py-4 rounded-3 shadow-lg flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-accent animate-spin" />
            <span className="text-sm font-bold text-primary">Đang phân tích dữ liệu...</span>
          </div>
        </div>
      )}

      {/* 1. Header & Global Channel Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-canvas border border-border/40 p-6 rounded-3 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
              Báo cáo & Phân tích chuyên sâu
            </h1>
            <span className="text-[10px] uppercase font-extrabold tracking-wider bg-accent/10 text-accent px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Realtime
            </span>
          </div>
          <p className="text-xs text-secondary mt-1 max-w-xl">
            Bộ phân tích dữ liệu đa kênh thương mại gốm Cốc Nối. Giúp tối ưu hóa vận hành, theo dõi doanh thu và phát hiện sản phẩm tiềm năng.
          </p>
        </div>

        {/* Global Channel Filter Toggle */}
        <div className="flex items-center gap-3 self-start lg:self-center shrink-0">
          <div className="flex bg-[#FAF7F2] p-1 rounded-2 border border-border/30 shadow-inner">
            {(["ALL", "RETAIL", "B2B"] as const).map((ch) => (
              <button
                key={ch}
                onClick={() => handleChannelChange(ch)}
                className={`px-4 py-2 rounded-1.5 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  channel === ch
                    ? "bg-canvas text-accent shadow-xs border border-border/20 font-extrabold"
                    : "text-secondary hover:text-primary"
                }`}
              >
                {ch === "ALL" && (
                  <>
                    <Layers className="w-3.5 h-3.5" />
                    <span>Toàn bộ Kênh</span>
                  </>
                )}
                {ch === "RETAIL" && (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Bán lẻ (B2C)</span>
                  </>
                )}
                {ch === "B2B" && (
                  <>
                    <Users className="w-3.5 h-3.5" />
                    <span>Hợp đồng Sỉ (B2B)</span>
                  </>
                )}
              </button>
            ))}
          </div>

          <button
            onClick={handleRefresh}
            className="p-2.5 rounded-2 bg-canvas border border-border/40 text-secondary hover:text-accent hover:border-accent/40 shadow-xs cursor-pointer transition-all"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Strategic Insights Row (Deep Metrics) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Phân khu A: Khách sỉ & Chu kỳ */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:border-accent/30 transition-all duration-300 flex flex-col gap-5">
          <h3 className="font-playfair text-lg font-bold text-primary flex items-center gap-2 border-b border-border/40 pb-3">
            <Users className="w-5 h-5 text-accent" /> Phân tích Khách hàng (LTV)
          </h3>
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase">Chu kỳ lặp (Repurchase)</span>
            <span className="font-playfair text-xl font-bold text-primary">{safeInsights.customerInsights.repurchaseCycleDays} ngày</span>
          </div>
          <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
            <div className="h-full bg-emerald-500 w-3/4"></div>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase">Giá trị Vòng đời (LTV)</span>
            <span className="font-playfair text-xl font-bold text-primary">{formatCurrency(safeInsights.customerInsights.ltv)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase">Tỉ trọng Gốm Custom (Sỉ)</span>
            <span className="font-playfair text-xl font-bold text-sage-600">{safeInsights.customerInsights.customSplit}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-sage-500 h-full" style={{ width: `${safeInsights.customerInsights.customSplit}%` }}></div>
            <div className="bg-border h-full flex-1"></div>
          </div>
        </div>

        {/* Phân khu B: Sản phẩm & Tồn kho */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:border-accent/30 transition-all duration-300 flex flex-col gap-5">
          <h3 className="font-playfair text-lg font-bold text-primary flex items-center gap-2 border-b border-border/40 pb-3">
            <Package className="w-5 h-5 text-accent" /> Tồn kho & Rủi ro Gốm
          </h3>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase">Tỉ lệ Vỡ Hỏng (Dự báo)</span>
            <span className="font-playfair text-xl font-bold text-rose-500">{safeInsights.productIntelligence.breakageRate}%</span>
          </div>
          
          <div className="text-xs font-bold text-secondary uppercase mt-2">Cảnh báo Cạn kho (Cần nung gấp)</div>
          <div className="flex flex-col gap-2">
            {safeInsights.productIntelligence.inventoryVelocity.length > 0 ? (
              safeInsights.productIntelligence.inventoryVelocity.slice(0, 3).map((v: any, i: number) => (
                <div key={i} className="flex justify-between text-[11px] bg-rose-50 p-1.5 rounded">
                  <span className="font-bold text-rose-700 truncate w-2/3">{v.name}</span>
                  <span className="text-rose-600">Còn {v.daysUntilStockout} ngày</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-sage-600 bg-sage-50 p-1.5 rounded">Kho đang ổn định</span>
            )}
          </div>
        </div>

        {/* Phân khu C: Hiệu quả Dòng tiền & Khuyến mãi */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm hover:border-accent/30 transition-all duration-300 flex flex-col gap-5">
          <h3 className="font-playfair text-lg font-bold text-primary flex items-center gap-2 border-b border-border/40 pb-3">
            <Coins className="w-5 h-5 text-accent" /> Hiệu quả Dòng tiền
          </h3>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase">Tỉ lệ Kẹt Công nợ</span>
            <span className="font-playfair text-xl font-bold text-orange-600">{safeInsights.efficiency.debtRatio}%</span>
          </div>
          <div className="w-full h-1 bg-border/40 rounded-full overflow-hidden">
            <div className="h-full bg-orange-500" style={{ width: `${safeInsights.efficiency.debtRatio}%` }}></div>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-secondary uppercase">Độ "Nghiện" Khuyến Mãi</span>
            <span className="font-playfair text-xl font-bold text-amber-600">{safeInsights.efficiency.promotionPenetration}%</span>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden flex">
            <div className="bg-amber-500 h-full" style={{ width: `${safeInsights.efficiency.promotionPenetration}%` }}></div>
            <div className="bg-border h-full flex-1"></div>
          </div>
          <span className="text-[10px] text-secondary">({safeInsights.efficiency.promotionPenetration}% đơn hàng dùng mã giảm giá)</span>
        </div>

      </div>

      {/* 3. Charts Section (Revenue Trends & Status Distribution) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* BIỂU ĐỒ DOANH THU & ĐƠN HÀNG (2/3 width) */}
        <div className="lg:col-span-2 bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col h-[460px]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h3 className="font-playfair text-lg font-bold text-primary flex items-center gap-2">
                Biểu đồ xu hướng doanh số
              </h3>
              <p className="text-[11px] text-secondary mt-0.5">
                Doanh thu tích lũy & tần số giao dịch qua các khoảng thời gian
              </p>
            </div>

            {/* Period filter buttons */}
            <div className="flex bg-[#FAF7F2] p-1 rounded-2 border border-border/30 self-start sm:self-center shrink-0">
              {(["daily", "weekly", "monthly"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePeriodChange(p)}
                  className={`px-3 py-1.5 rounded-1.5 text-xs font-bold transition-all cursor-pointer ${
                    period === p
                      ? "bg-canvas text-accent shadow-xs border border-border/10 font-extrabold"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  {p === "daily" ? "7 ngày" : p === "weekly" ? "4 tuần" : "6 tháng"}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats Banner inside chart */}
          <div className="grid grid-cols-3 gap-4 mb-4 bg-[#FAF7F2] p-3.5 rounded-2.5 border border-border/20">
            <div>
              <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block mb-0.5">
                Kênh phân tích
              </span>
              <span className="text-xs font-bold text-primary">
                {channel === "ALL" ? "Toàn bộ" : channel === "RETAIL" ? "Bán lẻ (B2C)" : "Hợp đồng Sỉ (B2B)"}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block mb-0.5">
                Tổng Doanh thu Chu kỳ
              </span>
              <span className="text-xs font-bold text-accent">
                {formatCurrency(totalChartRevenue)}
              </span>
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold text-secondary tracking-wider block mb-0.5">
                Tổng Số Đơn Chu kỳ
              </span>
              <span className="text-xs font-bold text-sage-600">
                {totalChartOrders} đơn hàng
              </span>
            </div>
          </div>

          {/* Recharts Area Chart */}
          <div className="flex-grow min-h-0 w-full">
            {revenueData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-secondary">
                <p className="text-sm">Không có dữ liệu doanh thu trong chu kỳ này.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={BRAND_COLORS.accent} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={BRAND_COLORS.accent} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1ECE4" vertical={false} />
                  <XAxis 
                    dataKey="label" 
                    stroke={BRAND_COLORS.secondary} 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    dy={10}
                  />
                  <YAxis 
                    stroke={BRAND_COLORS.secondary} 
                    fontSize={10} 
                    fontWeight="bold"
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => 
                      val >= 1000000 
                        ? `${(val / 1000000).toFixed(0)}M` 
                        : val >= 1000 
                        ? `${val / 1000}k` 
                        : val
                    }
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: BRAND_COLORS.primary, 
                      color: "#fff", 
                      borderRadius: "8px", 
                      border: "none",
                      fontSize: "11px"
                    }}
                    labelStyle={{ fontWeight: "bold", color: BRAND_COLORS.gold, marginBottom: "4px" }}
                    formatter={(value: any) => [formatCurrency(Number(value)), "Doanh thu"]}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke={BRAND_COLORS.accent} 
                    strokeWidth={2.5}
                    fillOpacity={1} 
                    fill="url(#colorRevenue)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* CƠ CẤU TRẠNG THÁI ĐƠN HÀNG (1/3 width) */}
        <div className="lg:col-span-1 bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col h-[460px]">
          <div>
            <h3 className="font-playfair text-lg font-bold text-primary">Cơ cấu trạng thái đơn</h3>
            <p className="text-[11px] text-secondary mt-0.5">
              Phân bổ số lượng đơn hàng theo các bước vận hành
            </p>
          </div>

          <div className="flex-grow flex items-center justify-center min-h-[220px] relative">
            {ordersByStatus.every(d => d.count === 0) ? (
              <div className="text-secondary text-sm flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-8 h-8 text-secondary/50 mb-2" />
                <span>Không có đơn hàng nào tồn tại.</span>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={ordersByStatus.filter(d => d.count > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="count"
                  >
                    {ordersByStatus.filter(d => d.count > 0).map((entry, index) => {
                      const meta = STATUS_META[entry.status];
                      return (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={meta ? meta.color : BRAND_COLORS.secondary} 
                        />
                      );
                    })}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: BRAND_COLORS.primary, 
                      color: "#fff", 
                      borderRadius: "8px", 
                      border: "none",
                      fontSize: "11px"
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} đơn hàng`, 
                      STATUS_META[props.payload.status]?.name || props.payload.status
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Status custom Legend grid */}
          <div className="border-t border-border/30 pt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
            {ordersByStatus.map((item, idx) => {
              const meta = STATUS_META[item.status];
              return (
                <div key={idx} className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-subtle/10">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: meta ? meta.color : BRAND_COLORS.secondary }}
                    />
                    <span className="text-secondary text-[11px] font-medium">{meta ? meta.name : item.status}</span>
                  </div>
                  <span className="font-bold text-primary">{item.count} đơn</span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 4. Bottom Row (Top Selling Products Table & Recent Orders Feed) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* TOP SẢN PHẨM BÁN CHẠY (1/2 width) */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-playfair text-lg font-bold text-primary flex items-center gap-2">
                Top sản phẩm bán chạy nhất
              </h3>
              <p className="text-[11px] text-secondary mt-0.5">
                Xếp hạng sản phẩm dựa trên số lượng tiêu thụ & doanh thu
              </p>
            </div>
            <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-full">
              Kênh: {channel === "ALL" ? "Toàn bộ" : channel === "RETAIL" ? "Lẻ" : "Sỉ"}
            </span>
          </div>

          {/* Products List Table */}
          <div className="flex-grow pr-1">
            {topProducts.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary text-sm">
                Không tìm thấy sản phẩm bán chạy nào trong hệ thống.
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {topProducts.map((p, idx) => {
                  const maxSold = Math.max(...topProducts.map(tp => tp.soldQuantity), 1);
                  const progressPct = Math.round((p.soldQuantity / maxSold) * 100);

                  return (
                    <div 
                      key={idx} 
                      className="flex items-center gap-4 bg-[#FAF7F2] p-3 rounded-2.5 border border-border/20 hover:border-accent/25 hover:shadow-xs transition-all group"
                    >
                      {/* Product Index Badge */}
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        idx === 0 
                          ? "bg-accent text-canvas" 
                          : idx === 1 
                          ? "bg-primary text-amber-200" 
                          : "bg-subtle/30 text-secondary"
                      }`}>
                        {idx + 1}
                      </span>

                      {/* Product Thumbnail Placeholder or cover */}
                      <div className="w-11 h-11 rounded-2 bg-border/20 border border-border/40 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {p.coverImage ? (
                          <img 
                            src={p.coverImage} 
                            alt={p.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-secondary/40" />
                        )}
                      </div>

                      {/* Info & Contribution Progress bar */}
                      <div className="flex-grow min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-bold text-xs text-primary truncate" title={p.name}>
                            {p.name}
                          </h4>
                          <span className="text-xs font-bold text-accent shrink-0">
                            {formatCurrency(p.totalRevenue)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-secondary mb-1.5">
                          <span>Mã SKU: <strong className="text-primary">{p.sku}</strong></span>
                          <span>Đã bán: <strong className="text-sage-600 font-extrabold">{p.soldQuantity} cái</strong></span>
                        </div>

                        {/* Custom contribution progress bar */}
                        <div className="w-full h-1.5 bg-border/20 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-accent rounded-full transition-all duration-500"
                            style={{ 
                              width: `${progressPct}%`,
                              backgroundColor: idx === 0 ? BRAND_COLORS.accent : idx === 1 ? BRAND_COLORS.primary : BRAND_COLORS.secondary 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 text-center">
            <Link 
              href="/admin/products"
              className="text-xs font-bold text-accent hover:text-primary transition-colors inline-flex items-center gap-1 hover:underline"
            >
              Xem chi tiết danh sách sản phẩm <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* TỐC ĐỘ TIÊU THỤ & CẢNH BÁO NUNG GỐM (1/2 width) */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-playfair text-lg font-bold text-primary flex items-center gap-2">
                Tốc độ tiêu thụ & Cảnh báo Nung gốm
              </h3>
              <p className="text-[11px] text-secondary mt-0.5">
                Dự báo thời gian hết hàng dựa trên tốc độ bán 30 ngày qua
              </p>
            </div>
            <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Chú ý
            </span>
          </div>

          {/* Inventory Velocity Feed */}
          <div className="flex-grow pr-1">
            {!safeInsights.productIntelligence.inventoryVelocity || safeInsights.productIntelligence.inventoryVelocity.length === 0 ? (
              <div className="h-full flex items-center justify-center text-secondary text-sm text-center">
                Tốc độ tiêu thụ ổn định. Chưa có sản phẩm nào dự kiến hết hàng trong 60 ngày tới.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {safeInsights.productIntelligence.inventoryVelocity.map((item: any, idx: number) => {
                  const isCritical = item.daysUntilStockout <= 15;
                  const isWarning = item.daysUntilStockout <= 30 && item.daysUntilStockout > 15;
                  
                  return (
                    <div 
                      key={idx} 
                      className={`bg-canvas border rounded-2.5 p-4 shadow-2xs hover:shadow-xs transition-all flex items-center justify-between gap-4 ${
                        isCritical ? "border-rose-200 bg-rose-50/30" : isWarning ? "border-amber-200 bg-amber-50/30" : "border-border/30 hover:border-accent/30"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="font-bold text-sm text-primary truncate" title={item.name}>
                            {item.name}
                          </span>
                        </div>

                        <div className="text-[11px] text-secondary flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="bg-subtle/40 px-2 py-0.5 rounded text-primary">Tồn: <strong>{item.stockQuantity}</strong></span>
                          <span className="bg-subtle/40 px-2 py-0.5 rounded text-primary">Bán/tháng: <strong>{item.soldLast30Days}</strong></span>
                          <span className="bg-accent/10 px-2 py-0.5 rounded text-accent font-bold">Gợi ý SX: <strong>{Math.max(0, item.soldLast30Days * 2 - item.stockQuantity)} cái</strong></span>
                        </div>
                      </div>

                      {/* Stockout Prediction */}
                      <div className="text-right shrink-0 flex flex-col items-end gap-1">
                        <span className="text-[10px] text-secondary uppercase tracking-wider font-bold">Dự kiến cạn kho sau</span>
                        <span className={`font-playfair font-bold text-xl ${
                          isCritical ? "text-rose-600" : isWarning ? "text-amber-600" : "text-primary"
                        }`}>
                          {item.daysUntilStockout} ngày
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between">
            <span className="text-[10px] text-secondary italic">Công thức SX: (Tốc độ bán x 2 tháng) - Tồn kho</span>
            <button 
              className="text-xs font-bold text-accent hover:text-primary transition-colors inline-flex items-center gap-1 hover:underline cursor-pointer"
              onClick={() => alert("Chức năng tạo Đơn xuất sản xuất tự động đang được phát triển.")}
            >
              Tạo lệnh sản xuất tự động <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
