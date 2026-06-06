"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";

export default function FloatingActions() {
  const [themeConfig, setThemeConfig] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setThemeConfig(data.config);
          }
        }
      } catch (e) {
        console.error("Lỗi khi nạp cấu hình FloatingActions:", e);
      }
    };
    fetchSettings();
  }, []);

  const links = themeConfig?.social?.links;
  const getPlatformUrl = (platform: string, fallback: string) => {
    if (!themeConfig) return fallback;
    const item = links?.find((l: any) => l.platform === platform);
    return item && item.visible ? (item.url || "") : "";
  };

  const socialInstagram = getPlatformUrl("instagram", "https://instagram.com/");
  const socialFacebook = getPlatformUrl("facebook", "https://facebook.com/");
  const socialZalo = getPlatformUrl("zalo", "https://zalo.me/");

  return (
    <div className="fixed right-4 bottom-24 md:bottom-32 z-50 flex flex-col gap-3">
      
      {/* Instagram */}
      {socialInstagram !== "" && (
        <a
          href={socialInstagram}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-11 md:h-11 bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] hover:opacity-90 text-white flex flex-col items-center justify-center rounded-full shadow-md transition-all hover:-translate-x-1"
          title="Instagram"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
        </a>
      )}
      
      {/* Facebook */}
      {socialFacebook !== "" && (
        <a
          href={socialFacebook}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-11 md:h-11 bg-[#1877F2] hover:bg-[#166fe5] text-white flex flex-col items-center justify-center rounded-full shadow-md transition-all hover:-translate-x-1"
          title="Facebook"
        >
          <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
        </a>
      )}

      {/* Zalo */}
      {socialZalo !== "" && (
        <a
          href={socialZalo}
          target="_blank"
          rel="noopener noreferrer"
          className="w-10 h-10 md:w-11 md:h-11 bg-[#0068FF] hover:bg-[#005ce6] text-white flex flex-col items-center justify-center rounded-full shadow-md transition-all hover:-translate-x-1"
          title="Zalo"
        >
          <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
            <path d="M21.547 12.016c0-4.32-3.805-7.838-8.496-7.838-4.693 0-8.498 3.518-8.498 7.838 0 4.045 3.321 7.371 7.64 7.801l.836 2.399c.095.27.424.331.62.115l3.228-3.504a8.91 8.91 0 0 0 4.67-6.811z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M8.5 12h7M8.5 9h7M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </a>
      )}

      {/* Đơn hàng */}
      <Link
        href="/don-hang"
        style={{ backgroundColor: "var(--color-terracotta)" }}
        className="w-10 h-10 md:w-11 md:h-11 hover:opacity-90 text-white flex flex-col items-center justify-center rounded-full shadow-md transition-all hover:-translate-x-1"
        title="Tra cứu Đơn hàng"
      >
        <PackageSearch className="w-5 h-5" />
      </Link>
    </div>
  );
}
