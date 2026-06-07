import React from 'react'
import InquiriesClient from '@/components/admin/InquiriesClient'
import { getInquiries } from '@/lib/actions/inquiry.actions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminInquiriesPage() {
  // 1. Lấy danh sách đơn tư vấn gốm
  const inquiriesRes = await getInquiries()
  const inquiries = inquiriesRes.success ? inquiriesRes.data : []

  // 2. Lấy danh sách sản phẩm đang bán (kể cả sản phẩm PUBLIC và B2B_ONLY) để phục vụ việc chọn thêm sản phẩm khi lên đơn B2B
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    include: {
      color: true,
      size: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  // Định dạng lại các trường cho an toàn
  const formattedInquiries = (inquiries || []).map((inq: any) => ({
    ...inq,
    order: inq.convertedOrder || null,
    createdAt: new Date(inq.createdAt),
    updatedAt: new Date(inq.updatedAt)
  }))

  const formattedProducts = products.map((prod: any) => ({
    id: prod.id,
    sku: prod.sku,
    name: prod.name,
    price: prod.price,
    stockQuantity: prod.stockQuantity,
    images: prod.images,
    color: prod.color ? { name: prod.color.name } : null,
    size: prod.size ? { name: prod.size.name } : null
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-primary">Quản lý Đơn Tư Vấn Đặt Gốm</h1>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi yêu cầu đặt gốm, tư vấn thiết kế B2B và chốt đơn bán buôn (Wholesale).
          </p>
        </div>
      </div>

      <InquiriesClient 
        initialInquiries={formattedInquiries} 
        products={formattedProducts} 
      />
    </div>
  )
}
