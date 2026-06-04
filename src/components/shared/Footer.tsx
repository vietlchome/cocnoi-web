"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [subscribed, setSubscribed] = useState(false);
  
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribed(true);
  };

  useEffect(() => {
    const fetchFooterSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSettings(data.settings);
          }
        }
      } catch (e) {
        console.error("Lỗi khi nạp cấu hình Footer:", e);
      }
    };
    fetchFooterSettings();
  }, []);

  const getSetting = (key: string, fallback: string) => {
    return settings[key] || fallback;
  };

  return (
    <footer className="bg-subtle text-primary border-t border-border mt-auto" style={{ backgroundColor: getSetting("bg_color", "#FEFCF9") === "#FEFCF9" ? undefined : getSetting("bg_color", "#FEFCF9") }}>
      
      {/* Primary Footer Content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
        
        {/* Brand Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6 pr-0 lg:pr-8">
          <Link href="/" className="flex items-center gap-3 group">
            {getSetting("logo_image_url", "") ? (
              <img 
                src={getSetting("logo_image_url", "")} 
                alt={getSetting("logo_text", "Cốc Nối")} 
                className="h-10 max-h-12 w-auto object-contain"
              />
            ) : (
              <>
                <div 
                  style={{ backgroundColor: getSetting("primary_color", "#131829") }}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-canvas"
                >
                  <svg viewBox="0 0 300 300" className="w-5.5 h-5.5 fill-current">
                    <path d="M198.5,143.2c1.6,2.6,3,4.6,4.1,6.8c6.5,12.8,2.1,26.5-10.7,33.1c-3.9,2-7.9,3.8-11.9,5.6c-5.9,2.6-6.9,7.1-2.8,11.9c4.6,5.4,15,7.1,20.5,2.7c4.6-3.7,8.8-8.2,12.6-12.8c8.2-10,14.6-20.8,14.4-34.4c-0.3-15.7-7.5-28.1-18.7-38.3c-12.2-11.1-26.2-18.5-43.2-17.2c-20.6,1.5-32.6,14.7-40.9,32c-3.8,8-6.3,16.4-3,25.5c1.4,3.8,3.5,6.3,7.5,6.4c4.7,0.1,6.2-3.3,7.1-7.3c1.4-5.9,2.5-11.8,4.2-17.5c3.6-11.4,12.3-17.6,24.4-16.9C177.8,123.7,188.9,132.8,198.5,143.2z" className="fill-canvas" />
                    <path d="M94.4,68.8c15.3-16,35.4-18.8,56.1-18.3c20.6,0.5,39.8,6.4,56.6,18.9c9.4,7,18.9,13.9,25.7,23.8c13.7,20.1,20.1,41.8,15.9,66.5c-3.2,18.6-8.2,36.4-19.1,51.8c-13.5,19-32,31.5-55.2,35.7c-26.5,4.8-52.2,2.8-76.4-10.4c-10.7-5.8-19.2-13.9-25-24.7c-1-1.9-2.2-3.6-3.5-5.3c-23.8-30.5-24.2-63.2-10-97.7C66.7,91.7,77.8,78.1,94.4,68.8z M94.3,102.7c-19.6,13.2-25.6,35.1-16.9,56.2c4.2,10.2,10.6,19.2,19,26.3c15.7,13.3,33.2,17.9,52.5,8.7c10.4-4.9,19.1-12.3,26.6-21.1c4.8-5.7,4.6-15-0.3-20.8c-4.8-5.6-10.3-5-13.4,1.7c-1,2.2-1.8,4.5-2.8,6.8c-8.3,19.8-24.7,24.7-42,12c-9-6.6-15.5-15.5-19.3-26c-6.4-18,0.8-31.1,19.2-36.1c4.9-1.3,10-1.9,14.6-3.8c2.3-0.9,4.8-3.8,5.1-6c0.3-2.1-1.8-5.8-3.7-6.5c-4.4-1.6-9.5-2.7-14.1-2.3C109.6,92.9,101.2,96.9,94.3,102.7z" className="fill-canvas opacity-35" />
                  </svg>
                </div>
                <span className="font-playfair text-lg font-semibold tracking-wider text-primary group-hover:text-accent transition-colors" style={{ color: getSetting("primary_color", "#131829") }}>
                  {getSetting("logo_text", "CỐC NỐI")}
                </span>
              </>
            )}
          </Link>
          <p className="font-bvp text-sm text-secondary leading-relaxed max-w-sm" style={{ color: getSetting("secondary_color", "#6B7280") }}>
            Mỗi chiếc cốc là một câu chuyện đang chờ được kể. Khởi nguồn từ xưởng gia đình năm 1994, Cốc Nối mang đến những sản phẩm chứa đựng sự chân thành và tinh thần kết nối Việt Nam.
          </p>
          <div className="flex flex-col gap-3 font-bvp text-xs md:text-sm text-secondary" style={{ color: getSetting("secondary_color", "#6B7280") }}>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent shrink-0" style={{ color: getSetting("accent_color", "#C2703E") }} />
              <span>{getSetting("contact_address", getSetting("footer_address", "Xưởng gốm Cốc Nối, Bát Tràng, Gia Lâm, Hà Nội"))}</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent shrink-0" style={{ color: getSetting("accent_color", "#C2703E") }} />
              <span>{getSetting("contact_phone", getSetting("footer_phone", "+84 (0) 98 765 4321"))}</span>
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent shrink-0" style={{ color: getSetting("accent_color", "#C2703E") }} />
              <span>{getSetting("contact_email", getSetting("footer_email", "hello@cocnoi.com"))}</span>
            </span>
          </div>
        </div>

        {/* Columns of links */}
        <div className="flex flex-col gap-5">
          <h4 className="font-playfair text-sm font-bold tracking-wider uppercase text-secondary">
            Mua sắm
          </h4>
          <ul className="flex flex-col gap-3 font-bvp text-sm text-secondary" style={{ color: getSetting("secondary_color", "#6B7280") }}>
            <li>
              <Link href="/shop?category=Mugs" className="hover:text-accent transition-colors">Cốc có quai (Mugs)</Link>
            </li>
            <li>
              <Link href="/shop?category=Beakers" className="hover:text-accent transition-colors">Cốc không quai (Beakers)</Link>
            </li>
            <li>
              <Link href="/shop?category=Limited" className="hover:text-accent transition-colors">BST Giới hạn</Link>
            </li>
            <li>
              <Link href="/shop" className="hover:text-accent transition-colors">Tất cả sản phẩm</Link>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-5">
          <h4 className="font-playfair text-sm font-bold tracking-wider uppercase text-secondary">
            Khám phá
          </h4>
          <ul className="flex flex-col gap-3 font-bvp text-sm text-secondary" style={{ color: getSetting("secondary_color", "#6B7280") }}>
            <li>
              <Link href="/discover#story" className="hover:text-accent transition-colors">Câu chuyện thương hiệu</Link>
            </li>
            <li>
              <Link href="/nguoi-noi" className="hover:text-accent transition-colors">Chiến dịch Người Nối</Link>
            </li>
            <li>
              <Link href="/discover#process" className="hover:text-accent transition-colors">Quy trình sản xuất</Link>
            </li>
            <li>
              <Link href="/journal" className="hover:text-accent transition-colors">Hành trình & Blog</Link>
            </li>
          </ul>
        </div>

        {/* Newsletter column */}
        <div className="flex flex-col gap-5">
          <h4 className="font-playfair text-sm font-bold tracking-wider uppercase text-secondary">
            {getSetting("footer_newsletter_title", "Hộp tin Cốc Nối")}
          </h4>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed" style={{ color: getSetting("secondary_color", "#6B7280") }}>
            {getSetting("footer_newsletter_desc", "Đăng ký để nhận câu chuyện mới về 'Người Nối' và ưu đãi sớm nhất của các bộ sưu tập.")}
          </p>
          {subscribed ? (
            <div className="bg-[#FAF8F5] border border-accent/40 rounded-2 p-4 text-xs font-bvp text-accent animate-fade-in leading-relaxed">
              <strong>Đăng ký thành công!</strong> Cốc Nối sẽ gửi những câu chuyện sớm nhất và ưu đãi đặc quyền đến hòm thư của bạn. 🌾
            </div>
          ) : (
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
                  style={{ backgroundColor: getSetting("primary_color", "#131829") }}
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
          )}
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="bg-canvas border-t border-border py-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-bvp text-xs text-secondary">
          <span>
            &copy; {new Date().getFullYear()} CỐC NỐI. Bảo lưu mọi quyền.
          </span>
          <div className="flex gap-6">
            <Link href="/terms" className="hover:text-accent transition-colors">Điều khoản dịch vụ</Link>
            <Link href="/privacy" className="hover:text-accent transition-colors">Chính sách bảo mật</Link>
            <Link href="/faq" className="hover:text-accent transition-colors">Câu hỏi thường gặp</Link>
          </div>
        </div>
      </div>

    </footer>
  );
}
