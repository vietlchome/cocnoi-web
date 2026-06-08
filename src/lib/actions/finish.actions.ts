'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { FinishService, FinishInput } from '@/lib/services/finish.service';
import { revalidatePath } from 'next/cache';

/**
 * Lấy danh sách toàn bộ kỹ thuật hoàn thiện
 */
export async function getFinishes() {
  try {
    const finishes = await FinishService.getFinishes();
    return { success: true, data: finishes };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách kỹ thuật hoàn thiện.' };
  }
}

/**
 * Lấy chi tiết kỹ thuật hoàn thiện theo ID
 */
export async function getFinishById(id: string) {
  try {
    const finish = await FinishService.getFinishById(id);
    return { success: true, data: finish };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy thông tin kỹ thuật hoàn thiện.' };
  }
}

/**
 * Tạo mới kỹ thuật hoàn thiện
 */
export async function createFinish(data: FinishInput) {
  await requireAdmin();

  try {
    const finish = await FinishService.createFinish(data);
    revalidatePath('/admin/products/settings');
    revalidatePath('/admin/products');
    return { success: true, data: finish };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo kỹ thuật hoàn thiện.' };
  }
}

/**
 * Cập nhật kỹ thuật hoàn thiện
 */
export async function updateFinish(id: string, data: FinishInput) {
  await requireAdmin();

  try {
    const finish = await FinishService.updateFinish(id, data);
    revalidatePath('/admin/products/settings');
    revalidatePath('/admin/products');
    return { success: true, data: finish };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật kỹ thuật hoàn thiện.' };
  }
}

/**
 * Xóa kỹ thuật hoàn thiện.
 * Nếu force = false và có sản phẩm đang sử dụng, trả về cảnh báo để người dùng xác nhận.
 */
export async function deleteFinish(id: string, force = false) {
  await requireAdmin();

  try {
    const productCount = await prisma.product.count({
      where: { finishes: { some: { id } } }
    });

    if (productCount > 0 && !force) {
      return {
        success: false,
        warning: true,
        message: `${productCount} sản phẩm đang dùng kỹ thuật này. Xóa sẽ gỡ liên kết khỏi sản phẩm. Bạn có chắc chắn muốn tiếp tục?`
      };
    }

    await FinishService.deleteFinish(id);
    revalidatePath('/admin/products/settings');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa kỹ thuật hoàn thiện.' };
  }
}

/**
 * Thay đổi thứ tự sắp xếp kỹ thuật hoàn thiện
 */
export async function reorderFinishes(ids: string[]) {
  await requireAdmin();

  try {
    await FinishService.reorderFinishes(ids);
    revalidatePath('/admin/products/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi thay đổi thứ tự kỹ thuật hoàn thiện.' };
  }
}
