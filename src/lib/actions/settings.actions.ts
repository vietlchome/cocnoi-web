'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { SettingsService } from '@/lib/services/settings.service';
import { revalidatePath } from 'next/cache';

export async function getSettingsAction() {
  try {
    const data = await SettingsService.getAllSettings();
    return { success: true, data };
  } catch (error: any) {
    console.error("Error fetching settings:", error);
    return { success: false, error: error.message || 'Lỗi khi tải cấu hình' };
  }
}

export async function updateSettingsAction(data: Record<string, string>) {
  try {
    await requireAdmin();
    
    // Đảm bảo data là một object hợp lệ
    if (!data || typeof data !== 'object') {
      throw new Error('Dữ liệu không hợp lệ');
    }

    await SettingsService.updateSettings(data);
    
    // Xóa cache các trang tĩnh để thấy sự thay đổi
    revalidatePath('/');
    revalidatePath('/admin/customize');
    // Revalidate tất cả các route sử dụng layout chung (header/footer)
    revalidatePath('/', 'layout'); 

    return { success: true };
  } catch (error: any) {
    console.error("Error updating settings:", error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật cấu hình' };
  }
}
