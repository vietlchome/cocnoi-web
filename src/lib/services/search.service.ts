import { prisma } from "@/lib/prisma";

export interface GroupedSearchResults {
  products: Array<{
    id: string;
    sku: string | null;
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string;
  }>;
  posts: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImage: string | null;
    createdAt: Date;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export class SearchService {
  /**
   * Search across Products, Posts, and Categories
   * @param query Search query text
   * @param limit Max items per group (default 5 for products, 3 for posts/categories)
   */
  static async searchAll(query: string, limit = 5): Promise<GroupedSearchResults> {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      return { products: [], posts: [], categories: [] };
    }

    const [products, posts, categories] = await Promise.all([
      // 1. Search Active Products
      prisma.product.findMany({
        where: {
          isActive: true,
          OR: [
            { name: { contains: trimmed, mode: "insensitive" } },
            { description: { contains: trimmed, mode: "insensitive" } },
            { sku: { contains: trimmed, mode: "insensitive" } },
            { shortDescription: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          sku: true,
          name: true,
          slug: true,
          price: true,
          compareAtPrice: true,
          images: true,
        },
        take: limit,
      }),

      // 2. Search Published Blog/Campaign Posts
      prisma.post.findMany({
        where: {
          isPublished: true,
          OR: [
            { title: { contains: trimmed, mode: "insensitive" } },
            { excerpt: { contains: trimmed, mode: "insensitive" } },
            { content: { contains: trimmed, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          coverImage: true,
          createdAt: true,
        },
        take: Math.max(3, Math.floor(limit / 2)),
      }),

      // 3. Search Product Categories
      prisma.category.findMany({
        where: {
          name: { contains: trimmed, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: Math.max(3, Math.floor(limit / 2)),
      }),
    ]);

    return {
      products,
      posts,
      categories,
    };
  }
}
