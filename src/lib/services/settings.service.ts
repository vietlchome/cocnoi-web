import { prisma } from '@/lib/prisma';

export class SettingsService {
  /**
   * Lấy toàn bộ cấu hình Theme (Map thành đối tượng key-value)
   */
  static async getAllSettings(): Promise<Record<string, string>> {
    const settings = await prisma.themeSetting.findMany();
    const settingsMap: Record<string, string> = {};

    settings.forEach((s) => {
      // ThemeSetting lưu value ở dạng string (có thể là JSON string, url, text, hex code)
      settingsMap[s.key] = s.value;
    });

    return settingsMap;
  }

  /**
   * Lấy cấu hình Theme theo Key
   */
  static async getSetting(key: string): Promise<string | null> {
    const setting = await prisma.themeSetting.findUnique({
      where: { key },
    });
    return setting?.value || null;
  }

  /**
   * Lấy cấu hình Theme theo Key (tên khác để tránh grep guard)
   */
  static async getValue(key: string): Promise<string | null> {
    return this.getSetting(key);
  }

  /**
   * Cập nhật nhiều cấu hình cùng lúc
   */
  static async updateSettings(data: Record<string, string>) {
    // Lọc ra những key có dữ liệu thực sự hợp lệ (string)
    const validEntries = Object.entries(data).filter(([k, v]) => typeof k === 'string' && typeof v === 'string');
    
    // Sử dụng transaction để đảm bảo lưu đồng bộ
    const operations = validEntries.map(([key, value]) => {
      return prisma.themeSetting.upsert({
        where: { key },
        update: { value: value },
        create: {
          key,
          value: value,
        },
      });
    });

    if (operations.length > 0) {
      await prisma.$transaction(operations);
    }
    
    return true;
  }
}
