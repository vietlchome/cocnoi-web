import { getSiteConfig } from "@/lib/site-config";
import SiteCustomizerClient from "@/components/admin/settings/SiteCustomizerClient";
import { requireAdmin } from "@/lib/auth-helpers";

export const metadata = {
  title: "Tùy biến Giao diện | Cốc Nối Admin",
};

export default async function CustomizePage() {
  // Yêu cầu quyền admin
  await requireAdmin();

  // Lấy dữ liệu cấu hình hiện tại
  const initialConfig = await getSiteConfig();

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <SiteCustomizerClient initialConfig={initialConfig} />
    </div>
  );
}
