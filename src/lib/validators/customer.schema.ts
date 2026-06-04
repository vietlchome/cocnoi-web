import { z } from 'zod';

export const CustomerTypeSchema = z.enum([
  'RETAIL_LEAD',
  'RETAIL_BUYER',
  'B2B_LEAD',
  'B2B_WHOLESALE',
  'B2B_CONSIGNMENT',
  'B2B_GIFT',
]);

export const CreateCustomerSchema = z.object({
  name: z.string().min(1, 'Tên khách hàng không được để trống'),
  phone: z.string().min(8, 'Số điện thoại không hợp lệ'),
  email: z.string().email('Địa chỉ email không hợp lệ').nullable().optional().or(z.literal('')),
  companyName: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  taxCode: z.string().nullable().optional(),
  customerType: CustomerTypeSchema.default('RETAIL_LEAD'),
});

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
