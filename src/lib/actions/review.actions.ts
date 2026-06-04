"use server";

import { ReviewService } from "@/lib/services/review.service";
import { VerifyOrderSchema, CreateReviewSchema } from "@/lib/validators/review.schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

/**
 * Public action: Verify order eligibility for product reviews
 */
export async function verifyOrderAction(orderId: string) {
  try {
    const validated = VerifyOrderSchema.parse({ orderId });
    const orderDetails = await ReviewService.verifyOrderForReview(validated.orderId);
    return { success: true, data: orderDetails };
  } catch (error: any) {
    console.error("Lỗi khi xác minh đơn hàng để review:", error);
    return { success: false, error: error.message || "Gặp sự cố xác minh đơn hàng." };
  }
}

/**
 * Public action: Get list of orders by phone or email
 */
export async function getOrdersByContactAction(contactInfo: string) {
  try {
    const orders = await ReviewService.getOrdersByContact(contactInfo);
    return { success: true, data: orders };
  } catch (error: any) {
    console.error("Lỗi khi tìm đơn hàng:", error);
    return { success: false, error: error.message || "Gặp sự cố khi tìm kiếm đơn hàng." };
  }
}

/**
 * Public action: Submit verified product review
 */
export async function submitReviewAction(data: z.infer<typeof CreateReviewSchema>) {
  try {
    const validated = CreateReviewSchema.parse(data);
    const review = await ReviewService.createReview({
      orderId: validated.orderId,
      productId: validated.productId,
      rating: validated.rating,
      comment: validated.comment || null,
      customerName: validated.customerName,
    });

    // Revalidate paths to update ratings & review list instantly
    revalidatePath(`/shop/${review.productId}`);
    revalidatePath("/shop");
    
    return { success: true, data: review };
  } catch (error: any) {
    console.error("Lỗi khi gửi đánh giá đơn hàng:", error);
    return { success: false, error: error.message || "Gặp sự cố khi ghi nhận đánh giá." };
  }
}

/**
 * Public action: Get paginated reviews for product details display
 */
export async function getProductReviewsAction(productId: string, page = 1, pageSize = 5) {
  try {
    const result = await ReviewService.getProductReviews(productId, page, pageSize);
    return { success: true, ...result };
  } catch (error: any) {
    console.error("Lỗi khi lấy danh sách đánh giá sản phẩm:", error);
    return { success: false, error: error.message || "Gặp sự cố tải đánh giá." };
  }
}

/**
 * Public action: Get average rating & count for a product
 */
export async function getProductRatingAction(productId: string) {
  try {
    const ratingDetails = await ReviewService.getProductRating(productId);
    return { success: true, data: ratingDetails };
  } catch (error: any) {
    console.error("Lỗi khi tải thông số đánh giá sao sản phẩm:", error);
    return { success: false, error: error.message || "Gặp sự cố tải số sao trung bình." };
  }
}
