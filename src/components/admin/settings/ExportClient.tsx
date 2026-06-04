"use client";

import { useState } from "react";
import { exportOrdersToCsv, exportCustomersToCsv } from "@/lib/actions/export.actions";
import { Download, Receipt, Users, Loader2 } from "lucide-react";

export default function ExportClient() {
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await exportOrdersToCsv();
      if (res.success && res.data) {
        const date = new Date().toISOString().split("T")[0];
        downloadFile(res.data, `CocNoi_DonHang_${date}.csv`);
      } else {
        alert(res.error || "Có lỗi xảy ra khi xuất dữ liệu đơn hàng.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleExportCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const res = await exportCustomersToCsv();
      if (res.success && res.data) {
        const date = new Date().toISOString().split("T")[0];
        downloadFile(res.data, `CocNoi_KhachHang_${date}.csv`);
      } else {
        alert(res.error || "Có lỗi xảy ra khi xuất dữ liệu khách hàng.");
      }
    } catch (err) {
      alert("Lỗi kết nối.");
    } finally {
      setLoadingCustomers(false);
    }
  };

  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 md:p-8 max-w-4xl shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* Box: Export Orders */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-2">
          <Receipt className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-playfair font-bold text-lg text-primary">Dữ liệu Đơn Hàng & Công Nợ</h3>
          <p className="text-xs text-secondary mt-1">Xuất toàn bộ đơn hàng bán lẻ và B2B (kèm theo báo cáo công nợ) ra định dạng Excel.</p>
        </div>
        <button
          onClick={handleExportOrders}
          disabled={loadingOrders}
          className="mt-4 bg-[#131829] hover:bg-black text-white font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 w-full cursor-pointer disabled:opacity-60"
        >
          {loadingOrders ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Tải xuống Excel (.csv)</span>
        </button>
      </div>

      {/* Box: Export Customers */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
          <Users className="w-8 h-8" />
        </div>
        <div>
          <h3 className="font-playfair font-bold text-lg text-primary">Hồ sơ Khách Hàng (CRM)</h3>
          <p className="text-xs text-secondary mt-1">Xuất danh sách khách hàng, bao gồm đối tác doanh nghiệp, đại lý và khách vãng lai.</p>
        </div>
        <button
          onClick={handleExportCustomers}
          disabled={loadingCustomers}
          className="mt-4 bg-[#131829] hover:bg-black text-white font-bold text-xs py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 w-full cursor-pointer disabled:opacity-60"
        >
          {loadingCustomers ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          <span>Tải xuống Excel (.csv)</span>
        </button>
      </div>

    </div>
  );
}
