"use client";

import React, { useState } from "react";
import type { RepeatableField } from "@/config/site-schema";
import { Plus, Trash2, ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import SectionEditor from "./SectionEditor";
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  useSensors,
  useSensor,
  PointerSensor,
  KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface SortableRepeatableItemProps {
  id: string;
  item: Record<string, any>;
  idx: number;
  isCollapsed: boolean;
  itemPath: string;
  disabled: boolean;
  field: RepeatableField;
  onToggleExpand: () => void;
  onRemove: () => void;
  onChangeItem: (nextItem: Record<string, any>) => void;
  isRemoveDisabled: boolean;
}

function SortableRepeatableItem({
  id,
  item,
  idx,
  isCollapsed,
  itemPath,
  disabled,
  field,
  onToggleExpand,
  onRemove,
  onChangeItem,
  isRemoveDisabled,
}: SortableRepeatableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  const getPreviewTitle = (item: Record<string, any>, index: number) => {
    if (item.title) return String(item.title);
    if (item.q) return String(item.q);
    if (item.question) return String(item.question);
    if (item.platform) {
      const platformLabels: Record<string, string> = {
        facebook: "Facebook",
        instagram: "Instagram",
        tiktok: "TikTok",
        youtube: "YouTube",
        zalo: "Zalo",
        shopee: "Shopee",
        lazada: "Lazada",
        threads: "Threads"
      };
      return platformLabels[item.platform] || String(item.platform);
    }

    const firstTextKey = Object.entries(field.itemSchema).find(
      ([_, schema]) => schema.type === "text" || schema.type === "textarea"
    )?.[0];
    if (firstTextKey && item[firstTextKey]) {
      return String(item[firstTextKey]);
    }

    return `Mục ${index + 1}`;
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border border-border/80 rounded-3 overflow-hidden bg-canvas shadow-xs transition-shadow hover:shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-subtle/25 border-b border-border/40 select-none">
        <div className="flex items-center gap-2 flex-grow overflow-hidden pr-4">
          {/* Drag Handle */}
          <button
            type="button"
            {...attributes}
            {...listeners}
            disabled={disabled}
            className="p-1 text-secondary hover:text-primary rounded hover:bg-canvas/50 cursor-grab active:cursor-grabbing shrink-0"
            title="Kéo để đổi thứ tự"
          >
            <GripVertical className="w-4 h-4" />
          </button>
          
          <div
            onClick={onToggleExpand}
            className="flex-grow flex items-center gap-2.5 cursor-pointer text-sm font-semibold text-primary overflow-hidden"
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
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            disabled={isRemoveDisabled}
            onClick={onRemove}
            className="p-1 text-rose-500 hover:text-rose-600 disabled:opacity-30 disabled:hover:text-rose-500 rounded hover:bg-rose-50/50 cursor-pointer"
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
            onChange={onChangeItem}
            path={itemPath}
            disabled={disabled}
          />
        </div>
      )}
    </div>
  );
}

export interface RepeatableEditorProps {
  field: RepeatableField;
  value: Record<string, any>[];
  onChange: (next: Record<string, any>[]) => void;
  path: string;
  disabled?: boolean;
}

export default function RepeatableEditor({
  field,
  value,
  onChange,
  path,
  disabled,
}: RepeatableEditorProps) {
  const items = value ?? [];
  const [collapsedKeys, setCollapsedKeys] = useState<Record<string, boolean>>({});
  
  // Local state to keep stable keys for items so that inputs don't lose focus during editing
  const [keys, setKeys] = useState<string[]>(() =>
    items.map(() => Math.random().toString(36).substring(2, 9))
  );

  // Sync keys length with items length in render phase
  if (items.length !== keys.length) {
    if (items.length > keys.length) {
      const diff = items.length - keys.length;
      const newKeys = [...keys];
      for (let i = 0; i < diff; i++) {
        newKeys.push(Math.random().toString(36).substring(2, 9));
      }
      setKeys(newKeys);
    } else {
      setKeys(keys.slice(0, items.length));
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // prevent dragging on simple clicks
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const toggleExpand = (key: string) => {
    setCollapsedKeys((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
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

    const newKey = Math.random().toString(36).substring(2, 9);
    setKeys([...keys, newKey]);
    onChange([...items, newItem]);
  };

  const handleRemoveItem = (index: number) => {
    if (disabled) return;
    if (field.min !== undefined && items.length <= field.min) return;

    const nextKeys = keys.filter((_, idx) => idx !== index);
    const nextList = items.filter((_, idx) => idx !== index);
    setKeys(nextKeys);
    onChange(nextList);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = keys.indexOf(active.id as string);
    const newIndex = keys.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      const nextKeys = arrayMove(keys, oldIndex, newIndex);
      const nextItems = arrayMove(items, oldIndex, newIndex);
      setKeys(nextKeys);
      onChange(nextItems);
    }
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
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={keys} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-3">
              {items.map((item, idx) => {
                const id = keys[idx];
                const isCollapsed = !!collapsedKeys[id];
                const itemPath = `${path}[${idx}]`;

                return (
                  <SortableRepeatableItem
                    key={id}
                    id={id}
                    item={item}
                    idx={idx}
                    isCollapsed={isCollapsed}
                    itemPath={itemPath}
                    disabled={!!disabled}
                    field={field}
                    onToggleExpand={() => toggleExpand(id)}
                    onRemove={() => handleRemoveItem(idx)}
                    isRemoveDisabled={isRemoveDisabled}
                    onChangeItem={(nextItem) => {
                      const nextList = [...items];
                      nextList[idx] = nextItem;
                      onChange(nextList);
                    }}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
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
