"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPost, updatePost } from "@/lib/actions/content.actions";
import RichTextEditor from "@/components/admin/RichTextEditor";
import ImageCropUploader from "@/components/admin/ImageCropUploader";
import { FormField } from "@/components/ui/FormField";
import { ArrowLeft, Save, Loader2, Sparkles, Globe, EyeOff, Calendar, Settings } from "lucide-react";
import { PostStatus } from "@prisma/client";

interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  coverImage: string | null;
  category: string;
  status: PostStatus;
  publishedAt: Date | string | null;
  scheduledFor: Date | string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  authorName: string | null;
  tags: string[];
  readingTime: number | null;
  createdAt: Date | string;
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
  
  // New Metadata Fields
  const [status, setStatus] = useState<PostStatus>(post?.status || PostStatus.DRAFT);
  const [scheduledFor, setScheduledFor] = useState<string>(
    post?.scheduledFor ? new Date(post.scheduledFor).toISOString().slice(0, 16) : ""
  );
  const [authorName, setAuthorName] = useState(post?.authorName || "Cốc Nối");
  const [tags, setTags] = useState(post?.tags ? post.tags.join(", ") : "");
  
  // SEO Metadata Fields
  const [metaTitle, setMetaTitle] = useState(post?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(post?.metaDescription || "");
  const [ogImage, setOgImage] = useState(post?.ogImage || "");

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSeo, setShowSeo] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Local validation
    const localErrors: Record<string, string> = {};
    if (!title.trim()) localErrors.title = "Tiêu đề bài viết không được bỏ trống!";
    if (!content.trim()) localErrors.content = "Nội dung bài viết không được bỏ trống!";
    if (status === PostStatus.SCHEDULED && !scheduledFor) {
      localErrors.scheduledFor = "Vui lòng chọn thời gian lên lịch xuất bản!";
    }

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
        status: status,
        scheduledFor: status === PostStatus.SCHEDULED && scheduledFor ? new Date(scheduledFor) : null,
        authorName: authorName.trim() || "Cốc Nối",
        tags: tags,
        metaTitle: metaTitle.trim() || null,
        metaDescription: metaDescription.trim() || null,
        ogImage: ogImage.trim() || null,
      };

      const res = isEdit
        ? await updatePost(post.id, payload as any)
        : await createPost(payload as any);

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
    <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm font-bvp">
      {/* Editor Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-border/40 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
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
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2.5 px-4.5 rounded-2 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60 justify-center w-full sm:w-auto"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isEdit ? "Cập nhật bài viết" : "Lưu bài viết"}</span>
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
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs font-bold text-secondary uppercase tracking-wider block">
                  Nội dung bài viết *
                </label>
                {post?.readingTime && (
                  <span className="text-[10px] bg-subtle px-2 py-0.5 rounded text-secondary font-semibold">
                    Thời gian đọc dự kiến: {post.readingTime} phút
                  </span>
                )}
              </div>
              {errors.content && (
                <span className="text-[11px] text-rose-500 font-bold block mb-1">{errors.content}</span>
              )}
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Bắt đầu viết câu chuyện..."
              />
            </div>

            {/* SEO Collapsible Section */}
            <div className="border border-border/40 rounded-3 overflow-hidden bg-canvas">
              <button
                type="button"
                onClick={() => setShowSeo(!showSeo)}
                className="w-full px-5 py-4 flex items-center justify-between bg-subtle/10 hover:bg-subtle/20 transition-colors font-bold text-xs text-primary"
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4 text-accent" />
                  <span>Cấu hình SEO & Metadata (Tùy chỉnh)</span>
                </div>
                <span className="text-secondary">{showSeo ? "Ẩn bớt" : "Hiển thị thêm"}</span>
              </button>

              {showSeo && (
                <div className="p-5 border-t border-border/40 space-y-4">
                  <FormField label="Tiêu đề SEO (Meta Title)">
                    <input
                      type="text"
                      value={metaTitle}
                      onChange={(e) => setMetaTitle(e.target.value)}
                      placeholder={title || "Tự động lấy tiêu đề bài viết..."}
                      className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                    />
                  </FormField>

                  <FormField label="Mô tả SEO (Meta Description)">
                    <textarea
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                      placeholder={excerpt || "Tự động lấy phần tóm tắt bài viết..."}
                      rows={3}
                      className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all leading-relaxed"
                    />
                  </FormField>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ImageCropUploader
                      label="Ảnh mạng xã hội (OG Image)"
                      value={ogImage}
                      onChange={setOgImage}
                      aspectRatio={1.91}
                      recommendedSize="1200 x 630 (1.91:1)"
                      folder="blog-seo"
                    />
                    <FormField label="Hoặc nhập link trực tiếp ảnh OG (URL)">
                      <input
                        type="text"
                         value={ogImage}
                        onChange={(e) => setOgImage(e.target.value)}
                        placeholder="Link ảnh mạng xã hội bên ngoài..."
                        className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none"
                      />
                    </FormField>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right sidebar: Status, Cover, Metadata */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="border border-border/40 rounded-3 p-5 bg-canvas space-y-4 shadow-xs">
              <h4 className="font-playfair font-bold text-sm text-primary border-b border-border/40 pb-2 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-accent" />
                <span>Trạng thái xuất bản</span>
              </h4>

              <FormField label="Trạng thái">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as PostStatus)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer font-bold text-primary"
                >
                  <option value={PostStatus.DRAFT}>Bản nháp (Draft)</option>
                  <option value={PostStatus.PUBLISHED}>Xuất bản ngay (Published)</option>
                  <option value={PostStatus.SCHEDULED}>Hẹn giờ đăng (Scheduled)</option>
                </select>
              </FormField>

              {status === PostStatus.SCHEDULED && (
                <FormField label="Thời gian hẹn giờ *" error={errors.scheduledFor}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary pointer-events-none" />
                    <input
                      type="datetime-local"
                      value={scheduledFor}
                      onChange={(e) => setScheduledFor(e.target.value)}
                      className="w-full text-xs bg-canvas border border-border/40 pl-9 pr-3 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all text-primary font-medium"
                    />
                  </div>
                </FormField>
              )}
            </div>

            {/* Classification & Authorship */}
            <div className="border border-border/40 rounded-3 p-5 bg-canvas space-y-4 shadow-xs">
              <h4 className="font-playfair font-bold text-sm text-primary border-b border-border/40 pb-2 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Phân loại & Tác giả</span>
              </h4>

              <FormField label="Danh mục bài viết">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all cursor-pointer font-medium text-primary"
                >
                  <option value="UNCATEGORIZED">Chưa phân loại</option>
                  <option value="UNSUNG_HEROES">Người Nối (Vinh danh)</option>
                  <option value="JOURNEY">Hành trình (Câu chuyện)</option>
                  <option value="KNOWLEDGE">Kiến thức / Tạp chí</option>
                </select>
              </FormField>

              <FormField label="Tác giả">
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Người viết..."
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </FormField>

              <FormField label="Thẻ bài viết (Tags)">
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="gốm, nghệ nhân, hành trình (cách nhau bởi dấu phẩy)"
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </FormField>
            </div>

            {/* Cover Image Uploader */}
            <div className="border border-border/40 rounded-3 p-5 bg-canvas space-y-4 shadow-xs">
              <ImageCropUploader
                label="Ảnh bìa bài viết (Featured Image)"
                value={coverImage}
                onChange={setCoverImage}
                aspectRatio={16 / 9}
                recommendedSize="1200 x 675 (16:9)"
                folder="blog"
              />

              <FormField label="Hoặc link ảnh bìa trực tiếp (URL)">
                <input
                  type="text"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="Dán link ảnh bên ngoài (Unsplash, imgur...)"
                  className="w-full text-[11px] bg-canvas border border-border/40 px-3 py-2 rounded-2 focus:outline-none"
                />
              </FormField>
            </div>

            {/* Excerpt */}
            <div className="border border-border/40 rounded-3 p-5 bg-canvas space-y-4 shadow-xs">
              <FormField label="Tóm tắt / Trích dẫn ngắn">
                <textarea
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Mô tả ngắn hiển thị ở trang danh sách blog..."
                  rows={4}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all leading-relaxed"
                />
              </FormField>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
