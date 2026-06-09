'use client'

import React, { useState, useEffect, Fragment } from 'react'
import { Folder, Boxes, Ruler, Palette, Plus, Edit, Trash2, Loader2, GripVertical, Sparkles } from 'lucide-react'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
  createProductGroup,
  updateProductGroup,
  deleteProductGroup,
  reorderProductGroups,
  createColorOption,
  updateColorOption,
  deleteColorOption,
  createSizeOption,
  updateSizeOption,
  deleteSizeOption,
  reorderSizeOptions
} from '@/lib/actions/product.actions'
import {
  createFinish,
  updateFinish,
  deleteFinish,
  reorderFinishes
} from '@/lib/actions/finish.actions'
import ImageCropUploader from './ImageCropUploader'
import { slugify } from '@/lib/utils/slug'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

// Interfaces
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
  slug: string
  description: string | null
  sortOrder: number
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

interface FinishOption {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  _count?: {
    products: number
  }
}

interface CatalogSettingsClientProps {
  initialCategories: Category[]
  initialProductGroups: ProductGroup[]
  initialSizes: SizeOption[]
  initialColors: ColorOption[]
  initialFinishes: FinishOption[]
}

type TabType = 'categories' | 'groups' | 'sizes' | 'colors' | 'finishes'

// ---- Sortable Row Components ----

interface SortableCategoryRowProps {
  cat: Category
  onEdit: (c: Category) => void
  onDelete: (id: string) => void
}

