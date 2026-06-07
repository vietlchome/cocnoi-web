'use client'

import React, { useState, useTransition } from 'react'
import { 
  Search, SlidersHorizontal, Eye, Clock, PhoneCall, CheckCircle2, 
  XCircle, ArrowRight, Loader2, Plus, Trash2, Calendar, FileText, ShoppingBag, Landmark
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updateInquiryStatus, convertInquiryToOrder } from '@/lib/actions/inquiry.actions'
import { createProduct } from '@/lib/actions/product.actions'
import ImageCropUploader from './ImageCropUploader'

interface Product {
  id: string
  sku?: string | null
  name: string
  price: number
  stockQuantity: number
  images: string
  color?: { name: string } | null
  size?: { name: string } | null
}

interface OrderInquiry {
  id: string
  customerName: string
  phone: string
  email?: string | null
  companyName?: string | null
  productId?: string | null
  product?: {
    id: string
    name: string
    price: number
    sku?: string | null
    images: string
    size?: { name: string } | null
    color?: { name: string } | null
  } | null
  quantity: number
  note?: string | null
  status: string
  inquiryType?: string | null
  orderId?: string | null
  order?: {
    id: string
    totalAmount: number
    orderType: string
    discount: number
    status: string
    paidAmount?: number | null
    debtAmount?: number | null
    items: {
      id: string
      product: { name: string; sku?: string | null }
      quantity: number
      priceAtPurchase: number
      originalPrice: number
    }[]
  } | null
  createdAt: Date
}

interface InquiriesClientProps {
  initialInquiries: OrderInquiry[]
  products: Product[]
}

