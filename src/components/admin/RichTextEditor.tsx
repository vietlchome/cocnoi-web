"use client";

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Youtube from "@tiptap/extension-youtube";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Quote,
  Code,
  Terminal,
  Link2,
  ImagePlus,
  Minus,
  Undo2,
  Redo2,
  X
} from "lucide-react";

// Inline custom YouTube icon SVG to ensure compatibility without dependency issues
const YoutubeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    strokeWidth="2"
    fill="none"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
  </svg>
);
import ImageCropUploader from "@/components/admin/ImageCropUploader";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  value,
  onChange,
  placeholder = "Bắt đầu viết câu chuyện..."
}: RichTextEditorProps) {
  const [showImageModal, setShowImageModal] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Image.configure({
        HTMLAttributes: {
          class: "rounded-3 my-6 max-w-full mx-auto shadow-md block",
        },
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: {
          class: "text-accent underline cursor-pointer",
        },
      }),
      Youtube.configure({
        controls: true,
        nocookie: true,
        HTMLAttributes: {
          class: "aspect-video w-full my-6 rounded-3 shadow-md mx-auto max-w-[640px]",
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "w-full min-h-[450px] p-5 focus:outline-none focus:ring-0 text-sm font-bvp text-primary leading-relaxed bg-canvas overflow-y-auto prose prose-cocnoi max-w-none focus-within:outline-none",
      },
    },
  });

  // Keep editor content in sync with external value changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="w-full border border-border/40 rounded-3 bg-canvas flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // Toolbar action helpers
  const setLink = () => {
    const previousUrl = editor.getAttributes("link").href;
    const url = prompt("Nhập địa chỉ URL liên kết:", previousUrl);

    // Cancelled
    if (url === null) {
      return;
    }

    // Empty
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }

    // Update link
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  const handleImageUploaded = (url: string) => {
    if (!url) return;
    const altText = prompt("Nhập mô tả hình ảnh (alt text) để tối ưu SEO:", "") || "Hình ảnh";
    editor.chain().focus().setImage({ src: url, alt: altText }).run();
    setShowImageModal(false);
  };

  const addYoutubeVideo = () => {
    const url = prompt("Nhập địa chỉ URL video YouTube (ví dụ: https://www.youtube.com/watch?v=dQw4w9WgXcQ):");
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  return (
    <div className="w-full border border-border/40 rounded-3 overflow-hidden bg-canvas flex flex-col min-h-[500px] shadow-xs">
      {/* Rich Editor Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-border/40 bg-subtle/20 px-3 py-2 gap-2">
        <div className="flex items-center gap-0.5 flex-wrap">
          {/* Format: Bold, Italic, Underline, Strikethrough */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("bold") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Chữ đậm"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("italic") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Chữ nghiêng"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("underline") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Gạch chân"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("strike") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Gạch ngang"
          >
            <Strikethrough className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-border/60 mx-1.5" />

          {/* Heading Dropdown */}
          <select
            value={
              editor.isActive("heading", { level: 1 })
                ? "h1"
                : editor.isActive("heading", { level: 2 })
                ? "h2"
                : editor.isActive("heading", { level: 3 })
                ? "h3"
                : "p"
            }
            onChange={(e) => {
              const val = e.target.value;
              if (val === "p") {
                editor.chain().focus().setParagraph().run();
              } else {
                const level = parseInt(val.replace("h", ""), 10) as 1 | 2 | 3;
                editor.chain().focus().toggleHeading({ level }).run();
              }
            }}
            className="text-xs bg-canvas border border-border/40 px-2 py-1 rounded-2 focus:outline-none cursor-pointer font-bold text-primary mr-1"
          >
            <option value="p">Văn bản thường</option>
            <option value="h1">Tiêu đề lớn (H1)</option>
            <option value="h2">Tiêu đề vừa (H2)</option>
            <option value="h3">Tiêu đề nhỏ (H3)</option>
          </select>

          <div className="h-4 w-px bg-border/60 mx-1.5" />

          {/* Lists */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("bulletList") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Danh sách dấu tròn"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("orderedList") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Danh sách số"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-border/60 mx-1.5" />

          {/* Blockquote & Code */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("blockquote") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Trích dẫn"
          >
            <Quote className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCode().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("code") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Mã nguồn dòng"
          >
            <Code className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("codeBlock") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Khối mã nguồn"
          >
            <Terminal className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-border/60 mx-1.5" />

          {/* Media: Links, Images, YouTube */}
          <button
            type="button"
            onClick={setLink}
            className={`p-2 rounded hover:bg-subtle/50 transition-colors cursor-pointer ${
              editor.isActive("link") ? "bg-subtle text-accent font-bold" : "text-secondary hover:text-primary"
            }`}
            title="Chèn liên kết"
          >
            <Link2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setShowImageModal(true)}
            className="p-2 rounded hover:bg-subtle/50 text-accent hover:text-accent-hover transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Thêm hình ảnh"
          >
            <ImagePlus className="w-4 h-4 text-accent" />
            <span className="hidden sm:inline">Thêm ảnh</span>
          </button>
          <button
            type="button"
            onClick={addYoutubeVideo}
            className="p-2 rounded hover:bg-subtle/50 text-red-600 hover:text-red-700 transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Thêm video YouTube"
          >
            <YoutubeIcon className="w-4 h-4 text-red-600" />
            <span className="hidden sm:inline">Thêm YouTube</span>
          </button>

          <div className="h-4 w-px bg-border/60 mx-1.5" />

          {/* Horizontal Rule */}
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className="p-2 rounded hover:bg-subtle/50 text-secondary hover:text-primary transition-colors cursor-pointer"
            title="Đường phân cách ngang"
          >
            <Minus className="w-4 h-4" />
          </button>
        </div>

        {/* Undo/Redo */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-subtle/50 text-secondary hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Hoàn tác (Undo)"
          >
            <Undo2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-subtle/50 text-secondary hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
            title="Làm lại (Redo)"
          >
            <Redo2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Content Area */}
      <div className="flex-grow flex flex-col min-h-[400px]">
        <EditorContent editor={editor} className="flex-grow flex flex-col" />
      </div>

      {/* Cloudinary Image Upload Modal */}
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
