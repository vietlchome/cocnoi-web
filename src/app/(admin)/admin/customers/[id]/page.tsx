import { getCustomerDetails } from "@/lib/actions/customer.actions";
import CustomerDetailClient from "@/components/admin/customers/CustomerDetailClient";
import { notFound } from "next/navigation";
import { AlertCircle } from "lucide-react";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await getCustomerDetails(id);

  if (!res.success || !res.data) {
    notFound();
  }

  return (
    <div className="w-full flex flex-col gap-6">
      <CustomerDetailClient customer={res.data} />
    </div>
  );
}
