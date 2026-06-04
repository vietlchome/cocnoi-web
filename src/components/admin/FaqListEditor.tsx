"use client";

import { useState } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, HelpCircle, MessageSquare } from "lucide-react";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqListEditorProps {
  label?: string;
  value: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
}

export default function FaqListEditor({
  label = "Danh sách câu hỏi FAQ",
  value = [],
  onChange,
}: FaqListEditorProps) {
  const faqs = value || [];

  const handleAdd = () => {
    const newFaq: FaqItem = { question: "", answer: "" };
    onChange([...faqs, newFaq]);
  };

  const handleUpdate = (index: number, field: keyof FaqItem, val: string) => {
    const updated = faqs.map((faq, i) => {
      if (i === index) {
        return { ...faq, [field]: val };
      }
      return faq;
    });
    onChange(updated);
  };

  const handleDelete = (index: number) => {
    const updated = faqs.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === faqs.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...faqs];
    
    // Swap items
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    onChange(updated);
  };

  return (
    <div className="flex flex-col gap-3 font-bvp text-xs">
      <div className="flex items-center justify-between">
        <label className="font-bold text-secondary">{label}</label>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent hover:bg-accent-hover text-canvas font-bold rounded-2 transition-colors cursor-pointer text-[11px]"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Thêm câu hỏi mới</span>
        </button>
      </div>

      {faqs.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 border border-dashed border-border/80 rounded-3 bg-canvas/20 text-secondary">
          <HelpCircle className="w-8 h-8 text-secondary/40 mb-2 stroke-[1.5]" />
          <p className="font-medium">Chưa có câu hỏi nào trong danh sách.</p>
          <p className="text-[10px] text-secondary/60 mt-0.5">Bấm nút trên để tạo câu hỏi đầu tiên.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-border/60 rounded-3 bg-canvas/30 overflow-hidden shadow-xs hover:border-border transition-all flex flex-col md:flex-row"
            >
              {/* Index & Reordering controls */}
              <div className="bg-[#FAF7F2] px-3 py-4 md:py-0 border-b md:border-b-0 md:border-r border-border/40 flex md:flex-col items-center justify-between md:justify-center gap-2 shrink-0 md:w-14">
                <span className="font-playfair font-bold text-sm text-secondary/50">
                  #{index + 1}
                </span>
                
                <div className="flex md:flex-col items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleMove(index, "up")}
                    disabled={index === 0}
                    className="p-1 border border-border/60 rounded hover:bg-canvas text-secondary hover:text-accent disabled:opacity-40 disabled:hover:text-secondary cursor-pointer"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, "down")}
                    disabled={index === faqs.length - 1}
                    className="p-1 border border-border/60 rounded hover:bg-canvas text-secondary hover:text-accent disabled:opacity-40 disabled:hover:text-secondary cursor-pointer"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Form Content fields */}
              <div className="flex-grow p-4 space-y-3.5">
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <HelpCircle className="w-3.5 h-3.5 text-accent" />
                    <span>Câu hỏi:</span>
                  </div>
                  <input
                    type="text"
                    value={faq.question}
                    onChange={(e) => handleUpdate(index, "question", e.target.value)}
                    placeholder="Ví dụ: Cốc Nối làm ở đâu?"
                    className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-medium"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-1.5 text-primary font-bold">
                    <MessageSquare className="w-3.5 h-3.5 text-accent" />
                    <span>Câu trả lời giải đáp:</span>
                  </div>
                  <textarea
                    value={faq.answer}
                    onChange={(e) => handleUpdate(index, "answer", e.target.value)}
                    placeholder="Nhập nội dung giải đáp chi tiết..."
                    rows={3}
                    className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all leading-relaxed"
                  />
                </div>
              </div>

              {/* Deletion control */}
              <div className="p-4 bg-rose-500/5 md:bg-transparent border-t md:border-t-0 md:border-l border-border/40 flex items-center justify-end md:justify-center md:w-16 shrink-0">
                <button
                  type="button"
                  onClick={() => handleDelete(index)}
                  className="p-2 border border-rose-200 hover:border-rose-500 rounded-2 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
                  title="Xóa câu hỏi này"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
