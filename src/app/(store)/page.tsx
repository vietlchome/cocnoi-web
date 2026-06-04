import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { 
  ArrowRight, Heart, Sparkles, Shield, Award, Users, ChevronDown, Star 
} from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { SettingsService } from "@/lib/services/settings.service";
import { ReviewService } from "@/lib/services/review.service";
import TestimonialSection from "@/components/store/TestimonialSection";

export const revalidate = 0; // Đọc live settings từ database SQLite lập tức

export default async function StoreHome() {
  // 1. Truy vấn cấu hình giao diện hợp nhất qua site config schema
  const config = await getSiteConfig();

  // Lấy danh sách chip tìm nhanh từ settings
  let quickChips: Array<{ text: string; url: string }> = [];
  try {
    const chipsSetting = await SettingsService.getValue("hero_quick_chips");
    quickChips = chipsSetting ? JSON.parse(chipsSetting) : [];
  } catch (e) {
    quickChips = [];
  }
  if (!quickChips || quickChips.length === 0) {
    quickChips = [
      { text: "Cốc có quai", url: "/shop?category=Mugs" },
      { text: "Cốc không quai", url: "/shop?category=Beakers" },
      { text: "BST Đặc biệt", url: "/shop?category=Limited" },
      { text: "Quà tặng", url: "/shop?category=Gifts" }
    ];
  }

  // 2. Truy vấn danh sách sản phẩm thực tế từ Database
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true, visibility: "PUBLIC" },
    include: { 
      category: true,
      reviews: { select: { rating: true } }
    },
    orderBy: { createdAt: "desc" }
  });

  const featuredReviews = await ReviewService.getFeaturedReviews(6);

  // 3. Xác định danh sách sản phẩm hiển thị nổi bật
  let featuredProducts: any[] = [];

  if (dbProducts.length > 0) {
    const displayType = config.products.type || "latest";
    let sortedProducts = [...dbProducts];

    if (displayType === "manual") {
      let manualIds = [];
      try {
        const idsVal = await SettingsService.getValue("featured_products_manual_ids") || "[]";
        manualIds = typeof idsVal === "string" ? JSON.parse(idsVal) : idsVal;
      } catch (e) {
        manualIds = [];
      }
      if (Array.isArray(manualIds) && manualIds.length > 0) {
        sortedProducts = manualIds
          .map(id => dbProducts.find(p => p.id === id))
          .filter((p): p is typeof dbProducts[number] => !!p);
      } else {
        sortedProducts = dbProducts.slice(0, 8);
      }
    } else if (displayType === "best_selling") {
      sortedProducts.sort((a, b) => {
        const aReviews = a.reviews?.length || 0;
        const bReviews = b.reviews?.length || 0;
        return bReviews - aReviews;
      });
      sortedProducts = sortedProducts.slice(0, 8);
    } else {
      sortedProducts = dbProducts.slice(0, 8);
    }

    featuredProducts = sortedProducts.map((p, idx) => {
      let firstImage = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80';
      if (Array.isArray(p.images) && p.images.length > 0) {
        firstImage = p.images[0];
      }

      const reviews = (p as any).reviews || [];
      const reviewCount = reviews.length;
      const averageRating = reviewCount > 0 
        ? Number((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1))
        : 0;

      return {
        id: p.id,
        slug: p.slug,
        name: p.name,
        category: p.category?.name || "Cốc gốm",
        price: p.price,
        firstImage,
        imageBg: idx % 4 === 0 ? "bg-[#EAE2D8]" : idx % 4 === 1 ? "bg-[#D0D7DE]" : idx % 4 === 2 ? "bg-[#E6CDBE]" : "bg-[#E8D9C8]",
        badge: idx === 0 ? "Best Seller" : idx === 1 ? "BST Mới" : null,
        desc: p.description ? p.description.replace(/<[^>]*>/g, '').slice(0, 90) + '...' : "Cốc gốm chế tác thủ công tinh tế từ làng cổ Bát Tràng.",
        reviewCount,
        averageRating
      };
    });
  } else {
    // Dữ liệu mẫu ban đầu nếu DB hoàn toàn trống
    featuredProducts = [
      {
        id: "prod_1",
        slug: "coc-su-men-hoa-bien-rustic",
        name: "Đôi Cốc Nối Ấm Nâu",
        category: "Cốc Sứ Premium",
        price: 360000,
        firstImage: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
        imageBg: "bg-[#EAE2D8]",
        badge: "Best Seller",
        desc: "Men gốm tự nhiên nhám mộc, giữ nhiệt hoàn hảo cho trà và cà phê sữa ấm.",
        reviewCount: 0,
        averageRating: 0
      },
      {
        id: "prod_2",
        slug: "coc-thuy-tinh-hai-lop-chiu-nhiet",
        name: "Cốc Nối Mộc Lam",
        category: "Cốc Thủy Tinh Cao Cấp",
        price: 195000,
        firstImage: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&q=80",
        imageBg: "bg-[#D0D7DE]",
        badge: "BST Mới",
        desc: "Lớp men Lam truyền thống Bát Tràng được tinh giản theo hơi thở hiện đại.",
        reviewCount: 0,
        averageRating: 0
      }
    ];
  }

  // 4. Giải đáp thắc mắc FAQ (Đọc động từ SiteConfig)
  const faqs = config.faq.itemsRetail || [];
  const faqsB2b = config.faq.itemsB2b || [];

  // 5. Giá trị cốt lõi Cốc Nối
  const brandValueIcons = [
    <Sparkles className="w-6 h-6 text-accent" key="sparkles" />,
    <Heart className="w-6 h-6 text-accent" key="heart" />,
    <Shield className="w-6 h-6 text-accent" key="shield" />,
    <Award className="w-6 h-6 text-accent" key="award" />,
  ];
  const brandValues = (config.values.items || []).map((item: any, idx: number) => ({
    icon: brandValueIcons[idx % brandValueIcons.length],
    title: item.title,
    desc: item.desc
  }));

  return (
    <div className="w-full bg-canvas" style={{ backgroundColor: "var(--color-warm-white)" }}>
      
      {/* SECTION 1: HERO SECTION */}
      <section className="relative overflow-hidden bg-subtle border-b border-border py-20 md:py-32 lg:py-40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 flex flex-col items-start text-left z-10 font-bvp">
            <div className="inline-flex items-center gap-2 border border-border px-3.5 py-1.5 rounded-pill mb-6 bg-canvas shadow-xs">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ backgroundColor: "var(--color-terracotta)" }}></span>
              <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-secondary">
                {config.hero.badge}
              </span>
            </div>
            
            <h1 className="font-playfair font-semibold text-4xl md:text-6xl lg:text-7xl mb-6 text-primary leading-tight">
              {config.hero.title}
            </h1>
            
            <p className="font-bvp text-base md:text-lg text-secondary max-w-xl mb-10 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
              {config.hero.subtitle}
            </p>
            
            <div className="flex flex-wrap gap-4 w-full sm:w-auto">
              <Link 
                href="/shop"
                style={{ backgroundColor: "var(--color-deep-indigo)" }}
                className="inline-flex items-center justify-center bg-primary text-canvas font-bvp font-medium text-sm md:text-base px-8 py-4 rounded-2 hover:opacity-90 transition-all duration-300 w-full sm:w-auto text-center group"
              >
                {config.hero.ctaPrimary}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                href="/nguoi-noi"
                className="inline-flex items-center justify-center bg-transparent border border-border text-primary font-bvp font-medium text-sm md:text-base px-8 py-4 rounded-2 hover:bg-canvas hover:border-accent transition-all duration-300 w-full sm:w-auto text-center"
              >
                {config.hero.ctaSecondary}
              </Link>
            </div>
 
            {/* Quick Link Chips */}
            <div className="flex flex-wrap items-center gap-2.5 mt-10 md:mt-14 pt-6 border-t border-border/60 w-full">
              <span className="font-bvp text-xs font-bold text-secondary mr-2 uppercase tracking-wider">Tìm nhanh:</span>
              {quickChips.map((chip: any, idx: number) => (
                <Link 
                  key={idx}
                  href={chip.url}
                  className="font-bvp text-xs bg-canvas text-secondary hover:text-accent hover:border-accent border border-border px-3 py-1.5 rounded-2 transition-all"
                >
                  {chip.text}
                </Link>
              ))}
            </div>
          </div>

          {/* Styled Abstract Image / User Uploaded Image */}
          <div className="lg:col-span-5 relative w-full max-w-md mx-auto aspect-[3/4] flex items-center justify-center">
            {config.hero.imageUrl ? (
              <div className="absolute inset-0 rounded-6 overflow-hidden border border-border shadow-md">
                <img 
                  src={config.hero.imageUrl} 
                  alt="Cốc Nối Banner" 
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="absolute inset-0 bg-[#EFE9DF] rounded-6 transform rotate-2 overflow-hidden border border-border flex items-center justify-center">
                <div className="relative w-[75%] h-[80%] bg-[#FEFCF9] rounded-4 shadow-sm border border-border p-6 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#E5D7C2] opacity-40 blur-xl"></div>
                  <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-[#C2703E] opacity-10 blur-xl"></div>
                  
                  <div className="flex justify-between items-start">
                    <span className="font-playfair text-xl italic text-accent" style={{ color: "var(--color-terracotta)" }}>No.01</span>
                    <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-playfair font-semibold text-secondary">CN</div>
                  </div>

                  <div className="my-auto py-4 flex flex-col items-center">
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-primary drop-shadow-sm" style={{ color: "var(--color-deep-indigo)" }}>
                      <path d="M68,35 C82,35 82,65 68,65" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M28,30 L64,30 C64,30 64,72 46,72 C28,72 28,30 28,30 Z" fill="var(--color-cream)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                      <path d="M30,42 Q46,38 62,42" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                    <span className="font-quicksand font-light italic text-xs text-secondary mt-3 uppercase tracking-wider">Cốc Gốm Mộc Bát Tràng</span>
                  </div>

                  <div className="flex justify-between items-end border-t border-border pt-4">
                    <div>
                      <p className="font-bvp text-[10px] text-secondary">Chế tác</p>
                      <p className="font-bvp text-xs font-bold">100% Thủ Công</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bvp text-[10px] text-secondary">Nhiệt độ nung</p>
                      <p className="font-bvp text-xs font-bold">1250°C</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            <div 
              style={{ backgroundColor: "var(--color-terracotta)", borderColor: "var(--color-terracotta)" }}
              className="absolute bottom-4 left-4 bg-accent text-canvas font-playfair italic text-xs md:text-sm px-4 py-2.5 rounded-3 shadow-md -rotate-6 border"
            >
              "{config.hero.floatingLabel}"
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: SIGNATURE CAMPAIGN "NGƯỜI NỐI" */}
      <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
          
          {/* Campaign Visual Pane */}
          <div className="lg:col-span-6 relative w-full max-w-xl mx-auto aspect-[4/3] bg-subtle rounded-4 overflow-hidden border border-border p-8 flex flex-col justify-between">
            {config.campaign.heroImageUrl ? (
              <div className="absolute inset-0">
                <img 
                  src={config.campaign.heroImageUrl} 
                  alt="Nhân vật Người Nối" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--color-deep-indigo) 90%, transparent), transparent, transparent)" }}></div>
              </div>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
            )}
            
            <div className="z-10 bg-canvas/80 backdrop-blur-xs border border-border p-4 rounded-3 self-start max-w-xs">
              <span className="font-playfair text-accent font-semibold italic text-base" style={{ color: "var(--color-terracotta)" }}>
                Câu chuyện tiêu điểm
              </span>
              <p className="font-bvp text-xs text-secondary mt-1">
                "{config.campaign.heroName}"
              </p>
            </div>

            {!config.campaign.heroImageUrl && (
              <div className="my-auto flex justify-center z-10 py-6">
                <div className="w-40 h-40 rounded-full border-2 border-dashed border-accent/40 flex items-center justify-center p-3">
                  <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center">
                    <Users className="w-12 h-12 text-accent" style={{ color: "var(--color-terracotta)" }} />
                  </div>
                </div>
              </div>
            )}

            <div className="z-10 flex items-center justify-between mt-auto">
              <span className={`font-quicksand font-bold text-xs tracking-widest uppercase ${config.campaign.heroImageUrl ? "text-canvas" : "text-secondary"}`}>
                {config.campaign.badge}
              </span>
              <span className={`font-playfair italic text-xs truncate max-w-[200px] ${config.campaign.heroImageUrl ? "text-accent/90" : "text-primary"}`} style={{ color: config.campaign.heroImageUrl ? undefined : "var(--color-terracotta)" }}>
                "{config.campaign.heroQuote.slice(0, 30)}..."
              </span>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col items-start font-bvp">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3" style={{ color: "var(--color-terracotta)" }}>
              {config.campaign.badge}
            </span>
            <h2 className="font-playfair font-semibold text-3xl md:text-5xl mb-6 text-primary leading-tight">
              {config.campaign.title}
            </h2>
            <p className="font-bvp text-base text-secondary mb-6 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
              {config.campaign.desc}
            </p>
            
            {/* Highlighted character quote */}
            <div className="border-l-2 border-accent pl-4.5 py-1 mb-8 italic text-xs text-secondary font-bvp" style={{ borderColor: "var(--color-terracotta)" }}>
              <p className="font-semibold text-primary">"{config.campaign.heroQuote}"</p>
              <p className="mt-1 font-quicksand font-bold uppercase tracking-wider text-[10px]">— {config.campaign.heroName}</p>
            </div>

            <Link 
              href="/nguoi-noi"
              style={{ backgroundColor: "var(--color-terracotta)" }}
              className="inline-flex items-center justify-center bg-accent text-canvas font-bvp font-medium text-sm md:text-base px-7 py-3.5 rounded-2 hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              Đọc các câu chuyện "Người Nối"
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </div>

        </div>
      </section>

      {/* SECTION 3: FEATURED PRODUCTS */}
      <section className="py-20 md:py-28 bg-[#FCFAF5] border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4">
            <div>
              <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
                {config.products.tagline}
              </span>
              <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary">
                {config.products.title}
              </h2>
            </div>
            <Link 
              href="/shop" 
              className="font-bvp text-sm font-semibold text-primary hover:text-accent border-b border-primary hover:border-accent transition-colors pb-1 flex items-center gap-1.5"
              style={{ borderBottomColor: "var(--color-deep-indigo)" }}
            >
              Xem tất cả sản phẩm
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((prod) => (
              <div 
                key={prod.id} 
                className="group flex flex-col bg-canvas border border-border rounded-3 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`relative h-64 overflow-hidden flex items-center justify-center`}>
                  {prod.badge && (
                    <span 
                      style={{ backgroundColor: "var(--color-deep-indigo)" }}
                      className="absolute top-4 left-4 bg-primary text-canvas font-bvp text-[10px] font-bold px-2.5 py-1 rounded-1 uppercase tracking-wider z-10"
                    >
                      {prod.badge}
                    </span>
                  )}
                  
                  <Image 
                    src={prod.firstImage} 
                    alt={prod.name} 
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500" 
                  />

                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <Link 
                      href={`/shop/${prod.slug}`}
                      className="bg-canvas text-primary font-bvp font-medium text-xs px-4 py-2.5 rounded-2 border border-border shadow-xs hover:border-accent hover:text-accent transition-colors"
                    >
                      Chi tiết sản phẩm
                    </Link>
                  </div>
                </div>

                <div className="p-6 flex flex-col flex-grow">
                  <span className="font-bvp text-xs text-secondary mb-1.5">{prod.category}</span>
                  <h3 className="font-playfair text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                    {prod.name}
                  </h3>
                  
                  {/* Rating sao */}
                  <div className="flex items-center gap-1.5 mb-3">
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 ${
                            i < Math.floor(prod.averageRating || 0) 
                              ? "text-amber-400 fill-amber-400" 
                              : "text-border fill-border/20"
                          }`} 
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-secondary/60">
                      {prod.reviewCount > 0 ? `${prod.averageRating} (${prod.reviewCount} đánh giá)` : `(0 đánh giá)`}
                    </span>
                  </div>

                  <p className="font-bvp text-xs text-secondary leading-relaxed mb-4 flex-grow text-justify line-clamp-2" style={{ color: "var(--color-dark-brown)" }}>
                    {prod.desc}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                    <div>
                      <span className="font-bvp text-[10px] text-secondary block">Giá bán</span>
                      <span className="font-bvp text-sm font-bold text-secondary">
                        {prod.price.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    
                    <Link
                      href={`/shop/${prod.slug}`}
                      style={{ backgroundColor: "var(--color-terracotta)" }}
                      className="bg-accent hover:opacity-90 text-canvas font-bvp text-xs font-semibold px-3.5 py-2 rounded-2 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Chi tiết</span>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 4: THE COCNI STORY */}
      <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8 border-b border-border">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          <div className="lg:col-span-6 flex flex-col items-start font-bvp">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3" style={{ color: "var(--color-terracotta)" }}>
              {config.story.tagline}
            </span>
            <h2 className="font-playfair font-semibold text-3xl md:text-5xl mb-6 text-primary leading-tight">
              {config.story.title}
            </h2>
            <p className="font-bvp text-base text-secondary mb-5 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
              {config.story.desc1}
            </p>
            <p className="font-bvp text-base text-secondary mb-8 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
              {config.story.desc2}
            </p>
            
            <div className="grid grid-cols-2 gap-6 w-full border-t border-border pt-8">
              <div>
                <p className="font-playfair text-3xl font-bold text-accent" style={{ color: "var(--color-terracotta)" }}>
                  {config.story.stat1Val}
                </p>
                <p className="font-bvp text-xs text-secondary mt-1">{config.story.stat1Lbl}</p>
              </div>
              <div>
                <p className="font-playfair text-3xl font-bold text-accent" style={{ color: "var(--color-terracotta)" }}>
                  {config.story.stat2Val}
                </p>
                <p className="font-bvp text-xs text-secondary mt-1">{config.story.stat2Lbl}</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 grid grid-cols-2 gap-4">
            <div className="bg-subtle rounded-4 border border-border flex items-center justify-center text-center aspect-square overflow-hidden relative">
              {config.story.features?.[0]?.imgUrl ? (
                <img src={config.story.features[0].imgUrl} alt="Đặc trưng 1" className="w-full h-full object-cover" />
              ) : (
                <div className="text-secondary/50 font-bvp text-xs">Ảnh đặc trưng 1</div>
              )}
            </div>
            <div className="bg-canvas rounded-4 border border-border flex items-center justify-center text-center aspect-square mt-6 overflow-hidden relative">
              {config.story.features?.[1]?.imgUrl ? (
                <img src={config.story.features[1].imgUrl} alt="Đặc trưng 2" className="w-full h-full object-cover" />
              ) : (
                <div className="text-secondary/50 font-bvp text-xs">Ảnh đặc trưng 2</div>
              )}
            </div>
            <div className="bg-canvas rounded-4 border border-border flex items-center justify-center text-center aspect-square -mt-6 overflow-hidden relative">
              {config.story.features?.[2]?.imgUrl ? (
                <img src={config.story.features[2].imgUrl} alt="Đặc trưng 3" className="w-full h-full object-cover" />
              ) : (
                <div className="text-secondary/50 font-bvp text-xs">Ảnh đặc trưng 3</div>
              )}
            </div>
            <div className="bg-subtle rounded-4 border border-border flex items-center justify-center text-center aspect-square overflow-hidden relative">
              {config.story.features?.[3]?.imgUrl ? (
                <img src={config.story.features[3].imgUrl} alt="Đặc trưng 4" className="w-full h-full object-cover" />
              ) : (
                <div className="text-secondary/50 font-bvp text-xs">Ảnh đặc trưng 4</div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: BRAND VALUES */}
      <section className="py-20 md:py-24 bg-subtle/40 border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 font-bvp">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
              {config.values.tagline}
            </span>
            <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary mb-4">
              {config.values.title}
            </h2>
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify max-w-3xl mx-auto" style={{ color: "var(--color-dark-brown)" }}>
              {config.values.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {brandValues.map((value, idx) => (
              <div 
                key={idx} 
                className="bg-canvas p-8 rounded-3 border border-border flex flex-col items-start hover:border-accent transition-colors duration-300"
                style={{ borderColor: "transparent", borderStyle: "solid", borderWidth: "1px" }}
              >
                <div className="mb-6 p-3 rounded-2 bg-subtle">{value.icon}</div>
                <h3 className="font-playfair text-lg font-bold text-primary mb-3">
                  {value.title}
                </h3>
                <p className="font-bvp text-xs text-secondary leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
                  {value.desc}
                </p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION TESTIMONIALS */}
      <TestimonialSection reviews={featuredReviews as any} />

      {/* SECTION 6: FAQ ACCORDION */}
      <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8">
        
        <div className="text-center mb-12 md:mb-16 font-bvp">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
            {config.faq.tagline}
          </span>
          <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary">
            {config.faq.title}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          
          {/* Cột Khách Lẻ */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center border border-border shrink-0">
                <Users className="w-5 h-5 text-accent" style={{ color: "var(--color-terracotta)" }} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-primary">
                {config.faq.retailTitle}
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {faqs.map((faq: any, idx: number) => (
                <details 
                  key={idx} 
                  className="group bg-canvas border border-border rounded-3 overflow-hidden transition-all duration-300"
                >
                  <summary className="w-full list-none flex items-center justify-between px-6 py-5 text-left font-playfair font-semibold text-primary text-base hover:text-accent transition-colors cursor-pointer select-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.q || faq.question}</span>
                    <ChevronDown className="w-5 h-5 text-secondary group-open:rotate-180 transition-transform duration-300 shrink-0" />
                  </summary>
                  
                  <div className="px-6 py-5 font-bvp text-sm text-secondary leading-relaxed bg-subtle/30 border-t border-border" style={{ color: "var(--color-dark-brown)" }}>
                    {faq.a || faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

          {/* Cột Khách Sỉ */}
          <div>
            <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
              <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center border border-border shrink-0">
                <Award className="w-5 h-5 text-accent" style={{ color: "var(--color-terracotta)" }} />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-primary">
                {config.faq.b2bTitle}
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {faqsB2b.map((faq: any, idx: number) => (
                <details 
                  key={idx} 
                  className="group bg-canvas border border-border rounded-3 overflow-hidden transition-all duration-300"
                >
                  <summary className="w-full list-none flex items-center justify-between px-6 py-5 text-left font-playfair font-semibold text-primary text-base hover:text-accent transition-colors cursor-pointer select-none [&::-webkit-details-marker]:hidden">
                    <span>{faq.q || faq.question}</span>
                    <ChevronDown className="w-5 h-5 text-secondary group-open:rotate-180 transition-transform duration-300 shrink-0" />
                  </summary>
                  
                  <div className="px-6 py-5 font-bvp text-sm text-secondary leading-relaxed bg-subtle/30 border-t border-border" style={{ color: "var(--color-dark-brown)" }}>
                    {faq.a || faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </div>

        </div>

        <div className="text-center mt-12 font-bvp">
          <p className="font-bvp text-sm text-secondary mb-4">Bạn vẫn còn câu hỏi khác?</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            
            {/* 1. Nút Form Liên Hệ */}
            <Link 
              href="/contact" 
              style={{ backgroundColor: "var(--color-deep-indigo)" }}
              className="inline-flex items-center gap-2 bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <span>Form Liên hệ</span>
            </Link>

            {/* 2. Nút Zalo */}
            <a 
              href={config.social.zalo || "https://zalo.me/"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#0068FF] text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              {/* Zalo Logo SVG */}
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M21.547 12.016c0-4.32-3.805-7.838-8.496-7.838-4.693 0-8.498 3.518-8.498 7.838 0 4.045 3.321 7.371 7.64 7.801l.836 2.399c.095.27.424.331.62.115l3.228-3.504a8.91 8.91 0 0 0 4.67-6.811z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8.5 12h7M8.5 9h7M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>Chat qua Zalo</span>
            </a>

            {/* 3. Nút Facebook */}
            <a 
              href={config.social.facebook || "https://facebook.com/"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#1877F2] text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              {/* Standard Facebook SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Facebook</span>
            </a>

            {/* 4. Nút Instagram */}
            <a 
              href={config.social.instagram || "https://instagram.com/"} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              {/* Standard Instagram SVG */}
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
              </svg>
              <span>Instagram</span>
            </a>
          </div>
        </div>

      </section>

    </div>
  );
}
