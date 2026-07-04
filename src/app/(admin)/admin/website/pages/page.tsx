import { requireAdmin } from "@/lib/auth-helpers";
import { PageService } from "@/lib/services/page.service";
import PagesListClient from "@/components/admin/website/PagesListClient";
import { FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Trang nội dung | Cốc Nối Admin",
};

export default async function PagesAdminPage() {
  await requireAdmin();
  const pages = await PageService.listPages();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-accent" />
          <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
            Trang nội dung
          </h1>
        </div>
        <p className="text-xs text-secondary mt-0.5 pl-8">
          Quản lý các trang tĩnh do admin tạo (chính sách, giới thiệu, đối tác...). Mỗi trang hiển thị tại /trang/[slug].
        </p>
      </div>

      <PagesListClient initialPages={pages as any} />
    </div>
  );
}
