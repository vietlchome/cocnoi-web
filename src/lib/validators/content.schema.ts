import { z } from 'zod';

export const CreatePostSchema = z.object({
  title: z.string().min(1, 'Tiêu đề bài viết không được để trống'),
  excerpt: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  content: z.string().min(1, 'Nội dung bài viết không được để trống'),
  coverImage: z.string().nullable().optional().transform((val) => (val === '' ? null : val)),
  category: z.string().default('UNCATEGORIZED'),
  isPublished: z.boolean().default(false),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export const ThemeSettingSchema = z.object({
  key: z.string().min(1, 'Từ khóa cài đặt không được để trống'),
  value: z.string().min(1, 'Giá trị cài đặt không được để trống'),
});
