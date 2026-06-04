'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { revalidatePath } from 'next/cache';

export async function getPromotions() {
  await requireAdmin();
  try {
    const promotions = await prisma.promotion.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, data: promotions };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách khuyến mãi:', error);
    return { success: false, error: 'Lỗi khi lấy danh sách khuyến mãi.' };
  }
}

export async function createPromotion(data: {
  name: string;
  code?: string | null;
  type: 'PERCENTAGE' | 'FIXED_AMOUNT';
  isAutomatic: boolean;
  value: number;
  minOrderValue: number;
  startDate: Date;
  endDate?: Date | null;
  usageLimit?: number | null;
  appliedCategoryIds: string[];
  appliedCollectionIds: string[];
  appliedProductCodes: string[];
  appliedSizes: string[];
  appliedColors: string[];
  canCombine: boolean;
  isActive: boolean;
}) {
  await requireAdmin();
  try {
    if (!data.isAutomatic && !data.code) {
      return { success: false, error: 'Vui lòng nhập mã giảm giá!' };
    }

    const promotion = await prisma.promotion.create({
      data: {
        name: data.name,
        code: data.isAutomatic ? null : data.code,
        type: data.type,
        isAutomatic: data.isAutomatic,
        value: data.value,
        minOrderValue: data.minOrderValue,
        startDate: data.startDate,
        endDate: data.endDate,
        usageLimit: data.usageLimit,
        isActive: data.isActive,
        canCombine: data.canCombine,
        appliedCategoryIds: data.appliedCategoryIds,
        appliedCollectionIds: data.appliedCollectionIds,
        appliedProductCodes: data.appliedProductCodes,
        appliedSizes: data.appliedSizes,
        appliedColors: data.appliedColors,
      },
    });

    revalidatePath('/admin/promotions');
    return { success: true, data: promotion };
  } catch (error: any) {
    console.error('Lỗi khi tạo khuyến mãi:', error);
    if (error.code === 'P2002') {
      return { success: false, error: 'Mã giảm giá này đã tồn tại!' };
    }
    return { success: false, error: 'Lỗi hệ thống khi tạo khuyến mãi.' };
  }
}

export async function togglePromotionStatus(id: string, isActive: boolean) {
  await requireAdmin();
  try {
    await prisma.promotion.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái:', error);
    return { success: false, error: 'Lỗi hệ thống.' };
  }
}

export async function deletePromotion(id: string) {
  await requireAdmin();
  try {
    await prisma.promotion.delete({
      where: { id },
    });
    revalidatePath('/admin/promotions');
    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi xóa khuyến mãi:', error);
    return { success: false, error: 'Lỗi hệ thống.' };
  }
}

export async function getFilteredPromotionOptions(categoryIds: string[], collectionIds: string[]) {
  await requireAdmin();
  try {
    const whereClause: any = { isActive: true };
    if (categoryIds.length > 0) {
      whereClause.categoryId = { in: categoryIds };
    }
    if (collectionIds.length > 0) {
      whereClause.productGroupId = { in: collectionIds };
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      select: { categoryId: true, productGroupId: true, sizeId: true, colorId: true },
    });

    return {
      success: true,
      data: {
        categoryIds: Array.from(new Set(products.map(p => p.categoryId).filter(Boolean))),
        collectionIds: Array.from(new Set(products.map(p => p.productGroupId).filter(Boolean))),
        sizeIds: Array.from(new Set(products.map(p => p.sizeId).filter(Boolean))),
        colorIds: Array.from(new Set(products.map(p => p.colorId).filter(Boolean))),
      }
    };
  } catch (error) {
    console.error('Lỗi khi lấy options:', error);
    return { success: false, error: 'Lỗi hệ thống' };
  }
}
