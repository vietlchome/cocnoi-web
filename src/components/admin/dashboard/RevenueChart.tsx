"use client";

import { useState, useEffect, useTransition } from "react";
import { getRevenueByPeriod } from "@/lib/actions/analytics.actions";
import { formatCurrency } from "@/lib/utils/format";
import { RefreshCw, TrendingUp } from "lucide-react";

interface ChartData {
  label: string;
  revenue: number;
  ordersCount: number;
}

interface RevenueChartProps {
  initialData: ChartData[];
}

export default function RevenueChart({ initialData }: RevenueChartProps) {
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly">("daily");
  const [data, setData] = useState<ChartData[]>(initialData);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [isPending, startTransition] = useTransition();

  // Load data when period changes
  useEffect(() => {
    if (period === "daily" && data === initialData) return;

    startTransition(async () => {
      const res = await getRevenueByPeriod(period);
      if (res.success && res.data) {
        setData(res.data);
      }
    });
  }, [period]);

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1000000);
  const totalRevenue = data.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = data.reduce((sum, d) => sum + d.ordersCount, 0);

  // SVG Chart Dimensions
  const chartHeight = 220;
  const chartWidth = 500;
  const padding = { top: 20, right: 30, bottom: 30, left: 60 };

  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  // Calculate points
  const points = data.map((d, idx) => {
    const x = padding.left + (idx / (data.length - 1 || 1)) * graphWidth;
    const y = padding.top + graphHeight - (d.revenue / maxRevenue) * graphHeight;
    return { x, y, ...d };
  });

  // Construct SVG Path
  const linePath = points.length > 0
    ? points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ")
    : "";

  // Construct Area Path (for gradient fill)
  const areaPath = points.length > 0
    ? `${linePath} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`
    : "";

  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col h-full relative overflow-hidden">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h3 className="font-playfair text-lg font-bold text-primary">Biểu đồ doanh thu</h3>
          <p className="text-xs text-secondary mt-0.5">
            Thống kê doanh số & sản lượng đơn hàng
          </p>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex bg-subtle/20 p-1 rounded-2 border border-border/30 self-start sm:self-center shrink-0">
          {(["daily", "weekly", "monthly"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              disabled={isPending}
              className={`px-3 py-1.5 rounded-1.5 text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? "bg-canvas text-accent shadow-xs"
                  : "text-secondary hover:text-primary"
              }`}
            >
              {p === "daily" ? "7 ngày" : p === "weekly" ? "4 tuần" : "6 tháng"}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Quick-view */}
      <div className="grid grid-cols-2 gap-4 mb-6 bg-[#FAF7F2] p-4 rounded-2.5 border border-border/20">
        <div>
          <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block mb-0.5">
            Tổng doanh thu chu kỳ
          </span>
          <span className="text-lg font-bold text-accent">
            {formatCurrency(totalRevenue)}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase font-bold text-secondary tracking-wider block mb-0.5">
            Tổng đơn hàng chu kỳ
          </span>
          <span className="text-lg font-bold text-primary flex items-center gap-1.5">
            <span>{totalOrders} đơn</span>
            <span className="text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-full font-semibold flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
              Tốt
            </span>
          </span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="flex-grow flex items-center justify-center relative min-h-[220px]">
        {isPending && (
          <div className="absolute inset-0 bg-canvas/60 backdrop-blur-xs z-10 flex items-center justify-center">
            <RefreshCw className="w-6 h-6 text-accent animate-spin" />
          </div>
        )}

        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible select-none"
        >
          {/* Definitions for Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent, #C2703E)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--color-accent, #C2703E)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
            const y = padding.top + ratio * graphHeight;
            const value = maxRevenue * (1 - ratio);
            return (
              <g key={i} className="opacity-40">
                <line
                  x1={padding.left}
                  y1={y}
                  x2={chartWidth - padding.right}
                  y2={y}
                  stroke="#EBE5D9"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={padding.left - 10}
                  y={y + 4}
                  fill="var(--color-secondary, #6B7280)"
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="end"
                >
                  {value >= 1000000 ? `${(value / 1000000).toFixed(1)}M` : `${value / 1000}k`}
                </text>
              </g>
            );
          })}

          {/* X Axis Labels */}
          {points.map((p, idx) => (
            <text
              key={idx}
              x={p.x}
              y={chartHeight - 10}
              fill="var(--color-secondary, #6B7280)"
              fontSize="9"
              fontWeight="bold"
              textAnchor="middle"
              className="opacity-70"
            >
              {p.label}
            </text>
          ))}

          {/* Line & Area Graphic */}
          {points.length > 0 && (
            <>
              {/* Gradient Area */}
              <path d={areaPath} fill="url(#chartGradient)" />

              {/* Glowing Line */}
              <path
                d={linePath}
                fill="none"
                stroke="var(--color-accent, #C2703E)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </>
          )}

          {/* Interactive Hover Columns */}
          {points.map((p, idx) => {
            const colWidth = graphWidth / (data.length - 1 || 1);
            return (
              <rect
                key={idx}
                x={p.x - colWidth / 2}
                y={padding.top}
                width={colWidth}
                height={graphHeight}
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Dots on Hover */}
          {points.map((p, idx) => {
            const isHovered = hoveredIdx === idx;
            return (
              <g key={idx} className="transition-all duration-200">
                {isHovered && (
                  <>
                    {/* Vertical hover guide-line */}
                    <line
                      x1={p.x}
                      y1={padding.top}
                      x2={p.x}
                      y2={padding.top + graphHeight}
                      stroke="var(--color-accent, #C2703E)"
                      strokeWidth="1.5"
                      strokeDasharray="2 2"
                      opacity="0.8"
                    />

                    {/* Outer glowing halo */}
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r="7"
                      fill="var(--color-accent, #C2703E)"
                      opacity="0.3"
                    />
                  </>
                )}

                {/* Main point dot */}
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isHovered ? "4.5" : "3.5"}
                  fill={isHovered ? "var(--color-accent, #C2703E)" : "var(--color-canvas, #FEFCF9)"}
                  stroke="var(--color-accent, #C2703E)"
                  strokeWidth="2"
                />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div
            className="absolute bg-primary text-canvas px-3 py-2 rounded-2 shadow-lg border border-border/10 text-left z-20 transition-all pointer-events-none"
            style={{
              left: `${((points[hoveredIdx].x - padding.left) / graphWidth) * 90 + 5}%`,
              top: `${((points[hoveredIdx].y - padding.top) / graphHeight) * 50 + 20}%`,
            }}
          >
            <span className="text-[10px] uppercase font-bold text-canvas/50 block mb-0.5">
              {points[hoveredIdx].label}
            </span>
            <span className="text-xs font-bold block text-accent mb-0.5">
              DT: {formatCurrency(points[hoveredIdx].revenue)}
            </span>
            <span className="text-[10px] font-medium block">
              Số đơn: {points[hoveredIdx].ordersCount} đơn
            </span>
          </div>
        )}
      </div>

    </div>
  );
}
