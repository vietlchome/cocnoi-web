import { getPosts } from "@/lib/actions/content.actions";
import AdminContentClient from "@/components/admin/content/AdminContentClient";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const res = await getPosts({ page: 1, pageSize: 100 });
  const posts = res.success && res.data ? res.data : [];

  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent" />
          <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
            Quản Trị Bài Viết
          </h1>
        </div>
        <p className="text-xs text-secondary mt-0.5 pl-8">
          Quản trị 3 nhóm bài viết chính của website: Người-Nối, Câu chuyện Cốc Nối, và Kiến thức & Cảm hứng.
        </p>
      </div>

      {/* Main CMS switcher */}
      <AdminContentClient initialPosts={posts} />
    </div>
  );
}
