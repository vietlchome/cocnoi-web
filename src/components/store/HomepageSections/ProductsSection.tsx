import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

interface ProductsSectionProps {
  config: any;
  products: any[];
}

export default function ProductsSection({ config, products }: ProductsSectionProps) {
  return (
    <section className="py-20 md:py-28 bg-[#FCFAF5] border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-12 md:mb-16 gap-4">
          <div>
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
              {config.tagline}
            </span>
            <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary">
              {config.title}
            </h2>
          </div>
          <Link 
            href="/cua-hang" 
            className="font-bvp text-sm font-semibold text-primary hover:text-accent border-b border-primary hover:border-accent transition-colors pb-1 flex items-center gap-1.5"
            style={{ borderBottomColor: "var(--color-deep-indigo)" }}
          >
            Xem tất cả sản phẩm
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((prod) => (
            <div 
              key={prod.id} 
              className="group flex flex-col bg-canvas border border-border rounded-3 overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1"
            >
              <div className={`relative h-64 overflow-hidden flex items-center justify-center`}>
                {prod.badge && (
                  <span 
                    style={{ backgroundColor: "var(--color-deep-indigo)" }}
                    className="absolute top-4 left-4 bg-primary text-canvas font-bvp text-[10px] font-bold px-2.5 py-1 rounded-1 uppercase tracking-wider z-10"
                  >
                    {prod.badge}
                  </span>
                )}
                
                <Image 
                  src={prod.firstImage} 
                  alt={prod.name} 
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                  className="object-cover group-hover:scale-105 transition-transform duration-500" 
                />

                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                  <Link 
                    href={`/cua-hang/${prod.slug}`}
                    className="bg-canvas text-primary font-bvp font-medium text-xs px-4 py-2.5 rounded-2 border border-border shadow-xs hover:border-accent hover:text-accent transition-colors"
                  >
                    Chi tiết sản phẩm
                  </Link>
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <span className="font-bvp text-xs text-secondary mb-1.5">{prod.category}</span>
                <h3 className="font-playfair text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors">
                  {prod.name}
                </h3>
                
                {/* Rating sao */}
                <div className="flex items-center gap-1.5 mb-3">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-3.5 h-3.5 ${
                          i < Math.floor(prod.averageRating || 0) 
                            ? "text-amber-400 fill-amber-400" 
                            : "text-border fill-border/20"
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-[10px] text-secondary/60">
                    {prod.reviewCount > 0 ? `${prod.averageRating} (${prod.reviewCount} đánh giá)` : `(0 đánh giá)`}
                  </span>
                </div>

                <p className="font-bvp text-xs text-secondary leading-relaxed mb-4 flex-grow text-justify line-clamp-2" style={{ color: "var(--color-dark-brown)" }}>
                  {prod.desc}
                </p>
                
                <div className="flex items-center justify-between border-t border-border pt-4 mt-auto">
                  <div>
                    <span className="font-bvp text-[10px] text-secondary block">Giá bán</span>
                    <span className="font-bvp text-sm font-bold text-secondary">
                      {prod.price.toLocaleString("vi-VN")} đ
                    </span>
                  </div>
                  
                  <Link
                    href={`/cua-hang/${prod.slug}`}
                    style={{ backgroundColor: "var(--color-terracotta)" }}
                    className="bg-accent hover:opacity-90 text-canvas font-bvp text-xs font-semibold px-3.5 py-2 rounded-2 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>Chi tiết</span>
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
