import React from "react";
import type { ImageField } from "@/config/site-schema";
import ImageCropUploader from "@/components/admin/ImageCropUploader";

export interface ImageFieldInputProps {
  field: ImageField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * ImageFieldInput wraps ImageCropUploader to adapt it to the schema editor.
 */
export default function ImageFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: ImageFieldInputProps) {
  return (
    <div className={`w-full transition-all ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <ImageCropUploader
        label={field.label}
        value={value ?? ""}
        onChange={onChange}
        aspectRatio={field.aspectRatio}
        folder={field.folder ?? "theme"}
      />
      {error && <span className="text-xs text-rose-500 mt-1 block">{error}</span>}
    </div>
  );
}
