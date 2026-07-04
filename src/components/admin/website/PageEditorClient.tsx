"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPageAction, updatePageAction, deletePageAction } from "@/lib/actions/page.actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
import { FormField } from "@/components/ui/FormField";
import { slugify } from "@/lib/utils/slug";
import {
  ArrowLeft, Save, Loader2, Trash2, Eye, EyeOff, ChevronDown, ChevronUp,
} from "lucide-react";

interface PageData {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  visible: boolean;
  sortOrder: number;
}

interface PageEditorClientProps {
  page?: PageData;
}

const inputCls =
  "w-full text-sm bg-[#FAF7F2] border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all";

export default function PageEditorClient({ page }: PageEditorClientProps) {
  const router = useRouter();
  const isEdit = !!page;

  const [title, setTitle] = useState(page?.title ?? "");
  const [slug, setSlug] = useState(page?.slug ?? "");
  const [slugManual, setSlugManual] = useState(isEdit);
  const [content, setContent] = useState(page?.content ?? "");
  const [excerpt, setExcerpt] = useState(page?.excerpt ?? "");
  const [visible, setVisible] = useState(page?.visible ?? true);
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription ?? "");
  const [ogImage, setOgImage] = useState(page?.ogImage ?? "");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSeo, setShowSeo] = useState(false);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugManual) {
      setSlug(slugify(val));
    }
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugManual(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const localErrors: Record<string, string> = {};
    if (!title.trim()) localErrors.title = "Tiêu đề không được để trống.";
    if (!slug.trim()) localErrors.slug = "Slug không được để trống.";
    else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug.trim()))
      localErrors.slug = "Slug chỉ gồm chữ thường, số và dấu gạch ngang.";

    if (Object.keys(localErrors).length > 0) {
      setErrors(localErrors);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: title.trim(),
        slug: slug.trim(),
        content: content.trim(),
        excerpt: excerpt.trim() || null,
        visible,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        ogImage: ogImage.trim() || null,
        sortOrder: page?.sortOrder ?? 0,
      };

      const res = isEdit
        ? await updatePageAction(page!.id, payload)
        : await createPageAction(payload);

      if (res.success) {
        router.push("/admin/website/pages");
      } else {
        setErrors({ _form: res.error || "Có lỗi xảy ra khi lưu trang." });
      }
    } catch (err: any) {
      setErrors({ _form: err.message || "Lỗi kết nối." });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isEdit) return;
    if (!confirm(`Bạn có chắc muốn xóa trang "${page!.title}"? Hành động này không thể hoàn tác.`))
      return;

    setDeleting(true);
    try {
      const res = await deletePageAction(page!.id);
      if (res.success) {
        router.push("/admin/website/pages");
      } else {
        alert(res.error || "Không thể xóa trang.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 font-bvp pb-16">
      {/* Top bar */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.push("/admin/website/pages")}
          className="inline-flex items-center gap-1.5 text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách
        </button>

        <div className="flex items-center gap-3">
          {isEdit && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2 border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
              Xóa trang
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={loading || deleting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2 bg-accent hover:bg-accent-hover text-canvas text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {isEdit ? "Lưu thay đổi" : "Tạo trang"}
          </button>
        </div>
      </div>

      {/* Form error */}
      {errors._form && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-sm px-4 py-3 rounded-2">
          {errors._form}
        </div>
      )}

      <form onSubmit={handleSave} className="flex flex-col gap-5">
        {/* Main card */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col gap-5">
          {/* Title */}
          <FormField label="Tiêu đề trang" required error={errors.title}>
            <input
              type="text"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Ví dụ: Chính sách đổi trả"
              className={inputCls}
            />
          </FormField>

          {/* Slug */}
          <FormField label="Slug (URL)" required error={errors.slug}>
            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary/60 shrink-0">/trang/</span>
              <input
                type="text"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="chinh-sach-doi-tra"
                className={inputCls}
              />
            </div>
          </FormField>

          {/* Visible toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors ${
                visible ? "bg-emerald-500 border-emerald-500" : "bg-slate-200 border-slate-200"
              }`}
            >
              <span
                className={`block h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform ${
                  visible ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
            <span className="text-xs font-medium text-secondary flex items-center gap-1">
              {visible ? (
                <><Eye className="w-3.5 h-3.5 text-emerald-600" /> Hiển thị trên storefront</>
              ) : (
                <><EyeOff className="w-3.5 h-3.5 text-slate-400" /> Ẩn khỏi storefront</>
              )}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Nội dung trang
          </span>
          <RichTextEditor
            value={content}
            onChange={setContent}
            placeholder="Soạn nội dung trang tại đây..."
          />
        </div>

        {/* Excerpt */}
        <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm">
          <FormField label="Tóm tắt (tùy chọn)">
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              placeholder="Mô tả ngắn về trang, hiển thị trong meta description và tìm kiếm..."
              className={`${inputCls} resize-none`}
            />
          </FormField>
        </div>

        {/* SEO collapsible */}
        <div className="bg-canvas border border-border/40 rounded-3 shadow-sm overflow-hidden">
          <button
            type="button"
            onClick={() => setShowSeo((v) => !v)}
            className="w-full flex items-center justify-between px-6 py-4 text-xs font-semibold uppercase tracking-wider text-secondary hover:bg-subtle/20 transition-colors cursor-pointer"
          >
            <span>SEO & Open Graph</span>
            {showSeo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showSeo && (
            <div className="px-6 pb-6 flex flex-col gap-4 border-t border-border/20 pt-4">
              <FormField label="Meta title">
                <input
                  type="text"
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                  placeholder="Tiêu đề SEO (mặc định dùng Tiêu đề trang)"
                  className={inputCls}
                />
              </FormField>

              <FormField label="Meta description">
                <textarea
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                  rows={3}
                  placeholder="Mô tả SEO (mặc định dùng Tóm tắt)"
                  className={`${inputCls} resize-none`}
                />
              </FormField>

              <FormField label="OG Image (Cloudinary URL)">
                <input
                  type="text"
                  value={ogImage}
                  onChange={(e) => setOgImage(e.target.value)}
                  placeholder="https://res.cloudinary.com/..."
                  className={inputCls}
                />
              </FormField>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}
