import { prisma } from "@/lib/prisma";
import React from "react";
import { Sparkles, Heart, Shield, Award } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";
import { SettingsService } from "@/lib/services/settings.service";
import { ReviewService } from "@/lib/services/review.service";
import TestimonialSection from "@/components/store/TestimonialSection";
import HeroSection from "@/components/store/HomepageSections/HeroSection";
import CampaignSection from "@/components/store/HomepageSections/CampaignSection";
import ProductsSection from "@/components/store/HomepageSections/ProductsSection";
import StorySection from "@/components/store/HomepageSections/StorySection";
import ValuesSection from "@/components/store/HomepageSections/ValuesSection";
import FaqSection from "@/components/store/HomepageSections/FaqSection";

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
    where: { isActive: true },
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
      const manualIds = config.products.manualProductIds || [];
      if (manualIds.length > 0) {
        sortedProducts = manualIds
          .map(id => dbProducts.find(p => p.id === id))
          .filter((p): p is typeof dbProducts[number] => !!p);
      } else {
        sortedProducts = dbProducts.slice(0, 8);
      }
    } else if (displayType === "bestseller") {
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
        desc: p.shortDescription || p.description?.slice(0, 100) || "",
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

  // 6. Sắp xếp và hiển thị các section theo cấu hình
  const visibleSections = (config.homepage?.sections || [])
    .filter((s: any) => s.visible)
    .map((s: any) => s.key);

  const sectionComponents: Record<string, React.ReactElement> = {
    hero: <HeroSection config={config.hero} quickChips={quickChips} />,
    campaign: <CampaignSection config={config.campaign} />,
    products: <ProductsSection config={config.products} products={featuredProducts} />,
    story: <StorySection config={config.story} />,
    values: <ValuesSection config={config.values} brandValues={brandValues} />,
    faq: <FaqSection config={config.faq} faqs={faqs} faqsB2b={faqsB2b} />
  };

  return (
    <div className="w-full bg-canvas" style={{ backgroundColor: "var(--color-warm-white)" }}>
      {visibleSections.map((key: string) => (
        <React.Fragment key={key}>
          {sectionComponents[key]}
          {/* Render Testimonials ngay sau Values nếu Values hiển thị */}
          {key === "values" && <TestimonialSection reviews={featuredReviews as any} />}
        </React.Fragment>
      ))}
      {/* Fallback nếu không có Values trong list hiển thị thì render Testimonials ở dưới cùng */}
      {!visibleSections.includes("values") && (
        <TestimonialSection reviews={featuredReviews as any} />
      )}
    </div>
  );
}
