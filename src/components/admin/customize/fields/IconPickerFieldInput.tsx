"use client";

import React, { useState } from "react";
import type { BaseField } from "@/config/site-schema";
import {
  Save, Eye, Plus, Trash2, ChevronDown, ChevronUp, Loader2, Layout, Type,
  Image as ImageIcon, MessageSquare, Share2, Paintbrush, LayoutGrid, HelpCircle,
  Phone, Mail, MapPin, Link, Globe, Send, Info, Star, Compass, Shield,
  FileText, Check, AlertTriangle, Settings, User, Search, Sparkles, Heart
} from "lucide-react";

export interface IconPickerFieldInputProps {
  field: BaseField;
  value: string;
  onChange: (next: string) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

// 32 common Lucide icons mapped for selection
const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Save, Eye, Plus, Trash2, ChevronDown, ChevronUp, Loader2, Layout, Type,
  Image: ImageIcon, MessageSquare, Share2, Paintbrush, LayoutGrid, HelpCircle,
  Phone, Mail, MapPin, Link, Globe, Send, Info, Star, Compass, Shield,
  FileText, Check, AlertTriangle, Settings, User, Sparkles, Heart
};

/**
 * IconPickerFieldInput displays a search filter and a grid of common Lucide icons.
 */
export default function IconPickerFieldInput({
  field,
  value,
  onChange,
  path,
  error,
  disabled,
}: IconPickerFieldInputProps) {
  const [search, setSearch] = useState("");
  const selectedIconName = value ?? "";
  
  // Filter icons based on search
  const filteredIconNames = Object.keys(ICON_MAP).filter((name) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const SelectedIcon = ICON_MAP[selectedIconName];

  return (
    <div className={`flex flex-col gap-2.5 w-full ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      {/* Current selection header */}
      <div className="flex items-center gap-3 border border-border p-3 rounded-3 bg-canvas/30 w-full shadow-inner">
        <div className="w-10 h-10 rounded-2 border border-border/80 bg-subtle flex items-center justify-center shrink-0">
          {SelectedIcon ? (
            <SelectedIcon className="w-5 h-5 text-accent" />
          ) : (
            <HelpCircle className="w-5 h-5 text-secondary/40" />
          )}
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm text-primary">
            {selectedIconName ? selectedIconName : "Chưa chọn icon"}
          </span>
          <span className="text-[11px] text-secondary">
            {selectedIconName ? "Lucide Icon" : "Hãy chọn một icon bên dưới"}
          </span>
        </div>
        {selectedIconName && !disabled && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="ml-auto p-1.5 text-rose-500 hover:bg-rose-50 rounded-2 transition-colors"
            title="Xóa lựa chọn"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Input */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          placeholder="Tìm kiếm icon..."
          className="pl-9 pr-4 py-2 rounded-2 border border-border bg-canvas text-primary focus:border-accent outline-none text-xs w-full transition-all"
        />
      </div>

      {/* Icons Grid */}
      <div className="border border-border/80 rounded-3 p-3 max-h-[160px] overflow-y-auto bg-canvas/10">
        {filteredIconNames.length > 0 ? (
          <div className="grid grid-cols-6 sm:grid-cols-10 gap-2">
            {filteredIconNames.map((name) => {
              const IconComp = ICON_MAP[name];
              const isSelected = name === selectedIconName;
              return (
                <button
                  key={name}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(name)}
                  title={name}
                  className={`w-9 h-9 rounded-2 border flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-accent bg-subtle/50 text-accent ring-1 ring-accent scale-105"
                      : "border-border/60 bg-canvas/15 hover:bg-subtle/30 text-secondary hover:text-primary"
                  }`}
                >
                  <IconComp className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-6 text-xs text-secondary/60">
            Không tìm thấy icon nào phù hợp
          </div>
        )}
      </div>

      {error && <span className="text-xs text-rose-500 mt-1">{error}</span>}
    </div>
  );
}
