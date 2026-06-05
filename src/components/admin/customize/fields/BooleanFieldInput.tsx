import React from "react";
import type { BooleanField } from "@/config/site-schema";

export interface BooleanFieldInputProps {
  field: BooleanField;
  value: boolean;
  onChange: (next: boolean) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * BooleanFieldInput renders a custom toggle switch with the label on the left.
 */
export default function BooleanFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: BooleanFieldInputProps) {
  const isChecked = !!value;

  const handleToggle = () => {
    if (disabled) return;
    onChange(!isChecked);
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex items-center justify-between py-2 border border-border/40 px-4 rounded-3 bg-canvas/20">
        <span className="text-sm font-semibold text-primary">{field.label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={isChecked}
          disabled={disabled}
          onClick={handleToggle}
          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
            isChecked ? "bg-accent" : "bg-neutral-300"
          }`}
        >
          <span
            aria-hidden="true"
            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              isChecked ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>
      {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
    </div>
  );
}
