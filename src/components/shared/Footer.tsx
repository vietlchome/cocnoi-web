"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  const [themeConfig, setThemeConfig] = useState<any>(null);
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
            setThemeConfig(data.config);
          }
        }
      } catch (e) {
        console.error("Lỗi khi nạp cấu hình Footer:", e);
      }
    };
    fetchFooterSettings();
  }, []);

  // Các cấu hình từ SiteConfig
  const footerLogoUrl = themeConfig?.header?.logoUrl || "";
  const footerLogoText = themeConfig?.header?.logoText || "CỐC NỐI";
  const footerAddress = themeConfig?.contact?.address || themeConfig?.footer?.address || "Xưởng gốm Cốc Nối, Bát Tràng, Gia Lâm, Hà Nội";
  const footerPhone = themeConfig?.contact?.phone || themeConfig?.footer?.phone || "+84 (0) 98 765 4321";
  const footerEmail = themeConfig?.contact?.email || themeConfig?.footer?.email || "hello@cocnoi.com";
  const footerNewsletterTitle = themeConfig?.footer?.newsletterTitle || "Hộp tin Cốc Nối";
  const footerNewsletterDesc = themeConfig?.footer?.newsletterDesc || "Đăng ký để nhận câu chuyện mới về 'Người Nối' và ưu đãi sớm nhất của các bộ sưu tập.";
  const footerCopyright = themeConfig?.footer?.copyright || "CỐC NỐI. Bảo lưu mọi quyền.";
  const footerLegal = themeConfig?.footer?.legal || {};

  return (
    <footer className="bg-subtle text-primary border-t border-border mt-auto">
      
      {/* Primary Footer Content */}
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-16 md:py-24 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
        
        {/* Brand Summary */}
        <div className="lg:col-span-2 flex flex-col gap-6 pr-0 lg:pr-8">
          <Link href="/" className="flex items-center gap-3 group">
            {footerLogoUrl ? (
              <img 
                src={footerLogoUrl} 
                alt={footerLogoText} 
                className="h-10 max-h-12 w-auto object-contain"
              />
            ) : (
              <>
                <div 
                  style={{ backgroundColor: "var(--color-deep-indigo)" }}
                  className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-canvas"
                >
                  <svg viewBox="0 0 300 300" className="w-5.5 h-5.5 fill-current">
                    <path d="M198.5,143.2c1.6,2.6,3,4.6,4.1,6.8c6.5,12.8,2.1,26.5-10.7,33.1c-3.9,2-7.9,3.8-11.9,5.6c-5.9,2.6-6.9,7.1-2.8,11.9c4.6,5.4,15,7.1,20.5,2.7c4.6-3.7,8.8-8.2,12.6-12.8c8.2-10,14.6-20.8,14.4-34.4c-0.3-15.7-7.5-28.1-18.7-38.3c-12.2-11.1-26.2-18.5-43.2-17.2c-20.6,1.5-32.6,14.7-40.9,32c-3.8,8-6.3,16.4-3,25.5c1.4,3.8,3.5,6.3,7.5,6.4c4.7,0.1,6.2-3.3,7.1-7.3c1.4-5.9,2.5-11.8,4.2-17.5c3.6-11.4,12.3-17.6,24.4-16.9C177.8,123.7,188.9,132.8,198.5,143.2z" className="fill-canvas" />
                    <path d="M94.4,68.8c15.3-16,35.4-18.8,56.1-18.3c20.6,0.5,39.8,6.4,56.6,18.9c9.4,7,18.9,13.9,25.7,23.8c13.7,20.1,20.1,41.8,15.9,66.5c-3.2,18.6-8.2,36.4-19.1,51.8c-13.5,19-32,31.5-55.2,35.7c-26.5,4.8-52.2,2.8-76.4-10.4c-10.7-5.8-19.2-13.9-25-24.7c-1-1.9-2.2-3.6-3.5-5.3c-23.8-30.5-24.2-63.2-10-97.7C66.7,91.7,77.8,78.1,94.4,68.8z M94.3,102.7c-19.6,13.2-25.6,35.1-16.9,56.2c4.2,10.2,10.6,19.2,19,26.3c15.7,13.3,33.2,17.9,52.5,8.7c10.4-4.9,19.1-12.3,26.6-21.1c4.8-5.7,4.6-15-0.3-20.8c-4.8-5.6-10.3-5-13.4,1.7c-1,2.2-1.8,4.5-2.8,6.8c-8.3,19.8-24.7,24.7-42,12c-9-6.6-15.5-15.5-19.3-26c-6.4-18,0.8-31.1,19.2-36.1c4.9-1.3,10-1.9,14.6-3.8c2.3-0.9,4.8-3.8,5.1-6c0.3-2.1-1.8-5.8-3.7-6.5c-4.4-1.6-9.5-2.7-14.1-2.3C109.6,92.9,101.2,96.9,94.3,102.7z" className="fill-canvas opacity-35" />
                  </svg>
                </div>
                <span className="font-playfair text-lg font-semibold tracking-wider text-primary group-hover:text-accent transition-colors" style={{ color: "var(--color-deep-indigo)" }}>
                  {footerLogoText}
                </span>
              </>
            )}
          </Link>
          <p className="font-bvp text-sm text-secondary leading-relaxed max-w-sm" style={{ color: "var(--color-dark-brown)" }}>
            Mỗi chiếc cốc là một câu chuyện đang chờ được kể. Khởi nguồn từ xưởng gia đình năm 1994, Cốc Nối mang đến những sản phẩm chứa đựng sự chân thành và tinh thần kết nối Việt Nam.
          </p>
          <div className="flex flex-col gap-3 font-bvp text-xs md:text-sm text-secondary" style={{ color: "var(--color-dark-brown)" }}>
            <span className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-accent shrink-0" style={{ color: "var(--color-terracotta)" }} />
              <span>{footerAddress}</span>
            </span>
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-accent shrink-0" style={{ color: "var(--color-terracotta)" }} />
              <span>{footerPhone}</span>
            </span>
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-accent shrink-0" style={{ color: "var(--color-terracotta)" }} />
              <span>{footerEmail}</span>
            </span>
          </div>

          {/* Social Links */}
          {themeConfig?.social?.links && themeConfig.social.links.length > 0 && (
            <div className="flex items-center gap-3 mt-4">
              {themeConfig.social.links
                .filter((link: any) => link.visible && link.url)
                .map((link: any, idx: number) => {
                  const getSocialIcon = (platform: string) => {
                    switch (platform) {
                      case "facebook":
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                          </svg>
                        );
                      case "instagram":
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                          </svg>
                        );
                      case "youtube":
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M23.498 6.163a3.003 3.003 0 00-2.11-2.108C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.51C1.04 4.545.54 5.545.54 6.163c-.54 1.871-.54 5.776-.54 5.776s0 3.905.54 5.776c.25 1.871.75 2.107 2.11 2.107 1.871.51 9.388.51 9.388.51s7.517 0 9.388-.51c1.36-.25 1.86-1.236 2.11-2.107.54-1.871.54-5.776.54-5.776s0-3.905-.54-5.776zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                          </svg>
                        );
                      case "zalo":
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M21.547 12.016c0-4.32-3.805-7.838-8.496-7.838-4.693 0-8.498 3.518-8.498 7.838 0 4.045 3.321 7.371 7.64 7.801l.836 2.399c.095.27.424.331.62.115l3.228-3.504a8.91 8.91 0 0 0 4.67-6.811z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M8.5 12h7M8.5 9h7M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        );
                      case "tiktok": 
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.74-3.99-1.72-.08-.07-.17-.17-.3-.27v7.44c-.01 1.98-.49 4.01-1.76 5.51-1.37 1.67-3.5 2.63-5.7 2.63-3.07-.05-5.97-1.84-7.14-4.7-1.31-3.19-.55-7.15 1.97-9.44 1.73-1.57 4.19-2.22 6.47-1.73v4.15c-1.37-.41-2.91-.12-3.99.78-1.04.88-1.43 2.4-.94 3.69.46 1.25 1.77 2.13 3.12 2.1 1.63-.03 2.92-1.39 2.91-3.03l-.02-11.4c-.01-.73-.01-1.45-.02-2.18z"/>
                          </svg>
                        );
                      case "shopee": 
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2c5.522 0 10 4.477 10 10s-4.478 10-10 10S2 17.523 2 12 6.478 2 12 2zm1.25 4.5h-2.5v1.25H9.5v5.5a1.25 1.25 0 001.25 1.25h2.5a1.25 1.25 0 001.25-1.25v-5.5h-1.25V6.5zm-1.25 2.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zm0 3.75c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25 1.25-.56 1.25-1.25-.56-1.25-1.25-1.25z"/>
                          </svg>
                        );
                      case "lazada": 
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2L2 22h20L12 2zm0 3.78L18.42 18H5.58L12 5.78z" />
                          </svg>
                        );
                      case "threads":
                        return (
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.78 12.18c-.46.77-1.12 1.34-1.91 1.66-.79.32-1.66.47-2.53.44-1.07-.03-2.07-.36-2.91-.97-.84-.61-1.43-1.46-1.72-2.45-.14-.49-.21-1-.21-1.51s.07-1.02.21-1.51c.29-.99.88-1.84 1.72-2.45.84-.61 1.84-.94 2.91-.97.87-.03 1.74.12 2.53.44.79.32 1.45.89 1.91 1.66.36.61.54 1.29.53 1.97 0 .84-.28 1.61-.79 2.22-.51.61-1.22 1.01-2.02 1.13-.5.08-1.01.03-1.48-.15-.47-.18-.87-.49-1.15-.9-.12-.18-.21-.39-.27-.61h-.04c-.11.45-.33.85-.64 1.17-.31.32-.7.54-1.14.65-.63.15-1.29.07-1.87-.23-.58-.3-1.03-.79-1.28-1.4-.21-.51-.31-1.06-.3-1.61 0-1.03.35-1.97.97-2.73.62-.76 1.49-1.24 2.45-1.37.52-.07 1.05-.02 1.54.16.49.18.91.5 1.2 1.1h.04v-.92h1.43v5.6c0 .4.1.78.29 1.11.19.33.47.59.81.74.43.19.91.24 1.37.15.46-.09.87-.33 1.16-.69.3-.37.46-.83.45-1.3 0-1.13-.4-2.18-1.12-2.96-.72-.78-1.72-1.26-2.79-1.36-.61-.06-1.23-.01-1.82.17-.59.18-1.12.5-1.55.93-.57.57-.96 1.29-1.12 2.08-.13.63-.16 1.28-.08 1.92.15.82.52 1.57 1.07 2.17.55.6 1.25 1.03 2.03 1.24.62.17 1.27.23 1.91.17.64-.06 1.26-.24 1.82-.54l.67 1.28c-.73.39-1.54.63-2.37.71-.83.08-1.67 0-2.48-.22-1.03-.28-1.95-.85-2.68-1.65-.73-.8-1.22-1.8-1.41-2.89-.11-.64-.12-1.29-.03-1.93s.27-1.26.54-1.84c.36-1.06 1.01-2 1.88-2.72.87-.72 1.93-1.17 3.06-1.31.79-.1 1.59-.08 2.37.07.78.15 1.51.48 2.13.97.87.69 1.51 1.63 1.83 2.7.25.82.35 1.68.3 2.53-.02.94-.27 1.85-.73 2.65z"/>
                          </svg>
                        );
                      default:
                        return (
                          <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        );
                    }
                  };

                  return (
                    <a
                      key={idx}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-canvas border border-border flex items-center justify-center text-secondary hover:text-accent hover:border-accent hover:scale-105 transition-all shadow-xs"
                      title={link.platform}
                    >
                      {getSocialIcon(link.platform)}
                    </a>
                  );
                })}
            </div>
          )}
        </div>

        {/* Columns of links */}
        <div className="flex flex-col gap-5">
          <h4 className="font-playfair text-sm font-bold tracking-wider uppercase text-secondary">
            Mua sắm
          </h4>
          <ul className="flex flex-col gap-3 font-bvp text-sm text-secondary" style={{ color: "var(--color-dark-brown)" }}>
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
          <ul className="flex flex-col gap-3 font-bvp text-sm text-secondary" style={{ color: "var(--color-dark-brown)" }}>
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
            {footerNewsletterTitle}
          </h4>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed" style={{ color: "var(--color-dark-brown)" }}>
            {footerNewsletterDesc}
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
          )}
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="bg-canvas border-t border-border py-8">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 font-bvp text-xs text-secondary">
          <div className="flex flex-col gap-2">
            <span>
              &copy; {new Date().getFullYear()} {footerCopyright}
            </span>
            {(footerLegal.businessName || footerLegal.taxId || footerLegal.businessLicense || footerLegal.licensedBy || footerLegal.licensedDate || footerLegal.hours) && (
              <div className="flex flex-col gap-1 text-[11px] text-secondary/80 mt-1">
                {footerLegal.businessName && (
                  <span>
                    {footerLegal.businessName} {footerLegal.taxId ? `— MST: ${footerLegal.taxId}` : ""}
                  </span>
                )}
                {footerLegal.businessLicense && (
                  <span>
                    GCN ĐKKD: {footerLegal.businessLicense}
                    {footerLegal.licensedBy ? ` do ${footerLegal.licensedBy}` : ""}
                    {footerLegal.licensedDate ? ` cấp ngày ${footerLegal.licensedDate}` : ""}
                  </span>
                )}
                {footerLegal.hours && (
                  <span>
                    Giờ hoạt động: {footerLegal.hours}
                  </span>
                )}
              </div>
            )}
          </div>
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
