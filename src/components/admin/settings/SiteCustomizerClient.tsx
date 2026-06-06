"use client";

import { useState, useTransition } from "react";
import { SITE_SCHEMA } from "@/config/site-schema";
import { updateSiteConfigAction } from "@/lib/actions/settings.actions";
import SectionEditor from "@/components/admin/customize/SectionEditor";
import type { SiteConfig } from "@/lib/site-config-validate";
import { 
  Save, Eye, ChevronDown, ChevronUp, Loader2, Layout, Image as ImageIcon, 
  Sparkles, LayoutGrid, MessageSquare, HelpCircle, Share2, Paintbrush 
} from "lucide-react";

const SECTION_ICONS: Record<string, React.ComponentType<any>> = {
  header: Layout,
  hero: ImageIcon,
  campaign: Sparkles,
  products: LayoutGrid,
  story: MessageSquare,
  values: LayoutGrid,
  faq: HelpCircle,
  footer: Layout,
  social: Share2,
  seo: Paintbrush,
};

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
  const [openSection, setOpenSection] = useState<string | null>("header");
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

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
          setFieldErrors(res.fieldErrors ?? null);
          setStatus("error");
          alert(res.error || "Có lỗi xảy ra khi lưu.");
        }
      } catch (err) {
        setStatus("error");
        alert("Có lỗi xảy ra khi lưu.");
      }
    });
  };

  const groupedErrors = regroupErrors(fieldErrors);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      {/* Sticky Header */}
      <div className="sticky top-4 z-40 bg-canvas/80 backdrop-blur-md p-4 rounded-4 border border-border shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-playfair font-bold text-lg text-primary">Tùy biến Giao diện</h2>
          <p className="text-sm text-secondary">Cập nhật nội dung hiển thị trên website</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-3 font-bvp text-sm font-semibold text-primary bg-subtle hover:bg-border transition-colors">
            <Eye className="w-4 h-4" />
            <span>Xem thực tế</span>
          </a>
          <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 px-6 py-2 rounded-3 font-bvp text-sm font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{status === "saving" ? "Đang lưu..." : status === "success" ? "Đã lưu!" : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      {/* Validation Errors Panel */}
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

      {/* Sections Accordions */}
      <div className="flex flex-col gap-3">
        {Object.entries(SITE_SCHEMA).map(([key, section]) => {
          const Icon = SECTION_ICONS[key] || HelpCircle;
          const isOpen = openSection === key;
          
          return (
            <div key={key} className="border border-border rounded-4 bg-canvas overflow-hidden">
              <button 
                type="button"
                onClick={() => setOpenSection(isOpen ? null : key)}
                className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-accent" />
                  <h3 className="font-playfair font-bold text-primary text-lg">{section.label}</h3>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
              </button>
              
              {isOpen && (
                <div className="p-6 border-t border-border flex flex-col gap-5">
                  <SectionEditor
                    schema={section.fields}
                    value={config[key as keyof SiteConfig]}
                    onChange={(val) => setConfig(prev => ({ ...prev, [key]: val }))}
                    path={key}
                    errors={groupedErrors?.[key]}
                    disabled={isPending}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
