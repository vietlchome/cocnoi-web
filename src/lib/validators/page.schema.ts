import { z } from 'zod';

export const pageInputSchema = z.object({
  title: z.string().min(1, 'Tiêu đề trang không được để trống'),
  slug: z
    .string()
    .min(1, 'Slug không được để trống')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug chỉ gồm chữ thường, số và dấu gạch ngang'),
  content: z.string().default(''),
  excerpt: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  metaTitle: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  metaDescription: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  ogImage: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  visible: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

export type PageInput = z.infer<typeof pageInputSchema>;

export const updatePageInputSchema = pageInputSchema.partial().extend({
  title: z.string().min(1, 'Tiêu đề trang không được để trống').optional(),
});
