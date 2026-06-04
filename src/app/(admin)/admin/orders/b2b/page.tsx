import React from 'react'
import OrdersClient from '@/components/admin/OrdersClient'
import { getOrders } from '@/lib/actions/order.actions'
import { ContentService } from '@/lib/services/content.service'

export const dynamic = 'force-dynamic'

export default async function AdminB2BOrdersPage() {
  // Pass undefined for statusFilter, and 'B2B' for typeFilter
  const result = await getOrders(undefined, 'B2B')
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
          <h1 className="font-playfair font-bold text-2xl text-primary">Đơn Sỉ B2B & Hợp Đồng</h1>
          <p className="text-xs text-gray-500 mt-1">
            Quản lý toàn bộ đơn bán sỉ, đơn gia công và đơn quà tặng doanh nghiệp (B2B).
          </p>
        </div>
      </div>

      <OrdersClient initialOrders={formattedOrders} bankSettings={bankSettings} />
    </div>
  )
}
