import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils/slug';

export class PageService {
  static async listPages() {
    return prisma.page.findMany({
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
    });
  }

  static async getPageById(id: string) {
    return prisma.page.findUnique({ where: { id } });
  }

  static async getPageBySlugPublic(slug: string) {
    return prisma.page.findFirst({
      where: { slug, visible: true },
    });
  }

  static async getVisiblePageSlugs(): Promise<string[]> {
    const pages = await prisma.page.findMany({
      where: { visible: true },
      select: { slug: true },
    });
    return pages.map((p: { slug: string }) => p.slug);
  }

  static async createPage(data: {
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
    visible?: boolean;
    sortOrder?: number;
  }) {
    let finalSlug = data.slug || slugify(data.title);

    // Ensure unique slug
    const base = finalSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.page.findUnique({
        where: { slug: finalSlug },
        select: { id: true },
      });
      if (!existing) break;
      finalSlug = `${base}-${counter}`;
      counter++;
    }

    try {
      return await prisma.page.create({
        data: {
          title: data.title,
          slug: finalSlug,
          content: data.content,
          excerpt: data.excerpt ?? null,
          metaTitle: data.metaTitle ?? null,
          metaDescription: data.metaDescription ?? null,
          ogImage: data.ogImage ?? null,
          visible: data.visible ?? true,
          sortOrder: data.sortOrder ?? 0,
        },
      });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new Error('Slug này đã tồn tại. Vui lòng chọn slug khác.');
      }
      throw error;
    }
  }

  static async updatePage(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      excerpt: string | null;
      metaTitle: string | null;
      metaDescription: string | null;
      ogImage: string | null;
      visible: boolean;
      sortOrder: number;
    }>
  ) {
    const page = await prisma.page.findUnique({ where: { id }, select: { id: true } });
    if (!page) throw new Error('Không tìm thấy trang cần cập nhật.');

    if (data.slug) {
      // Verify new slug is unique (exclude current page)
      const conflict = await prisma.page.findUnique({
        where: { slug: data.slug },
        select: { id: true },
      });
      if (conflict && conflict.id !== id) {
        throw new Error('Slug này đã tồn tại. Vui lòng chọn slug khác.');
      }
    }

    try {
      return await prisma.page.update({ where: { id }, data });
    } catch (error: any) {
      if (error?.code === 'P2002') {
        throw new Error('Slug này đã tồn tại. Vui lòng chọn slug khác.');
      }
      throw error;
    }
  }

  static async deletePage(id: string) {
    return prisma.page.delete({ where: { id } });
  }

  static async togglePageVisibility(id: string, visible: boolean) {
    return prisma.page.update({ where: { id }, data: { visible } });
  }
}
