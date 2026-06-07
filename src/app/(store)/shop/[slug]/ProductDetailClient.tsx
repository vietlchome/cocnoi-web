'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { 
  Star, ShoppingBag, Check, AlertCircle, Send, 
  ChevronDown, ChevronUp, Clock, ShieldCheck, Heart, ArrowRight, X
} from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import ReviewList from "@/components/store/ReviewList"
import PaymentInstructionsBlock from '@/components/store/PaymentInstructionsBlock'
import FormErrorAlert from '@/components/shared/FormErrorAlert'
import { parseError, type FriendlyError } from '@/lib/utils/error-messages'

interface SiblingProduct {
  id: string
  name: string
  slug: string
  colorName?: string | null
  colorHex?: string | null
  size?: string | null
}

interface Product {
  id: string
  sku?: string | null
  name: string
  slug: string
  shortDescription?: string | null
  description: string
  price: number
  compareAtPrice?: number | null
  stockQuantity: number
  weight?: number | null
  images: string // JSON string array
  isActive: boolean
  categoryId: string | null
  category: {
    name: string
    slug: string
  } | null
  productGroupId?: string | null
  colorName?: string | null
  colorHex?: string | null
  size?: string | null
}

interface ProductDetailClientProps {
  product: Product
  siblings: SiblingProduct[]
  ratingData?: { average: number; count: number }
  paymentInfo: {
    showQr: boolean;
    qrImage: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferNote: string;
    codAvailable: boolean;
    codNote: string;
  };
}

