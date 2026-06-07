import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài viết không được để trống'),
  excerpt: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  content: z.string().min(1, 'Nội dung bài viết không được để trống'),
  coverImage: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  category: z.string().default('UNCATEGORIZED'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'SCHEDULED']).default('DRAFT'),
  scheduledFor: z.preprocess((val) => (val === '' || val === null ? undefined : val), z.coerce.date().optional()),
  metaTitle: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  metaDescription: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  ogImage: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  authorName: z.string().nullable().optional().default('Cốc Nối'),
  tags: z.union([z.array(z.string()), z.string()]).optional().transform((val) => {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return val.split(',').map(t => t.trim()).filter(Boolean);
  }),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const ThemeSettingSchema = z.object({
  key: z.string().min(1, 'Từ khóa cài đặt không được để trống'),
  value: z.string().min(1, 'Giá trị cài đặt không được để trống'),
});
