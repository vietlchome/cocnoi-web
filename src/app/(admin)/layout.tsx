import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminTopbar from "@/components/admin/AdminTopbar";
import { getCockpitAlerts } from "@/lib/actions/analytics.actions";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const alertsRes = await getCockpitAlerts();
  const alerts = alertsRes.success && alertsRes.data ? alertsRes.data : {
    pendingRetailOrdersCount: 0,
    pendingB2BOrdersCount: 0,
    pendingInquiriesCount: 0,
  };

  return (
    <div className="min-h-screen flex bg-[#FAF7F2] text-primary font-bvp">
      
      {/* SIDEBAR */}
      <AdminSidebar 
        pendingRetailOrdersCount={alerts.pendingRetailOrdersCount}
        pendingB2BOrdersCount={alerts.pendingB2BOrdersCount}
        unreadInquiriesCount={alerts.pendingInquiriesCount}
      />

      {/* DASHBOARD CONTENT CONTAINER */}
      <div className="flex-grow flex flex-col min-w-0">
        
        {/* Top Header */}
        <AdminTopbar />

        {/* Dynamic page content */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto">
          {children}
        </main>

      </div>

    </div>
  );
}
