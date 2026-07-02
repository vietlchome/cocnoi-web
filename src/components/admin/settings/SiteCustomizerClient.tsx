"use client";

import { useMemo, useState, useTransition } from "react";
import { SITE_SCHEMA } from "@/config/site-schema";
import { updateSiteConfigAction } from "@/lib/actions/settings.actions";
import SectionEditor from "@/components/admin/customize/SectionEditor";
import type { SiteConfig } from "@/lib/site-config-validate";
import {
  Save, Eye, Loader2, Layout, Image as ImageIcon,
  Sparkles, LayoutGrid, MessageSquare, HelpCircle, Share2, Paintbrush,
  Phone, CreditCard, Users, Heart, BarChart3, Home,
} from "lucide-react";

const SECTION_ICONS: Record<string, React.ComponentType<any>> = {
  header: Layout,
  hero: ImageIcon,
  campaign: Sparkles,
  products: LayoutGrid,
  story: MessageSquare,
  trust_badges: Sparkles,
  faq: HelpCircle,
  contact: Phone,
  footer: Layout,
  social: Share2,
  seo: Paintbrush,
  analytics: BarChart3,
  homepage: Home,
  our_values: Heart,
  partners_meta: Users,
  payment_info: CreditCard,
  community_stories: MessageSquare,
};

// Nhom section theo chuc nang de rail ben trai de doc (kieu Haravan).
// navigation bi loai chu y: da co man Menu rieng tai /admin/website/navigation (Phase 10b).
const SECTION_GROUPS: { label: string; keys: string[] }[] = [
  { label: "Tổng quát", keys: ["header", "footer", "social", "contact"] },
  { label: "Trang chủ", keys: ["homepage", "hero", "campaign", "products", "story", "trust_badges", "faq"] },
  { label: "Trang nội dung khác", keys: ["our_values", "partners_meta", "payment_info", "community_stories"] },
  { label: "SEO & Tracking", keys: ["seo", "analytics"] },
];

const HIDDEN_SECTIONS = new Set(["navigation"]);

interface Props {
  initialConfig: SiteConfig;
}

function regroupErrors(flat: Record<string, string> | null): Record<string, Record<string, string>> | null {
  if (!flat) return null;
  const grouped: Record<string, Record<string, string>> = {};
  for (const [path, msg] of Object.entries(flat)) {
    const [section, ...rest] = path.split(".");
    if (!grouped[section]) grouped[section] = {};
    grouped[section][rest.join(".")] = msg;
  }
  return grouped;
}

