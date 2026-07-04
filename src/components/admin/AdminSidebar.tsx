"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ShoppingBag, FileText, Inbox,
  ArrowLeft, LogOut, Receipt, Users, Coins, Search,
  ChevronDown, ChevronRight, Eye, Settings, Gift,
  BarChart, Globe, Palette, FileEdit, List, Menu
} from "lucide-react";
import { useAdminLayoutStore } from "@/store/admin-layout.store";

{/* AdminBrand: Phase 10 sẽ đọc từ siteConfig.brand.brandName */}
function AdminBrand() {
  return (
    <>
      <span className="font-playfair text-base font-bold tracking-wider block leading-tight">CỐC NỐI</span>
      <span className="text-[10px] text-secondary/60 uppercase font-bold tracking-widest block leading-none">Quản trị viên</span>
    </>
  );
}

const MENU_ITEMS = [
  {
    title: "Tổng quan",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "Đơn hàng",
    icon: Receipt,
    submenus: [
      { title: "Đơn lẻ", href: "/admin/orders/retail" },
      { title: "Đơn B2B", href: "/admin/orders/b2b" },
    ]
  },
  {
    title: "Hỗ trợ khách hàng",
    icon: Inbox,
    submenus: [
      { title: "Yêu cầu tư vấn, báo giá", href: "/admin/inquiries" },
    ]
  },
  {
    title: "Sản phẩm",
    icon: ShoppingBag,
    submenus: [
      { title: "Tất cả sản phẩm", href: "/admin/products" },
      { title: "Cấu hình sản phẩm", href: "/admin/products/settings" },
      { title: "Tồn kho", href: "/admin/products/inventory" },
      { title: "Bulk upload", href: "/admin/products/bulk-upload" },
    ]
  },
  {
    title: "Khách hàng",
    icon: Users,
    href: "/admin/customers",
  },
  {
    title: "Khuyến mãi",
    icon: Gift,
    href: "/admin/promotions",
  },
  {
    title: "Sổ quỹ & Công nợ",
    icon: Coins,
    href: "/admin/finance",
  },
  {
    title: "Báo cáo",
    icon: BarChart,
    href: "/admin/analytics",
  }
];

const SALES_CHANNELS = [
  {
    title: "Website",
    icon: Globe,
    actionIcon: Eye,
    actionHref: "/",
    submenus: [
      { title: "Giao diện", href: "/admin/customize", icon: Palette },
      { title: "Menu", href: "/admin/website/navigation", icon: Menu },
      { title: "Blogs", href: "/admin/website/blogs", icon: FileEdit },
    ]
  }
];

const SETTINGS_MENU = {
  title: "Cấu hình",
  icon: Settings,
  submenus: [
    { title: "Cấu hình chung", href: "/admin/settings" },
  ]
};

interface AdminSidebarProps {
  pendingRetailOrdersCount?: number;
  pendingB2BOrdersCount?: number;
  unreadInquiriesCount?: number;
}

