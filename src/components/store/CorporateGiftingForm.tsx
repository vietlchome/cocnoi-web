"use client";

import { useState } from "react";
import { createInquiry } from "@/lib/actions/inquiry.actions";
import { Send, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { parseError, type FriendlyError } from "@/lib/utils/error-messages";
import FormErrorAlert from "@/components/shared/FormErrorAlert";

export default function CorporateGiftingForm() {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [position, setPosition] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [expectedQty, setExpectedQty] = useState("20-50");
  const [occasion, setOccasion] = useState("tet");
  const [budgetRange, setBudgetRange] = useState("300-500");
  const [customRequest, setCustomRequest] = useState("");
  const [deadline, setDeadline] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError(null);

    if (!companyName.trim()) {
      setError({ category: "validation", message: "Tên công ty, doanh nghiệp không được trống.", showRetryButton: false, showReloadButton: false });
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
        position.trim() && `Chức vụ: ${position}`,
        `Dịp sử dụng: ${occasion}`,
        `Ngân sách dự kiến/đôi: ${budgetRange}`,
        customRequest.trim() && `Yêu cầu custom: ${customRequest}`,
        deadline.trim() && `Hạn nhận hàng: ${deadline}`,
        note.trim() && `Ghi chú: ${note}`
      ].filter(Boolean).join(" | ");

      let numericQty = 20;
      if (expectedQty === "20-50") numericQty = 35;
      else if (expectedQty === "50-100") numericQty = 75;
      else if (expectedQty === "100-200") numericQty = 150;
      else if (expectedQty === "200+") numericQty = 250;

      const response = await createInquiry({
        customerName: contactName,
        phone,
        email: email || null,
        companyName: companyName || null,
        productId: null,
        quantity: numericQty,
        note: fullNote,
        source: "Corporate Gifting Inquiry",
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
      <div className="bg-canvas border border-accent/40 p-8 md:p-12 rounded-4 text-center max-w-2xl mx-auto shadow-md animate-fade-in">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4 animate-bounce" />
        <h3 className="font-playfair text-2xl font-bold text-primary mb-3">Gửi yêu cầu thành công</h3>
        <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mb-6">
          Cảm ơn bạn đã quan tâm đến giải pháp quà tặng doanh nghiệp của Cốc Nối. Chúng tôi sẽ xem xét yêu cầu và chủ động liên hệ gửi báo giá chi tiết kèm bản phác thảo market trong vòng 24 giờ.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setCompanyName("");
            setContactName("");
            setPosition("");
            setPhone("");
            setEmail("");
            setExpectedQty("20-50");
            setOccasion("tet");
            setBudgetRange("300-500");
            setCustomRequest("");
            setDeadline("");
            setNote("");
            setError(null);
          }}
          className="font-bvp font-medium text-xs text-accent hover:text-[#A75426] underline transition-colors"
        >
          Gửi thêm yêu cầu quà tặng khác
        </button>
      </div>
    );
  }

  return (
    <div className="bg-canvas border border-border/80 p-6 md:p-10 rounded-4 max-w-3xl mx-auto shadow-sm">
      <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary mb-6 text-center">
        Nhận báo giá quà tặng doanh nghiệp
      </h3>

      {error && (
        <div className="mb-6">
          <FormErrorAlert error={error} onRetry={handleSubmit} />
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Tên công ty, doanh nghiệp <span className="text-accent">*</span>
            </label>
            <input 
              type="text" 
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Ví dụ: Công ty Cổ phần Công nghệ ABC"
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

          {/* Position */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Chức vụ người liên hệ
            </label>
            <input 
              type="text" 
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ví dụ: Trưởng phòng Hành chính Nhân sự"
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
              placeholder="Ví dụ: name@company.com"
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Expected Quantity */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Số lượng dự kiến
            </label>
            <select
              value={expectedQty}
              onChange={(e) => setExpectedQty(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="20-50">20 - 50 đôi cốc</option>
              <option value="50-100">50 - 100 đôi cốc</option>
              <option value="100-200">100 - 200 đôi cốc</option>
              <option value="200+">Trên 200 đôi cốc</option>
            </select>
          </div>

          {/* Occasion */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Dịp sử dụng quà tặng
            </label>
            <select
              value={occasion}
              onChange={(e) => setOccasion(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="tet">Quà tặng Tết</option>
              <option value="anniversary">Kỷ niệm ngày thành lập</option>
              <option value="welcome-kit">Welcome kit nhân viên mới</option>
              <option value="event">Sự kiện, hội thảo</option>
              <option value="other">Khác</option>
            </select>
          </div>

          {/* Budget Range */}
          <div className="flex flex-col items-start gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Ngân sách dự kiến, đôi cốc
            </label>
            <select
              value={budgetRange}
              onChange={(e) => setBudgetRange(e.target.value)}
              className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            >
              <option value="under-300">Dưới 300.000 đ</option>
              <option value="300-500">300.000 đ - 500.000 đ</option>
              <option value="500-1000">500.000 đ - 1.000.000 đ</option>
              <option value="over-1000">Trên 1.000.000 đ</option>
            </select>
          </div>
        </div>

        {/* Deadline */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Hạn nhận hàng mong muốn
          </label>
          <input 
            type="text" 
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            placeholder="Ví dụ: Trước ngày 15 tháng 11 năm 2026..."
            className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        {/* Custom Request */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Yêu cầu tùy chỉnh logo, bao bì, thiệp cảm ơn
          </label>
          <textarea 
            rows={3}
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            placeholder="Mô tả các yêu cầu in khắc logo, thiết kế hộp quà, hay nội dung thiệp tay..."
            className="w-full bg-[#FAF8F5] border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors resize-y"
          />
        </div>

        {/* Note */}
        <div className="flex flex-col items-start gap-2">
          <label className="font-bvp text-xs font-bold text-primary">
            Ghi chú thêm
          </label>
          <textarea 
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Các ghi chú hoặc câu hỏi khác cho chúng tôi..."
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
              <span>Đang gửi yêu cầu...</span>
            </>
          ) : (
            <>
              <span>Gửi yêu cầu báo giá</span>
              <Send className="w-4 h-4 text-accent transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}
