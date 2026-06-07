"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Code,
  Image as ImageIcon,
  Eye,
  FileEdit,
  X
} from "lucide-react";
import ImageCropUploader from "@/components/admin/ImageCropUploader";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Nhập nội dung bài viết dạng Markdown..."
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [showImageModal, setShowImageModal] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Helper to insert markdown tags around selection or at cursor
  const insertAtCursor = (before: string, after: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end);

    const replacement = before + (selectedText || "") + after;
    const newValue = text.substring(0, start) + replacement + text.substring(end);

    onChange(newValue);

    // Refocus and place cursor appropriately
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + (selectedText ? selectedText.length + after.length : 0);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleImageUploaded = (url: string) => {
    if (!url) return;
    const altText = prompt("Nhập mô tả hình ảnh (alt text) để tối ưu SEO:", "") || "Hình ảnh";
    insertAtCursor(`![${altText}](${url})`);
    setShowImageModal(false);
  };

  return (
    <div className="w-full border border-border/40 rounded-3 overflow-hidden bg-canvas flex flex-col min-h-[500px]">
      {/* Editor Header / Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/40 bg-subtle/20 px-3 py-2 gap-2">
        {/* Formatting Actions */}
        <div className="flex items-center gap-0.5 flex-wrap">
          <button
            type="button"
            onClick={() => insertAtCursor("**", "**")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Chữ đậm"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("*", "*")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Chữ nghiêng"
          >
            <Italic className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <button
            type="button"
            onClick={() => insertAtCursor("# ")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Tiêu đề 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("## ")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Tiêu đề 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <button
            type="button"
            onClick={() => insertAtCursor("[", "](url)")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Thêm liên kết"
          >
            <LinkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("- ")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Danh sách không thứ tự"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("1. ")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Danh sách có thứ tự"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("> ")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Trích dẫn"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => insertAtCursor("```\n", "\n```")}
            className="p-2 rounded hover:bg-subtle text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Khối mã nguồn"
          >
            <Code className="w-4 h-4" />
          </button>
          <div className="h-4 w-px bg-border/60 mx-1" />
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 rounded hover:bg-subtle text-accent hover:text-accent-hover transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Thêm hình ảnh"
          >
            <ImageIcon className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Thêm ảnh</span>
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border border-border/80 rounded-2 overflow-hidden text-xs bg-canvas">
          <button
            type="button"
            onClick={() => setActiveTab("edit")}
            className={`px-3 py-1.5 flex items-center gap-1 font-bold transition-all cursor-pointer ${
              activeTab === "edit"
                ? "bg-accent text-canvas"
                : "text-secondary hover:bg-subtle/50"
            }`}
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Soạn thảo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("preview")}
            className={`px-3 py-1.5 flex items-center gap-1 font-bold transition-all cursor-pointer ${
              activeTab === "preview"
                ? "bg-accent text-canvas"
                : "text-secondary hover:bg-subtle/50"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-grow flex flex-col min-h-[400px]">
        {activeTab === "edit" ? (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full flex-grow p-4 resize-y bg-canvas text-sm font-mono text-primary border-0 focus:outline-none focus:ring-0 min-h-[400px] leading-relaxed"
          />
        ) : (
          <div className="w-full flex-grow p-6 bg-canvas overflow-y-auto min-h-[400px] border-0 prose prose-stone max-w-none prose-sm sm:prose-base dark:prose-invert prose-headings:font-playfair prose-headings:font-bold prose-headings:text-primary prose-p:font-bvp prose-p:text-primary/90 prose-p:leading-relaxed prose-a:text-accent prose-a:no-underline hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-subtle/30 prose-blockquote:p-4 prose-blockquote:rounded-r-2 prose-blockquote:font-bvp prose-img:rounded-3 prose-img:shadow-md prose-img:mx-auto">
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{value}</ReactMarkdown>
            ) : (
              <span className="text-secondary/50 italic text-sm font-bvp">Nội dung xem trước sẽ hiển thị ở đây...</span>
            )}
          </div>
        )}
      </div>

      {/* Image Upload Modal */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-xs p-4">
          <div className="bg-canvas border border-border rounded-4 w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between bg-subtle/30">
              <h4 className="font-playfair font-bold text-sm text-primary">Tải ảnh lên bài viết</h4>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-secondary hover:text-primary p-1 border border-border rounded-2 hover:bg-canvas transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5">
              <ImageCropUploader
                label="Chọn ảnh để chèn vào bài viết"
                value=""
                onChange={handleImageUploaded}
                folder="blog"
                recommendedSize="1200 x 675 (Khuyên dùng)"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
