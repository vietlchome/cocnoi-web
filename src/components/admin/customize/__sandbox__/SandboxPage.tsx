"use client";

import React, { useState } from "react";
import { SITE_SCHEMA } from "@/config/site-schema";
import SectionEditor from "../SectionEditor";
import { Eye, EyeOff, Code, Layers } from "lucide-react";

/**
 * Build initial state from SITE_SCHEMA to match the shape resolved by getSiteConfig()
 */
const buildInitialState = () => {
  const state: Record<string, Record<string, any>> = {};
  for (const [sectionName, sectionDef] of Object.entries(SITE_SCHEMA)) {
    const sectionData: Record<string, any> = {};
    for (const [fieldName, fieldDef] of Object.entries(sectionDef.fields)) {
      if (fieldDef.default !== undefined) {
        sectionData[fieldName] = fieldDef.default;
      } else {
        switch (fieldDef.type) {
          case "boolean":
            sectionData[fieldName] = false;
            break;
          case "repeatable":
            sectionData[fieldName] = [];
            break;
          case "group":
            sectionData[fieldName] = {};
            break;
          default:
            sectionData[fieldName] = "";
            break;
        }
      }
    }
    state[sectionName] = sectionData;
  }
  return state;
};

/**
 * SandboxPage is a standalone preview client component to verify SectionEditor
 * and all sub-field inputs completely in-memory.
 */
export default function SandboxPage() {
  const [state, setState] = useState<Record<string, Record<string, any>>>(buildInitialState);
  const [selectedSection, setSelectedSection] = useState<string>("header");
  const [disabled, setDisabled] = useState<boolean>(false);

  const sectionKeys = Object.keys(SITE_SCHEMA);
  const currentSectionSchema = SITE_SCHEMA[selectedSection]?.fields || {};
  const currentSectionValue = state[selectedSection] || {};

  const handleSectionValueChange = (nextValue: Record<string, any>) => {
    setState((prev) => ({
      ...prev,
      [selectedSection]: nextValue,
    }));
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto w-full font-bvp">
      {/* Sandbox Header */}
      <div className="bg-canvas border border-border p-5 rounded-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-accent/10 text-accent font-bold text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider">
              Sandbox Preview (Phase 3a)
            </span>
          </div>
          <h2 className="font-playfair font-bold text-xl text-primary mt-1">
            Kiểm thử Thư viện Customize
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Môi trường kiểm thử in-memory, cô lập hoàn toàn khỏi Database.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Section Switcher */}
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-secondary/70" />
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="px-3 py-2 border border-border rounded-3 bg-canvas text-sm font-semibold text-primary outline-none focus:border-accent"
            >
              {sectionKeys.map((key) => (
                <option key={key} value={key}>
                  {SITE_SCHEMA[key]?.label || key} ({key})
                </option>
              ))}
            </select>
          </div>

          {/* Disabled Switcher */}
          <label className="flex items-center gap-2 cursor-pointer border border-border px-3 py-2 rounded-3 bg-subtle/25 hover:bg-subtle/50 transition-colors select-none">
            <input
              type="checkbox"
              checked={disabled}
              onChange={(e) => setDisabled(e.target.checked)}
              className="w-4 h-4 accent-accent cursor-pointer"
            />
            <span className="text-xs font-semibold text-primary flex items-center gap-1.5">
              {disabled ? <EyeOff className="w-3.5 h-3.5 text-rose-500" /> : <Eye className="w-3.5 h-3.5 text-emerald-500" />}
              Vô hiệu hóa (Disabled)
            </span>
          </label>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Editor Form (Left Column) */}
        <div className="lg:col-span-7 bg-canvas border border-border rounded-4 p-6 shadow-xs flex flex-col gap-6">
          <div className="border-b border-border/80 pb-3 flex items-center justify-between">
            <h3 className="font-playfair font-bold text-lg text-primary">
              Cấu hình {SITE_SCHEMA[selectedSection]?.label}
            </h3>
            <span className="text-[10px] font-mono text-secondary">
              path: {selectedSection}
            </span>
          </div>

          <SectionEditor
            schema={currentSectionSchema}
            value={currentSectionValue}
            onChange={handleSectionValueChange}
            path={selectedSection}
            disabled={disabled}
          />
        </div>

        {/* Real-time State Preview (Right Column) */}
        <div className="lg:col-span-5 bg-[#0f172a] text-[#f8fafc] border border-neutral-800 rounded-4 p-5 shadow-sm sticky top-6 font-mono text-xs flex flex-col gap-4">
          <div className="border-b border-neutral-800 pb-3 flex items-center justify-between text-neutral-400">
            <span className="flex items-center gap-2 font-semibold">
              <Code className="w-4 h-4 text-accent" />
              <span>DỮ LIỆU IN-MEMORY JSON</span>
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider">
              Realtime
            </span>
          </div>

          <div className="max-h-[70vh] overflow-y-auto custom-scrollbar">
            <pre className="whitespace-pre-wrap word-break">
              {JSON.stringify(state[selectedSection], null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
