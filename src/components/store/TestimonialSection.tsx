import React from 'react';
import { Star, BadgeCheck } from 'lucide-react';
import Link from 'next/link';

interface Review {
  id: string;
  customerName: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  product: {
    name: string;
    slug: string;
    images?: any;
  };
}

interface TestimonialSectionProps {
  reviews: Review[];
}

export default function TestimonialSection({ reviews }: TestimonialSectionProps) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="py-20 md:py-32 px-4 md:px-8 bg-subtle/20 border-t border-border/40">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <span className="font-bvp text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block">
            Khách hàng chia sẻ
          </span>
          <h2 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-6">
            Mỗi chiếc cốc, một câu chuyện
          </h2>
          <p className="font-bvp text-sm text-secondary/80 max-w-2xl mx-auto leading-relaxed">
            Những đánh giá chân thực từ khách hàng đã tin chọn và trải nghiệm các sản phẩm gốm mộc của Cốc Nối.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {reviews.map((review) => {
            let imgUrl = '';
            if (review.product.images) {
              if (Array.isArray(review.product.images) && review.product.images.length > 0) {
                imgUrl = review.product.images[0];
              }
            }

            return (
              <div key={review.id} className="bg-canvas border border-border/60 p-5 md:p-6 rounded-3 shadow-sm hover:shadow-md transition-shadow relative">
                <div className="flex gap-4 md:gap-5">
                  {/* Cột trái: Ảnh & Sao */}
                  <div className="flex flex-col items-center shrink-0 w-20 md:w-24">
                    {imgUrl ? (
                      <Link 
                        href={`/cua-hang/${review.product.slug}`} 
                        className="block w-20 h-20 md:w-24 md:h-24 rounded-lg border border-border/40 overflow-hidden mb-3 group shadow-sm shrink-0"
                        title={review.product.name}
                      >
                        <img src={imgUrl} alt={review.product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </Link>
                    ) : (
                      <Link 
                        href={`/cua-hang/${review.product.slug}`} 
                        className="block w-20 h-20 md:w-24 md:h-24 rounded-lg border border-border/40 mb-3 bg-subtle/50 flex items-center justify-center text-[10px] text-secondary/50 group hover:bg-subtle transition-colors shrink-0"
                        title={review.product.name}
                      >
                        <span className="text-center px-1">Xem SP</span>
                      </Link>
                    )}
                    <div className="flex items-center gap-0.5 justify-center flex-wrap">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          className={`w-3.5 h-3.5 md:w-4 md:h-4 ${
                            i < review.rating ? 'fill-accent text-accent' : 'fill-border/30 text-border/30'
                          }`} 
                        />
                      ))}
                    </div>
                  </div>

                  {/* Cột phải: Tên & Đánh giá */}
                  <div className="flex flex-col flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-playfair font-bold text-base md:text-lg text-primary truncate max-w-[120px] sm:max-w-[200px]">{review.customerName}</span>
                      <span title="Đã mua hàng">
                        <BadgeCheck 
                          className="w-5 h-5 text-white fill-emerald-500 shrink-0 mt-0.5 cursor-help" 
                        />
                      </span>
                    </div>
                    
                    <p className="font-bvp text-sm md:text-base text-primary/90 leading-relaxed italic text-justify line-clamp-4 break-words">
                      {review.comment || 'Rất hài lòng với chất lượng gốm và dịch vụ của Cốc Nối.'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
