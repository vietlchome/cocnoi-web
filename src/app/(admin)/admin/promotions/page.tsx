import React from 'react'
import PromotionsClient from '@/components/admin/promotions/PromotionsClient'
import { getPromotions } from '@/lib/actions/promotion.actions'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export default async function AdminPromotionsPage() {
  const [promotionsRes, categories, productGroups, sizes, colors] = await Promise.all([
    getPromotions(),
    prisma.category.findMany({ select: { id: true, name: true } }),
    prisma.productGroup.findMany({ select: { id: true, name: true } }),
    prisma.sizeOption.findMany({ select: { id: true, name: true } }),
    prisma.colorOption.findMany({ select: { id: true, name: true } })
  ]);
  
  const promotions = promotionsRes.success && promotionsRes.data ? promotionsRes.data : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-playfair font-bold text-2xl text-primary">Chiến dịch Khuyến mãi</h1>
          <p className="text-xs text-secondary/60 mt-1">
            Quản lý mã giảm giá và các chiến dịch giảm giá tự động theo % cho khách hàng.
          </p>
        </div>
      </div>

      <PromotionsClient 
        initialPromotions={promotions} 
        categories={categories} 
        productGroups={productGroups}
        sizes={sizes}
        colors={colors}
      />
    </div>
  )
}
