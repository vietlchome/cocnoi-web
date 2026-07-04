import { requireAdmin } from "@/lib/auth-helpers";
import PageEditorClient from "@/components/admin/website/PageEditorClient";

export const metadata = {
  title: "Tạo trang nội dung | Cốc Nối Admin",
};

export default async function CreatePageAdminPage() {
  await requireAdmin();
  return (
    <div className="py-6 px-4">
      <PageEditorClient />
    </div>
  );
}
