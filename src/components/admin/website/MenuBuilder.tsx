"use client";

import React, { useState } from "react";
import {
  DndContext, closestCenter, DragEndEvent,
  useSensors, useSensor, PointerSensor, KeyboardSensor,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, useSortable,
  verticalListSortingStrategy, sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, ChevronDown, ChevronRight, Pencil, Trash2, Plus, X } from "lucide-react";
import LinkPicker from "./LinkPicker";

interface ChildItem { label: string; href: string; }
interface MenuItem {
  label: string;
  href: string;
  submenuType: "none" | "simple" | "mega";
  simpleSubmenu: ChildItem[];
  openInNewTab: boolean;
  hasMegaMenu?: boolean;
}

type DeleteTarget =
  | { type: "parent"; idx: number }
  | { type: "child"; parentIdx: number; childIdx: number };

type ModalTarget =
  | { mode: "parent-add" }
  | { mode: "parent-edit"; parentIdx: number }
  | { mode: "child-add"; parentIdx: number }
  | { mode: "child-edit"; parentIdx: number; childIdx: number };

interface Props { items: MenuItem[]; onChange: (next: MenuItem[]) => void; disabled?: boolean; }

const DEFAULT_PARENT: MenuItem = { label: "", href: "/", submenuType: "none", simpleSubmenu: [], openInNewTab: false };
const DEFAULT_CHILD: ChildItem = { label: "", href: "/" };

