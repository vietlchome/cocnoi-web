"use client";

import { ShieldAlert, Search, Bell, Menu } from "lucide-react";
import { useState, useEffect } from "react";
import GlobalSearchModal from "./shared/GlobalSearchModal";
import { useAdminLayoutStore } from "@/store/admin-layout.store";

export default function AdminTopbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const toggleSidebar = useAdminLayoutStore((state) => state.toggleSidebar);

  // Lắng nghe sự kiện bàn phím toàn cục (Ctrl+K hoặc Cmd+K trên Mac)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault(); // Chặn hành vi mặc định của trình duyệt
        setIsSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-16 bg-white border-b border-border/20 flex items-center justify-between px-6 shrink-0 shadow-sm transition-all duration-300">
        <div className="flex items-center gap-4 flex-1">
          {/* Menu Toggle Button */}
          <button 
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-secondary/60 hover:text-primary hover:bg-subtle/30 rounded-2 transition-all cursor-pointer"
            title="Đóng/mở thanh công cụ"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Thanh tìm kiếm mô phỏng (Bấm vào sẽ mở Modal thật) */}
          <div 
            className="relative w-full max-w-md hidden md:flex items-center group cursor-text"
            onClick={() => setIsSearchOpen(true)}
          >
            <Search className="w-4 h-4 text-secondary/40 absolute left-3 group-focus-within:text-accent transition-colors" />
            <div 
              className="w-full bg-subtle/30 border border-border/40 text-sm pl-9 pr-4 py-2 rounded-2 focus:outline-none focus:border-accent focus:bg-white transition-all text-secondary/60 hover:bg-subtle/50"
            >
              Tìm kiếm nội dung (Ctrl+K)
            </div>
            <div className="absolute right-3 flex items-center gap-1">
              <kbd className="hidden sm:inline-block bg-white border border-border/30 rounded px-1.5 text-[10px] font-mono text-secondary/60">Ctrl</kbd>
              <kbd className="hidden sm:inline-block bg-white border border-border/30 rounded px-1.5 text-[10px] font-mono text-secondary/60">K</kbd>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button className="p-2 text-secondary/60 hover:text-primary hover:bg-subtle/30 rounded-full transition-all relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-2 w-2 h-2 bg-error rounded-full ring-2 ring-white"></span>
          </button>

          <div className="h-6 w-px bg-border/20 mx-1"></div>

          <div className="flex items-center gap-2 text-xs bg-accent/10 text-accent font-semibold px-3 py-1.5 rounded-pill border border-accent/20">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span className="hidden sm:inline-block">Chế độ: Nhà sáng lập</span>
          </div>
          
          <div className="w-8 h-8 rounded-full bg-subtle border border-border flex items-center justify-center text-xs font-bold text-secondary cursor-pointer hover:bg-subtle/80 transition-colors">
            AD
          </div>
        </div>
      </header>

      {/* Cửa sổ tìm kiếm bật lên khi bấm Ctrl+K */}
      <GlobalSearchModal 
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}
