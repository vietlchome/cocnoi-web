"use client";

import { useState, useTransition } from "react";
import { updateSettingsAction } from "@/lib/actions/settings.actions";
import { 
  Save, Eye, Plus, Trash2, ChevronDown, ChevronUp, Loader2, Layout, Type, 
  Image as ImageIcon, MessageSquare, Share2, Paintbrush, LayoutGrid, HelpCircle 
} from "lucide-react";
import ImageCropUploader from "../ImageCropUploader";

interface SiteCustomizerClientProps {
  initialSettings: Record<string, string>;
}

import { BRAND_COLORS } from "@/lib/brand-colors";


export default function SiteCustomizerClient({ initialSettings }: SiteCustomizerClientProps) {
  const [settings, setSettings] = useState<Record<string, string>>(initialSettings);
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [openSection, setOpenSection] = useState<string | null>("header");

  const handleChange = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleJsonChange = (key: string, data: any) => {
    handleChange(key, JSON.stringify(data));
  };

  const getJson = (key: string, fallback: any = []) => {
    try {
      return settings[key] ? JSON.parse(settings[key]) : fallback;
    } catch {
      return fallback;
    }
  };

  const handleSave = () => {
    setSaveStatus("saving");
    startTransition(async () => {
      try {
        const res = await updateSettingsAction(settings);
        if (res.success) {
          setSaveStatus("success");
          setTimeout(() => setSaveStatus("idle"), 3000);
        } else {
          setSaveStatus("error");
          alert(res.error || "Có lỗi xảy ra khi lưu.");
        }
      } catch (err) {
        setSaveStatus("error");
        alert("Có lỗi xảy ra khi lưu.");
      }
    });
  };

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full relative">
      <div className="sticky top-4 z-40 bg-canvas/80 backdrop-blur-md p-4 rounded-4 border border-border shadow-sm flex items-center justify-between">
        <div>
          <h2 className="font-playfair font-bold text-lg text-primary">Tùy biến Giao diện</h2>
          <p className="text-sm text-secondary">Cập nhật nội dung hiển thị trên website</p>
        </div>
        <div className="flex items-center gap-3">
          <a href="/" target="_blank" className="flex items-center gap-2 px-4 py-2 rounded-3 font-bvp text-sm font-semibold text-primary bg-subtle hover:bg-border transition-colors">
            <Eye className="w-4 h-4" />
            <span>Xem thực tế</span>
          </a>
          <button onClick={handleSave} disabled={isPending} className="flex items-center gap-2 px-6 py-2 rounded-3 font-bvp text-sm font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50">
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saveStatus === "saving" ? "Đang lưu..." : saveStatus === "success" ? "Đã lưu!" : "Lưu thay đổi"}</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {/* 1. Header */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("header")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><Layout className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">1. Header (Thanh điều hướng)</h3></div>
            {openSection === "header" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "header" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <ImageCropUploader label="Logo Website (Để trống dùng SVG mặc định)" value={settings.logo_image_url || ""} onChange={(url) => handleChange("logo_image_url", url)} aspectRatio={1} folder="theme" />
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tên thương hiệu (kế Logo)</label>
                  <input type="text" value={settings.logo_text || ""} onChange={(e) => handleChange("logo_text", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="CỐC NỐI" />
                </div>
                <div className="flex items-center gap-3 border border-border px-4 py-2.5 rounded-3">
                  <input type="checkbox" checked={settings.sticky_header === "true"} onChange={(e) => handleChange("sticky_header", e.target.checked ? "true" : "false")} className="w-5 h-5 accent-accent" id="sticky_header" />
                  <label htmlFor="sticky_header" className="text-sm font-semibold text-primary cursor-pointer">Header dính khi cuộn</label>
                </div>
              </div>
              <div className="flex items-center gap-3 border border-border px-4 py-2.5 rounded-3">
                <input type="checkbox" checked={settings.show_top_bar === "true"} onChange={(e) => handleChange("show_top_bar", e.target.checked ? "true" : "false")} className="w-5 h-5 accent-accent" id="show_top_bar" />
                <label htmlFor="show_top_bar" className="text-sm font-semibold text-primary cursor-pointer">Hiển thị thanh quảng cáo (Top Bar)</label>
              </div>
              {settings.show_top_bar === "true" && (
                <div className="flex flex-col gap-1.5 pl-4 border-l-2 border-border">
                  <label className="text-sm font-semibold text-primary">Nội dung quảng cáo</label>
                  <input type="text" value={settings.top_bar_text || ""} onChange={(e) => handleChange("top_bar_text", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Miễn phí vận chuyển..." />
                </div>
              )}
            </div>
          )}
        </div>

        {/* 2. Hero Banner */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("hero")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><ImageIcon className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">2. Hero Banner</h3></div>
            {openSection === "hero" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "hero" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Badge Text</label>
                  <input type="text" value={settings.hero_badge_text || ""} onChange={(e) => handleChange("hero_badge_text", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Crafted in Bát Tràng since 1994" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề chính</label>
                  <input type="text" value={settings.hero_title || ""} onChange={(e) => handleChange("hero_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Kết tình thân, Nối tinh thần." />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Mô tả phụ</label>
                <textarea value={settings.hero_subtitle || ""} onChange={(e) => handleChange("hero_subtitle", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none min-h-[80px]" placeholder="Mỗi chiếc cốc gốm..." />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">CTA Chính (Nút đen)</label>
                  <input type="text" value={settings.hero_cta_text || ""} onChange={(e) => handleChange("hero_cta_text", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Khám phá Cửa Hàng" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">CTA Phụ (Nút viền)</label>
                  <input type="text" value={settings.hero_cta_secondary || ""} onChange={(e) => handleChange("hero_cta_secondary", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Chiến dịch 'Người Nối'" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Nhãn nổi trang trí (trên ảnh)</label>
                <input type="text" value={settings.hero_floating_label || ""} onChange={(e) => handleChange("hero_floating_label", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Gốm mộc từ đất mẹ" />
              </div>
              <ImageCropUploader label="Ảnh Hero (Để trống dùng hình minh họa)" value={settings.hero_image_url || ""} onChange={(url) => handleChange("hero_image_url", url)} aspectRatio={4/3} folder="theme" />
            </div>
          )}
        </div>

        {/* 3. Chiến dịch */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("campaign")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><Type className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">3. Chiến dịch Người Nối</h3></div>
            {openSection === "campaign" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "campaign" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Campaign Badge</label>
                  <input type="text" value={settings.campaign_badge || ""} onChange={(e) => handleChange("campaign_badge", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Signature Campaign" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề chính</label>
                  <input type="text" value={settings.campaign_title || ""} onChange={(e) => handleChange("campaign_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Đoạn mô tả</label>
                <textarea value={settings.campaign_desc || ""} onChange={(e) => handleChange("campaign_desc", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none min-h-[80px]" />
              </div>
              <ImageCropUploader label="Ảnh Nhân vật" value={settings.campaign_hero_image_url || ""} onChange={(url) => handleChange("campaign_hero_image_url", url)} aspectRatio={3/4} folder="theme" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tên nhân vật</label>
                  <input type="text" value={settings.campaign_hero_name || ""} onChange={(e) => handleChange("campaign_hero_name", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Bác Cường Lò Bầu" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Câu trích dẫn</label>
                  <input type="text" value={settings.campaign_hero_quote || ""} onChange={(e) => handleChange("campaign_hero_quote", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Đất có linh hồn..." />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 4. Sản phẩm Nổi bật */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("products")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><LayoutGrid className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">4. Sản phẩm Nổi bật</h3></div>
            {openSection === "products" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "products" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tagline</label>
                  <input type="text" value={settings.featured_products_tagline || ""} onChange={(e) => handleChange("featured_products_tagline", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Cốc Gốm Mộc Chọn Lọc" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề</label>
                  <input type="text" value={settings.featured_products_title || ""} onChange={(e) => handleChange("featured_products_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Sản phẩm nổi bật" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Cách chọn SP (Type)</label>
                <select value={settings.featured_products_type || "latest"} onChange={(e) => handleChange("featured_products_type", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none">
                  <option value="latest">Mới nhất (Latest)</option>
                  <option value="bestseller">Bán chạy (Bestsellers)</option>
                  <option value="manual">Chọn tay (Manual)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 5. Câu chuyện Thương hiệu */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("story")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><MessageSquare className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">5. Câu chuyện Thương hiệu (Story)</h3></div>
            {openSection === "story" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "story" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tagline</label>
                  <input type="text" value={settings.intro_tagline || ""} onChange={(e) => handleChange("intro_tagline", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Heritage & Craft" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề lớn</label>
                  <input type="text" value={settings.intro_title || ""} onChange={(e) => handleChange("intro_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none" placeholder="Khởi nguồn từ lòng đất..." />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Đoạn văn 1</label>
                <textarea value={settings.intro_desc_1 || ""} onChange={(e) => handleChange("intro_desc_1", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none min-h-[80px]" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Đoạn văn 2</label>
                <textarea value={settings.intro_desc_2 || ""} onChange={(e) => handleChange("intro_desc_2", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border bg-canvas text-primary focus:border-accent outline-none min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Thống kê 1 (Số)</label>
                  <input type="text" value={settings.intro_stat_1_val || ""} onChange={(e) => handleChange("intro_stat_1_val", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="30+" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Thống kê 1 (Nhãn)</label>
                  <input type="text" value={settings.intro_stat_1_lbl || ""} onChange={(e) => handleChange("intro_stat_1_lbl", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Năm giữ lửa" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Thống kê 2 (Số)</label>
                  <input type="text" value={settings.intro_stat_2_val || ""} onChange={(e) => handleChange("intro_stat_2_val", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="100k+" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Thống kê 2 (Nhãn)</label>
                  <input type="text" value={settings.intro_stat_2_lbl || ""} onChange={(e) => handleChange("intro_stat_2_lbl", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Cốc gốm trao tay" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
                <ImageCropUploader label="Ảnh đặc trưng 1" value={settings.intro_feat_1_img_url || ""} onChange={(url) => handleChange("intro_feat_1_img_url", url)} aspectRatio={1} folder="theme" />
                <ImageCropUploader label="Ảnh đặc trưng 2" value={settings.intro_feat_2_img_url || ""} onChange={(url) => handleChange("intro_feat_2_img_url", url)} aspectRatio={1} folder="theme" />
                <ImageCropUploader label="Ảnh đặc trưng 3" value={settings.intro_feat_3_img_url || ""} onChange={(url) => handleChange("intro_feat_3_img_url", url)} aspectRatio={1} folder="theme" />
                <ImageCropUploader label="Ảnh đặc trưng 4" value={settings.intro_feat_4_img_url || ""} onChange={(url) => handleChange("intro_feat_4_img_url", url)} aspectRatio={1} folder="theme" />
              </div>
            </div>
          )}
        </div>

        {/* 6. Giá trị cốt lõi */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("values")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><LayoutGrid className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">6. Giá trị cốt lõi (4 đặc trưng)</h3></div>
            {openSection === "values" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "values" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tagline</label>
                  <input type="text" value={settings.values_tagline || ""} onChange={(e) => handleChange("values_tagline", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Core Principles" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề section</label>
                  <input type="text" value={settings.values_title || ""} onChange={(e) => handleChange("values_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Giá trị Cốc Nối" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Mô tả chung</label>
                <textarea value={settings.values_desc || ""} onChange={(e) => handleChange("values_desc", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border min-h-[60px]" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="border border-border p-4 rounded-3 flex flex-col gap-3 bg-subtle/30">
                    <h4 className="font-playfair font-bold text-accent">Đặc trưng {i}</h4>
                    <input type="text" value={settings[`value_${i}_title`] || ""} onChange={(e) => handleChange(`value_${i}_title`, e.target.value)} placeholder={`Tên giá trị ${i}`} className="px-3 py-2 rounded-2 border border-border" />
                    <textarea value={settings[`value_${i}_desc`] || ""} onChange={(e) => handleChange(`value_${i}_desc`, e.target.value)} placeholder="Mô tả..." className="px-3 py-2 rounded-2 border border-border min-h-[80px]" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 7. FAQ */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("faq")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><HelpCircle className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">7. Hỏi đáp (FAQ)</h3></div>
            {openSection === "faq" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "faq" && (
            <div className="p-6 flex flex-col gap-6 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tagline</label>
                  <input type="text" value={settings.faq_tagline || ""} onChange={(e) => handleChange("faq_tagline", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Bạn muốn hỏi?" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề section</label>
                  <input type="text" value={settings.faq_title || ""} onChange={(e) => handleChange("faq_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Giải đáp thắc mắc" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề Khách lẻ (B2C)</label>
                  <input type="text" value={settings.faq_retail_title || ""} onChange={(e) => handleChange("faq_retail_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Khách hàng lẻ" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tiêu đề Doanh nghiệp (B2B)</label>
                  <input type="text" value={settings.faq_b2b_title || ""} onChange={(e) => handleChange("faq_b2b_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Đối tác doanh nghiệp (B2B)" />
                </div>
              </div>
              {/* FAQ B2C items */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <h4 className="font-playfair font-bold text-accent">Danh sách FAQ - Khách lẻ</h4>
                {getJson("faq_items").map((faq: any, idx: number) => (
                  <div key={idx} className="border border-border p-4 rounded-3 flex flex-col gap-3 relative group bg-subtle/30">
                    <button onClick={() => { const n = [...getJson("faq_items")]; n.splice(idx, 1); handleJsonChange("faq_items", n); }} className="absolute top-2 right-2 p-1.5 text-rose-500 hover:bg-rose-50 rounded-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <input type="text" value={faq.q || ""} onChange={(e) => { const n = [...getJson("faq_items")]; n[idx].q = e.target.value; handleJsonChange("faq_items", n); }} placeholder="Câu hỏi" className="px-3 py-2 rounded-2 border border-border" />
                    <textarea value={faq.a || ""} onChange={(e) => { const n = [...getJson("faq_items")]; n[idx].a = e.target.value; handleJsonChange("faq_items", n); }} placeholder="Câu trả lời" className="px-3 py-2 rounded-2 border border-border min-h-[60px]" />
                  </div>
                ))}
                <button onClick={() => handleJsonChange("faq_items", [...getJson("faq_items"), { q: "", a: "" }])} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-3 text-secondary hover:text-accent hover:border-accent font-semibold text-sm"><Plus className="w-4 h-4" /> Thêm câu hỏi</button>
              </div>
              {/* FAQ B2B items */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border">
                <h4 className="font-playfair font-bold text-accent">Danh sách FAQ - Doanh nghiệp</h4>
                {getJson("faq_items_b2b").map((faq: any, idx: number) => (
                  <div key={idx} className="border border-border p-4 rounded-3 flex flex-col gap-3 relative group bg-subtle/30">
                    <button onClick={() => { const n = [...getJson("faq_items_b2b")]; n.splice(idx, 1); handleJsonChange("faq_items_b2b", n); }} className="absolute top-2 right-2 p-1.5 text-rose-500 hover:bg-rose-50 rounded-2 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-4 h-4" /></button>
                    <input type="text" value={faq.q || ""} onChange={(e) => { const n = [...getJson("faq_items_b2b")]; n[idx].q = e.target.value; handleJsonChange("faq_items_b2b", n); }} placeholder="Câu hỏi" className="px-3 py-2 rounded-2 border border-border" />
                    <textarea value={faq.a || ""} onChange={(e) => { const n = [...getJson("faq_items_b2b")]; n[idx].a = e.target.value; handleJsonChange("faq_items_b2b", n); }} placeholder="Câu trả lời" className="px-3 py-2 rounded-2 border border-border min-h-[60px]" />
                  </div>
                ))}
                <button onClick={() => handleJsonChange("faq_items_b2b", [...getJson("faq_items_b2b"), { q: "", a: "" }])} className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-border rounded-3 text-secondary hover:text-accent hover:border-accent font-semibold text-sm"><Plus className="w-4 h-4" /> Thêm câu hỏi</button>
              </div>
            </div>
          )}
        </div>

        {/* 8. Footer */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("footer")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><Layout className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">8. Footer (Chân trang)</h3></div>
            {openSection === "footer" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "footer" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-border">
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-sm font-semibold text-primary">Địa chỉ liên hệ</label>
                <input type="text" value={settings.contact_address || ""} onChange={(e) => handleChange("contact_address", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Số điện thoại</label>
                <input type="text" value={settings.contact_phone || ""} onChange={(e) => handleChange("contact_phone", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Email</label>
                <input type="email" value={settings.contact_email || ""} onChange={(e) => handleChange("contact_email", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Tiêu đề Newsletter</label>
                <input type="text" value={settings.footer_newsletter_title || ""} onChange={(e) => handleChange("footer_newsletter_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="Hộp tin Cốc Nối" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Mô tả Newsletter</label>
                <input type="text" value={settings.footer_newsletter_desc || ""} onChange={(e) => handleChange("footer_newsletter_desc", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2 pt-4 border-t border-border">
                <label className="text-sm font-semibold text-primary">Bản quyền (Copyright)</label>
                <input type="text" value={settings.footer_copyright || ""} onChange={(e) => handleChange("footer_copyright", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="© 2024 CỐC NỐI. All rights reserved." />
              </div>
            </div>
          )}
        </div>

        {/* 9. Mạng xã hội */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("social")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><Share2 className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">9. Mạng xã hội & Liên kết ngoài</h3></div>
            {openSection === "social" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "social" && (
            <div className="p-6 flex flex-col gap-5 border-t border-border">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Facebook Link</label>
                <input type="url" value={settings.contact_facebook || ""} onChange={(e) => handleChange("contact_facebook", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Instagram Link</label>
                <input type="url" value={settings.contact_instagram || ""} onChange={(e) => handleChange("contact_instagram", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-primary">Zalo Link</label>
                <input type="url" value={settings.contact_zalo || ""} onChange={(e) => handleChange("contact_zalo", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" />
              </div>
            </div>
          )}
        </div>

        {/* 10. Cấu hình Tổng & SEO */}
        <div className="border border-border rounded-4 bg-canvas overflow-hidden">
          <button onClick={() => toggleSection("seo")} className="w-full flex items-center justify-between p-5 bg-subtle/30 hover:bg-subtle/50 transition-colors">
            <div className="flex items-center gap-3"><Paintbrush className="w-5 h-5 text-accent" /><h3 className="font-playfair font-bold text-primary text-lg">10. Màu sắc & SEO</h3></div>
            {openSection === "seo" ? <ChevronUp className="w-5 h-5 text-secondary" /> : <ChevronDown className="w-5 h-5 text-secondary" />}
          </button>
          {openSection === "seo" && (
            <div className="p-6 flex flex-col gap-6 border-t border-border">
              <div className="flex flex-col gap-4">
                <h4 className="font-playfair font-bold text-primary text-md">Cấu hình Thẻ SEO Meta (Toàn trang)</h4>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Tên Website (Meta Title)</label>
                  <input type="text" value={settings.site_title || ""} onChange={(e) => handleChange("site_title", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="CỐC NỐI | Tinh hoa gốm sứ..." />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Mô tả Website (Meta Description)</label>
                  <textarea value={settings.site_description || ""} onChange={(e) => handleChange("site_description", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border min-h-[80px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-primary">Từ khóa (Meta Keywords)</label>
                  <input type="text" value={settings.site_keywords || ""} onChange={(e) => handleChange("site_keywords", e.target.value)} className="px-4 py-2.5 rounded-3 border border-border" placeholder="gốm sứ, cốc nối, quà tặng doanh nghiệp" />
                </div>
              </div>
              <div className="flex flex-col gap-4 pt-6 border-t border-border">
                <h4 className="font-playfair font-bold text-primary text-md">Bảng màu Thương hiệu</h4>
                <p className="text-sm text-secondary mb-2">Bảng màu đã được khóa cố định theo nhận diện thương hiệu Cốc Nối. Việc thay đổi tự do có thể làm ảnh hưởng đến thẩm mỹ của toàn bộ website.</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {BRAND_COLORS.map((color) => (
                    <div key={color.name} className="flex items-center gap-3 border border-border p-3 rounded-3 bg-subtle/30">
                      <div className="w-8 h-8 rounded-full border border-border shadow-inner" style={{ backgroundColor: color.value }}></div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-primary truncate" title={color.name}>{color.name}</span>
                        <span className="text-xs text-secondary font-mono">{color.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
