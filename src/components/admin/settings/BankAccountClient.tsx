"use client";

import { useState } from "react";
import { setThemeSetting } from "@/lib/actions/content.actions";
import { FormField } from "@/components/ui/FormField";
import { Save, Building2, CreditCard, User, Loader2 } from "lucide-react";

interface BankAccountClientProps {
  initialSettings: Record<string, any>;
}

export default function BankAccountClient({ initialSettings }: BankAccountClientProps) {
  const [loading, setLoading] = useState(false);

  // Form states
  const [bankName, setBankName] = useState(initialSettings.bank_name || "");
  const [bankAccount, setBankAccount] = useState(initialSettings.bank_account || "");
  const [bankOwner, setBankOwner] = useState(initialSettings.bank_owner || "");
  const [bankBranch, setBankBranch] = useState(initialSettings.bank_branch || "");

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [
        { key: "bank_name", value: bankName },
        { key: "bank_account", value: bankAccount },
        { key: "bank_owner", value: bankOwner },
        { key: "bank_branch", value: bankBranch },
      ];

      // Upsert parallelly
      await Promise.all(updates.map((up) => setThemeSetting(up.key, up.value)));

      alert("Lưu thông tin ngân hàng thành công! Thông tin này sẽ được in trên báo giá và hóa đơn B2B.");
    } catch (err: any) {
      alert(err.message || "Lỗi lưu cấu hình ngân hàng.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas border border-border/40 rounded-3 p-6 md:p-8 max-w-3xl shadow-sm">
      <div className="flex flex-col gap-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField label="Tên Ngân hàng (Ví dụ: Vietcombank)">
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/50" />
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Ngân hàng TMCP Ngoại Thương Việt Nam"
                className="w-full text-xs bg-white border border-border/40 pl-10 pr-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </div>
          </FormField>

          <FormField label="Chi nhánh">
            <input
              type="text"
              value={bankBranch}
              onChange={(e) => setBankBranch(e.target.value)}
              placeholder="Chi nhánh Hà Nội"
              className="w-full text-xs bg-white border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </FormField>
        </div>

        <FormField label="Số tài khoản">
          <div className="relative">
            <CreditCard className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/50" />
            <input
              type="text"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              placeholder="00110022334455"
              className="w-full text-sm font-bold tracking-widest text-primary bg-white border border-border/40 pl-10 pr-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
        </FormField>

        <FormField label="Chủ tài khoản">
          <div className="relative">
            <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-secondary/50" />
            <input
              type="text"
              value={bankOwner}
              onChange={(e) => setBankOwner(e.target.value)}
              placeholder="NGUYEN VAN A"
              className="w-full text-xs font-semibold uppercase bg-white border border-border/40 pl-10 pr-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>
        </FormField>

        <div className="border-t border-border/20 pt-6 mt-2 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-3 px-6 rounded-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu tài khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
}