export default function AdminSidebar({ pendingRetailOrdersCount = 0, pendingB2BOrdersCount = 0, unreadInquiriesCount = 0 }: AdminSidebarProps) {
  const pendingOrdersCount = pendingRetailOrdersCount + pendingB2BOrdersCount;
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const isSidebarOpen = useAdminLayoutStore((state) => state.isSidebarOpen);

  const toggleMenu = (title: string) => {
    setExpandedMenus(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  const isActive = (href: string) => {
    // 1. Nếu khớp chính xác 100% thì chắc chắn là True
    if (pathname === href) return true;
    
    // 2. Chặn trang chủ Admin
    if (href === "/admin") return false;

    // 3. Khắc phục lỗi trùng tiền tố ở các Menu có sub-menu nằm ngang hàng
    if (href === "/admin/settings" && pathname.startsWith("/admin/settings/")) return false;
    if (href === "/admin/products" && ["/admin/products/settings", "/admin/products/pricing", "/admin/products/inventory", "/admin/products/reviews", "/admin/products/bulk-upload"].some(p => pathname.startsWith(p))) return false;
    if (href === "/admin/website/pages" && pathname.startsWith("/admin/website/pages/")) return false;

    // 4. Các trường hợp còn lại (như vào chi tiết sản phẩm /admin/products/[id]) thì được phép highlight cha
    if (pathname.startsWith(href + "/")) return true;
    
    return false;
  };

  const isMenuExpanded = (menu: any) => {
    if (expandedMenus[menu.title] !== undefined) {
      return expandedMenus[menu.title];
    }
    // Auto expand if a child is active
    return menu.submenus?.some((sub: any) => isActive(sub.href));
  };

  return (
    <aside className={`bg-white text-primary flex flex-col border-r border-border/20 shrink-0 h-screen overflow-hidden whitespace-nowrap transition-all duration-300 ease-in-out ${isSidebarOpen ? "w-72 translate-x-0 ml-0 opacity-100" : "w-0 -translate-x-full opacity-0 pointer-events-none"}`}>
      
      {/* Sidebar Header */}
      <div className="p-4 border-b border-border/10 flex items-center justify-between shrink-0">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-canvas">
            <svg viewBox="0 0 300 300" className="w-5 h-5 fill-current">
              <path d="M198.5,143.2c1.6,2.6,3,4.6,4.1,6.8c6.5,12.8,2.1,26.5-10.7,33.1c-3.9,2-7.9,3.8-11.9,5.6c-5.9,2.6-6.9,7.1-2.8,11.9c4.6,5.4,15,7.1,20.5,2.7c4.6-3.7,8.8-8.2,12.6-12.8c8.2-10,14.6-20.8,14.4-34.4c-0.3-15.7-7.5-28.1-18.7-38.3c-12.2-11.1-26.2-18.5-43.2-17.2c-20.6,1.5-32.6,14.7-40.9,32c-3.8,8-6.3,16.4-3,25.5c1.4,3.8,3.5,6.3,7.5,6.4c4.7,0.1,6.2-3.3,7.1-7.3c1.4-5.9,2.5-11.8,4.2-17.5c3.6-11.4,12.3-17.6,24.4-16.9C177.8,123.7,188.9,132.8,198.5,143.2z" className="fill-canvas" />
            </svg>
          </div>
          <div>
            <AdminBrand />
          </div>
        </Link>
        <button 
          onClick={() => useAdminLayoutStore.getState().toggleSidebar()}
          className="p-1.5 text-secondary/60 hover:text-primary hover:bg-subtle/30 rounded-2 transition-all cursor-pointer"
          title="Thu gọn menu"
        >
          <Menu className="w-4 h-4" />
        </button>
      </div>

      {/* Sidebar Content */}
      <nav className="flex-grow overflow-y-auto custom-scrollbar p-3 flex flex-col gap-1 pb-20">
        
        {/* Core Menus */}
        {MENU_ITEMS.map((menu) => {
          const active = menu.href ? isActive(menu.href) : menu.submenus?.some((sub: any) => isActive(sub.href));
          const expanded = isMenuExpanded(menu);

          return (
            <div key={menu.title} className="flex flex-col">
              {menu.href ? (
                <Link 
                  href={menu.href} 
                  className={`flex items-center gap-3 px-3 py-2 rounded-2 text-sm font-medium transition-all justify-between ${
                    active ? "bg-subtle/40 text-primary font-semibold" : "text-secondary hover:bg-subtle/20 hover:text-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <menu.icon className={`w-4 h-4 ${active ? "text-accent" : "text-secondary/70"}`} />
                    <span>{menu.title}</span>
                  </div>
                  {menu.title === "Đơn hàng" && pendingOrdersCount > 0 && (
                    <span className="bg-accent text-canvas text-[10px] font-bold px-1.5 py-0.5 rounded-full">{pendingOrdersCount}</span>
                  )}
                  {menu.title === "Hỗ trợ khách hàng" && unreadInquiriesCount > 0 && (
                    <span className="bg-accent text-canvas text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadInquiriesCount}</span>
                  )}
                </Link>
              ) : (
                <>
                  <button 
                    onClick={() => toggleMenu(menu.title)}
                    className={`flex items-center justify-between px-3 py-2 rounded-2 text-sm font-medium transition-all w-full cursor-pointer ${
                      active ? "text-primary" : "text-secondary hover:bg-subtle/20 hover:text-primary"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <menu.icon className={`w-4 h-4 ${active ? "text-accent" : "text-secondary/70"}`} />
                      <span className={active ? "font-semibold" : ""}>{menu.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {menu.title === "Đơn hàng" && pendingOrdersCount > 0 && (
                        <span className="bg-accent text-canvas text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{pendingOrdersCount}</span>
                      )}
                      {menu.title === "Hỗ trợ khách hàng" && unreadInquiriesCount > 0 && (
                        <span className="bg-accent text-canvas text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{unreadInquiriesCount}</span>
                      )}
                      {expanded ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
                    </div>
                  </button>
                  
                  {expanded && menu.submenus && (
                    <div className="flex flex-col mt-1 ml-9 gap-1">
                      {menu.submenus.map((sub: any) => {
                        const subActive = isActive(sub.href);
                        return (
                            <Link 
                              key={sub.title}
                              href={sub.href}
                              className={`flex items-center justify-between px-3 py-1.5 rounded-2 text-sm transition-all ${
                                subActive ? "bg-subtle/40 text-accent font-medium" : "text-secondary/80 hover:text-primary hover:bg-subtle/10"
                              }`}
                            >
                              <span>{sub.title}</span>
                              {sub.title === "Đơn lẻ" && pendingRetailOrdersCount > 0 && (
                                <span className="bg-accent text-canvas text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingRetailOrdersCount}</span>
                              )}
                              {sub.title === "Đơn B2B" && pendingB2BOrdersCount > 0 && (
                                <span className="bg-accent text-canvas text-[9px] font-bold px-1.5 py-0.5 rounded-full">{pendingB2BOrdersCount}</span>
                              )}
                              {sub.title === "Yêu cầu tư vấn, báo giá" && unreadInquiriesCount > 0 && (
                                <span className="bg-accent text-canvas text-[9px] font-bold px-1.5 py-0.5 rounded-full">{unreadInquiriesCount}</span>
                              )}
                            </Link>
                        )
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}

        <div className="h-px bg-border/20 my-3" />

        {/* Sales Channels */}
        <div className="px-3 mb-2 flex justify-between items-center">
          <span className="text-[11px] font-bold text-secondary/50 uppercase tracking-widest">Kênh bán hàng</span>
        </div>

        {SALES_CHANNELS.map((menu) => {
          const expanded = isMenuExpanded(menu);
          const active = menu.submenus?.some((sub: any) => isActive(sub.href));

          return (
            <div key={menu.title} className="flex flex-col">
              <div className="flex items-center justify-between rounded-2 transition-all w-full pr-1">
                <button 
                  onClick={() => toggleMenu(menu.title)}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all flex-grow text-left cursor-pointer ${
                    active ? "text-primary" : "text-secondary hover:bg-subtle/20 hover:text-primary"
                  }`}
                >
                  <menu.icon className={`w-4 h-4 ${active ? "text-accent" : "text-secondary/70"}`} />
                  <span className={active ? "font-semibold" : ""}>{menu.title}</span>
                </button>
                {menu.actionIcon && (
                  <Link href={menu.actionHref} target="_blank" className="p-1.5 text-secondary/50 hover:text-accent rounded-full hover:bg-subtle/30 cursor-pointer" title="Xem cửa hàng">
                    <menu.actionIcon className="w-4 h-4" />
                  </Link>
                )}
              </div>
              
              {expanded && menu.submenus && (
                <div className="flex flex-col mt-1 ml-9 gap-1">
                  {menu.submenus.map((sub: any) => {
                    const subActive = isActive(sub.href);
                    return (
                      <Link 
                        key={sub.title}
                        href={sub.href}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2 text-sm transition-all ${
                          subActive ? "bg-subtle/40 text-accent font-medium" : "text-secondary/80 hover:text-primary hover:bg-subtle/10"
                        }`}
                      >
                        {sub.icon && <sub.icon className="w-3.5 h-3.5 opacity-70" />}
                        {sub.title}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Settings Bottom Pin */}
      <div className="border-t border-border/10 bg-white p-3 shrink-0">
        <div className="flex flex-col">
          <button 
            onClick={() => toggleMenu(SETTINGS_MENU.title)}
            className={`flex items-center justify-between px-3 py-2 rounded-2 text-sm font-medium transition-all w-full cursor-pointer ${
              SETTINGS_MENU.submenus.some(s => isActive(s.href)) ? "text-primary" : "text-secondary hover:bg-subtle/20 hover:text-primary"
            }`}
          >
            <div className="flex items-center gap-3">
              <SETTINGS_MENU.icon className={`w-4 h-4 text-secondary/70`} />
              <span>{SETTINGS_MENU.title}</span>
            </div>
            {isMenuExpanded(SETTINGS_MENU) ? <ChevronDown className="w-3.5 h-3.5 opacity-50" /> : <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
          </button>
          
          {isMenuExpanded(SETTINGS_MENU) && (
            <div className="flex flex-col mt-1 ml-9 gap-1 absolute bottom-14 left-3 bg-white border border-border/20 shadow-md rounded-3 p-2 w-48 z-50">
              {SETTINGS_MENU.submenus.map((sub: any) => {
                const subActive = isActive(sub.href);
                return (
                  <Link 
                    key={sub.title}
                    href={sub.href}
                    className={`px-3 py-1.5 rounded-2 text-sm transition-all ${
                      subActive ? "bg-subtle/40 text-accent font-medium" : "text-secondary/80 hover:text-primary hover:bg-subtle/10"
                    }`}
                  >
                    {sub.title}
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
