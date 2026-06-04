import ExportClient from "@/components/admin/settings/ExportClient";
import { DownloadCloud } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminExportDataPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Title */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <DownloadCloud className="w-6 h-6 text-accent" />
          <h1 className="font-playfair text-2xl font-bold text-primary tracking-tight">
            Sao Lưu & Xuất Dữ Liệu
          </h1>
        </div>
        <p className="text-xs text-secondary mt-0.5 pl-8">
          Tải xuống toàn bộ dữ liệu Đơn hàng, Công nợ và Thông tin Khách hàng dưới định dạng Excel để lưu trữ hoặc nộp cho Kế toán.
        </p>
      </div>

      <ExportClient />
    </div>
  );
}
