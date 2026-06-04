'use client'

import React, { useState, useTransition } from 'react'
import { 
  Search, Eye, UserPlus, FileText, ShoppingBag, Plus, Trash2, 
  Tag, Calendar, Phone, Mail, MapPin, Building, Percent, 
  AlertCircle, CheckCircle, Edit, DollarSign, X, ArrowRight, ShieldAlert,
  Loader2
} from 'lucide-react'
import { 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '@/lib/actions/customer.actions'
import { createB2BOrder } from '@/lib/actions/order.actions'

interface Customer {
  id: string
  name: string
  phone: string
  email: string | null
  companyName: string | null
  address: string | null
  taxCode: string | null
  customerType: string
  createdAt: Date
  _count: {
    orders: number
    inquiries: number
  }
}

interface Product {
  id: string
  sku: string | null
  name: string
  price: number
  stockQuantity: number
}

interface CustomersClientProps {
  initialCustomers: Customer[]
  products: Product[]
}

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  RETAIL_LEAD: { label: 'Lead Bán Lẻ', color: 'bg-red-50 text-red-700 border-red-200' },
  RETAIL_BUYER: { label: 'Khách Lẻ', color: 'bg-stone-100 text-stone-700 border-stone-200' },
  B2B_LEAD: { label: 'Lead B2B', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  B2B_WHOLESALE: { label: 'B2B Nhập Sỉ', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  B2B_CONSIGNMENT: { label: 'B2B Ký Gửi', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  B2B_GIFT: { label: 'B2B Quà Tặng', color: 'bg-blue-50 text-blue-700 border-blue-200' }
}

export default function CustomersClient({ initialCustomers, products }: CustomersClientProps) {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [isPending, startTransition] = useTransition()

  // Modals state
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [selectedCustomerDetails, setSelectedCustomerDetails] = useState<any | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showB2bOrderModal, setShowB2bOrderModal] = useState(false)

  // Notes state
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [newNote, setNewNote] = useState('')

  // Debt state
  const [showDebtModal, setShowDebtModal] = useState(false)
  const [debtOrder, setDebtOrder] = useState<any>(null)
  const [paidAmountInput, setPaidAmountInput] = useState(0)

  // Form states
  const [customerForm, setCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    companyName: '',
    address: '',
    taxCode: '',
    customerType: 'B2B_LEAD'
  })

  const [b2bOrderForm, setB2bOrderForm] = useState({
    orderType: 'B2B_WHOLESALE' as 'B2B_CONSIGNMENT' | 'B2B_GIFT' | 'B2B_WHOLESALE',
    discount: 0,
    note: '',
    paymentStatus: false,
    paidAmount: 0,
    items: [] as { productId: string; quantity: number; priceAtPurchase: number; originalPrice: number }[]
  })

  // B2b custom items state helpers
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('')
  const [customPriceToAdd, setCustomPriceToAdd] = useState(0)
  const [qtyToAdd, setQtyToAdd] = useState(1)

  // Fetch full details of a customer
  const handleViewDetails = async (id: string) => {
    setSelectedCustomerId(id)
    setIsLoadingDetails(true)
    try {
      const { getCustomerDetails } = await import('@/lib/actions/customer.actions')
      const result = await getCustomerDetails(id)
      if (result.success) {
        setSelectedCustomerDetails(result.data)
      } else {
        alert(result.error)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId || !newNote.trim()) return

    startTransition(async () => {
      const { addCustomerNote } = await import('@/lib/actions/customer.actions')
      const result = await addCustomerNote(selectedCustomerId, newNote)
      if (result.success) {
        setNewNote('')
        setShowNoteForm(false)
        handleViewDetails(selectedCustomerId)
      } else {
        alert(result.error)
      }
    })
  }

  const openDebtModal = (order: any) => {
    setDebtOrder(order)
    setPaidAmountInput(order.paidAmount || 0)
    setShowDebtModal(true)
  }

  const handleUpdateDebt = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!debtOrder) return

    startTransition(async () => {
      const { updateOrderDebt } = await import('@/lib/actions/order.actions')
      const result = await updateOrderDebt(debtOrder.id, paidAmountInput)
      if (result.success) {
        setShowDebtModal(false)
        if (selectedCustomerId) handleViewDetails(selectedCustomerId)
      } else {
        alert(result.error)
      }
    })
  }

  // Handle customer create
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!customerForm.name || !customerForm.phone) {
      alert('Vui lòng điền tên và số điện thoại')
      return
    }

    startTransition(async () => {
      const result = await createCustomer({
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email || null,
        companyName: customerForm.companyName || null,
        address: customerForm.address || null,
        taxCode: customerForm.taxCode || null,
        customerType: customerForm.customerType as any
      })

      if (result.success && result.data) {
        // Cập nhật local state
        const newCust: Customer = {
          id: result.data.id,
          name: result.data.name,
          phone: result.data.phone,
          email: result.data.email,
          companyName: result.data.companyName,
          address: result.data.address,
          taxCode: result.data.taxCode,
          customerType: result.data.customerType,
          createdAt: result.data.createdAt,
          _count: { orders: 0, inquiries: 0 }
        }
        setCustomers([newCust, ...customers])
        setShowAddModal(false)
        setCustomerForm({
          name: '',
          phone: '',
          email: '',
          companyName: '',
          address: '',
          taxCode: '',
          customerType: 'B2B_LEAD'
        })
      } else {
        alert(result.error)
      }
    })
  }

  // Handle Edit customer
  const handleEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerId) return

    startTransition(async () => {
      const result = await updateCustomer(selectedCustomerId, {
        name: customerForm.name,
        phone: customerForm.phone,
        email: customerForm.email || null,
        companyName: customerForm.companyName || null,
        address: customerForm.address || null,
        taxCode: customerForm.taxCode || null,
        customerType: customerForm.customerType as any
      })

      if (result.success && result.data) {
        setCustomers(customers.map(c => c.id === selectedCustomerId ? { ...c, ...result.data } : c))
        setShowEditModal(false)
        handleViewDetails(selectedCustomerId) // Refresh details view
      } else {
        alert(result.error)
      }
    })
  }

  // Open edit modal
  const openEditModal = (c: any) => {
    setCustomerForm({
      name: c.name || '',
      phone: c.phone || '',
      email: c.email || '',
      companyName: c.companyName || '',
      address: c.address || '',
      taxCode: c.taxCode || '',
      customerType: c.customerType || 'B2B_LEAD'
    })
    setShowEditModal(true)
  }

  // Delete customer
  const handleDeleteCustomer = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xoá khách hàng này khỏi CRM? Lịch sử mua hàng vẫn được giữ nguyên.')) return
    
    startTransition(async () => {
      const result = await deleteCustomer(id)
      if (result.success) {
        setCustomers(customers.filter(c => c.id !== id))
        setSelectedCustomerId(null)
        setSelectedCustomerDetails(null)
      } else {
        alert(result.error)
      }
    })
  }

  // Add Item to manual B2B Order
  const handleAddItemToOrder = () => {
    if (!selectedProductToAdd) return
    const prod = products.find(p => p.id === selectedProductToAdd)
    if (!prod) return

    // Check if already in list
    const existing = b2bOrderForm.items.find(item => item.productId === prod.id)
    if (existing) {
      alert('Sản phẩm này đã được thêm vào đơn hàng.')
      return
    }

    setB2bOrderForm({
      ...b2bOrderForm,
      items: [
        ...b2bOrderForm.items,
        {
          productId: prod.id,
          quantity: qtyToAdd,
          priceAtPurchase: customPriceToAdd || prod.price,
          originalPrice: prod.price
        }
      ]
    })

    // Reset fields
    setSelectedProductToAdd('')
    setCustomPriceToAdd(0)
    setQtyToAdd(1)
  }

  // Remove Item from manual B2B Order
  const handleRemoveItemFromOrder = (productId: string) => {
    setB2bOrderForm({
      ...b2bOrderForm,
      items: b2bOrderForm.items.filter(item => item.productId !== productId)
    })
  }

  // Submit B2B Order
  const handleSubmitB2BOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCustomerDetails) return
    if (b2bOrderForm.items.length === 0) {
      alert('Vui lòng thêm ít nhất 1 sản phẩm vào đơn hàng B2B')
      return
    }

    startTransition(async () => {
      const subtotal = b2bOrderForm.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
      const discountAmount = Math.round((subtotal * (b2bOrderForm.discount || 0)) / 100)

      const result = await createB2BOrder({
        customerId: selectedCustomerDetails.id,
        customerName: selectedCustomerDetails.name,
        phone: selectedCustomerDetails.phone,
        email: selectedCustomerDetails.email || undefined,
        companyName: selectedCustomerDetails.companyName || undefined,
        address: selectedCustomerDetails.address || undefined,
        orderType: b2bOrderForm.orderType,
        items: b2bOrderForm.items,
        discount: discountAmount,
        note: b2bOrderForm.note || undefined,
        paidAmount: b2bOrderForm.paidAmount
      } as any)

      if (result.success) {
        alert('Đã tạo đơn hàng B2B thành công!')
        setShowB2bOrderModal(false)
        // Refresh details to see new order
        handleViewDetails(selectedCustomerDetails.id)
        
        // Cập nhật lại tag khách hàng hiển thị ngoài list chính
        setCustomers(customers.map(c => 
          c.id === selectedCustomerDetails.id 
            ? { ...c, customerType: b2bOrderForm.orderType } 
            : c
        ))

        // Reset order form
        setB2bOrderForm({
          orderType: 'B2B_WHOLESALE',
          discount: 0,
          note: '',
          paymentStatus: false,
          paidAmount: 0,
          items: []
        })
      } else {
        alert(result.error)
      }
    })
  }

  // Filter & Search Logic
  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesType = typeFilter ? c.customerType === typeFilter : true

    return matchesSearch && matchesType
  })

  // Statistics
  const totalCount = customers.length
  const b2bCount = customers.filter(c => c.customerType.startsWith('B2B')).length
  const retailCount = totalCount - b2bCount

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-playfair font-bold text-primary">CRM Quản Lý Khách Hàng</h1>
          <p className="text-sm text-secondary mt-1">Lưu trữ Lead, Khách lẻ vãng lai, và phân loại dữ liệu B2B chuyên sâu.</p>
        </div>
        
        <button
          onClick={() => {
            setCustomerForm({
              name: '',
              phone: '',
              email: '',
              companyName: '',
              address: '',
              taxCode: '',
              customerType: 'B2B_LEAD'
            })
            setShowAddModal(true)
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-canvas font-semibold rounded-2 transition-all cursor-pointer shadow-sm text-sm"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm khách B2B thủ công</span>
        </button>
      </div>

      {/* CRM Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="bg-canvas border border-border/40 p-6 rounded-3 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center text-primary">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-secondary font-bold block uppercase tracking-wider">Tổng Hồ Sơ CRM</span>
            <span className="text-2xl font-playfair font-bold text-primary">{totalCount}</span>
          </div>
        </div>

        <div className="bg-canvas border border-border/40 p-6 rounded-3 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-secondary font-bold block uppercase tracking-wider">Khách buôn & B2B Leads</span>
            <span className="text-2xl font-playfair font-bold text-emerald-700">{b2bCount}</span>
          </div>
        </div>

        <div className="bg-canvas border border-border/40 p-6 rounded-3 shadow-xs flex items-center gap-5">
          <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center text-orange-700">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-secondary font-bold block uppercase tracking-wider">Khách lẻ mua tự động</span>
            <span className="text-2xl font-playfair font-bold text-orange-700">{retailCount}</span>
          </div>
        </div>

      </div>

      {/* Grid Layout: Main Customers Table + Details Sidepanel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Main List Grid */}
        <div className="bg-canvas border border-border/40 rounded-3 shadow-xs overflow-hidden lg:col-span-8">
          
          {/* Controls Bar */}
          <div className="p-5 border-b border-border/40 flex flex-col md:flex-row gap-4 justify-between">
            
            <div className="relative flex-grow max-w-md">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-secondary">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Tìm khách theo Tên, SĐT, Email, Công ty..."
                className="w-full pl-10 pr-4 py-2 border border-border/40 rounded-2 text-sm focus:outline-hidden focus:border-accent bg-[#FAF7F2]/50 focus:bg-canvas transition-all"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-secondary font-bold">Lọc tệp khách:</span>
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="border border-border/40 px-3 py-1.5 rounded-2 text-xs font-semibold focus:outline-hidden bg-canvas"
              >
                <option value="">Tất cả phân loại</option>
                <option value="RETAIL_LEAD">Lead Bán Lẻ (Nháp)</option>
                <option value="RETAIL_BUYER">Khách Lẻ (Đã mua)</option>
                <option value="B2B_LEAD">Lead B2B (Mới liên hệ)</option>
                <option value="B2B_WHOLESALE">B2B Nhập Sỉ</option>
                <option value="B2B_CONSIGNMENT">B2B Ký Gửi</option>
                <option value="B2B_GIFT">B2B Quà Tặng</option>
              </select>
            </div>

          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF7F2] text-xs font-bold text-secondary uppercase tracking-wider border-b border-border/30">
                  <th className="py-4 px-6">Khách hàng</th>
                  <th className="py-4 px-6">Liên hệ</th>
                  <th className="py-4 px-6 text-center">Phân loại</th>
                  <th className="py-4 px-6 text-center">Đơn/Tư vấn</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {filteredCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-secondary text-sm">
                      Không tìm thấy khách hàng nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                ) : (
                  filteredCustomers.map(c => {
                    const tag = TYPE_LABELS[c.customerType] || { label: c.customerType, color: 'bg-stone-100 text-stone-700 border-stone-200' }
                    return (
                      <tr 
                        key={c.id} 
                        className={`hover:bg-[#FAF7F2]/40 transition-all cursor-pointer text-sm ${selectedCustomerId === c.id ? 'bg-[#FAF7F2]' : ''}`}
                        onClick={() => handleViewDetails(c.id)}
                      >
                        <td className="py-4 px-6">
                          <div>
                            <span className="font-bold text-primary block">{c.name}</span>
                            {c.companyName && (
                              <span className="text-xs text-secondary flex items-center gap-1 mt-0.5">
                                <Building className="w-3 h-3 shrink-0" />
                                <span>{c.companyName}</span>
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="space-y-0.5 text-xs text-secondary">
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                              <span>{c.phone}</span>
                            </div>
                            {c.email && (
                              <div className="flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 shrink-0" />
                                <span>{c.email}</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold border ${tag.color}`}>
                            {tag.label}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2.5">
                            <span className="text-xs font-semibold bg-primary/5 border border-border/40 px-2 py-0.5 rounded-2" title="Số đơn hàng">
                              📦 {c._count.orders}
                            </span>
                            <span className="text-xs font-semibold bg-accent/5 border border-border/40 px-2 py-0.5 rounded-2" title="Số đơn tư vấn B2B">
                              💬 {c._count.inquiries}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => handleViewDetails(c.id)}
                            className="p-2 text-primary hover:text-accent rounded-2 hover:bg-subtle/10 transition-all"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

        </div>

        {/* Side Panel: Profile details & History */}
        <div className="lg:col-span-4 bg-canvas border border-border/40 rounded-3 shadow-xs p-6 sticky top-6">
          {!selectedCustomerId ? (
            <div className="py-20 text-center text-secondary">
              <UserPlus className="w-12 h-12 text-border mx-auto mb-3" />
              <p className="text-sm font-semibold">Chưa chọn khách hàng</p>
              <p className="text-xs mt-1">Nhấp vào một khách hàng trong bảng bên trái để xem đầy đủ hồ sơ CRM, lịch sử đơn hàng & tư vấn.</p>
            </div>
          ) : isLoadingDetails ? (
            <div className="py-20 text-center text-accent">
              <Loader2 className="w-10 h-10 animate-spin mx-auto mb-3" />
              <p className="text-sm font-semibold">Đang tải hồ sơ...</p>
            </div>
          ) : selectedCustomerDetails ? (
            <div className="space-y-6">
              
              {/* Profile Card Summary */}
              <div className="pb-5 border-b border-border/40">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-playfair font-bold text-primary">{selectedCustomerDetails.name}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border mt-1.5 ${TYPE_LABELS[selectedCustomerDetails.customerType]?.color}`}>
                      {TYPE_LABELS[selectedCustomerDetails.customerType]?.label}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(selectedCustomerDetails)}
                      className="p-1.5 text-secondary hover:text-accent rounded-2 hover:bg-subtle/10 transition-all"
                      title="Sửa thông tin"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCustomer(selectedCustomerDetails.id)}
                      className="p-1.5 text-red-500 hover:text-red-700 rounded-2 hover:bg-red-50 transition-all"
                      title="Xoá khách hàng"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-4 space-y-2.5 text-xs text-secondary">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="font-semibold text-primary">{selectedCustomerDetails.phone}</span>
                  </div>
                  {selectedCustomerDetails.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 shrink-0" />
                      <span>{selectedCustomerDetails.email}</span>
                    </div>
                  )}
                  {selectedCustomerDetails.companyName && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span>Công ty: <span className="font-semibold text-primary">{selectedCustomerDetails.companyName}</span></span>
                    </div>
                  )}
                  {selectedCustomerDetails.taxCode && (
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 shrink-0" />
                      <span>MST: <span className="font-mono text-primary font-semibold">{selectedCustomerDetails.taxCode}</span></span>
                    </div>
                  )}
                  {selectedCustomerDetails.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-red-400 mt-0.5" />
                      <span>{selectedCustomerDetails.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action for B2B (Chỉ hiện cho tệp khách B2B) */}
              {selectedCustomerDetails.customerType.startsWith('B2B') ? (
                <div className="bg-[#FAF7F2] p-4.5 rounded-3 border border-border/30">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                    <span>Xử lý đơn hàng buôn B2B</span>
                  </h4>
                  <p className="text-[11px] text-secondary leading-relaxed mb-3">
                    Bạn đã thương thảo chốt được đơn final với đối tác này? Hãy lên đơn B2B thủ công ngay tại đây để lưu trữ lịch sử và doanh thu.
                  </p>
                  <button
                    onClick={() => {
                      setB2bOrderForm({
                        orderType: selectedCustomerDetails.customerType.startsWith('B2B') && selectedCustomerDetails.customerType !== 'B2B_LEAD' 
                          ? selectedCustomerDetails.customerType 
                          : 'B2B_WHOLESALE',
                        discount: 0,
                        note: '',
                        paymentStatus: false,
                        paidAmount: 0,
                        items: []
                      })
                      setShowB2bOrderModal(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary-hover text-canvas text-xs font-semibold rounded-2 transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Lên đơn B2B thủ công</span>
                  </button>
                </div>
              ) : (
                <div className="bg-[#FAF7F2] p-4.5 rounded-3 border border-border/30">
                  <h4 className="text-xs font-bold text-secondary uppercase tracking-wider flex items-center gap-1.5 mb-2.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-accent" />
                    <span>Nâng cấp Đối tác B2B</span>
                  </h4>
                  <p className="text-[11px] text-secondary leading-relaxed mb-3">
                    Khách lẻ này muốn hợp tác lâu dài? Hãy mở khoá tính năng tạo đơn B2B.
                  </p>
                  <button
                    onClick={() => {
                      setB2bOrderForm({
                        orderType: 'B2B_WHOLESALE',
                        discount: 0,
                        note: '',
                        paymentStatus: false,
                        paidAmount: 0,
                        items: []
                      })
                      setShowB2bOrderModal(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-primary hover:bg-primary-hover text-canvas text-xs font-semibold rounded-2 transition-all cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Nâng cấp & Lên đơn B2B</span>
                  </button>
                </div>
              )}

              {/* Purchase History */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Lịch sử Đơn hàng ({selectedCustomerDetails.orders?.length || 0})
                </h4>
                
                {selectedCustomerDetails.orders?.length === 0 ? (
                  <p className="text-xs text-secondary italic">Chưa có đơn hàng nào.</p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedCustomerDetails.orders.map((o: any) => (
                      <div key={o.id} className="p-3 border border-border/30 rounded-2 text-xs hover:border-accent transition-all">
                        <div className="flex justify-between items-center font-semibold mb-1">
                          <span className="text-primary">Mã: #{o.id.substring(o.id.length - 8).toUpperCase()}</span>
                          <span className="text-accent">{o.totalAmount.toLocaleString('vi-VN')} đ</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-secondary">
                          <span>{new Date(o.createdAt).toLocaleDateString('vi-VN')}</span>
                          <span className="font-bold uppercase tracking-wider">{o.orderType}</span>
                        </div>
                        {o.orderType.startsWith('B2B') && (
                          <div className="flex justify-between items-center text-[10px] mt-2 mb-1 bg-stone-50 p-2 rounded-2 border border-border/30">
                            <span className="text-secondary">Đã trả: <span className="font-bold text-emerald-600">{o.paidAmount?.toLocaleString('vi-VN') || 0} đ</span></span>
                            <span className="text-secondary">Nợ: <span className="font-bold text-red-500">{o.debtAmount?.toLocaleString('vi-VN') || 0} đ</span></span>
                            <button onClick={(e) => { e.stopPropagation(); openDebtModal(o); }} className="text-accent font-bold hover:underline cursor-pointer">Sửa nợ</button>
                          </div>
                        )}
                        {o.note && (
                          <div className="bg-[#FAF7F2] p-1.5 rounded-1 text-[10px] text-secondary mt-1.5 italic">
                            {o.note}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Consultation Inquiries History */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">
                  Yêu cầu tư vấn gốm ({selectedCustomerDetails.inquiries?.length || 0})
                </h4>
                
                {selectedCustomerDetails.inquiries?.length === 0 ? (
                  <p className="text-xs text-secondary italic">Chưa gửi form tư vấn nào.</p>
                ) : (
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedCustomerDetails.inquiries.map((i: any) => (
                      <div key={i.id} className="p-3 border border-border/30 rounded-2 text-xs hover:border-accent transition-all bg-[#FAF7F2]/50">
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-primary">💬 SL: {i.quantity} chiếc</span>
                          <span className={`inline-block px-1.5 py-0.5 rounded-pill text-[9px] font-bold ${
                            i.status === 'CONVERTED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                          }`}>
                            {i.status}
                          </span>
                        </div>
                        {i.product && (
                          <p className="text-[10px] text-secondary font-medium">Mã SP: {i.product.name} ({i.product.sku || 'N/A'})</p>
                        )}
                        {i.source && (
                          <p className="text-[10px] text-secondary italic">Nguồn: {i.source}</p>
                        )}
                        {i.note && (
                          <p className="text-[10px] text-stone-600 bg-canvas p-1.5 rounded border border-border/20 mt-1">{i.note}</p>
                        )}
                        <p className="text-[9px] text-secondary text-right mt-1">{new Date(i.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : null}
        </div>

      </div>

      {/* MODAL 1: ADD CUSTOMER B2B */}
      {showAddModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-border/40 rounded-3 max-w-md w-full shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-border/40 flex justify-between items-center bg-[#FAF7F2]">
              <h3 className="font-playfair font-bold text-lg text-primary">Thêm Đối Tác B2B Thủ Công</h3>
              <button onClick={() => setShowAddModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCustomer} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tên đối tác / Đại lý *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  placeholder="Ví dụ: Công ty Quà tặng ABC, Đại lý Gốm sứ Minh Anh..."
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    placeholder="SĐT liên hệ chính"
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                    placeholder="đại_lý@gmail.com"
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tên công ty (nếu có)</label>
                  <input
                    type="text"
                    value={customerForm.companyName}
                    onChange={e => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                    placeholder="Công ty CP..."
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Mã số thuế</label>
                  <input
                    type="text"
                    value={customerForm.taxCode}
                    onChange={e => setCustomerForm({ ...customerForm, taxCode: e.target.value })}
                    placeholder="Mã số thuế"
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Địa chỉ giao dịch, nhận hàng..."
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Phân loại B2B ban đầu</label>
                <select
                  value={customerForm.customerType}
                  onChange={e => setCustomerForm({ ...customerForm, customerType: e.target.value })}
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent bg-canvas"
                >
                  <option value="B2B_LEAD">Lead B2B (Mới liên hệ)</option>
                  <option value="B2B_WHOLESALE">B2B Nhập Sỉ</option>
                  <option value="B2B_CONSIGNMENT">B2B Ký Gửi</option>
                  <option value="B2B_GIFT">B2B Quà Tặng (Hợp đồng thiết kế)</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-border/30 rounded-2 text-sm font-semibold hover:bg-subtle/5 transition-all cursor-pointer text-secondary text-center"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-canvas text-sm font-semibold rounded-2 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Thêm đối tác</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDIT CUSTOMER */}
      {showEditModal && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-border/40 rounded-3 max-w-md w-full shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-border/40 flex justify-between items-center bg-[#FAF7F2]">
              <h3 className="font-playfair font-bold text-lg text-primary">Sửa Thông Tin Hồ Sơ</h3>
              <button onClick={() => setShowEditModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleEditCustomer} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tên khách hàng / Đối tác *</label>
                <input
                  type="text"
                  required
                  value={customerForm.name}
                  onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })}
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Số điện thoại *</label>
                  <input
                    type="tel"
                    required
                    value={customerForm.phone}
                    onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })}
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Email</label>
                  <input
                    type="email"
                    value={customerForm.email}
                    onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })}
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tên công ty (nếu có)</label>
                  <input
                    type="text"
                    value={customerForm.companyName}
                    onChange={e => setCustomerForm({ ...customerForm, companyName: e.target.value })}
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Mã số thuế</label>
                  <input
                    type="text"
                    value={customerForm.taxCode}
                    onChange={e => setCustomerForm({ ...customerForm, taxCode: e.target.value })}
                    className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Địa chỉ</label>
                <input
                  type="text"
                  value={customerForm.address}
                  onChange={e => setCustomerForm({ ...customerForm, address: e.target.value })}
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Phân loại tệp khách</label>
                <select
                  value={customerForm.customerType}
                  onChange={e => setCustomerForm({ ...customerForm, customerType: e.target.value })}
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent bg-canvas"
                >
                  <option value="RETAIL_LEAD">Lead Bán Lẻ (Nháp)</option>
                  <option value="RETAIL_BUYER">Khách Lẻ (Đã mua lẻ)</option>
                  <option value="B2B_LEAD">Lead B2B (Mới liên hệ)</option>
                  <option value="B2B_WHOLESALE">B2B Nhập Sỉ</option>
                  <option value="B2B_CONSIGNMENT">B2B Ký Gửi</option>
                  <option value="B2B_GIFT">B2B Quà Tặng</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 py-2.5 border border-border/30 rounded-2 text-sm font-semibold hover:bg-subtle/5 transition-all cursor-pointer text-secondary text-center"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-canvas text-sm font-semibold rounded-2 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Lưu thay đổi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MANUAL B2B ORDER CREATION */}
      {showB2bOrderModal && selectedCustomerDetails && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-border/40 rounded-3 max-w-3xl w-full shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-border/40 flex justify-between items-center bg-[#FAF7F2]">
              <div>
                <h3 className="font-playfair font-bold text-lg text-primary">Tạo Đơn Hàng B2B Thủ Công</h3>
                <p className="text-xs text-secondary mt-0.5">Khách hàng: <span className="font-bold text-primary">{selectedCustomerDetails.name}</span> ({selectedCustomerDetails.phone})</p>
              </div>
              <button onClick={() => setShowB2bOrderModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitB2BOrder} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              
              {/* Order Settings Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Loại đơn hàng B2B *</label>
                  <select
                    value={b2bOrderForm.orderType}
                    onChange={e => setB2bOrderForm({ ...b2bOrderForm, orderType: e.target.value as any })}
                    className="w-full border border-border/40 px-3 py-2 rounded-2 text-sm focus:outline-hidden focus:border-accent bg-canvas"
                  >
                    <option value="B2B_WHOLESALE">Nhập sỉ sll</option>
                    <option value="B2B_CONSIGNMENT">Ký gửi hàng hoá</option>
                    <option value="B2B_GIFT">Quà tặng (Thiết kế riêng)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Chiết khấu thêm (%)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={b2bOrderForm.discount}
                    onChange={e => setB2bOrderForm({ ...b2bOrderForm, discount: Number(e.target.value) })}
                    placeholder="Ví dụ: 10%"
                    className="w-full border border-border/40 px-3 py-2 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Trạng thái thanh toán</label>
                  <div className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="b2bPaymentStatus"
                      checked={b2bOrderForm.paymentStatus}
                      onChange={e => {
                        const isPaid = e.target.checked
                        // Tự động set paidAmount = tổng tiền nếu check full
                        setB2bOrderForm(prev => {
                          const subtotal = prev.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
                          const total = Math.max(0, subtotal - (prev.discount || 0))
                          return { 
                            ...prev, 
                            paymentStatus: isPaid,
                            paidAmount: isPaid ? total : 0
                          }
                        })
                      }}
                      className="w-4 h-4 accent-accent"
                    />
                    <label htmlFor="b2bPaymentStatus" className="text-sm font-semibold text-primary cursor-pointer select-none">
                      Đã thanh toán (Paid 100%)
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Tiền Đã Trả (Công nợ)</label>
                  <input
                    type="number"
                    min={0}
                    value={b2bOrderForm.paidAmount}
                    onChange={e => {
                      const amount = Number(e.target.value)
                      setB2bOrderForm(prev => {
                        const subtotal = prev.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
                        const total = Math.max(0, subtotal - (prev.discount || 0))
                        return { 
                          ...prev, 
                          paidAmount: amount,
                          paymentStatus: amount >= total && total > 0
                        }
                      })
                    }}
                    placeholder="Nhập số tiền khách cọc/đã trả"
                    className="w-full border border-border/40 px-3 py-2 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              {/* Product Select Box */}
              <div className="bg-[#FAF7F2] p-4.5 rounded-3 border border-border/30 space-y-4">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Thêm sản phẩm vào đơn</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Chọn sản phẩm</label>
                    <select
                      value={selectedProductToAdd}
                      onChange={e => {
                        setSelectedProductToAdd(e.target.value)
                        const p = products.find(prod => prod.id === e.target.value)
                        setCustomPriceToAdd(p ? p.price : 0)
                      }}
                      className="w-full border border-border/40 px-3 py-2 rounded-2 text-xs focus:outline-hidden bg-canvas"
                    >
                      <option value="">-- Chọn sản phẩm có sẵn/ẩn --</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} {p.sku ? `(${p.sku})` : ''} - {p.price.toLocaleString('vi-VN')} đ (Tồn: {p.stockQuantity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Giá chốt bán (đ)</label>
                    <input
                      type="number"
                      value={customPriceToAdd}
                      onChange={e => setCustomPriceToAdd(Number(e.target.value))}
                      placeholder="Giá chốt"
                      className="w-full border border-border/40 px-3 py-2 rounded-2 text-xs focus:outline-hidden bg-canvas"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-secondary uppercase mb-1">Số lượng</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={1}
                        value={qtyToAdd}
                        onChange={e => setQtyToAdd(Number(e.target.value))}
                        className="w-full border border-border/40 px-3 py-2 rounded-2 text-xs focus:outline-hidden text-center bg-canvas"
                      />
                      <button
                        type="button"
                        onClick={handleAddItemToOrder}
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-canvas font-semibold rounded-2 text-xs cursor-pointer whitespace-nowrap"
                      >
                        Thêm
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List in current creating Order */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-secondary uppercase tracking-wider">Danh sách sản phẩm trong đơn</h4>
                
                {b2bOrderForm.items.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-border/40 rounded-3 text-secondary text-xs italic">
                    Chưa có sản phẩm nào. Vui lòng chọn và nhấn nút Thêm phía trên.
                  </div>
                ) : (
                  <div className="border border-border/40 rounded-3 overflow-hidden">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-[#FAF7F2] font-bold text-secondary uppercase border-b border-border/40">
                          <th className="py-2.5 px-4">Sản phẩm</th>
                          <th className="py-2.5 px-4 text-center">Gốc</th>
                          <th className="py-2.5 px-4 text-center">Giá Bán B2B</th>
                          <th className="py-2.5 px-4 text-center">Số lượng</th>
                          <th className="py-2.5 px-4 text-right">Tổng cộng</th>
                          <th className="py-2.5 px-4 text-center">Xoá</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/20">
                        {b2bOrderForm.items.map(item => {
                          const prod = products.find(p => p.id === item.productId)
                          return (
                            <tr key={item.productId} className="hover:bg-canvas">
                              <td className="py-3 px-4 font-semibold text-primary">{prod?.name || 'N/A'}</td>
                              <td className="py-3 px-4 text-center text-secondary">{item.originalPrice.toLocaleString('vi-VN')} đ</td>
                              <td className="py-3 px-4 text-center font-semibold text-accent">{item.priceAtPurchase.toLocaleString('vi-VN')} đ</td>
                              <td className="py-3 px-4 text-center font-bold text-primary">{item.quantity}</td>
                              <td className="py-3 px-4 text-right font-bold text-primary">{(item.priceAtPurchase * item.quantity).toLocaleString('vi-VN')} đ</td>
                              <td className="py-3 px-4 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItemFromOrder(item.productId)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

              {/* Internal Order Note */}
              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Ghi chú đơn hàng (nội bộ)</label>
                <textarea
                  rows={2}
                  value={b2bOrderForm.note}
                  onChange={e => setB2bOrderForm({ ...b2bOrderForm, note: e.target.value })}
                  placeholder="Ghi chú chiết khấu, điều khoản ký gửi, yêu cầu thiết kế quà tặng..."
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent"
                />
              </div>

              {/* Total calculations */}
              {(() => {
                const subtotal = b2bOrderForm.items.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0)
                const discountAmount = Math.round((subtotal * (b2bOrderForm.discount || 0)) / 100)
                const totalAmount = Math.max(0, subtotal - discountAmount)
                return (
                  <div className="pt-4 border-t border-border/40 flex justify-between items-center bg-[#FAF7F2]/50 p-4 rounded-3">
                    <div className="text-xs text-secondary space-y-1">
                      <div>Tạm tính: <span className="font-bold text-primary">{subtotal.toLocaleString('vi-VN')} đ</span></div>
                      <div>Chiết khấu đơn ({b2bOrderForm.discount}%): <span className="font-bold text-accent">-{discountAmount.toLocaleString('vi-VN')} đ</span></div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-secondary uppercase font-bold block">Tổng tiền đơn B2B:</span>
                      <span className="text-xl font-playfair font-bold text-accent">
                        {totalAmount.toLocaleString('vi-VN')} đ
                      </span>
                    </div>
                  </div>
                )
              })()}

              {/* Submit Buttons */}
              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setShowB2bOrderModal(false)}
                  className="flex-1 py-3 border border-border/30 rounded-2 text-sm font-semibold hover:bg-subtle/5 transition-all cursor-pointer text-secondary text-center"
                >
                  Huỷ bỏ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-3 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-canvas text-sm font-semibold rounded-2 transition-all flex items-center justify-center gap-1 cursor-pointer"
                >
                  {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Xác nhận & Tạo Đơn B2B</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: UPDATE DEBT */}
      {showDebtModal && debtOrder && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-canvas border border-border/40 rounded-3 max-w-sm w-full shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-border/40 flex justify-between items-center bg-[#FAF7F2]">
              <h3 className="font-playfair font-bold text-lg text-primary">Cập Nhật Công Nợ</h3>
              <button onClick={() => setShowDebtModal(false)} className="text-secondary hover:text-primary">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateDebt} className="p-5 space-y-4">
              <div className="text-xs text-secondary mb-4 space-y-1">
                <p>Mã đơn: <span className="font-bold text-primary">#{debtOrder.id.substring(debtOrder.id.length - 8).toUpperCase()}</span></p>
                <p>Tổng tiền B2B: <span className="font-bold text-accent">{debtOrder.totalAmount.toLocaleString('vi-VN')} đ</span></p>
              </div>

              <div>
                <label className="block text-xs font-bold text-secondary uppercase mb-1.5">Số tiền khách đã thanh toán</label>
                <input
                  type="number"
                  min={0}
                  max={debtOrder.totalAmount}
                  required
                  value={paidAmountInput}
                  onChange={e => setPaidAmountInput(Number(e.target.value))}
                  className="w-full border border-border/40 px-3.5 py-2.5 rounded-2 text-sm focus:outline-hidden focus:border-accent font-bold text-primary"
                />
                <p className="text-[11px] text-secondary mt-1.5">
                  Còn nợ lại: <span className="font-bold text-red-500">{Math.max(0, debtOrder.totalAmount - paidAmountInput).toLocaleString('vi-VN')} đ</span>
                </p>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowDebtModal(false)}
                  className="flex-1 py-2.5 border border-border/30 rounded-2 text-sm font-semibold hover:bg-subtle/5 cursor-pointer text-secondary"
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-canvas text-sm font-semibold rounded-2 flex justify-center cursor-pointer"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Lưu công nợ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
