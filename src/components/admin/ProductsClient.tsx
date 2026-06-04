'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, RotateCcw, AlertTriangle, Eye, EyeOff, Search, SlidersHorizontal, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { deleteProductSoft, restoreProduct } from '@/lib/actions/product.actions'

interface Product {
  id: string
  sku?: string | null
  name: string
  slug: string
  description: string
  price: number
  stockQuantity: number
  images: string // JSON string array
  isActive: boolean
  categoryId: string | null
  category: {
    id: string
    name: string
  } | null
  createdAt: Date
  productGroupId?: string | null
  color?: {
    id: string
    name: string
    hex: string
  } | null
  size?: {
    id: string
    name: string
  } | null
}

interface Category {
  id: string
  name: string
}

interface ProductsClientProps {
  initialProducts: Product[]
  categories: Category[]
}

export default function ProductsClient({ initialProducts, categories }: ProductsClientProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'archived'>('active') // Mặc định hiển thị sản phẩm đang bán
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()

  // 1. Phân lọc sản phẩm
  const filteredProducts = products.filter(prod => {
    // Lọc theo Tab (Active / Soft Deleted / All)
    if (activeTab === 'active' && !prod.isActive) return false
    if (activeTab === 'archived' && prod.isActive) return false

    // Tìm kiếm từ khóa
    const matchesSearch = 
      prod.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (prod.sku && prod.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (prod.productGroupId && prod.productGroupId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      prod.id.toLowerCase().includes(searchTerm.toLowerCase())

    // Lọc theo Danh mục
    const matchesCategory = selectedCategory === '' || prod.categoryId === selectedCategory

    return matchesSearch && matchesCategory
  })

  // 2. Các Action
  const handleSoftDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn ngừng bán (Xóa mềm) sản phẩm này? Nó sẽ không hiển thị ở Cửa hàng nhưng lịch sử giao dịch vẫn được giữ nguyên.')) return
    
    setLoadingId(id)
    try {
      const res = await deleteProductSoft(id)
      if (res.success) {
        setProducts(prev => 
          prev.map(p => p.id === id ? { ...p, isActive: false } : p)
        )
      } else {
        alert(res.error || 'Có lỗi xảy ra khi xóa.')
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoadingId(null)
    }
  }

  const handleRestore = async (id: string) => {
    setLoadingId(id)
    try {
      const res = await restoreProduct(id)
      if (res.success) {
        setProducts(prev => 
          prev.map(p => p.id === id ? { ...p, isActive: true } : p)
        )
      } else {
        alert(res.error || 'Có lỗi xảy ra khi khôi phục.')
      }
    } catch (err: any) {
      alert(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoadingId(null)
    }
  }

  // Đọc danh sách ảnh
  const getFirstImage = (imagesStr: string) => {
    try {
      const parsed = JSON.parse(imagesStr)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed[0]
      }
    } catch (e) {}
    return 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=100&q=80' // Placeholder
  }

  return (
    <div className="flex flex-col gap-6 font-bvp">
      
      {/* 1. THANH TÌM KIẾM & BỘ LỌC */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Tìm kiếm */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, SKU, nhóm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 pl-10 pr-4 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
          />
        </div>

        {/* Lọc danh mục */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto ml-auto">
          <div className="flex items-center gap-1.5 text-xs text-gray-500 font-semibold">
            <SlidersHorizontal size={14} className="text-orange-500" />
            <span>Danh mục:</span>
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200 cursor-pointer"
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <Link
            href="/admin/products/create"
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs py-2.5 px-4.5 rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10 ml-auto md:ml-0"
          >
            <Plus size={16} />
            <span>Thêm sản phẩm mới</span>
          </Link>
        </div>

      </div>

      {/* 2. TAB PHÂN LOẠI TRẠNG THÁI */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 select-none">
        {[
          { label: 'Đang bán hoạt động', value: 'active' },
          { label: 'Ngừng kinh doanh (Đã xóa)', value: 'archived' },
          { label: 'Tất cả sản phẩm', value: 'all' },
        ].map(tab => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as any)}
            className={`px-5 py-3 text-xs font-bold transition-all border-b-2 -mb-[2px] ${
              activeTab === tab.value
                ? 'border-orange-500 text-orange-500'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. BẢNG SẢN PHẨM */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-gray-500 dark:text-gray-400">
            Không tìm thấy sản phẩm nào phù hợp với bộ lọc hiện tại.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-zinc-800/10 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3.5 px-6">Ảnh / Tên</th>
                  <th className="py-3.5 px-4">Danh mục</th>
                  <th className="py-3.5 px-4">Giá gốc</th>
                  <th className="py-3.5 px-4">Tồn kho</th>
                  <th className="py-3.5 px-4">Nhóm & Thuộc tính</th>
                  <th className="py-3.5 px-4 text-center">Trạng thái</th>
                  <th className="py-3.5 px-6 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/40">
                {filteredProducts.map((prod) => {
                  const isOutOfStock = prod.stockQuantity === 0
                  
                  return (
                    <tr
                      key={prod.id}
                      onClick={() => router.push(`/admin/products/${prod.id}`)}
                      className={`cursor-pointer hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors ${
                        !prod.isActive ? 'opacity-60 bg-gray-50/20' : ''
                      }`}
                    >
                      {/* Ảnh và tên */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800 shrink-0 bg-gray-100">
                            <img
                              src={getFirstImage(prod.images)}
                              alt={prod.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-gray-800 dark:text-gray-200 block text-sm max-w-[280px] overflow-hidden text-ellipsis">
                              {prod.name}
                            </span>
                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-500 uppercase">
                              SKU: {prod.sku || '---'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Danh mục */}
                      <td className="py-3.5 px-4 text-xs font-semibold text-gray-600 dark:text-gray-400">
                        {prod.category?.name || 'Không thuộc danh mục'}
                      </td>

                      {/* Giá */}
                      <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        {prod.price.toLocaleString('vi-VN')} đ
                      </td>

                      {/* Tồn kho */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`font-bold ${
                            isOutOfStock
                              ? 'text-red-500'
                              : prod.stockQuantity <= 5
                              ? 'text-amber-500'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {prod.stockQuantity}
                        </span>
                        {isOutOfStock && (
                          <span className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] bg-red-50 text-red-500 border border-red-100 px-1 rounded font-bold uppercase">
                            Hết
                          </span>
                        )}
                      </td>

                      {/* Nhóm & Thuộc tính Flat Catalog */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col gap-1 text-[10px]">
                          {prod.productGroupId && (
                            <span className="text-gray-400">
                              Nhóm: <span className="font-bold text-gray-700 dark:text-gray-300">{prod.productGroupId}</span>
                            </span>
                          )}
                           <div className="flex items-center gap-1.5">
                            {prod.color?.hex && (
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 shrink-0"
                                style={{ backgroundColor: prod.color.hex }}
                                title={prod.color.name || ''}
                              />
                            )}
                            <span className="font-semibold text-gray-600 dark:text-gray-400">
                              {prod.color?.name || '---'}
                            </span>
                            {prod.size?.name && (
                              <span className="px-1.5 py-0.2 bg-gray-100 dark:bg-zinc-800 text-gray-500 rounded border border-gray-200 dark:border-gray-800 text-[8px] font-bold">
                                {prod.size.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            prod.isActive
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                              : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400'
                          }`}
                        >
                          {prod.isActive ? <Eye size={10} /> : <EyeOff size={10} />}
                          <span>{prod.isActive ? 'Đang bán' : 'Ngừng bán'}</span>
                        </span>
                      </td>

                      {/* Hành động */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/products/${prod.id}`}
                            className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                            title="Sửa sản phẩm"
                          >
                            <Edit size={14} />
                          </Link>

                          {loadingId === prod.id ? (
                            <div className="p-2 text-orange-500">
                              <Loader2 size={14} className="animate-spin" />
                            </div>
                          ) : prod.isActive ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleSoftDelete(prod.id); }}
                              className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Ngừng bán (Xóa mềm)"
                            >
                              <Trash2 size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleRestore(prod.id); }}
                              className="p-2 text-gray-500 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 rounded-lg transition-colors cursor-pointer"
                              title="Khôi phục bán lại"
                            >
                              <RotateCcw size={14} />
                            </button>
                          )}
                        </div>
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
  )
}
