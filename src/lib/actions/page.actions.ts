'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { PageService } from '@/lib/services/page.service';
import { pageInputSchema, updatePageInputSchema } from '@/lib/validators/page.schema';
import { revalidatePath } from 'next/cache';

export async function createPageAction(input: unknown) {
  await requireAdmin();

  try {
    const validated = pageInputSchema.parse(input);
    const page = await PageService.createPage(validated);

    revalidatePath('/admin/website/pages');
    revalidatePath('/trang/' + page.slug);
    revalidatePath('/', 'layout');

    return { success: true, data: page };
  } catch (error: any) {
    console.error('Lỗi khi tạo trang nội dung:', error);
    return { success: false, error: error.message || 'Lỗi khi tạo trang.' };
  }
}

export async function updatePageAction(id: string, input: unknown) {
  await requireAdmin();

  try {
    const validated = updatePageInputSchema.parse(input);
    const page = await PageService.updatePage(id, validated as any);

    revalidatePath('/admin/website/pages');
    revalidatePath('/trang/' + page.slug);
    revalidatePath('/', 'layout');

    return { success: true, data: page };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trang nội dung:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật trang.' };
  }
}

export async function deletePageAction(id: string) {
  await requireAdmin();

  try {
    await PageService.deletePage(id);

    revalidatePath('/admin/website/pages');
    revalidatePath('/', 'layout');

    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi xóa trang nội dung:', error);
    return { success: false, error: error.message || 'Lỗi khi xóa trang.' };
  }
}

export async function togglePageVisibilityAction(id: string, visible: boolean) {
  await requireAdmin();

  try {
    const page = await PageService.togglePageVisibility(id, visible);

    revalidatePath('/admin/website/pages');
    revalidatePath('/trang/' + page.slug);

    return { success: true, data: page };
  } catch (error: any) {
    console.error('Lỗi khi đổi trạng thái hiển thị trang:', error);
    return { success: false, error: error.message || 'Lỗi khi đổi trạng thái.' };
  }
}
