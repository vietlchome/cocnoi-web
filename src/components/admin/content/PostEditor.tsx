"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/lib/actions/content.actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageCropUploader from "@/components/admin/ImageCropUploader";
import { FormField } from "@/components/ui/FormField";
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Loader2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
}

interface PostEditorProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostEditor({ post, onClose }: PostEditorProps) {
  const router = useRouter();
  const isEdit = !!post;
  const [title, setTitle] = useState(post?.title || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [category, setCategory] = useState(post?.category || "UNCATEGORIZED");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Local validation
    const localErrors: Record<string, string> = {};
    if (!title.trim()) localErrors.title = "Tiêu đề bài viết không được bỏ trống!";
    if (!content.trim()) localErrors.content = "Nội dung bài viết không được bỏ trống!";

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() || null,
        content: content.trim(),
        coverImage: coverImage.trim() || null,
        category: category,
        isPublished: post?.isPublished || false,
      };

      const res = isEdit
        ? await updatePost(post.id, payload)
        : await createPost(payload);

      if (res.success) {
        alert(isEdit ? "Cập nhật bài viết thành công!" : "Tạo bài viết mới thành công!");
        router.refresh();
        onClose();
      } else {
        alert(res.error || "Có lỗi xảy ra.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm">
      {/* Editor Header */}
      <div className="flex items-center justify-between pb-5 border-b border-border/40 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-2 hover:bg-subtle/10 text-secondary hover:text-primary transition-colors cursor-pointer border border-border/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h3 className="font-playfair text-lg font-bold text-primary">
              {isEdit ? `Sửa bài viết: ${post.title}` : "Soạn thảo bài viết mới"}
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              Cập nhật nội dung blog, tạp chí hoặc hành trình sáng tác gốm Cốc Nối
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2.5 px-4.5 rounded-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? "Cập nhật bài viết" : "Lưu nháp / Xuất bản"}</span>
        </button>
      </div>

      {/* Editor Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main columns: Title and Content */}
          <div className="lg:col-span-2 space-y-6">
            <FormField label="Tiêu đề bài viết *" error={errors.title}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề hấp dẫn..."
                className="w-full text-sm bg-canvas border border-border/40 px-4 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-primary font-bold"
              />
            </FormField>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                Nội dung bài viết *
              </label>
              {errors.content && (
                <span className="text-[11px] text-rose-500 font-bold block mb-1">{errors.content}</span>
              )}
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Viết nội dung bài viết bằng định dạng Rich Text..."
              />
            </div>
          </div>

          {/* Right sidebar: Cover & Summary */}
          <div className="space-y-6">
            <FormField label="Danh mục bài viết">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-sm bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer font-medium text-primary"
              >
                <option value="UNCATEGORIZED">Chưa phân loại</option>
                <option value="UNSUNG_HEROES">Người Nối (Vinh danh)</option>
                <option value="JOURNEY">Hành trình (Câu chuyện)</option>
                <option value="KNOWLEDGE">Kiến thức / Tạp chí</option>
              </select>
            </FormField>

            <ImageCropUploader
              label="Ảnh bìa bài viết (Tải lên & Cắt ảnh)"
              value={coverImage}
              onChange={setCoverImage}
              aspectRatio={16 / 9}
              recommendedSize="1200 x 675 (16:9)"
              folder="blog"
            />

            <FormField label="Hoặc nhập trực tiếp link ảnh bìa (URL)">
              <input
                type="text"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Dán link ảnh bên ngoài (Unsplash, imgur...)"
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </FormField>

            <FormField label="Tóm tắt / Trích dẫn ngắn">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Mô tả ngắn hiển thị ở trang danh sách blog..."
                rows={4}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all leading-relaxed"
              />
            </FormField>
          </div>
        </div>
      </form>
    </div>
  );
}
