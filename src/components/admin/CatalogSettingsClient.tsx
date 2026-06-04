'use client'

import React, { useState } from 'react'
import { Folder, Boxes, Ruler, Palette, Plus, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  createColorOption,
  updateColorOption,
  deleteColorOption,
  createSizeOption,
  updateSizeOption,
  deleteSizeOption
} from '@/lib/actions/product.actions'

interface Category {
  id: string
  name: string
  slug: string
  _count?: {
    products: number
  }
}

interface ProductGroup {
  id: string
  name: string
  slug: string
  _count?: {
    products: number
  }
}

interface SizeOption {
  id: string
  name: string
  categoryId: string
  category: {
    id: string
    name: string
  }
  _count?: {
    products: number
  }
}

interface ColorOption {
  id: string
  name: string
  hex: string
  _count?: {
    products: number
  }
}

interface CatalogSettingsClientProps {
  initialCategories: Category[]
  initialProductGroups: ProductGroup[]
  initialSizes: SizeOption[]
  initialColors: ColorOption[]
}

type TabType = 'categories' | 'groups' | 'sizes' | 'colors'

export default function CatalogSettingsClient({
  initialCategories,
  initialProductGroups,
  initialSizes,
  initialColors
}: CatalogSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('categories')
  
  // Lists state
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [productGroups, setProductGroups] = useState<ProductGroup[]>(initialProductGroups)
  const [sizes, setSizes] = useState<SizeOption[]>(initialSizes)
  const [colors, setColors] = useState<ColorOption[]>(initialColors)

  // Common UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // -------------------------------------------------------------
  // TAB STATES & SUBMITS
  // -------------------------------------------------------------

  // 1. Category Form State
  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  // 2. Collection (Product Group) Form State
  const [groupName, setGroupName] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)

  // 3. Size Form State
  const [sizeName, setSizeName] = useState('')
  const [sizeCategoryId, setSizeCategoryId] = useState('')
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null)

  // 4. Color Form State
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#B48B5E') // Màu nâu gốm đặc trưng làm mặc định
  const [editingColorId, setEditingColorId] = useState<string | null>(null)

  // Resets
  const resetForm = () => {
    setError('')
    setSuccess('')
    
    // Reset Categories
    setCategoryName('')
    setEditingCategoryId(null)
    
    // Reset Collections
    setGroupName('')
    setEditingGroupId(null)
    
    // Reset Sizes
    setSizeName('')
    setSizeCategoryId('')
    setEditingSizeId(null)
    
    // Reset Colors
    setColorName('')
    setColorHex('#B48B5E')
    setEditingColorId(null)
  }

  // Handle Tab Switch
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    resetForm()
  }

  // -------------------------------------------------------------
  // 1. CATEGORY HANDLERS
  // -------------------------------------------------------------
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingCategoryId) {
        const res = await updateCategory(editingCategoryId, categoryName.trim())
        if (res.success && res.data) {
          setCategories(prev =>
            prev.map(c => (c.id === editingCategoryId ? { ...c, name: res.data.name, slug: res.data.slug } : c))
          )
          // Update sizes inline category cache as well
          setSizes(prev =>
            prev.map(s => (s.categoryId === editingCategoryId ? { ...s, category: { ...s.category, name: res.data.name } } : s))
          )
          setSuccess('Cập nhật danh mục thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi cập nhật danh mục.')
        }
      } else {
        const res = await createCategory(categoryName.trim())
        if (res.success && res.data) {
          setCategories(prev => [...prev, { ...res.data, _count: { products: 0 } }])
          setSuccess('Tạo danh mục mới thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi tạo danh mục.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id)
    setCategoryName(cat.name)
    setError('')
    setSuccess('')
  }

  const handleDeleteCategory = async (id: string) => {
    const cat = categories.find(c => c.id === id)
    const productCount = cat?._count?.products || 0

    let message = `Bạn có chắc chắn muốn xóa danh mục "${cat?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Danh mục "${cat?.name}" hiện có ${productCount} sản phẩm trực thuộc. Nếu bạn xóa, các sản phẩm này sẽ bị mất danh mục. Bạn vẫn muốn tiếp tục?`
    }

    if (!confirm(message)) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await deleteCategory(id)
      if (res.success) {
        setCategories(prev => prev.filter(c => c.id !== id))
        // Dọn dẹp size thuộc category vừa xóa trong local state
        setSizes(prev => prev.filter(s => s.categoryId !== id))
        setSuccess('Đã xóa danh mục thành công!')
        resetForm()
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xóa danh mục.')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // 2. PRODUCT GROUP (BST) HANDLERS
  // -------------------------------------------------------------
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingGroupId) {
        const res = await updateProductGroup(editingGroupId, groupName.trim())
        if (res.success && res.data) {
          setProductGroups(prev =>
            prev.map(g => (g.id === editingGroupId ? { ...g, name: res.data.name, slug: res.data.slug } : g))
          )
          setSuccess('Cập nhật Bộ sưu tập thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi cập nhật Bộ sưu tập.')
        }
      } else {
        const res = await createProductGroup(groupName.trim())
        if (res.success && res.data) {
          setProductGroups(prev => [...prev, { ...res.data, _count: { products: 0 } }])
          setSuccess('Tạo Bộ sưu tập mới thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi tạo Bộ sưu tập.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditGroup = (group: ProductGroup) => {
    setEditingGroupId(group.id)
    setGroupName(group.name)
    setError('')
    setSuccess('')
  }

  const handleDeleteGroup = async (id: string) => {
    const group = productGroups.find(g => g.id === id)
    const productCount = group?._count?.products || 0

    let message = `Bạn có chắc chắn muốn xóa Bộ sưu tập "${group?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Bộ sưu tập "${group?.name}" hiện đang chứa ${productCount} sản phẩm. Nếu bạn xóa, các sản phẩm này sẽ bị hủy liên kết Bộ sưu tập (trở thành sản phẩm đơn lẻ). Bạn vẫn muốn tiếp tục xóa?`
    }

    if (!confirm(message)) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await deleteProductGroup(id)
      if (res.success) {
        setProductGroups(prev => prev.filter(g => g.id !== id))
        setSuccess('Đã xóa Bộ sưu tập thành công!')
        resetForm()
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xóa Bộ sưu tập.')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // 3. SIZE HANDLERS
  // -------------------------------------------------------------
  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sizeName.trim() || !sizeCategoryId) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingSizeId) {
        const res = await updateSizeOption(editingSizeId, sizeName.trim(), sizeCategoryId)
        if (res.success && res.data) {
          const matchedCategory = categories.find(c => c.id === sizeCategoryId)
          setSizes(prev =>
            prev.map(s =>
              s.id === editingSizeId
                ? {
                    ...s,
                    name: res.data.name,
                    categoryId: sizeCategoryId,
                    category: { id: sizeCategoryId, name: matchedCategory?.name || '' }
                  }
                : s
            )
          )
          setSuccess('Cập nhật Kích cỡ thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi cập nhật Kích cỡ.')
        }
      } else {
        const res = await createSizeOption(sizeName.trim(), sizeCategoryId)
        if (res.success && res.data) {
          const matchedCategory = categories.find(c => c.id === sizeCategoryId)
          setSizes(prev => [
            ...prev,
            {
              ...res.data,
              category: { id: sizeCategoryId, name: matchedCategory?.name || '' },
              _count: { products: 0 }
            }
          ])
          setSuccess('Tạo Kích cỡ mới thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi tạo Kích cỡ.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditSize = (sz: SizeOption) => {
    setEditingSizeId(sz.id)
    setSizeName(sz.name)
    setSizeCategoryId(sz.categoryId)
    setError('')
    setSuccess('')
  }

  const handleDeleteSize = async (id: string) => {
    const sz = sizes.find(s => s.id === id)
    const productCount = sz?._count?.products || 0

    let message = `Bạn có chắc chắn muốn xóa Kích cỡ "${sz?.name}" của danh mục "${sz?.category.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Kích cỡ "${sz?.name}" hiện đang được sử dụng bởi ${productCount} sản phẩm. Nếu xóa, thuộc tính Kích cỡ của các sản phẩm đó sẽ trở về Rỗng. Bạn vẫn muốn xóa?`
    }

    if (!confirm(message)) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await deleteSizeOption(id)
      if (res.success) {
        setSizes(prev => prev.filter(s => s.id !== id))
        setSuccess('Đã xóa Kích cỡ thành công!')
        resetForm()
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xóa kích cỡ.')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  // -------------------------------------------------------------
  // 4. COLOR HANDLERS
  // -------------------------------------------------------------
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!colorName.trim() || !colorHex.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingColorId) {
        const res = await updateColorOption(editingColorId, colorName.trim(), colorHex)
        if (res.success && res.data) {
          setColors(prev =>
            prev.map(c => (c.id === editingColorId ? { ...c, name: res.data.name, hex: res.data.hex } : c))
          )
          setSuccess('Cập nhật Màu sắc thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi cập nhật màu sắc.')
        }
      } else {
        const res = await createColorOption(colorName.trim(), colorHex)
        if (res.success && res.data) {
          setColors(prev => [...prev, { ...res.data, _count: { products: 0 } }])
          setSuccess('Tạo Màu sắc mới thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra khi tạo màu sắc.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditColor = (col: ColorOption) => {
    setEditingColorId(col.id)
    setColorName(col.name)
    setColorHex(col.hex)
    setError('')
    setSuccess('')
  }

  const handleDeleteColor = async (id: string) => {
    const col = colors.find(c => c.id === id)
    const productCount = col?._count?.products || 0

    let message = `Bạn có chắc chắn muốn xóa Màu sắc "${col?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Màu sắc "${col?.name}" hiện đang được sử dụng bởi ${productCount} sản phẩm để hiển thị chấm màu. Nếu xóa, thuộc tính Màu của các sản phẩm này sẽ trở về Rỗng. Bạn có muốn tiếp tục xóa?`
    }

    if (!confirm(message)) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await deleteColorOption(id)
      if (res.success) {
        setColors(prev => prev.filter(c => c.id !== id))
        setSuccess('Đã xóa Màu sắc thành công!')
        resetForm()
      } else {
        setError(res.error || 'Có lỗi xảy ra khi xóa màu sắc.')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-8 font-bvp">
      
      {/* 1. TỔNG QUAN STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        <div onClick={() => handleTabChange('categories')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'categories' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Danh mục</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{categories.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Folder size={18} />
          </div>
        </div>

        <div onClick={() => handleTabChange('groups')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'groups' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Bộ sưu tập</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{productGroups.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'groups' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Boxes size={18} />
          </div>
        </div>

        <div onClick={() => handleTabChange('sizes')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'sizes' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Kích cỡ (Size)</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{sizes.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'sizes' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Ruler size={18} />
          </div>
        </div>

        <div onClick={() => handleTabChange('colors')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'colors' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Màu sắc</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{colors.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'colors' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Palette size={18} />
          </div>
        </div>

      </div>

      {/* 2. CHUYỂN TABS CHI TIẾT */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 text-sm font-semibold select-none">
        <button
          onClick={() => handleTabChange('categories')}
          className={`pb-3.5 border-b-2 px-1 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'categories' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <Folder size={15} />
          <span>Danh mục</span>
        </button>

        <button
          onClick={() => handleTabChange('groups')}
          className={`pb-3.5 border-b-2 px-1 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'groups' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <Boxes size={15} />
          <span>Bộ sưu tập (BST)</span>
        </button>

        <button
          onClick={() => handleTabChange('sizes')}
          className={`pb-3.5 border-b-2 px-1 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'sizes' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <Ruler size={15} />
          <span>Kích cỡ (Size)</span>
        </button>

        <button
          onClick={() => handleTabChange('colors')}
          className={`pb-3.5 border-b-2 px-1 transition-all flex items-center gap-2 cursor-pointer ${activeTab === 'colors' ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}
        >
          <Palette size={15} />
          <span>Màu sắc</span>
        </button>
      </div>

      {/* 3. BẢNG HIỂN THỊ THÔNG BÁO LỖI / THÀNH CÔNG CHUNG */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold text-sm px-2 cursor-pointer">×</button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 font-bold text-sm px-2 cursor-pointer">×</button>
        </div>
      )}

      {/* 4. GRID FORM & TABLE THEO ACTIVE TAB */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* CỘT TRÁI: FORM THÊM / SỬA */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xs">
          
          {/* TAB 1: DANH MỤC */}
          {activeTab === 'categories' && (
            <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Folder size={18} className="text-orange-500" />
                <span>{editingCategoryId ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">
                Phân loại chính cho cửa hàng (Ví dụ: Mug, Beaker, Phễu lọc...)
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên danh mục *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Mug gốm sứ"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading || !categoryName.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingCategoryId ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
                {editingCategoryId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: BỘ SƯU TẬP (BST) */}
          {activeTab === 'groups' && (
            <form onSubmit={handleGroupSubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Boxes size={18} className="text-orange-500" />
                <span>{editingGroupId ? 'Sửa Bộ Sưu Tập' : 'Tạo Bộ Sưu Tập Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">
                Dùng để nhóm các sản phẩm cùng thiết kế nhưng khác màu sắc, kích cỡ.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên Bộ sưu tập *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Bộ sưu tập Rue"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading || !groupName.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingGroupId ? 'Cập nhật' : 'Tạo BST'}
                </button>
                {editingGroupId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 3: KÍCH CỠ (SIZE) */}
          {activeTab === 'sizes' && (
            <form onSubmit={handleSizeSubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Ruler size={18} className="text-orange-500" />
                <span>{editingSizeId ? 'Sửa Kích Cỡ' : 'Tạo Kích Cỡ Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">
                Quy chuẩn kích cỡ được gắn theo từng Danh mục tương ứng.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Kích cỡ (Size Name) *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Medium, Large, Set of 2"
                  value={sizeName}
                  onChange={(e) => setSizeName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Danh mục liên kết *</label>
                <select
                  value={sizeCategoryId}
                  onChange={(e) => setSizeCategoryId(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold cursor-pointer"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading || !sizeName.trim() || !sizeCategoryId}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingSizeId ? 'Cập nhật' : 'Tạo kích cỡ'}
                </button>
                {editingSizeId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          )}

          {/* TAB 4: MÀU SẮC */}
          {activeTab === 'colors' && (
            <form onSubmit={handleColorSubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Palette size={18} className="text-orange-500" />
                <span>{editingColorId ? 'Sửa Màu Sắc' : 'Tạo Màu Sắc Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">
                Màu sắc chuẩn hóa và mã màu HEX để hiện chấm tròn chọn màu.
              </p>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên màu sắc *</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Vàng mù tạt (Mustard Yellow)"
                  value={colorName}
                  onChange={(e) => setColorName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Mã màu (Hex Code) *</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-10 h-10 p-0 rounded-xl cursor-pointer bg-transparent border border-gray-200 dark:border-gray-800"
                  />
                  <input
                    type="text"
                    placeholder="#E1AD01"
                    value={colorHex}
                    onChange={(e) => setColorHex(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono font-bold"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={loading || !colorName.trim() || !colorHex.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10"
                >
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingColorId ? 'Cập nhật' : 'Tạo màu sắc'}
                </button>
                {editingColorId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer"
                  >
                    Hủy
                  </button>
                )}
              </div>
            </form>
          )}

        </div>

        {/* CỘT PHẢI: DANH SÁCH BẢNG DỮ LIỆU */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xs">
          
          {/* 1. DANH MỤC TABLE */}
          {activeTab === 'categories' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">
                Danh sách Danh mục hiện tại
              </h3>
              
              {categories.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">
                  Chưa có danh mục nào được khởi tạo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="pb-3 px-3">Tên danh mục</th>
                        <th className="pb-3 px-3">Đường dẫn (Slug)</th>
                        <th className="pb-3 px-3 text-center">Số sản phẩm</th>
                        <th className="pb-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => (
                        <tr key={cat.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{cat.name}</td>
                          <td className="py-3 px-3 font-mono text-gray-400">{cat.slug}</td>
                          <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{cat._count?.products || 0}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditCategory(cat)}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Sửa danh mục"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(cat.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Xóa danh mục"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 2. BỘ SƯU TẬP (BST) TABLE */}
          {activeTab === 'groups' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">
                Danh sách Bộ sưu tập hiện tại
              </h3>
              
              {productGroups.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">
                  Chưa có bộ sưu tập nào được khởi tạo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="pb-3 px-3">Tên bộ sưu tập</th>
                        <th className="pb-3 px-3">Đường dẫn (Slug)</th>
                        <th className="pb-3 px-3 text-center">Số sản phẩm liên kết</th>
                        <th className="pb-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productGroups.map(group => (
                        <tr key={group.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{group.name}</td>
                          <td className="py-3 px-3 font-mono text-gray-400">{group.slug}</td>
                          <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{group._count?.products || 0}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditGroup(group)}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Sửa bộ sưu tập"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteGroup(group.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Xóa bộ sưu tập"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 3. KÍCH CỠ (SIZE) TABLE */}
          {activeTab === 'sizes' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">
                Danh sách Kích cỡ hiện tại
              </h3>
              
              {sizes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">
                  Chưa có kích cỡ nào được khởi tạo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="pb-3 px-3">Kích cỡ</th>
                        <th className="pb-3 px-3">Thuộc danh mục</th>
                        <th className="pb-3 px-3 text-center">Số sản phẩm đang dùng</th>
                        <th className="pb-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sizes.map(sz => (
                        <tr key={sz.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{sz.name}</td>
                          <td className="py-3 px-3 font-bold text-orange-600/80 bg-orange-50/20 dark:bg-orange-950/5 px-2 py-1 rounded-lg w-fit">{sz.category?.name || 'Chưa phân loại'}</td>
                          <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{sz._count?.products || 0}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditSize(sz)}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Sửa kích cỡ"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteSize(sz.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Xóa kích cỡ"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* 4. MÀU SẮC TABLE */}
          {activeTab === 'colors' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">
                Danh sách Màu sắc hiện tại
              </h3>
              
              {colors.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">
                  Chưa có màu sắc nào được khởi tạo.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="pb-3 px-3 text-center w-16">Màu</th>
                        <th className="pb-3 px-3">Tên màu</th>
                        <th className="pb-3 px-3">Mã màu (Hex)</th>
                        <th className="pb-3 px-3 text-center">Số sản phẩm đang dùng</th>
                        <th className="pb-3 px-3 text-right">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map(col => (
                        <tr key={col.id} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="py-3 px-3 text-center">
                            <div
                              className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-800 shadow-xs mx-auto"
                              style={{ backgroundColor: col.hex }}
                            />
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{col.name}</td>
                          <td className="py-3 px-3 font-mono text-gray-400 select-all">{col.hex}</td>
                          <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{col._count?.products || 0}</td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleEditColor(col)}
                                className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Sửa màu sắc"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteColor(col.id)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                                title="Xóa màu sắc"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}
