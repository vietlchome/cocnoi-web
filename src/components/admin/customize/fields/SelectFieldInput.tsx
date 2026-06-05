import React from "react";
import type { SelectField } from "@/config/site-schema";

export interface SelectFieldInputProps {
  field: SelectField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * SelectFieldInput renders a HTML select dropdown.
 */
export default function SelectFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: SelectFieldInputProps) {
  const displayValue = value ?? field.default ?? "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <select
        id={path}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none w-full disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span className="text-xs text-rose-500">{error}</span>}
    </div>
  );
}
