import React from "react";
import type { TextareaField } from "@/config/site-schema";

export interface TextareaFieldInputProps {
  field: TextareaField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * TextareaFieldInput renders a standard multi-line textarea input field.
 */
export default function TextareaFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: TextareaFieldInputProps) {
  const displayValue = value ?? "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <textarea
        id={path}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        rows={3}
        className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed min-h-[80px] transition-all"
        placeholder={field.default || ""}
      />
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}
