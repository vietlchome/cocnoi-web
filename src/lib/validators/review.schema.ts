import { z } from "zod";

export const VerifyOrderSchema = z.object({
  orderId: z.string().min(1, "Mã đơn hàng không được để trống."),
});

export const CreateReviewSchema = z.object({
  orderId: z.string().min(1, "Mã đơn hàng không hợp lệ."),
  productId: z.string().min(1, "Sản phẩm đánh giá không hợp lệ."),
  rating: z.number().int().min(1, "Đánh giá tối thiểu là 1 sao.").max(5, "Đánh giá tối đa là 5 sao."),
  comment: z.string().max(500, "Nội dung nhận xét tối đa 500 ký tự.").nullable().optional().or(z.literal("")),
  customerName: z.string().min(1, "Tên người đánh giá không được để trống."),
});
