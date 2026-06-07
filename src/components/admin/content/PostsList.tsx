"use client";

import { useState, useEffect } from "react";
import { deletePost, publishPost, unpublishPost } from "@/lib/actions/content.actions";
import { formatDate } from "@/lib/utils/format";
import { Edit, Trash2, Globe, EyeOff, Search, Plus, Calendar, BookOpen, Loader2, Clock } from "lucide-react";
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

interface PostsListProps {
  initialPosts: Post[];
  onEdit: (post: Post | null) => void;
}

export default function PostsList({ initialPosts, onEdit }: PostsListProps) {
  const [posts, setPosts] = useState<Post[]>(initialPosts);
  
  useEffect(() => {
    setPosts(initialPosts);
  }, [initialPosts]);

  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleTogglePublish = async (post: Post) => {
    setLoadingId(post.id);
    try {
      const isPublished = post.status === PostStatus.PUBLISHED;
      const res = isPublished ? await unpublishPost(post.id) : await publishPost(post.id);
      if (res.success && res.data) {
        setPosts((prev) =>
          prev.map((p) => (p.id === post.id ? { ...p, status: res.data.status, publishedAt: res.data.publishedAt } : p))
        );
      } else {
        alert(res.error || "Có lỗi xảy ra khi đổi trạng thái bài viết.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bài viết này? Hành động này không thể hoàn tác!")) return;

    setLoadingId(id);
    try {
      const res = await deletePost(id);
      if (res.success) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
      } else {
        alert(res.error || "Không thể xóa bài viết.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-bvp">
      {/* Search and Action Bar */}
      <div className="bg-canvas border border-border/40 p-5 rounded-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Tìm bài viết theo tiêu đề..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-[#FAF7F2] border border-border/40 pl-10 pr-4 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>

        <button
          onClick={() => onEdit(null)}
          className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2.5 px-4.5 rounded-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Viết bài viết mới</span>
        </button>
      </div>

      {/* Grid of Posts */}
      {filteredPosts.length === 0 ? (
        <div className="bg-canvas border border-border/40 rounded-3 py-16 text-center text-secondary text-sm">
          <BookOpen className="w-10 h-10 stroke-[1.5] mb-2 mx-auto opacity-50 text-accent" />
          <span>Không tìm thấy bài viết blog nào.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredPosts.map((post) => {
            const hasCover = !!post.coverImage;
            const coverSrc = post.coverImage || "https://images.unsplash.com/photo-1576016770956-debb63d90029?w=400&q=80";

            return (
              <div
                key={post.id}
                className="bg-canvas border border-border/40 rounded-3 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
              >
                {/* Cover Image */}
                <div className="h-44 relative bg-subtle/20 overflow-hidden shrink-0">
                  <img
                    src={coverSrc}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border shadow-sm backdrop-blur-md ${
                      post.status === PostStatus.PUBLISHED
                        ? "bg-emerald-500/90 border-emerald-400 text-canvas"
                        : post.status === PostStatus.SCHEDULED
                        ? "bg-sky-500/90 border-sky-400 text-canvas"
                        : "bg-amber-500/90 border-amber-400 text-canvas"
                    }`}>
                      {post.status === PostStatus.PUBLISHED ? (
                        <Globe className="w-3 h-3" />
                      ) : post.status === PostStatus.SCHEDULED ? (
                        <Clock className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      <span>
                        {post.status === PostStatus.PUBLISHED
                          ? "Đã đăng"
                          : post.status === PostStatus.SCHEDULED
                          ? "Hẹn giờ"
                          : "Bản nháp"}
                      </span>
                    </span>

                    {/* Category Tag */}
                    <span className="inline-block px-2 py-0.5 bg-primary/80 border border-primary/60 text-canvas rounded text-[9px] font-semibold uppercase tracking-wider">
                      {post.category === "UNSUNG_HEROES"
                        ? "Người Nối"
                        : post.category === "JOURNEY"
                        ? "Hành trình"
                        : post.category === "KNOWLEDGE"
                        ? "Tạp chí"
                        : "Chưa phân loại"}
                    </span>
                  </div>
                </div>

                {/* Content info */}
                <div className="p-5 flex-grow flex flex-col gap-3">
                  <div className="flex items-center justify-between text-[10px] font-bold text-secondary">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-accent" />
                      <span>{formatDate(post.createdAt)}</span>
                    </div>
                    {post.readingTime && (
                      <span className="bg-subtle/50 px-1.5 py-0.5 rounded">
                        {post.readingTime} phút đọc
                      </span>
                    )}
                  </div>

                  <h4 className="font-playfair text-base font-bold text-primary truncate-2-lines group-hover:text-accent transition-colors">
                    {post.title}
                  </h4>

                  <p className="text-xs text-secondary truncate-3-lines leading-relaxed flex-grow">
                    {post.excerpt || "Không có tóm tắt giới thiệu bài viết..."}
                  </p>

                  {/* Scheduled date if available */}
                  {post.status === PostStatus.SCHEDULED && post.scheduledFor && (
                    <div className="text-[10px] text-sky-600 bg-sky-50 p-2 rounded-2 flex items-center gap-1.5 font-bold border border-sky-100">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Hẹn giờ đăng: {formatDate(post.scheduledFor)}</span>
                    </div>
                  )}

                  {/* Tags Preview */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {post.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="bg-subtle text-secondary px-1.5 py-0.5 rounded-[3px] text-[9px] font-medium">
                          #{tag}
                        </span>
                      ))}
                      {post.tags.length > 3 && (
                        <span className="text-secondary/60 text-[9px] font-bold self-center ml-0.5">
                          +{post.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="pt-4 border-t border-border/40 flex items-center justify-between mt-auto">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(post)}
                        className="inline-flex items-center justify-center p-2 rounded-2 border border-border hover:border-accent hover:text-accent text-secondary transition-all cursor-pointer"
                        title="Chỉnh sửa bài viết"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleDelete(post.id)}
                        className="inline-flex items-center justify-center p-2 rounded-2 border border-border hover:border-rose-500 hover:text-rose-500 text-secondary transition-all cursor-pointer"
                        title="Xóa bài viết"
                        disabled={loadingId === post.id}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => handleTogglePublish(post)}
                      disabled={loadingId === post.id || post.status === PostStatus.SCHEDULED}
                      className={`px-3 py-1.5 rounded-2 font-bold text-xs border transition-all flex items-center gap-1 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                        post.status === PostStatus.PUBLISHED
                          ? "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                          : "bg-accent/10 border-accent/20 text-accent hover:bg-accent hover:text-canvas"
                      }`}
                      title={post.status === PostStatus.SCHEDULED ? "Không thể chuyển đổi trực tiếp trạng thái hẹn giờ từ danh sách" : ""}
                    >
                      {loadingId === post.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : post.status === PostStatus.PUBLISHED ? (
                        <>
                          <EyeOff className="w-3 h-3" />
                          <span>Hạ tải bài</span>
                        </>
                      ) : (
                        <>
                          <Globe className="w-3 h-3" />
                          <span>Xuất bản</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
