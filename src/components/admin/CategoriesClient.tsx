'use client'

import React, { useState } from 'react'
import { Plus, Edit, Trash2, Folder, Loader2 } from 'lucide-react'
import { createCategory, updateCategory, deleteCategory } from '@/lib/actions/product.actions'

interface Category {
  id: string
  name: string
  slug: string
  _count?: {
    products: number
  }
}

interface CategoriesClientProps {
  initialCategories: Category[]
}

export default function CategoriesClient({ initialCategories }: CategoriesClientProps) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  const [name, setName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const resetForm = () => {
    setName('')
    setEditingId(null)
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (editingId) {
        // Cập nhật danh mục
        const res = await updateCategory(editingId, name)
        if (res.success && res.data) {
          setCategories(prev =>
            prev.map(c => (c.id === editingId ? { ...c, name: res.data.name, slug: res.data.slug } : c))
          )
          setSuccess('Cập nhật danh mục thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra.')
        }
      } else {
        // Tạo mới danh mục
        const res = await createCategory(name)
        if (res.success && res.data) {
          setCategories(prev => [...prev, { ...res.data, _count: { products: 0 } }])
          setSuccess('Tạo danh mục mới thành công!')
          resetForm()
        } else {
          setError(res.error || 'Có lỗi xảy ra.')
        }
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingId(category.id)
    setName(category.name)
    setError('')
    setSuccess('')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm phải được chuyển đi trước.')) return

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const res = await deleteCategory(id)
      if (res.success) {
        setCategories(prev => prev.filter(c => c.id !== id))
        setSuccess('Đã xóa danh mục thành công!')
        resetForm()
      } else {
        setError(res.error || 'Có lỗi xảy ra.')
      }
    } catch (err: any) {
      setError(err.message || 'Lỗi hệ thống.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* CỘT TRÁI: FORM THÊM/SỬA DANH MỤC */}
      <div className="lg:col-span-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm h-fit">
        <h3 className="font-playfair font-bold text-lg text-gray-800 dark:text-gray-100 mb-2 flex items-center gap-2">
          <Folder className="w-5 h-5 text-orange-500" />
          <span>{editingId ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Mới'}</span>
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
          Danh mục giúp phân nhóm các sản phẩm cốc sứ, ly thủy tinh để khách hàng dễ dàng mua sắm.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-400 p-3 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-xs font-semibold">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-600 dark:text-gray-400 mb-1.5 block">Tên danh mục *</label>
            <input
              type="text"
              placeholder="Ví dụ: Cốc Sứ Premium, Cốc Giữ Nhiệt..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-gray-800 px-3.5 py-2.5 rounded-xl text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all duration-200"
              required
            />
          </div>

          <div className="flex gap-2.5 mt-2">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-grow bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-bold text-xs py-2.5 px-4 rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-orange-500/10"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : editingId ? (
                'Cập nhật'
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Tạo Danh Mục</span>
                </>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-gray-300 font-bold text-xs py-2.5 px-4 rounded-xl transition-colors cursor-pointer"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
      </div>

      {/* CỘT PHẢI: BẢNG DANH SÁCH DANH MỤC */}
      <div className="lg:col-span-8 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-gray-800 p-6 rounded-2xl shadow-sm">
        <h3 className="font-playfair font-bold text-lg text-gray-800 dark:text-gray-100 mb-6">
          Danh Sách Các Danh Mục Hiện Tại
        </h3>

        {categories.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl text-sm text-gray-500 dark:text-gray-400">
            Chưa có danh mục nào được khởi tạo.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500 text-xs uppercase tracking-wider font-bold">
                  <th className="py-3 px-4">Tên danh mục</th>
                  <th className="py-3 px-4">Đường dẫn tĩnh (Slug)</th>
                  <th className="py-3 px-4 text-center">Số sản phẩm</th>
                  <th className="py-3 px-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr
                    key={cat.id}
                    className="border-b border-gray-100 dark:border-gray-800/40 hover:bg-gray-50 dark:hover:bg-zinc-800/20 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-gray-800 dark:text-gray-200">
                      {cat.name}
                    </td>
                    <td className="py-3.5 px-4 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {cat.slug}
                    </td>
                    <td className="py-3.5 px-4 text-center font-bold text-gray-600 dark:text-gray-300">
                      {cat._count?.products || 0}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20 rounded-lg transition-colors cursor-pointer"
                          title="Sửa danh mục"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id)}
                          className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
                          title="Xóa danh mục"
                        >
                          <Trash2 size={14} />
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
    </div>
  )
}
