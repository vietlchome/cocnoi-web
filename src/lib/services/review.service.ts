import { prisma } from "@/lib/prisma";

export interface CreateReviewInput {
  orderId: string;
  productId: string;
  rating: number;
  comment: string | null;
  customerName: string;
}

import { normalizePhone, isValidPhone } from '@/lib/utils/phone';

export class ReviewService {
  /**
   * Tìm kiếm đơn hàng qua số điện thoại hoặc email
   */
  static async getOrdersByContact(contactInfo: string) {
    if (!contactInfo || contactInfo.trim().length < 3) {
      throw new Error("Thông tin tìm kiếm quá ngắn.");
    }
    const cleanContact = contactInfo.trim();
    const contactWithoutSpaces = cleanContact.replace(/[\s\-\(\)]/g, '');
    
    let normalizedPhone: string | null = null;
    if (isValidPhone(cleanContact)) {
      try {
        normalizedPhone = normalizePhone(cleanContact);
      } catch (e) {}
    }

    const orConditions: any[] = [
      { shippingAddress: { contains: cleanContact } },
      { shippingAddress: { contains: contactWithoutSpaces } }
    ];

    if (normalizedPhone) {
      orConditions.push({ customer: { phone: normalizedPhone } });
    } else {
      orConditions.push({ customer: { email: { equals: cleanContact, mode: 'insensitive' } } });
    }

    const orders = await prisma.order.findMany({
      where: {
        orderType: "RETAIL",
        OR: orConditions
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
        review: true,
      },
    });

    return orders.map((order) => {
      // Tìm sản phẩm có tổng tiền cao nhất trong đơn hàng để đại diện đánh giá
      let highestValueItem = order.items[0];
      let maxTotal = -1;
      for (const item of order.items) {
        const total = item.priceAtPurchase * item.quantity;
        if (total > maxTotal) {
          maxTotal = total;
          highestValueItem = item;
        }
      }

      return {
        orderId: order.id,
        createdAt: order.createdAt,
        totalAmount: order.totalAmount,
        status: order.status,
        hasReview: !!order.review,
        highestValueItem: highestValueItem ? {
          productId: highestValueItem.productId,
          name: highestValueItem.product.name,
          slug: highestValueItem.product.slug,
          images: highestValueItem.product.images,
          quantity: highestValueItem.quantity,
          totalPrice: highestValueItem.priceAtPurchase * highestValueItem.quantity,
        } : null,
        totalItemsCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        itemsSummary: order.items.map(i => i.product.name).join(", "),
        customerName: (() => {
          try {
            const parsed = JSON.parse(order.shippingAddress);
            return parsed.customerName || parsed.name || "Khách mua lẻ";
          } catch (e) {
            return "Khách mua lẻ";
          }
        })()
      };
    });
  }

  /**
   * Verify if an order is eligible for review and return order items
   * @param orderId Cuid of the order
   */
  static async verifyOrderForReview(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        review: true,
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
                images: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new Error("Mã đơn hàng không tồn tại trên hệ thống.");
    }

    // 1. Must be RETAIL order
    if (order.orderType !== "RETAIL") {
      throw new Error("Hệ thống đánh giá chỉ áp dụng cho đơn hàng mua lẻ.");
    }

    // 2. Must be DELIVERED status
    if (order.status !== "DELIVERED") {
      throw new Error("Chỉ những đơn hàng đã giao thành công mới có thể gửi đánh giá.");
    }

    // 3. Must not have been reviewed already
    if (order.review) {
      throw new Error("Đơn hàng này đã thực hiện gửi đánh giá trước đó.");
    }

    return {
      orderId: order.id,
      customerName: order.shippingAddress ? (() => {
        try {
          const parsed = JSON.parse(order.shippingAddress);
          return parsed.name || "Khách mua lẻ";
        } catch (e) {
          return "Khách mua lẻ";
        }
      })() : "Khách mua lẻ",
      items: order.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        slug: item.product.slug,
        images: item.product.images,
      })),
    };
  }

  /**
   * Create a new order-verified product review
   */
  static async createReview(data: CreateReviewInput) {
    const { orderId, productId, rating, comment, customerName } = data;

    if (rating < 1 || rating > 5) {
      throw new Error("Số sao đánh giá phải từ 1 đến 5.");
    }

    // Double check eligibility inside a database transaction to prevent race conditions
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { review: true, items: true },
      });

      if (!order) {
        throw new Error("Đơn hàng không tồn tại.");
      }
      if (order.orderType !== "RETAIL") {
        throw new Error("Đơn hàng không hợp lệ để đánh giá.");
      }
      if (order.status !== "DELIVERED") {
        throw new Error("Đơn hàng chưa được giao thành công.");
      }
      if (order.review) {
        throw new Error("Đơn hàng này đã có đánh giá.");
      }

      // Check if product actually belongs to the order
      const hasProduct = order.items.some((item) => item.productId === productId);
      if (!hasProduct) {
        throw new Error("Sản phẩm được chọn không nằm trong đơn hàng này.");
      }

      // Create Review
      const review = await tx.review.create({
        data: {
          orderId,
          productId,
          rating,
          comment,
          customerName,
        },
      });

      return review;
    });
  }

  /**
   * Get reviews for a specific product with pagination
   */
  static async getProductReviews(productId: string, page = 1, pageSize = 5) {
    const skip = (page - 1) * pageSize;

    const [reviews, totalCount] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        orderBy: { createdAt: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.review.count({
        where: { productId },
      }),
    ]);

    return {
      reviews,
      totalCount,
      totalPages: Math.ceil(totalCount / pageSize),
      currentPage: page,
    };
  }

  /**
   * Get average rating and count for a specific product
   */
  static async getProductRating(productId: string) {
    const aggregate = await prisma.review.aggregate({
      where: { productId },
      _avg: {
        rating: true,
      },
      _count: {
        id: true,
      },
    });

    return {
      average: aggregate._avg.rating ? Math.round(aggregate._avg.rating * 10) / 10 : 0,
      count: aggregate._count.id || 0,
    };
  }

  /**
   * Get featured reviews (4 or 5 stars) for homepage testimonials
   */
  static async getFeaturedReviews(limit: number = 6) {
    const reviews = await prisma.review.findMany({
      where: {
        rating: {
          gte: 4,
        },
      },
      include: {
        product: {
          select: {
            name: true,
            slug: true,
            images: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    });
    return reviews;
  }
}
