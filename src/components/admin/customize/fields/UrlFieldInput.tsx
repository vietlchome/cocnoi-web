import React from "react";
import type { UrlField } from "@/config/site-schema";

export interface UrlFieldInputProps {
  field: UrlField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * UrlFieldInput renders a standard url input field.
 */
export default function UrlFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: UrlFieldInputProps) {
  const displayValue = value ?? "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        type="url"
        id={path}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        placeholder={field.default || ""}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}
