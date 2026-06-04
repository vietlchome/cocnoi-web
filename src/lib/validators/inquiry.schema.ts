import { z } from 'zod';
import { B2BOrderItemSchema } from './order.schema';

export const InquiryStatusSchema = z.enum(['PENDING', 'CONTACTED', 'NEGOTIATING', 'CONVERTED', 'CANCELLED']);

export const CreateInquirySchema = z.object({
  customerName: z.string().min(1, 'Tên khách hàng không được để trống'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Địa chỉ email không hợp lệ').nullable().optional().or(z.literal('')),
  companyName: z.string().nullable().optional(),
  productId: z.string().min(1, 'ID sản phẩm không hợp lệ').nullable().optional(),
  quantity: z.number().int().positive('Số lượng sản phẩm phải lớn hơn 0').default(1),
  note: z.string().nullable().optional(),
  source: z.string().nullable().optional(),
});

export const ConvertToOrderSchema = z.object({
  inquiryId: z.string().min(1, 'ID yêu cầu tư vấn không hợp lệ'),
  shippingAddress: z.string().min(5, 'Địa chỉ giao hàng quá ngắn').nullable().optional(),
  items: z.array(B2BOrderItemSchema).min(1, 'Hợp đồng phải có ít nhất 1 sản phẩm'),
  discount: z.number().int().nonnegative('Số tiền chiết khấu phải là số không âm').default(0),
  paidAmount: z.number().int().nonnegative('Số tiền đã thanh toán phải là số không âm').default(0),
});
