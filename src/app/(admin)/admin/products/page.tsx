import { prisma } from '@/lib/prisma'
import ProductsClient from '@/components/admin/ProductsClient'

export const dynamic = 'force-dynamic'

export default async function AdminProductsPage() {
  // Lấy danh sách sản phẩm kèm theo danh mục và biến thể màu sắc
  const products = await prisma.product.findMany({
    include: {
      category: {
        select: { id: true, name: true }
      },
      productGroup: {
        select: { id: true, name: true }
      },
      color: {
        select: { id: true, name: true, hex: true }
      },
      size: {
        select: { id: true, name: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // Lấy danh sách danh mục làm dữ liệu lọc
  const categories = await prisma.category.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-playfair font-bold text-2xl text-primary">Quản Lý Sản Phẩm (PIM)</h1>
        <p className="font-bvp text-xs text-secondary">Quản lý kho gốm, sản phẩm, giá bán, hình ảnh và tồn kho theo từng biến thể màu sắc.</p>
      </div>

      <ProductsClient initialProducts={products as any} categories={categories} />
    </div>
  )
}
