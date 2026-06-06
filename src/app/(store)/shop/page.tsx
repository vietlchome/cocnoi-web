import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, Star, ChevronLeft, ChevronRight, ShoppingBag } from 'lucide-react'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    category?: string
    page?: string
  }>
}

const ITEMS_PER_PAGE = 6

export default async function ShopPage({ searchParams }: PageProps) {
  const params = await searchParams
  const activeCategorySlug = params.category || 'all'
  const currentPage = Number(params.page) || 1

  // 1. Lấy danh sách toàn bộ danh mục để hiển thị thanh lọc bên cạnh
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  })

  // 2. Xây dựng điều kiện lọc sản phẩm
  const whereCondition: any = {
    isActive: true, // Chỉ lấy sản phẩm đang hoạt động (Soft delete = false)
    visibility: 'PUBLIC' // Chỉ lấy sản phẩm hiển thị công khai (ẩn B2B_ONLY)
  }

  if (activeCategorySlug !== 'all') {
    whereCondition.category = {
      slug: activeCategorySlug
    }
  }

  // 3. Tính toán phân trang
  const totalProducts = await prisma.product.count({
    where: whereCondition
  })
  
  const totalPages = Math.ceil(totalProducts / ITEMS_PER_PAGE) || 1
  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  // 4. Lấy danh sách sản phẩm theo bộ lọc và phân trang
  const products = await prisma.product.findMany({
    where: whereCondition,
    include: {
      category: {
        select: { name: true, slug: true }
      },
      reviews: {
        select: { rating: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: ITEMS_PER_PAGE,
    skip: skip
  })

  // Đọc danh sách ảnh
  const getFirstImage = (images: any) => {
    if (Array.isArray(images) && images.length > 0) {
      return images[0]
    }
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80' // Fallback
  }

  return (
    <div className="w-full bg-canvas min-h-screen py-16 md:py-24 font-bvp">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        {/* SHOP HERO HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
            Cửa Hàng Cốc Nối
          </span>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl text-primary mb-4 animate-slide-up">
            BST Gốm Mộc Kể Chuyện
          </h1>
          <p className="text-sm text-secondary leading-relaxed">
            Mỗi mẻ gốm Cốc Nối ra lò mang một cấu trúc vân men và sắc thái độc nhất. Hãy chọn một tác phẩm ưng ý để làm ấm không gian sống của bạn hoặc gửi gắm tình thân.
          </p>
        </div>

        {/* SHOP GRID LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* SIDEBAR BỘ LỌC DANH MỤC (col-span-3) */}
          <aside className="lg:col-span-3 bg-white border border-border/40 p-6 rounded-3 shadow-xs select-none">
            <h3 className="font-playfair font-bold text-base text-primary mb-4 pb-3 border-b border-border/40 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <span>Phân Loại Sản Phẩm</span>
            </h3>

            <div className="flex flex-col gap-1">
              {/* Lọc tất cả */}
              <Link
                href="/shop"
                className={`flex items-center justify-between px-4 py-3 rounded-2 text-xs font-bold transition-all ${
                  activeCategorySlug === 'all'
                    ? 'bg-accent text-canvas'
                    : 'text-secondary hover:bg-subtle/50 hover:text-primary'
                }`}
              >
                <span>Tất cả sản phẩm</span>
              </Link>

              {/* Lọc theo danh mục */}
              {categories.map((cat: any) => (
                <Link
                  key={cat.id}
                  href={`/shop?category=${cat.slug}`}
                  className={`flex items-center justify-between px-4 py-3 rounded-2 text-xs font-bold transition-all ${
                    activeCategorySlug === cat.slug
                      ? 'bg-accent text-canvas'
                      : 'text-secondary hover:bg-subtle/50 hover:text-primary'
                  }`}
                >
                  <span>{cat.name}</span>
                </Link>
              ))}
            </div>
          </aside>

          {/* LƯỚI SẢN PHẨM & PHÂN TRANG (col-span-9) */}
          <main className="lg:col-span-9 flex flex-col gap-12">
            
            {/* Lưới sản phẩm */}
            {products.length === 0 ? (
              <div className="text-center py-20 bg-white border border-gray-200 rounded-2xl shadow-xs text-sm text-gray-500">
                Chưa có sản phẩm nào thuộc danh mục này. Vui lòng quay lại sau!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {products.map((prod: any, idx: number) => {
                  const isOutOfStock = prod.stockQuantity === 0
                  
                  // Calculate average rating
                  const reviews = (prod as any).reviews || [];
                  const reviewCount = reviews.length;
                  const averageRating = reviewCount > 0 
                    ? Number((reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / reviewCount).toFixed(1))
                    : 0;
                  
                  return (
                    <div 
                      key={prod.id} 
                      className="group flex flex-col bg-white border border-border/40 rounded-3 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                    >
                      {/* Container Hình Ảnh */}
                      <div className="relative aspect-square w-full bg-canvas overflow-hidden flex items-center justify-center">
                        {isOutOfStock && (
                          <span className="absolute top-4 left-4 bg-error text-canvas font-bold text-[9px] px-2.5 py-1 rounded-2 uppercase tracking-wider z-10 shadow-sm">
                            Hết hàng
                          </span>
                        )}
                        
                        <Link href={`/shop/${prod.slug}`} className="w-full h-full relative block overflow-hidden">
                          <Image 
                            src={getFirstImage(prod.images)} 
                            alt={prod.name} 
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 300px"
                            className="object-cover group-hover:scale-105 transition-transform duration-500" 
                          />
                        </Link>

                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                          <Link 
                            href={`/shop/${prod.slug}`}
                            className="bg-canvas text-primary font-bold text-xs px-4 py-2.5 rounded-2 border border-border/60 shadow-sm hover:border-accent hover:text-accent transition-colors"
                          >
                            Chi tiết sản phẩm
                          </Link>
                        </div>
                      </div>

                      {/* Thông tin sản phẩm */}
                      <div className="p-6 flex flex-col flex-grow">
                        <span className="text-[10px] uppercase font-bold text-secondary/60 mb-1.5">
                          {prod.category?.name || 'Sản phẩm'}
                        </span>
                        
                        <Link href={`/shop/${prod.slug}`} className="block">
                          <h3 className="font-playfair text-lg font-bold text-primary mb-2 group-hover:text-accent transition-colors line-clamp-1">
                            {prod.name}
                          </h3>
                        </Link>
                        
                        {/* Rating sao */}
                        <div className="flex items-center gap-1.5 mb-3">
                          <div className="flex gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3.5 h-3.5 ${
                                  i < Math.floor(averageRating) 
                                    ? "text-amber-400 fill-amber-400" 
                                    : "text-border fill-border/20"
                                }`} 
                              />
                            ))}
                          </div>
                          <span className="text-[10px] text-secondary/60">
                            {reviewCount > 0 ? `${averageRating} (${reviewCount} đánh giá)` : `(0 đánh giá)`}
                          </span>
                        </div>

                        {/* Mô tả ngắn (Xóa các tag HTML từ Rich Text) */}
                        <p className="text-xs text-secondary leading-relaxed mb-6 flex-grow line-clamp-2">
                          {prod.description.replace(/<[^>]*>/g, '')}
                        </p>
                        
                        {/* Chân Card */}
                        <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-auto">
                          <div>
                            <span className="text-[9px] text-secondary/60 block uppercase font-bold">Giá bán</span>
                            <span className="text-sm font-bold text-primary">
                              {prod.price.toLocaleString("vi-VN")} đ
                            </span>
                          </div>
                          
                          <Link
                            href={`/shop/${prod.slug}`}
                            className={`font-bold text-xs px-4 py-2.5 rounded-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                              isOutOfStock
                                ? 'bg-subtle text-secondary/40 cursor-not-allowed'
                                : 'bg-primary hover:bg-accent text-canvas shadow-sm'
                            }`}
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>{isOutOfStock ? 'Hết hàng' : 'Xem cốc'}</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {/* PHÂN TRANG CHUẨN SEO */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-1.5 border-t border-border/40 pt-6 select-none">
                {/* Trang trước */}
                {currentPage > 1 ? (
                  <Link
                    href={`/shop?${activeCategorySlug !== 'all' ? `category=${activeCategorySlug}&` : ''}page=${currentPage - 1}`}
                    className="p-2 border border-border/60 rounded-2 hover:bg-subtle/50 text-secondary transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </Link>
                ) : (
                  <span className="p-2 border border-border/20 rounded-2 text-secondary/30 cursor-not-allowed">
                    <ChevronLeft size={16} />
                  </span>
                )}

                {/* Danh sách trang */}
                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pageNum = idx + 1
                  const isCurrent = pageNum === currentPage

                  return (
                    <Link
                      key={pageNum}
                      href={`/shop?${activeCategorySlug !== 'all' ? `category=${activeCategorySlug}&` : ''}page=${pageNum}`}
                      className={`w-9 h-9 rounded-2 flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-accent text-canvas shadow-sm shadow-accent/10'
                          : 'border border-border/60 text-secondary hover:bg-subtle/50'
                      }`}
                    >
                      {pageNum}
                    </Link>
                  )
                })}

                {/* Trang sau */}
                {currentPage < totalPages ? (
                  <Link
                    href={`/shop?${activeCategorySlug !== 'all' ? `category=${activeCategorySlug}&` : ''}page=${currentPage + 1}`}
                    className="p-2 border border-border/60 rounded-2 hover:bg-subtle/50 text-secondary transition-colors"
                  >
                    <ChevronRight size={16} />
                  </Link>
                ) : (
                  <span className="p-2 border border-border/20 rounded-2 text-secondary/30 cursor-not-allowed">
                    <ChevronRight size={16} />
                  </span>
                )}
              </div>
            )}

          </main>

        </div>

      </div>
    </div>
  )
}
