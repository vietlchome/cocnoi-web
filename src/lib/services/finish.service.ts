import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils/slug';

export interface FinishInput {
  name: string;
  slug?: string | null;
  description?: string | null;
  imageUrl?: string | null;
  sortOrder?: number;
}

export class FinishService {
  /**
   * Lấy danh sách kỹ thuật hoàn thiện
   */
  static async getFinishes() {
    return prisma.finishOption.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  }

  /**
   * Lấy chi tiết kỹ thuật hoàn thiện theo ID
   */
  static async getFinishById(id: string) {
    return prisma.finishOption.findUnique({
      where: { id },
    });
  }

  /**
   * Tạo mới kỹ thuật hoàn thiện
   */
  static async createFinish(data: FinishInput) {
    const existingName = await prisma.finishOption.findUnique({
      where: { name: data.name },
    });
    if (existingName) {
      throw new Error(`Kỹ thuật hoàn thiện "${data.name}" đã tồn tại!`);
    }

    let slug = data.slug ? slugify(data.slug) : slugify(data.name);
    if (!slug) {
      throw new Error("Không thể tạo slug từ tên hoàn thiện!");
    }

    // Đảm bảo slug là duy nhất
    const baseSlug = slug;
    let counter = 1;
    while (true) {
      const existingSlug = await prisma.finishOption.findUnique({
        where: { slug },
      });
      if (!existingSlug) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.finishOption.create({
      data: {
        name: data.name,
        slug,
        description: data.description || null,
        imageUrl: data.imageUrl || null,
        sortOrder: data.sortOrder ?? 0,
      },
    });
  }

  /**
   * Cập nhật kỹ thuật hoàn thiện
   */
  static async updateFinish(id: string, data: FinishInput) {
    const current = await prisma.finishOption.findUnique({ where: { id } });
    if (!current) {
      throw new Error("Không tìm thấy kỹ thuật hoàn thiện!");
    }

    const existingName = await prisma.finishOption.findUnique({
      where: { name: data.name },
    });
    if (existingName && existingName.id !== id) {
      throw new Error(`Kỹ thuật hoàn thiện "${data.name}" đã tồn tại!`);
    }

    let slug = current.slug;
    if (data.slug && data.slug !== current.slug) {
      slug = slugify(data.slug);
    } else if (data.name !== current.name) {
      slug = slugify(data.name);
    }

    if (slug !== current.slug) {
      const baseSlug = slug;
      let counter = 1;
      while (true) {
        const existingSlug = await prisma.finishOption.findUnique({
          where: { slug },
        });
        if (!existingSlug || existingSlug.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    return prisma.finishOption.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        description: data.description !== undefined ? data.description : current.description,
        imageUrl: data.imageUrl !== undefined ? data.imageUrl : current.imageUrl,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : current.sortOrder,
      },
    });
  }

  /**
   * Xóa kỹ thuật hoàn thiện
   */
  static async deleteFinish(id: string) {
    return prisma.finishOption.delete({
      where: { id },
    });
  }

  /**
   * Thay đổi thứ tự sắp xếp các kỹ thuật hoàn thiện
   */
  static async reorderFinishes(ids: string[]) {
    return prisma.$transaction(
      ids.map((id, index) =>
        prisma.finishOption.update({
          where: { id },
          data: { sortOrder: index + 1 },
        })
      )
    );
  }
}