export default function SiteCustomizerClient({ initialConfig }: Props) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

  const groups = useMemo(() => {
    const allKeys = Object.keys(SITE_SCHEMA).filter((k) => !HIDDEN_SECTIONS.has(k));
    const assigned = new Set<string>();
    const result = SECTION_GROUPS.map((g) => {
      const keys = g.keys.filter((k) => allKeys.includes(k));
      keys.forEach((k) => assigned.add(k));
      return { label: g.label, keys };
    }).filter((g) => g.keys.length > 0);

    const leftover = allKeys.filter((k) => !assigned.has(k));
    if (leftover.length > 0) result.push({ label: "Khác", keys: leftover });
    return result;
  }, []);

  const firstKey = groups[0]?.keys[0] ?? null;
  const [activeKey, setActiveKey] = useState<string | null>(firstKey);

  const groupedErrors = regroupErrors(fieldErrors);

  const handleSave = () => {
    setStatus("saving");
    startTransition(async () => {
      try {
        const res = await updateSiteConfigAction(config);
        if (res.success) {
          setFieldErrors(null);
          setStatus("success");
          setTimeout(() => setStatus("idle"), 3000);
        } else {
          const errs = res.fieldErrors ?? null;
          setFieldErrors(errs);
          setStatus("error");
          if (errs) {
            const firstErrSection = Object.keys(errs)[0]?.split(".")[0];
            if (firstErrSection && !HIDDEN_SECTIONS.has(firstErrSection)) {
              setActiveKey(firstErrSection);
            }
          }
        }
      } catch {
        setStatus("error");
        alert("Có lỗi xảy ra khi lưu.");
      }
    });
  };

  const activeSection = activeKey ? SITE_SCHEMA[activeKey] : null;
  const ActiveIcon = activeKey ? SECTION_ICONS[activeKey] || HelpCircle : HelpCircle;

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="sticky top-4 z-40 bg-canvas/80 backdrop-blur-md p-4 rounded-4 border border-border shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair font-bold text-lg text-primary">Tùy biến Giao diện</h2>
          <p className="text-sm text-secondary">Chỉnh nội dung hiển thị trên website. Menu điều hướng quản lý tại mục Website &rsaquo; Menu.</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-3 font-bvp text-sm font-semibold text-primary bg-subtle hover:bg-border transition-colors">
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Xem thực tế</span>
          </a>
          <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 px-6 py-2 rounded-3 font-bvp text-sm font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{status === "saving" ? "Đang lưu..." : status === "success" ? "Đã lưu!" : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      {fieldErrors && Object.keys(fieldErrors).length > 0 && (
        <div className="border border-rose-200 bg-rose-50 p-4 rounded-4 text-sm shadow-sm">
          <p className="font-semibold text-rose-700 mb-2">Vui lòng sửa các lỗi sau để lưu dữ liệu:</p>
          <ul className="list-disc pl-5 space-y-1 text-rose-600">
            {Object.entries(fieldErrors).map(([path, msg]) => (
              <li key={path}>
                <span className="font-mono font-semibold">{path}</span>: {msg}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="md:hidden">
        <select
          value={activeKey ?? ""}
          onChange={(e) => setActiveKey(e.target.value)}
          className="w-full px-3 py-2 rounded-3 border border-border bg-canvas text-sm font-semibold text-primary"
        >
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.keys.map((k) => (
                <option key={k} value={k}>{SITE_SCHEMA[k].label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className="flex gap-6 items-start">
        <nav className="hidden md:block w-64 shrink-0 sticky top-28 max-h-[calc(100vh-8rem)] overflow-y-auto pr-1">
          <div className="flex flex-col gap-5">
            {groups.map((g) => (
              <div key={g.label} className="flex flex-col gap-1">
                <p className="px-3 text-xs font-bold uppercase tracking-wide text-secondary/70">{g.label}</p>
                {g.keys.map((k) => {
                  const Icon = SECTION_ICONS[k] || HelpCircle;
                  const isActive = activeKey === k;
                  const hasError = !!groupedErrors?.[k];
                  return (
                    <button
                      key={k}
                      type="button"
                      onClick={() => setActiveKey(k)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-3 text-sm text-left transition-colors cursor-pointer ${
                        isActive ? "bg-primary text-canvas font-semibold" : "text-primary hover:bg-subtle"
                      }`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-canvas" : "text-accent"}`} />
                      <span className="flex-1 truncate">{SITE_SCHEMA[k].label}</span>
                      {hasError && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </nav>

        <div className="flex-1 min-w-0">
          {activeSection && activeKey ? (
            <div className="border border-border rounded-4 bg-canvas overflow-hidden">
              <div className="flex items-center gap-3 p-5 bg-subtle/30 border-b border-border">
                <ActiveIcon className="w-5 h-5 text-accent" />
                <h3 className="font-playfair font-bold text-primary text-lg">{activeSection.label}</h3>
              </div>
              <div className="p-6">
                <SectionEditor
                  schema={activeSection.fields}
                  value={(config[activeKey as keyof SiteConfig] || {}) as any}
                  onChange={(val) => setConfig((prev) => ({ ...prev, [activeKey]: val }))}
                  path={activeKey}
                  errors={groupedErrors?.[activeKey]}
                  disabled={isPending}
                />
              </div>
            </div>
          ) : (
            <div className="border border-border rounded-4 bg-canvas p-10 text-center text-secondary">
              Chọn một mục ở cột bên trái để bắt đầu chỉnh.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
