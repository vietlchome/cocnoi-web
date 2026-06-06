import React from 'react'
import { getCustomers } from '@/lib/actions/customer.actions'
import { prisma } from '@/lib/prisma'
import CustomersClient from '@/components/admin/CustomersClient'

export const dynamic = 'force-dynamic'

export default async function AdminCustomersPage() {
  // 1. Lấy danh sách khách hàng từ CRM actions
  const customerResult = await getCustomers()
  const rawCustomers = customerResult.success ? customerResult.data : []

  // Chuẩn hoá kiểu dữ liệu để truyền qua Client Component an toàn
  const customers = (rawCustomers || []).map((c: any) => ({
    id: c.id,
    name: c.name,
    phone: c.phone,
    email: c.email,
    companyName: c.companyName,
    address: c.address,
    taxCode: c.taxCode,
    customerType: c.customerType,
    createdAt: c.createdAt,
    _count: {
      orders: c._count?.orders || 0,
      inquiries: c._count?.inquiries || 0
    }
  }))

  // 2. Lấy danh sách sản phẩm đang hoạt động phục vụ tạo đơn B2B thủ công
  const dbProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: {
      id: true,
      sku: true,
      name: true,
      price: true,
      stockQuantity: true
    },
    orderBy: { name: 'asc' }
  })

  // Đảm bảo kiểu dữ liệu an toàn
  const products = dbProducts.map((p: any) => ({
    id: p.id,
    sku: p.sku || null,
    name: p.name,
    price: p.price,
    stockQuantity: p.stockQuantity
  }))

  return (
    <div className="min-h-full">
      <CustomersClient initialCustomers={customers} products={products} />
    </div>
  )
}
