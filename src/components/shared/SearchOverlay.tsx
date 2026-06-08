"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Search, X, Loader2, ArrowRight, BookOpen, Tag, ShoppingBag, CornerDownLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProductResult {
  id: string;
  sku: string | null;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  images: any;
}

interface PostResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  createdAt: string;
}

interface CategoryResult {
  id: string;
  name: string;
  slug: string;
}

interface FlatResultItem {
  type: "product" | "post" | "category";
  name: string;
  href: string;
  id: string;
}

export default function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    products: ProductResult[];
    posts: PostResult[];
    categories: CategoryResult[];
  }>({ products: [], posts: [], categories: [] });

  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Debounced search trigger
  useEffect(() => {
    if (!isOpen) return;

    // Focus input on open
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults({ products: [], posts: [], categories: [] });
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setResults(data.results);
          }
        }
      } catch (err) {
        console.error("Lỗi fetch search overlay:", err);
      } finally {
        setLoading(false);
        setActiveIndex(-1);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, isOpen]);

  // Flattened results for keyboard navigation
  const getFlatItems = (): FlatResultItem[] => {
    const items: FlatResultItem[] = [];
    results.categories.forEach((c) => {
      items.push({ type: "category", name: c.name, href: `/cua-hang?category=${c.slug}`, id: c.id });
    });
    results.products.forEach((p) => {
      items.push({ type: "product", name: p.name, href: `/cua-hang/${p.slug}`, id: p.id });
    });
    results.posts.forEach((post) => {
      items.push({ type: "post", name: post.title, href: `/journal/${post.slug}`, id: post.id });
    });
    return items;
  };

  const flatItems = getFlatItems();

  // Keyboard navigation & escape triggers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((prev) => (flatItems.length === 0 ? -1 : (prev + 1) % flatItems.length));
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((prev) =>
          flatItems.length === 0 ? -1 : (prev - 1 + flatItems.length) % flatItems.length
        );
      }

      if (e.key === "Enter" && activeIndex >= 0 && activeIndex < flatItems.length) {
        e.preventDefault();
        const selected = flatItems[activeIndex];
        router.push(selected.href);
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, flatItems, activeIndex]);

  // Prevent scroll when overlay is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const hasResults =
    results.products.length > 0 ||
    results.posts.length > 0 ||
    results.categories.length > 0;

  return (
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[100] bg-[#131829]/60 backdrop-blur-sm flex justify-center items-start animate-fade-in"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="bg-canvas max-w-2xl w-full mx-4 mt-16 md:mt-24 rounded-4 border border-border/80 shadow-2xl p-6 relative flex flex-col max-h-[80vh] overflow-hidden animate-slide-up">
        {/* CLOSE BUTTON */}
        <button 
          onClick={onClose}
          className="absolute right-5 top-5 z-50 text-secondary hover:text-accent p-1.5 rounded-full hover:bg-subtle transition-colors"
          title="Đóng tìm kiếm (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SEARCH INPUT */}
        <div className="relative border-b border-border/60 pb-4 mb-4 flex items-center gap-3">
          <Search className="w-6 h-6 text-accent shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm kiếm sản phẩm, bài viết nhật ký, màu men..."
            className="w-full bg-transparent font-playfair font-semibold text-lg md:text-xl text-primary focus:outline-none placeholder:text-secondary/40 pr-12"
          />
          {loading && <Loader2 className="w-5 h-5 text-accent animate-spin shrink-0 absolute right-12 top-1.5" />}
        </div>

        {/* RESULTS SCROLLABLE CONTAINER */}
        <div className="flex-1 overflow-y-auto pr-1">
          {query.trim().length < 2 ? (
            <div className="py-12 text-center text-secondary/40 font-bvp text-xs">
              <p>Gõ tối thiểu 2 ký tự để tìm kiếm...</p>
              <div className="flex justify-center gap-4 mt-6 text-[10px] text-secondary/30">
                <span>Di chuyển: ↑↓</span>
                <span>Mở kết quả: Enter</span>
                <span>Đóng: Esc</span>
              </div>
            </div>
          ) : loading && !hasResults ? (
            /* SEARCHING SKELETONS */
            <div className="flex flex-col gap-6 py-6 animate-pulse">
              <div className="h-4 bg-subtle rounded-pill w-1/4"></div>
              <div className="flex flex-col gap-3">
                <div className="h-12 bg-subtle rounded-2"></div>
                <div className="h-12 bg-subtle rounded-2"></div>
              </div>
            </div>
          ) : !loading && query.trim().length >= 2 && !hasResults ? (
            /* EMPTY STATE */
            <div className="py-16 text-center text-secondary font-bvp text-sm leading-relaxed">
              <p>Không tìm thấy kết quả phù hợp cho &ldquo;<strong className="text-accent">{query}</strong>&rdquo;</p>
              <p className="text-xs text-secondary/50 mt-2">Hãy thử tìm &ldquo;mugs&rdquo;, &ldquo;cốc&rdquo; hoặc câu chuyện làng nghề.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-8 py-4">
              {/* 1. CATEGORIES */}
              {results.categories.length > 0 && (
                <div>
                  <h4 className="font-bvp text-[10px] font-bold uppercase tracking-wider text-secondary/60 mb-2 border-b border-border/40 pb-1.5">
                    📂 Danh mục sản phẩm
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {results.categories.map((c) => {
                      const flatIndex = flatItems.findIndex((item) => item.id === c.id);
                      const isHighlighted = activeIndex === flatIndex;
                      return (
                        <Link
                          key={c.id}
                          href={`/cua-hang?category=${c.slug}`}
                          onClick={onClose}
                          className={`flex items-center justify-between p-3 rounded-2 border transition-all duration-200 font-bvp text-xs font-bold ${
                            isHighlighted
                              ? "bg-[#FAF8F5] border-accent text-accent translate-x-1"
                              : "bg-canvas border-transparent text-primary hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-accent/50" />
                            <span>{c.name}</span>
                          </span>
                          {isHighlighted && <CornerDownLeft className="w-3.5 h-3.5" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. PRODUCTS */}
              {results.products.length > 0 && (
                <div>
                  <h4 className="font-bvp text-[10px] font-bold uppercase tracking-wider text-secondary/60 mb-2 border-b border-border/40 pb-1.5">
                    🛍️ Sản phẩm
                  </h4>
                  <div className="flex flex-col gap-2">
                    {results.products.map((p) => {
                      let firstImage = "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=120&q=80";
                      if (Array.isArray(p.images) && p.images.length > 0) {
                        firstImage = p.images[0];
                      }

                      const flatIndex = flatItems.findIndex((item) => item.id === p.id);
                      const isHighlighted = activeIndex === flatIndex;

                      return (
                        <Link
                          key={p.id}
                          href={`/cua-hang/${p.slug}`}
                          onClick={onClose}
                          className={`flex items-center gap-4 p-2.5 rounded-2 border transition-all duration-200 ${
                            isHighlighted
                              ? "bg-[#FAF8F5] border-accent translate-x-1"
                              : "bg-canvas border-transparent hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <div className="w-12 h-12 bg-subtle rounded-1 overflow-hidden border border-border/40 shrink-0">
                            <img src={firstImage} alt={p.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0 font-bvp text-left">
                            <h5 className={`text-xs font-bold truncate ${isHighlighted ? "text-accent" : "text-primary"}`}>
                              {p.name}
                            </h5>
                            <span className="text-[10px] text-secondary/60 block mt-0.5">SKU: {p.sku || "N/A"}</span>
                          </div>
                          <div className="text-right shrink-0 font-playfair font-bold text-xs text-primary pr-2">
                            <span>{p.price.toLocaleString("vi-VN")} đ</span>
                          </div>
                          {isHighlighted && <CornerDownLeft className="w-3.5 h-3.5 text-accent shrink-0" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 3. POSTS */}
              {results.posts.length > 0 && (
                <div>
                  <h4 className="font-bvp text-[10px] font-bold uppercase tracking-wider text-secondary/60 mb-2 border-b border-border/40 pb-1.5">
                    📝 Nhật ký vinh danh
                  </h4>
                  <div className="flex flex-col gap-2">
                    {results.posts.map((post) => {
                      const flatIndex = flatItems.findIndex((item) => item.id === post.id);
                      const isHighlighted = activeIndex === flatIndex;

                      return (
                        <Link
                          key={post.id}
                          href={`/journal/${post.slug}`}
                          onClick={onClose}
                          className={`flex items-start gap-4 p-3 rounded-2 border transition-all duration-200 ${
                            isHighlighted
                              ? "bg-[#FAF8F5] border-accent translate-x-1"
                              : "bg-canvas border-transparent hover:bg-[#FAF8F5]"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 bg-canvas border border-border/60 p-1.5 rounded-1">
                            <BookOpen className="w-4 h-4 text-accent/60" />
                          </div>
                          <div className="flex-grow min-w-0 font-bvp text-left">
                            <h5 className={`text-xs font-bold leading-snug line-clamp-1 ${isHighlighted ? "text-accent" : "text-primary"}`}>
                              {post.title}
                            </h5>
                            {post.excerpt && <p className="text-[10px] text-secondary leading-normal line-clamp-1 mt-0.5">{post.excerpt}</p>}
                          </div>
                          {isHighlighted && <CornerDownLeft className="w-3.5 h-3.5 text-accent shrink-0 self-center" />}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
