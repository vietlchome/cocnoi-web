"use client";

import { useState, useTransition } from "react";
import { SITE_SCHEMA } from "@/config/site-schema";
import { updateSiteConfigAction } from "@/lib/actions/settings.actions";
import SectionEditor from "@/components/admin/customize/SectionEditor";
import type { SiteConfig } from "@/lib/site-config-validate";
import { Save, Eye, Loader2, ExternalLink } from "lucide-react";

// Flat error map -> grouped by top-level section key (same helper as SiteCustomizerClient)
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

interface Props {
  initialConfig: SiteConfig;
}

export default function MenuManagerClient({ initialConfig }: Props) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);
  const [status, setStatus] = useState<"idle" | "saving" | "success" | "error">("idle");

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
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
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

      {/* Navigation section editor - single section, no 2-col rail needed */}
      <div className="border border-border rounded-4 bg-canvas overflow-hidden">
        <div className="p-6">
          <SectionEditor
            schema={SITE_SCHEMA.navigation.fields}
            value={(config.navigation || {}) as any}
            onChange={(val) => setConfig((prev) => ({ ...prev, navigation: val as SiteConfig["navigation"] }))}
            path="navigation"
            errors={groupedErrors?.navigation}
            disabled={isPending}
          />
        </div>
      </div>
    </div>
  );
}
