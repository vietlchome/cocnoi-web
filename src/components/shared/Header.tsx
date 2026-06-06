import React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SettingsService } from "@/lib/services/settings.service";
import type { SiteConfig } from "@/lib/site-config-validate";
import HeaderClient from "./HeaderClient";

interface HeaderProps {
  config: SiteConfig;
}

export default async function Header({ config }: HeaderProps) {
  const headerShowTopBar = config.header.showTopBar;
  const headerTopBarText = config.header.topBarText || "Miễn phí vận chuyển toàn quốc cho đơn hàng trên 1.000.000 đ";
  const headerTopBarLink = config.header.topBarLink || "";

  // 1. Doc menu dieu huong dong tu settings database
  let navLinks: Array<{ title: string; link: string; active?: boolean }> = [];
  try {
    const menuSetting = await SettingsService.getValue("menu_items");
    navLinks = menuSetting ? JSON.parse(menuSetting).filter((item: any) => item.active !== false) : [];
  } catch (e) {
    navLinks = [];
  }

  // Fallback menu neu chua co thiet lap
  if (navLinks.length === 0) {
    navLinks = [
      { title: "SHOP", link: "/shop" },
      { title: "KHÁM PHÁ", link: "/discover" },
      { title: "CỘNG ĐỒNG", link: "/community/nguoi-noi" },
      { title: "ĐỐI TÁC", link: "/partners" },
      { title: "HÀNH TRÌNH", link: "/journal" },
    ];
  }

  // 2. Doc danh sach cac bo suu tap (ProductGroup) tu DB
  let dbCollections: string[] = [];
  try {
    const groups = await prisma.productGroup.findMany({
      select: { name: true }
    });
    dbCollections = groups.map((g: any) => g.name);
  } catch (e) {
    console.error("Loi khi lay collections tu DB cho Header:", e);
  }

  return (
    <div className="w-full flex flex-col z-50 relative">
      {/* 1. TOP BAR TINH */}
      {headerShowTopBar && (
        <div 
          style={{ backgroundColor: "var(--color-terracotta)" }}
          className="w-full text-center text-canvas py-2 px-4 text-[10px] md:text-xs font-bold font-bvp select-none truncate"
        >
          {headerTopBarLink ? (
            <Link href={headerTopBarLink} className="hover:underline text-canvas">
              {headerTopBarText}
            </Link>
          ) : (
            headerTopBarText
          )}
        </div>
      )}

      {/* 2. CHUA CAC THANG PHAN CO TRANG THAI CLIENT */}
      <HeaderClient config={config} navLinks={navLinks} dbCollections={dbCollections} />
    </div>
  );
}
