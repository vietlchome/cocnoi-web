import React from "react";
import type { TextField } from "@/config/site-schema";

export interface TextFieldInputProps {
  field: TextField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * TextFieldInput renders a standard text input field.
 */
export default function TextFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: TextFieldInputProps) {
  const displayValue = value ?? "";

  return (
    <div className="flex flex-col gap-1.5 w-full">
      <input
        type="text"
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