export default function ProductDetailClient({ product, siblings = [], ratingData, paymentInfo }: ProductDetailClientProps) {
  // Safely assign images
  let imgUrls: string[] = Array.isArray(product.images) ? product.images : []

  // Fallback to placeholder if no images
  if (imgUrls.length === 0) {
    imgUrls = ['https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80']
  }

  const [activeImgIndex, setActiveImgIndex] = useState(0)
  const [showInquiryModal, setShowInquiryModal] = useState(false)
  const [qty, setQty] = useState(1)
  
  // Accordion Tab States
  const [storyOpen, setStoryOpen] = useState(true)
  const [careOpen, setCareOpen] = useState(false)
  const [shippingOpen, setShippingOpen] = useState(false)

  // Form states for booking
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cod'>('bank_transfer')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState<FriendlyError | null>(null)
  const [inquiryMode, setInquiryMode] = useState<'b2c_retail' | 'b2b_consultation'>('b2c_retail')

  const router = useRouter()
  const { addItem } = useCartStore()

  const handleAddToCart = () => {
    addItem(product, qty)
  }

  const handleBuyNow = () => {
    addItem(product, qty)
    router.push('/checkout')
  }

  // 2. Tính toán tĩnh trực tiếp trên sản phẩm hiện tại
  const displayPrice = product.price
  const displayStock = product.stockQuantity
  const isOutOfStock = displayStock === 0

  const handleInquirySubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!customerName || !phone) {
      setSubmitError({
        category: "validation",
        message: "Vui lòng nhập Họ tên và Số điện thoại liên hệ.",
        showRetryButton: false,
        showReloadButton: false
      })
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    // Ghép thông tin màu vào ghi chú để lưu lại chuẩn xác
    const colorNote = product.colorName 
      ? `[Màu đã chọn: ${product.colorName}] ${note}`.trim()
      : note

    let fullNote = ''
    if (inquiryMode === 'b2b_consultation') {
      fullNote = `[B2B Inquiry] ${colorNote}`.trim()
    } else {
      const methodLabel = paymentMethod === "bank_transfer" ? "Chuyển khoản trước" : "COD"
      fullNote = `Phương thức: ${methodLabel}${colorNote ? ` | ${colorNote}` : ''}`
    }

    try {
      const response = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          customerName,
          phone,
          email: email || undefined,
          address: address || undefined,
          quantity,
          note: fullNote || undefined,
          source: inquiryMode === 'b2b_consultation' ? 'B2B Custom Inquiry from Product Detail' : undefined,
          inquiryType: inquiryMode === 'b2b_consultation' ? 'WHOLESALE_B2B' : 'RETAIL_B2C',
        }),
      })

      if (response.ok) {
        setSubmitSuccess(true)
      } else {
        const errData = await response.json()
        setSubmitError({
          category: "unknown",
          message: errData.error || "Gặp lỗi khi gửi yêu cầu tư vấn. Vui lòng thử lại.",
          showRetryButton: true,
          showReloadButton: false
        })
      }
    } catch (err) {
      setSubmitError(parseError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDraftCapture = async () => {
    if (!customerName.trim() || !phone.trim() || phone.trim().length < 9) return
    try {
      await fetch('/api/inquiry/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: customerName.trim(),
          phone: phone.trim(),
          email: email || null,
          companyName: inquiryMode === 'b2b_consultation' ? 'B2B Lead (Nháp)' : null,
          inquiryType: inquiryMode === 'b2b_consultation' ? 'WHOLESALE_B2B' : 'RETAIL_B2C',
        })
      })
    } catch (err) {
      console.error('Lỗi lưu nháp B2B lead:', err)
    }
  }

  const openInquiry = (mode: 'b2c_retail' | 'b2b_consultation') => {
    setInquiryMode(mode)
    setCustomerName('')
    setPhone('')
    setEmail('')
    setAddress('')
    setQuantity(mode === 'b2b_consultation' ? 50 : qty) // Seed inquiry quantity from selected qty or default to 50 for B2B
    setNote('')
    setPaymentMethod('bank_transfer')
    setSubmitSuccess(false)
    setSubmitError(null)
    setShowInquiryModal(true)
  }

  return (
    <div className="w-full bg-canvas py-12 md:py-20 font-bvp select-none">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* BREADCRUMB */}
        <nav className="flex items-center flex-wrap gap-2 text-xs text-secondary/60 mb-8 md:mb-12 font-medium tracking-wide">
          <Link href="/shop" className="hover:text-accent transition-colors">Cửa hàng</Link>
          <span className="opacity-50">/</span>
          {product.category && (
            <>
              <Link 
                href={`/shop?category=${product.category.slug}`} 
                className="hover:text-accent transition-colors"
              >
                {product.category.name}
              </Link>
              <span className="opacity-50">/</span>
            </>
          )}
          <span className="text-primary font-bold truncate max-w-[200px] md:max-w-none">{product.name}</span>
        </nav>
 
        {/* 2-COLUMN GRID SPLIT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
          
          {/* LEFT COLUMN: GALLERY */}
          <div className="lg:col-span-7 flex flex-col gap-5">
            {/* Active Preview Frame Frame ratios in 1:1 */}
            <div className="relative aspect-square w-full bg-white border border-border/40 rounded-3 overflow-hidden shadow-xs group">
              <Image 
                src={imgUrls[activeImgIndex]} 
                alt={product.name} 
                fill
                sizes="(max-width: 1024px) 100vw, 700px"
                priority
                className="object-cover select-none rounded-3"
              />
            </div>
 
            {/* Thumbnails Row */}
            {imgUrls.length > 1 && (
              <div className="flex flex-wrap gap-3">
                {imgUrls.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImgIndex(idx)}
                    onMouseEnter={() => setActiveImgIndex(idx)}
                    className={`aspect-square w-16 sm:w-20 rounded-2 border overflow-hidden bg-white transition-all relative ${
                      activeImgIndex === idx
                        ? 'border-accent ring-2 ring-accent/15 scale-[1.02]'
                        : 'border-border/60 hover:border-border opacity-80 hover:opacity-100'
                    }`}
                  >
                    <Image 
                      src={url} 
                      alt={`Thumbnail ${idx + 1}`} 
                      fill
                      sizes="(max-width: 640px) 64px, 80px"
                      className="object-cover" 
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
 
          {/* RIGHT COLUMN: SPECS & BUYING */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div>
              {/* Category */}
              <span className="font-bvp font-bold text-[10px] tracking-widest text-accent uppercase block mb-2">
                {product.category?.name || 'Cốc gốm mộc'}
              </span>
              
              {/* Product Title */}
              <h1 className="font-playfair font-bold text-3xl md:text-4xl text-primary leading-tight mb-2">
                {product.name}
              </h1>
 
              {/* SKU & Khối lượng */}
              {(product.sku || (product.weight && product.weight > 0)) && (
                <div className="flex flex-wrap items-center gap-4 mb-2.5 text-[10px] text-secondary/60 font-bold uppercase tracking-wider font-mono">
                  {product.sku && (
                    <span>Mã SP (SKU): <strong className="text-secondary font-semibold">{product.sku}</strong></span>
                  )}
                  {product.sku && product.weight && product.weight > 0 && <span className="opacity-30">|</span>}
                  {product.weight && product.weight > 0 && (
                    <span>Khối lượng: <strong className="text-secondary font-semibold">{product.weight}g</strong></span>
                  )}
                </div>
              )}
 
              {/* Stars block */}
              <div className="flex items-center gap-1.5 py-1">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star} 
                      className={`w-4 h-4 text-amber-400 ${
                        ratingData && ratingData.average >= star 
                          ? 'fill-amber-400' 
                          : ratingData && ratingData.average >= star - 0.5 
                            ? 'fill-amber-400/50' 
                            : 'fill-amber-400/10'
                      }`} 
                    />
                  ))}
                </div>
                <span className="text-xs text-secondary/60 ml-1 font-medium">
                  ({ratingData?.count || 0} đánh giá gốm)
                </span>
              </div>
 
              {/* Trích dẫn ngắn */}
              {product.shortDescription && (
                <p className="mt-4 text-xs text-secondary leading-relaxed italic border-l-2 border-accent/40 pl-3.5 bg-accent/5 py-1.5 rounded-r-2">
                  "{product.shortDescription}"
                </p>
              )}
            </div>
 
            {/* Dynamic Price display */}
            <div className="border border-border/40 py-4 flex flex-col gap-1.5 bg-white/40 px-4 rounded-3">
              <div className="flex items-baseline gap-2.5 flex-wrap">
                <span className="text-2xl font-bold text-accent font-bvp">
                  {displayPrice.toLocaleString('vi-VN')} đ
                </span>
                {product.compareAtPrice && product.compareAtPrice > displayPrice && (
                  <span className="text-sm text-secondary/40 line-through font-bold">
                    {product.compareAtPrice.toLocaleString('vi-VN')} đ
                  </span>
                )}
                <span className="text-xs text-secondary/40 font-medium ml-1">/ sản phẩm</span>
              </div>
              <span className="text-xs text-secondary/60 font-medium">
                Tồn kho khả dụng: <strong className={isOutOfStock ? 'text-rose-500 font-bold' : 'text-secondary font-bold'}>{displayStock} chiếc</strong>
              </span>
            </div>
 
            {/* BIẾN THỂ MÀU SẮC (Flat Catalog Swatches) */}
            {siblings.length > 1 && (
              <div className="flex flex-col gap-2.5">
                <span className="text-xs font-bold text-secondary">
                  Màu sắc: <strong className="text-primary">{product.colorName || 'Mặc định'}</strong>
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {siblings.map((sib) => {
                    const isSelected = sib.id === product.id
                    
                    return (
                      <Link
                        key={sib.id}
                        href={`/shop/${sib.slug}`}
                        className={`text-xs font-bold px-4 py-2 rounded-2 border transition-all flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? 'bg-accent text-canvas border-accent shadow-sm shadow-accent/10'
                            : 'bg-white text-secondary border-border/60 hover:border-border hover:bg-subtle/20'
                        }`}
                      >
                        {sib.colorHex && (
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-border/40" 
                            style={{ backgroundColor: sib.colorHex }} 
                          />
                        )}
                        <span>{sib.colorName}</span>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Product description detail (HTML rendered safely) */}
            <div 
              className="text-sm text-secondary leading-relaxed font-normal prose prose-sm max-w-none border-b border-border/40 pb-6"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />

            {/* Primary Action Buttons */}
            <div className="flex flex-col gap-4 border-t border-border/40 pt-6">
              
              {process.env.NEXT_PUBLIC_ENABLE_CART === "true" ? (
                <>
                  {/* Quantity Selector & Add To Cart */}
                  <div className="flex items-center gap-3">
                    
                    {/* Quantity Control */}
                    <div className="flex items-center border border-border/60 bg-white rounded-2 h-12">
                      <button
                        onClick={() => setQty(Math.max(1, qty - 1))}
                        className="px-3.5 hover:text-accent transition-colors text-secondary/40 h-full flex items-center justify-center font-bold text-base cursor-pointer"
                      >
                        -
                      </button>
                      <span className="px-2 font-bold text-sm text-primary min-w-8 text-center select-none font-mono">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(qty + 1)}
                        className="px-3.5 hover:text-accent transition-colors text-secondary/40 h-full flex items-center justify-center font-bold text-base cursor-pointer"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                      onClick={handleAddToCart}
                      className="flex-grow h-12 border border-accent hover:bg-accent/5 text-accent font-bold text-xs rounded-2 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider font-bvp"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Thêm vào giỏ</span>
                    </button>
                  </div>

                  {/* Buy Now / Pre-order Main Action */}
                  <button
                    onClick={handleBuyNow}
                    className={`w-full h-14 font-bold text-sm rounded-2 transition-all flex flex-col items-center justify-center gap-0.5 shadow-sm cursor-pointer uppercase tracking-wider ${
                      isOutOfStock
                        ? 'bg-mustard hover:bg-mustard/95 text-canvas shadow-sm shadow-mustard/10'
                        : 'bg-accent hover:bg-accent-hover text-canvas shadow-sm shadow-accent/10'
                    }`}
                  >
                    {isOutOfStock ? (
                      <>
                        <span>ĐẶT HÀNG TRƯỚC (PRE-ORDER)</span>
                        <span className="text-[10px] font-normal opacity-85 lowercase italic tracking-normal">Chờ nung hoàn thiện từ 7-14 ngày</span>
                      </>
                    ) : (
                      <span>MUA NGAY (GIAO NHANH)</span>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => openInquiry('b2c_retail')}
                  className="w-full h-14 bg-accent hover:bg-accent-hover text-canvas font-bold text-sm rounded-2 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider shadow-sm"
                  style={{ backgroundColor: "var(--color-terracotta)" }}
                >
                  <Send className="w-4 h-4" />
                  <span>Đặt đôi này</span>
                </button>
              )}

              {/* B2B / Custom Inquiry Button */}
              <button
                onClick={() => openInquiry('b2b_consultation')}
                className="w-full py-4 border border-border/80 hover:border-accent hover:text-accent bg-transparent hover:bg-subtle/10 text-secondary font-bold text-xs rounded-2 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
              >
                <span>Tư vấn đặt hàng số lượng lớn / Đặt riêng B2B</span>
              </button>

              {/* Customer Promises */}
              <div className="flex flex-col gap-2.5 p-4 bg-white border border-border/40 rounded-2 text-xs text-secondary/80 mt-1">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent shrink-0" />
                  <span>Nghệ nhân Bát Tràng hỗ trợ liên hệ tư vấn trong 2 giờ</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-accent shrink-0" />
                  <span>Bao vỡ bể 100% khi giao vận. Lỗi 1 đổi 1 ngay lập tức miễn phí</span>
                </div>
              </div>

            </div>

            {/* ACCORDION COLLAPSIBLE TABS */}
            <div className="flex flex-col border-t border-border/40">
              
              {/* Tab 1: Craftsmanship Story */}
              <div className="border-b border-border/40">
                <button
                  onClick={() => setStoryOpen(!storyOpen)}
                  className="w-full py-4 flex justify-between items-center text-left text-primary font-bold text-sm"
                >
                  <span>Chuyện Gốm Cốc Nối</span>
                  {storyOpen ? <ChevronUp className="w-4 h-4 text-accent" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {storyOpen && (
                  <div className="pb-5 text-xs text-secondary/80 leading-relaxed flex flex-col gap-2.5 animate-fade-in font-normal">
                    <p>
                      Mỗi tác phẩm <strong>Cốc Nối</strong> được sinh ra từ xưởng nhỏ của chúng tôi tại trung tâm làng cổ Bát Tràng hơn 700 năm tuổi. Đất sét cao lanh tinh khiết được lọc qua hệ thống bể lắng 4 cấp lọc kỹ tạp chất, đảm bảo độ đanh dai tự nhiên của gốm sau nung.
                    </p>
                    <p>
                      Sản phẩm được tạo hình hoàn toàn thủ công trên bàn xoay truyền thống bởi đôi bàn tay khéo léo của người thợ gốm. Nét mộc mạc ẩn hiện dưới lớp men tro trấu tự nhiên được điều phối theo công thức tổ truyền lâu năm. Cốc được nung ở mẻ lò khử đỏ tiêu chuẩn nhiệt cao trên 1250°C, mang lại sự đanh chắc, an toàn tuyệt đối cho sức khỏe của bạn.
                    </p>
                  </div>
                )}
              </div>

              {/* Tab 2: Care Guide */}
              <div className="border-b border-border/40">
                <button
                  onClick={() => setCareOpen(!careOpen)}
                  className="w-full py-4 flex justify-between items-center text-left text-primary font-bold text-sm"
                >
                  <span>Hướng Dẫn Sử Dụng & Bảo Quản</span>
                  {careOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {careOpen && (
                  <div className="pb-5 text-xs text-secondary/80 leading-relaxed flex flex-col gap-2 animate-fade-in font-normal">
                    <p>
                      • <strong>Lò vi sóng & Máy rửa bát:</strong> An toàn tuyệt đối. Chất gốm nung nhiệt cực cao chịu được các tác nhân sóng cực ngắn và luồng nước áp suất máy rửa chén mà không sợ phai men hay nứt rạn.
                    </p>
                    <p>
                      • <strong>Sốc nhiệt:</strong> Tránh thay đổi nhiệt độ đột ngột (ví dụ không đổ trực tiếp nước sôi 100°C vào cốc vừa lấy từ ngăn đông tủ lạnh) để bảo vệ tối đa độ bền của da men tro.
                    </p>
                  </div>
                )}
              </div>

              {/* Tab 3: Shipping & Delivery Policy */}
              <div className="border-b border-border/40">
                <button
                  onClick={() => setShippingOpen(!shippingOpen)}
                  className="w-full py-4 flex justify-between items-center text-left text-primary font-bold text-sm"
                >
                  <span>Chính Sách Vận Chuyển & Đóng Gói</span>
                  {shippingOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                {shippingOpen && (
                  <div className="pb-5 text-xs text-secondary/80 leading-relaxed flex flex-col gap-2.5 animate-fade-in font-normal">
                    <p>
                      • <strong>Bao vỡ bể 100%:</strong> Gốm sứ là hàng dễ vỡ, nhưng Cốc Nối cam kết chịu toàn bộ rủi ro khi vận chuyển. Nếu nhận hàng bị nứt, vỡ, mẻ, vui lòng chụp ảnh/quay video gửi xưởng để được gửi bù sản phẩm mới hoàn toàn miễn phí ngay lập tức.
                    </p>
                    <p>
                      • <strong>Thời gian giao hàng:</strong> 1-3 ngày làm việc đối với khu vực Hà Nội và các tỉnh lân cận; 3-5 ngày làm việc đối với khu vực miền Trung và miền Nam.
                    </p>
                    <p>
                      • <strong>Phí vận chuyển:</strong> Đồng giá 30.000 đ toàn quốc. Miễn phí vận chuyển cho đơn hàng lẻ từ 1.000.000 đ trở lên.
                    </p>
                  </div>
                )}
              </div>

            </div>

          </div>

        </div>

        {/* REVIEWS & VERIFICATION SECTION */}
        <div className="border-t border-border/60 mt-16 pt-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="border border-border/80 rounded-4 p-6 md:p-8 bg-[#FAF8F5]/40 shadow-sm text-center">
              <h3 className="font-playfair text-xl md:text-2xl font-bold text-primary mb-3">
                Chia sẻ cảm nhận
              </h3>
              <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mb-6">
                Chỉ những khách hàng đã từng mua lẻ và nhận hàng thành công mới có thể gửi đánh giá cho sản phẩm này.
              </p>
              <Link
                href="/don-hang"
                className="inline-flex items-center justify-center gap-2 bg-primary text-canvas hover:bg-[#0E1220] font-bvp font-bold text-xs md:text-sm px-6 py-3.5 rounded-2 transition-all uppercase tracking-wider mx-auto"
              >
                Tra cứu & Đánh giá ngay
                <ArrowRight className="w-4 h-4 text-accent" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-7">
            <ReviewList productId={product.id} />
          </div>
        </div>

      </div>

      {/* INQUIRY DIALOG MODAL */}
      {showInquiryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-canvas border border-border/40 rounded-4 w-full max-w-md max-h-[85vh] flex flex-col overflow-hidden shadow-2xl animate-slide-up">
            
            {/* Sticky Header */}
            <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between shrink-0">
              <div>
                <h3 className="font-playfair font-bold text-base text-primary">
                  {inquiryMode === 'b2b_consultation' ? 'Tư vấn đặt hàng số lượng lớn' : 'Tư Vấn & Đặt Mua Gốm'}
                </h3>
                <p className="text-[11px] text-secondary">
                  {inquiryMode === 'b2b_consultation' ? 'Sales B2B liên hệ trong 24h' : 'Hỗ trợ chu đáo từ nghệ nhân Bát Tràng'}
                </p>
              </div>
              <button 
                onClick={() => setShowInquiryModal(false)}
                className="text-secondary/40 hover:text-primary font-bold text-sm bg-canvas border border-border/40 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submitSuccess ? (
              <>
                {/* Scrollable Middle (Success) */}
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  {/* Success indicator inline */}
                  <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <Check className="w-5 h-5 shrink-0" />
                    <span className="font-playfair font-bold text-base text-primary">Đã nhận thông tin</span>
                  </div>
                  
                  {inquiryMode === 'b2b_consultation' ? (
                    <p className="font-bvp text-sm text-secondary mb-1">
                      Đã nhận yêu cầu B2B. Sales liên hệ trong 24h tư vấn báo giá + phương thức thanh toán phù hợp.
                    </p>
                  ) : (
                    <p className="font-bvp text-sm text-secondary mb-1">
                      Cốc Nối liên hệ xác nhận đơn trong 2 giờ.
                    </p>
                  )}
                  <p className="font-bvp text-xs text-secondary/80 mb-4 font-normal text-left">
                    Sản phẩm: <span className="font-semibold text-primary">{product.name}</span> {product.colorName && `(${product.colorName})`}
                  </p>

                  {/* Payment block compact */}
                  {inquiryMode !== 'b2b_consultation' && process.env.NEXT_PUBLIC_ENABLE_CART !== "true" && paymentInfo && (
                    <PaymentInstructionsBlock paymentInfo={paymentInfo} selectedMethod={paymentMethod} />
                  )}
                </div>

                {/* Sticky Footer (Success) */}
                <div className="px-5 py-3 border-t border-border/60 shrink-0">
                  <button 
                    onClick={() => setShowInquiryModal(false)} 
                    className="w-full px-6 py-2.5 rounded-3 bg-primary text-canvas font-semibold text-sm hover:bg-accent transition-colors cursor-pointer uppercase tracking-wider"
                  >
                    Đóng cửa sổ
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleInquirySubmit} id="inquiry-form" className="flex-grow flex flex-col overflow-hidden">
                {/* Scrollable Middle (Form) */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
                  
                  {/* Selected product tag */}
                  <div className="flex items-center gap-4 bg-subtle/20 border border-border/40 p-3 rounded-2">
                    <div className="w-12 h-12 rounded-2 bg-white border border-border/40 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={imgUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-grow text-left">
                      <span className="text-[9px] text-secondary/60 uppercase tracking-wider block">Yêu cầu sản phẩm</span>
                      <h4 className="font-playfair font-bold text-sm text-primary leading-tight">{product.name}</h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs font-bold text-accent">
                          {displayPrice.toLocaleString('vi-VN')} đ / cốc
                        </span>
                        {product.colorName && (
                          <span className="text-[9px] bg-accent/10 text-accent px-1.5 py-0.5 rounded font-bold">
                            Màu: {product.colorName}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {submitError && (
                    <FormErrorAlert error={submitError} onRetry={handleInquirySubmit} />
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-left">
                      <label className="text-xs font-bold text-secondary mb-1.5 block">Họ và tên *</label>
                      <input 
                        type="text" 
                        placeholder="Ví dụ: Nguyễn Văn A"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        onBlur={handleDraftCapture}
                        className="w-full text-xs bg-canvas border border-border/80 px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                    <div className="text-left">
                      <label className="text-xs font-bold text-secondary mb-1.5 block">Số điện thoại *</label>
                      <input 
                        type="tel" 
                        placeholder="Nhận cuộc gọi tư vấn"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        onBlur={handleDraftCapture}
                        className="w-full text-xs bg-canvas border border-border/80 px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="text-xs font-bold text-secondary mb-1.5 block">Email liên hệ (Không bắt buộc)</label>
                    <input 
                      type="email" 
                      placeholder="Để nhận thông tin đặt gốm"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs bg-canvas border border-border/80 px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-12 gap-4 items-end">
                    <div className="col-span-8 text-left">
                      <label className="text-xs font-bold text-secondary mb-1.5 block">Địa chỉ nhận hàng (Không bắt buộc)</label>
                      <input 
                        type="text" 
                        placeholder="Xác định phí giao hàng"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full text-xs bg-canvas border border-border/80 px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                      />
                    </div>
                    <div className="col-span-4 text-left">
                      <label className="text-xs font-bold text-secondary mb-1.5 block">Số lượng *</label>
                      <input 
                        type="number" 
                        min="1"
                        placeholder={inquiryMode === 'b2b_consultation' ? 'Số lượng dự kiến (≥10 đôi)' : undefined}
                        value={quantity || ''}
                        onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : 0)}
                        className="w-full text-xs bg-canvas border border-border/80 px-3.5 py-2.5 rounded-2 text-primary font-bold focus:outline-none focus:border-accent"
                        required
                      />
                    </div>
                  </div>

                  {/* Realtime price estimation */}
                  <div className="text-right text-xs text-secondary/60 font-medium">
                    Giá trị dự kiến: <strong className="text-primary font-bold">{(displayPrice * quantity).toLocaleString('vi-VN')} đ</strong>
                  </div>

                  {inquiryMode !== 'b2b_consultation' && (
                    <div className="flex flex-col gap-3 text-left">
                      <label className="text-xs font-bold text-secondary">Phương thức thanh toán <span className="text-rose-500">*</span></label>
                      <div className="flex flex-col gap-2">
                        <label className="flex items-start gap-3 p-3 border border-border rounded-3 cursor-pointer hover:bg-subtle/30 transition-colors">
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
                        <label className="flex items-start gap-3 p-3 border border-border rounded-3 cursor-pointer hover:bg-subtle/30 transition-colors">
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
                  )}

                  <div className="text-left">
                    <label className="text-xs font-bold text-secondary mb-1.5 block">Lời nhắn gửi xưởng</label>
                    <textarea 
                      placeholder={inquiryMode === 'b2b_consultation' 
                        ? "Nhu cầu chi tiết: số lượng, in logo, packaging custom, deadline, ngân sách..."
                        : "Ghi chú đóng gói quà tặng, lời chúc thư tay hoặc màu men yêu cầu..."}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="w-full text-xs bg-canvas border border-border/80 px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent h-16 resize-none"
                    />
                  </div>

                </div>

                {/* Sticky Footer (Form) */}
                <div className="px-5 py-3 border-t border-border/60 shrink-0 flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowInquiryModal(false)}
                    className="text-xs font-bold px-4.5 py-2.5 border border-border/60 rounded-2 text-secondary hover:text-accent hover:bg-subtle/20 transition-colors cursor-pointer"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-canvas font-bold text-xs px-6 py-2.5 rounded-2 transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin"></span>
                        <span>Đang gửi...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Gửi yêu cầu ngay</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  )
}
