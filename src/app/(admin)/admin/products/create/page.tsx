import { prisma } from '@/lib/prisma'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

export default async function AdminProductCreatePage() {
  // Lấy dữ liệu phân loại, bộ sưu tập, màu sắc và kích cỡ
  const [categories, productGroups, colors, sizes] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' }
    }),
    prisma.productGroup.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { name: 'asc' }
    }),
    prisma.colorOption.findMany({
      select: { id: true, name: true, hex: true },
      orderBy: { name: 'asc' }
    }),
    prisma.sizeOption.findMany({
      select: { id: true, name: true, categoryId: true },
      orderBy: { name: 'asc' }
    })
  ])

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-playfair font-bold text-2xl text-primary">Đăng Bán Sản Phẩm Mới</h1>
        <p className="font-bvp text-xs text-secondary">Tạo sản phẩm gốm mộc mạc mới, bổ sung các biến thể màu sắc và ảnh chất lượng cao.</p>
      </div>

      <ProductForm 
        categories={categories} 
        productGroups={productGroups} 
        colors={colors} 
        sizes={sizes} 
      />
    </div>
  )
}
