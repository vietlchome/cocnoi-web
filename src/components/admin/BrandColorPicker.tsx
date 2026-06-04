"use client";

import { Check } from "lucide-react";

interface BrandColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export const BRAND_COLORS = [
  { name: "Primary (Deep Indigo)", hex: "#131829", class: "bg-[#131829]" },
  { name: "Secondary (Dark Brown)", hex: "#3D2B1F", class: "bg-[#3D2B1F]" },
  { name: "Accent (Terracotta)", hex: "#C2703E", class: "bg-[#C2703E]" },
  { name: "Accent Hover (Light Terracotta)", hex: "#E8A87C", class: "bg-[#E8A87C]" },
  { name: "Canvas (Warm White)", hex: "#FEFCF9", class: "bg-[#FEFCF9]" },
  { name: "Subtle (Cream)", hex: "#F4ECE0", class: "bg-[#F4ECE0]" },
  { name: "Border (Sand)", hex: "#D4C5B2", class: "bg-[#D4C5B2]" },
  { name: "Error (Brick)", hex: "#A8512B", class: "bg-[#A8512B]" },
  { name: "Success (Olive)", hex: "#6B7B4E", class: "bg-[#6B7B4E]" },
  { name: "Warning (Mustard)", hex: "#C99A4F", class: "bg-[#C99A4F]" },
];

export default function BrandColorPicker({
  label,
  value,
  onChange,
}: BrandColorPickerProps) {
  const normalizedValue = value ? value.toUpperCase() : "";

  return (
    <div className="flex flex-col gap-2 font-bvp text-xs">
      <label className="font-bold text-secondary">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 border border-border/80 rounded-3 bg-canvas/30">
        {BRAND_COLORS.map((color) => {
          const isSelected = normalizedValue === color.hex.toUpperCase();
          return (
            <button
              key={color.hex}
              type="button"
              onClick={() => onChange(color.hex)}
              className={`flex flex-col items-center justify-between gap-2 p-2.5 rounded-2 border transition-all cursor-pointer text-center relative group min-h-[90px] ${
                isSelected
                  ? "border-accent bg-accent/5 ring-1 ring-accent"
                  : "border-border/60 bg-canvas hover:border-accent/40"
              }`}
            >
              {/* Color swatch circle */}
              <div
                className={`w-9 h-9 rounded-full border border-border/40 shadow-xs flex items-center justify-center shrink-0 ${color.class}`}
                style={{ backgroundColor: color.hex }}
              >
                {isSelected && (
                  <Check
                    className={`w-4 h-4 ${
                      color.hex === "#FEFCF9" || color.hex === "#F4ECE0"
                        ? "text-primary"
                        : "text-canvas"
                    }`}
                  />
                )}
              </div>
              
              {/* Color label */}
              <span className="text-[10px] font-semibold text-secondary leading-tight line-clamp-2">
                {color.name}
              </span>

              {/* Hex label */}
              <span className="text-[9px] font-mono text-secondary/60 mt-auto uppercase">
                {color.hex}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
