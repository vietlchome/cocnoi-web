"use client";

import { useState, useTransition } from "react";
import { SITE_SCHEMA } from "@/config/site-schema";
import { updateSiteConfigAction } from "@/lib/actions/settings.actions";
import SectionEditor from "@/components/admin/customize/SectionEditor";
import type { SiteConfig } from "@/lib/site-config-validate";
import type { SchemaField } from "@/config/site-schema";
import { Save, Eye, Loader2, ExternalLink, ChevronDown, ChevronRight } from "lucide-react";
import MenuBuilder from "./MenuBuilder";

// Flat error map -> grouped by top-level section key
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

// Schema slice for the megaMenu group only - keeps SectionEditor rendering the sub-group
const MEGA_MENU_SCHEMA: Record<string, SchemaField> = {
  megaMenu: SITE_SCHEMA.navigation.fields.megaMenu,
};

interface Props {
  initialConfig: SiteConfig;
}

export default function MenuManagerClient({ initialConfig }: Props) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);

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
        }
      } catch {
        setStatus("error");
        alert("Có lỗi xảy ra khi lưu.");
      }
    });
  };

  const saveLabel =
    status === "saving" ? "Đang lưu..." : status === "success" ? "Đã lưu!" : "Lưu thay đổi";

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Save bar - sticky */}
      <div className="sticky top-4 z-40 bg-canvas/80 backdrop-blur-md p-4 rounded-4 border border-border shadow-sm flex items-center justify-between gap-4">
        <div>
          <h2 className="font-playfair font-bold text-lg text-primary">Menu điều hướng</h2>
          <p className="text-sm text-secondary">
            Quản lý các mục menu chính và menu con hiển thị trên đầu website.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-3 font-bvp text-sm font-semibold text-primary bg-subtle hover:bg-border transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span className="hidden sm:inline">Xem thực tế</span>
            <ExternalLink className="w-3 h-3 hidden sm:inline opacity-60" />
          </a>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-6 py-2 rounded-3 font-bvp text-sm font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saveLabel}</span>
          </button>
        </div>
      </div>

      {/* Validation error panel */}
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

      {/* Menu builder */}
      <div className="border border-border rounded-4 bg-canvas overflow-hidden">
        <div className="p-6">
          <MenuBuilder
            items={config.navigation?.topNavItems ?? []}
            onChange={(nextItems) =>
              setConfig((prev) => ({
                ...prev,
                navigation: {
                  ...(prev.navigation ?? {}),
                  topNavItems: nextItems,
                } as SiteConfig["navigation"],
              }))
            }
            disabled={isPending}
          />
        </div>
      </div>

      {/* Mega menu panel - collapsible */}
      <div className="border border-border rounded-4 bg-canvas overflow-hidden">
        <button
          type="button"
          onClick={() => setMegaMenuOpen((o) => !o)}
          className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-subtle/30 transition-colors cursor-pointer"
        >
          <div>
            <span className="text-sm font-semibold text-primary">Cấu hình Mega Menu (nâng cao)</span>
            <p className="text-xs text-secondary/60 mt-0.5">Chỉnh tiêu đề các cột trong mega menu của mục CUA HANG.</p>
          </div>
          {megaMenuOpen ? (
            <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-secondary shrink-0" />
          )}
        </button>

        {megaMenuOpen && (
          <div className="px-6 pb-6 border-t border-border/30">
            <div className="pt-4">
              <SectionEditor
                schema={MEGA_MENU_SCHEMA}
                value={{ megaMenu: config.navigation?.megaMenu ?? {} }}
                onChange={(val) =>
                  setConfig((prev) => ({
                    ...prev,
                    navigation: {
                      ...(prev.navigation ?? {}),
                      megaMenu: val.megaMenu as SiteConfig["navigation"]["megaMenu"],
                    } as SiteConfig["navigation"],
                  }))
                }
                path="navigation"
                errors={groupedErrors?.navigation}
                disabled={isPending}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
