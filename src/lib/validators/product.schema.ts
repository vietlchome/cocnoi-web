import { z } from 'zod';

export const VisibilitySchema = z.enum(['PUBLIC', 'B2B_ONLY']);

export const CreateProductSchema = z.object({
  sku: z.string().min(1, 'Mã SKU không được để trống').nullable().optional(),
  name: z.string().min(1, 'Tên sản phẩm không được để trống'),
  description: z.string().min(1, 'Mô tả không được để trống'),
  shortDescription: z.string().nullable().optional(),
  price: z.number().int().nonnegative('Giá sản phẩm phải là số không âm'),
  compareAtPrice: z.number().int().nonnegative('Giá so sánh phải là số không âm').nullable().optional(),
  stockQuantity: z.number().int().nonnegative('Số lượng tồn kho phải là số không âm').default(0),
  weight: z.number().int().nonnegative('Khối lượng phải là số không âm').nullable().optional().default(0),
  images: z.array(z.string().url('Đường dẫn ảnh không hợp lệ')).min(1, 'Sản phẩm phải có ít nhất 1 hình ảnh'),
  productGroupId: z.string().nullable().optional(),
  colorId: z.string().nullable().optional(),
  sizeId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
  visibility: VisibilitySchema.default('PUBLIC'),
  categoryId: z.string().nullable().optional(),
});

export const UpdateProductSchema = CreateProductSchema.partial();
