'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { ProductService } from '@/lib/services/product.service';
import { CreateProductSchema, UpdateProductSchema } from '@/lib/validators/product.schema';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

// =========================================================
// 1. CATEGORY ACTIONS
// =========================================================

export async function createCategory(name: string) {
  await requireAdmin();

  try {
    const category = await ProductService.createCategory(name);
    revalidatePath('/admin/categories');
    revalidatePath('/cua-hang');
    revalidateTag('mega-menu-data', 'default');
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo danh mục.' };
  }
}

export async function updateCategory(id: string, name: string) {
  await requireAdmin();

  try {
    const category = await ProductService.updateCategory(id, name);
    revalidatePath('/admin/categories');
    revalidatePath('/cua-hang');
    revalidateTag('mega-menu-data', 'default');
    return { success: true, data: category };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật danh mục.' };
  }
}

export async function deleteCategory(id: string) {
  await requireAdmin();

  try {
    await ProductService.deleteCategory(id);
    revalidatePath('/admin/categories');
    revalidatePath('/cua-hang');
    revalidateTag('mega-menu-data', 'default');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa danh mục.' };
  }
}

// =========================================================
// 2. PRODUCT ACTIONS
// =========================================================

export async function createProduct(productData: z.infer<typeof CreateProductSchema>) {
  await requireAdmin();

  try {
    const validated = CreateProductSchema.parse(productData);
    const product = await ProductService.createProduct(validated);
    
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/cua-hang');
    return { success: true, data: product };
  } catch (error: any) {
    console.error('Lỗi khi tạo sản phẩm:', error);
    return { success: false, error: error.message || 'Lỗi khi tạo sản phẩm.' };
  }
}

export async function updateProduct(id: string, productData: z.infer<typeof UpdateProductSchema>) {
  await requireAdmin();

  try {
    const validated = UpdateProductSchema.parse(productData);
    const product = await ProductService.updateProduct(id, validated);

    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/cua-hang');
    revalidatePath(`/cua-hang/${product.slug}`);
    return { success: true, data: product };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật sản phẩm.' };
  }
}

export async function getAdminProducts(params?: {
  query?: string;
  categoryId?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  await requireAdmin();

  try {
    const result = await ProductService.listProducts(params || {});
    return { success: true, data: result.data, totalCount: result.totalCount };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách sản phẩm.' };
  }
}

export async function getProductById(id: string) {
  try {
    const product = await ProductService.getProductById(id);
    if (!product) return { success: false, error: 'Không tìm thấy sản phẩm.' };
    return { success: true, data: product };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy chi tiết sản phẩm.' };
  }
}

export async function deleteProductSoft(id: string) {
  await requireAdmin();

  try {
    const product = await ProductService.softDeleteProduct(id);
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/cua-hang');
    revalidatePath(`/cua-hang/${product.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa mềm sản phẩm.' };
  }
}

export async function restoreProduct(id: string) {
  await requireAdmin();

  try {
    const product = await ProductService.restoreProduct(id);
    revalidatePath('/admin/products');
    revalidatePath('/');
    revalidatePath('/cua-hang');
    revalidatePath(`/cua-hang/${product.slug}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi khôi phục sản phẩm.' };
  }
}

// =========================================================
// 3. PRODUCT GROUP ACTIONS
// =========================================================

export async function createProductGroup(name: string) {
  await requireAdmin();

  try {
    const group = await ProductService.createProductGroup(name);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidateTag('mega-menu-data', 'default');
    return { success: true, data: group };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo nhóm bộ sưu tập.' };
  }
}

export async function getProductGroups() {
  try {
    const groups = await prisma.productGroup.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: groups };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách nhóm bộ sưu tập.' };
  }
}

export async function updateProductGroup(id: string, name: string) {
  await requireAdmin();

  try {
    const group = await ProductService.updateProductGroup(id, name);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidateTag('mega-menu-data', 'default');
    return { success: true, data: group };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật bộ sưu tập.' };
  }
}

export async function deleteProductGroup(id: string) {
  await requireAdmin();

  try {
    await ProductService.deleteProductGroup(id);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    revalidateTag('mega-menu-data', 'default');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa bộ sưu tập.' };
  }
}

// =========================================================
// 4. COLOR OPTION ACTIONS
// =========================================================

export async function createColorOption(name: string, hex: string) {
  await requireAdmin();

  try {
    const color = await ProductService.createColorOption(name, hex);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true, data: color };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo màu sắc.' };
  }
}

export async function getColorOptions() {
  try {
    const colors = await prisma.colorOption.findMany({
      orderBy: { name: 'asc' },
    });
    return { success: true, data: colors };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách màu sắc.' };
  }
}

export async function updateColorOption(id: string, name: string, hex: string) {
  await requireAdmin();

  try {
    const color = await ProductService.updateColorOption(id, name, hex);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true, data: color };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật màu sắc.' };
  }
}

export async function deleteColorOption(id: string) {
  await requireAdmin();

  try {
    await ProductService.deleteColorOption(id);
    revalidatePath('/admin/categories');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa màu sắc.' };
  }
}

// =========================================================
// 5. SIZE OPTION ACTIONS
// =========================================================

export async function createSizeOption(name: string, description?: string | null, sortOrder?: number) {
  await requireAdmin();

  try {
    const size = await ProductService.createSizeOption(name, description, sortOrder);
    revalidatePath('/admin/products/settings');
    revalidatePath('/admin/products');
    return { success: true, data: size };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi tạo kích cỡ.' };
  }
}

export async function getSizeOptions() {
  try {
    const sizes = await prisma.sizeOption.findMany({
      orderBy: [
        { sortOrder: 'asc' },
        { name: 'asc' }
      ],
    });
    return { success: true, data: sizes };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách kích cỡ.' };
  }
}

export async function updateSizeOption(id: string, name: string, description?: string | null, sortOrder?: number) {
  await requireAdmin();

  try {
    const size = await ProductService.updateSizeOption(id, name, description, sortOrder);
    revalidatePath('/admin/products/settings');
    revalidatePath('/admin/products');
    return { success: true, data: size };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi cập nhật kích cỡ.' };
  }
}

export async function deleteSizeOption(id: string) {
  await requireAdmin();

  try {
    await ProductService.deleteSizeOption(id);
    revalidatePath('/admin/products/settings');
    revalidatePath('/admin/products');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi xóa kích cỡ.' };
  }
}

export async function reorderSizeOptions(ids: string[]) {
  await requireAdmin();

  try {
    await ProductService.reorderSizeOptions(ids);
    revalidatePath('/admin/products/settings');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || 'Lỗi khi thay đổi thứ tự kích cỡ.' };
  }
}
