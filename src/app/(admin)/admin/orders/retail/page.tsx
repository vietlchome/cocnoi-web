import React from 'react'
import OrdersClient from '@/components/admin/OrdersClient'
import { getOrders } from '@/lib/actions/order.actions'
import { ContentService } from '@/lib/services/content.service'

export const dynamic = 'force-dynamic'

export default async function AdminOrdersPage() {
  // Pass undefined for statusFilter, and 'RETAIL' for typeFilter
  const result = await getOrders(undefined, 'RETAIL')
  const orders = result.success ? result.data : []
  const bankSettings = await ContentService.getAllThemeSettings() || {}

  // Ensure dates are parsed correctly to avoid client hydration errors
  const formattedOrders = (orders || []).map((order: any) => ({
    ...order,
    createdAt: new Date(order.createdAt),
    updatedAt: new Date(order.updatedAt)
  }))

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-primary">Đơn Lẻ B2C</h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý toàn bộ hóa đơn mua lẻ tự động từ cửa hàng (Website/Cửa hàng).
          </p>
        </div>
      </div>

      <OrdersClient initialOrders={formattedOrders} bankSettings={bankSettings} />
    </div>
  )
}
