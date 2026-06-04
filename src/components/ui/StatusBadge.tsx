import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalized = status.toUpperCase();

  const styles: Record<string, string> = {
    // Orders & Inquiries Status
    PENDING: 'bg-amber-500/10 text-amber-500 border border-amber-500/20',
    PROCESSING: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
    SHIPPED: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    DELIVERED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    CANCELLED: 'bg-rose-500/10 text-rose-500 border border-rose-500/20',
    CONTACTED: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    NEGOTIATING: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    CONVERTED: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',

    // Customer Types / Tiers
    RETAIL_LEAD: 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20',
    RETAIL_BUYER: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    B2B_LEAD: 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20',
    B2B_WHOLESALE: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
    B2B_CONSIGNMENT: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20',
    B2B_GIFT: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',

    // Visibility
    PUBLIC: 'bg-teal-500/10 text-teal-400 border border-teal-500/20',
    B2B_ONLY: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  const currentStyle = styles[normalized] || 'bg-neutral-800 text-neutral-400 border border-neutral-700';

  const labelMap: Record<string, string> = {
    PENDING: 'Chờ xử lý',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Đã giao',
    CANCELLED: 'Đã hủy',
    CONTACTED: 'Đã liên hệ',
    NEGOTIATING: 'Đang đàm phán',
    CONVERTED: 'Đã chốt đơn',
    RETAIL_LEAD: 'Lead Mua Lẻ',
    RETAIL_BUYER: 'Khách Mua Lẻ',
    B2B_LEAD: 'Lead B2B',
    B2B_WHOLESALE: 'B2B Nhập sỉ',
    B2B_CONSIGNMENT: 'B2B Ký gửi',
    B2B_GIFT: 'B2B Quà tặng',
    PUBLIC: 'Công khai',
    B2B_ONLY: 'Chỉ B2B',
  };

  const label = labelMap[normalized] || status;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium tracking-wide shadow-sm ${currentStyle}`}>
      {label}
    </span>
  );
};
