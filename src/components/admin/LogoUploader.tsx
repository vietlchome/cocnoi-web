"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Loader } from "lucide-react";

interface LogoUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  maxHeight?: number; // Header bar height for preview, default 64px
  helpText?: string;
}

/**
 * LogoUploader - upload logo without crop, preserve PNG transparency.
 * Live preview at actual header display height.
 * Phase 9h.
 */
export default function LogoUploader({
  label,
  value,
  onChange,
  folder = "theme/logo",
  maxHeight = 64,
  helpText,
}: LogoUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    // Validate file type (PNG, JPG, SVG, WebP)
    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Chỉ chấp nhận PNG, JPG, SVG, WebP.");
      return;
    }

    // Validate file size (max 2MB for logo)
    if (file.size > 2 * 1024 * 1024) {
      setError("File quá lớn. Tối đa 2MB.");
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("files", file); // KHÔNG rename, giữ extension gốc
      formData.append("folder", folder);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Upload thất bại.");

      const data = await res.json();
      if (data.success && data.urls && data.urls.length > 0) {
        onChange(data.urls[0]);
      } else {
        throw new Error(data.error || "Gặp lỗi khi upload.");
      }
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 font-bvp text-xs">
      <div className="flex flex-col gap-0.5">
        <label className="font-bold text-secondary">{label}</label>
        {helpText && (
          <span className="text-[11px] text-secondary/70 italic">{helpText}</span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4 border border-border/80 rounded-3 bg-canvas/30">
        {/* Preview block - shows logo at actual header display size */}
        <div
          className="w-full flex items-center justify-center bg-subtle/40 border border-dashed border-border/60 rounded-2 px-4"
          style={{ minHeight: `${maxHeight + 16}px` }}
        >
          {value ? (
            <div className="relative inline-block">
              <img
                src={value}
                alt="Logo preview"
                style={{ maxHeight: `${maxHeight}px`, width: "auto" }}
                className="object-contain"
              />
              <button
                type="button"
                onClick={() => {
                  if (confirm("Xóa logo này?")) onChange("");
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 hover:bg-rose-600 text-canvas rounded-full flex items-center justify-center shadow-md transition-colors cursor-pointer"
                title="Xóa logo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1 text-secondary/40">
              <ImageIcon className="w-8 h-8" />
              <span className="text-[10px]">Chưa có logo</span>
            </div>
          )}
        </div>

        {/* Preview height hint */}
        <p className="text-[10px] text-secondary/60 text-center">
          Preview ở chiều cao thực tế trên header ({maxHeight}px). Chiều rộng tự điều chỉnh theo tỷ lệ ảnh gốc.
        </p>

        {/* Upload button */}
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp"
          onChange={handleFileChange}
          ref={fileInputRef}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-canvas text-xs font-semibold rounded-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? (
            <>
              <Loader className="w-3.5 h-3.5 animate-spin" />
              Đang upload...
            </>
          ) : (
            <>
              <Upload className="w-3.5 h-3.5" />
              {value ? "Thay logo khác" : "Upload logo"}
            </>
          )}
        </button>

        {error && (
          <p className="text-xs text-rose-500 text-center">{error}</p>
        )}

        <div className="text-[10px] text-secondary/60 space-y-0.5">
          <p>Hỗ trợ: PNG (giữ trong suốt), JPG, SVG, WebP. Tối đa 2MB.</p>
          <p>Khuyến nghị: PNG transparent, cao tối thiểu 128px để hiển thị retina sắc nét.</p>
        </div>
      </div>
    </div>
  );
}
