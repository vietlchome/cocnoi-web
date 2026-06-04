'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, Trash2, Plus, Minus, ShoppingBag, Clock, ArrowRight } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity } = useCartStore()
  const [mounted, setMounted] = useState(false)

  // Ensure client-side only rendering to avoid hydration mismatch with localStorage persistence
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isOpen) return null

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0)
  const hasPreOrder = items.some((item) => item.isPreOrder)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-bvp select-none">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-primary/45 backdrop-blur-xs transition-opacity duration-500"
        onClick={() => setIsOpen(false)}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-canvas border-l border-border/40 shadow-2xl flex flex-col animate-slide-left">
          
          {/* Header */}
          <div className="px-6 py-5 bg-white border-b border-border/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-accent" />
              <h2 className="font-playfair font-bold text-lg text-primary">
                Giỏ hàng bán lẻ ({items.reduce((acc, item) => acc + item.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-secondary/40 hover:text-primary font-bold text-sm bg-canvas border border-border/40 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto py-6 px-6 divide-y divide-border/40">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4 py-12">
                <div className="w-16 h-16 rounded-full bg-accent/5 flex items-center justify-center text-accent">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-playfair font-bold text-base text-primary">Giỏ hàng của bạn đang trống</h3>
                  <p className="text-xs text-secondary/60 mt-1 max-w-xs leading-relaxed">
                    Hãy dạo quanh cửa hàng gốm Bát Tràng và chọn cho mình chiếc cốc ưng ý nhất nhé.
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="bg-primary hover:bg-accent text-canvas font-bold text-xs px-6 py-3 rounded-2 transition-colors cursor-pointer uppercase tracking-wider"
                >
                  Khám phá cửa hàng
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 py-4 first:pt-0">
                    {/* Item Image */}
                    <div className="w-20 h-20 bg-white border border-border/40 rounded-2 overflow-hidden shrink-0 relative">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-2">
                          <h4 className="font-playfair font-bold text-sm text-primary line-clamp-1">
                            {item.name}
                          </h4>
                          <span className="font-bold text-sm text-primary shrink-0">
                            {item.price.toLocaleString('vi-VN')}đ
                          </span>
                        </div>
                        
                        {/* Variant Swatch Info */}
                        {(item.colorName || item.sizeName) && (
                          <div className="flex flex-wrap gap-2 mt-1">
                            {item.colorName && (
                              <span className="text-[10px] bg-accent/5 text-accent px-2 py-0.5 rounded-2 font-bold flex items-center gap-1.5 border border-accent/10">
                                {item.colorHex && (
                                  <span className="w-2 h-2 rounded-full border border-border/40" style={{ backgroundColor: item.colorHex }} />
                                )}
                                Màu: {item.colorName}
                              </span>
                            )}
                            {item.sizeName && (
                              <span className="text-[10px] bg-subtle text-secondary px-2 py-0.5 rounded-2 font-bold">
                                Cỡ: {item.sizeName}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Pre-order Warn Badge */}
                        {item.isPreOrder && (
                          <span className="inline-flex items-center gap-1 text-[9px] bg-mustard/10 border border-mustard/20 text-mustard px-2 py-0.5 rounded-md font-bold mt-1.5 uppercase tracking-wider font-mono">
                            <Clock className="w-3 h-3 text-mustard shrink-0" />
                            Đợi nung 7-14 ngày
                          </span>
                        )}
                      </div>

                      {/* Quantity & Actions */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-border/60 bg-white rounded-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:text-accent transition-colors text-secondary/45 cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-xs font-bold text-primary min-w-8 text-center select-none font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:text-accent transition-colors text-secondary/45 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-secondary/40 hover:text-error p-1.5 transition-colors cursor-pointer"
                          title="Xóa khỏi giỏ hàng"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer checkout panel */}
          {items.length > 0 && (
            <div className="border-t border-border/40 bg-white px-6 py-6 flex flex-col gap-4">
              {/* Preorder warning */}
              {hasPreOrder && (
                <div className="bg-mustard/5 border border-mustard/20 rounded-2 p-3.5 flex items-start gap-2.5 text-xs text-mustard font-medium">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5 text-mustard" />
                  <p className="leading-relaxed">
                    Giỏ hàng có sản phẩm <strong>Pre-order (Đợi nung)</strong>. Toàn bộ đơn hàng sẽ được vận chuyển cùng nhau sau 7-14 ngày khi cốc nung ra lò.
                  </p>
                </div>
              )}

              {/* Subtotal */}
              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-secondary/60 uppercase tracking-wider">Tổng tạm tính</span>
                <span className="text-xl font-bold text-accent font-mono">
                  {subtotal.toLocaleString('vi-VN')} đ
                </span>
              </div>
              <p className="text-[10px] text-secondary/60 font-medium">
                Chưa bao gồm phí vận chuyển (sẽ tính tại trang thanh toán).
              </p>

              {/* Actions */}
              <div className="flex flex-col gap-2.5 mt-2">
                <Link
                  href="/checkout"
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-4 rounded-2 transition-all flex items-center justify-center gap-2 shadow-sm shadow-accent/10 cursor-pointer group uppercase tracking-wider"
                >
                  <span>TIẾN HÀNH THANH TOÁN</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full border border-border/60 hover:border-border hover:bg-subtle/10 text-secondary font-bold text-xs py-3.5 rounded-2 transition-all cursor-pointer uppercase tracking-wider"
                >
                  TIẾP TỤC MUA SẮM
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
