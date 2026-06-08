'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, ArrowLeft, Check, AlertCircle, Sparkles, CreditCard, Truck, Clock } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { createRetailOrder } from '@/lib/actions/order.actions'
import { parseError, type FriendlyError } from '@/lib/utils/error-messages'
import FormErrorAlert from '@/components/shared/FormErrorAlert'

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore()
  const [mounted, setMounted] = useState(false)
  
  // Form states
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'QR'>('COD')
  
  // UI states
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<FriendlyError | null>(null)
  const [successOrder, setSuccessOrder] = useState<any>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="w-full min-h-screen bg-canvas flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (process.env.NEXT_PUBLIC_ENABLE_CART !== "true") {
    return (
      <div className="w-full min-h-screen bg-canvas py-20 font-bvp text-secondary flex items-center justify-center select-none">
        <div className="max-w-[650px] w-full mx-auto px-4 text-center">
          <div className="bg-white border border-border/40 rounded-3 shadow-md p-8 md:p-12 flex flex-col items-center gap-6 relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" style={{ backgroundColor: "var(--color-terracotta)" }} />
            <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center text-accent" style={{ color: "var(--color-terracotta)" }}>
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h1 className="font-playfair font-bold text-2xl md:text-3xl text-primary">Đặt hàng qua tư vấn</h1>
            <p className="text-xs md:text-sm text-secondary/70 leading-relaxed max-w-md mx-auto">
              Cốc Nối hiện nhận đơn hàng thông qua hình thức tư vấn để hỗ trợ chu đáo nhất. Vui lòng chọn sản phẩm trong cửa hàng và nhấn Đặt hàng để gửi yêu cầu.
            </p>
            <Link
              href="/cua-hang"
              style={{ backgroundColor: "var(--color-deep-indigo)" }}
              className="bg-primary hover:bg-opacity-90 text-canvas text-xs font-bold px-8 py-4 rounded-2 shadow-md uppercase tracking-wider transition-colors"
            >
              Vào cửa hàng
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Cart math
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const shippingFee = subtotal >= 1000000 ? 0 : 30000
  const totalAmount = subtotal + shippingFee
  const hasPreOrder = items.some((item) => item.isPreOrder)

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!customerName || !phone || !address) {
      setError({ category: "validation", message: "Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ nhận hàng.", showRetryButton: false, showReloadButton: false })
      return
    }

    if (items.length === 0) {
      setError({ category: "validation", message: "Giỏ hàng của bạn đang trống. Vui lòng quay lại cửa hàng để chọn sản phẩm.", showRetryButton: false, showReloadButton: false })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const formattedItems = items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))

      const result = await createRetailOrder({
        customerName,
        phone,
        email: email || undefined,
        address,
        note: note || undefined,
        paymentMethod,
        items: formattedItems
      })

      if (result.success && result.data) {
        setSuccessOrder(result.data)
        clearCart()
      } else {
        setError({ category: "unknown", message: result.error || 'Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại.', showRetryButton: true, showReloadButton: false })
      }
    } catch (err: any) {
      setError(parseError(err))
    } finally {
      setIsSubmitting(false)
    }
  }

  // Render Order Success screen
  if (successOrder) {
    const orderId = successOrder.id
    const orderDetails = JSON.parse(successOrder.shippingAddress)

    return (
      <div className="w-full min-h-screen bg-canvas py-12 md:py-20 font-bvp flex items-center justify-center select-none">
        <div className="max-w-[650px] w-full mx-auto px-4">
          <div className="bg-white border border-border/40 rounded-3 shadow-xl overflow-hidden p-8 md:p-12 text-center flex flex-col items-center gap-6 animate-fade-in relative">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-accent" />
            
            <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center text-success animate-bounce">
              <Check className="w-8 h-8" />
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-accent uppercase tracking-widest block font-mono">
                Đặt hàng thành công
              </span>
              <h1 className="font-playfair font-bold text-2xl md:text-3xl text-primary">
                Cảm ơn tấm chân tình của bạn!
              </h1>
              <p className="text-xs text-secondary/60 max-w-md mx-auto mt-1 leading-relaxed text-justify">
                Đơn hàng của bạn đã được tiếp nhận và chuyển đến các nghệ nhân xưởng gốm Bát Tràng đóng gói chuẩn bị giao vận.
              </p>
            </div>

            {/* Order Card */}
            <div className="w-full bg-subtle/20 border border-border/40 rounded-3 p-6 text-left flex flex-col gap-4 mt-2">
              <div className="flex justify-between items-center border-b border-border/40 pb-3">
                <span className="text-xs text-secondary/60 font-medium">Mã đơn hàng:</span>
                <span className="text-sm font-bold text-primary font-mono">{orderId}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-secondary/60 block mb-1">Khách hàng:</span>
                  <strong className="text-primary font-bold">{orderDetails.customerName}</strong>
                </div>
                <div>
                  <span className="text-secondary/60 block mb-1">Số điện thoại:</span>
                  <strong className="text-primary font-bold font-mono">{orderDetails.phone}</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-secondary/60 block mb-1">Địa chỉ giao nhận:</span>
                  <strong className="text-primary font-semibold">{orderDetails.address}</strong>
                </div>
                <div>
                  <span className="text-secondary/60 block mb-1">Phương thức:</span>
                  <strong className="text-accent font-bold">
                    {orderDetails.paymentMethod === 'COD' ? 'Thanh toán COD' : 'Chuyển khoản QR'}
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-secondary/60 block mb-1">Tổng thanh toán:</span>
                  <strong className="text-sm text-accent font-bold">
                    {successOrder.totalAmount.toLocaleString('vi-VN')} đ
                  </strong>
                </div>
              </div>

              {/* Inquiry Note */}
              {hasPreOrder && (
                <div className="bg-mustard/10 border border-mustard/20 rounded-2 p-3.5 flex items-start gap-2.5 text-[11px] text-mustard">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-mustard" />
                  <p className="leading-relaxed font-medium">
                    Đơn hàng có sản phẩm <strong>Đặt trước (Pre-order)</strong>. Xưởng sẽ tiến hành nung cốc và giao đến tay bạn sau 7-14 ngày. Chúng tôi sẽ gọi điện xác nhận cụ thể thời gian.
                  </p>
                </div>
              )}
            </div>

            {/* QR Transfer Info Display */}
            {orderDetails.paymentMethod === 'QR' && (
              <div className="w-full border border-accent/25 bg-accent/5 rounded-3 p-6 mt-2 flex flex-col items-center gap-5 text-left">
                <div className="flex items-center gap-2.5 border-b border-accent/20 pb-3 w-full justify-center">
                  <CreditCard className="w-5 h-5 text-accent" />
                  <h4 className="font-playfair font-bold text-sm text-primary">Thông Tin Chuyển Khoản Gốm</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full items-center">
                  {/* Bank detail card */}
                  <div className="flex flex-col gap-3 text-xs">
                    <div>
                      <span className="text-secondary/60 block">Ngân hàng thụ hưởng:</span>
                      <strong className="text-primary font-bold">MB Bank (Ngân hàng Quân Đội)</strong>
                    </div>
                    <div>
                      <span className="text-secondary/60 block">Số tài khoản:</span>
                      <strong className="text-primary font-bold font-mono text-sm">0979899999</strong>
                    </div>
                    <div>
                      <span className="text-secondary/60 block">Chủ tài khoản:</span>
                      <strong className="text-primary font-bold uppercase">NGUYEN VAN A</strong>
                    </div>
                    <div>
                      <span className="text-secondary/60 block">Nội dung chuyển khoản:</span>
                      <strong className="text-accent bg-accent/10 px-2 py-0.5 rounded font-mono font-bold text-[11px]">
                        COCNI {orderId.slice(-6).toUpperCase()}
                      </strong>
                    </div>
                  </div>

                  {/* QR Image Graphic Mockup */}
                  <div className="flex flex-col items-center justify-center p-3 bg-white border border-border/40 rounded-2 relative shadow-xs">
                    {/* SVG mockup of a beautiful QR code */}
                    <svg viewBox="0 0 100 100" className="w-32 h-32 text-primary">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="8" width="14" height="14" fill="white" />
                      <rect x="11" y="11" width="8" height="8" fill="currentColor" />

                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="78" y="8" width="14" height="14" fill="white" />
                      <rect x="81" y="11" width="8" height="8" fill="currentColor" />

                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="78" width="14" height="14" fill="white" />
                      <rect x="11" y="81" width="8" height="8" fill="currentColor" />

                      <path d="M35,5 h5 v5 h-5 z M45,5 h10 v5 h-10 z M60,5 h5 v10 h-5 z M35,15 h10 v5 h-10 z M55,15 h5 v5 h-5 z M65,15 h5 v5 h-5 z" fill="currentColor" />
                      <path d="M35,25 h5 v10 h-5 z M45,25 h5 v5 h-5 z M55,25 h15 v5 h-15 z M35,40 h15 v5 h-15 z M60,40 h5 v5 h-5 z M70,40 h5 v5 h-5 z" fill="currentColor" />
                      <path d="M5,35 h15 v5 h-15 z M25,35 h5 v5 h-5 z M5,45 h5 v10 h-5 z M15,45 h15 v5 h-15 z M5,60 h10 v5 h-10 z M20,60 h10 v5 h-10 z" fill="currentColor" />
                      <path d="M75,35 h5 v5 h-5 z M85,35 h10 v5 h-10 z M75,45 h15 v5 h-15 z M85,55 h10 v10 h-10 z M75,70 h5 v5 h-5 z M85,70 h5 v5 h-5 z" fill="currentColor" />
                      <path d="M35,50 h10 v5 h-10 z M50,50 h5 v10 h-5 z M60,50 h15 v5 h-15 z M35,60 h5 v5 h-5 z M45,65 h10 v5 h-10 z M60,65 h5 v10 h-5 z" fill="currentColor" />
                      <path d="M35,75 h5 v5 h-5 z M45,75 h15 v5 h-15 z M65,75 h5 v10 h-5 z M35,85 h10 v5 h-10 z M50,85 h10 v5 h-10 z M75,85 h15 v5 h-15 z" fill="currentColor" />
                      
                      {/* Logo center piece */}
                      <rect x="42" y="42" width="16" height="16" rx="3" fill="white" />
                      <circle cx="50" cy="50" r="5" fill="#C2703E" />
                    </svg>
                    <span className="text-[9px] text-secondary/60 font-bold uppercase mt-2.5 select-none tracking-wider">
                      MÃ VIETQR DỰ PHÒNG
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4 w-full mt-4 justify-center">
              <Link
                href="/cua-hang"
                className="bg-primary hover:bg-accent text-canvas text-xs font-bold px-8 py-4 rounded-2 transition-all cursor-pointer shadow-md uppercase tracking-wider"
              >
                Tiếp tục mua sắm
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-canvas py-12 md:py-20 font-bvp text-secondary select-none">
      <div className="max-w-[1200px] mx-auto px-4 md:px-8">
        
        {/* Navigation Breadcrumb back */}
        <Link 
          href="/cua-hang" 
          className="inline-flex items-center gap-2 text-xs font-bold text-secondary/60 hover:text-accent transition-colors mb-8 uppercase tracking-wider"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại cửa hàng</span>
        </Link>

        <h1 className="font-playfair font-bold text-3xl md:text-4xl text-primary leading-tight mb-8">
          Thanh Toán Đơn Hàng
        </h1>

        {items.length === 0 ? (
          <div className="bg-white border border-border/40 rounded-3 p-12 text-center flex flex-col items-center gap-5 shadow-xs">
            <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center text-accent">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h2 className="font-playfair font-bold text-lg text-primary">Giỏ hàng của bạn đang trống</h2>
              <p className="text-xs text-secondary/60 mt-1 max-w-xs mx-auto leading-relaxed text-justify">
                Hiện tại bạn chưa chọn bất kỳ sản phẩm cốc gốm mộc Bát Tràng nào.
              </p>
            </div>
            <Link
              href="/cua-hang"
              className="bg-accent hover:bg-accent-hover text-canvas text-xs font-bold px-8 py-3.5 rounded-2 shadow-md shadow-accent/10 transition-colors uppercase tracking-wider"
            >
              Chọn cốc ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: CUSTOMER FORM */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 bg-white border border-border/40 rounded-3 p-6 md:p-8 shadow-xs flex flex-col gap-6">
              
              <h2 className="font-playfair font-bold text-lg text-primary border-b border-border/40 pb-3 flex items-center gap-2">
                <Truck className="w-5 h-5 text-accent" />
                <span>1. Thông tin giao nhận gốm</span>
              </h2>

              {error && (
                <div className="mb-6">
                  <FormErrorAlert error={error} onRetry={handleSubmit} />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-secondary mb-1.5 block">Họ và tên người nhận *</label>
                  <input 
                    type="text" 
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/80 px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-xs font-bold text-secondary mb-1.5 block">Số điện thoại *</label>
                  <input 
                    type="tel" 
                    placeholder="Nhận cuộc gọi giao hàng"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border/80 px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-secondary mb-1.5 block">Email liên hệ (Không bắt buộc)</label>
                <input 
                  type="email" 
                  placeholder="Nhận biên nhận đơn hàng qua hộp thư"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/80 px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-secondary mb-1.5 block">Địa chỉ giao hàng đầy đủ *</label>
                <input 
                  type="text" 
                  placeholder="Số nhà, ngõ/ngách, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/80 px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-bold text-secondary mb-1.5 block">Lời nhắn gửi xưởng gốm (Không bắt buộc)</label>
                <textarea 
                  placeholder="Ghi chú thêm về thời gian nhận, viết thư tay tặng quà hoặc chỉ dẫn giao gốm..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full text-xs bg-canvas border border-border/80 px-4 py-3 rounded-2 text-primary focus:outline-none focus:border-accent h-24 resize-none"
                />
              </div>

              <h2 className="font-playfair font-bold text-lg text-primary border-b border-border/40 pb-3 flex items-center gap-2 mt-4">
                <CreditCard className="w-5 h-5 text-accent" />
                <span>2. Phương thức thanh toán</span>
              </h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Option 1: COD */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('COD')}
                  className={`p-4 border rounded-2 flex flex-col gap-2 text-left cursor-pointer transition-all ${
                    paymentMethod === 'COD'
                      ? 'border-accent bg-accent/5 ring-2 ring-accent/10'
                      : 'border-border/60 hover:border-border bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-primary">Thanh Toán COD</span>
                  <span className="text-[10px] text-secondary/60 font-medium leading-relaxed text-justify">
                    Nhận hàng, kiểm tra gốm Bát Tràng trọn vẹn rồi mới thanh toán.
                  </span>
                </button>

                {/* Option 2: QR */}
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QR')}
                  className={`p-4 border rounded-2 flex flex-col gap-2 text-left cursor-pointer transition-all ${
                    paymentMethod === 'QR'
                      ? 'border-accent bg-accent/5 ring-2 ring-accent/10'
                      : 'border-border/60 hover:border-border bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-primary">Chuyển khoản QR</span>
                  <span className="text-[10px] text-secondary/60 font-medium leading-relaxed text-justify">
                    Quét mã QR ngân hàng cực tiện. Xưởng xác nhận tức thì.
                  </span>
                </button>
              </div>

              {/* QR Static placeholder info block */}
              {paymentMethod === 'QR' && (
                <div className="bg-accent/5 border border-accent/20 rounded-2 p-5 flex flex-col md:flex-row items-center gap-6 animate-fade-in">
                  <div className="flex-1 flex flex-col gap-2.5 text-xs">
                    <h4 className="font-bold text-primary">MB Bank - 0979899999</h4>
                    <p className="text-[10px] text-secondary/60 font-medium leading-relaxed text-justify">
                      Bạn có thể hoàn tất quét chuyển khoản ngay sau khi bấm xác nhận đặt hàng. Mã QR chuyển khoản chính thức và chi tiết tài khoản sẽ hiện ở trang hoàn tất tiếp theo!
                    </p>
                  </div>
                  {/* Minimized mock QR SVG */}
                  <div className="w-20 h-20 bg-white border border-border/40 rounded-2 p-1.5 flex items-center justify-center shrink-0">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-primary">
                      <rect width="100" height="100" fill="white" />
                      <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="8" width="14" height="14" fill="white" />
                      <rect x="11" y="11" width="8" height="8" fill="currentColor" />
                      
                      <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                      <rect x="78" y="8" width="14" height="14" fill="white" />
                      <rect x="81" y="11" width="8" height="8" fill="currentColor" />
                      
                      <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                      <rect x="8" y="78" width="14" height="14" fill="white" />
                      <rect x="11" y="81" width="8" height="8" fill="currentColor" />
                      
                      <path d="M30,30 h10 v10 h-10 z M50,30 h10 v5 h-10 z M30,50 h15 v5 h-15 z M55,50 h15 v10 h-15 z M75,30 h10 v30 h-10 z M30,70 h30 v5 h-30 z M70,70 h15 v10 h-15 z" fill="currentColor" />
                    </svg>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-accent disabled:bg-primary/60 text-canvas font-bold text-xs py-4 rounded-2 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider mt-4"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4.5 h-4.5 border-2 border-canvas border-t-transparent rounded-full animate-spin"></span>
                    <span>Đang xử lý đơn hàng...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4.5 h-4.5 text-accent" />
                    <span>Xác nhận đặt hàng lẻ</span>
                  </>
                )}
              </button>

            </form>

            {/* RIGHT COLUMN: CART SUMMARY */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-white border border-border/40 rounded-3 p-6 shadow-xs flex flex-col gap-5">
                <h3 className="font-playfair font-bold text-base text-primary border-b border-border/40 pb-3 uppercase tracking-wider">
                  Đơn hàng của bạn ({items.reduce((acc, item) => acc + item.quantity, 0)})
                </h3>

                {/* Products list */}
                <div className="flex flex-col gap-4 max-h-[350px] overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {/* Product image */}
                      <div className="w-14 h-14 bg-white border border-border/40 rounded-2 overflow-hidden shrink-0 relative">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Product details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-playfair font-bold text-xs text-primary line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="text-[10px] text-secondary/60 font-bold font-mono">
                            Cốc lẻ x{item.quantity}
                          </span>
                        </div>

                        {/* Variant swatches */}
                        {(item.colorName || item.sizeName) && (
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            {item.colorName && (
                              <span className="text-[9px] bg-accent/5 text-accent px-1.5 py-0.2 rounded font-bold">
                                Màu: {item.colorName}
                              </span>
                            )}
                            {item.sizeName && (
                              <span className="text-[9px] bg-subtle text-secondary px-1.5 py-0.2 rounded font-bold">
                                Cỡ: {item.sizeName}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Product Subtotal */}
                      <span className="text-xs font-bold text-primary self-center">
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  ))}
                </div>

                {/* Subtotals & Math */}
                <div className="border-t border-border/40 pt-4 flex flex-col gap-3 text-xs">
                  
                  {/* Temporary total */}
                  <div className="flex justify-between items-center text-secondary/60 font-medium">
                    <span>Cộng tạm tính</span>
                    <strong className="text-primary font-bold">
                      {subtotal.toLocaleString('vi-VN')} đ
                    </strong>
                  </div>

                  {/* Delivery price */}
                  <div className="flex justify-between items-center text-secondary/60 font-medium">
                    <span>Phí vận chuyển toàn quốc</span>
                    {shippingFee === 0 ? (
                      <span className="text-success font-bold bg-success/15 px-2 py-0.5 rounded text-[10px] uppercase font-mono">
                        Miễn phí
                      </span>
                    ) : (
                      <strong className="text-primary font-bold font-mono">
                        {shippingFee.toLocaleString('vi-VN')} đ
                      </strong>
                    )}
                  </div>

                  {/* Pre-order marker info */}
                  {hasPreOrder && (
                    <div className="bg-mustard/10 border border-mustard/20 rounded-2 p-3 flex items-start gap-2.5 text-[10px] text-mustard mt-1.5">
                      <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5 text-mustard" />
                      <p className="leading-relaxed font-medium">
                        Đơn có sản phẩm <strong>Pre-order (Đợi nung)</strong>. Cả đơn hàng sẽ cùng xuất xưởng sau 7-14 ngày.
                      </p>
                    </div>
                  )}

                  {/* Net sum total amount */}
                  <div className="flex justify-between items-baseline border-t border-border/40 pt-4 mt-1.5">
                    <span className="text-xs font-bold text-secondary/60 uppercase tracking-wider">Tổng cộng</span>
                    <span className="text-xl font-bold text-accent font-mono">
                      {totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>

                </div>
              </div>

              {/* Guarantees and info card */}
              <div className="bg-white border border-border/40 rounded-3 p-5 shadow-xs text-xs text-secondary flex flex-col gap-3">
                <h4 className="font-playfair font-bold text-primary border-b border-border/40 pb-2">
                  Cam kết tinh tế từ Cốc Nối
                </h4>
                <div className="flex gap-2">
                  <span className="text-accent font-bold">1.</span>
                  <p className="leading-relaxed text-secondary/80">
                    Mỗi chiếc cốc gốm đều được nung khử tiêu chuẩn trên 1250°C tại xưởng, an toàn hoàn hảo khi tiếp xúc đồ uống nóng hoặc lạnh.
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className="text-accent font-bold">2.</span>
                  <p className="leading-relaxed text-secondary/80">
                    Sản phẩm được gói chống va đập chuyên dụng 4 lớp. Xưởng nhận bảo hành và đền bù 100% không mất phí nếu cốc bị bể vỡ trong quá trình vận chuyển.
                  </p>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  )
}
