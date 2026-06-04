"use client";

import { useState } from "react";
import { getOrdersByContactAction, submitReviewAction } from "@/lib/actions/review.actions";
import { Star, CheckCircle2, AlertCircle, Loader2, ArrowRight, PackageSearch, MessageSquare, ChevronLeft } from "lucide-react";
import Image from "next/image";

export default function OrderTrackingClient() {
  const [contactInput, setContactInput] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [orders, setOrders] = useState<any[] | null>(null);

  // Review Flow State
  const [reviewOrder, setReviewOrder] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");

  const handleSearchOrders = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInput.trim() || contactInput.trim().length < 3) {
      setError("Vui lòng nhập chính xác số điện thoại hoặc email.");
      return;
    }

    setVerifying(true);
    setError("");
    setReviewOrder(null);
    setSuccess(false);

    try {
      const res = await getOrdersByContactAction(contactInput.trim());
      if (res.success && res.data) {
        setOrders(res.data);
        if (res.data.length === 0) {
          setError("Không tìm thấy đơn hàng nào khớp với thông tin bạn cung cấp.");
        }
      } else {
        setError(res.error || "Gặp sự cố khi tra cứu đơn hàng.");
      }
    } catch (err) {
      console.error(err);
      setError("Gặp sự cố kết nối.");
    } finally {
      setVerifying(false);
    }
  };

  const handleOpenReview = (order: any) => {
    setReviewOrder(order);
    setRating(5);
    setComment("");
    setSuccess(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewOrder || !reviewOrder.highestValueItem) return;

    setSubmitting(true);
    setError("");

    try {
      const res = await submitReviewAction({
        orderId: reviewOrder.orderId,
        productId: reviewOrder.highestValueItem.productId,
        rating,
        comment: comment.trim() || null,
        customerName: reviewOrder.customerName,
      });

      if (res.success) {
        setSuccess(true);
        // Cập nhật lại danh sách đơn hàng
        setOrders(prev => prev ? prev.map(o => o.orderId === reviewOrder.orderId ? { ...o, hasReview: true } : o) : null);
      } else {
        setError(res.error || "Gửi đánh giá thất bại.");
      }
    } catch (err) {
      console.error(err);
      setError("Gặp sự cố kết nối khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  // Màn hình thành công sau khi gửi đánh giá
  if (success) {
    return (
      <div className="bg-canvas border border-accent/40 rounded-4 p-8 md:p-12 text-center max-w-lg mx-auto shadow-md animate-fade-in my-8">
        <CheckCircle2 className="w-16 h-16 text-accent mx-auto mb-5 animate-bounce" />
        <h3 className="font-playfair text-2xl font-bold text-primary mb-3">Cảm ơn bạn!</h3>
        <p className="font-bvp text-sm text-secondary leading-relaxed mb-8">
          Đánh giá của bạn đã được ghi nhận. Ý kiến phản hồi quý báu sẽ giúp Cốc Nối cải thiện chất lượng sản phẩm và truyền hơi ấm đến những khách hàng tiếp theo.
        </p>
        <button 
          onClick={() => {
            setSuccess(false);
            setReviewOrder(null);
          }}
          className="bg-primary text-canvas font-bvp font-bold text-sm px-8 py-3.5 rounded-2 hover:bg-[#0E1220] transition-all cursor-pointer"
        >
          Quay lại danh sách đơn
        </button>
      </div>
    );
  }

  // Màn hình Nhập Đánh Giá cho 1 đơn cụ thể
  if (reviewOrder) {
    const item = reviewOrder.highestValueItem;
    let firstImage = 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80';
    try {
      const imgs = JSON.parse(item.images);
      if (Array.isArray(imgs) && imgs.length > 0) {
        firstImage = imgs[0];
      }
    } catch (e) {}

    return (
      <div className="border border-border/80 rounded-4 p-6 md:p-10 bg-[#FAF8F5]/40 mt-8 max-w-2xl mx-auto shadow-sm animate-fade-in">
        <div className="flex items-center gap-3 mb-6 border-b border-border/40 pb-5">
          <button onClick={() => setReviewOrder(null)} className="p-1 -ml-1 text-secondary hover:text-primary transition-colors cursor-pointer">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary">
            Chia sẻ cảm nhận
          </h3>
        </div>

        {error && (
          <div className="bg-red-50 text-red-700 border border-red-200 p-4 rounded-2 flex items-start gap-3 mb-6 text-xs font-bvp leading-relaxed animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmitReview} className="flex flex-col gap-6">
          {/* Thông tin SP đại diện */}
          <div className="flex gap-4 p-4 border border-border/60 bg-white rounded-3 shadow-xs">
            <div className="w-20 h-20 rounded-2 bg-subtle/50 overflow-hidden shrink-0 border border-border/30">
              <img src={firstImage} alt={item.name} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-bvp text-xs text-secondary mb-1">Mã đơn: <strong className="text-primary font-mono">{reviewOrder.orderId.slice(-8).toUpperCase()}</strong></span>
              <h4 className="font-playfair font-bold text-base text-primary mb-1">{item.name}</h4>
              <span className="font-bvp text-xs text-secondary">Và {reviewOrder.totalItemsCount - 1} sản phẩm khác</span>
            </div>
          </div>

          {/* Chọn sao */}
          <div className="flex flex-col gap-2 items-start bg-accent/5 p-5 rounded-3 border border-accent/10">
            <label className="font-bvp text-sm font-bold text-primary">
              Số sao đánh giá: <span className="text-accent font-bold">{rating} sao</span>
            </label>
            <div className="flex items-center gap-1.5 py-2">
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
                  >
                    <Star
                      className={`w-10 h-10 fill-current transition-colors ${
                        isHovered || isSelected ? "text-accent" : "text-border/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nhập text */}
          <div className="flex flex-col gap-2">
            <label className="font-bvp text-sm font-bold text-primary">
              Nhận xét chi tiết (Không bắt buộc)
            </label>
            <textarea
              rows={4}
              maxLength={500}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Cảm giác cầm nắm, màu men, chất lượng hoàn thiện..."
              className="w-full bg-canvas border border-border/80 rounded-2 p-4 font-bvp text-sm text-primary focus:outline-none focus:border-accent transition-colors resize-none shadow-inner"
            />
          </div>

          <div className="flex gap-4 justify-end border-t border-border/40 pt-5 mt-2">
            <button
              type="submit"
              disabled={submitting}
              className="bg-primary text-canvas hover:bg-[#0E1220] font-bvp font-bold text-sm px-8 py-4 rounded-2 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer w-full md:w-auto justify-center"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <span>Gửi đánh giá</span>
                  <CheckCircle2 className="w-4 h-4 text-accent" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    );
  }

  // Màn hình chính: Nhập Email/SĐT và hiển thị danh sách
  return (
    <div className="max-w-3xl mx-auto mt-8 flex flex-col gap-8">
      
      {/* Search Form */}
      <div className="bg-[#FAF8F5]/40 border border-border/80 rounded-4 p-6 md:p-8 shadow-sm">
        <form onSubmit={handleSearchOrders} className="flex flex-col gap-4">
          <p className="font-bvp text-sm text-secondary leading-relaxed">
            Nhập <strong>Số điện thoại</strong> hoặc <strong>Email</strong> bạn đã dùng để đặt hàng.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <PackageSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/50" />
              <input
                type="text"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                placeholder="0987654321 hoặc email@example.com"
                required
                className="w-full bg-white border border-border/80 rounded-2 py-4 pl-12 pr-4 font-bvp text-sm text-primary focus:outline-none focus:border-accent transition-colors shadow-inner"
              />
            </div>
            <button
              type="submit"
              disabled={verifying}
              className="bg-primary text-canvas hover:bg-[#0E1220] font-bvp font-bold text-sm px-8 py-4 rounded-2 transition-all shrink-0 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {verifying ? <Loader2 className="w-4 h-4 animate-spin text-accent" /> : <span>Tìm đơn</span>}
            </button>
          </div>
          {error && <span className="font-bvp text-xs text-error font-medium">{error}</span>}
        </form>
      </div>

      {/* Results List */}
      {orders && (
        <div className="flex flex-col gap-4 animate-slide-up">
          <h3 className="font-playfair text-xl font-bold text-primary mb-2">Đơn hàng của bạn ({orders.length})</h3>
          
          {orders.map((order) => {
            const isDelivered = order.status === "DELIVERED";
            
            return (
              <div key={order.orderId} className="bg-white border border-border/60 rounded-3 p-5 md:p-6 shadow-xs hover:shadow-sm transition-shadow flex flex-col md:flex-row gap-6 md:items-center justify-between">
                
                {/* Order Info */}
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-sm text-primary bg-subtle/50 px-2 py-1 rounded">
                      #{order.orderId.slice(-8).toUpperCase()}
                    </span>
                    <span className="font-bvp text-xs text-secondary">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                    <span className={`font-bvp text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider ${
                      isDelivered ? 'bg-emerald-100 text-emerald-800' : 
                      order.status === 'CANCELLED' ? 'bg-error/10 text-error' : 
                      'bg-accent/10 text-accent'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <p className="font-bvp text-sm text-primary mt-1 line-clamp-1" title={order.itemsSummary}>
                    {order.itemsSummary}
                  </p>
                  <div className="flex gap-4 font-bvp text-xs text-secondary mt-1">
                    <span>Số lượng: <strong className="text-primary">{order.totalItemsCount}</strong></span>
                    <span>Tổng: <strong className="text-primary">{order.totalAmount.toLocaleString('vi-VN')} đ</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center justify-end border-t border-border/30 md:border-t-0 pt-4 md:pt-0">
                  {isDelivered && !order.hasReview && (
                    <button 
                      onClick={() => handleOpenReview(order)}
                      className="bg-accent text-canvas font-bvp font-bold text-xs px-5 py-2.5 rounded-2 hover:bg-accent-hover transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5" />
                      Đánh giá ngay
                    </button>
                  )}
                  {isDelivered && order.hasReview && (
                    <div className="flex items-center gap-1.5 font-bvp text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-2 border border-emerald-100">
                      <CheckCircle2 className="w-4 h-4" />
                      Đã đánh giá
                    </div>
                  )}
                  {!isDelivered && order.status !== 'CANCELLED' && (
                    <div className="font-bvp text-xs text-secondary italic">
                      Đang xử lý giao hàng
                    </div>
                  )}
                </div>
                
              </div>
            );
          })}
        </div>
      )}
      
    </div>
  );
}
