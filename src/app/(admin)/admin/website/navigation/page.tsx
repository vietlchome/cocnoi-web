import { getSiteConfig } from "@/lib/site-config";
import { requireAdmin } from "@/lib/auth-helpers";
import MenuManagerClient from "@/components/admin/website/MenuManagerClient";

export const metadata = {
  title: "Menu điều hướng | Cốc Nối Admin",
};

export default async function NavigationPage() {
  await requireAdmin();
  const config = await getSiteConfig();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <MenuManagerClient initialConfig={config} />
    </div>
  );
}
