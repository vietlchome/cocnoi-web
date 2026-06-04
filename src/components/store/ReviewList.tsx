"use client";

import { useState, useEffect } from "react";
import { getProductReviewsAction, getProductRatingAction } from "@/lib/actions/review.actions";
import { Star, MessageSquare, Award, Loader2, RefreshCw } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  customerName: string;
  createdAt: Date;
}

interface ReviewListProps {
  productId: string;
}

export default function ReviewList({ productId }: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [ratingSummary, setRatingSummary] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchRating = async () => {
    try {
      const res = await getProductRatingAction(productId);
      if (res.success && res.data) {
        setRatingSummary(res.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchReviews = async (pageNum = 1, append = false) => {
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);

    try {
      const res = await getProductReviewsAction(productId, pageNum, 5);
      if (res.success) {
        const data = res as any;
        if (data.reviews) {
          // Cast or parse dates safely
          const parsedReviews = data.reviews.map((r: any) => ({
            ...r,
            createdAt: new Date(r.createdAt),
          }));

          if (append) {
            setReviews((prev) => [...prev, ...parsedReviews]);
          } else {
            setReviews(parsedReviews);
          }
          setTotalPages(data.totalPages || 1);
          setPage(pageNum);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchRating();
    fetchReviews(1, false);
  }, [productId]);

  const handleLoadMore = () => {
    if (page < totalPages) {
      fetchReviews(page + 1, true);
    }
  };

  // Helper to render static stars
  const renderStars = (num: number, size = 4) => {
    return (
      <div className="flex items-center gap-0.5 text-accent select-none">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`fill-current ${
              star <= num ? "text-accent" : "text-border/40"
            } ${size === 4 ? "w-4 h-4" : "w-5 h-5"}`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
        <span className="font-bvp text-xs text-secondary ml-2">Đang tải đánh giá sản phẩm...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 my-12 max-w-2xl mx-auto">
      
      {/* 1. AGGREGATED SUMMARY CARD */}
      <div className="bg-[#FAF8F5] border border-border/60 p-6 md:p-8 rounded-4 grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
        
        {/* Number Average block */}
        <div className="sm:col-span-4 text-center sm:border-r border-border/40 sm:pr-6 flex flex-col items-center justify-center">
          <span className="font-playfair text-4xl md:text-5xl font-black text-primary leading-none">
            {ratingSummary.average > 0 ? ratingSummary.average : "0.0"}
          </span>
          <div className="my-2">{renderStars(Math.round(ratingSummary.average), 5)}</div>
          <span className="font-bvp text-[11px] text-secondary font-semibold">
            {ratingSummary.count} đánh giá thực tế
          </span>
        </div>

        {/* Rating text guidelines */}
        <div className="sm:col-span-8 flex flex-col gap-2 font-bvp text-xs text-secondary justify-center leading-relaxed">
          <span className="flex items-center gap-2 font-bold text-primary">
            <Award className="w-4 h-4 text-accent shrink-0" />
            <span>Đánh giá đã được xác thực giao dịch</span>
          </span>
          <p>
            Mọi bài viết nhận xét tại Cốc Nối đều được xác minh dựa trên mã hóa đơn lẻ đã giao thành công. Ý kiến phản ánh thật, không chỉnh sửa hay lọc bớt đánh giá xấu để bảo vệ khách quan quyền lợi người tiêu dùng tốt nhất.
          </p>
        </div>
      </div>

      {/* 2. REVIEWS FEED LIST */}
      <div className="flex flex-col gap-6">
        <h4 className="font-playfair text-lg font-bold text-primary border-b border-border/40 pb-3 mb-2 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-accent shrink-0" />
          <span>Ý kiến khách hàng ({ratingSummary.count})</span>
        </h4>

        {reviews.length === 0 ? (
          <div className="text-center py-12 text-secondary/50 font-bvp text-xs border border-dashed border-border/60 rounded-3 bg-canvas">
            Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên gửi đánh giá!
          </div>
        ) : (
          <div className="flex flex-col gap-6 divide-y divide-border/20">
            {reviews.map((rev) => (
              <div key={rev.id} className="flex flex-col gap-2.5 pt-6 first:pt-0 animate-fade-in text-left">
                
                {/* Reviewer Header metadata */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h5 className="font-bvp font-bold text-xs text-primary flex items-center gap-2">
                      <span>{rev.customerName}</span>
                      <span className="bg-[#EFE9DF] text-accent font-bvp text-[8px] font-bold px-1.5 py-0.5 rounded-1 uppercase tracking-wider scale-95 shrink-0 select-none">
                        Đã mua lẻ
                      </span>
                    </h5>
                    <span className="font-bvp text-[9px] text-secondary/45 mt-0.5 block">
                      {rev.createdAt.toLocaleDateString("vi-VN")}
                    </span>
                  </div>
                  {renderStars(rev.rating, 4)}
                </div>

                {/* Comment text */}
                {rev.comment && (
                  <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed bg-[#FAF8F5]/40 border border-border/20 p-3.5 rounded-2 mt-1">
                    {rev.comment}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. LOAD MORE BUTTON */}
      {page < totalPages && (
        <div className="text-center mt-4">
          <button
            onClick={handleLoadMore}
            disabled={loadingMore}
            className="border border-border/80 text-primary hover:text-accent hover:border-accent font-bvp font-semibold text-xs px-6 py-3 rounded-2 transition-colors flex items-center gap-2 mx-auto cursor-pointer disabled:opacity-50"
          >
            {loadingMore ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                <span>Đang tải thêm...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-3.5 h-3.5 text-accent" />
                <span>Xem thêm nhận xét</span>
              </>
            )}
          </button>
        </div>
      )}

    </div>
  );
}
