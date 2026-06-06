"use client";

import { useState } from "react";
import { verifyOrderAction, submitReviewAction } from "@/lib/actions/review.actions";
import { Star, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";
import { parseError, type FriendlyError } from "@/lib/utils/error-messages";
import FormErrorAlert from "@/components/shared/FormErrorAlert";

interface ReviewSectionProps {
  productId: string; // The active product ID on this detail page
  productName: string;
}

export default function ReviewSection({ productId, productName }: ReviewSectionProps) {
  const [orderIdInput, setOrderIdInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<FriendlyError | null>(null);

  // Verified state
  const [verifiedOrder, setVerifiedOrder] = useState<{
    orderId: string;
    customerName: string;
    items: Array<{ productId: string; name: string; slug: string; images: string[] }>;
  } | null>(null);

  // Form input state
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(productId);

  const handleVerifyOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;

    setVerifying(true);
    setError(null);

    try {
      const res = await verifyOrderAction(orderIdInput.trim());
      if (res.success && res.data) {
        setVerifiedOrder(res.data);
        
        // Auto-select the current product if it exists in the order
        const itemIds = res.data.items.map((i: any) => i.productId);
        if (itemIds.includes(productId)) {
          setSelectedProductId(productId);
        } else if (res.data.items.length > 0) {
          setSelectedProductId(res.data.items[0].productId);
        }
      } else {
        setError({ category: "validation", message: res.error || "Không thể xác minh đơn hàng. Vui lòng kiểm tra lại mã đơn hàng.", showRetryButton: false, showReloadButton: false });
      }
    } catch (err) {
      console.error(err);
      setError(parseError(err));
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifiedOrder) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await submitReviewAction({
        orderId: verifiedOrder.orderId,
        productId: selectedProductId,
        rating,
        comment: comment.trim() || null,
        customerName: verifiedOrder.customerName,
      });

      if (res.success) {
        setSuccess(true);
      } else {
        setError({ category: "unknown", message: res.error || "Gửi đánh giá thất bại.", showRetryButton: true, showReloadButton: false });
      }
    } catch (err) {
      console.error(err);
      setError(parseError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="bg-canvas border border-accent/40 rounded-4 p-8 text-center max-w-lg mx-auto shadow-md animate-fade-in my-8">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-4 animate-bounce" />
        <h3 className="font-playfair text-2xl font-bold text-primary mb-3">Đánh giá của bạn đã được ghi nhận!</h3>
        <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mb-6">
          Cảm ơn sự đóng góp chân thành của quý khách. Ý kiến phản hồi quý báu sẽ giúp Cốc Nối cải thiện chất lượng sản phẩm và truyền hơi ấm đến những khách hàng tiếp theo tốt hơn.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setVerifiedOrder(null);
            setOrderIdInput("");
            setComment("");
            setRating(5);
            setError(null);
          }}
          className="bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3 rounded-2 hover:bg-[#0E1220] transition-colors"
        >
          Hoàn tất
        </button>
      </div>
    );
  }

  return (
    <div className="border border-border/80 rounded-4 p-6 md:p-8 bg-[#FAF8F5]/40 mt-12 max-w-2xl mx-auto shadow-sm">
      <div className="flex items-center gap-2 mb-4 border-b border-border/40 pb-4">
        <Sparkles className="w-5 h-5 text-accent shrink-0" />
        <h3 className="font-playfair text-lg md:text-xl font-bold text-primary">
          Đánh giá sản phẩm đã xác thực
        </h3>
      </div>

      {error && (
        <div className="mb-6">
          <FormErrorAlert 
            error={error} 
            onRetry={!verifiedOrder ? () => handleVerifyOrder({ preventDefault: () => {} } as any) : () => handleSubmitReview({ preventDefault: () => {} } as any)} 
          />
        </div>
      )}

      {/* STEP 1: VERIFY ORDER ID */}
      {!verifiedOrder ? (
        <form onSubmit={handleVerifyOrder} className="flex flex-col gap-4">
          <p className="font-bvp text-xs text-secondary leading-relaxed">
            Để đảm bảo tính trung thực khách quan, chỉ những khách mua lẻ thực sự đã nhận được hàng mới có thể đánh giá. Vui lòng cung cấp **Mã đơn hàng điện tử** của bạn để bắt đầu.
          </p>
          <div className="flex gap-3">
            <input
              type="text"
              value={orderIdInput}
              onChange={(e) => setOrderIdInput(e.target.value)}
              placeholder="Nhập mã đơn hàng (ví dụ: clx123abc...)"
              required
              className="flex-1 bg-canvas border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors"
            />
            <button
              type="submit"
              disabled={verifying}
              className="bg-primary text-canvas hover:bg-[#0E1220] font-bvp font-bold text-xs px-6 py-3.5 rounded-2 transition-all shrink-0 flex items-center gap-2 disabled:opacity-50"
            >
              {verifying ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Đang xác minh...</span>
                </>
              ) : (
                <>
                  <span>Xác minh</span>
                  <ArrowRight className="w-3.5 h-3.5 text-accent" />
                </>
              )}
            </button>
          </div>
          <span className="font-bvp text-[10px] text-secondary/50">
            * Mỗi mã đơn hàng lẻ (status: DELIVERED) chỉ được gửi đánh giá duy nhất một lần.
          </span>
        </form>
      ) : (
        /* STEP 2: VERIFIED FORM SUBMISSION */
        <form onSubmit={handleSubmitReview} className="flex flex-col gap-5 animate-fade-in">
          <div className="bg-canvas border border-border/60 p-4 rounded-3 text-xs font-bvp flex flex-col gap-1.5 leading-normal">
            <span className="text-secondary">
              Xin chào, <strong className="text-primary">{verifiedOrder.customerName}</strong>. Đơn hàng của bạn đã được xác minh thành công!
            </span>
            <span className="text-secondary">
              Mã đơn: <span className="font-mono text-accent font-bold">{verifiedOrder.orderId}</span>
            </span>
          </div>

          {/* CHOOSE PRODUCT TO REVIEW */}
          <div className="flex flex-col gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Chọn sản phẩm muốn đánh giá:
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-canvas border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors cursor-pointer"
            >
              {verifiedOrder.items.map((item) => (
                <option key={item.productId} value={item.productId}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          {/* INTERACTIVE STAR RATING PICKER */}
          <div className="flex flex-col gap-2 items-start">
            <label className="font-bvp text-xs font-bold text-primary">
              Số sao đánh giá: <span className="text-accent font-bold">{rating} sao</span>
            </label>
            <div className="flex items-center gap-1.5 py-1">
              {[1, 2, 3, 4, 5].map((star) => {
                const isSelected = star <= rating;
                const isHovered = hoverRating !== null && star <= hoverRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    className="p-1 text-accent transition-transform hover:scale-110 focus:outline-none cursor-pointer"
                    title={`${star} sao`}
                  >
                    <Star
                      className={`w-7 h-7 fill-current ${
                        isHovered || isSelected ? "text-accent" : "text-border/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="font-bvp text-[10px] text-secondary/60">
              {rating === 5 && "ệt vời! Rất hài lòng với sản phẩm gốm Cốc Nối."}
              {rating === 4 && "Hài lòng. Cốc cầm đầm tay, nung chín đẹp."}
              {rating === 3 && "Bình thường. Chất lượng men tro tạm ổn."}
              {rating === 2 && "Chưa hài lòng. Cần cải thiện."}
              {rating === 1 && "Không hài lòng. Gặp sự cố sản phẩm."}
            </span>
          </div>

          {/* TEXTAREA COMMENT */}
          <div className="flex flex-col gap-2">
            <label className="font-bvp text-xs font-bold text-primary">
              Nhận xét đánh giá chi tiết
            </label>
            <textarea
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm thực tế về cảm giác cầm nắm cốc, nước men tro, hay độ đầm tay chắc của gốm sứ..."
              className="w-full bg-canvas border border-border/80 rounded-2 p-3 font-bvp text-xs text-primary focus:outline-none focus:border-accent transition-colors resize-none"
            />
            <div className="flex justify-between w-full font-bvp text-[10px] text-secondary/40">
              <span>Nội dung nhận xét tối đa 500 ký tự.</span>
              <span>{comment.length}/500</span>
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <div className="flex gap-4 items-center justify-between border-t border-border/40 pt-4 mt-2">
            <button
              type="button"
              onClick={() => {
                setVerifiedOrder(null);
                setError(null);
              }}
              className="font-bvp font-medium text-xs text-secondary hover:text-primary transition-colors cursor-pointer"
            >
              Quay lại xác minh
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-canvas hover:bg-[#0E1220] font-bvp font-bold text-xs px-8 py-3.5 rounded-2 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                  <span>Đang gửi đánh giá...</span>
                </>
              ) : (
                <>
                  <span>Gửi đánh giá</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
