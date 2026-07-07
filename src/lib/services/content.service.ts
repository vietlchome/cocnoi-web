import { prisma } from '@/lib/prisma';
import { POST_CATEGORY_VALUES } from '@/lib/post-categories';
import { slugify } from '@/lib/utils/slug';
import { PostStatus } from '@prisma/client';

function calculateReadingTime(htmlContent: string): number {
  const plainText = htmlContent.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plainText) return 1;
  const wordCount = plainText.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / 200));
}

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
    category?: string;
    status?: PostStatus;
    scheduledFor?: Date | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    ogImage?: string | null;
    authorName?: string | null;
    tags?: string[];
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

    const status = data.status || PostStatus.DRAFT;
    const publishedAt = status === PostStatus.PUBLISHED ? new Date() : null;
    const readingTime = calculateReadingTime(data.content);

    return prisma.post.create({
      data: {
        title: data.title,
        slug,
        excerpt: data.excerpt || null,
        content: data.content,
        coverImage: data.coverImage || null,
        category: data.category || POST_CATEGORY_VALUES.uncategorized,
        status,
        publishedAt,
        scheduledFor: data.scheduledFor || null,
        metaTitle: data.metaTitle || null,
        metaDescription: data.metaDescription || null,
        ogImage: data.ogImage || null,
        authorName: data.authorName || 'Cốc Nối',
        tags: data.tags || [],
        readingTime,
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
      category: string;
      status: PostStatus;
      scheduledFor: Date | null;
      metaTitle: string | null;
      metaDescription: string | null;
      ogImage: string | null;
      authorName: string | null;
      tags: string[];
    }>
  ) {
    const post = await prisma.post.findUnique({
      where: { id },
      select: { title: true, slug: true, status: true, publishedAt: true },
    });

    if (!post) {
      throw new Error('Không tìm thấy bài viết cần cập nhật!');
    }

    const updateData: any = {};

    if (data.excerpt !== undefined) updateData.excerpt = data.excerpt;
    if (data.coverImage !== undefined) updateData.coverImage = data.coverImage;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.metaTitle !== undefined) updateData.metaTitle = data.metaTitle;
    if (data.metaDescription !== undefined) updateData.metaDescription = data.metaDescription;
    if (data.ogImage !== undefined) updateData.ogImage = data.ogImage;
    if (data.authorName !== undefined) updateData.authorName = data.authorName;
    if (data.tags !== undefined) updateData.tags = data.tags;
    if (data.scheduledFor !== undefined) updateData.scheduledFor = data.scheduledFor;

    if (data.content !== undefined) {
      updateData.content = data.content;
      // Re-calculate reading time
      updateData.readingTime = calculateReadingTime(data.content);
    }

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
        if (!existing || existing.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.title = data.title;
      updateData.slug = slug;
    }

    // Nếu thay đổi trạng thái xuất bản
    if (data.status !== undefined && data.status !== post.status) {
      updateData.status = data.status;
      if (data.status === PostStatus.PUBLISHED) {
        updateData.publishedAt = post.publishedAt || new Date();
      } else {
        updateData.publishedAt = null;
      }
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
    status?: string;
    isPublished?: boolean;
    search?: string;
    category?: string;
  } = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.status) {
      where.status = params.status as PostStatus;
    } else if (params.isPublished !== undefined) {
      if (params.isPublished) {
        where.status = PostStatus.PUBLISHED;
        where.publishedAt = { lte: new Date() };
      } else {
        where.status = { in: [PostStatus.DRAFT, PostStatus.SCHEDULED] };
      }
    }

    if (params.category) {
      where.category = params.category;
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
        status: PostStatus.PUBLISHED,
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
        status: PostStatus.DRAFT,
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

    settings.forEach((s: any) => {
      try {
        settingsMap[s.key] = JSON.parse(s.value);
      } catch {
        settingsMap[s.key] = s.value;
      }
    });

    return settingsMap;
  }
}