export default function InquiriesClient({ initialInquiries, products }: InquiriesClientProps) {
  const [inquiries, setInquiries] = useState<OrderInquiry[]>(initialInquiries)
  const [localProducts, setLocalProducts] = useState<Product[]>(products)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [selectedType, setSelectedType] = useState('all')
  const [activeInquiry, setActiveInquiry] = useState<OrderInquiry | null>(null)
  
  // Convert Modal State
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false)
  const [convertTab, setConvertTab] = useState<'existing' | 'quick-create'>('existing')
  const [shippingAddress, setShippingAddress] = useState('')
  const [discount, setDiscount] = useState<number>(0)
  const [orderItems, setOrderItems] = useState<{
    productId: string
    quantity: number
    priceAtPurchase: number
    originalPrice: number
  }[]>([])
  
  // Paid Amount in convert B2B
  const [paidAmount, setPaidAmount] = useState<number>(0)
  const [paymentStatus, setPaymentStatus] = useState<boolean>(false)

  // Quick Create Product State
  const [quickProductName, setQuickProductName] = useState('')
  const [quickProductPrice, setQuickProductPrice] = useState<number>(0)
  const [quickProductSku, setQuickProductSku] = useState('')
  const [quickProductImage, setQuickProductImage] = useState('')
  const [quickProductDescription, setQuickProductDescription] = useState('')

  const [isPending, startTransition] = useTransition()
  const [isConvertPending, startConvertTransition] = useTransition()
  const router = useRouter()

  const tabs = [
    { key: 'all', label: 'Tất cả' },
    { key: 'RETAIL_B2C', label: 'Khách lẻ' },
    { key: 'WHOLESALE_B2B', label: 'Đại lý' },
    { key: 'CORPORATE_B2B', label: 'Quà tặng DN' },
    { key: 'CONTACT_GENERAL', label: 'Liên hệ chung' },
  ];

  // 1. Phân lọc đơn tư vấn
  const filteredInquiries = inquiries.filter(inq => {
    const matchesSearch = 
      inq.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      inq.phone.includes(searchTerm) ||
      (inq.companyName && inq.companyName.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = selectedStatus === '' || inq.status === selectedStatus
    
    const inqType = inq.inquiryType || 'RETAIL_B2C'
    const matchesType = selectedType === 'all' || inqType === selectedType

    return matchesSearch && matchesStatus && matchesType
  })

  const getTabCount = (type: string) => {
    return inquiries.filter(inq => {
      const inqType = inq.inquiryType || 'RETAIL_B2C'
      const matchesType = type === 'all' || inqType === type
      const matchesStatus = selectedStatus === '' || inq.status === selectedStatus
      return matchesType && matchesStatus
    }).length
  }

  // 2. Chuyển trạng thái đơn tư vấn nhanh
  const handleStatusChange = async (inquiryId: string, newStatus: string) => {
    startTransition(async () => {
      const res = await updateInquiryStatus(inquiryId, newStatus as any)
      if (res.success) {
        setInquiries(prev => 
          prev.map(item => item.id === inquiryId ? { ...item, status: newStatus } : item)
        )
        // Cập nhật inquiry đang được active
        if (activeInquiry?.id === inquiryId) {
          setActiveInquiry(prev => prev ? { ...prev, status: newStatus } : null)
        }
      } else {
        alert(res.error || 'Có lỗi xảy ra.')
      }
    })
  }

  // 3. Chuẩn bị modal chuyển thành đơn hàng B2B
  const openConvertModal = (inq: OrderInquiry) => {
    setActiveInquiry(inq)
    setShippingAddress('')
    setDiscount(0)
    setPaidAmount(0)
    setPaymentStatus(false)
    setConvertTab('existing')
    
    // Khởi tạo mặt hàng mặc định dựa trên sản phẩm khách tư vấn
    if (inq.product) {
      setOrderItems([
        {
          productId: inq.product.id,
          quantity: inq.quantity,
          priceAtPurchase: inq.product.price, // Mặc định giữ giá gốc bán lẻ
          originalPrice: inq.product.price
        }
      ])
    } else {
      setOrderItems([])
    }
    
    setIsConvertModalOpen(true)
  }

  // Thêm sản phẩm vào giỏ đơn hàng B2B trong modal
  const addProductRow = () => {
    if (localProducts.length === 0) return
    const defaultProd = localProducts[0]
    setOrderItems(prev => [
      ...prev,
      {
        productId: defaultProd.id,
        quantity: 1,
        priceAtPurchase: defaultProd.price,
        originalPrice: defaultProd.price
      }
    ])
  }

  // Xóa hàng trong modal
  const removeProductRow = (index: number) => {
    setOrderItems(prev => prev.filter((_, idx) => idx !== index))
  }

  // Cập nhật hàng
  const updateProductRow = (index: number, fields: Partial<typeof orderItems[0]>) => {
    setOrderItems(prev => prev.map((item, idx) => {
      if (idx !== index) return item
      
      const updated = { ...item, ...fields }
      // Nếu thay đổi productId thì tự động đổi originalPrice & priceAtPurchase tương ứng
      if (fields.productId) {
        const prod = localProducts.find(p => p.id === fields.productId)
        if (prod) {
          updated.originalPrice = prod.price
          updated.priceAtPurchase = prod.price
        }
      }
      return updated
    }))
  }

  // Handle subtab change in B2B convert modal
  const handleTabChange = (tab: 'existing' | 'quick-create') => {
    setConvertTab(tab)
    if (tab === 'quick-create' && !quickProductSku) {
      setQuickProductSku(`B2B-${Date.now()}`)
    }
  }

  // Handle Quick Create Product from modal
  const handleQuickCreateProduct = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!quickProductName.trim()) {
      alert('Vui lòng nhập tên sản phẩm.')
      return
    }
    if (quickProductPrice < 0) {
      alert('Giá sản phẩm không được âm.')
      return
    }

    startConvertTransition(async () => {
      const skuToUse = quickProductSku.trim() || `B2B-${Date.now()}`
      
      const res = await createProduct({
        sku: skuToUse,
        name: quickProductName.trim(),
        description: quickProductDescription.trim() || 'Sản phẩm custom B2B cho đơn hàng',
        shortDescription: 'Sản phẩm B2B tùy chỉnh',
        price: quickProductPrice,
        stockQuantity: 9999, // default stock quantity to pass validation checks
        weight: 0,
        images: quickProductImage ? [quickProductImage] : ['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d'],
        isActive: true,
        visibility: 'HIDDEN', // hidden from store front catalog
      })

      if (res.success && res.data) {
        const newProduct = res.data
        // Add to order items
        setOrderItems(prev => [
          ...prev,
          {
            productId: newProduct.id,
            quantity: activeInquiry?.quantity || 1,
            priceAtPurchase: newProduct.price,
            originalPrice: newProduct.price
          }
        ])
        
        // Add to local products dropdown
        setLocalProducts(prev => [
          {
            id: newProduct.id,
            sku: newProduct.sku,
            name: newProduct.name,
            price: newProduct.price,
            stockQuantity: newProduct.stockQuantity,
            images: Array.isArray(newProduct.images) ? newProduct.images[0] : newProduct.images,
            color: null,
            size: null
          },
          ...prev
        ])

        alert(`Đã tạo nhanh sản phẩm ẩn B2B: ${newProduct.name} và thêm vào đơn hàng!`)
        
        // Reset form
        setQuickProductName('')
        setQuickProductPrice(0)
        setQuickProductSku('')
        setQuickProductImage('')
        setQuickProductDescription('')
        setConvertTab('existing')
      } else {
        alert(res.error || 'Có lỗi xảy ra khi tạo sản phẩm.')
      }
    })
  }

  // Tính tổng giá trị đơn hàng B2B tạm tính
  const calculateTotalOriginal = () => {
    return orderItems.reduce((sum, item) => sum + (item.originalPrice * item.quantity), 0)
  }

  const calculateTotalWholesale = () => {
    const sum = orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
    return Math.max(0, sum - discount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-600 border border-amber-200">CHỜ TƯ VẤN</span>
      case 'CONTACTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600 border border-blue-200">ĐÃ LIÊN HỆ</span>
      case 'NEGOTIATING':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-600 border border-purple-200">THƯƠNG LƯỢNG</span>
      case 'CONVERTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-200">ĐÃ CHỐT ĐƠN</span>
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">ĐÃ HỦY</span>
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-50 text-gray-600 border border-gray-200">{status}</span>
    }
  }

  // 4. Submit chuyển thành đơn hàng B2B chính thức
  const handleConvertToOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!activeInquiry) return
    if (orderItems.length === 0) {
      alert('Vui lòng chọn ít nhất 1 sản phẩm để lên đơn hàng.')
      return
    }
    if (!shippingAddress.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng.')
      return
    }

    startConvertTransition(async () => {
      const res = await convertInquiryToOrder({
        inquiryId: activeInquiry.id,
        shippingAddress,
        discount,
        items: orderItems,
        paidAmount
      })

      if (res.success) {
        alert('Đã chuyển đổi thành đơn hàng B2B (WHOLESALE) thành công!')
        setIsConvertModalOpen(false)
        
        // Reload dữ liệu để cập nhật quan hệ Order mới được sinh ra
        router.refresh()
        window.location.reload()
      } else {
        alert(res.error || 'Có lỗi xảy ra khi tạo đơn hàng.')
      }
    })
  }


  return (
    <div className="flex flex-col lg:flex-row gap-6 font-bvp">
      
      {/* CỘT TRÁI: DANH SÁCH ĐƠN TƯ VẤN */}
      <div className="flex-grow flex flex-col gap-6 lg:w-2/3 min-w-0">
        
        {/* TABS LỌC THEO INQUIRY TYPE */}
        <div className="flex border-b border-border/60 overflow-x-auto gap-2 scrollbar-none">
          {tabs.map((tab) => {
            const active = selectedType === tab.key;
            const count = getTabCount(tab.key);
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedType(tab.key)}
                className={`py-3 px-4 border-b-2 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  active 
                    ? 'border-accent text-accent' 
                    : 'border-transparent text-secondary hover:text-primary'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  active ? 'bg-accent/10 text-accent font-bold' : 'bg-gray-100 text-gray-500 font-semibold'
                }`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* THANH TÌM KIẾM & BỘ LỌC */}
        <div className="bg-white border border-border/60 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm theo tên khách, SĐT, công ty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs bg-gray-50 border border-gray-200 pl-10 pr-4 py-2.5 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto ml-auto">
            <SlidersHorizontal size={14} className="text-accent" />
            <span className="text-xs text-gray-500 font-semibold">Trạng thái:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 cursor-pointer"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="PENDING">Chờ tư vấn</option>
              <option value="CONTACTED">Đã liên hệ</option>
              <option value="NEGOTIATING">Thương lượng</option>
              <option value="CONVERTED">Đã chốt đơn B2B</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>
        </div>

        {/* LIST TABLE CONTAINER */}
        <div className="bg-white border border-border/60 rounded-2xl shadow-xs overflow-hidden">
          {filteredInquiries.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-xs font-medium">
              Không tìm thấy yêu cầu tư vấn nào phù hợp.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                  <tr className="border-b border-border/60 bg-gray-50/50 text-gray-400 text-xs uppercase tracking-wider font-bold">
                    <th className="py-4 px-6">Khách hàng</th>
                    <th className="py-4 px-4">Sản phẩm quan tâm</th>
                    <th className="py-4 px-4">Yêu cầu sơ bộ</th>
                    <th className="py-4 px-4 text-center">Trạng thái</th>
                    <th className="py-4 px-6 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredInquiries.map((inq) => {
                    const isSelected = activeInquiry?.id === inq.id
                    const needsAttention = inq.status === 'PENDING'

                    return (
                      <tr
                        key={inq.id}
                        onClick={() => setActiveInquiry(inq)}
                        className={`cursor-pointer transition-colors relative ${
                          isSelected || needsAttention ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-gray-50/30'
                        }`}
                      >
                        {/* Khách hàng */}
                        <td className="py-4 px-6 relative">
                          {needsAttention && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-sm z-10" />}
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-primary block text-sm">
                              {inq.customerName}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              ĐT: {inq.phone} {inq.companyName ? `· ${inq.companyName}` : ''}
                            </span>
                          </div>
                        </td>

                        {/* Sản phẩm */}
                        <td className="py-4 px-4">
                          {inq.product ? (
                            <div className="flex flex-col gap-0.5 text-xs">
                              <span className="font-semibold text-secondary max-w-[200px] overflow-hidden text-ellipsis block">
                                {inq.product.name}
                              </span>
                              <span className="text-[9px] text-gray-400 font-mono">
                                SKU: {inq.product.sku || '---'} · {inq.product.price.toLocaleString('vi-VN')}đ
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400 italic">Yêu cầu gốm B2B custom</span>
                          )}
                        </td>

                        {/* Số lượng */}
                        <td className="py-4 px-4 text-xs font-semibold text-primary">
                          SL: <span className="font-bold text-accent">{inq.quantity}</span> đôi
                          {inq.note && (
                            <span className="block text-[10px] font-normal text-gray-400 max-w-[180px] overflow-hidden text-ellipsis" title={inq.note}>
                              {inq.note}
                            </span>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="py-4 px-4 text-center">
                          {getStatusBadge(inq.status)}
                        </td>

                        {/* Thao tác */}
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setActiveInquiry(inq)
                            }}
                            className="p-1.5 text-gray-400 hover:text-accent rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* CỘT PHẢI: CHI TIẾT ĐƠN TƯ VẤN & XỬ LÝ */}
      <div className="lg:w-1/3 shrink-0">
        <div className="bg-white border border-border/60 rounded-2xl p-6 shadow-xs sticky top-6 flex flex-col gap-6">
          
          {activeInquiry ? (
            <>
              <div className="border-b border-gray-100 pb-4">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <h3 className="font-playfair font-bold text-base text-primary">Chi tiết Yêu cầu</h3>
                  {getStatusBadge(activeInquiry.status)}
                </div>
                <p className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                  <Calendar size={10} />
                  <span>Ngày nhận: {new Date(activeInquiry.createdAt).toLocaleString('vi-VN')}</span>
                </p>
              </div>

              {/* Thông tin khách hàng */}
              <div className="flex flex-col gap-2.5 text-xs">
                <h4 className="font-bold text-secondary text-[11px] uppercase tracking-wider">Khách hàng</h4>
                <div className="bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl flex flex-col gap-2 font-medium">
                  <p className="text-primary font-bold text-sm">{activeInquiry.customerName}</p>
                  {activeInquiry.companyName && (
                    <p className="text-secondary flex items-center gap-1.5">
                      <Landmark size={12} className="text-accent" />
                      <span>{activeInquiry.companyName}</span>
                    </p>
                  )}
                  <p className="text-gray-600 font-mono">SĐT: {activeInquiry.phone}</p>
                  {activeInquiry.email && <p className="text-gray-600 font-mono">Email: {activeInquiry.email}</p>}
                </div>
              </div>

              {/* Sản phẩm */}
              <div className="flex flex-col gap-2.5 text-xs">
                <h4 className="font-bold text-secondary text-[11px] uppercase tracking-wider">Sản phẩm quan tâm</h4>
                <div className="bg-gray-50/50 border border-gray-100 p-3.5 rounded-xl flex flex-col gap-2">
                  {activeInquiry.product ? (
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden relative shrink-0 border border-gray-200/80 bg-white">
                        <img 
                          src={Array.isArray(activeInquiry.product.images) ? activeInquiry.product.images[0] : ''} 
                          alt={activeInquiry.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-grow flex flex-col">
                        <span className="font-bold text-primary block">{activeInquiry.product.name}</span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          Giá lẻ: {activeInquiry.product.price.toLocaleString('vi-VN')}đ | SKU: {activeInquiry.product.sku || '---'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <span className="italic text-gray-400">Thiết kế gốm độc quyền theo yêu cầu riêng (B2B)</span>
                  )}
                  
                  <div className="border-t border-gray-200/60 pt-2.5 mt-1 flex justify-between items-center text-xs">
                    <span className="text-gray-500 font-semibold">Số lượng dự kiến:</span>
                    <span className="font-bold text-accent text-sm">{activeInquiry.quantity} đôi</span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {activeInquiry.note && (
                <div className="flex flex-col gap-2 text-xs">
                  <h4 className="font-bold text-secondary text-[11px] uppercase tracking-wider">Thông tin thêm / Địa chỉ</h4>
                  <div className="bg-orange-50/20 border border-orange-100 p-3.5 rounded-xl text-gray-700 leading-relaxed font-medium">
                    {activeInquiry.note}
                  </div>
                </div>
              )}

              {/* Hóa đơn liên kết nếu chốt thành công */}
              {activeInquiry.status === 'CONVERTED' && activeInquiry.order && (
                <div className="flex flex-col gap-2.5 text-xs">
                  <h4 className="font-bold text-secondary text-[11px] uppercase tracking-wider text-emerald-600">Đơn hàng B2B đã tạo</h4>
                  <div className="bg-emerald-50/20 border border-emerald-100 p-3.5 rounded-xl flex flex-col gap-2">
                    <div className="flex justify-between items-center font-bold">
                      <span className="text-emerald-700">Mã đơn hàng:</span>
                      <span className="text-emerald-800 font-mono">#{activeInquiry.order.id.slice(-6).toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Loại đơn:</span>
                      <span className="font-bold text-gray-800">WHOLESALE (B2B)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Chiết khấu thêm:</span>
                      <span className="font-bold text-gray-800">-{activeInquiry.order.discount.toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Đã thanh toán:</span>
                      <span className="font-bold text-emerald-600">{(activeInquiry.order.paidAmount || 0).toLocaleString('vi-VN')}đ</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-500">Công nợ còn:</span>
                      <span className={`font-bold ${(activeInquiry.order.debtAmount || 0) > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                        {(activeInquiry.order.debtAmount || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <div className="border-t border-emerald-100 pt-2 mt-1 flex justify-between items-center font-bold text-emerald-700 text-sm">
                      <span>Tổng tiền final:</span>
                      <span>{activeInquiry.order.totalAmount.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                </div>
              )}

              {/* KHU VỰC THAO TÁC XỬ LÝ (CHỈ KHI CHƯA CHỐT) */}
              {activeInquiry.status !== 'CONVERTED' && (
                <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
                  <h4 className="font-bold text-secondary text-[11px] uppercase tracking-wider">Cập nhật xử lý</h4>
                  
                  {isPending ? (
                    <div className="flex justify-center py-2">
                      <Loader2 className="animate-spin text-accent" />
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {activeInquiry.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusChange(activeInquiry.id, 'CONTACTED')}
                            className="bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200 font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <PhoneCall size={12} />
                            <span>Đã liên hệ</span>
                          </button>
                        )}
                        
                        {(activeInquiry.status === 'PENDING' || activeInquiry.status === 'CONTACTED') && (
                          <button
                            onClick={() => handleStatusChange(activeInquiry.id, 'NEGOTIATING')}
                            className="bg-purple-50 hover:bg-purple-100 text-purple-600 border border-purple-200 font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Clock size={12} />
                            <span>Thương lượng</span>
                          </button>
                        )}

                        {activeInquiry.status !== 'CANCELLED' && (
                          <button
                            onClick={() => handleStatusChange(activeInquiry.id, 'CANCELLED')}
                            className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <XCircle size={12} />
                            <span>Báo hủy đơn</span>
                          </button>
                        )}

                        {activeInquiry.status === 'CANCELLED' && (
                          <button
                            onClick={() => handleStatusChange(activeInquiry.id, 'PENDING')}
                            className="col-span-2 bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200 font-bold text-[10px] py-2 px-3 rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-colors"
                          >
                            <Clock size={12} />
                            <span>Mở lại chờ tư vấn</span>
                          </button>
                        )}
                      </div>

                      {activeInquiry.status !== 'CANCELLED' && (
                        <button
                          onClick={() => openConvertModal(activeInquiry)}
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-emerald-500/10 transition-colors mt-1"
                        >
                          <CheckCircle2 size={14} />
                          <span>Chốt đơn B2B (Lên Đơn Hàng)</span>
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 text-gray-400 text-xs font-semibold flex flex-col items-center gap-2">
              <FileText size={28} className="text-gray-300" />
              <span>Vui lòng chọn một yêu cầu tư vấn bên danh sách để xem chi tiết và lên đơn B2B.</span>
            </div>
          )}

        </div>
      </div>

      {/* MODAL LÊN ĐƠN HÀNG B2B (CONVERT INQUIRY) */}
      {isConvertModalOpen && activeInquiry && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-3xl border border-gray-200 shadow-2xl overflow-hidden my-8 max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="bg-gray-50/80 border-b border-gray-200/80 px-6 py-4.5 flex justify-between items-center shrink-0">
              <div>
                <h3 className="font-playfair font-bold text-base text-primary">Tạo Đơn Hàng B2B (Wholesale)</h3>
                <p className="text-[10px] text-gray-400 mt-0.5">Khách hàng: {activeInquiry.customerName} · ĐT: {activeInquiry.phone}</p>
              </div>
              <button 
                onClick={() => setIsConvertModalOpen(false)}
                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-primary transition-colors cursor-pointer"
              >
                <XCircle size={18} />
              </button>
            </div>

            {/* Modal Subtabs for Product Selection */}
            <div className="px-6 pt-4 flex border-b border-gray-100 shrink-0 bg-gray-50/20">
              <button
                type="button"
                onClick={() => handleTabChange('existing')}
                className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  convertTab === 'existing' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                Chọn sản phẩm có sẵn
              </button>
              <button
                type="button"
                onClick={() => handleTabChange('quick-create')}
                className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                  convertTab === 'quick-create' ? 'border-accent text-accent' : 'border-transparent text-gray-400 hover:text-primary'
                }`}
              >
                Tạo sản phẩm mới (Custom B2B)
              </button>
            </div>

            {/* Form & Main Body */}
            <div className="flex-grow overflow-y-auto p-6 flex flex-col gap-6">
              {convertTab === 'quick-create' ? (
                /* QUICK CREATE PRODUCT FORM */
                <div className="flex flex-col gap-4 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-primary uppercase tracking-wider">Tạo sản phẩm Custom B2B ẩn</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-secondary">Tên sản phẩm *</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Đôi cốc Bát Tràng khắc logo doanh nghiệp"
                        value={quickProductName}
                        onChange={e => setQuickProductName(e.target.value)}
                        className="w-full text-xs border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-accent"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-secondary">Mã SKU *</label>
                      <input
                        type="text"
                        placeholder="Mã SKU định danh"
                        value={quickProductSku}
                        onChange={e => setQuickProductSku(e.target.value)}
                        className="w-full text-xs border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-accent font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-secondary">Đơn giá bán lẻ/gốc (VNĐ) *</label>
                      <input
                        type="number"
                        min={0}
                        value={quickProductPrice || ''}
                        onChange={e => setQuickProductPrice(parseInt(e.target.value) || 0)}
                        className="w-full text-xs border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-accent font-bold text-primary font-mono"
                      />
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-secondary">Mô tả sản phẩm</label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Đất sét trắng Bát Tràng, nung 1250 độ C"
                        value={quickProductDescription}
                        onChange={e => setQuickProductDescription(e.target.value)}
                        className="w-full text-xs border border-gray-200 px-3 py-2.5 rounded-xl focus:outline-none focus:border-accent"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-secondary">Hình ảnh sản phẩm</label>
                    <ImageCropUploader
                      label="Tải ảnh sản phẩm lên Cloudinary"
                      value={quickProductImage}
                      onChange={setQuickProductImage}
                      recommendedSize="800x800 px"
                      folder="products"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickCreateProduct}
                    disabled={isConvertPending}
                    className="bg-accent hover:bg-accent-hover text-canvas font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer w-fit self-end flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isConvertPending ? (
                      <>
                        <Loader2 size={12} className="animate-spin" />
                        <span>Đang tạo...</span>
                      </>
                    ) : (
                      <>
                        <Plus size={14} />
                        <span>Tạo & Thêm vào đơn</span>
                      </>
                    )}
                  </button>
                </div>
              ) : (
                /* SELECT EXISTING PRODUCTS FLOW */
                <div className="flex flex-col gap-6">
                  
                  {/* Địa chỉ giao hàng */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-secondary uppercase tracking-wider">Địa chỉ giao hàng *</label>
                    <textarea
                      required
                      rows={2}
                      placeholder="Nhập địa chỉ nhận hàng chi tiết..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full text-xs border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all leading-relaxed"
                    />
                  </div>

                  {/* Chi tiết mặt hàng (Wholesale items) */}
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-secondary uppercase tracking-wider">Mặt hàng & Chiết khấu giá *</label>
                      <button
                        type="button"
                        onClick={addProductRow}
                        className="text-[10px] font-bold text-accent hover:text-accent-hover flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Plus size={12} />
                        <span>Thêm dòng sản phẩm</span>
                      </button>
                    </div>

                    <div className="border border-gray-200/80 rounded-xl overflow-hidden">
                      <table className="w-full text-left text-xs whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-400 font-bold uppercase text-[9px] tracking-wider">
                          <tr>
                            <th className="py-2.5 px-4">Sản phẩm</th>
                            <th className="py-2.5 px-3 text-center">SL (Đôi)</th>
                            <th className="py-2.5 px-3 text-right">Giá gốc</th>
                            <th className="py-2.5 px-3 text-right">Giá B2B (Đã chiết khấu)</th>
                            <th className="py-2.5 px-4 text-center">Xóa</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orderItems.map((item, index) => {
                            return (
                              <tr key={index} className="hover:bg-gray-50/30">
                                {/* Dropdown chọn sản phẩm */}
                                <td className="py-2 px-4 max-w-[240px]">
                                  <select
                                    value={item.productId}
                                    onChange={(e) => updateProductRow(index, { productId: e.target.value })}
                                    className="w-full text-xs bg-white border border-gray-200 p-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                                  >
                                    {localProducts.map(p => (
                                      <option key={p.id} value={p.id}>
                                        {p.name} ({p.price.toLocaleString('vi-VN')}đ)
                                      </option>
                                    ))}
                                  </select>
                                </td>

                                {/* Số lượng */}
                                <td className="py-2 px-3 text-center w-20">
                                  <input
                                    type="number"
                                    min={1}
                                    required
                                    value={item.quantity}
                                    onChange={(e) => updateProductRow(index, { quantity: parseInt(e.target.value) || 1 })}
                                    className="w-full text-center text-xs border border-gray-200 p-1.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent"
                                  />
                                </td>

                                {/* Giá gốc */}
                                <td className="py-2 px-3 text-right font-semibold text-gray-400 font-mono">
                                  {item.originalPrice.toLocaleString('vi-VN')}đ
                                </td>

                                {/* Giá B2B đã chiết khấu */}
                                <td className="py-2 px-3 text-right w-36">
                                  <div className="relative">
                                    <input
                                      type="number"
                                      min={0}
                                      required
                                      value={item.priceAtPurchase}
                                      onChange={(e) => updateProductRow(index, { priceAtPurchase: parseInt(e.target.value) || 0 })}
                                      className="w-full text-right text-xs border border-gray-200 p-1.5 pr-6 rounded-lg focus:outline-none focus:ring-1 focus:ring-accent font-bold text-emerald-600 font-mono"
                                    />
                                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-gray-400 font-bold">đ</span>
                                  </div>
                                </td>

                                {/* Action xóa hàng */}
                                <td className="py-2 px-4 text-center">
                                  <button
                                    type="button"
                                    onClick={() => removeProductRow(index)}
                                    className="text-gray-400 hover:text-red-500 p-1 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Chiết khấu thêm, Thanh toán & Ghi chú */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Chiết khấu thêm toàn đơn</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            value={discount}
                            onChange={(e) => {
                              const disc = parseInt(e.target.value) || 0
                              setDiscount(disc)
                              if (paymentStatus) {
                                const subtotal = orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
                                setPaidAmount(Math.max(0, subtotal - disc))
                              }
                            }}
                            className="w-full text-xs border border-gray-200 p-2.5 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold text-accent font-mono"
                            placeholder="Số tiền giảm thêm..."
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">VNĐ</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="inqPaymentStatus"
                          checked={paymentStatus}
                          onChange={e => {
                            const isChecked = e.target.checked
                            setPaymentStatus(isChecked)
                            if (isChecked) {
                              setPaidAmount(calculateTotalWholesale())
                            } else {
                              setPaidAmount(0)
                            }
                          }}
                          className="w-4 h-4 accent-accent"
                        />
                        <label htmlFor="inqPaymentStatus" className="text-xs font-bold text-primary cursor-pointer select-none">
                          Đã thanh toán đủ (Paid 100%)
                        </label>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-secondary uppercase tracking-wider">Số tiền đã cọc / Trả trước</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={0}
                            max={calculateTotalWholesale() + discount}
                            value={paidAmount}
                            onChange={e => {
                              const val = parseInt(e.target.value) || 0
                              setPaidAmount(val)
                              setPaymentStatus(val >= calculateTotalWholesale())
                            }}
                            className="w-full text-xs border border-gray-200 p-2.5 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent font-bold text-primary font-mono"
                            placeholder="Nhập số tiền đã cọc..."
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-gray-400 font-bold">VNĐ</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/80 border border-gray-100 rounded-2xl p-4.5 flex flex-col gap-2 text-xs shrink-0 self-end">
                      <div className="flex justify-between items-center text-gray-400">
                        <span className="font-semibold">Tổng giá bán lẻ gốc:</span>
                        <span className="font-bold font-mono">{calculateTotalOriginal().toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-600">
                        <span className="font-semibold">Giá B2B tạm tính:</span>
                        <span className="font-bold font-mono">{orderItems.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0).toLocaleString('vi-VN')}đ</span>
                      </div>
                      {discount > 0 && (
                        <div className="flex justify-between items-center text-accent">
                          <span className="font-semibold">Giảm thêm toàn đơn:</span>
                          <span className="font-bold font-mono">-{discount.toLocaleString('vi-VN')}đ</span>
                        </div>
                      )}
                      <div className="border-t border-gray-200 pt-2.5 mt-1 flex justify-between items-center font-bold text-primary text-sm">
                        <span>Tổng tiền chốt (B2B):</span>
                        <span className="text-emerald-600 text-base font-mono">{calculateTotalWholesale().toLocaleString('vi-VN')}đ</span>
                      </div>
                      <div className="flex justify-between items-center text-red-500 font-bold">
                        <span>Còn nợ lại (Công nợ):</span>
                        <span className="font-mono">{Math.max(0, calculateTotalWholesale() - paidAmount).toLocaleString('vi-VN')}đ</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}
            </div>

            {/* Footer buttons */}
            <div className="bg-gray-50/80 border-t border-gray-200/80 px-6 py-4 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setIsConvertModalOpen(false)}
                className="bg-white hover:bg-gray-50 text-gray-500 border border-gray-200 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer transition-colors"
              >
                Hủy bỏ
              </button>
              
              {convertTab === 'existing' && (
                <button
                  type="submit"
                  onClick={handleConvertToOrderSubmit}
                  disabled={isConvertPending}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs py-2 px-4.5 rounded-xl cursor-pointer shadow-sm shadow-emerald-500/10 flex items-center gap-1.5 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isConvertPending ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      <span>Đang lên đơn...</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={12} />
                      <span>Xác nhận lên đơn B2B</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