// ---- Light-themed inline modal ----
function LightModal({ isOpen, onClose, title, children }: {
  isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-canvas rounded-4 border border-border shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-semibold text-primary text-base">{title}</h3>
          <button onClick={onClose} aria-label="Đóng"
            className="p-1.5 text-secondary hover:text-primary rounded-2 hover:bg-subtle/50 transition-colors cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="px-5 py-5 max-h-[70vh] overflow-y-auto flex flex-col gap-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// ---- Light-themed confirm dialog ----
function LightConfirm({ isOpen, message, onClose, onConfirm }: {
  isOpen: boolean; message: string; onClose: () => void; onConfirm: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog">
      <div className="fixed inset-0 bg-primary/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-canvas rounded-4 border border-border shadow-2xl px-5 py-5 flex flex-col gap-4">
        <p className="text-sm text-primary">{message}</p>
        <div className="flex justify-end gap-2">
          <button onClick={onClose}
            className="px-4 py-2 rounded-3 text-sm font-medium text-secondary bg-subtle hover:bg-border transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className="px-4 py-2 rounded-3 text-sm font-semibold text-white bg-rose-500 hover:bg-rose-600 transition-colors cursor-pointer">
            Xóa
          </button>
        </div>
      </div>
    </div>
  );
}

// ---- Sortable child row ----
function SortableChildRow({ id, child, disabled, onEdit, onDelete }: {
  id: string; child: ChildItem; disabled?: boolean; onEdit: () => void; onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 px-3 py-2 rounded-3 border border-border/40 bg-canvas/80 group">
      <button {...attributes} {...listeners} disabled={disabled}
        className="p-0.5 text-secondary/30 hover:text-secondary cursor-grab active:cursor-grabbing shrink-0 touch-none">
        <GripVertical className="w-3.5 h-3.5" />
      </button>
      <div className="flex-1 min-w-0">
        <span className="text-sm text-primary">{child.label || <span className="italic text-secondary/40">Không có tên</span>}</span>
        <span className="ml-2 text-xs text-secondary/40 font-mono">{child.href}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={onEdit} disabled={disabled} title="Sửa"
          className="p-1 text-secondary/50 hover:text-primary hover:bg-subtle rounded-2 transition-colors cursor-pointer">
          <Pencil className="w-3 h-3" />
        </button>
        <button onClick={onDelete} disabled={disabled} title="Xóa"
          className="p-1 text-secondary/50 hover:text-rose-500 hover:bg-rose-50 rounded-2 transition-colors cursor-pointer">
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

// ---- Sortable parent row ----
function SortableParentRow({ id, item, parentIdx, isExpanded, disabled, childIds, onChildDragEnd, onToggle, onEdit, onDelete, onAddChild, onEditChild, onDeleteChild }: {
  id: string; item: MenuItem; parentIdx: number; isExpanded: boolean; disabled?: boolean;
  childIds: string[]; onChildDragEnd: (e: DragEndEvent) => void;
  onToggle: () => void; onEdit: () => void; onDelete: () => void;
  onAddChild: () => void; onEditChild: (ci: number) => void; onDeleteChild: (ci: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform), transition,
    opacity: isDragging ? 0.5 : 1,
    position: "relative", zIndex: isDragging ? 10 : undefined,
  };

  const childSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const canAddChild = item.submenuType === "simple";
  const submenuBadge = item.submenuType === "simple" ? "Dropdown" : item.submenuType === "mega" ? "Mega" : null;

  return (
    <div ref={setNodeRef} style={style} className="rounded-3 border border-border bg-canvas overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5 select-none">
        <button {...attributes} {...listeners} disabled={disabled} title="Kéo để đổi thứ tự"
          className="p-1 text-secondary/40 hover:text-secondary cursor-grab active:cursor-grabbing shrink-0 touch-none">
          <GripVertical className="w-4 h-4" />
        </button>

        <button onClick={canAddChild ? onToggle : undefined}
          className={`p-0.5 shrink-0 transition-colors ${canAddChild ? "text-secondary hover:text-primary cursor-pointer" : "text-secondary/20 cursor-default"}`}>
          {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0 cursor-default" onClick={canAddChild ? onToggle : undefined}
          style={{ cursor: canAddChild ? "pointer" : "default" }}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-primary leading-snug">
              {item.label || <span className="text-secondary/40 italic font-normal">Không có tên</span>}
            </span>
            {submenuBadge && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-subtle text-secondary/60">{submenuBadge}</span>
            )}
            {item.openInNewTab && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-subtle text-secondary/60">Tab mới</span>
            )}
          </div>
          <p className="text-xs text-secondary/40 font-mono truncate">{item.href}</p>
        </div>

        <div className="flex items-center gap-0.5 shrink-0">
          {canAddChild ? (
            <button onClick={onAddChild} disabled={disabled} title="Thêm mục con"
              className="p-1.5 text-secondary/40 hover:text-accent hover:bg-subtle/60 rounded-2 transition-colors cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button disabled title="Đổi loại sang Dropdown để thêm mục con"
              className="p-1.5 text-secondary/20 cursor-not-allowed rounded-2">
              <Plus className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onEdit} disabled={disabled} title="Sửa mục"
            className="p-1.5 text-secondary/40 hover:text-primary hover:bg-subtle/60 rounded-2 transition-colors cursor-pointer">
            <Pencil className="w-3.5 h-3.5" />
          </button>
          <button onClick={onDelete} disabled={disabled} title="Xóa mục"
            className="p-1.5 text-secondary/40 hover:text-rose-500 hover:bg-rose-50 rounded-2 transition-colors cursor-pointer">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isExpanded && canAddChild && (
        <div className="ml-10 mr-3 pb-3 pt-2 flex flex-col gap-1.5 border-t border-border/20">
          {item.simpleSubmenu.length > 0 ? (
            <DndContext sensors={childSensors} collisionDetection={closestCenter} onDragEnd={onChildDragEnd}>
              <SortableContext items={childIds} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-1.5">
                  {item.simpleSubmenu.map((child, ci) => (
                    <SortableChildRow
                      key={childIds[ci]}
                      id={childIds[ci]}
                      child={child}
                      disabled={disabled}
                      onEdit={() => onEditChild(ci)}
                      onDelete={() => onDeleteChild(ci)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ) : (
            <p className="text-xs text-secondary/40 text-center py-2">Chưa có mục con.</p>
          )}
          <button onClick={onAddChild} disabled={disabled}
            className="mt-1 flex items-center gap-1.5 text-xs text-accent hover:text-accent/70 font-medium cursor-pointer transition-colors self-start">
            <Plus className="w-3 h-3" />
            Thêm mục con
          </button>
        </div>
      )}
    </div>
  );
}

// ---- MenuBuilder main ----
export default function MenuBuilder({ items, onChange, disabled }: Props) {
  const safeItems = items ?? [];

  const [parentKeys, setParentKeys] = useState<string[]>(() =>
    safeItems.map(() => Math.random().toString(36).substring(2, 9))
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [modalTarget, setModalTarget] = useState<ModalTarget | null>(null);
  const [draftParent, setDraftParent] = useState<MenuItem>({ ...DEFAULT_PARENT });
  const [draftChild, setDraftChild] = useState<ChildItem>({ ...DEFAULT_CHILD });
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Sync parentKeys length when items change externally
  if (safeItems.length !== parentKeys.length) {
    if (safeItems.length > parentKeys.length) {
      const extra = Array.from({ length: safeItems.length - parentKeys.length }, () =>
        Math.random().toString(36).substring(2, 9)
      );
      setParentKeys([...parentKeys, ...extra]);
    } else {
      setParentKeys(parentKeys.slice(0, safeItems.length));
    }
  }

  const parentSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleParentDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = parentKeys.indexOf(active.id as string);
    const newIdx = parentKeys.indexOf(over.id as string);
    if (oldIdx >= 0 && newIdx >= 0 && oldIdx !== newIdx) {
      setParentKeys(arrayMove(parentKeys, oldIdx, newIdx));
      onChange(arrayMove(safeItems, oldIdx, newIdx));
    }
  };

  const toggleExpand = (key: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // --- Modal openers ---
  const openParentAdd = () => { setDraftParent({ ...DEFAULT_PARENT }); setModalTarget({ mode: "parent-add" }); };
  const openParentEdit = (parentIdx: number) => { setDraftParent({ ...safeItems[parentIdx] }); setModalTarget({ mode: "parent-edit", parentIdx }); };
  const openChildAdd = (parentIdx: number) => { setDraftChild({ ...DEFAULT_CHILD }); setModalTarget({ mode: "child-add", parentIdx }); };
  const openChildEdit = (parentIdx: number, childIdx: number) => {
    setDraftChild({ ...safeItems[parentIdx].simpleSubmenu[childIdx] });
    setModalTarget({ mode: "child-edit", parentIdx, childIdx });
  };
  const closeModal = () => setModalTarget(null);

  // --- Modal save ---
  const handleSaveParent = () => {
    if (!draftParent.label.trim() || !modalTarget) return;
    if (modalTarget.mode === "parent-add") {
      const newKey = Math.random().toString(36).substring(2, 9);
      setParentKeys([...parentKeys, newKey]);
      onChange([...safeItems, draftParent]);
    } else if (modalTarget.mode === "parent-edit") {
      onChange(safeItems.map((item, i) => i === modalTarget.parentIdx ? { ...item, ...draftParent } : item));
    }
    closeModal();
  };

  const handleSaveChild = () => {
    if (!draftChild.label.trim() || !modalTarget) return;
    if (modalTarget.mode === "child-add") {
      const { parentIdx } = modalTarget;
      onChange(safeItems.map((item, i) =>
        i !== parentIdx ? item : { ...item, simpleSubmenu: [...item.simpleSubmenu, draftChild] }
      ));
      const pk = parentKeys[parentIdx];
      if (pk) setExpandedKeys((prev) => new Set([...prev, pk]));
    } else if (modalTarget.mode === "child-edit") {
      const { parentIdx, childIdx } = modalTarget;
      onChange(safeItems.map((item, i) =>
        i !== parentIdx ? item : {
          ...item,
          simpleSubmenu: item.simpleSubmenu.map((c, ci) => ci === childIdx ? draftChild : c),
        }
      ));
    }
    closeModal();
  };

  // --- Delete ---
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "parent") {
      const { idx } = deleteTarget;
      const removedKey = parentKeys[idx];
      setParentKeys(parentKeys.filter((_, i) => i !== idx));
      setExpandedKeys((prev) => { const next = new Set(prev); next.delete(removedKey); return next; });
      onChange(safeItems.filter((_, i) => i !== idx));
    } else {
      const { parentIdx, childIdx } = deleteTarget;
      onChange(safeItems.map((item, i) =>
        i !== parentIdx ? item : { ...item, simpleSubmenu: item.simpleSubmenu.filter((_, ci) => ci !== childIdx) }
      ));
    }
  };

  const isParentModal = modalTarget?.mode === "parent-add" || modalTarget?.mode === "parent-edit";
  const isChildModal = modalTarget?.mode === "child-add" || modalTarget?.mode === "child-edit";
  const modalTitle = modalTarget?.mode === "parent-add" ? "Thêm mục điều hướng"
    : modalTarget?.mode === "parent-edit" ? "Cập nhật liên kết"
    : modalTarget?.mode === "child-add" ? "Thêm mục con"
    : "Sửa mục con";

  const deleteMessage = deleteTarget?.type === "parent"
    ? `Xóa mục "${safeItems[deleteTarget.idx]?.label || "này"}"? Mục con sẽ bị xóa theo.`
    : deleteTarget?.type === "child"
    ? `Xóa mục con "${safeItems[deleteTarget.parentIdx]?.simpleSubmenu[deleteTarget.childIdx]?.label || "này"}"?`
    : "";

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-primary">Danh sách mục điều hướng</span>
        <span className="text-xs text-secondary/60">{safeItems.length} mục</span>
      </div>

      {safeItems.length > 0 ? (
        <DndContext sensors={parentSensors} collisionDetection={closestCenter} onDragEnd={handleParentDragEnd}>
          <SortableContext items={parentKeys.slice(0, safeItems.length)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {safeItems.map((item, parentIdx) => {
                const key = parentKeys[parentIdx];
                if (!key) return null;
                const childIds = item.simpleSubmenu.map((_, ci) => `${key}-child-${ci}`);

                const handleChildDragEnd = (e: DragEndEvent) => {
                  const { active, over } = e;
                  if (!over || active.id === over.id) return;
                  const getIdx = (rawId: unknown) => {
                    const s = String(rawId);
                    const prefix = `${key}-child-`;
                    if (!s.startsWith(prefix)) return -1;
                    return parseInt(s.slice(prefix.length), 10);
                  };
                  const oldIdx = getIdx(active.id);
                  const newIdx = getIdx(over.id);
                  if (oldIdx >= 0 && newIdx >= 0 && oldIdx !== newIdx) {
                    onChange(safeItems.map((itm, i) =>
                      i !== parentIdx ? itm : { ...itm, simpleSubmenu: arrayMove(itm.simpleSubmenu, oldIdx, newIdx) }
                    ));
                  }
                };

                return (
                  <SortableParentRow
                    key={key}
                    id={key}
                    item={item}
                    parentIdx={parentIdx}
                    isExpanded={expandedKeys.has(key)}
                    disabled={disabled}
                    childIds={childIds}
                    onChildDragEnd={handleChildDragEnd}
                    onToggle={() => toggleExpand(key)}
                    onEdit={() => openParentEdit(parentIdx)}
                    onDelete={() => setDeleteTarget({ type: "parent", idx: parentIdx })}
                    onAddChild={() => openChildAdd(parentIdx)}
                    onEditChild={(ci) => openChildEdit(parentIdx, ci)}
                    onDeleteChild={(ci) => setDeleteTarget({ type: "child", parentIdx, childIdx: ci })}
                  />
                );
              })}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="border border-dashed border-border/80 rounded-3 p-6 text-center text-xs text-secondary/50">
          Chưa có mục nào. Bấm "+ Thêm mục điều hướng" để bắt đầu.
        </div>
      )}

      <button onClick={openParentAdd} disabled={disabled}
        className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border/80 hover:border-accent text-secondary hover:text-accent font-semibold text-sm rounded-3 bg-canvas transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer w-full">
        <Plus className="w-4 h-4" />
        Thêm mục điều hướng
      </button>

      {/* Parent modal */}
      <LightModal isOpen={!!isParentModal} onClose={closeModal} title={modalTitle}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary">Tên liên kết <span className="text-rose-500">*</span></label>
          <input
            type="text" value={draftParent.label} autoFocus
            onChange={(e) => setDraftParent((p) => ({ ...p, label: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSaveParent()}
            placeholder="VD: CỬA HÀNG"
            className="px-3 py-2 rounded-3 border border-border bg-canvas text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary">Loại submenu</label>
          <select
            value={draftParent.submenuType}
            onChange={(e) => setDraftParent((p) => ({ ...p, submenuType: e.target.value as MenuItem["submenuType"] }))}
            className="px-3 py-2 rounded-3 border border-border bg-canvas text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30"
          >
            <option value="none">Không có submenu</option>
            <option value="simple">Dropdown list</option>
            <option value="mega">Mega menu (chỉ CUA HANG)</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary">Liên kết đến</label>
          <LinkPicker value={draftParent.href} onChange={(href) => setDraftParent((p) => ({ ...p, href }))} />
        </div>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox" checked={draftParent.openInNewTab}
            onChange={(e) => setDraftParent((p) => ({ ...p, openInNewTab: e.target.checked }))}
            className="rounded w-4 h-4 accent-accent"
          />
          <span className="text-sm text-primary">Mở tab mới</span>
        </label>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button onClick={closeModal}
            className="px-4 py-2 rounded-3 text-sm font-medium text-secondary bg-subtle hover:bg-border transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={handleSaveParent} disabled={!draftParent.label.trim()}
            className="px-4 py-2 rounded-3 text-sm font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {modalTarget?.mode === "parent-add" ? "Thêm" : "Cập nhật"}
          </button>
        </div>
      </LightModal>

      {/* Child modal */}
      <LightModal isOpen={!!isChildModal} onClose={closeModal} title={modalTitle}>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary">Tên liên kết <span className="text-rose-500">*</span></label>
          <input
            type="text" value={draftChild.label} autoFocus
            onChange={(e) => setDraftChild((c) => ({ ...c, label: e.target.value }))}
            onKeyDown={(e) => e.key === "Enter" && handleSaveChild()}
            placeholder="VD: Câu chuyện của chúng tôi"
            className="px-3 py-2 rounded-3 border border-border bg-canvas text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-semibold text-primary">Liên kết đến</label>
          <LinkPicker value={draftChild.href} onChange={(href) => setDraftChild((c) => ({ ...c, href }))} />
        </div>
        <div className="flex justify-end gap-2 pt-2 border-t border-border">
          <button onClick={closeModal}
            className="px-4 py-2 rounded-3 text-sm font-medium text-secondary bg-subtle hover:bg-border transition-colors cursor-pointer">
            Hủy
          </button>
          <button onClick={handleSaveChild} disabled={!draftChild.label.trim()}
            className="px-4 py-2 rounded-3 text-sm font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {modalTarget?.mode === "child-add" ? "Thêm" : "Cập nhật"}
          </button>
        </div>
      </LightModal>

      {/* Delete confirm */}
      <LightConfirm
        isOpen={!!deleteTarget}
        message={deleteMessage}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
