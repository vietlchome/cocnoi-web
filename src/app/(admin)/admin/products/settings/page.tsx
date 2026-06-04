import { prisma } from '@/lib/prisma'
import CatalogSettingsClient from '@/components/admin/CatalogSettingsClient'

export const dynamic = 'force-dynamic'

export default async function AdminCategoriesPage() {
  // Lấy dữ liệu song song (Parallel Fetching) từ database để tối ưu hiệu năng
  const [categories, productGroups, sizes, colors] = await Promise.all([
    prisma.category.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.productGroup.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.sizeOption.findMany({
      include: {
        category: {
          select: { id: true, name: true }
        },
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    }),
    prisma.colorOption.findMany({
      include: {
        _count: {
          select: { products: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })
  ])

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-playfair font-bold text-2xl text-primary">Cấu Hình Sản Phẩm</h1>
        <p className="font-bvp text-xs text-secondary">
          Quản lý tập trung Danh mục, Bộ sưu tập, Kích cỡ (Size) và Thuộc tính Màu sắc hiển thị ở cửa hàng.
        </p>
      </div>

      <CatalogSettingsClient
        initialCategories={categories}
        initialProductGroups={productGroups}
        initialSizes={sizes}
        initialColors={colors}
      />
    </div>
  )
}
