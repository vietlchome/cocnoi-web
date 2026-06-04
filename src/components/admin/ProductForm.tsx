'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Upload, X, Loader2, ArrowLeft, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import RichTextEditor from '@/components/admin/RichTextEditor'
import { createProduct, updateProduct, createProductGroup, createColorOption, createSizeOption } from '@/lib/actions/product.actions'

interface Category {
  id: string
  name: string
}

interface ColorOption {
  id: string
  name: string
  hex: string
}

interface SizeOption {
  id: string
  name: string
  categoryId: string
}

interface ProductGroup {
  id: string
  name: string
  slug: string
}

interface InitialProduct {
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
  categoryId: string | null
  productGroupId?: string | null
  colorId?: string | null
  sizeId?: string | null
  visibility?: string | null
}

interface ProductFormProps {
  categories: Category[]
  productGroups: ProductGroup[]
  colors: ColorOption[]
  sizes: SizeOption[]
  initialProduct?: InitialProduct | null // Null nếu là form Tạo mới
}

export default function ProductForm({ 
  categories, 
  productGroups = [], 
  colors = [], 
  sizes = [], 
  initialProduct = null 
}: ProductFormProps) {
  const router = useRouter()
  const isEditMode = !!initialProduct

  // 1. Khởi tạo State của Form
  const [sku, setSku] = useState(initialProduct?.sku || '')
  const [name, setName] = useState(initialProduct?.name || '')
  const [shortDescription, setShortDescription] = useState(initialProduct?.shortDescription || '')
  const [price, setPrice] = useState<number>(initialProduct?.price || 0)
  const [compareAtPrice, setCompareAtPrice] = useState<number | ''>(initialProduct?.compareAtPrice || '')
  const [stockQuantity, setStockQuantity] = useState<number>(initialProduct?.stockQuantity || 0)
  const [weight, setWeight] = useState<number>(initialProduct?.weight || 0)
  const [description, setDescription] = useState(initialProduct?.description || '')
  const [categoryId, setCategoryId] = useState<string>(initialProduct?.categoryId || '')
  const [visibility, setVisibility] = useState<string>((initialProduct as any)?.visibility || 'PUBLIC')
  
  // Relational options states
  const [productGroupId, setProductGroupId] = useState(initialProduct?.productGroupId || '')
  const [colorId, setColorId] = useState(initialProduct?.colorId || '')
  const [sizeId, setSizeId] = useState(initialProduct?.sizeId || '')

  // Local lists to support dynamic inline adding
  const [localProductGroups, setLocalProductGroups] = useState<ProductGroup[]>(productGroups)
  const [localColors, setLocalColors] = useState<ColorOption[]>(colors)
  const [localSizes, setLocalSizes] = useState<SizeOption[]>(sizes)

  // Expandable Quick Add states
  const [showNewGroupForm, setShowNewGroupForm] = useState(false)
  const [newGroupName, setNewGroupName] = useState('')
  const [addingGroup, setAddingGroup] = useState(false)

  const [showNewColorForm, setShowNewColorForm] = useState(false)
  const [newColorName, setNewColorName] = useState('')
  const [newColorHex, setNewColorHex] = useState('#FF0000')
  const [addingColor, setAddingColor] = useState(false)

  const [showNewSizeForm, setShowNewSizeForm] = useState(false)
  const [newSizeName, setNewSizeName] = useState('')
  const [addingSize, setAddingSize] = useState(false)

  // Khởi tạo ảnh
  let initialImages: string[] = []
  if (initialProduct?.images) {
    try {
      initialImages = JSON.parse(initialProduct.images)
    } catch (e) {}
  }
  const [images, setImages] = useState<string[]>(initialImages)

  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Quick Add handlers
  const handleAddProductGroup = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!newGroupName.trim()) return
    setAddingGroup(true)
    try {
      const res = await createProductGroup(newGroupName.trim())
      if (res.success && res.data) {
        const newGroup = res.data as ProductGroup
        setLocalProductGroups(prev => [...prev, newGroup])
        setProductGroupId(newGroup.id)
        setNewGroupName('')
        setShowNewGroupForm(false)
      } else {
        alert(res.error || 'Lỗi khi thêm bộ sưu tập')
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống')
    } finally {
      setAddingGroup(false)
    }
  }

  const handleAddColor = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!newColorName.trim()) return
    setAddingColor(true)
    try {
      const res = await createColorOption(newColorName.trim(), newColorHex)
      if (res.success && res.data) {
        const newColor = res.data as ColorOption
        setLocalColors(prev => [...prev, newColor])
        setColorId(newColor.id)
        setNewColorName('')
        setNewColorHex('#FF0000')
        setShowNewColorForm(false)
      } else {
        alert(res.error || 'Lỗi khi thêm màu sắc')
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống')
    } finally {
      setAddingColor(false)
    }
  }

  const handleAddSize = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!newSizeName.trim()) return
    if (!categoryId) {
      alert('Vui lòng chọn danh mục trước khi thêm kích cỡ!')
      return
    }
    setAddingSize(true)
    try {
      const res = await createSizeOption(newSizeName.trim(), categoryId)
      if (res.success && res.data) {
        const newSize = res.data as SizeOption
        setLocalSizes(prev => [...prev, newSize])
        setSizeId(newSize.id)
        setNewSizeName('')
        setShowNewSizeForm(false)
      } else {
        alert(res.error || 'Lỗi khi thêm kích cỡ')
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống')
    } finally {
      setAddingSize(false)
    }
  }

  // 2. Quản lý Hình Ảnh (Tối đa 6 ảnh)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const remainingSlots = 6 - images.length
    if (remainingSlots <= 0) {
      setError('Đã đạt giới hạn tối đa 6 hình ảnh.')
      return
    }

    const files = Array.from(e.target.files).slice(0, remainingSlots)
    setUploading(true)
    setError('')

    const formData = new FormData()
    files.forEach(file => {
      formData.append('file', file) // API mong đợi trường 'file' đơn lẻ
    })

    try {
      // Để hỗ trợ upload đồng thời, ta gọi tuần tự hoặc song song các request
      const uploadPromises = files.map(async (file) => {
        const singleFormData = new FormData()
        singleFormData.append('file', file)
        singleFormData.append('folder', 'products')
        
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: singleFormData
        })
        const data = await res.json()
        if (res.ok && data.success && data.url) {
          return data.url
        } else {
          throw new Error(data.error || 'Lỗi khi tải ảnh lên.')
        }
      })

      const urls = await Promise.all(uploadPromises)
      setImages(prev => [...prev, ...urls].slice(0, 6))
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối khi tải ảnh lên.')
    } finally {
      setUploading(false)
      e.target.value = '' // Reset file input
    }
  }

  const removeImage = (indexToRemove: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== indexToRemove))
  }

  // 3. Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    // Validate dữ liệu
    if (!name.trim()) return setError('Vui lòng nhập tên sản phẩm.')
    if (price <= 0) return setError('Giá sản phẩm phải lớn hơn 0.')
    if (!categoryId) return setError('Vui lòng chọn danh mục sản phẩm.')
    if (images.length === 0) return setError('Vui lòng tải lên ít nhất 1 hình ảnh sản phẩm.')
    if (stockQuantity < 0) return setError('Số lượng tồn kho không được nhỏ hơn 0.')

    setSubmitting(true)

    const productPayload = {
      sku: sku.trim() || null,
      name: name.trim(),
      description,
      shortDescription: shortDescription.trim() || null,
      price: Number(price),
      compareAtPrice: compareAtPrice ? Number(compareAtPrice) : null,
      weight: Number(weight),
      images,
      categoryId: categoryId || null,
      productGroupId: productGroupId || null,
      colorId: colorId || null,
      sizeId: sizeId || null,
      stockQuantity: Number(stockQuantity),
      visibility: visibility
    }

    try {
      if (isEditMode && initialProduct) {
        const res = await updateProduct(initialProduct.id, productPayload as any)
        if (res.success) {
          setSuccess('Cập nhật sản phẩm thành công!')
          setTimeout(() => {
            router.push('/admin/products')
            router.refresh()
          }, 1500)
        } else {
          setError(res.error || 'Lỗi khi cập nhật sản phẩm.')
        }
      } else {
        const res = await createProduct(productPayload as any)
        if (res.success) {
          setSuccess('Tạo sản phẩm mới thành công!')
          setTimeout(() => {
            router.push('/admin/products')
            router.refresh()
          }, 1500)
        } else {
          setError(res.error || 'Lỗi khi tạo sản phẩm.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống khi lưu trữ dữ liệu.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-bvp pb-12">
      
      {/* CỘT TRÁI: THÔNG TIN CHÍNH SẢN PHẨM (8 phần) */}
      <div className="lg:col-span-8 flex flex-col gap-6">
        
        {/* Khối Thông tin Cơ bản */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Tên sản phẩm *</label>
              <input
                type="text"
                placeholder="Ví dụ: Rue Mug - Mustard Yellow - Medium (Set of 2)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Mã sản phẩm (SKU)</label>
              <input
                type="text"
                placeholder="Ví dụ: CN-MUG-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono uppercase tracking-wider"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Trích dẫn / Mô tả ngắn (Dành cho SEO & Thẻ hiển thị nhanh)</label>
            <textarea
              placeholder="Nhập 2-3 câu trích dẫn mô tả mộc mạc về sản phẩm gốm..."
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              rows={2}
              className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Mô tả chi tiết sản phẩm</label>
            <RichTextEditor value={description} onChange={setDescription} />
          </div>
        </div>

        {/* Khối Bộ sưu tập & Liên kết (Flat Catalog) */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Phân loại & Bộ sưu tập</h3>
            <span className="text-[10px] text-gray-400 font-medium">Bắt buộc chọn màu sắc & kích cỡ để kích hoạt chấm màu liên kết.</span>
          </div>
          <p className="text-[11px] text-gray-500 dark:text-gray-400 -mt-2">
            Liên kết các phiên bản sản phẩm có chung kiểu dáng nhưng khác màu/cỡ bằng cách xếp chúng vào cùng một <b>Bộ sưu tập</b>.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. DANH MỤC TRỰC THUỘC */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-0.5 block">Danh mục trực thuộc *</label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value)
                  setSizeId('') // Reset size selection when category changes
                }}
                className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all cursor-pointer font-semibold"
                required
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {/* 2. BỘ SƯU TẬP */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Bộ sưu tập</label>
                <button
                  type="button"
                  onClick={() => setShowNewGroupForm(!showNewGroupForm)}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-0.5"
                >
                  <Plus size={10} /> Thêm mới
                </button>
              </div>
              
              {showNewGroupForm ? (
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-gray-800/80 flex flex-col gap-2 transition-all">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Tạo bộ sưu tập mới</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: Cốc Nối Ấm Nâu"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      className="w-full text-[11px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 px-2 py-1.5 rounded-lg text-gray-800 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddProductGroup}
                      disabled={addingGroup}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {addingGroup ? '...' : 'Tạo'}
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={productGroupId}
                  onChange={(e) => setProductGroupId(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="">-- Không chọn bộ sưu tập --</option>
                  {localProductGroups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 2. KÍCH CỠ */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Kích cỡ (Size)</label>
                {categoryId && (
                  <button
                    type="button"
                    onClick={() => setShowNewSizeForm(!showNewSizeForm)}
                    className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-0.5"
                  >
                    <Plus size={10} /> Thêm mới
                  </button>
                )}
              </div>

              {!categoryId ? (
                <select
                  disabled
                  className="w-full text-xs bg-gray-100 dark:bg-zinc-800/40 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-400 transition-all cursor-not-allowed"
                >
                  <option>-- Chọn danh mục trước --</option>
                </select>
              ) : showNewSizeForm ? (
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-gray-800/80 flex flex-col gap-2 transition-all">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thêm kích cỡ mới</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ví dụ: Medium, Large, 500ml"
                      value={newSizeName}
                      onChange={(e) => setNewSizeName(e.target.value)}
                      className="w-full text-[11px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 px-2 py-1.5 rounded-lg text-gray-800 dark:text-gray-100"
                    />
                    <button
                      type="button"
                      onClick={handleAddSize}
                      disabled={addingSize}
                      className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {addingSize ? '...' : 'Tạo'}
                    </button>
                  </div>
                </div>
              ) : (
                <select
                  value={sizeId}
                  onChange={(e) => setSizeId(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold cursor-pointer"
                >
                  <option value="">-- Chọn kích cỡ --</option>
                  {localSizes.filter(s => s.categoryId === categoryId).map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* 3. MÀU SẮC */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400">Màu sắc sản phẩm</label>
                <button
                  type="button"
                  onClick={() => setShowNewColorForm(!showNewColorForm)}
                  className="text-[10px] font-bold text-orange-500 hover:text-orange-600 transition-colors flex items-center gap-0.5"
                >
                  <Plus size={10} /> Thêm mới
                </button>
              </div>

              {showNewColorForm ? (
                <div className="p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl border border-gray-200 dark:border-gray-800/80 flex flex-col gap-2 transition-all">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Thêm màu sắc mới</span>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      placeholder="Tên màu (ví dụ: Nâu Đất Mộc)"
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className="w-full text-[11px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 px-2 py-1.5 rounded-lg text-gray-800 dark:text-gray-100"
                    />
                    <div className="flex gap-2 items-center">
                      <input
                        type="color"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-8 h-8 p-0 rounded-lg cursor-pointer bg-transparent border-0"
                      />
                      <input
                        type="text"
                        placeholder="#FF0000"
                        value={newColorHex}
                        onChange={(e) => setNewColorHex(e.target.value)}
                        className="w-full text-[11px] bg-white dark:bg-zinc-800 border border-gray-200 dark:border-gray-700 px-2 py-1.5 rounded-lg text-gray-800 dark:text-gray-100 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleAddColor}
                        disabled={addingColor}
                        className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {addingColor ? '...' : 'Tạo'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <select
                    value={colorId}
                    onChange={(e) => setColorId(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold cursor-pointer"
                  >
                    <option value="">-- Chọn màu sắc --</option>
                    {localColors.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {colorId && (
                    <div 
                      className="w-8 h-8 rounded-full border border-gray-300 dark:border-gray-700 flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: localColors.find(c => c.id === colorId)?.hex || 'transparent' }}
                      title={localColors.find(c => c.id === colorId)?.name}
                    />
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Khối Hình ảnh */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Hình ảnh sản phẩm (Tối đa 6 ảnh) *</h3>
            <span className="text-[10px] text-gray-400">Ảnh đầu tiên sẽ làm ảnh bìa. Kích cỡ tỉ lệ vuông 1:1.</span>
          </div>

          {/* Grid hiển thị ảnh đã tải lên */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {images.map((img, idx) => (
              <div key={idx} className="relative aspect-square border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden group bg-gray-50">
                <img src={img} alt="Product preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1.5 right-1.5 p-1 bg-black/60 hover:bg-red-600 text-white rounded-full transition-colors cursor-pointer"
                  title="Xóa ảnh"
                >
                  <X size={12} />
                </button>
                {idx === 0 && (
                  <span className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white font-bold text-[8px] px-1.5 py-0.5 rounded tracking-wide uppercase">
                    Ảnh bìa
                  </span>
                )}
              </div>
            ))}

            {/* Trình tải ảnh - Ẩn nếu đã đủ 6 ảnh */}
            {images.length < 6 && (
              <label className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-orange-500 dark:hover:border-orange-500 rounded-xl flex flex-col items-center justify-center gap-1.5 cursor-pointer text-gray-500 hover:text-orange-500 bg-gray-50/50 dark:bg-zinc-800/10 transition-colors select-none">
                {uploading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Upload size={18} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Tải ảnh lên ({images.length}/6)</span>
                  </>
                )}
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

      </div>

      {/* CỘT PHẢI: THIẾT LẬP PHỤ (Giá, Tồn kho, Danh mục, Lưu) */}
      <div className="lg:col-span-4 flex flex-col gap-6">
        
        {/* Khối Giá, Tồn kho & Danh mục */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-5">
          <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Bảng giá & Kho hàng</h3>
          
          {/* Giá bán & Giá so sánh */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Giá bán *</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="185000"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 pl-3 pr-7 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-orange-600"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">đ</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Giá gốc (so sánh)</label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  placeholder="Ví dụ: 250000"
                  value={compareAtPrice || ''}
                  onChange={(e) => setCompareAtPrice(e.target.value ? Number(e.target.value) : '')}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 pl-3 pr-7 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-gray-400 font-semibold"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">đ</span>
              </div>
            </div>
          </div>

          {/* Quản lý tồn kho trực tiếp */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Số lượng tồn kho *</label>
            <input
              type="number"
              min="0"
              placeholder="Nhập số tồn kho khả dụng..."
              value={stockQuantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:border-orange-500 font-bold text-orange-500"
              required
            />
          </div>

          {/* Khối lượng sản phẩm */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Khối lượng sản phẩm (grams)</label>
            <div className="relative">
              <input
                type="number"
                min="0"
                placeholder="Ví dụ: 380"
                value={weight || ''}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 pl-4 pr-12 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">grams</span>
            </div>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Sử dụng để tính toán phí giao hàng tự động ở các mô-đun sau.</p>
          </div>

          {/* Chế độ hiển thị B2B / PUBLIC */}
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Chế độ hiển thị sản phẩm *</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold cursor-pointer"
              required
            >
              <option value="PUBLIC">Công khai (Bán lẻ B2C & B2B)</option>
              <option value="B2B_ONLY">Ẩn - Chỉ dùng bán buôn (Wholesale B2B)</option>
            </select>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 mt-1">Sản phẩm Ẩn (B2B_ONLY) sẽ không hiển thị trên website bán lẻ và chỉ Admin thấy được khi tạo đơn hàng B2B.</p>
          </div>
        </div>

        {/* Khối Hoàn tất & Submit */}
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm flex flex-col gap-4">
          <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Xác nhận</h3>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3.5 rounded-xl text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-3.5 rounded-xl text-xs font-semibold">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-3.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-orange-500/10 text-center"
            >
              {submitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Lưu thông tin sản phẩm'
              )}
            </button>

            <Link
              href="/admin/products"
              className="w-full text-center border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-3.5 px-4 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1"
            >
              <ArrowLeft size={14} />
              <span>Quay lại</span>
            </Link>
          </div>
        </div>

      </div>

    </form>
  )
}
