'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { ContentService } from '@/lib/services/content.service';
import { CreatePostSchema, UpdatePostSchema } from '@/lib/validators/content.schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// =========================================================
// 1. BLOG CMS ACTIONS (POSTS)
// =========================================================

export async function createPost(data: z.infer<typeof CreatePostSchema>) {
  await requireAdmin();

  try {
    const validated = CreatePostSchema.parse(data);
    const post = await ContentService.createPost(validated);

    revalidatePath('/admin/website/blogs');
    revalidatePath('/journal');
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Lỗi khi tạo bài viết blog:', error);
    return { success: false, error: error.message || 'Lỗi khi tạo bài viết.' };
  }
}

export async function updatePost(id: string, data: z.infer<typeof UpdatePostSchema>) {
  await requireAdmin();

  try {
    const validated = UpdatePostSchema.parse(data);
    const post = await ContentService.updatePost(id, validated);

    revalidatePath('/admin/website/blogs');
    revalidatePath('/journal');
    revalidatePath(`/journal/${post.slug}`);
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật bài viết blog:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật bài viết.' };
  }
}

export async function deletePost(id: string) {
  await requireAdmin();

  try {
    await ContentService.deletePost(id);

    revalidatePath('/admin/website/blogs');
    revalidatePath('/journal');
    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi xóa bài viết blog:', error);
    return { success: false, error: error.message || 'Lỗi khi xóa bài viết.' };
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const post = await ContentService.getPostBySlug(slug);
    if (!post) return { success: false, error: 'Không tìm thấy bài viết yêu cầu!' };
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Lỗi khi lấy chi tiết bài viết:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy chi tiết bài viết.' };
  }
}

export async function getPosts(params?: {
  page?: number;
  pageSize?: number;
  isPublished?: boolean;
  search?: string;
}) {
  try {
    const result = await ContentService.listPosts(params || {});
    return { success: true, data: result.data, totalCount: result.totalCount };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách bài viết:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách bài viết.' };
  }
}

export async function publishPost(id: string) {
  await requireAdmin();

  try {
    const post = await ContentService.publishPost(id);

    revalidatePath('/admin/website/blogs');
    revalidatePath('/journal');
    revalidatePath(`/journal/${post.slug}`);
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Lỗi khi xuất bản bài viết:', error);
    return { success: false, error: error.message || 'Lỗi khi xuất bản bài viết.' };
  }
}

export async function unpublishPost(id: string) {
  await requireAdmin();

  try {
    const post = await ContentService.unpublishPost(id);

    revalidatePath('/admin/website/blogs');
    revalidatePath('/journal');
    revalidatePath(`/journal/${post.slug}`);
    return { success: true, data: post };
  } catch (error: any) {
    console.error('Lỗi khi hủy xuất bản bài viết:', error);
    return { success: false, error: error.message || 'Lỗi khi hủy xuất bản bài viết.' };
  }
}

// =========================================================
// 2. THEME CUSTOMIZER ACTIONS (SETTINGS)
// =========================================================

export async function getThemeSetting(key: string) {
  try {
    const value = await ContentService.getThemeSetting(key);
    return { success: true, data: value };
  } catch (error: any) {
    console.error('Lỗi khi lấy cài đặt Theme:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy cài đặt.' };
  }
}

export async function setThemeSetting(key: string, value: any) {
  await requireAdmin();

  try {
    const setting = await ContentService.setThemeSetting(key, value);
    
    // Cài đặt Theme Setting có thể ảnh hưởng đến toàn bộ giao diện
    revalidatePath('/', 'layout');
    return { success: true, data: setting };
  } catch (error: any) {
    console.error('Lỗi khi lưu cài đặt Theme:', error);
    return { success: false, error: error.message || 'Lỗi khi lưu cài đặt.' };
  }
}

export async function getAllThemeSettings() {
  try {
    const settingsMap = await ContentService.getAllThemeSettings();
    return { success: true, data: settingsMap };
  } catch (error: any) {
    console.error('Lỗi khi lấy toàn bộ cài đặt Theme:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy toàn bộ cài đặt.' };
  }
}
