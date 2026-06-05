import React from "react";
import type { ColorField } from "@/config/site-schema";
import { BRAND_COLORS } from "@/lib/brand-colors";

export interface ColorFieldInputProps {
  field: ColorField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

/**
 * ColorFieldInput displays brand color swatches. Since colors are locked to
 * branding guidelines in Phase 3a, it renders the selected brand color as read-only,
 * or displays a list of brand colors with the selected one highlighted.
 */
export default function ColorFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: ColorFieldInputProps) {
  const displayValue = value ?? field.default ?? "";
  
  // Find matching brand color
  const matchedColor = BRAND_COLORS.find(
    (c) => c.value.toLowerCase() === displayValue.toLowerCase()
  );

  return (
    <div className={`flex flex-col gap-2.5 w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Display matched color preview */}
      <div className="flex items-center gap-3 border border-border p-3.5 rounded-3 bg-canvas/30 w-full shadow-inner">
        <div 
          className="w-10 h-10 rounded-full border border-border/80 shadow-md shrink-0 transition-transform hover:scale-105" 
          style={{ backgroundColor: displayValue || "#ffffff" }}
        />
        <div className="flex flex-col">
          <span className="font-bold text-sm text-primary">
            {matchedColor ? matchedColor.name : "Custom Color"}
          </span>
          <span className="text-xs font-mono text-secondary">{displayValue || "#FFFFFF"}</span>
        </div>
      </div>

      {/* Brand Color Reference Guide */}
      <div className="flex flex-col gap-1.5 mt-1.5">
        <span className="text-[11px] font-bold text-secondary uppercase tracking-wider">
          Bảng màu thương hiệu cố định:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {BRAND_COLORS.map((color) => {
            const isSelected = color.value.toLowerCase() === displayValue.toLowerCase();
            return (
              <button
                key={color.name}
                type="button"
                disabled={disabled}
                onClick={() => onChange(color.value)}
                className={`flex items-center gap-2 p-2 rounded-2 border text-left transition-all ${
                  isSelected 
                    ? "border-accent bg-subtle/40 ring-1 ring-accent" 
                    : "border-border/60 bg-canvas/10 hover:bg-subtle/20"
                }`}
              >
                <div 
                  className="w-5 h-5 rounded-full border border-border/50 shrink-0" 
                  style={{ backgroundColor: color.value }}
                />
                <div className="flex flex-col overflow-hidden">
                  <span className="font-semibold text-[10px] text-primary truncate" title={color.name}>
                    {color.name}
                  </span>
                  <span className="text-[9px] text-secondary font-mono leading-none">
                    {color.value}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
    </div>
  );
}
