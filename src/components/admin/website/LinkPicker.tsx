"use client";

// Bảng route cố định của dự án - mở rộng sau khi Phase 10c có model Page
const PRESET_ROUTES = [
  { label: "Trang chủ", href: "/" },
  { label: "Cửa hàng (tất cả SP)", href: "/cua-hang" },
  { label: "Khám phá", href: "/discover" },
  { label: "Cộng đồng", href: "/community/nguoi-noi" },
  { label: "Đối tác", href: "/partners" },
  { label: "Hành trình (Blog)", href: "/journal" },
  { label: "Liên hệ", href: "/contact" },
  { label: "Câu hỏi thường gặp", href: "/faq" },
] as const;

const CUSTOM = "__custom__";

function inferSelectValue(href: string): string {
  const found = PRESET_ROUTES.find((r) => r.href === href);
  return found ? href : CUSTOM;
}

interface Props {
  value: string;
  onChange: (href: string) => void;
  disabled?: boolean;
}

export default function LinkPicker({ value, onChange, disabled }: Props) {
  const selectVal = inferSelectValue(value);
  const isCustom = selectVal === CUSTOM;

  const handleSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    if (v === CUSTOM) {
      const wasPreset = PRESET_ROUTES.some((r) => r.href === value);
      onChange(wasPreset ? "" : value);
    } else {
      onChange(v);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <select
        value={selectVal}
        onChange={handleSelect}
        disabled={disabled}
        className="w-full px-3 py-2 rounded-3 border border-border bg-canvas text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
      >
        {PRESET_ROUTES.map((r) => (
          <option key={r.href} value={r.href}>{r.label}</option>
        ))}
        <option value={CUSTOM}>URL tùy chỉnh</option>
      </select>

      {isCustom ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="/duong-dan-tuy-chinh"
          className="w-full px-3 py-2 rounded-3 border border-border bg-canvas text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
        />
      ) : (
        <p className="text-xs text-secondary/50 px-1 font-mono">{value}</p>
      )}
    </div>
  );
}
