"use client";

import React, { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { createInquiry } from "@/lib/actions/inquiry.actions";
import { parseError, type FriendlyError } from "@/lib/utils/error-messages";
import FormErrorAlert from "@/components/shared/FormErrorAlert";

export default function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);
  
  const handleSubscribe = async (e: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await createInquiry({
        customerName: "Đăng ký nhận tin",
        phone: "00000000",
        email: email.trim(),
        companyName: null,
        productId: null,
        quantity: 1,
        note: "Đăng ký nhận tin từ chân trang website",
        source: "Newsletter Subscription",
      });

      if (response.success) {
        setSubscribed(true);
      } else {
        setError({
          category: "unknown",
          message: response.error || "Gặp sự cố khi đăng ký nhận tin.",
          showRetryButton: true,
          showReloadButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (subscribed) {
    return (
      <div className="bg-[#FAF8F5] border border-accent/40 rounded-2 p-4 text-xs font-bvp text-accent animate-fade-in leading-relaxed">
        <strong>Đăng ký thành công!</strong> Cốc Nối sẽ gửi những câu chuyện sớm nhất và ưu đãi đặc quyền đến hòm thư của bạn. 🌾
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 w-full">
      <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
        <div className="relative">
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email của bạn..." 
            className="w-full font-bvp text-xs bg-canvas border border-border px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent transition-colors disabled:opacity-50"
            required
            disabled={loading}
          />
          <button 
            type="submit"
            style={{ backgroundColor: "var(--color-deep-indigo)" }}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-canvas p-1.5 rounded-1 hover:opacity-90 transition-colors disabled:opacity-50 flex items-center justify-center cursor-pointer"
            title="Đăng ký"
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <ArrowRight className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
        <span className="font-bvp text-[11px] text-secondary/60">
          Không spam. Hủy đăng ký bất cứ lúc nào.
        </span>
      </form>
      {error && (
        <div className="mt-1">
          <FormErrorAlert error={error} onRetry={() => handleSubscribe(null as any)} />
        </div>
      )}
    </div>
  );
}
