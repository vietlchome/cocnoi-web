"use client";

import { useState } from "react";
import { setThemeSetting } from "@/lib/actions/content.actions";
import { FormField } from "@/components/ui/FormField";
import ImageCropUploader from "@/components/admin/ImageCropUploader";
import BrandColorPicker from "@/components/admin/BrandColorPicker";
import FaqListEditor, { FaqItem } from "@/components/admin/FaqListEditor";
import { 
  Save, 
  ChevronDown, 
  ChevronUp, 
  Image as ImageIcon, 
  Layout, 
  Megaphone, 
  ShoppingBag, 
  BookOpen, 
  Star, 
  HelpCircle, 
  Loader2,
  Plus,
  Trash2
} from "lucide-react";

interface ProductOption {
  id: string;
  name: string;
  slug: string;
}

interface HomepageCustomizerClientProps {
  initialSettings: Record<string, any>;
  products: ProductOption[];
}

interface QuickChip {
  text: string;
  url: string;
}

export default function HomepageCustomizerClient({ 
  initialSettings,
  products 
}: HomepageCustomizerClientProps) {
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string>("hero");

  // SECTION 1: HERO
  const [heroTitle, setHeroTitle] = useState(initialSettings.hero_title || "Kết tình thân, Nối tinh thần.");
  const [heroSubtitle, setHeroSubtitle] = useState(
    initialSettings.hero_subtitle || 
    "Mỗi chiếc cốc gốm thủ công Cốc Nối chứa đựng tâm huyết của những nghệ nhân Bát Tràng và khát vọng gắn kết những tâm hồn đồng điệu."
  );
  const [heroCtaText, setHeroCtaText] = useState(initialSettings.hero_cta_text || "Khám phá Cửa Hàng");
  const [heroImageUrl, setHeroImageUrl] = useState(initialSettings.hero_image_url || "");
  const [quickChips, setQuickChips] = useState<QuickChip[]>(() => {
    try {
      return initialSettings.hero_quick_chips 
        ? JSON.parse(initialSettings.hero_quick_chips) 
        : [
            { text: "Cốc có quai", url: "/shop?category=Mugs" },
            { text: "Cốc không quai", url: "/shop?category=Beakers" },
            { text: "BST Đặc biệt", url: "/shop?category=Limited" },
            { text: "Quà tặng", url: "/shop?category=Gifts" }
          ];
    } catch {
      return [
        { text: "Cốc có quai", url: "/shop?category=Mugs" },
        { text: "Cốc không quai", url: "/shop?category=Beakers" },
        { text: "BST Đặc biệt", url: "/shop?category=Limited" },
        { text: "Quà tặng", url: "/shop?category=Gifts" }
      ];
    }
  });

  // SECTION 2: SIGNATURE CAMPAIGN
  const [campaignBadge, setCampaignBadge] = useState(initialSettings.campaign_badge || "Signature Campaign");
  const [campaignTitle, setCampaignTitle] = useState(
    initialSettings.campaign_title || "Chiến dịch 'Người Nối' - Vinh danh sự gắn kết thầm lặng."
  );
  const [campaignDesc, setCampaignDesc] = useState(
    initialSettings.campaign_desc || 
    "Lấy cảm hứng từ những cống hiến âm thầm của cộng đồng, Người Nối là chiến dịch trọng tâm của Cốc Nối nhằm tôn vinh những người lao động nghệ thuật, những người kết nối sợi dây tình cảm trong gia đình và xã hội."
  );
  const [campaignHeroName, setCampaignHeroName] = useState(initialSettings.campaign_hero_name || "Bác Cường Lò Bầu");
  const [campaignHeroQuote, setCampaignHeroQuote] = useState(
    initialSettings.campaign_hero_quote || 
    "Đất có linh hồn, gốm có sinh mệnh. Người thợ chỉ là người đánh thức vẻ đẹp ẩn sâu trong đó."
  );
  const [campaignHeroImageUrl, setCampaignHeroImageUrl] = useState(initialSettings.campaign_hero_image_url || "");

  // SECTION 3: FEATURED PRODUCTS
  const [featuredProductsTagline, setFeaturedProductsTagline] = useState(
    initialSettings.featured_products_tagline || "Cốc Gốm Mộc Chọn Lọc"
  );
  const [featuredProductsTitle, setFeaturedProductsTitle] = useState(
    initialSettings.featured_products_title || "Sản phẩm nổi bật"
  );
  const [featuredProductsType, setFeaturedProductsType] = useState<"latest" | "best_selling" | "manual">(
    initialSettings.featured_products_type || "latest"
  );
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => {
    try {
      return initialSettings.featured_products_manual_ids 
        ? JSON.parse(initialSettings.featured_products_manual_ids) 
        : [];
    } catch {
      return [];
    }
  });

  // SECTION 4: THE STORY
  const [introTagline, setIntroTagline] = useState(initialSettings.intro_tagline || "Heritage & Craft");
  const [introTitle, setIntroTitle] = useState(initialSettings.intro_title || "Khởi nguồn từ lòng đất, Giữ lửa qua ba thập kỷ.");
  const [introDesc1, setIntroDesc1] = useState(
    initialSettings.intro_desc_1 || 
    "Năm 1994, giữa lòng ngôi làng cổ Bát Tràng có bề dày lịch sử hơn 700 năm, một lò nung gốm nhỏ gia đình đã đỏ lửa. Đó chính là khởi đầu của Cốc Nối ngày nay."
  );
  const [introDesc2, setIntroDesc2] = useState(
    initialSettings.intro_desc_2 || 
    "Chúng tôi tin rằng, một sản phẩm gốm tốt không chỉ nằm ở chất đất đanh, lớp men mịn mà còn nằm ở sự truyền tải cảm xúc. Mỗi mẻ gốm của Cốc Nối được làm từ đất sét lọc kỹ, xoay tay thủ công cẩn trọng, tráng men tự nhiên và nung ở nhiệt độ tiêu chuẩn để đảm bảo sự gắn kết tuyệt đối của xương gốm."
  );
  const [introStat1Val, setIntroStat1Val] = useState(initialSettings.intro_stat_1_val || "30+");
  const [introStat1Lbl, setIntroStat1Lbl] = useState(initialSettings.intro_stat_1_lbl || "Năm giữ lửa");
  const [introStat2Val, setIntroStat2Val] = useState(initialSettings.intro_stat_2_val || "100k+");
  const [introStat2Lbl, setIntroStat2Lbl] = useState(initialSettings.intro_stat_2_lbl || "Cốc gốm trao tay");

  // 4 Features of the Story (Images only)
  const [introFeat1ImgUrl, setIntroFeat1ImgUrl] = useState(initialSettings.intro_feat_1_img_url || "");
  const [introFeat2ImgUrl, setIntroFeat2ImgUrl] = useState(initialSettings.intro_feat_2_img_url || "");
  const [introFeat3ImgUrl, setIntroFeat3ImgUrl] = useState(initialSettings.intro_feat_3_img_url || "");
  const [introFeat4ImgUrl, setIntroFeat4ImgUrl] = useState(initialSettings.intro_feat_4_img_url || "");

  // SECTION 5: BRAND VALUES
  const [valuesTagline, setValuesTagline] = useState(initialSettings.values_tagline || "Core Principles");
  const [valuesTitle, setValuesTitle] = useState(initialSettings.values_title || "Giá trị Cốc Nối");
  const [valuesDesc, setValuesDesc] = useState(
    initialSettings.values_desc || 
    "Chúng tôi gìn giữ những giá trị nguyên bản nhất của gốm thủ công để mang đến trải nghiệm chạm tinh tế nhất cho khách hàng."
  );

  // 4 Brand Values
  const [value1Title, setValue1Title] = useState(initialSettings.value_1_title || "Mộc Mạc");
  const [value1Desc, setValue1Desc] = useState(
    initialSettings.value_1_desc || "Không trang điểm bóng bẩy. Giữ trọn texture tự nhiên của đất nung Bát Tràng và lớp vân men độc bản."
  );
  const [value2Title, setValue2Title] = useState(initialSettings.value_2_title || "Chân Thành");
  const [value2Desc, setValue2Desc] = useState(
    initialSettings.value_2_desc || "Mỗi sản phẩm đi kèm một câu chuyện thật, một thông điệp chân thành gửi gắm sự kết nối tình thân."
  );
  const [value3Title, setValue3Title] = useState(initialSettings.value_3_title || "Bền Bỉ");
  const [value3Desc, setValue3Desc] = useState(
    initialSettings.value_3_desc || "Gốm nung ở nhiệt độ cao trên 1250°C, đảm bảo độ bền cơ học cao, an toàn tuyệt đối khi sử dụng."
  );
  const [value4Title, setValue4Title] = useState(initialSettings.value_4_title || "Chỉn Chu");
  const [value4Desc, setValue4Desc] = useState(
    initialSettings.value_4_desc || "Từ khâu vuốt gốm, bọc gói bao bì kraft đến thiệp viết tay chân thành trao gửi khách hàng."
  );

  // SECTION 6: FAQ
  const [faqTagline, setFaqTagline] = useState(initialSettings.faq_tagline || "Bạn muốn hỏi?");
  const [faqTitle, setFaqTitle] = useState(initialSettings.faq_title || "Giải đáp thắc mắc");
  const [faqRetailTitle, setFaqRetailTitle] = useState(initialSettings.faq_retail_title || "Khách hàng lẻ");
  const [faqB2bTitle, setFaqB2bTitle] = useState(initialSettings.faq_b2b_title || "Đối tác doanh nghiệp (B2B)");
  
  const [faqItems, setFaqItems] = useState<FaqItem[]>(() => {
    try {
      return initialSettings.faq_items 
        ? JSON.parse(initialSettings.faq_items) 
        : [
            {
              question: "Gốm Cốc Nối có an toàn khi sử dụng với lò vi sóng và máy rửa bát không?",
              answer: "Có. Gốm Cốc Nối được nung ở nhiệt độ cao (>1250°C), kết cấu xương gốm đanh chắc và men tự nhiên không chứa chì. Sản phẩm hoàn toàn an toàn khi sử dụng trong lò vi sóng, lò nướng và máy rửa bát."
            },
            {
              question: "Tôi muốn mua làm quà tặng, Cốc Nối có hỗ trợ đóng gói và viết thiệp không?",
              answer: "Tất cả sản phẩm Cốc Nối khi gửi đi đều được đóng gói chỉn chu trong hộp bồi kraft lót rơm mộc mạc. Chúng tôi luôn tặng kèm một tấm thiệp nhỏ, bạn có thể tự viết hoặc để lại lời nhắn, chúng tôi sẽ viết tay giúp bạn."
            },
            {
              question: "Tôi ở xa, nếu quá trình vận chuyển bị vỡ hỏng thì sao?",
              answer: "Cốc Nối đóng gói chống sốc vô cùng cẩn thận với nhiều lớp bảo vệ an toàn. Nếu không may sản phẩm bị nứt vỡ do vận chuyển, bạn chỉ cần gửi video quay lúc mở hàng, chúng tôi sẽ đền bù sản phẩm mới 100% hoàn toàn miễn phí."
            },
            {
              question: "Mỗi chiếc cốc có giống hệt nhau như trong ảnh không?",
              answer: "Vì là sản phẩm vuốt tay và tráng men thủ công 100%, mỗi chiếc cốc sẽ có sự biến thiên nhỏ về màu men và vân hỏa biến (tùy vào vị trí đặt trong lò nung). Đó chính là nét độc bản (unique) làm nên giá trị của gốm thủ công Cốc Nối."
            },
            {
              question: "Thời gian giao hàng là bao lâu?",
              answer: "Các đơn hàng nội thành Hà Nội thường nhận được trong 1-2 ngày. Các tỉnh thành khác từ 3-5 ngày làm việc."
            }
          ];
    } catch {
      return [];
    }
  });

  const [faqItemsB2b, setFaqItemsB2b] = useState<FaqItem[]>(() => {
    try {
      return initialSettings.faq_items_b2b 
        ? JSON.parse(initialSettings.faq_items_b2b) 
        : [
            {
              question: "Cốc Nối có nhận sản xuất số lượng lớn và in logo doanh nghiệp không?",
              answer: "Có. Chúng tôi cung cấp giải pháp quà tặng doanh nghiệp toàn diện. Cốc Nối hỗ trợ thiết kế logo khắc chìm, in decal nung hoặc vẽ tay lên sản phẩm với số lượng linh hoạt, giúp tôn vinh dấu ấn thương hiệu của bạn."
            },
            {
              question: "Số lượng đặt hàng tối thiểu (MOQ) cho đơn B2B là bao nhiêu?",
              answer: "Để có mức chiết khấu tốt nhất, số lượng tối thiểu cho một đơn hàng tùy chỉnh logo thường từ 50 - 100 sản phẩm. Tuy nhiên, chúng tôi luôn linh hoạt hỗ trợ các doanh nghiệp vừa và nhỏ với số lượng phù hợp."
            },
            {
              question: "Thời gian hoàn thành một đơn hàng doanh nghiệp là bao lâu?",
              answer: "Thời gian sản xuất phụ thuộc vào số lượng và độ phức tạp của thiết kế. Thông thường quá trình làm đất, vuốt tay, phơi khô và nung lò sẽ mất khoảng 15-25 ngày làm việc."
            },
            {
              question: "Chúng tôi có được xem mẫu thực tế trước khi sản xuất hàng loạt không?",
              answer: "Chắc chắn rồi. Trước khi tiến hành sản xuất hàng loạt, Cốc Nối luôn làm mẫu thực tế (gồm cả việc khắc/in logo) gửi tới doanh nghiệp để kiểm duyệt chất lượng, màu sắc và kiểu dáng."
            },
            {
              question: "Chính sách chiết khấu và thanh toán cho đối tác B2B như thế nào?",
              answer: "Cốc Nối có thang chiết khấu rất hấp dẫn tùy theo số lượng đặt hàng. Quy trình thanh toán thường chia làm 2 đợt: đặt cọc 50% khi chốt mẫu và thanh toán 50% trước khi giao hàng. Vui lòng liên hệ Hotline để nhận báo giá chi tiết."
            }
          ];
    } catch {
      return [];
    }
  });

  const toggleSection = (section: string) => {
    setOpenSection(openSection === section ? "" : section);
  };

  const handleChipChange = (index: number, field: keyof QuickChip, val: string) => {
    const updated = quickChips.map((chip, i) => {
      if (i === index) {
        return { ...chip, [field]: val };
      }
      return chip;
    });
    setQuickChips(updated);
  };

  const handleAddChip = () => {
    setQuickChips([...quickChips, { text: "Từ khóa mới", url: "/shop" }]);
  };

  const handleDeleteChip = (index: number) => {
    setQuickChips(quickChips.filter((_, i) => i !== index));
  };

  const handleProductSelect = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter(id => id !== productId));
    } else {
      if (selectedProductIds.length >= 8) {
        alert("Chỉ cho phép chọn tối đa 8 sản phẩm hiển thị nổi bật.");
        return;
      }
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [
        // SECTION 1: HERO
        { key: "hero_title", value: heroTitle },
        { key: "hero_subtitle", value: heroSubtitle },
        { key: "hero_cta_text", value: heroCtaText },
        { key: "hero_image_url", value: heroImageUrl },
        { key: "hero_quick_chips", value: JSON.stringify(quickChips) },

        // SECTION 2: CAMPAIGN
        { key: "campaign_badge", value: campaignBadge },
        { key: "campaign_title", value: campaignTitle },
        { key: "campaign_desc", value: campaignDesc },
        { key: "campaign_hero_name", value: campaignHeroName },
        { key: "campaign_hero_quote", value: campaignHeroQuote },
        { key: "campaign_hero_image_url", value: campaignHeroImageUrl },

        // SECTION 3: PRODUCTS
        { key: "featured_products_tagline", value: featuredProductsTagline },
        { key: "featured_products_title", value: featuredProductsTitle },
        { key: "featured_products_type", value: featuredProductsType },
        { key: "featured_products_manual_ids", value: JSON.stringify(selectedProductIds) },

        // SECTION 4: THE STORY
        { key: "intro_tagline", value: introTagline },
        { key: "intro_title", value: introTitle },
        { key: "intro_desc_1", value: introDesc1 },
        { key: "intro_desc_2", value: introDesc2 },
        { key: "intro_stat_1_val", value: introStat1Val },
        { key: "intro_stat_1_lbl", value: introStat1Lbl },
        { key: "intro_stat_2_val", value: introStat2Val },
        { key: "intro_stat_2_lbl", value: introStat2Lbl },
        
        { key: "intro_feat_1_img_url", value: introFeat1ImgUrl },
        { key: "intro_feat_2_img_url", value: introFeat2ImgUrl },
        { key: "intro_feat_3_img_url", value: introFeat3ImgUrl },
        { key: "intro_feat_4_img_url", value: introFeat4ImgUrl },

        // SECTION 5: VALUES
        { key: "values_tagline", value: valuesTagline },
        { key: "values_title", value: valuesTitle },
        { key: "values_desc", value: valuesDesc },

        { key: "value_1_title", value: value1Title },
        { key: "value_1_desc", value: value1Desc },
        { key: "value_2_title", value: value2Title },
        { key: "value_2_desc", value: value2Desc },
        { key: "value_3_title", value: value3Title },
        { key: "value_3_desc", value: value3Desc },
        { key: "value_4_title", value: value4Title },
        { key: "value_4_desc", value: value4Desc },

        // SECTION 6: FAQ
        { key: "faq_tagline", value: faqTagline },
        { key: "faq_title", value: faqTitle },
        { key: "faq_retail_title", value: faqRetailTitle },
        { key: "faq_b2b_title", value: faqB2bTitle },
        { key: "faq_items", value: JSON.stringify(faqItems) },
        { key: "faq_items_b2b", value: JSON.stringify(faqItemsB2b) },
      ];

      // Upsert parallelly
      await Promise.all(updates.map((up) => setThemeSetting(up.key, up.value)));

      alert("Lưu cấu hình chi tiết Trang Chủ thành công! Hệ thống đã được cập nhật trực tiếp ra ngoài Cửa Hàng.");
    } catch (err: any) {
      alert(err.message || "Lỗi lưu cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 font-bvp">
      {/* Floating Save Button Bar */}
      <div className="flex items-center justify-between p-4 border border-border/40 rounded-3 bg-canvas/90 backdrop-blur-md sticky top-16 z-20 shadow-xs">
        <div>
          <h2 className="font-playfair text-base font-bold text-primary">Tùy Chỉnh Trang Chủ</h2>
          <p className="text-[10px] text-secondary mt-0.5">Lưu ý: Bấm nút bên phải sau khi chỉnh sửa xong các phần để đồng bộ.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2.5 px-5 rounded-2 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-60 shrink-0"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Lưu thay đổi</span>
        </button>
      </div>

      {/* Accordion form sections */}
      <div className="space-y-4">
        
        {/* SECTION 1: HERO */}
        <div className="border border-border/40 rounded-3 bg-canvas overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection("hero")}
            className="w-full px-6 py-4.5 bg-subtle/20 flex items-center justify-between text-left cursor-pointer border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <Layout className="w-5 h-5 text-accent shrink-0" />
              <div>
                <h3 className="font-playfair font-bold text-sm text-primary">Khối 1: Banner chính (Hero Section)</h3>
                <p className="text-[10px] text-secondary mt-0.5">Tiêu đề lớn, mô tả phụ, nút kêu gọi hành động & 4 từ khóa tìm nhanh.</p>
              </div>
            </div>
            {openSection === "hero" ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
          </button>

          {openSection === "hero" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Tiêu đề chính (Hero Title)" required>
                  <input
                    type="text"
                    value={heroTitle}
                    onChange={(e) => setHeroTitle(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-semibold"
                  />
                </FormField>
                <FormField label="Chữ trên nút bấm (CTA Button Text)" required>
                  <input
                    type="text"
                    value={heroCtaText}
                    onChange={(e) => setHeroCtaText(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                  />
                </FormField>
              </div>

              <FormField label="Đoạn mô tả phụ (Hero Subtitle)" required>
                <textarea
                  value={heroSubtitle}
                  onChange={(e) => setHeroSubtitle(e.target.value)}
                  rows={3}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all leading-relaxed"
                />
              </FormField>

              <ImageCropUploader
                label="Hình ảnh Banner Hero (Đứng)"
                value={heroImageUrl}
                onChange={setHeroImageUrl}
                aspectRatio={3 / 4}
                recommendedSize="900x1200px (Tỷ lệ 3:4)"
                folder="theme"
              />

              {/* Quick search chips editor */}
              <div className="border-t border-border/20 pt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-primary block">Các Từ Khóa Tìm Nhanh (Chips)</span>
                    <span className="text-[10px] text-secondary block mt-0.5">Hiển thị các từ khóa tắt để khách hàng tìm kiếm nhanh sản phẩm</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddChip}
                    disabled={quickChips.length >= 6}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-border hover:border-accent text-secondary hover:text-accent font-bold rounded-2 bg-canvas transition-colors cursor-pointer text-[10px]"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm từ khóa</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {quickChips.map((chip, idx) => (
                    <div key={idx} className="flex gap-2 p-3 border border-border/60 rounded-2 bg-subtle/10 items-center justify-between">
                      <div className="flex-grow grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={chip.text}
                          onChange={(e) => handleChipChange(idx, "text", e.target.value)}
                          placeholder="Chữ hiển thị"
                          className="text-[11px] bg-canvas border border-border/40 px-2 py-1.5 rounded focus:outline-none font-bold"
                        />
                        <input
                          type="text"
                          value={chip.url}
                          onChange={(e) => handleChipChange(idx, "url", e.target.value)}
                          placeholder="Đường dẫn link"
                          className="text-[11px] bg-canvas border border-border/40 px-2 py-1.5 rounded focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteChip(idx)}
                        className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded transition-colors cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 2: SIGNATURE CAMPAIGN */}
        <div className="border border-border/40 rounded-3 bg-canvas overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection("campaign")}
            className="w-full px-6 py-4.5 bg-subtle/20 flex items-center justify-between text-left cursor-pointer border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <Megaphone className="w-5 h-5 text-accent shrink-0" />
              <div>
                <h3 className="font-playfair font-bold text-sm text-primary">Khối 2: Chiến dịch (Signature Campaign)</h3>
                <p className="text-[10px] text-secondary mt-0.5">Khối kể chuyện tiêu điểm - Tôn vinh gắn kết thầm lặng.</p>
              </div>
            </div>
            {openSection === "campaign" ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
          </button>

          {openSection === "campaign" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Nhãn chiến dịch (Badge text)" required>
                  <input
                    type="text"
                    value={campaignBadge}
                    onChange={(e) => setCampaignBadge(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all uppercase tracking-wider font-bold"
                  />
                </FormField>
                <FormField label="Tên nhân vật tiêu điểm" required>
                  <input
                    type="text"
                    value={campaignHeroName}
                    onChange={(e) => setCampaignHeroName(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-semibold"
                  />
                </FormField>
              </div>

              <FormField label="Tiêu đề khối chiến dịch" required>
                <input
                  type="text"
                  value={campaignTitle}
                  onChange={(e) => setCampaignTitle(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-bold"
                />
              </FormField>

              <FormField label="Nội dung mô tả ngắn" required>
                <textarea
                  value={campaignDesc}
                  onChange={(e) => setCampaignDesc(e.target.value)}
                  rows={3.5}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all leading-relaxed"
                />
              </FormField>

              <FormField label="Trích dẫn truyền cảm hứng" required>
                <textarea
                  value={campaignHeroQuote}
                  onChange={(e) => setCampaignHeroQuote(e.target.value)}
                  rows={2.5}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all italic leading-relaxed"
                />
              </FormField>

              <ImageCropUploader
                label="Hình ảnh nhân vật chiến dịch (Ngang)"
                value={campaignHeroImageUrl}
                onChange={setCampaignHeroImageUrl}
                aspectRatio={4 / 3}
                recommendedSize="1200x900px (Tỷ lệ 4:3)"
                folder="theme"
              />
            </div>
          )}
        </div>

        {/* SECTION 3: FEATURED PRODUCTS */}
        <div className="border border-border/40 rounded-3 bg-canvas overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection("products")}
            className="w-full px-6 py-4.5 bg-subtle/20 flex items-center justify-between text-left cursor-pointer border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <ShoppingBag className="w-5 h-5 text-accent shrink-0" />
              <div>
                <h3 className="font-playfair font-bold text-sm text-primary">Khối 3: Sản phẩm Nổi bật (Featured Products)</h3>
                <p className="text-[10px] text-secondary mt-0.5">Tiêu đề phụ, tiêu đề chính, và cài đặt nguồn sản phẩm hiển thị.</p>
              </div>
            </div>
            {openSection === "products" ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
          </button>

          {openSection === "products" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Tagline phụ" required>
                  <input
                    type="text"
                    value={featuredProductsTagline}
                    onChange={(e) => setFeaturedProductsTagline(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all uppercase tracking-wider font-bold"
                  />
                </FormField>
                <FormField label="Tiêu đề chính" required>
                  <input
                    type="text"
                    value={featuredProductsTitle}
                    onChange={(e) => setFeaturedProductsTitle(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-bold"
                  />
                </FormField>
              </div>

              {/* Source Type selection */}
              <FormField label="Kiểu lấy sản phẩm hiển thị">
                <select
                  value={featuredProductsType}
                  onChange={(e) => setFeaturedProductsType(e.target.value as any)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3.5 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all cursor-pointer font-bold"
                >
                  <option value="latest">Sản phẩm mới cập nhật nhất (Mặc định)</option>
                  <option value="best_selling">Sản phẩm bán chạy nhất</option>
                  <option value="manual">Chọn sản phẩm thủ công theo bộ sưu tập (Tối đa 8)</option>
                </select>
              </FormField>

              {/* Manual selection component */}
              {featuredProductsType === "manual" && (
                <div className="border border-border/60 rounded-3 bg-subtle/10 p-5 space-y-3">
                  <div>
                    <span className="text-xs font-bold text-primary block">Danh sách sản phẩm cửa hàng</span>
                    <span className="text-[10px] text-secondary block mt-0.5">
                      Đã chọn ({selectedProductIds.length}/8). Tích chọn các cốc gốm bạn muốn xuất hiện ngoài trang chủ.
                    </span>
                  </div>

                  {products.length === 0 ? (
                    <p className="text-xs text-secondary italic">Không có sản phẩm nào khả dụng trong cơ sở dữ liệu.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-[220px] overflow-y-auto pr-2 border border-border/40 rounded-2 p-3 bg-canvas">
                      {products.map((prod) => {
                        const isChecked = selectedProductIds.includes(prod.id);
                        return (
                          <button
                            key={prod.id}
                            type="button"
                            onClick={() => handleProductSelect(prod.id)}
                            className={`flex items-center gap-2.5 p-2 rounded border text-left text-[11px] font-medium transition-colors cursor-pointer ${
                              isChecked
                                ? "border-accent bg-accent/5 font-bold text-accent"
                                : "border-border/40 hover:border-accent/40 bg-canvas"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              readOnly
                              className="accent-accent shrink-0 cursor-pointer pointer-events-none"
                            />
                            <span className="truncate">{prod.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* SECTION 4: THE COCNI STORY */}
        <div className="border border-border/40 rounded-3 bg-canvas overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection("story")}
            className="w-full px-6 py-4.5 bg-subtle/20 flex items-center justify-between text-left cursor-pointer border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-accent shrink-0" />
              <div>
                <h3 className="font-playfair font-bold text-sm text-primary">Khối 4: Câu chuyện Thương hiệu (The Story)</h3>
                <p className="text-[10px] text-secondary mt-0.5">2 đoạn văn tự sự lịch sử, con số thống kê & 4 đặc trưng nổi bật.</p>
              </div>
            </div>
            {openSection === "story" ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
          </button>

          {openSection === "story" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Tagline phụ" required>
                  <input
                    type="text"
                    value={introTagline}
                    onChange={(e) => setIntroTagline(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all uppercase tracking-wider font-bold"
                  />
                </FormField>
                <FormField label="Tiêu đề lớn" required>
                  <input
                    type="text"
                    value={introTitle}
                    onChange={(e) => setIntroTitle(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-bold"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Đoạn văn tự sự 1" required>
                  <textarea
                    value={introDesc1}
                    onChange={(e) => setIntroDesc1(e.target.value)}
                    rows={4.5}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all leading-relaxed"
                  />
                </FormField>
                <FormField label="Đoạn văn tự sự 2" required>
                  <textarea
                    value={introDesc2}
                    onChange={(e) => setIntroDesc2(e.target.value)}
                    rows={4.5}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all leading-relaxed"
                  />
                </FormField>
              </div>

              {/* Statistics Grid */}
              <div className="pt-4 border-t border-border/20">
                <span className="text-xs font-bold text-primary block mb-3">Con số thống kê</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="p-4 border border-border/60 rounded-2 bg-subtle/10 grid grid-cols-2 gap-3">
                    <FormField label="Số liệu 1">
                      <input
                        type="text"
                        value={introStat1Val}
                        onChange={(e) => setIntroStat1Val(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none font-bold"
                      />
                    </FormField>
                    <FormField label="Nhãn số 1">
                      <input
                        type="text"
                        value={introStat1Lbl}
                        onChange={(e) => setIntroStat1Lbl(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none"
                      />
                    </FormField>
                  </div>

                  <div className="p-4 border border-border/60 rounded-2 bg-subtle/10 grid grid-cols-2 gap-3">
                    <FormField label="Số liệu 2">
                      <input
                        type="text"
                        value={introStat2Val}
                        onChange={(e) => setIntroStat2Val(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none font-bold"
                      />
                    </FormField>
                    <FormField label="Nhãn số 2">
                      <input
                        type="text"
                        value={introStat2Lbl}
                        onChange={(e) => setIntroStat2Lbl(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

              {/* 4 Feature blocks of story */}
              <div className="pt-4 border-t border-border/20 space-y-4">
                <span className="text-xs font-bold text-primary block">Chỉnh sửa 4 ô đặc trưng thương hiệu</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Feature 1 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Khối đặc trưng 1</span>
                    <ImageCropUploader
                      label="Ảnh khối đặc trưng 1"
                      value={introFeat1ImgUrl}
                      onChange={setIntroFeat1ImgUrl}
                      aspectRatio={1}
                      recommendedSize="600x600px (Tỷ lệ 1:1)"
                      folder="theme"
                    />
                  </div>

                  {/* Feature 2 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Khối đặc trưng 2</span>
                    <ImageCropUploader
                      label="Ảnh khối đặc trưng 2"
                      value={introFeat2ImgUrl}
                      onChange={setIntroFeat2ImgUrl}
                      aspectRatio={1}
                      recommendedSize="600x600px (Tỷ lệ 1:1)"
                      folder="theme"
                    />
                  </div>

                  {/* Feature 3 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Khối đặc trưng 3</span>
                    <ImageCropUploader
                      label="Ảnh khối đặc trưng 3"
                      value={introFeat3ImgUrl}
                      onChange={setIntroFeat3ImgUrl}
                      aspectRatio={1}
                      recommendedSize="600x600px (Tỷ lệ 1:1)"
                      folder="theme"
                    />
                  </div>

                  {/* Feature 4 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Khối đặc trưng 4</span>
                    <ImageCropUploader
                      label="Ảnh khối đặc trưng 4"
                      value={introFeat4ImgUrl}
                      onChange={setIntroFeat4ImgUrl}
                      aspectRatio={1}
                      recommendedSize="600x600px (Tỷ lệ 1:1)"
                      folder="theme"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 5: BRAND VALUES */}
        <div className="border border-border/40 rounded-3 bg-canvas overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection("values")}
            className="w-full px-6 py-4.5 bg-subtle/20 flex items-center justify-between text-left cursor-pointer border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <Star className="w-5 h-5 text-accent shrink-0" />
              <div>
                <h3 className="font-playfair font-bold text-sm text-primary">Khối 5: Giá trị Cốt lõi (Brand Values)</h3>
                <p className="text-[10px] text-secondary mt-0.5">Tiêu đề, mô tả khối & 4 giá trị: Mộc Mạc, Chân Thành, Bền Bỉ, Chỉn Chu.</p>
              </div>
            </div>
            {openSection === "values" ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
          </button>

          {openSection === "values" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Tagline phụ" required>
                  <input
                    type="text"
                    value={valuesTagline}
                    onChange={(e) => setValuesTagline(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all uppercase tracking-wider font-bold"
                  />
                </FormField>
                <FormField label="Tiêu đề chính" required>
                  <input
                    type="text"
                    value={valuesTitle}
                    onChange={(e) => setValuesTitle(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-bold"
                  />
                </FormField>
              </div>

              <FormField label="Mô tả phụ cho khối" required>
                <textarea
                  value={valuesDesc}
                  onChange={(e) => setValuesDesc(e.target.value)}
                  rows={2}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all leading-relaxed"
                />
              </FormField>

              {/* 4 Brand Values */}
              <div className="pt-4 border-t border-border/20 space-y-4">
                <span className="text-xs font-bold text-primary block">Nội dung 4 giá trị cột lõi</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Value 1 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Giá trị 1</span>
                    <FormField label="Tiêu đề">
                      <input
                        type="text"
                        value={value1Title}
                        onChange={(e) => setValue1Title(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded focus:outline-none font-bold text-primary"
                      />
                    </FormField>
                    <FormField label="Đoạn mô tả">
                      <textarea
                        value={value1Desc}
                        onChange={(e) => setValue1Desc(e.target.value)}
                        rows={3.5}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none leading-relaxed"
                      />
                    </FormField>
                  </div>

                  {/* Value 2 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Giá trị 2</span>
                    <FormField label="Tiêu đề">
                      <input
                        type="text"
                        value={value2Title}
                        onChange={(e) => setValue2Title(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded focus:outline-none font-bold text-primary"
                      />
                    </FormField>
                    <FormField label="Đoạn mô tả">
                      <textarea
                        value={value2Desc}
                        onChange={(e) => setValue2Desc(e.target.value)}
                        rows={3.5}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none leading-relaxed"
                      />
                    </FormField>
                  </div>

                  {/* Value 3 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Giá trị 3</span>
                    <FormField label="Tiêu đề">
                      <input
                        type="text"
                        value={value3Title}
                        onChange={(e) => setValue3Title(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded focus:outline-none font-bold text-primary"
                      />
                    </FormField>
                    <FormField label="Đoạn mô tả">
                      <textarea
                        value={value3Desc}
                        onChange={(e) => setValue3Desc(e.target.value)}
                        rows={3.5}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none leading-relaxed"
                      />
                    </FormField>
                  </div>

                  {/* Value 4 */}
                  <div className="p-4 border border-border/60 rounded-2 bg-canvas space-y-3">
                    <span className="font-bold text-[10px] text-accent uppercase block">Giá trị 4</span>
                    <FormField label="Tiêu đề">
                      <input
                        type="text"
                        value={value4Title}
                        onChange={(e) => setValue4Title(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded focus:outline-none font-bold text-primary"
                      />
                    </FormField>
                    <FormField label="Đoạn mô tả">
                      <textarea
                        value={value4Desc}
                        onChange={(e) => setValue4Desc(e.target.value)}
                        rows={3.5}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2 rounded focus:outline-none leading-relaxed"
                      />
                    </FormField>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* SECTION 6: FAQ ACCORDION */}
        <div className="border border-border/40 rounded-3 bg-canvas overflow-hidden shadow-xs">
          <button
            onClick={() => toggleSection("faq")}
            className="w-full px-6 py-4.5 bg-subtle/20 flex items-center justify-between text-left cursor-pointer border-b border-border/20"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-5 h-5 text-accent shrink-0" />
              <div>
                <h3 className="font-playfair font-bold text-sm text-primary">Khối 6: Giải đáp thắc mắc (FAQ Accordion)</h3>
                <p className="text-[10px] text-secondary mt-0.5">Tiêu đề chính và trình biên tập danh sách câu hỏi & câu trả lời.</p>
              </div>
            </div>
            {openSection === "faq" ? <ChevronUp className="w-4 h-4 text-secondary" /> : <ChevronDown className="w-4 h-4 text-secondary" />}
          </button>

          {openSection === "faq" && (
            <div className="p-6 space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FormField label="Tagline phụ" required>
                  <input
                    type="text"
                    value={faqTagline}
                    onChange={(e) => setFaqTagline(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3.5 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all uppercase tracking-wider font-bold"
                  />
                </FormField>
                <FormField label="Tiêu đề khối FAQ" required>
                  <input
                    type="text"
                    value={faqTitle}
                    onChange={(e) => setFaqTitle(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3.5 rounded-2 focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all font-bold"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-subtle/30 p-4 border border-border/40 rounded-2">
                    <FormField label="Tiêu đề cột Khách lẻ">
                      <input
                        type="text"
                        value={faqRetailTitle}
                        onChange={(e) => setFaqRetailTitle(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded focus:outline-none font-bold text-primary"
                      />
                    </FormField>
                  </div>
                  <FaqListEditor
                    value={faqItems}
                    onChange={setFaqItems}
                  />
                </div>
                <div className="space-y-4">
                  <div className="bg-subtle/30 p-4 border border-border/40 rounded-2">
                    <FormField label="Tiêu đề cột B2B">
                      <input
                        type="text"
                        value={faqB2bTitle}
                        onChange={(e) => setFaqB2bTitle(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/40 px-3 py-2.5 rounded focus:outline-none font-bold text-primary"
                      />
                    </FormField>
                  </div>
                  <FaqListEditor
                    value={faqItemsB2b}
                    onChange={setFaqItemsB2b}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
