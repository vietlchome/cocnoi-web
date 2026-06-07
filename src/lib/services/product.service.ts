import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils/slug';
import { Visibility } from '@prisma/client';

export class ProductService {
  // ---------------------------------------------------------
  // PRODUCT OPERATIONS
  // ---------------------------------------------------------

  /**
   * Tạo sản phẩm mới
   */
  static async createProduct(data: {
    sku?: string | null;
    name: string;
    description: string;
    shortDescription?: string | null;
    price: number;
    compareAtPrice?: number | null;
    stockQuantity?: number;
    weight?: number | null;
    images: string[];
    productGroupId?: string | null;
    colorId?: string | null;
    sizeId?: string | null;
    isActive?: boolean;
    visibility?: Visibility;
    categoryId?: string | null;
  }) {
    // 1. Chuẩn hóa & kiểm tra tính duy nhất của SKU
    if (data.sku) {
      const existingSku = await prisma.product.findUnique({
        where: { sku: data.sku },
      });
      if (existingSku) {
        throw new Error(`Mã SKU "${data.sku}" đã tồn tại trên hệ thống!`);
      }
    }

    // 2. Tạo Slug tự động & đảm bảo tính duy nhất
    let baseSlug = slugify(data.name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existingProduct = await prisma.product.findUnique({
        where: { slug },
      });
      if (!existingProduct) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // 3. Lưu vào database (Stringify mảng hình ảnh sang JSON)
    return prisma.product.create({
      data: {
        sku: data.sku || null,
        name: data.name,
        slug,
        description: data.description,
        shortDescription: data.shortDescription || null,
        price: data.price,
        compareAtPrice: data.compareAtPrice || null,
        stockQuantity: data.stockQuantity ?? 0,
        weight: data.weight ?? 0,
        images: data.images,
        productGroupId: data.productGroupId || null,
        colorId: data.colorId || null,
        sizeId: data.sizeId || null,
        isActive: data.isActive ?? true,
        visibility: (data.visibility as Visibility) || Visibility.PUBLIC,
        categoryId: data.categoryId || null,
      },
      include: {
        category: true,
        productGroup: true,
        color: true,
        size: true,
      },
    });
  }

  /**
   * Cập nhật sản phẩm
   */
  static async updateProduct(
    id: string,
    data: Partial<{
      sku: string | null;
      name: string;
      description: string;
      shortDescription: string | null;
      price: number;
      compareAtPrice: number | null;
      stockQuantity: number;
      weight: number | null;
      images: string[];
      productGroupId: string | null;
      colorId: string | null;
      sizeId: string | null;
      isActive: boolean;
      visibility: Visibility;
      categoryId: string | null;
    }>
  ) {
    const currentProduct = await prisma.product.findUnique({ where: { id } });
    if (!currentProduct) {
      throw new Error('Không tìm thấy sản phẩm cần cập nhật!');
    }

    const updateData: any = {};

    // 1. Kiểm tra SKU nếu có thay đổi
    if (data.sku !== undefined && data.sku !== currentProduct.sku) {
      if (data.sku) {
        const existingSku = await prisma.product.findUnique({
          where: { sku: data.sku },
        });
        if (existingSku) {
          throw new Error(`Mã SKU "${data.sku}" đã tồn tại trên hệ thống!`);
        }
      }
      updateData.sku = data.sku || null;
    }

    // 2. Kiểm tra & cập nhật Slug nếu tên thay đổi
    if (data.name !== undefined && data.name !== currentProduct.name) {
      let baseSlug = slugify(data.name);
      let slug = baseSlug;
      let counter = 1;
      while (true) {
        const existingProduct = await prisma.product.findUnique({
          where: { slug },
        });
        if (!existingProduct || existingProduct.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
      updateData.name = data.name;
      updateData.slug = slug;
    }

    // 3. Map các trường cơ bản
    if (data.description !== undefined) updateData.description = data.description;
    if (data.shortDescription !== undefined) updateData.shortDescription = data.shortDescription;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.compareAtPrice !== undefined) updateData.compareAtPrice = data.compareAtPrice;
    if (data.stockQuantity !== undefined) updateData.stockQuantity = data.stockQuantity;
    if (data.weight !== undefined) updateData.weight = data.weight;
    if (data.images !== undefined) updateData.images = data.images;
    if (data.productGroupId !== undefined) updateData.productGroupId = data.productGroupId || null;
    if (data.colorId !== undefined) updateData.colorId = data.colorId || null;
    if (data.sizeId !== undefined) updateData.sizeId = data.sizeId || null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.visibility !== undefined) updateData.visibility = data.visibility as Visibility;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId || null;

    return prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        productGroup: true,
        color: true,
        size: true,
      },
    });
  }

  /**
   * Lấy chi tiết sản phẩm bằng ID
   */
  static async getProductById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        productGroup: true,
        color: true,
        size: true,
      },
    });
  }

  /**
   * Lấy chi tiết sản phẩm bằng Slug (cho trang chi tiết khách hàng)
   * Đồng thời tìm các sản phẩm anh em (siblings) trong cùng nhóm sưu tập
   */
  static async getProductBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        productGroup: true,
        color: true,
        size: true,
      },
    });

    if (!product) return null;

    // Tìm các sản phẩm cùng nhóm bộ sưu tập (Flat Catalog siblings)
    let siblings: any[] = [];
    if (product.productGroupId) {
      siblings = await prisma.product.findMany({
        where: {
          productGroupId: product.productGroupId,
          id: { not: product.id },
          isActive: true,
        },
        include: {
          color: true,
          size: true,
        },
      });
    }

    return { product, siblings };
  }

  /**
   * Liệt kê sản phẩm cho trang quản trị (Admin list - có tìm kiếm, bộ lọc và phân trang)
   */
  static async listProducts(params: {
    query?: string;
    categoryId?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { sku: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.isActive !== undefined) {
      where.isActive = params.isActive;
    }

    const [data, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          productGroup: true,
          color: true,
          size: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, totalCount, page, pageSize };
  }

  /**
   * Liệt kê sản phẩm cho cửa hàng công khai (Storefront - chỉ hiện sản phẩm Active và Public)
   */
  static async listPublicProducts(params: {
    categoryId?: string;
    productGroupId?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 12;
    const skip = (page - 1) * pageSize;

    const where: any = {
      isActive: true,
      visibility: Visibility.PUBLIC,
    };

    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    if (params.productGroupId) {
      where.productGroupId = params.productGroupId;
    }

    const [data, totalCount] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          productGroup: true,
          color: true,
          size: true,
        },
      }),
      prisma.product.count({ where }),
    ]);

    return { data, totalCount, page, pageSize };
  }

  /**
   * Xóa mềm sản phẩm (Soft Delete)
   */
  static async softDeleteProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Khôi phục sản phẩm đã xóa mềm
   */
  static async restoreProduct(id: string) {
    return prisma.product.update({
      where: { id },
      data: { isActive: true },
    });
  }

  // ---------------------------------------------------------
  // CATEGORY OPERATIONS
  // ---------------------------------------------------------

  static async createCategory(name: string) {
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.category.create({
      data: { name, slug },
    });
  }

  static async updateCategory(id: string, name: string) {
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.category.update({
      where: { id },
      data: { name, slug },
    });
  }

  static async deleteCategory(id: string) {
    // Kiểm tra xem có sản phẩm nào đang dùng danh mục này không
    const attachedProducts = await prisma.product.count({
      where: { categoryId: id },
    });

    if (attachedProducts > 0) {
      throw new Error(
        `Không thể xóa danh mục này vì vẫn còn ${attachedProducts} sản phẩm đang liên kết!`
      );
    }

    return prisma.category.delete({ where: { id } });
  }

  // ---------------------------------------------------------
  // PRODUCT GROUP OPERATIONS
  // ---------------------------------------------------------

  static async createProductGroup(name: string) {
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.productGroup.findUnique({ where: { slug } });
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.productGroup.create({
      data: { name, slug },
    });
  }

  static async updateProductGroup(id: string, name: string) {
    let baseSlug = slugify(name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const existing = await prisma.productGroup.findUnique({ where: { slug } });
      if (!existing || existing.id === id) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return prisma.productGroup.update({
      where: { id },
      data: { name, slug },
    });
  }

  static async deleteProductGroup(id: string) {
    // SetNull tự động cho các sản phẩm liên kết theo Prisma schema config
    return prisma.productGroup.delete({ where: { id } });
  }

  // ---------------------------------------------------------
  // COLOR OPTION OPERATIONS
  // ---------------------------------------------------------

  static async createColorOption(name: string, hex: string) {
    const existing = await prisma.colorOption.findUnique({ where: { name } });
    if (existing) {
      throw new Error(`Tên màu sắc "${name}" đã tồn tại!`);
    }

    return prisma.colorOption.create({
      data: { name, hex },
    });
  }

  static async updateColorOption(id: string, name: string, hex: string) {
    const existing = await prisma.colorOption.findUnique({ where: { name } });
    if (existing && existing.id !== id) {
      throw new Error(`Tên màu sắc "${name}" đã bị trùng!`);
    }

    return prisma.colorOption.update({
      where: { id },
      data: { name, hex },
    });
  }

  static async deleteColorOption(id: string) {
    return prisma.colorOption.delete({ where: { id } });
  }

  // ---------------------------------------------------------
  // SIZE OPTION OPERATIONS
  // ---------------------------------------------------------

  static async createSizeOption(name: string, categoryId: string) {
    const existing = await prisma.sizeOption.findUnique({
      where: {
        name_categoryId: { name, categoryId },
      },
    });

    if (existing) {
      throw new Error(`Kích cỡ "${name}" đã tồn tại trong danh mục này!`);
    }

    return prisma.sizeOption.create({
      data: { name, categoryId },
    });
  }

  static async updateSizeOption(id: string, name: string, categoryId: string) {
    const existing = await prisma.sizeOption.findUnique({
      where: {
        name_categoryId: { name, categoryId },
      },
    });

    if (existing && existing.id !== id) {
      throw new Error(`Kích cỡ "${name}" đã bị trùng trong danh mục này!`);
    }

    return prisma.sizeOption.update({
      where: { id },
      data: { name, categoryId },
    });
  }

  static async deleteSizeOption(id: string) {
    return prisma.sizeOption.delete({ where: { id } });
  }
}
