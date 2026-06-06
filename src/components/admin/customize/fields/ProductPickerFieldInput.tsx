"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Loader2, GripVertical } from "lucide-react";
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

interface ProductPickerFieldInputProps {
  field: { label: string; helpText?: string };
  value: string[];
  onChange: (next: string[]) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  images?: string[];
}

interface SortableProductItemProps {
  id: string;
  p: Product;
  idx: number;
  disabled?: boolean;
  onRemove: () => void;
}

function SortableProductItem({ id, p, idx, disabled, onRemove }: SortableProductItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 p-2 bg-subtle/30 border border-border rounded-3 bg-canvas"
    >
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

      <span className="text-xs text-secondary w-6">{idx + 1}.</span>
      {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-2" />}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-primary truncate">{p.name}</p>
        <div className="flex items-center gap-2">
          {p.sku && <span className="text-xs text-secondary font-mono">{p.sku}</span>}
          <span className="text-xs text-secondary">{p.price.toLocaleString("vi-VN")} đ</span>
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-2 border border-border w-7 h-7 flex items-center justify-center bg-canvas cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function ProductPickerFieldInput({ field, value, onChange, path, error, disabled }: ProductPickerFieldInputProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Lazy load product list khi mở modal
  useEffect(() => {
    if (!modalOpen || allProducts.length > 0) return;
    setLoading(true);
    fetch('/api/admin/products')
      .then(r => r.json())
      .then(data => setAllProducts(data.data ?? []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [modalOpen, allProducts.length]);

  const selectedIds = value || [];
  const selectedProducts = selectedIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => !!p);

  const availableProducts = allProducts.filter(
    p => !selectedIds.includes(p.id) && 
         (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addProduct = (id: string) => {
    onChange([...selectedIds, id]);
    setSearch("");
  };

  const removeProduct = (id: string) => {
    onChange(selectedIds.filter(x => x !== id));
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = selectedIds.indexOf(active.id as string);
    const newIndex = selectedIds.indexOf(over.id as string);

    if (oldIndex !== -1 && newIndex !== -1) {
      onChange(arrayMove(selectedIds, oldIndex, newIndex));
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <label className="text-sm font-semibold text-primary">{field.label}</label>
      {field.helpText && <p className="text-xs text-secondary">{field.helpText}</p>}
      
      {/* Selected list */}
      <div className="flex flex-col gap-2">
        {selectedProducts.length === 0 ? (
          <p className="text-sm text-secondary italic p-3 border border-dashed border-border rounded-3 bg-canvas">
            Chưa chọn sản phẩm nào.
          </p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={selectedIds} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-2">
                {selectedProducts.map((p, idx) => (
                  <SortableProductItem
                    key={p.id}
                    id={p.id}
                    p={p}
                    idx={idx}
                    disabled={disabled}
                    onRemove={() => removeProduct(p.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>
      
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-3 text-sm text-primary hover:bg-subtle/30 bg-canvas cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Thêm sản phẩm
      </button>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-canvas rounded-4 p-5 w-full max-w-2xl max-h-[80vh] flex flex-col gap-4 border border-border" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-primary font-playfair">Chọn sản phẩm</h3>
              <button type="button" onClick={() => setModalOpen(false)} className="p-1.5 hover:bg-subtle rounded-2 cursor-pointer"><X className="w-5 h-5 text-secondary" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="w-full pl-10 pr-3 py-2.5 border border-border rounded-3 bg-canvas text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-1 min-h-[300px]">
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
              ) : availableProducts.length === 0 ? (
                <p className="text-sm text-secondary text-center p-8 italic">Không có sản phẩm nào khả dụng.</p>
              ) : (
                availableProducts.map(p => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => addProduct(p.id)}
                    className="flex items-center gap-3 p-2 hover:bg-subtle/50 rounded-2 text-left border border-transparent hover:border-border transition-all w-full cursor-pointer"
                  >
                    {p.images?.[0] ? (
                      <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-2 border border-border" />
                    ) : (
                      <div className="w-12 h-12 bg-subtle border border-border rounded-2 flex items-center justify-center text-[10px] text-secondary">No image</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{p.name}</p>
                      <div className="flex items-center gap-2">
                        {p.sku && <span className="text-xs text-secondary font-mono">{p.sku}</span>}
                        <span className="text-xs text-secondary">{p.price.toLocaleString("vi-VN")} đ</span>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
