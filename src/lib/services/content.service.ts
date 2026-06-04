import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils/slug';

export class ContentService {
  // ---------------------------------------------------------
  // BLOG CMS (POSTS)
  // ---------------------------------------------------------

  /**
   * Tạo một bài viết blog mới (Tự động sinh slug duy nhất chống trùng)
   */
  static async createPost(data: {
    title: string;
    excerpt?: string | null;
    content: string;
    coverImage?: string | null;
    isPublished?: boolean;
  }) {
    let baseSlug = slugify(data.title);
    let slug = baseSlug;
    let counter = 1;

    // Vòng lặp kiểm tra trùng slug, nếu trùng tự thêm hậu tố số
    while (true) {
      const existing = await prisma.post.findUnique({
        where: { slug },
        select: { id: true },
      });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const isPublished = data.isPublished ?? false;
    const publishedAt = isPublished ? new Date() : null;

    return prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        isPublished,
        publishedAt,
      },
    });
  }

  /**
   * Cập nhật thông tin bài viết blog
   */
  static async updatePost(
    id: string,
    data: Partial<{
      title: string;
      excerpt: string | null;
      content: string;
      coverImage: string | null;
      isPublished: boolean;
    }>
  ) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { title: true, slug: true, isPublished: true, publishedAt: true },
    });

    if (!post) {
      throw new Error('Không tìm thấy bài viết blog cần cập nhật!');
    }

    const updateData: any = {};

    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.content !== undefined) updateData.content = data.content;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;

    // Nếu đổi tiêu đề, sinh lại slug mới
    if (data.title !== undefined && data.title !== post.title) {
      let baseSlug = slugify(data.title);
      let slug = baseSlug;
      let counter = 1;

      while (true) {
        const existing = await prisma.post.findUnique({
          where: { slug },
          select: { id: true },
        });
        // Bỏ qua chính bài viết đang update
        if (!existing || existing.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.title = data.title;
      updateData.slug = slug;
    }

    // Nếu thay đổi trạng thái xuất bản
    if (data.isPublished !== undefined && data.isPublished !== post.isPublished) {
      updateData.isPublished = data.isPublished;
      updateData.publishedAt = data.isPublished
        ? (post.publishedAt || new Date())
        : null;
    }

    return prisma.post.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Xóa bài viết blog
   */
  static async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  }

  /**
   * Lấy chi tiết bài viết blog qua Slug
   */
  static async getPostBySlug(slug: string) {
    return prisma.post.findUnique({
      where: { slug },
    });
  }

  /**
   * Liệt kê danh sách bài viết blog (Có phân trang, bộ lọc công khai, tìm kiếm)
   */
  static async listPosts(params: {
    page?: number;
    pageSize?: number;
    isPublished?: boolean;
    search?: string;
  } = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.isPublished !== undefined) {
      where.isPublished = params.isPublished;
    }

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: 'insensitive' } },
        { excerpt: { contains: params.search, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await prisma.$transaction([
      prisma.post.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.post.count({ where }),
    ]);

    return { data, totalCount, page, pageSize };
  }

  /**
   * Xuất bản bài viết công khai
   */
  static async publishPost(id: string) {
    return prisma.post.update({
      where: { id },
      data: {
        isPublished: true,
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Hủy xuất bản bài viết
   */
  static async unpublishPost(id: string) {
    return prisma.post.update({
      where: { id },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    });
  }

  // ---------------------------------------------------------
  // THEME CUSTOMIZER (SETTINGS)
  // ---------------------------------------------------------

  /**
   * Lấy cấu hình Theme theo Key
   */
  static async getThemeSetting(key: string): Promise<any | null> {
    const setting = await prisma.themeSetting.findUnique({
      where: { key },
    });

    if (!setting) return null;

    try {
      return JSON.parse(setting.value);
    } catch {
      return setting.value; // Fallback nếu chuỗi thường
    }
  }

  /**
   * Thiết lập / Lưu cấu hình Theme (Lưu dạng JSON string)
   */
  static async setThemeSetting(key: string, value: any) {
    const serializedValue = JSON.stringify(value);

    return prisma.themeSetting.upsert({
      where: { key },
      update: { value: serializedValue },
      create: {
        key,
        value: serializedValue,
      },
    });
  }

  /**
   * Lấy toàn bộ cấu hình Theme (Map thành đối tượng key-value để cấu hình nhanh)
   */
  static async getAllThemeSettings() {
    const settings = await prisma.themeSetting.findMany();
    const settingsMap: { [key: string]: any } = {};

    settings.forEach((s) => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    });

    return settingsMap;
  }
}
