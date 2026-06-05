"use client";

import React, { useState } from "react";
import type { RepeatableField } from "@/config/site-schema";
import { Plus, Trash2, ChevronDown, ChevronUp, ArrowUp, ArrowDown } from "lucide-react";
import SectionEditor from "./SectionEditor";

export interface RepeatableEditorProps {
  field: RepeatableField;
  value: Record<string, any>[];
  onChange: (next: Record<string, any>[]) => void;
  path: string;
  disabled?: boolean;
}

/**
 * RepeatableEditor renders a list of items of the same schema with accordion card wrappers.
 */
export default function RepeatableEditor({
  field,
  value,
  onChange,
  path,
  disabled,
}: RepeatableEditorProps) {
  const items = value ?? [];
  const [collapsedIndices, setCollapsedIndices] = useState<Record<number, boolean>>({});

  const toggleExpand = (index: number) => {
    setCollapsedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const getPreviewTitle = (item: Record<string, any>, index: number) => {
    if (item.title) return String(item.title);
    if (item.q) return String(item.q);
    if (item.question) return String(item.question);

    const firstTextKey = Object.entries(field.itemSchema).find(
      ([_, schema]) => schema.type === "text" || schema.type === "textarea"
    )?.[0];
    if (firstTextKey && item[firstTextKey]) {
      return String(item[firstTextKey]);
    }

    return `Mục ${index + 1}`;
  };

  const handleAddItem = () => {
    if (disabled) return;
    if (field.max !== undefined && items.length >= field.max) return;

    // Create item with defaults
    const newItem: Record<string, any> = {};
    for (const [key, subDef] of Object.entries(field.itemSchema)) {
      if (subDef.default !== undefined) {
        newItem[key] = subDef.default;
      } else {
        switch (subDef.type) {
          case "boolean":
            newItem[key] = false;
            break;
          case "repeatable":
            newItem[key] = [];
            break;
          case "group":
            newItem[key] = {};
            break;
          default:
            newItem[key] = "";
            break;
        }
      }
    }

    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (disabled) return;
    if (field.min !== undefined && items.length <= field.min) return;

    const nextList = [...items];
    nextList.splice(index, 1);
    onChange(nextList);
  };

  const handleMoveUp = (index: number) => {
    if (index === 0 || disabled) return;
    const nextList = [...items];
    const temp = nextList[index];
    nextList[index] = nextList[index - 1];
    nextList[index - 1] = temp;
    onChange(nextList);
    
    // Shift collapse state
    setCollapsedIndices((prev) => {
      const nextCollapsed = { ...prev };
      const curCollapsed = !!prev[index];
      const prevCollapsed = !!prev[index - 1];
      nextCollapsed[index] = prevCollapsed;
      nextCollapsed[index - 1] = curCollapsed;
      return nextCollapsed;
    });
  };

  const handleMoveDown = (index: number) => {
    if (index === items.length - 1 || disabled) return;
    const nextList = [...items];
    const temp = nextList[index];
    nextList[index] = nextList[index + 1];
    nextList[index + 1] = temp;
    onChange(nextList);
    
    // Shift collapse state
    setCollapsedIndices((prev) => {
      const nextCollapsed = { ...prev };
      const curCollapsed = !!prev[index];
      const nextItemCollapsed = !!prev[index + 1];
      nextCollapsed[index] = nextItemCollapsed;
      nextCollapsed[index + 1] = curCollapsed;
      return nextCollapsed;
    });
  };

  const isAddDisabled = disabled || (field.max !== undefined && items.length >= field.max);
  const isRemoveDisabled = disabled || (field.min !== undefined && items.length <= field.min);

  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex items-center justify-between border-b border-border/80 pb-2">
        <span className="text-sm font-semibold text-primary">{field.label}</span>
        <span className="text-xs text-secondary">
          {items.length} {field.max !== undefined ? `/ tối đa ${field.max}` : ""} items
        </span>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-3">
          {items.map((item, idx) => {
            const isCollapsed = !!collapsedIndices[idx]; // False by default, so expanded by default
            const itemPath = `${path}[${idx}]`;

            return (
              <div
                key={idx}
                className="border border-border/80 rounded-3 overflow-hidden bg-canvas shadow-xs transition-shadow hover:shadow-sm"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-subtle/25 border-b border-border/40 select-none">
                  <div
                    onClick={() => toggleExpand(idx)}
                    className="flex-grow flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-primary overflow-hidden pr-4"
                  >
                    {isCollapsed ? (
                      <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
                    ) : (
                      <ChevronUp className="w-4 h-4 text-secondary shrink-0" />
                    )}
                    <span className="truncate" title={getPreviewTitle(item, idx)}>
                      {getPreviewTitle(item, idx)}
                    </span>
                  </div>

                  {/* Reordering and removal actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* TODO: replace with dnd-kit in Phase 4 */}
                    <button
                      type="button"
                      disabled={idx === 0 || disabled}
                      onClick={() => handleMoveUp(idx)}
                      className="p-1 text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary rounded hover:bg-canvas/50"
                      title="Di chuyển lên"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === items.length - 1 || disabled}
                      onClick={() => handleMoveDown(idx)}
                      className="p-1 text-secondary hover:text-primary disabled:opacity-30 disabled:hover:text-secondary rounded hover:bg-canvas/50"
                      title="Di chuyển xuống"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={isRemoveDisabled}
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-rose-500 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-rose-500 rounded hover:bg-rose-50/50"
                      title="Xóa mục này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Body */}
                {!isCollapsed && (
                  <div className="p-5 border-t border-border/20 bg-canvas/5 flex flex-col gap-4">
                    <SectionEditor
                      schema={field.itemSchema}
                      value={item}
                      onChange={(nextItem) => {
                        const nextList = [...items];
                        nextList[idx] = nextItem;
                        onChange(nextList);
                      }}
                      path={itemPath}
                      disabled={disabled}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="border border-dashed border-border/80 rounded-3 p-6 text-center text-xs text-secondary/60 bg-canvas/5">
          Chưa có mục nào được tạo. Bấm "+ Thêm mới" bên dưới để bắt đầu.
        </div>
      )}

      {/* Add Button */}
      <button
        type="button"
        disabled={isAddDisabled}
        onClick={handleAddItem}
        className="inline-flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border/80 hover:border-accent text-secondary hover:text-accent font-bold text-sm rounded-3 bg-canvas transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full"
      >
        <Plus className="w-4 h-4" />
        <span>Thêm mới</span>
      </button>
    </div>
  );
}
