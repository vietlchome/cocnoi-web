"use client";

import { useState } from "react";
import Link from "next/link";
import { deletePageAction, togglePageVisibilityAction } from "@/lib/actions/page.actions";
import { formatDate } from "@/lib/utils/format";
import { Edit, Trash2, Plus, Search, Eye, EyeOff, Loader2, FileText } from "lucide-react";

interface Page {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  visible: boolean;
  sortOrder: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface PagesListClientProps {
  initialPages: Page[];
}

export default function PagesListClient({ initialPages }: PagesListClientProps) {
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [search, setSearch] = useState("");
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const filtered = pages.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleVisible = async (page: Page) => {
    setLoadingId(page.id);
    try {
      const res = await togglePageVisibilityAction(page.id, !page.visible);
      if (res.success && res.data) {
        setPages((prev) =>
          prev.map((p) => (p.id === page.id ? { ...p, visible: res.data!.visible } : p))
        );
      } else {
        alert(res.error || "Có lỗi xảy ra khi đổi trạng thái hiển thị.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (page: Page) => {
    if (
      !confirm(
        `Bạn có chắc muốn xóa trang "${page.title}"? Hành động này không thể hoàn tác.`
      )
    )
      return;

    setLoadingId(page.id);
    try {
      const res = await deletePageAction(page.id);
      if (res.success) {
        setPages((prev) => prev.filter((p) => p.id !== page.id));
      } else {
        alert(res.error || "Không thể xóa trang.");
      }
    } catch (err: any) {
      alert(err.message || "Lỗi kết nối.");
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-bvp">
      {/* Search + Create bar */}
      <div className="bg-canvas border border-border/40 p-5 rounded-3 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Tìm trang theo tiêu đề hoặc slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-xs bg-[#FAF7F2] border border-border/40 pl-10 pr-4 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>

        <Link
          href="/admin/website/pages/create"
          className="w-full sm:w-auto bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2.5 px-4.5 rounded-2 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo trang</span>
        </Link>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="bg-canvas border border-border/40 rounded-3 py-16 text-center text-secondary text-sm">
          <FileText className="w-10 h-10 stroke-[1.5] mb-2 mx-auto opacity-50 text-accent" />
          <span>Chưa có trang nội dung nào.</span>
        </div>
      ) : (
        <div className="bg-canvas border border-border/40 rounded-3 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/30 bg-subtle/30">
                  <th className="text-left px-5 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider w-28">
                    Tình trạng
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider hidden md:table-cell">
                    Slug
                  </th>
                  <th className="text-left px-4 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider hidden lg:table-cell w-32">
                    Cập nhật
                  </th>
                  <th className="sticky right-0 bg-subtle/30 text-right px-5 py-3 text-[11px] font-bold text-secondary uppercase tracking-wider w-28">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filtered.map((page) => (
                  <tr
                    key={page.id}
                    className="hover:bg-subtle/20 transition-colors group"
                  >
                    <td className="px-5 py-4">
                      <span className="font-medium text-primary text-sm leading-tight line-clamp-2">
                        {page.title}
                      </span>
                      {page.excerpt && (
                        <span className="block text-xs text-secondary/60 mt-0.5 truncate max-w-xs">
                          {page.excerpt}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <button
                        onClick={() => handleToggleVisible(page)}
                        disabled={loadingId === page.id}
                        className="cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        title={page.visible ? "Click để ẩn" : "Click để hiển thị"}
                      >
                        {loadingId === page.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-secondary" />
                        ) : page.visible ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                            <Eye className="w-3 h-3" />
                            Hiển thị
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            <EyeOff className="w-3 h-3" />
                            Ẩn
                          </span>
                        )}
                      </button>
                    </td>

                    <td className="px-4 py-4 hidden md:table-cell">
                      <code className="text-xs text-secondary/70 bg-subtle/50 px-1.5 py-0.5 rounded font-mono">
                        /trang/{page.slug}
                      </code>
                    </td>

                    <td className="px-4 py-4 hidden lg:table-cell">
                      <span className="text-xs text-secondary">
                        {formatDate(page.updatedAt)}
                      </span>
                    </td>

                    <td className="sticky right-0 bg-canvas group-hover:bg-[#FAF7F2] transition-colors px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/website/pages/${page.id}`}
                          className="inline-flex items-center justify-center p-2 rounded-2 border border-border hover:border-accent hover:text-accent text-secondary transition-all"
                          title="Chỉnh sửa trang"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button
                          onClick={() => handleDelete(page)}
                          disabled={loadingId === page.id}
                          className="inline-flex items-center justify-center p-2 rounded-2 border border-border hover:border-rose-500 hover:text-rose-500 text-secondary transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                          title="Xóa trang"
                        >
                          {loadingId === page.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-border/20 text-xs text-secondary/60">
            {filtered.length} trang
          </div>
        </div>
      )}
    </div>
  );
}