function SortableCategoryRow({ cat, onEdit, onDelete }: SortableCategoryRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-55 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
      <td className="py-3 px-3 text-center w-10">
        <button type="button" {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-orange-500 rounded cursor-grab active:cursor-grabbing" title="Kéo để đổi thứ tự">
          <GripVertical size={14} />
        </button>
      </td>
      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{cat.name}</td>
      <td className="py-3 px-3 font-mono text-gray-400">{cat.slug}</td>
      <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{cat._count?.products || 0}</td>
      <td className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900 shadow-[inset_12px_0_8px_-8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(cat)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer" title="Sửa danh mục">
            <Edit size={13} />
          </button>
          <button onClick={() => onDelete(cat.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer" title="Xóa danh mục">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface SortableProductGroupRowProps {
  group: ProductGroup
  onEdit: (g: ProductGroup) => void
  onDelete: (id: string) => void
}

function SortableProductGroupRow({ group, onEdit, onDelete }: SortableProductGroupRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: group.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-55 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
      <td className="py-3 px-3 text-center w-10">
        <button type="button" {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-orange-500 rounded cursor-grab active:cursor-grabbing" title="Kéo để đổi thứ tự">
          <GripVertical size={14} />
        </button>
      </td>
      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{group.name}</td>
      <td className="py-3 px-3 font-mono text-gray-400">{group.slug}</td>
      <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{group._count?.products || 0}</td>
      <td className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900 shadow-[inset_12px_0_8px_-8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(group)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer" title="Sửa bộ sưu tập">
            <Edit size={13} />
          </button>
          <button onClick={() => onDelete(group.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer" title="Xóa bộ sưu tập">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface SortableSizeRowProps {
  size: SizeOption
  onEdit: (s: SizeOption) => void
  onDelete: (id: string) => void
}

function SortableSizeRow({ size, onEdit, onDelete }: SortableSizeRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: size.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
      <td className="py-3 px-3 text-center w-10">
        <button type="button" {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-orange-500 rounded cursor-grab active:cursor-grabbing" title="Kéo để đổi thứ tự">
          <GripVertical size={14} />
        </button>
      </td>
      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{size.name}</td>
      <td className="py-3 px-3 font-mono text-gray-400">{size.slug}</td>
      <td className="py-3 px-3 text-gray-500 max-w-xs truncate" title={size.description || ''}>
        {size.description || '—'}
      </td>
      <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">
        {size._count?.products || 0}
      </td>
      <td className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900 shadow-[inset_12px_0_8px_-8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(size)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer" title="Sửa kích cỡ">
            <Edit size={13} />
          </button>
          <button onClick={() => onDelete(size.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer" title="Xóa kích cỡ">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

interface SortableFinishRowProps {
  finish: FinishOption
  onEdit: (f: FinishOption) => void;
  onDelete: (id: string) => void;
}

function SortableFinishRow({ finish, onEdit, onDelete }: SortableFinishRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: finish.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="border-b border-gray-50 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
      <td className="py-3 px-3 text-center w-10">
        <button type="button" {...attributes} {...listeners} className="p-1 text-gray-400 hover:text-orange-500 rounded cursor-grab active:cursor-grabbing" title="Kéo để đổi thứ tự">
          <GripVertical size={14} />
        </button>
      </td>
      <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">
        <div className="flex items-center gap-2.5">
          {finish.imageUrl ? (
            <img src={finish.imageUrl} alt={finish.name} className="w-8 h-8 rounded-lg object-cover border border-gray-200 dark:border-gray-850" />
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-gray-400 font-bold text-[10px]">Men</div>
          )}
          <span>{finish.name}</span>
        </div>
      </td>
      <td className="py-3 px-3 font-mono text-gray-400">{finish.slug}</td>
      <td className="py-3 px-3 text-gray-500 max-w-xs truncate" title={finish.description || ''}>
        {finish.description || '—'}
      </td>
      <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">
        {finish._count?.products || 0}
      </td>
      <td className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900 shadow-[inset_12px_0_8px_-8px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-end gap-1">
          <button onClick={() => onEdit(finish)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer" title="Sửa hoàn thiện">
            <Edit size={13} />
          </button>
          <button onClick={() => onDelete(finish.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer" title="Xóa hoàn thiện">
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  )
}

export default function CatalogSettingsClient({
  initialCategories,
  initialProductGroups,
  initialSizes,
  initialColors,
  initialFinishes
}: CatalogSettingsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('categories')

  // Lists state
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [productGroups, setProductGroups] = useState<ProductGroup[]>(initialProductGroups)
  const [sizes, setSizes] = useState<SizeOption[]>(initialSizes)
  const [colors, setColors] = useState<ColorOption[]>(initialColors)
  const [finishes, setFinishes] = useState<FinishOption[]>(initialFinishes)

  // Common UI State
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // 1. Category Form State
  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null)

  // 2. Collection (Product Group) Form State
  const [groupName, setGroupName] = useState('')
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)

  // 3. Size Form State
  const [sizeName, setSizeName] = useState('')
  const [sizeDescription, setSizeDescription] = useState('')
  const [editingSizeId, setEditingSizeId] = useState<string | null>(null)

  // 4. Color Form State
  const [colorName, setColorName] = useState('')
  const [colorHex, setColorHex] = useState('#B48B5E')
  const [editingColorId, setEditingColorId] = useState<string | null>(null)

  // 5. Finish Form State
  const [finishName, setFinishName] = useState('')
  const [finishSlug, setFinishSlug] = useState('')
  const [finishDescription, setFinishDescription] = useState('')
  const [finishImageUrl, setFinishImageUrl] = useState('')
  const [editingFinishId, setEditingFinishId] = useState<string | null>(null)

  // Auto-generate slug for Finish Name when typing name
  useEffect(() => {
    if (!editingFinishId && finishName) {
      setFinishSlug(slugify(finishName))
    }
  }, [finishName, editingFinishId])

  // DND Kit Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  // Resets
  const resetForm = () => {
    setError(''); setSuccess('')
    setCategoryName(''); setEditingCategoryId(null)
    setGroupName(''); setEditingGroupId(null)
    setSizeName(''); setSizeDescription(''); setEditingSizeId(null)
    setColorName(''); setColorHex('#B48B5E'); setEditingColorId(null)
    setFinishName(''); setFinishSlug(''); setFinishDescription(''); setFinishImageUrl(''); setEditingFinishId(null)
  }

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab)
    resetForm()
  }

  // --- Category handlers ---
  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoryName.trim()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      if (editingCategoryId) {
        const res = await updateCategory(editingCategoryId, categoryName.trim())
        if (res.success && res.data) {
          setCategories(prev => prev.map(c => (c.id === editingCategoryId ? { ...c, name: res.data.name, slug: res.data.slug } : c)))
          setSuccess('Cập nhật danh mục thành công!'); resetForm()
        } else setError(res.error || 'Có lỗi xảy ra khi cập nhật danh mục.')
      } else {
        const res = await createCategory(categoryName.trim())
        if (res.success && res.data) {
          setCategories(prev => [...prev, { ...res.data, _count: { products: 0 } }])
          setSuccess('Tạo danh mục mới thành công!'); resetForm()
        } else setError(res.error || 'Có lỗi xảy ra khi tạo danh mục.')
      }
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  const handleEditCategory = (cat: Category) => { setEditingCategoryId(cat.id); setCategoryName(cat.name); setError(''); setSuccess('') }

  const handleDeleteCategory = async (id: string) => {
    const cat = categories.find(c => c.id === id)
    const productCount = cat?._count?.products || 0
    let message = `Bạn có chắc chắn muốn xóa danh mục "${cat?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Danh mục "${cat?.name}" hiện có ${productCount} sản phẩm trực thuộc. Nếu bạn xóa, các sản phẩm này sẽ bị mất danh mục. Bạn vẫn muốn tiếp tục?`
    }
    if (!confirm(message)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await deleteCategory(id)
      if (res.success) { setCategories(prev => prev.filter(c => c.id !== id)); setSuccess('Đã xóa danh mục thành công!'); resetForm() }
      else setError(res.error || 'Có lỗi xảy ra khi xóa danh mục.')
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  // --- Product Group handlers ---
  const handleGroupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      if (editingGroupId) {
        const res = await updateProductGroup(editingGroupId, groupName.trim())
        if (res.success && res.data) {
          setProductGroups(prev => prev.map(g => (g.id === editingGroupId ? { ...g, name: res.data.name, slug: res.data.slug } : g)))
          setSuccess('Cập nhật Bộ sưu tập thành công!'); resetForm()
        } else setError(res.error || 'Có lỗi xảy ra khi cập nhật Bộ sưu tập.')
      } else {
        const res = await createProductGroup(groupName.trim())
        if (res.success && res.data) {
          setProductGroups(prev => [...prev, { ...res.data, _count: { products: 0 } }])
          setSuccess('Tạo Bộ sưu tập mới thành công!'); resetForm()
        } else setError(res.error || 'Có lỗi xảy ra khi tạo Bộ sưu tập.')
      }
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  const handleEditGroup = (group: ProductGroup) => { setEditingGroupId(group.id); setGroupName(group.name); setError(''); setSuccess('') }

  const handleDeleteGroup = async (id: string) => {
    const group = productGroups.find(g => g.id === id)
    const productCount = group?._count?.products || 0
    let message = `Bạn có chắc chắn muốn xóa Bộ sưu tập "${group?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Bộ sưu tập "${group?.name}" hiện đang chứa ${productCount} sản phẩm. Nếu bạn xóa, các sản phẩm này sẽ bị hủy liên kết Bộ sưu tập (trở thành sản phẩm đơn lẻ). Bạn vẫn muốn tiếp tục xóa?`
    }
    if (!confirm(message)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await deleteProductGroup(id)
      if (res.success) { setProductGroups(prev => prev.filter(g => g.id !== id)); setSuccess('Đã xóa Bộ sưu tập thành công!'); resetForm() }
      else setError(res.error || 'Có lỗi xảy ra khi xóa Bộ sưu tập.')
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  // --- Size handlers ---
  const handleSizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sizeName.trim()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      if (editingSizeId) {
        const res = await updateSizeOption(editingSizeId, sizeName.trim(), sizeDescription || null)
        if (res.success && res.data) {
          setSizes(prev => prev.map(s => s.id === editingSizeId ? { ...s, name: res.data.name, slug: res.data.slug, description: res.data.description, sortOrder: res.data.sortOrder } : s))
          setSuccess('Cập nhật Kích cỡ thành công!'); resetForm()
        } else setError(res.error || 'Có lỗi xảy ra khi cập nhật Kích cỡ.')
      } else {
        const res = await createSizeOption(sizeName.trim(), sizeDescription || null)
        if (res.success && res.data) { setSizes(prev => [...prev, { ...res.data, _count: { products: 0 } }]); setSuccess('Tạo Kích cỡ mới thành công!'); resetForm() }
        else setError(res.error || 'Có lỗi xảy ra khi tạo Kích cỡ.')
      }
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  const handleEditSize = (sz: SizeOption) => { setEditingSizeId(sz.id); setSizeName(sz.name); setSizeDescription(sz.description || ''); setError(''); setSuccess('') }

  const handleDeleteSize = async (id: string) => {
    const sz = sizes.find(s => s.id === id)
    const productCount = sz?._count?.products || 0
    let message = `Bạn có chắc chắn muốn xóa Kích cỡ "${sz?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Kích cỡ "${sz?.name}" hiện đang được sử dụng bởi ${productCount} sản phẩm. Nếu xóa, thuộc tính Kích cỡ của các sản phẩm đó sẽ trở về Rỗng. Bạn vẫn muốn xóa?`
    }
    if (!confirm(message)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await deleteSizeOption(id)
      if (res.success) { setSizes(prev => prev.filter(s => s.id !== id)); setSuccess('Đã xóa Kích cỡ thành công!'); resetForm() }
      else setError(res.error || 'Có lỗi xảy ra khi xóa kích cỡ.')
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  // --- Color handlers ---
  const handleColorSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!colorName.trim() || !colorHex.trim()) return
    setLoading(true); setError(''); setSuccess('')
    try {
      if (editingColorId) {
        const res = await updateColorOption(editingColorId, colorName.trim(), colorHex)
        if (res.success && res.data) { setColors(prev => prev.map(c => (c.id === editingColorId ? { ...c, name: res.data.name, hex: res.data.hex } : c))); setSuccess('Cập nhật Màu sắc thành công!'); resetForm() }
        else setError(res.error || 'Có lỗi xảy ra khi cập nhật màu sắc.')
      } else {
        const res = await createColorOption(colorName.trim(), colorHex)
        if (res.success && res.data) { setColors(prev => [...prev, { ...res.data, _count: { products: 0 } }]); setSuccess('Tạo Màu sắc mới thành công!'); resetForm() }
        else setError(res.error || 'Có lỗi xảy ra khi tạo màu sắc.')
      }
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  const handleEditColor = (col: ColorOption) => { setEditingColorId(col.id); setColorName(col.name); setColorHex(col.hex); setError(''); setSuccess('') }

  const handleDeleteColor = async (id: string) => {
    const col = colors.find(c => c.id === id)
    const productCount = col?._count?.products || 0
    let message = `Bạn có chắc chắn muốn xóa Màu sắc "${col?.name}"?`
    if (productCount > 0) {
      message = `CẢNH BÁO: Màu sắc "${col?.name}" hiện đang được sử dụng bởi ${productCount} sản phẩm để hiển thị chấm màu. Nếu xóa, thuộc tính Màu của các sản phẩm này sẽ trở về Rỗng. Bạn có muốn tiếp tục xóa?`
    }
    if (!confirm(message)) return
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await deleteColorOption(id)
      if (res.success) { setColors(prev => prev.filter(c => c.id !== id)); setSuccess('Đã xóa Màu sắc thành công!'); resetForm() }
      else setError(res.error || 'Có lỗi xảy ra khi xóa màu sắc.')
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  // --- Finish handlers ---
  const handleFinishSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!finishName.trim() || !finishSlug.trim()) return
    setLoading(true); setError(''); setSuccess('')
    const payload = { name: finishName.trim(), slug: finishSlug.trim(), description: finishDescription.trim() || null, imageUrl: finishImageUrl.trim() || null }
    try {
      if (editingFinishId) {
        const res = await updateFinish(editingFinishId, payload)
        if (res.success && res.data) {
          setFinishes(prev => prev.map(f => f.id === editingFinishId ? { ...f, name: res.data.name, slug: res.data.slug, description: res.data.description, imageUrl: res.data.imageUrl, sortOrder: res.data.sortOrder } : f))
          setSuccess('Cập nhật kỹ thuật hoàn thiện thành công!'); resetForm()
        } else setError(res.error || 'Có lỗi xảy ra khi cập nhật kỹ thuật hoàn thiện.')
      } else {
        const res = await createFinish(payload)
        if (res.success && res.data) { setFinishes(prev => [...prev, { ...res.data, _count: { products: 0 } }]); setSuccess('Tạo kỹ thuật hoàn thiện mới thành công!'); resetForm() }
        else setError(res.error || 'Có lỗi xảy ra khi tạo kỹ thuật hoàn thiện.')
      }
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  const handleEditFinish = (f: FinishOption) => { setEditingFinishId(f.id); setFinishName(f.name); setFinishSlug(f.slug); setFinishDescription(f.description || ''); setFinishImageUrl(f.imageUrl || ''); setError(''); setSuccess('') }

  const handleDeleteFinish = async (id: string, isForced = false) => {
    setLoading(true); setError(''); setSuccess('')
    try {
      const res = await deleteFinish(id, isForced)
      if (res.success) { setFinishes(prev => prev.filter(f => f.id !== id)); setSuccess('Đã xóa kỹ thuật hoàn thiện thành công!'); resetForm() }
      else if (res.warning) { setLoading(false); if (confirm(res.message)) await handleDeleteFinish(id, true) }
      else setError(res.error || 'Có lỗi xảy ra khi xóa kỹ thuật hoàn thiện.')
    } catch (err: any) { setError(err.message || 'Lỗi hệ thống.') }
    finally { setLoading(false) }
  }

  // ---- Drag end handlers ----

  const handleCategoriesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = categories.findIndex(c => c.id === active.id)
    const newIndex = categories.findIndex(c => c.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const nextList = arrayMove(categories, oldIndex, newIndex)
      setCategories(nextList)
      const res = await reorderCategories(nextList.map(c => c.id))
      if (!res.success) { setError(res.error || 'Lỗi khi lưu thứ tự danh mục.'); setCategories(categories) }
      else setSuccess('Đã cập nhật thứ tự danh mục!')
    }
  }

  const handleGroupsDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = productGroups.findIndex(g => g.id === active.id)
    const newIndex = productGroups.findIndex(g => g.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const nextList = arrayMove(productGroups, oldIndex, newIndex)
      setProductGroups(nextList)
      const res = await reorderProductGroups(nextList.map(g => g.id))
      if (!res.success) { setError(res.error || 'Lỗi khi lưu thứ tự bộ sưu tập.'); setProductGroups(productGroups) }
      else setSuccess('Đã cập nhật thứ tự bộ sưu tập!')
    }
  }

  const handleSizesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = sizes.findIndex(s => s.id === active.id)
    const newIndex = sizes.findIndex(s => s.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const nextList = arrayMove(sizes, oldIndex, newIndex)
      setSizes(nextList)
      const res = await reorderSizeOptions(nextList.map(s => s.id))
      if (!res.success) { setError(res.error || 'Lỗi khi lưu thứ tự kích cỡ.'); setSizes(sizes) }
      else setSuccess('Đã cập nhật thứ tự kích cỡ!')
    }
  }

  const handleFinishesDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = finishes.findIndex(f => f.id === active.id)
    const newIndex = finishes.findIndex(f => f.id === over.id)
    if (oldIndex !== -1 && newIndex !== -1) {
      const nextList = arrayMove(finishes, oldIndex, newIndex)
      setFinishes(nextList)
      const res = await reorderFinishes(nextList.map(f => f.id))
      if (!res.success) { setError(res.error || 'Lỗi khi lưu thứ tự kỹ thuật hoàn thiện.'); setFinishes(finishes) }
      else setSuccess('Đã cập nhật thứ tự kỹ thuật hoàn thiện!')
    }
  }

  return (
    <div className="flex flex-col gap-8 font-bvp">
      {/* 1. TỔNG QUAN STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div onClick={() => handleTabChange('categories')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'categories' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Danh mục</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{categories.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'categories' ? 'bg-orange-50 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Folder size={18} />
          </div>
        </div>
        <div onClick={() => handleTabChange('groups')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'groups' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Bộ sưu tập</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{productGroups.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'groups' ? 'bg-orange-50 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Boxes size={18} />
          </div>
        </div>
        <div onClick={() => handleTabChange('sizes')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'sizes' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Kích cỡ (Size)</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{sizes.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'sizes' ? 'bg-orange-50 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Ruler size={18} />
          </div>
        </div>
        <div onClick={() => handleTabChange('colors')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'colors' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Màu sắc</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{colors.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'colors' ? 'bg-orange-50 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Palette size={18} />
          </div>
        </div>
        <div onClick={() => handleTabChange('finishes')} className={`cursor-pointer p-5 bg-white dark:bg-zinc-900 border rounded-2xl shadow-xs transition-all duration-200 hover:shadow-md flex items-center justify-between group ${activeTab === 'finishes' ? 'border-orange-500/60 ring-2 ring-orange-500/10' : 'border-gray-200 dark:border-gray-800'}`}>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Hoàn thiện</span>
            <span className="text-2xl font-bold font-playfair text-primary dark:text-canvas">{finishes.length}</span>
          </div>
          <div className={`p-3 rounded-xl transition-colors ${activeTab === 'finishes' ? 'bg-orange-50 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 group-hover:text-orange-500'}`}>
            <Sparkles size={18} />
          </div>
        </div>
      </div>

      {/* 2. CHUYỂN TABS */}
      <div className="flex border-b border-gray-200 dark:border-gray-800 gap-6 text-sm font-semibold select-none overflow-x-auto">
        {(['categories', 'groups', 'sizes', 'colors', 'finishes'] as TabType[]).map(tab => {
          const icons: Record<TabType, React.ReactNode> = {
            categories: <Folder size={15} />,
            groups: <Boxes size={15} />,
            sizes: <Ruler size={15} />,
            colors: <Palette size={15} />,
            finishes: <Sparkles size={15} />
          }
          const labels: Record<TabType, string> = {
            categories: 'Danh mục',
            groups: 'Bộ sưu tập (BST)',
            sizes: 'Kích cỡ (Size)',
            colors: 'Màu sắc',
            finishes: 'Kỹ thuật Hoàn thiện'
          }
          return (
            <button key={tab} onClick={() => handleTabChange(tab)}
              className={`pb-3.5 border-b-2 px-1 transition-all flex items-center gap-2 cursor-pointer shrink-0 ${activeTab === tab ? 'border-orange-500 text-orange-500 font-bold' : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'}`}>
              {icons[tab]}
              <span>{labels[tab]}</span>
            </button>
          )
        })}
      </div>

      {/* 3. THÔNG BÁO */}
      {error && (
        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 font-bold text-sm px-2 cursor-pointer">&times;</button>
        </div>
      )}
      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl text-xs font-semibold flex items-center justify-between">
          <span>{success}</span>
          <button onClick={() => setSuccess('')} className="text-emerald-400 hover:text-emerald-600 font-bold text-sm px-2 cursor-pointer">&times;</button>
        </div>
      )}

      {/* 4. GRID FORM & TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* CỘT TRÁI: FORM */}
        <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xs">
          {/* TAB 1: DANH MỤC */}
          {activeTab === 'categories' && (
            <form onSubmit={handleCategorySubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Folder size={18} className="text-orange-500" />
                <span>{editingCategoryId ? 'Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">Phân loại chính cho cửa hàng (Ví dụ: Mug, Beaker, Phễu lọc...)</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên danh mục *</label>
                <input type="text" placeholder="Ví dụ: Mug gốm sứ" value={categoryName} onChange={(e) => setCategoryName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" required />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading || !categoryName.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingCategoryId ? 'Cập nhật' : 'Tạo danh mục'}
                </button>
                {editingCategoryId && (
                  <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer">Hủy</button>
                )}
              </div>
            </form>
          )}

          {/* TAB 2: BST */}
          {activeTab === 'groups' && (
            <form onSubmit={handleGroupSubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Boxes size={18} className="text-orange-500" />
                <span>{editingGroupId ? 'Sửa Bộ Sưu Tập' : 'Tạo Bộ Sưu Tập Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">Dùng để nhóm các sản phẩm cùng thiết kế nhưng khác màu sắc, kích cỡ.</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên Bộ sưu tập *</label>
                <input type="text" placeholder="Ví dụ: Bộ sưu tập Rue" value={groupName} onChange={(e) => setGroupName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" required />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading || !groupName.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingGroupId ? 'Cập nhật' : 'Tạo BST'}
                </button>
                {editingGroupId && <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer">Hủy</button>}
              </div>
            </form>
          )}

          {/* TAB 3: SIZE */}
          {activeTab === 'sizes' && (
            <form onSubmit={handleSizeSubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Ruler size={18} className="text-orange-500" />
                <span>{editingSizeId ? 'Sửa Kích Cỡ' : 'Tạo Kích Cỡ Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">Quy chuẩn kích cỡ sản phẩm chung toàn hệ thống (không phân theo danh mục).</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Kích cỡ (Size Name) *</label>
                <input type="text" placeholder="Ví dụ: Medium, Large, Set of 2, Beaker-S" value={sizeName} onChange={(e) => setSizeName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Mô tả (Không bắt buộc)</label>
                <textarea placeholder="Mô tả kích thước hoặc dung tích..." value={sizeDescription} onChange={(e) => setSizeDescription(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold resize-y min-h-[80px]" />
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading || !sizeName.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingSizeId ? 'Cập nhật' : 'Tạo kích cỡ'}
                </button>
                {editingSizeId && <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer">Hủy</button>}
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
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">Màu sắc chuẩn hóa và mã màu HEX để hiện chấm tròn chọn màu.</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên màu sắc *</label>
                <input type="text" placeholder="Ví dụ: Vàng mù tạt (Mustard Yellow)" value={colorName} onChange={(e) => setColorName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Mã màu (Hex Code) *</label>
                <div className="flex gap-2">
                  <input type="color" value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="w-10 h-10 p-0 rounded-xl cursor-pointer bg-transparent border border-gray-200 dark:border-gray-800" />
                  <input type="text" placeholder="#E1AD01" value={colorHex} onChange={(e) => setColorHex(e.target.value)}
                    className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono font-bold" required />
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading || !colorName.trim() || !colorHex.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingColorId ? 'Cập nhật' : 'Tạo màu sắc'}
                </button>
                {editingColorId && <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer">Hủy</button>}
              </div>
            </form>
          )}

          {/* TAB 5: HOÀN THIỆN */}
          {activeTab === 'finishes' && (
            <form onSubmit={handleFinishSubmit} className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100 flex items-center gap-2 mb-1">
                <Sparkles size={18} className="text-orange-500" />
                <span>{editingFinishId ? 'Sửa Hoàn Thiện' : 'Tạo Hoàn Thiện Mới'}</span>
              </h3>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 -mt-2">Kỹ thuật xử lý bề mặt sản phẩm (Tráng men màu, vẽ tay, khắc nổi...).</p>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Tên kỹ thuật hoàn thiện *</label>
                <input type="text" placeholder="Ví dụ: Vẽ tay thủ công" value={finishName} onChange={(e) => setFinishName(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Đường dẫn (Slug) *</label>
                <input type="text" placeholder="ve-tay-thu-cong" value={finishSlug} onChange={(e) => setFinishSlug(slugify(e.target.value))}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-mono" required />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-500">Mô tả chi tiết</label>
                <textarea placeholder="Mô tả kỹ thuật hoàn thiện này..." value={finishDescription} onChange={(e) => setFinishDescription(e.target.value)}
                  className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-semibold resize-y min-h-[80px]" />
              </div>
              {/* Phase 9f: Hide imageUrl field per user feedback. Keep DB column for backward compat. */}
              {/* <div className="flex flex-col gap-1.5">
                <ImageCropUploader label="Ảnh minh họa (không bắt buộc)" value={finishImageUrl} onChange={setFinishImageUrl} aspectRatio={1} recommendedSize="300x300 px" folder="finishes" />
              </div> */}
              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={loading || !finishName.trim() || !finishSlug.trim()}
                  className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-xs shadow-orange-500/10">
                  {loading ? <Loader2 size={13} className="animate-spin" /> : editingFinishId ? 'Cập nhật' : 'Tạo hoàn thiện'}
                </button>
                {editingFinishId && <button type="button" onClick={resetForm} className="bg-gray-100 hover:bg-gray-200 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-all cursor-pointer">Hủy</button>}
              </div>
            </form>
          )}
        </div>

        {/* CỘT PHẢI: DANH SÁCH */}
        <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-xs">
          {/* 1. DANH MỤC TABLE */}
          {activeTab === 'categories' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Danh sách Danh mục hiện tại</h3>
              {categories.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">Chưa có danh mục nào được khởi tạo.</div>
              ) : (
                <div className="overflow-x-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleCategoriesDragEnd}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                          <th className="pb-3 px-3 text-center w-10">Kéo</th>
                          <th className="pb-3 px-3">Tên danh mục</th>
                          <th className="pb-3 px-3">Đường dẫn (Slug)</th>
                          <th className="pb-3 px-3 text-center">Số sản phẩm</th>
                          <th className="pb-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900">Thao tác</th>
                        </tr>
                      </thead>
                      <SortableContext items={categories.map(c => c.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                          {categories.map(cat => <SortableCategoryRow key={cat.id} cat={cat} onEdit={handleEditCategory} onDelete={handleDeleteCategory} />)}
                        </tbody>
                      </SortableContext>
                    </table>
                  </DndContext>
                </div>
              )}
            </div>
          )}

          {/* 2. BST TABLE */}
          {activeTab === 'groups' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Danh sách Bộ sưu tập hiện tại</h3>
              {productGroups.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">Chưa có bộ sưu tập nào được khởi tạo.</div>
              ) : (
                <div className="overflow-x-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleGroupsDragEnd}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                          <th className="pb-3 px-3 text-center w-10">Kéo</th>
                          <th className="pb-3 px-3">Tên bộ sưu tập</th>
                          <th className="pb-3 px-3">Đường dẫn (Slug)</th>
                          <th className="pb-3 px-3 text-center">Số sản phẩm liên kết</th>
                          <th className="pb-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900">Thao tác</th>
                        </tr>
                      </thead>
                      <SortableContext items={productGroups.map(g => g.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                          {productGroups.map(group => <SortableProductGroupRow key={group.id} group={group} onEdit={handleEditGroup} onDelete={handleDeleteGroup} />)}
                        </tbody>
                      </SortableContext>
                    </table>
                  </DndContext>
                </div>
              )}
            </div>
          )}

          {/* 3. SIZE TABLE */}
          {activeTab === 'sizes' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Danh sách Kích cỡ hiện tại (Kéo để đổi thứ tự)</h3>
              {sizes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">Chưa có kích cỡ nào được khởi tạo.</div>
              ) : (
                <div className="overflow-x-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleSizesDragEnd}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                          <th className="pb-3 px-3 text-center w-10">Kéo</th>
                          <th className="pb-3 px-3">Kích cỡ</th>
                          <th className="pb-3 px-3">Slug</th>
                          <th className="pb-3 px-3">Mô tả</th>
                          <th className="pb-3 px-3 text-center">Số sản phẩm đang dùng</th>
                          <th className="pb-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900">Thao tác</th>
                        </tr>
                      </thead>
                      <SortableContext items={sizes.map(s => s.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                          {sizes.map(sz => <SortableSizeRow key={sz.id} size={sz} onEdit={handleEditSize} onDelete={handleDeleteSize} />)}
                        </tbody>
                      </SortableContext>
                    </table>
                  </DndContext>
                </div>
              )}
            </div>
          )}

          {/* 4. MÀU SẮC TABLE */}
          {activeTab === 'colors' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Danh sách Màu sắc hiện tại</h3>
              {colors.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">Chưa có màu sắc nào được khởi tạo.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                        <th className="pb-3 px-3 text-center w-16">Màu</th>
                        <th className="pb-3 px-3">Tên màu</th>
                        <th className="pb-3 px-3">Mã màu (Hex)</th>
                        <th className="pb-3 px-3 text-center">Số sản phẩm đang dùng</th>
                        <th className="pb-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {colors.map(col => (
                        <tr key={col.id} className="border-b border-gray-55 dark:border-gray-850 hover:bg-gray-50/50 dark:hover:bg-zinc-800/10 transition-colors">
                          <td className="py-3 px-3 text-center">
                            <div className="w-5 h-5 rounded-full border border-gray-200 dark:border-gray-800 shadow-xs mx-auto" style={{ backgroundColor: col.hex }} />
                          </td>
                          <td className="py-3 px-3 font-semibold text-gray-800 dark:text-gray-200">{col.name}</td>
                          <td className="py-3 px-3 font-mono text-gray-400 select-all">{col.hex}</td>
                          <td className="py-3 px-3 text-center font-bold text-gray-600 dark:text-gray-400">{col._count?.products || 0}</td>
                          <td className="py-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900 shadow-[inset_12px_0_8px_-8px_rgba(0,0,0,0.04)]">
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => handleEditColor(col)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer" title="Sửa màu sắc"><Edit size={13} /></button>
                              <button onClick={() => handleDeleteColor(col.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer" title="Xóa màu sắc"><Trash2 size={13} /></button>
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

          {/* 5. FINISH TABLE */}
          {activeTab === 'finishes' && (
            <div className="flex flex-col gap-4">
              <h3 className="font-playfair font-bold text-base text-gray-800 dark:text-gray-100">Danh sách Kỹ thuật Hoàn thiện (Kéo để đổi thứ tự)</h3>
              {finishes.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-850 rounded-2xl text-xs text-gray-400">Chưa có kỹ thuật hoàn thiện nào được khởi tạo.</div>
              ) : (
                <div className="overflow-x-auto">
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleFinishesDragEnd}>
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-gray-100 dark:border-gray-800 text-gray-400 uppercase font-bold tracking-wider">
                          <th className="pb-3 px-3 text-center w-10">Kéo</th>
                          <th className="pb-3 px-3">Kỹ thuật hoàn thiện</th>
                          <th className="pb-3 px-3">Slug</th>
                          <th className="pb-3 px-3">Mô tả</th>
                          <th className="pb-3 px-3 text-center">Số sản phẩm đang dùng</th>
                          <th className="pb-3 px-3 text-right sticky right-0 bg-white dark:bg-zinc-900">Thao tác</th>
                        </tr>
                      </thead>
                      <SortableContext items={finishes.map(f => f.id)} strategy={verticalListSortingStrategy}>
                        <tbody>
                          {finishes.map(f => <SortableFinishRow key={f.id} finish={f} onEdit={handleEditFinish} onDelete={handleDeleteFinish} />)}
                        </tbody>
                      </SortableContext>
                    </table>
                  </DndContext>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}