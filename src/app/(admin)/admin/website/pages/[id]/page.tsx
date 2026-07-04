import { requireAdmin } from "@/lib/auth-helpers";
import { PageService } from "@/lib/services/page.service";
import PageEditorClient from "@/components/admin/website/PageEditorClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Sửa trang nội dung | Cốc Nối Admin",
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPageAdminPage({ params }: PageProps) {
  await requireAdmin();
  const { id } = await params;

  const page = await PageService.getPageById(id);
  if (!page) notFound();

  return (
    <div className="py-6 px-4">
      <PageEditorClient page={page} />
    </div>
  );
}
