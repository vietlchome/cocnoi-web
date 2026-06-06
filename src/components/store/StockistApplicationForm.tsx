"use client";

import { useState } from "react";
import { createInquiry } from "@/lib/actions/inquiry.actions";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { parseError, type FriendlyError } from "@/lib/utils/error-messages";
import FormErrorAlert from "@/components/shared/FormErrorAlert";

export default function StockistApplicationForm() {
  const [storeName, setStoreName] = useState("");
  const [contactName, setContactName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [storeType, setStoreType] = useState("concept-store");
  const [address, setAddress] = useState("");
  const [instagram, setInstagram] = useState("");
  const [expectedQty, setExpectedQty] = useState("10-20");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    if (!storeName.trim()) {
      setError({ category: "validation", message: "Tên cửa hàng hoặc thương hiệu không được trống.", showRetryButton: false, showReloadButton: false });
      setLoading(false);
      return;
    }
    if (!contactName.trim()) {
      setError({ category: "validation", message: "Họ và tên người liên hệ không được trống.", showRetryButton: false, showReloadButton: false });
      setLoading(false);
      return;
    }
    if (phone.trim().length < 8) {
      setError({ category: "validation", message: "Số điện thoại không hợp lệ (tối thiểu 8 ký tự).", showRetryButton: false, showReloadButton: false });
      setLoading(false);
      return;
    }

    try {
      const fullNote = [
        `Loại cửa hàng: ${storeType}`,
        address.trim() && `Địa chỉ: ${address}`,
        instagram.trim() && `Instagram/Website: ${instagram}`,
        `SL dự kiến/tháng: ${expectedQty}`,
        note.trim() && `Ghi chú: ${note}`
      ].filter(Boolean).join(" | ");

      const response = await createInquiry({
        customerName: contactName,
        phone,
        email: email || null,
        companyName: storeName || null,
        productId: null,
        quantity: 1,
        note: fullNote,
        source: "Stockist Application",
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError({ category: "unknown", message: response.error || "Gặp sự cố khi gửi thông tin.", showRetryButton: true, showReloadButton: false });
      }
    } catch (err) {
      console.error(err);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-canvas border border-accent/40 p-6 md:p-10 rounded-4 text-center max-w-2xl mx-auto shadow-md animate-fade-in font-bvp">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-3 animate-bounce" />
        <h3 className="font-playfair text-xl font-bold text-primary mb-2">Đã nhận thông tin</h3>
        <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mb-4">
          Cốc Nối liên hệ xác nhận và gửi catalog wholesale trong 24 giờ.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setStoreName("");
            setContactName("");
            setPhone("");
            setEmail("");
            setStoreType("concept-store");
            setAddress("");
            setInstagram("");
            setExpectedQty("10-20");
            setNote("");
            setError(null);
          }}
          className="font-bvp font-medium text-xs text-accent hover:text-[#A75426] underline transition-colors font-semibold"
        >
          Quay lại form đăng ký
        </button>
      </div>
    );
  }

  return (
    <div className="bg-canvas border border-border/80 p-6 md:p-10 rounded-4 max-w-3xl mx-auto shadow-sm">
      <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary mb-6 text-center">
        Đăng ký thông tin đại lý
      </h3>

      {error && (
        <div className="mb-6">
          <FormErrorAlert error={error} onRetry={handleSubmit} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Store Name */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Tên cửa hàng, thương hiệu <span className="text-accent">*</span>
            </label>
            <input 
              type="text" 
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="Ví dụ: Tiệm Gốm Cốc Nối"
              required
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Contact Name */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Họ và tên người liên hệ <span className="text-accent">*</span>
            </label>
            <input 
              type="text" 
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              required
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Số điện thoại người liên hệ <span className="text-accent">*</span>
            </label>
            <input 
              type="tel" 
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              required
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Email */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Địa chỉ Email
            </label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ví dụ: shop@company.com"
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Store Type */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Loại hình hoạt động
            </label>
            <select
              value={storeType}
              onChange={(e) => setStoreType(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="concept-store">Concept store</option>
              <option value="cafe">Café</option>
              <option value="gallery">Gallery, Art space</option>
              <option value="retail-specialty">Cửa hàng bán lẻ chuyên biệt</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Expected Quantity */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Số lượng dự kiến lấy, tháng
            </label>
            <select
              value={expectedQty}
              onChange={(e) => setExpectedQty(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="10-20">10 - 20 đôi</option>
              <option value="20-50">20 - 50 đôi</option>
              <option value="50-100">50 - 100 đôi</option>
              <option value="100+">Trên 100 đôi</option>
            </select>
          </div>
        </div>

        {/* Instagram/Website */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Instagram, Website của cửa hàng
          </label>
          <input 
            type="text" 
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Ví dụ: @yourstore hoặc www.yourstore.com"
            className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Address */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Địa chỉ trưng bày, cửa hàng
          </label>
          <input 
            type="text" 
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Số nhà, tên đường, quận, thành phố..."
            className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Note */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Mô tả thêm về cửa hàng hoặc yêu cầu riêng
          </label>
          <textarea 
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Mô tả không gian cửa hàng của bạn hoặc các mong muốn hợp tác chi tiết..."
            className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-canvas font-bvp font-medium text-xs px-6 py-4 rounded-2 hover:bg-[#0E1220] transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
          style={{ backgroundColor: "var(--color-deep-indigo)" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Đang gửi thông tin...</span>
            </>
          ) : (
            <>
              <span>Gửi đăng ký đại lý</span>
              <Send className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
