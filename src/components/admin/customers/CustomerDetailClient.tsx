"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addCustomerNote } from "@/lib/actions/customer.actions";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatCurrency, formatDate, formatPhone } from "@/lib/utils/format";
import { ArrowLeft, User, Phone, Mail, Building, MapPin, Receipt, Inbox, MessageSquare, Plus, Loader2 } from "lucide-react";

interface CustomerDetailProps {
  customer: any;
}

export default function CustomerDetailClient({ customer }: CustomerDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"orders" | "inquiries" | "notes">("orders");
  const [notes, setNotes] = useState<any[]>(customer.notes || []);
  const [newNote, setNewNote] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    startTransition(async () => {
      const res = await addCustomerNote(customer.id, newNote);
      if (res.success && res.data) {
        setNotes((prev) => [res.data, ...prev]);
        setNewNote("");
      } else {
        alert(res.error || "Không thể lưu ghi chú chăm sóc.");
      }
    });
  };

  const hasCompany = !!customer.companyName;

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/customers")}
          className="p-2 rounded-2 hover:bg-subtle/10 text-secondary hover:text-primary transition-colors cursor-pointer border border-border/20 bg-canvas"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h2 className="font-playfair text-xl font-bold text-primary flex items-center gap-2">
            <span>Chi tiết khách hàng: {customer.name}</span>
            <StatusBadge status={customer.customerType} />
          </h2>
          <p className="text-xs text-secondary mt-0.5">
            Mã định danh CRM: #{customer.id.toUpperCase()} • Tham gia ngày {formatDate(customer.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Contact Card & Debt Summary */}
        <div className="space-y-6 lg:col-span-1">
          {/* Profile Card */}
          <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col gap-4">
            <h4 className="font-playfair text-sm font-bold text-primary uppercase tracking-wider border-b border-border/20 pb-2 mb-1">
              Hồ sơ liên hệ
            </h4>

            <div className="flex items-center gap-3 text-xs text-secondary">
              <Phone className="w-4 h-4 text-accent shrink-0" />
              <span className="font-mono text-primary font-bold">{formatPhone(customer.phone)}</span>
            </div>

            {customer.email && (
              <div className="flex items-center gap-3 text-xs text-secondary">
                <Mail className="w-4 h-4 text-accent shrink-0" />
                <span className="truncate">{customer.email}</span>
              </div>
            )}

            {hasCompany && (
              <div className="flex items-center gap-3 text-xs text-secondary">
                <Building className="w-4 h-4 text-accent shrink-0" />
                <span>{customer.companyName} {customer.taxCode ? `(MST: ${customer.taxCode})` : ""}</span>
              </div>
            )}

            {customer.address && (
              <div className="flex items-start gap-3 text-xs text-secondary">
                <MapPin className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                <span className="leading-relaxed">{customer.address}</span>
              </div>
            )}
          </div>

          {/* CRM Purchase Stats */}
          <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm space-y-4">
            <h4 className="font-playfair text-sm font-bold text-primary uppercase tracking-wider border-b border-border/20 pb-2 mb-1">
              Thống kê mua sỉ/lẻ
            </h4>
            <div className="space-y-3 text-xs">
              <div className="flex justify-between">
                <span className="text-secondary">Tổng mua sỉ tích lũy:</span>
                <span className="font-bold text-primary font-mono">{formatCurrency(customer.debtSummary?.totalPurchase || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Tiền nợ sỉ chưa thanh toán:</span>
                <span className={`font-bold font-mono ${customer.debtSummary?.outstandingDebt > 0 ? "text-rose-500 animate-pulse" : "text-emerald-600"}`}>
                  {formatCurrency(customer.debtSummary?.outstandingDebt || 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary">Số đơn đã mua:</span>
                <span className="font-bold text-primary">{customer.orders?.length || 0} hóa đơn</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right column: Tabs & Tables */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab buttons */}
          <div className="flex border-b border-border/40 bg-canvas p-1 rounded-2 border self-start">
            {[
              { id: "orders", label: "Lịch sử mua hàng", icon: Receipt },
              { id: "inquiries", label: "Đơn tư vấn sỉ", icon: Inbox },
              { id: "notes", label: "Nhật ký chăm sóc (CRM)", icon: MessageSquare },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-1.5 text-xs font-bold transition-all cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-[#FAF7F2] text-accent border border-border/20 shadow-xs"
                      : "text-secondary hover:text-primary"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Orders History Tab */}
          {activeTab === "orders" && (
            <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm overflow-x-auto">
              {customer.orders?.length === 0 ? (
                <div className="text-center py-12 text-secondary text-xs">Không tìm thấy giao dịch nào.</div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border/40 bg-[#FAF7F2] text-secondary text-[10px] uppercase font-bold">
                      <th className="py-3 px-4">Mã Đơn</th>
                      <th className="py-3 px-4">Ngày đặt</th>
                      <th className="py-3 px-4">Giá trị</th>
                      <th className="py-3 px-4">Vận chuyển</th>
                      <th className="py-3 px-4">Thanh toán</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {customer.orders.map((ord: any) => (
                      <tr key={ord.id} className="hover:bg-subtle/5">
                        <td className="py-3 px-4 font-mono font-bold">#{ord.id.slice(-8).toUpperCase()}</td>
                        <td className="py-3 px-4">{formatDate(ord.createdAt)}</td>
                        <td className="py-3 px-4 font-bold text-orange-600">{formatCurrency(ord.totalAmount)}</td>
                        <td className="py-3 px-4"><StatusBadge status={ord.status} /></td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${ord.paymentStatus ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-500 border border-rose-100"}`}>
                            {ord.paymentStatus ? "Đã trả" : "Nợ lại"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* Inquiries History Tab */}
          {activeTab === "inquiries" && (
            <div className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm overflow-x-auto">
              {customer.inquiries?.length === 0 ? (
                <div className="text-center py-12 text-secondary text-xs">Chưa có yêu cầu tư vấn sỉ nào được ghi nhận.</div>
              ) : (
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead>
                    <tr className="border-b border-border/40 bg-[#FAF7F2] text-secondary text-[10px] uppercase font-bold">
                      <th className="py-3 px-4">Mã đơn tư vấn</th>
                      <th className="py-3 px-4">Ngày gửi</th>
                      <th className="py-3 px-4">Số lượng cốc</th>
                      <th className="py-3 px-4">Ghi chú</th>
                      <th className="py-3 px-4">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20">
                    {customer.inquiries.map((inq: any) => (
                      <tr key={inq.id} className="hover:bg-subtle/5">
                        <td className="py-3 px-4 font-mono font-bold">#{inq.id.slice(-8).toUpperCase()}</td>
                        <td className="py-3 px-4">{formatDate(inq.createdAt)}</td>
                        <td className="py-3 px-4 font-bold text-primary">{inq.quantity} cốc</td>
                        <td className="py-3 px-4 truncate max-w-xs">{inq.note || "---"}</td>
                        <td className="py-3 px-4"><StatusBadge status={inq.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* CRM Care Notes Tab */}
          {activeTab === "notes" && (
            <div className="space-y-6">
              {/* Note Logging Form */}
              <form onSubmit={handleAddNote} className="bg-canvas border border-border/40 rounded-3 p-6 shadow-sm flex flex-col gap-3">
                <h5 className="font-bold text-xs text-primary uppercase tracking-wider block">Ghi lại nhật ký chăm sóc đối tác</h5>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Ghi nhận phản hồi của khách, chiết khấu đã thương thảo hoặc tiến trình giao dịch..."
                  rows={3}
                  className="w-full text-xs bg-[#FAF7F2] border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
                <button
                  type="submit"
                  disabled={isPending || !newNote.trim()}
                  className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2 px-4 rounded-2 transition-all flex items-center justify-center gap-1.5 self-end cursor-pointer shadow-sm disabled:opacity-60"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                  <span>Ghi nhận Care Note</span>
                </button>
              </form>

              {/* Timeline list of notes */}
              <div className="space-y-4">
                {notes.length === 0 ? (
                  <div className="text-center py-6 text-secondary text-xs">Chưa có nhật ký chăm sóc nào. Hãy bắt đầu ghi chép note chăm sóc đối tác ở trên.</div>
                ) : (
                  notes.map((note: any) => (
                    <div key={note.id} className="bg-canvas border border-border/40 rounded-3 p-5 shadow-xs flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-border/20 pb-2">
                        <span className="text-[10px] font-bold text-accent">CRM Note</span>
                        <span className="text-[9px] font-bold text-secondary font-mono">{new Date(note.createdAt).toLocaleString("vi-VN")}</span>
                      </div>
                      <p className="text-xs text-primary leading-relaxed whitespace-pre-line">{note.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
