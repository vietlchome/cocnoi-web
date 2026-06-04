"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { Search, X, Loader2, Package, Receipt, Users, MessageSquare, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";
import { globalSearch, GlobalSearchResult } from "@/lib/actions/search.actions";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GlobalSearchResult[]>([]);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        startTransition(async () => {
          const res = await globalSearch(query);
          setResults(res);
        });
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const handleResultClick = (href: string) => {
    router.push(href);
    onClose();
  };

  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "ORDER": return <Receipt className="w-5 h-5 text-accent" />;
      case "PRODUCT": return <Package className="w-5 h-5 text-sage-600" />;
      case "CUSTOMER": return <Users className="w-5 h-5 text-emerald-600" />;
      case "INQUIRY": return <MessageSquare className="w-5 h-5 text-amber-600" />;
      default: return <Search className="w-5 h-5 text-secondary" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "ORDER": return "Đơn hàng";
      case "PRODUCT": return "Sản phẩm";
      case "CUSTOMER": return "Khách hàng";
      case "INQUIRY": return "Yêu cầu tư vấn";
      default: return "";
    }
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, GlobalSearchResult[]>);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4 sm:px-0">
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-2xl bg-white rounded-3 shadow-2xl overflow-hidden transform transition-all border border-border/20">
        
        {/* Search Input */}
        <div className="flex items-center border-b border-border/20 px-4 py-3 bg-canvas/50">
          <Search className="w-5 h-5 text-secondary/50 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-base placeholder:text-secondary/40 text-primary py-2"
            placeholder="Tìm kiếm mã đơn hàng, tên khách, số điện thoại..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isPending && <Loader2 className="w-5 h-5 text-accent animate-spin mx-2 shrink-0" />}
          <button 
            onClick={onClose}
            className="p-1.5 hover:bg-subtle/50 rounded-2 text-secondary hover:text-primary transition-colors shrink-0 ml-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto custom-scrollbar bg-canvas/30">
          {query.trim().length < 2 ? (
            <div className="px-6 py-12 text-center text-secondary/60">
              <p className="text-sm">Gõ ít nhất 2 ký tự để tìm kiếm toàn hệ thống.</p>
              <div className="flex justify-center gap-4 mt-6 text-xs">
                <span className="flex flex-col items-center gap-2"><Receipt className="w-5 h-5 opacity-50"/> Tìm đơn hàng</span>
                <span className="flex flex-col items-center gap-2"><Package className="w-5 h-5 opacity-50"/> Tìm sản phẩm</span>
                <span className="flex flex-col items-center gap-2"><Users className="w-5 h-5 opacity-50"/> Tìm khách hàng</span>
              </div>
            </div>
          ) : results.length === 0 && !isPending ? (
            <div className="px-6 py-12 text-center text-secondary/60">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Không tìm thấy kết quả nào cho "{query}"</p>
            </div>
          ) : (
            <div className="p-2 space-y-4">
              {Object.entries(groupedResults).map(([type, items]) => (
                <div key={type}>
                  <div className="px-3 py-1.5 text-xs font-bold text-secondary uppercase tracking-wider">
                    {getTypeLabel(type)}
                  </div>
                  <div className="flex flex-col gap-1 mt-1">
                    {items.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => handleResultClick(item.href)}
                        className="flex items-center justify-between p-3 rounded-2 hover:bg-subtle/40 text-left transition-colors group border border-transparent hover:border-border/30 w-full"
                      >
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-white rounded-2 shadow-sm border border-border/10">
                            {getIcon(item.type)}
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-primary group-hover:text-accent transition-colors">{item.title}</div>
                            <div className="text-xs text-secondary mt-0.5">{item.subtitle}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {item.status && (
                            <span className="text-[10px] font-medium bg-white border border-border/30 px-2 py-1 rounded-full text-secondary">
                              {item.status}
                            </span>
                          )}
                          <ExternalLink className="w-4 h-4 text-secondary/30 group-hover:text-accent transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-border/20 bg-subtle/10 flex items-center justify-between text-[11px] text-secondary/60">
          <div className="flex items-center gap-3">
            <span>Bấm <kbd className="bg-white border border-border/30 rounded px-1.5 font-mono shadow-sm text-secondary">ESC</kbd> để đóng</span>
          </div>
          <span>Cốc Nối Global Search System</span>
        </div>
      </div>
    </div>
  );
}
