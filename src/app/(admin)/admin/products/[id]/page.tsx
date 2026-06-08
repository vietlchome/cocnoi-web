import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import ProductForm from '@/components/admin/ProductForm'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminProductEditPage({ params }: PageProps) {
  const { id } = await params

  // Lấy chi tiết sản phẩm cùng các biến thể và kỹ thuật hoàn thiện
  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      finishes: true
    }
  })

  if (!product) {
    notFound()
  }

  // Lấy dữ liệu phân loại, bộ sưu tập, màu sắc, kích cỡ và kỹ thuật hoàn thiện
  const [categories, productGroups, colors, sizes, finishes] = await Promise.all([
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
      select: { id: true, name: true, slug: true },
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ]
    }),
    prisma.finishOption.findMany({
      select: { id: true, name: true, slug: true },
      orderBy: { sortOrder: 'asc' }
    })
  ])

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="font-playfair font-bold text-2xl text-primary">Chỉnh Sửa Sản Phẩm</h1>
        <p className="font-bvp text-xs text-secondary">
          Thay đổi giá cả, hình ảnh, bài viết mô tả hoặc điều chỉnh số lượng tồn kho của các biến thể màu sắc.
        </p>
      </div>

      <ProductForm 
        categories={categories} 
        productGroups={productGroups} 
        colors={colors} 
        sizes={sizes} 
        finishes={finishes}
        initialProduct={product as any} 
      />
    </div>
  )
}
