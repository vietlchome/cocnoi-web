"use client";

import { useState } from "react";
import { setThemeSetting } from "@/lib/actions/content.actions";
import { FormField } from "@/components/ui/FormField";
import { Sliders, Save, Palette, Globe, Info, CreditCard, Loader2 } from "lucide-react";

interface ThemeCustomizerProps {
  initialSettings: Record<string, any>;
}

export default function ThemeCustomizer({ initialSettings }: ThemeCustomizerProps) {
  const [activeTab, setActiveTab] = useState<"general" | "colors" | "seo" | "header">("general");
  const [loading, setLoading] = useState(false);

  // Form states
  const [logoText, setLogoText] = useState(initialSettings.logo_text || "CỐC NỐI");
  const [contactAddress, setContactAddress] = useState(initialSettings.contact_address || "Xưởng gốm Cốc Nối, Bát Tràng, Gia Lâm, Hà Nội");
  const [contactPhone, setContactPhone] = useState(initialSettings.contact_phone || "+84 (0) 98 765 4321");
  const [contactEmail, setContactEmail] = useState(initialSettings.contact_email || "hello@cocnoi.com");
  const [contactFacebook, setContactFacebook] = useState(initialSettings.contact_facebook || "https://facebook.com/cocnoi");
  const [contactZalo, setContactZalo] = useState(initialSettings.contact_zalo || "https://zalo.me/cocnoi");
  const [contactInstagram, setContactInstagram] = useState(initialSettings.contact_instagram || "https://instagram.com/cocnoi");

  // Colors
  const [colorPrimary, setPrimaryColor] = useState(initialSettings.primary_color || "#131829");
  const [colorSecondary, setColorSecondary] = useState(initialSettings.secondary_color || "#3D2B1F");
  const [colorAccent, setColorAccent] = useState(initialSettings.accent_color || "#C2703E");
  const [colorBackground, setColorBackground] = useState(initialSettings.bg_color || "#FEFCF9");
  
  // 6 màu mở rộng
  const [colorSubtle, setColorSubtle] = useState(initialSettings.theme_color_subtle || "#F4ECE0");
  const [colorBorder, setColorBorder] = useState(initialSettings.theme_color_border || "#D4C5B2");
  const [colorAccentHover, setColorAccentHover] = useState(initialSettings.theme_color_accent_hover || "#E8A87C");
  const [colorError, setColorError] = useState(initialSettings.theme_color_error || "#A8512B");
  const [colorSuccess, setColorSuccess] = useState(initialSettings.theme_color_success || "#6B7B4E");
  const [colorWarning, setColorWarning] = useState(initialSettings.theme_color_warning || "#C99A4F");

  // SEO
  const [seoTitle, setSeoTitle] = useState(initialSettings.seo_title || "Cốc Nối - Kết tình thân, Nối tinh thần");
  const [seoDescription, setSeoDescription] = useState(initialSettings.seo_description || "Thương hiệu cốc gốm thủ công cao cấp từ làng cổ Bát Tràng");

  // Header & Topbar
  const [topBarText, setTopBarText] = useState(initialSettings.top_bar_text || "Miễn phí vận chuyển toàn quốc cho đơn hàng trên 1.000.000 đ");
  const [showTopBar, setShowTopBar] = useState(initialSettings.show_top_bar !== "false");
  const [stickyHeader, setStickyHeader] = useState(initialSettings.sticky_header !== "false");

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = [
        { key: "logo_text", value: logoText },
        { key: "contact_address", value: contactAddress },
        { key: "contact_phone", value: contactPhone },
        { key: "contact_email", value: contactEmail },
        { key: "contact_facebook", value: contactFacebook },
        { key: "contact_zalo", value: contactZalo },
        { key: "contact_instagram", value: contactInstagram },
        { key: "primary_color", value: colorPrimary },
        { key: "secondary_color", value: colorSecondary },
        { key: "accent_color", value: colorAccent },
        { key: "bg_color", value: colorBackground },
        { key: "theme_color_subtle", value: colorSubtle },
        { key: "theme_color_border", value: colorBorder },
        { key: "theme_color_accent_hover", value: colorAccentHover },
        { key: "theme_color_error", value: colorError },
        { key: "theme_color_success", value: colorSuccess },
        { key: "theme_color_warning", value: colorWarning },
        { key: "seo_title", value: seoTitle },
        { key: "seo_description", value: seoDescription },
        { key: "top_bar_text", value: topBarText },
        { key: "show_top_bar", value: showTopBar ? "true" : "false" },
        { key: "sticky_header", value: stickyHeader ? "true" : "false" },
      ];

      // Upsert parallelly
      await Promise.all(updates.map((up) => setThemeSetting(up.key, up.value)));

      alert("Lưu cấu hình giao diện Cửa Hàng thành công! Thay đổi đã được cập nhật toàn trang.");
    } catch (err: any) {
      alert(err.message || "Lỗi lưu cấu hình.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas border border-border/40 rounded-3 overflow-hidden shadow-sm flex flex-col md:flex-row min-h-[480px]">
      {/* Sidebar navigation tabs */}
      <aside className="w-full md:w-64 bg-[#FAF7F2] border-b md:border-b-0 md:border-r border-border/40 p-4 flex flex-col gap-1 shrink-0">
        {[
          { id: "general", label: "Thông tin chung", icon: Info },
          { id: "colors", label: "Bảng màu thương hiệu", icon: Palette },
          { id: "seo", label: "Cấu hình SEO", icon: Globe },
          { id: "header", label: "Đầu trang (Header)", icon: CreditCard },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-2 text-xs font-bold transition-all text-left cursor-pointer ${
                activeTab === tab.id
                  ? "bg-canvas text-accent shadow-xs border border-border/20"
                  : "text-secondary hover:text-primary hover:bg-subtle/5"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}

        <div className="mt-8 pt-4 border-t border-border/40">
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-3 px-4 rounded-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Lưu cấu hình</span>
          </button>
        </div>
      </aside>

      {/* Settings Form Container */}
      <main className="flex-grow p-8 space-y-6">
        {/* Tab 1: General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6 max-w-xl">
            <h4 className="font-playfair text-base font-bold text-primary border-b border-border/20 pb-3 mb-4">
              Cấu hình Thông Tin Chung
            </h4>

            <FormField label="Tên thương hiệu (Logo text)">
              <input
                type="text"
                value={logoText}
                onChange={(e) => setLogoText(e.target.value)}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </FormField>

            <FormField label="Địa chỉ xưởng gốm">
              <input
                type="text"
                value={contactAddress}
                onChange={(e) => setContactAddress(e.target.value)}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Hotline liên hệ">
                <input
                  type="text"
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </FormField>

              <FormField label="Email CSKH">
                <input
                  type="text"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Facebook Fanpage URL">
                <input
                  type="text"
                  value={contactFacebook}
                  onChange={(e) => setContactFacebook(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </FormField>

              <FormField label="Zalo liên hệ URL">
                <input
                  type="text"
                  value={contactZalo}
                  onChange={(e) => setContactZalo(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                />
              </FormField>
            </div>

            <FormField label="Instagram URL">
              <input
                type="text"
                value={contactInstagram}
                onChange={(e) => setContactInstagram(e.target.value)}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </FormField>
          </div>
        )}

        {/* Tab 2: Brand Colors */}
        {activeTab === "colors" && (
          <div className="space-y-6 max-w-xl">
            <h4 className="font-playfair text-base font-bold text-primary border-b border-border/20 pb-3 mb-4">
              Cấu hình Bảng Màu Thương Hiệu
            </h4>

            {/* Brand Colors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Primary Color */}
              <FormField label="Màu Chính (Primary)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorPrimary }}>
                    <input type="color" value={colorPrimary} onChange={(e) => setPrimaryColor(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorPrimary} onChange={(e) => setPrimaryColor(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>

              {/* Secondary Color */}
              <FormField label="Màu Phụ (Secondary)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorSecondary }}>
                    <input type="color" value={colorSecondary} onChange={(e) => setColorSecondary(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorSecondary} onChange={(e) => setColorSecondary(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>

              {/* Accent Color */}
              <FormField label="Màu Nhấn (Accent)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorAccent }}>
                    <input type="color" value={colorAccent} onChange={(e) => setColorAccent(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorAccent} onChange={(e) => setColorAccent(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>
              
              {/* Accent Hover Color */}
              <FormField label="Màu Nhấn (Hover)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorAccentHover }}>
                    <input type="color" value={colorAccentHover} onChange={(e) => setColorAccentHover(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorAccentHover} onChange={(e) => setColorAccentHover(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>

              {/* Background Color */}
              <FormField label="Màu Nền (Canvas)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorBackground }}>
                    <input type="color" value={colorBackground} onChange={(e) => setColorBackground(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorBackground} onChange={(e) => setColorBackground(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>
              
              {/* Subtle Background Color */}
              <FormField label="Màu Nền Phụ (Subtle)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorSubtle }}>
                    <input type="color" value={colorSubtle} onChange={(e) => setColorSubtle(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorSubtle} onChange={(e) => setColorSubtle(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>
              
              {/* Border Color */}
              <FormField label="Màu Viền (Border)">
                <div className="flex items-center gap-3">
                  <div className="relative w-10 h-10 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorBorder }}>
                    <input type="color" value={colorBorder} onChange={(e) => setColorBorder(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <input type="text" value={colorBorder} onChange={(e) => setColorBorder(e.target.value)} className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-2.5 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all uppercase font-medium tracking-wider" />
                </div>
              </FormField>
            </div>
            
            {/* Semantic Colors: Success, Warning, Error */}
            <div className="pt-4 mt-2 border-t border-border/10">
              <span className="text-sm font-semibold mb-4 block text-primary">Các màu Trạng Thái (Semantic Colors)</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Success */}
                <div className="flex items-center gap-3 p-3 border border-border/20 rounded-2 bg-white/50">
                  <div className="relative w-8 h-8 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorSuccess }}>
                    <input type="color" value={colorSuccess} onChange={(e) => setColorSuccess(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">Thành công</span>
                    <input type="text" value={colorSuccess} onChange={(e) => setColorSuccess(e.target.value)} className="w-16 text-[10px] bg-transparent focus:outline-none uppercase font-medium tracking-wider mt-0.5" />
                  </div>
                </div>
                {/* Warning */}
                <div className="flex items-center gap-3 p-3 border border-border/20 rounded-2 bg-white/50">
                  <div className="relative w-8 h-8 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorWarning }}>
                    <input type="color" value={colorWarning} onChange={(e) => setColorWarning(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">Cảnh báo</span>
                    <input type="text" value={colorWarning} onChange={(e) => setColorWarning(e.target.value)} className="w-16 text-[10px] bg-transparent focus:outline-none uppercase font-medium tracking-wider mt-0.5" />
                  </div>
                </div>
                {/* Error */}
                <div className="flex items-center gap-3 p-3 border border-border/20 rounded-2 bg-white/50">
                  <div className="relative w-8 h-8 rounded-full border border-border/40 shadow-sm shrink-0 overflow-hidden" style={{ backgroundColor: colorError }}>
                    <input type="color" value={colorError} onChange={(e) => setColorError(e.target.value)} className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">Lỗi/Xóa</span>
                    <input type="text" value={colorError} onChange={(e) => setColorError(e.target.value)} className="w-16 text-[10px] bg-transparent focus:outline-none uppercase font-medium tracking-wider mt-0.5" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* Tab 3: SEO Configuration */}
        {activeTab === "seo" && (
          <div className="space-y-6 max-w-xl">
            <h4 className="font-playfair text-base font-bold text-primary border-b border-border/20 pb-3 mb-4">
              Cấu hình SEO & Siêu Dữ Liệu
            </h4>

            <FormField label="Tiêu đề trang cửa hàng (SEO Title)">
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all font-semibold"
              />
            </FormField>

            <FormField label="Mô tả trang cửa hàng (SEO Meta Description)">
              <textarea
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={4}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all leading-relaxed"
              />
            </FormField>
          </div>
        )}

        {/* Tab 4: Header & Announcement Bar */}
        {activeTab === "header" && (
          <div className="space-y-6 max-w-xl">
            <h4 className="font-playfair text-base font-bold text-primary border-b border-border/20 pb-3 mb-4">
              Cấu hình Bố Cục Đầu Trang
            </h4>

            <FormField label="Nội dung thanh thông báo (Top Announcement Bar)">
              <input
                type="text"
                value={topBarText}
                onChange={(e) => setTopBarText(e.target.value)}
                className="w-full text-xs bg-canvas border border-border/40 px-3.5 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
              />
            </FormField>

            <div className="flex flex-col gap-4 pt-2">
              <div className="flex items-center justify-between border-b border-border/20 pb-3.5">
                <div>
                  <span className="text-xs font-bold text-primary block">Hiển thị thanh thông báo</span>
                  <span className="text-[10px] text-secondary block mt-0.5">Bật hoặc ẩn thanh chạy chữ trên đầu trang chủ</span>
                </div>
                <input
                  type="checkbox"
                  checked={showTopBar}
                  onChange={(e) => setShowTopBar(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-primary block">Ghim đầu trang (Sticky Header)</span>
                  <span className="text-[10px] text-secondary block mt-0.5">Giữ Header cố định trên cùng khi cuộn chuột</span>
                </div>
                <input
                  type="checkbox"
                  checked={stickyHeader}
                  onChange={(e) => setStickyHeader(e.target.checked)}
                  className="w-4 h-4 accent-accent cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
