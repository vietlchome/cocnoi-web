"use client";

import { useState } from "react";
import { createInquiry } from "@/lib/actions/inquiry.actions";
import { ArrowRight, Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { parseError, type FriendlyError } from "@/lib/utils/error-messages";
import FormErrorAlert from "@/components/shared/FormErrorAlert";

export default function PartnerContactForm() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [quantity, setQuantity] = useState(50);
  const [note, setNote] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    if (!customerName.trim()) {
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
      const methodLabel = paymentMethod === "bank_transfer" ? "Chuyển khoản trước" : "COD";
      const fullNote = `Phương thức: ${methodLabel}${note ? ` | ${note}` : ''}`;

      const response = await createInquiry({
        customerName,
        phone,
        email: email || null,
        companyName: companyName || null,
        productId: null,
        quantity: Number(quantity) || 1,
        note: fullNote || null,
        source: "Trang Đối Tác B2B",
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
          Cốc Nối liên hệ xác nhận và tư vấn đối tác trong 24 giờ.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setCustomerName("");
            setPhone("");
            setEmail("");
            setCompanyName("");
            setQuantity(50);
            setNote("");
            setPaymentMethod("bank_transfer");
            setError(null);
          }}
          className="font-bvp font-medium text-xs text-accent hover:text-[#A75426] underline transition-colors font-semibold"
        >
          Gửi thêm yêu cầu hợp tác khác
        </button>
      </div>
    );
  }

  return (
    <div className="bg-canvas border border-border/80 p-6 md:p-10 rounded-4 max-w-3xl mx-auto shadow-sm">
      <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary mb-6 text-center">
        Nhận báo giá & Đăng ký tư vấn B2B
      </h3>

      {error && (
        <div className="mb-6">
          <FormErrorAlert error={error} onRetry={handleSubmit} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Họ và tên người liên hệ <span className="text-accent">*</span>
            </label>
            <input 
              type="text" 
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Ví dụ: Nguyễn Văn A"
              required
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Phone */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Số điện thoại <span className="text-accent">*</span>
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
              placeholder="Ví dụ: name@company.com"
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Company Name */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Tên doanh nghiệp / Quán Café
            </label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ví dụ: Cà Phê Cốc Nối Bát Tràng"
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        </div>

        {/* Quantity */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Số lượng dự kiến: <span className="text-accent font-mono font-bold text-sm">{quantity} chiếc</span>
          </label>
          <input 
            type="range" 
            min="20" 
            max="1000" 
            step="10"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full h-1.5 bg-[#FAF8F5] accent-accent border border-border/80 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between w-full font-bvp text-[9px] text-secondary mt-1">
            <span>Tối thiểu: 20 chiếc (Đơn B2B lẻ)</span>
            <span>Trung bình: 100 - 500 chiếc</span>
            <span>Tối đa: 1000+ chiếc (Đại lý)</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="flex flex-col gap-3">
          <label className="font-bvp text-xs font-bold text-primary">
            Phương thức thanh toán <span className="text-accent">*</span>
          </label>
          <div className="flex flex-col gap-2 w-full">
            <label className="flex items-start gap-3 p-3 border border-border rounded-3 cursor-pointer hover:bg-subtle/30 transition-colors w-full">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="bank_transfer" 
                checked={paymentMethod === "bank_transfer"} 
                onChange={(e) => setPaymentMethod(e.target.value as 'bank_transfer' | 'cod')}
                className="mt-1 accent-accent"
              />
              <div className="text-left font-bvp">
                <p className="font-semibold text-xs text-primary">Chuyển khoản trước</p>
                <p className="text-[10px] text-secondary mt-0.5">Khuyến nghị. Xác nhận đơn nhanh hơn. QR ngân hàng sẽ hiện sau khi gửi.</p>
              </div>
            </label>
            <label className="flex items-start gap-3 p-3 border border-border rounded-3 cursor-pointer hover:bg-subtle/30 transition-colors w-full">
              <input 
                type="radio" 
                name="paymentMethod" 
                value="cod" 
                checked={paymentMethod === "cod"} 
                onChange={(e) => setPaymentMethod(e.target.value as 'bank_transfer' | 'cod')}
                className="mt-1 accent-accent"
              />
              <div className="text-left font-bvp">
                <p className="font-semibold text-xs text-primary">Thanh toán khi nhận hàng (COD)</p>
                <p className="text-[10px] text-secondary mt-0.5">Phù hợp Hà Nội nội thành. Tỉnh khác phụ phí ship.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Note */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Chi tiết yêu cầu thiết kế / Ý tưởng hợp tác
          </label>
          <textarea 
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ví dụ: Chúng tôi cần in chìm logo 'Cốc Nối' màu men tro mộc, thời gian hoàn thành trước ngày 20/12..."
            className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>

        <button 
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-canvas font-bvp font-medium text-xs px-6 py-4 rounded-2 hover:bg-[#0E1220] transition-all duration-300 flex items-center justify-center gap-2 group shadow-sm disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-accent" />
              <span>Đang gửi thông tin...</span>
            </>
          ) : (
            <>
              <span>Gửi thông tin đối tác</span>
              <Send className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
