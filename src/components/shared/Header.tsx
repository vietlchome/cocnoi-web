import React from "react";
import { prisma } from "@/lib/prisma";
import type { SiteConfig } from "@/lib/site-config-validate";
import HeaderClient from "./HeaderClient";
import { MegaMenu } from "../store/MegaMenu";
import { unstable_cache } from "next/cache";

interface HeaderProps {
  config: SiteConfig;
}

// Reuse or match the same cache tag/key as MegaMenu for consistency
const getCachedHeaderData = unstable_cache(
  async () => {
    try {
      const [categories, productGroups, finishes] = await Promise.all([
        prisma.category.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.productGroup.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.finishOption.findMany({
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true },
        }),
      ]);
      return { categories, productGroups, finishes };
    } catch (err) {
      console.error("Failed to fetch header nav data from DB:", err);
      return { categories: [], productGroups: [], finishes: [] };
    }
  },
  ["mega-menu-data"],
  { revalidate: 300, tags: ["mega-menu-data"] }
);

export default async function Header({ config }: HeaderProps) {
  const headerShowTopBar = config.header.showTopBar;
  const headerTopBarText = config.header.topBarText || "Miễn phí vận chuyển toàn quốc cho đơn hàng trên 1.000.000 đ";
  const headerTopBarLink = config.header.topBarLink || "";

  // 1. Fetch categories, groups, finishes for both desktop and mobile drawer
  const { categories, productGroups, finishes } = await getCachedHeaderData();

  // 2. Pre-render the MegaMenu component as a server component node
  const megaMenuConfig = config.navigation?.megaMenu || {
    column1: { title: "DANH MỤC", viewAllLabel: "→ Xem tất cả sản phẩm" },
    column2: { title: "BỘ SƯU TẬP", viewAllLabel: "→ Xem tất cả BST" },
    column3: { title: "HOÀN THIỆN", viewAllLabel: "→ Xem tất cả kỹ thuật" },
    featuredCards: []
  };
  const megaMenuContent = <MegaMenu config={megaMenuConfig} />;

  return (
    <div className="w-full flex flex-col z-50 relative">
      {/* 1. TOP BAR TINH */}
      {headerShowTopBar && (
        <div 
          style={{ backgroundColor: "var(--color-terracotta)" }}
          className="w-full text-center text-canvas py-2 px-4 text-[10px] md:text-xs font-bold font-bvp select-none truncate"
        >
          {headerTopBarLink ? (
            <a href={headerTopBarLink} className="hover:underline text-canvas">
              {headerTopBarText}
            </a>
          ) : (
            headerTopBarText
          )}
        </div>
      )}

      {/* 2. HEADER CLIENT COMPONENT */}
      <HeaderClient 
        config={config} 
        megaMenuContent={megaMenuContent}
        categories={categories}
        productGroups={productGroups}
        finishes={finishes}
      />
    </div>
  );
}
