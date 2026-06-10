import React from "react";
import type { LogoImageField } from "@/config/site-schema";
import LogoUploader from "@/components/admin/LogoUploader";

export interface LogoFieldInputProps {
  field: LogoImageField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * LogoFieldInput - schema editor wrapper for LogoUploader.
 * Bypasses crop modal, preserves transparency.
 * Phase 9h.
 */
export default function LogoFieldInput({
  field,
  value,
  onChange,
  error,
  disabled,
}: LogoFieldInputProps) {
  return (
    <div className={`w-full transition-all ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <LogoUploader
        label={field.label}
        value={value ?? ""}
        onChange={onChange}
        folder={field.folder ?? "theme/logo"}
        maxHeight={field.previewHeight ?? 64}
        helpText={field.helpText}
      />
      {error && <span className="text-xs text-rose-500 mt-1 block">{error}</span>}
    </div>
  );
}
