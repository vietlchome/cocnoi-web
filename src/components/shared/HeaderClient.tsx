"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Menu, X, Search, Globe, User, ShoppingBag, ChevronDown 
} from "lucide-react";
import { useCartStore } from "@/store/cart.store";
import SearchOverlay from "./SearchOverlay";
import type { SiteConfig } from "@/lib/site-config-validate";

interface HeaderClientProps {
  config: SiteConfig;
  navLinks: Array<{ title: string; link: string; active?: boolean }>;
  dbCollections: string[];
}

export default function HeaderClient({ config, navLinks, dbCollections }: HeaderClientProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [lang, setLang] = useState<"VN" | "EN">("VN");
  const pathname = usePathname();
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const isLinkActive = (linkUrl: string) => {
    if (pathname === linkUrl) return true;
    const linkParts = linkUrl.split('/').filter(Boolean);
    const pathParts = pathname.split('/').filter(Boolean);
    if (linkParts.length > 0 && pathParts.length > 0) {
      return linkParts[0] === pathParts[0];
    }
    return false;
  };

  // Global search keyboard shortcuts
  useEffect(() => {
    const handleGlobalSearchShortcut = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT" && document.activeElement?.tagName !== "TEXTAREA") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalSearchShortcut);
    return () => window.removeEventListener("keydown", handleGlobalSearchShortcut);
  }, []);

  // Integrated Cart state
  const { setIsOpen: setCartOpen, items: cartItems } = useCartStore();
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    setCartCount(cartItems.reduce((acc, item) => acc + item.quantity, 0));
  }, [cartItems]);

  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setSession(data);
          }
        }
      } catch (e) {
        console.error("Lỗi khi kiểm tra session:", e);
      }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerLogoUrl = config.header.logoUrl || "";
  const headerLogoText = config.header.logoText || "CỐC NỐI";
  const isSticky = config.header.stickyHeader;

  // Ban do submenu tinh khop theo nhan tieu de
  const submenuMap: Record<string, Array<{ name: string; href: string }>> = {
    "SHOP": [
      { name: "Cốc có quai (Mugs)", href: "/shop?category=Mugs" },
      { name: "Cốc không quai (Beakers)", href: "/shop?category=Beakers" },
      { name: "Bộ sưu tập đặc biệt", href: "/shop?category=Limited" },
      { name: "Tất cả sản phẩm", href: "/shop" },
    ],
    "CỘNG ĐỒNG": [
      { name: "Người Nối", href: "/community/nguoi-noi" },
      { name: "#cocnoiwithyou", href: "/community/your-stories" },
    ],
    "KHÁM PHÁ": [
      { name: "Câu chuyện", href: "/discover/our-story" },
      { name: "Con người", href: "/discover/our-human" },
      { name: "Quy trình thủ công", href: "/discover/our-craft" },
      { name: "Giá trị", href: "/discover/our-values" },
    ],
    "ĐỐI TÁC": [
      { name: "Tìm cửa hàng", href: "/partners/stockists" },
      { name: "Trở thành đại lý", href: "/partners/become-a-stockist" },
      { name: "Quà tặng doanh nghiệp", href: "/partners/corporate-gifting" },
    ]
  };

  return (
    <>
      <header className={`${isSticky ? "sticky top-0" : "relative"} transition-all duration-300 w-full ${
        isScrolled 
          ? "bg-canvas/90 backdrop-blur-md border-b border-border py-4 shadow-sm" 
          : "bg-canvas py-6 border-b border-transparent"
      }`} style={{ backgroundColor: isScrolled ? undefined : "var(--color-warm-white)", zIndex: 40 }}>
        
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 flex items-center justify-between">
          
          {/* LOGO AREA */}
          <Link href="/" className="flex items-center gap-3 group">
            {headerLogoUrl ? (
              <img 
                src={headerLogoUrl} 
                alt={headerLogoText} 
                className="h-10 max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-[1.03]"
              />
            ) : (
              <>
                <div 
                  style={{ backgroundColor: "var(--color-deep-indigo)" }}
                  className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-canvas transition-transform duration-500 group-hover:rotate-180"
                >
                  <svg viewBox="0 0 300 300" className="w-6 h-6 fill-current">
                    <path d="M198.5,143.2c1.6,2.6,3,4.6,4.1,6.8c6.5,12.8,2.1,26.5-10.7,33.1c-3.9,2-7.9,3.8-11.9,5.6c-5.9,2.6-6.9,7.1-2.8,11.9c4.6,5.4,15,7.1,20.5,2.7c4.6-3.7,8.8-8.2,12.6-12.8c8.2-10,14.6-20.8,14.4-34.4c-0.3-15.7-7.5-28.1-18.7-38.3c-12.2-11.1-26.2-18.5-43.2-17.2c-20.6,1.5-32.6,14.7-40.9,32c-3.8,8-6.3,16.4-3,25.5c1.4,3.8,3.5,6.3,7.5,6.4c4.7,0.1,6.2-3.3,7.1-7.3c1.4-5.9,2.5-11.8,4.2-17.5c3.6-11.4,12.3-17.6,24.4-16.9C177.8,123.7,188.9,132.8,198.5,143.2z" className="fill-canvas" />
                    <path d="M94.4,68.8c15.3-16,35.4-18.8,56.1-18.3c20.6,0.5,39.8,6.4,56.6,18.9c9.4,7,18.9,13.9,25.7,23.8c13.7,20.1,20.1,41.8,15.9,66.5c-3.2,18.6-8.2,36.4-19.1,51.8c-13.5,19-32,31.5-55.2,35.7c-26.5,4.8-52.2,2.8-76.4-10.4c-10.7-5.8-19.2-13.9-25-24.7c-1-1.9-2.2-3.6-3.5-5.3c-23.8-30.5-24.2-63.2-10-97.7C66.7,91.7,77.8,78.1,94.4,68.8z M94.3,102.7c-19.6,13.2-25.6,35.1-16.9,56.2c4.2,10.2,10.6,19.2,19,26.3c15.7,13.3,33.2,17.9,52.5,8.7c10.4-4.9,19.1-12.3,26.6-21.1c4.8-5.7,4.6-15-0.3-20.8c-4.8-5.6-10.3-5-13.4,1.7c-1,2.2-1.8,4.5-2.8,6.8c-8.3,19.8-24.7,24.7-42,12c-9-6.6-15.5-15.5-19.3-26c-6.4-18,0.8-31.1,19.2-36.1c4.9-1.3,10-1.9,14.6-3.8c2.3-0.9,4.8-3.8,5.1-6c0.3-2.1-1.8-5.8-3.7-6.5c-4.4-1.6-9.5-2.7-14.1-2.3C109.6,92.9,101.2,96.9,94.3,102.7z" className="fill-canvas opacity-30" />
                  </svg>
                </div>
                <span className="font-playfair text-xl md:text-2xl font-semibold tracking-wider text-primary select-none group-hover:text-accent transition-colors" style={{ color: "var(--color-deep-indigo)" }}>
                  {headerLogoText}
                </span>
              </>
            )}
          </Link>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => {
              const submenu = submenuMap[link.title.toUpperCase()];
              return (
                <div key={link.title} className="relative group/item py-2">
                  <Link 
                    href={link.link}
                    className={`font-bvp text-sm font-medium tracking-wide flex items-center gap-1 py-1 border-b-2 transition-all duration-300 ${
                      isLinkActive(link.link)
                        ? "border-accent text-accent animate-fade-in"
                        : "border-transparent text-primary hover:text-accent hover:border-accent/40"
                    }`}
                    style={{ 
                      color: isLinkActive(link.link) ? "var(--color-terracotta)" : "var(--color-deep-indigo)",
                      borderBottomColor: isLinkActive(link.link) ? "var(--color-terracotta)" : "transparent"
                    }}
                  >
                    {link.title}
                    {submenu && <ChevronDown className="w-3.5 h-3.5 opacity-60 group-hover/item:rotate-180 transition-transform duration-300" />}
                  </Link>
                  
                  {/* Mega Menu Dropdown for SHOP */}
                  {link.title.toUpperCase() === "SHOP" && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-[550px] bg-canvas border border-border rounded-4 shadow-xl opacity-0 translate-y-2 pointer-events-none group-hover/item:opacity-100 group-hover/item:translate-y-0 group-hover/item:pointer-events-auto transition-all duration-300 z-50 p-6">
                      <div className="grid grid-cols-3 gap-6 text-left">
                        {/* Column 1: Mugs */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-playfair font-bold text-sm text-primary border-b border-border pb-1.5 mb-1">Mugs</h4>
                          <div className="flex flex-col gap-2 font-bvp text-xs">
                            <Link href="/shop?category=Mugs" className="text-secondary hover:text-accent transition-colors font-medium">Large Mugs</Link>
                            <Link href="/shop?category=Mugs" className="text-secondary hover:text-accent transition-colors font-medium">Medium Mugs</Link>
                          </div>
                        </div>
                        
                        {/* Column 2: Beakers */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-playfair font-bold text-sm text-primary border-b border-border pb-1.5 mb-1">Beakers</h4>
                          <div className="flex flex-col gap-2 font-bvp text-xs">
                            <Link href="/shop?category=Beakers" className="text-secondary hover:text-accent transition-colors font-medium">Large Beakers</Link>
                            <Link href="/shop?category=Beakers" className="text-secondary hover:text-accent transition-colors font-medium">Small Beakers</Link>
                          </div>
                        </div>
                        
                        {/* Column 3: Collections */}
                        <div className="flex flex-col gap-2.5">
                          <h4 className="font-playfair font-bold text-sm text-primary border-b border-border pb-1.5 mb-1">Collections</h4>
                          <div className="flex flex-col gap-2 font-bvp text-xs max-h-36 overflow-y-auto pr-1">
                            {Array.from(new Set([
                              "Cornflower", "Rue", "Sorrel", "Vervain", "Yarrow",
                              ...dbCollections
                            ])).map((col) => (
                              <Link 
                                key={col} 
                                href={`/shop?collection=${col}`} 
                                className="text-secondary hover:text-accent transition-colors font-medium"
                              >
                                {col}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Standard Dropdown Menu (for non-SHOP links) */}
                  {link.title.toUpperCase() !== "SHOP" && submenu && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 w-56 bg-canvas border border-border rounded-3 shadow-lg opacity-0 translate-y-2 pointer-events-none group-hover/item:opacity-100 group-hover/item:translate-y-0 group-hover/item:pointer-events-auto transition-all duration-300 z-50 p-2">
                      <div className="py-1">
                        {submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className="block px-4 py-2.5 text-xs md:text-sm text-primary hover:text-accent hover:bg-subtle rounded-2 font-bvp transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          {/* UTILITIES AREA */}
          <div className="flex items-center gap-3 md:gap-5" style={{ color: "var(--color-deep-indigo)" }}>
            {/* Lang Toggle */}
            <button 
              onClick={() => setLang(lang === "VN" ? "EN" : "VN")}
              className="hidden sm:flex items-center gap-1 font-bvp text-xs font-semibold text-secondary hover:text-accent transition-colors border border-border px-2.5 py-1 rounded-pill bg-canvas"
            >
              <Globe className="w-3.5 h-3.5 text-secondary" />
              <span>{lang}</span>
            </button>

            {/* Search Button Trigger */}
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="text-primary hover:text-accent p-1.5 transition-colors rounded-full hover:bg-subtle cursor-pointer" 
              title="Tìm kiếm (Ctrl+K)"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Admin / Account Quick Access */}
            <Link 
              href={session ? (session.user?.role === "ADMIN" ? "/admin" : "/dashboard") : "/login"} 
              className="text-primary hover:text-accent p-1.5 transition-colors rounded-full hover:bg-subtle cursor-pointer" 
              title={session ? "Trang Quản Trị" : "Đăng nhập / Tài khoản"}
            >
              <User className="w-5 h-5" />
            </Link>

            {/* Shopping Cart Drawer Trigger */}
            <button 
              onClick={() => setCartOpen(true)}
              className="relative text-primary hover:text-accent p-1.5 transition-colors rounded-full hover:bg-subtle cursor-pointer" 
              title="Giỏ hàng"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 ? (
                <span 
                  className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 rounded-full text-[9px] font-bold text-white flex items-center justify-center border border-white"
                  style={{ backgroundColor: "var(--color-terracotta)" }}
                >
                  {cartCount}
                </span>
              ) : (
                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-accent rounded-full animate-pulse border border-canvas" style={{ backgroundColor: "var(--color-terracotta)" }}></span>
              )}
            </button>

            {/* MOBILE NAV BUTTON */}
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden text-primary p-1.5 hover:bg-subtle rounded-full transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* MOBILE DRAWER */}
        {isOpen && (
          <div className="lg:hidden absolute top-full left-0 w-full bg-canvas border-b border-border shadow-xl z-50 animate-fade-in" style={{ backgroundColor: "var(--color-warm-white)" }}>
            <div className="px-6 py-6 flex flex-col gap-6 max-h-[80vh] overflow-y-auto">
              {navLinks.map((link) => {
                const submenu = submenuMap[link.title.toUpperCase()];
                return (
                  <div key={link.title} className="flex flex-col gap-2">
                    <Link 
                      href={link.link}
                      onClick={() => setIsOpen(false)}
                      className="font-playfair text-lg font-semibold text-primary hover:text-accent transition-colors"
                    >
                      {link.title}
                    </Link>
                    {submenu && (
                      <div className="pl-4 flex flex-col gap-2 border-l border-border mt-1">
                        {submenu.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            onClick={() => setIsOpen(false)}
                            className="font-bvp text-sm text-secondary hover:text-accent py-1 transition-colors"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Lang switcher on mobile */}
              <div className="flex items-center justify-between border-t border-border pt-4 mt-2">
                <span className="font-bvp text-sm text-secondary">Ngôn ngữ / Language</span>
                <button 
                  onClick={() => setLang(lang === "VN" ? "EN" : "VN")}
                  className="flex items-center gap-1 font-bvp text-xs font-semibold text-primary border border-border px-3 py-1.5 rounded-pill bg-subtle"
                >
                  <Globe className="w-3.5 h-3.5 text-secondary" />
                  <span>{lang}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>
      
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
