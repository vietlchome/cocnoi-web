'use client'

import React, { useState, useTransition } from 'react'
import { 
  Search, Eye, ShieldAlert, CheckCircle, Clock, 
  Truck, XCircle, DollarSign, Calendar, User, Phone, 
  MapPin, FileText, Check, AlertCircle, ShoppingBag,
  Landmark, Loader2
} from 'lucide-react'
import { updateOrderStatus, updateOrderPaymentStatus, updateOrderDebt } from '@/lib/actions/order.actions'
import { normalizePhone, isValidPhone } from '@/lib/utils/phone'

interface OrdersClientProps {
  initialOrders: any[]
  bankSettings?: Record<string, any>
}

export default function OrdersClient({ initialOrders, bankSettings = {} }: OrdersClientProps) {
  const [orders, setOrders] = useState<any[]>(initialOrders)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter] = useState('ALL')
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  
  const [activeTab, setActiveTab] = useState<'RETAIL' | 'B2B'>('RETAIL')
  
  // Debt states for B2B
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [debtOrder, setDebtOrder] = useState<any>(null)
  const [paidAmountInput, setPaidAmountInput] = useState(0)

  const openDebtModal = (order: any) => {
    setDebtOrder(order)
    setPaidAmountInput(order.paidAmount || 0)
    setShowDebtModal(true)
  }

  const handleUpdateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debtOrder) return

    setActionError('')
    setActionSuccess('')
    startTransition(async () => {
      const res = await updateOrderDebt(debtOrder.id, paidAmountInput)
      if (res.success && res.data) {
        setOrders(prev =>
          prev.map(o => o.id === debtOrder.id ? { 
            ...o, 
            paidAmount: res.data.paidAmount, 
            debtAmount: res.data.debtAmount,
            paymentStatus: res.data.paymentStatus
          } : o)
        )
        if (selectedOrder && selectedOrder.id === debtOrder.id) {
          setSelectedOrder((prev: any) => ({
            ...prev,
            paidAmount: res.data.paidAmount,
            debtAmount: res.data.debtAmount,
            paymentStatus: res.data.paymentStatus
          }))
        }
        setShowDebtModal(false)
        setActionSuccess('Cập nhật công nợ đơn B2B thành công!')
      } else {
        setActionError(res.error || 'Cập nhật công nợ thất bại.')
      }
    })
  }

  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState('')
  const [actionSuccess, setActionSuccess] = useState('')

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    // 1. Phân chia theo Tab active
    const isB2BOrder = order.orderType?.startsWith('B2B') || order.orderType === 'WHOLESALE'
    if (activeTab === 'RETAIL' && isB2BOrder) return false
    if (activeTab === 'B2B' && !isB2BOrder) return false

    // 2. Parse địa chỉ giao hàng an toàn
    let customerName = ''
    let phone = ''
    try {
      const addr = JSON.parse(order.shippingAddress)
      customerName = addr.customerName || ''
      phone = addr.phone || ''
    } catch (e) {
      customerName = order.shippingAddress || ''
    }

    // Chuẩn hóa sdt của đơn và sdt search
    let orderPhoneNorm = phone.replace(/[\s\-\(\)]/g, '')
    if (isValidPhone(phone)) {
      try { orderPhoneNorm = normalizePhone(phone) } catch (e) {}
    }

    const searchClean = search.trim()
    let searchPhoneNorm = searchClean.replace(/[\s\-\(\)]/g, '')
    if (isValidPhone(searchClean)) {
      try { searchPhoneNorm = normalizePhone(searchClean) } catch (e) {}
    }

    const matchesSearch = 
      order.id.toLowerCase().includes(searchClean.toLowerCase()) ||
      customerName.toLowerCase().includes(searchClean.toLowerCase()) ||
      (orderPhoneNorm && orderPhoneNorm.includes(searchPhoneNorm)) ||
      (phone && phone.replace(/[\s\-\(\)]/g, '').includes(searchPhoneNorm))

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter
    const matchesType = typeFilter === 'ALL' || order.orderType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Format Status Badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="bg-amber-100 text-amber-700 px-2.5 py-1 rounded-full text-xs font-semibold">Chờ xử lý</span>
      case 'PROCESSING':
        return <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đang xử lý</span>
      case 'SHIPPED':
        return <span className="bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đang giao</span>
      case 'DELIVERED':
        return <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đã giao</span>
      case 'CANCELLED':
        return <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-xs font-semibold">Đã hủy</span>
      default:
        return <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-full text-xs font-semibold">{status}</span>
    }
  }

  // Format Type Badge
  const getTypeBadge = (type?: string) => {
    if (type?.startsWith('B2B') || type === 'WHOLESALE') {
      let typeLabel = 'B2B Nhập Sỉ'
      if (type === 'B2B_CONSIGNMENT') typeLabel = 'B2B Ký Gửi'
      if (type === 'B2B_GIFT') typeLabel = 'B2B Quà Tặng'
      return (
        <span className="bg-[#C2703E]/10 text-[#C2703E] border border-[#C2703E]/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase font-mono">
          {typeLabel}
        </span>
      )
    }
    return (
      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide uppercase font-mono">
        Bán Lẻ B2C
      </span>
    )
  }

  // Handle Order Status Update
  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setActionError('')
    setActionSuccess('')

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus as any)
      if (res.success && res.data) {
        // Update local state
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        )
        // Update selected order modal
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, status: newStatus }))
        }
        setActionSuccess('Cập nhật trạng thái đơn hàng thành công!')
      } else {
        setActionError(res.error || 'Cập nhật trạng thái thất bại.')
      }
    })
  }

  // Handle Payment Status Update
  const handleTogglePayment = async (orderId: string, currentStatus: boolean) => {
    setActionError('')
    setActionSuccess('')

    startTransition(async () => {
      const res = await updateOrderPaymentStatus(orderId, !currentStatus)
      if (res.success && res.data) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, paymentStatus: !currentStatus } : ord))
        )
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev: any) => ({ ...prev, paymentStatus: !currentStatus }))
        }
        setActionSuccess('Cập nhật trạng thái thanh toán thành công!')
      } else {
        setActionError(res.error || 'Cập nhật thanh toán thất bại.')
      }
    })
  }

  // Format Phone for Display
  const formatPhoneDisplay = (p: string) => {
    if (!p) return ''
    try {
      if (isValidPhone(p)) {
        let norm = normalizePhone(p)
        if (norm.startsWith('+84')) {
          norm = '0' + norm.substring(3)
        }
        if (norm.length === 10) {
          return `${norm.substring(0, 3)} ${norm.substring(3, 6)} ${norm.substring(6)}`
        }
        return norm
      }
    } catch(e) {}
    return p
  }

  return (
    <div className="flex flex-col gap-6 font-bvp">
      {/* TABS PHÂN CHIA ĐƠN HÀNG */}
      <div className="flex border-b border-gray-200/80">
        <button
          onClick={() => setActiveTab('RETAIL')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'RETAIL'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Đơn Bán Lẻ B2C ({orders.filter(o => !o.orderType?.startsWith('B2B') && o.orderType !== 'WHOLESALE').length})</span>
        </button>
        <button
          onClick={() => setActiveTab('B2B')}
          className={`py-3 px-6 text-sm font-bold border-b-2 cursor-pointer transition-all flex items-center gap-2 ${
            activeTab === 'B2B'
              ? 'border-accent text-accent'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Hợp Đồng B2B / Bán Sỉ ({orders.filter(o => o.orderType?.startsWith('B2B') || o.orderType === 'WHOLESALE').length})</span>
        </button>
      </div>

      {/* 1. FILTER CONTROLS */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-grow max-w-md min-w-[280px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo Mã đơn, Họ tên, Số điện thoại..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-accent text-gray-800 font-medium"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Order Type Filter (Only show B2B types if B2B tab, else hide) */}
          {activeTab === 'B2B' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Phân loại B2B:</span>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
              >
                <option value="ALL">Tất cả phân loại</option>
                <option value="B2B_WHOLESALE">Nhập sỉ buôn</option>
                <option value="B2B_CONSIGNMENT">Ký gửi gốm</option>
                <option value="B2B_GIFT">Quà tặng Doanh nghiệp</option>
              </select>
            </div>
          )}

          {/* Order Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-700 focus:outline-none"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="PROCESSING">Đang chuẩn bị hàng</option>
              <option value="SHIPPED">Đang giao hàng</option>
              <option value="DELIVERED">Đã giao hàng</option>
              <option value="CANCELLED">Đã hủy đơn</option>
            </select>
          </div>

        </div>

      </div>

      {/* 2. ORDERS TABLE */}
      <div className="bg-white border border-gray-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/75 border-b border-gray-200/60 text-xs font-bold text-gray-500 uppercase tracking-wider">
                {activeTab === 'RETAIL' ? (
                  <>
                    <th className="py-4.5 px-6">Mã Đơn / Ngày đặt</th>
                    <th className="py-4.5 px-6">Khách hàng</th>
                    <th className="py-4.5 px-6">Tổng tiền lẻ</th>
                    <th className="py-4.5 px-6">Phương thức</th>
                    <th className="py-4.5 px-6">Vận chuyển</th>
                    <th className="py-4.5 px-6 text-center">Thao tác</th>
                  </>
                ) : (
                  <>
                    <th className="py-4.5 px-6">Mã Đơn / Ngày đặt</th>
                    <th className="py-4.5 px-6">Công ty / Đối tác</th>
                    <th className="py-4.5 px-6">Phân loại B2B</th>
                    <th className="py-4.5 px-6">Giá trị chốt</th>
                    <th className="py-4.5 px-6 text-right">Đã trả</th>
                    <th className="py-4.5 px-6 text-right">Công nợ còn lại</th>
                    <th className="py-4.5 px-6 text-center">Trạng thái</th>
                    <th className="py-4.5 px-6 text-center">Thao tác</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={activeTab === 'RETAIL' ? 6 : 8} className="py-12 text-center text-gray-400 font-medium">
                    Không tìm thấy đơn hàng nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  let parsedAddress: any = {}
                  try {
                    parsedAddress = JSON.parse(order.shippingAddress)
                  } catch (e) {
                    parsedAddress = { customerName: order.shippingAddress }
                  }

                  if (activeTab === 'RETAIL') {
                    const needsAttention = order.status === 'PENDING' || order.status === 'PROCESSING'
                    return (
                      <tr key={order.id} className={`transition-colors relative ${needsAttention ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-gray-50/50'}`}>
                        {/* Code ID & Time */}
                        <td className="py-4 px-6 relative">
                          {needsAttention && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-sm z-10" />}
                          <div className="font-bold text-[#131829] font-mono">{order.id}</div>
                          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                          </div>
                        </td>

                        {/* Customer Contact */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-800">{parsedAddress.customerName}</div>
                          <div className="text-gray-500 font-mono mt-0.5">{formatPhoneDisplay(parsedAddress.phone)}</div>
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-6">
                          <span className="font-bold text-accent font-mono text-sm">
                            {order.totalAmount.toLocaleString('vi-VN')} đ
                          </span>
                        </td>

                        {/* Payment Method */}
                        <td className="py-4 px-6">
                          <span className="font-bold text-[#131829] font-medium">
                            {parsedAddress.paymentMethod === 'QR' ? 'Chuyển khoản QR' : 'Thanh toán COD'}
                          </span>
                          <div className="mt-1">
                            {order.paymentStatus ? (
                              <span className="inline-flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] font-mono">
                                Đã thanh toán
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-gray-100 border border-gray-200 text-gray-500 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] font-mono">
                                Chưa trả
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Shipping status */}
                        <td className="py-4 px-6">
                          {getStatusBadge(order.status)}
                        </td>

                        {/* Quick actions button */}
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="bg-gray-100 hover:bg-accent hover:text-white p-2 rounded-xl text-gray-600 transition-all cursor-pointer inline-flex items-center gap-1 font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Chi tiết</span>
                          </button>
                        </td>
                      </tr>
                    )
                  } else {
                    const needsAttention = order.status === 'PENDING' || order.status === 'PROCESSING'
                    return (
                      <tr key={order.id} className={`transition-colors relative ${needsAttention ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-gray-50/50'}`}>
                        {/* Code ID & Time */}
                        <td className="py-4 px-6 relative">
                          {needsAttention && <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent rounded-r-sm z-10" />}
                          <div className="font-bold text-[#131829] font-mono">{order.id}</div>
                          <div className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            <span>{new Date(order.createdAt).toLocaleString('vi-VN')}</span>
                          </div>
                        </td>

                        {/* Company / Partner */}
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-800">{parsedAddress.customerName}</div>
                          {parsedAddress.companyName && (
                            <div className="text-gray-400 text-[10px] mt-0.5">{parsedAddress.companyName}</div>
                          )}
                          <div className="text-gray-500 font-mono text-[10px] mt-0.5">{formatPhoneDisplay(parsedAddress.phone)}</div>
                        </td>

                        {/* B2B Type Badge */}
                        <td className="py-4 px-6">
                          {getTypeBadge(order.orderType)}
                        </td>

                        {/* Total Amount */}
                        <td className="py-4 px-6">
                          <span className="font-bold text-accent font-mono text-sm">
                            {order.totalAmount.toLocaleString('vi-VN')} đ
                          </span>
                          {order.discount > 0 && (
                            <div className="text-[10px] text-red-500 font-bold mt-0.5">
                              CK: -{order.discount.toLocaleString('vi-VN')}đ
                            </div>
                          )}
                        </td>

                        {/* Paid Amount */}
                        <td className="py-4 px-6 text-right font-mono font-bold text-emerald-600">
                          {(order.paidAmount || 0).toLocaleString('vi-VN')} đ
                        </td>

                        {/* Debt Amount */}
                        <td className="py-4 px-6 text-right">
                          <span className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                            (order.debtAmount || 0) > 0 
                              ? 'bg-red-50 border border-red-100 text-red-600' 
                              : 'bg-emerald-50 border border-emerald-100 text-emerald-700'
                          }`}>
                            {(order.debtAmount || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </td>

                        {/* Shipping status */}
                        <td className="py-4 px-6 text-center">
                          {getStatusBadge(order.status)}
                        </td>

                        {/* Thao tác B2B */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="bg-gray-100 hover:bg-accent hover:text-white p-2 rounded-xl text-gray-600 transition-all cursor-pointer inline-flex items-center gap-1 font-bold"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Chi tiết</span>
                            </button>
                            <button
                              onClick={() => openDebtModal(order)}
                              className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-2 py-2 rounded-xl transition-all cursor-pointer font-bold text-[10px] flex items-center gap-0.5"
                              title="Cập nhật công nợ"
                            >
                              <DollarSign className="w-3 h-3" />
                              <span>Sửa nợ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  }
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. ORDER DETAIL MODAL */}
      {selectedOrder && (() => {
        let details: any = {}
        try {
          details = JSON.parse(selectedOrder.shippingAddress)
        } catch (e) {
          details = { customerName: selectedOrder.shippingAddress }
        }

        return (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col animate-slide-up">
              
              {/* Modal Header */}
              <div className="bg-gray-50 px-6 py-5 border-b border-gray-200 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-5 h-5 text-accent" />
                  <div>
                    <h3 className="font-playfair font-bold text-base text-[#131829] flex items-center gap-2">
                      <span>Chi Tiết Đơn Hàng</span>
                      {getTypeBadge(selectedOrder.orderType)}
                    </h3>
                    <p className="text-[10px] text-gray-400 font-mono mt-0.5">Mã đơn: {selectedOrder.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600 font-bold text-sm bg-white border border-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                >
                  &times;
                </button>
              </div>

              {/* Modal Scroll Body */}
              <div className="p-6 overflow-y-auto flex-grow flex flex-col gap-6">
                
                {actionSuccess && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3.5 rounded-xl text-xs flex items-center gap-2">
                    <CheckCircle className="w-4.5 h-4.5" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {actionError && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3.5 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4.5 h-4.5" />
                    <span>{actionError}</span>
                  </div>
                )}

                {/* 2-Column Split: Customer info and Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Col 1: Customer Contact info */}
                  <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 flex flex-col gap-3.5">
                    <h4 className="font-playfair font-bold text-xs text-gray-800 border-b border-gray-200 pb-1.5 uppercase tracking-wider">
                      Thông tin nhận gốm
                    </h4>
                    <div className="flex flex-col gap-2.5 text-xs">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-800">{details.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-mono">{formatPhoneDisplay(details.phone)}</span>
                      </div>
                      {details.email && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                          <span className="truncate">{details.email}</span>
                        </div>
                      )}
                      <div className="flex items-start gap-2 text-gray-600">
                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{details.address}</span>
                      </div>
                      {details.note && (
                        <div className="border-t border-gray-200/60 pt-2.5 mt-1 text-gray-500 italic">
                          <strong className="text-gray-600 font-bold block mb-1 not-italic text-[10px] uppercase">
                            Ghi chú từ khách:
                          </strong>
                          "{details.note}"
                        </div>
                      )}
                    </div>

                    {/* B2B Debt Report Card */}
                    {selectedOrder.orderType?.startsWith('B2B') && (
                      <div className="bg-[#FAF7F2] border border-border/30 rounded-xl p-3.5 mt-2 space-y-2 text-xs">
                        <h5 className="font-bold text-secondary text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3 text-accent" />
                          <span>Báo cáo Công nợ đối tác</span>
                        </h5>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Đã trả trước:</span>
                          <span className="font-bold text-emerald-600">{(selectedOrder.paidAmount || 0).toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Còn nợ lại:</span>
                          <span className={`font-bold ${(selectedOrder.debtAmount || 0) > 0 ? 'text-red-500' : 'text-gray-500'}`}>
                            {(selectedOrder.debtAmount || 0).toLocaleString('vi-VN')} đ
                          </span>
                        </div>
                        <button 
                          onClick={() => openDebtModal(selectedOrder)}
                          className="w-full mt-2 text-[10px] font-bold bg-[#131829] hover:bg-black text-white py-1.5 rounded cursor-pointer transition-colors"
                        >
                          Sửa công nợ
                        </button>
                      </div>
                    )}

                    {/* Bank Info for B2B */}
                    {selectedOrder.orderType?.startsWith('B2B') && bankSettings?.bank_account && (
                      <div className="bg-white border border-dashed border-gray-300 rounded-xl p-3.5 mt-2 space-y-2 text-xs">
                        <h5 className="font-bold text-gray-700 text-[10px] uppercase tracking-wider flex items-center gap-1">
                          <Landmark className="w-3 h-3 text-emerald-600" />
                          <span>Thông tin chuyển khoản</span>
                        </h5>
                        <div className="flex justify-between mt-1.5">
                          <span className="text-gray-500">Ngân hàng:</span>
                          <span className="font-bold text-gray-800">{bankSettings.bank_name}</span>
                        </div>
                        {bankSettings.bank_branch && (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Chi nhánh:</span>
                            <span className="text-gray-700 text-right">{bankSettings.bank_branch}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-gray-500">Số tài khoản:</span>
                          <span className="font-bold font-mono text-emerald-700 tracking-wider">
                            {bankSettings.bank_account}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Chủ tài khoản:</span>
                          <span className="font-bold uppercase text-gray-800 text-right">{bankSettings.bank_owner}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Col 2: Interactive Controls */}
                  <div className="border border-gray-200/80 rounded-xl p-4 flex flex-col gap-4">
                    <h4 className="font-playfair font-bold text-xs text-gray-800 border-b border-gray-200 pb-1.5 uppercase tracking-wider">
                      Cập nhật trạng thái
                    </h4>

                    {/* Vận chuyển */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Trạng thái vận chuyển</label>
                      <select
                        value={selectedOrder.status}
                        disabled={isPending}
                        onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-accent disabled:opacity-50"
                      >
                        <option value="PENDING">Chờ xử lý (PENDING)</option>
                        <option value="PROCESSING">Đang chuẩn bị hàng/Đóng gói (PROCESSING)</option>
                        <option value="SHIPPED">Đang giao hàng (SHIPPED)</option>
                        <option value="DELIVERED">Đã giao hàng thành công (DELIVERED)</option>
                        <option value="CANCELLED">Hủy bỏ đơn hàng (CANCELLED)</option>
                      </select>
                    </div>

                    {/* Thanh toán */}
                    <div className="flex flex-col gap-2 mt-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Trạng thái thanh toán</label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleTogglePayment(selectedOrder.id, selectedOrder.paymentStatus)}
                          className={`flex-grow py-2 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            selectedOrder.paymentStatus
                              ? 'bg-emerald-500 text-white shadow-emerald-500/10'
                              : 'bg-accent text-white shadow-orange-500/10'
                          }`}
                        >
                          {selectedOrder.paymentStatus ? (
                            <>
                              <Check className="w-4.5 h-4.5" />
                              <span>ĐÃ THANH TOÁN (PAID)</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="w-4.5 h-4.5" />
                              <span>ĐÁNH DẤU LÀ ĐÃ THANH TOÁN</span>
                            </>
                          )}
                        </button>
                        {selectedOrder.paymentStatus && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleTogglePayment(selectedOrder.id, selectedOrder.paymentStatus)}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 cursor-pointer"
                            title="Đổi lại thành chưa thanh toán"
                          >
                            Hủy thu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Ordered Items Breakdown */}
                <div className="flex flex-col gap-3">
                  <h4 className="font-playfair font-bold text-xs text-gray-800 border-b border-gray-200 pb-1.5 uppercase tracking-wider">
                    Danh sách sản phẩm cốc đã mua
                  </h4>
                  <div className="border border-gray-200/80 rounded-xl overflow-hidden divide-y divide-gray-200/60">
                    {(selectedOrder.items || []).map((item: any) => {
                      let imgUrl = ''
                      try {
                        const parsed = JSON.parse(item.product.images)
                        imgUrl = Array.isArray(parsed) ? parsed[0] : item.product.images
                      } catch (e) {
                        imgUrl = item.product.images
                      }

                      return (
                        <div key={item.id} className="p-3.5 bg-white flex gap-4 items-center">
                          {/* Image */}
                          <div className="w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 overflow-hidden relative shrink-0">
                            {imgUrl ? (
                              <img src={imgUrl} alt={item.product.name} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                                <ShoppingBag className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <h5 className="font-playfair font-bold text-xs text-[#131829]">{item.product.name}</h5>
                            <div className="text-[10px] text-gray-400 font-mono mt-1 flex items-center gap-3">
                              {item.product.sku && <span>SKU: {item.product.sku}</span>}
                              {item.product.color && <span>Màu: {item.product.color.name}</span>}
                              {item.product.size && <span>Cỡ: {item.product.size.name}</span>}
                            </div>
                          </div>

                          {/* Price & Quantity */}
                          <div className="text-right">
                            <div className="font-bold text-gray-700 font-mono">{item.priceAtPurchase.toLocaleString('vi-VN')} đ</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Số lượng: x{item.quantity}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Totals math card */}
                <div className="bg-gray-50 border border-gray-200/60 rounded-xl p-4 flex flex-col gap-3 text-xs w-full max-w-sm ml-auto">
                  {selectedOrder.orderType?.startsWith('B2B') ? (
                    <>
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Giá trị hàng gốc:</span>
                        <strong className="text-gray-800 font-mono font-bold">
                          {(selectedOrder.totalAmount + (selectedOrder.discount || 0)).toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-red-500 font-bold">
                          <span>Chiết khấu B2B:</span>
                          <strong className="font-mono">
                            -{selectedOrder.discount.toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                      )}
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Đã thanh toán:</span>
                        <strong className="text-emerald-600 font-mono font-bold">
                          {(selectedOrder.paidAmount || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Nợ còn lại:</span>
                        <strong className={`${(selectedOrder.debtAmount || 0) > 0 ? 'text-red-500' : 'text-gray-500'} font-mono font-bold`}>
                          {(selectedOrder.debtAmount || 0).toLocaleString('vi-VN')} đ
                        </strong>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-gray-500 font-medium">
                        <span>Tổng tiền hàng lẻ:</span>
                        <strong className="text-gray-800 font-mono font-bold">
                          {(selectedOrder.totalAmount - (details.shippingFee || 0)).toLocaleString('vi-VN')} đ
                        </strong>
                      </div>

                      {details.shippingFee > 0 && (
                        <div className="flex justify-between text-gray-500 font-medium">
                          <span>Phí giao hàng lẻ:</span>
                          <strong className="text-gray-800 font-mono font-bold">
                            {details.shippingFee.toLocaleString('vi-VN')} đ
                          </strong>
                        </div>
                      )}
                    </>
                  )}

                  <div className="flex justify-between items-baseline border-t border-gray-200 pt-3 mt-1">
                    <span className="font-bold text-[#131829] uppercase text-[10px] tracking-wider">Tổng cộng:</span>
                    <span className="text-base font-bold text-accent font-mono">
                      {selectedOrder.totalAmount.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4.5 border-t border-gray-200 text-right shrink-0">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="bg-[#131829] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl transition-all cursor-pointer"
                >
                  Đóng cửa sổ
                </button>
              </div>

            </div>
          </div>
        )
      })()}

      {/* MODAL 4: UPDATE DEBT (SỬA CÔNG NỢ B2B NHANH) */}
      {showDebtModal && debtOrder && (
        <div className="fixed inset-0 bg-[#131829]/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50">
              <h3 className="font-playfair font-bold text-base text-[#131829]">Cập Nhật Công Nợ B2B</h3>
              <button 
                onClick={() => setShowDebtModal(false)} 
                className="text-gray-400 hover:text-gray-600 bg-white border border-gray-200 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleUpdateDebt} className="p-5 space-y-4">
              <div className="text-xs text-gray-500 mb-4 space-y-1">
                <p>Mã đơn: <span className="font-bold text-gray-800">#{debtOrder.id.substring(debtOrder.id.length - 8).toUpperCase()}</span></p>
                <p>Tổng tiền B2B: <span className="font-bold text-accent">{debtOrder.totalAmount.toLocaleString('vi-VN')} đ</span></p>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Số tiền khách đã thanh toán</label>
                <input
                  type="number"
                  min={0}
                  max={debtOrder.totalAmount}
                  required
                  value={paidAmountInput}
                  onChange={e => setPaidAmountInput(Number(e.target.value))}
                  className="w-full border border-gray-200 px-3.5 py-2.5 rounded-xl text-sm focus:outline-none focus:border-accent font-bold text-gray-800"
                />
                <p className="text-[11px] text-gray-400 mt-1.5">
                  Còn nợ lại: <span className="font-bold text-red-500">{Math.max(0, debtOrder.totalAmount - paidAmountInput).toLocaleString('vi-VN')} đ</span>
                </p>
              </div>

              <div className="pt-4 flex gap-3 text-xs">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="flex-1 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 cursor-pointer text-gray-500 text-center"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-500/50 text-white font-bold rounded-xl flex justify-center items-center gap-1 cursor-pointer transition-colors shadow-sm shadow-emerald-500/10"
                >
                  {isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Lưu công nợ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
