"use client";

import React, { useState } from "react";
import { ArrowRight } from "lucide-react";

export default function FooterNewsletterForm() {
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  if (subscribed) {
    return (
      <div className="bg-[#FAF8F5] border border-accent/40 rounded-2 p-4 text-xs font-bvp text-accent animate-fade-in leading-relaxed">
        <strong>Đăng ký thành công!</strong> Cốc Nối sẽ gửi những câu chuyện sớm nhất và ưu đãi đặc quyền đến hòm thư của bạn. 🌾
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex flex-col gap-2.5">
      <div className="relative">
        <input 
          type="email" 
          placeholder="Email của bạn..." 
          className="w-full font-bvp text-xs bg-canvas border border-border px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent transition-colors"
          required
        />
        <button 
          type="submit"
          style={{ backgroundColor: "var(--color-deep-indigo)" }}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-canvas p-1.5 rounded-1 hover:opacity-90 transition-colors"
          title="Đăng ký"
        >
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <span className="font-bvp text-[11px] text-secondary/60">
        Không spam. Hủy đăng ký bất cứ lúc nào.
      </span>
    </form>
  );
}
