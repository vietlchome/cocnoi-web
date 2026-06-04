import { z } from 'zod';

export const OrderStatusSchema = z.enum(['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']);
export const OrderTypeSchema = z.enum(['RETAIL', 'B2B_WHOLESALE', 'B2B_CONSIGNMENT', 'B2B_GIFT']);

export const RetailOrderItemSchema = z.object({
  productId: z.string().min(1, 'ID sản phẩm không hợp lệ'),
  quantity: z.number().int().positive('Số lượng sản phẩm phải lớn hơn 0'),
});

export const RetailOrderSchema = z.object({
  customerName: z.string().min(1, 'Tên khách hàng không được để trống'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Địa chỉ email không hợp lệ').nullable().optional(),
  address: z.string().min(5, 'Địa chỉ giao hàng quá ngắn'),
  note: z.string().nullable().optional(),
  paymentMethod: z.enum(['COD', 'QR']).default('COD'),
  items: z.array(RetailOrderItemSchema).min(1, 'Đơn hàng phải có ít nhất 1 sản phẩm'),
});

export const B2BOrderItemSchema = z.object({
  productId: z.string().min(1, 'ID sản phẩm không hợp lệ'),
  quantity: z.number().int().positive('Số lượng sản phẩm phải lớn hơn 0'),
  priceAtPurchase: z.number().int().nonnegative('Giá bán thực tế phải là số không âm'),
  originalPrice: z.number().int().nonnegative('Giá bán lẻ gốc phải là số không âm'),
});

export const B2BOrderSchema = z.object({
  customerId: z.string().nullable().optional(),
  customerName: z.string().min(1, 'Tên đối tác không được để trống'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Địa chỉ email không hợp lệ').nullable().optional().or(z.literal('')),
  companyName: z.string().nullable().optional(),
  address: z.string().min(5, 'Địa chỉ giao hàng quá ngắn').nullable().optional(),
  orderType: z.enum(['B2B_WHOLESALE', 'B2B_CONSIGNMENT', 'B2B_GIFT']),
  discount: z.number().int().nonnegative('Số tiền chiết khấu phải là số không âm').default(0),
  paidAmount: z.number().int().nonnegative('Số tiền đã thanh toán phải là số không âm').default(0),
  note: z.string().nullable().optional(),
  items: z.array(B2BOrderItemSchema).min(1, 'Hợp đồng phải có ít nhất 1 sản phẩm'),
});

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
});

export const UpdateDebtSchema = z.object({
  paidAmount: z.number().int().nonnegative('Số tiền thanh toán thêm phải là số không âm'),
});
