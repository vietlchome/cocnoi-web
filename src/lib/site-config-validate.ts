import { z } from "zod";

// Các base validator
const textValidator = z.string();
const urlValidator = z.string().url().or(z.literal(""));
const imageValidator = z.string().regex(
  /^(https?:\/\/.+|\/[^\/].*|)$/,
  "Image phải là URL hợp lệ, đường dẫn tuyệt đối (/path), hoặc để trống"
);
const booleanValidator = z.boolean();
const colorValidator = z.string().regex(/^#([0-9a-f]{3}){1,2}$/i, "Invalid hex color").or(z.literal(""));

export const SiteConfigSchema = z.object({
  header: z.object({
    logoUrl: imageValidator,
    logoText: textValidator,
    showTopBar: booleanValidator,
    topBarText: textValidator,
    stickyHeader: booleanValidator,
  }),
  hero: z.object({
    badge: textValidator,
    title: textValidator,
    subtitle: textValidator,
    ctaPrimary: textValidator,
    ctaSecondary: textValidator,
    floatingLabel: textValidator,
    imageUrl: imageValidator,
  }),
  campaign: z.object({
    badge: textValidator,
    title: textValidator,
    desc: textValidator,
    heroImageUrl: imageValidator,
    heroName: textValidator,
    heroQuote: textValidator,
  }),
  products: z.object({
    tagline: textValidator,
    title: textValidator,
    desc: textValidator,
    type: z.enum(["latest", "bestseller", "manual"]),
    manualProductIds: z.array(z.string()),
  }),
  story: z.object({
    tagline: textValidator,
    title: textValidator,
    desc1: textValidator,
    desc2: textValidator,
    storyImageUrl: imageValidator,
    stat1Val: textValidator,
    stat1Lbl: textValidator,
    stat2Val: textValidator,
    stat2Lbl: textValidator,
    features: z.array(z.object({
      imgUrl: imageValidator,
    })),
  }),
  values: z.object({
    tagline: textValidator,
    title: textValidator,
    desc: textValidator,
    items: z.array(z.object({
      title: textValidator,
      desc: textValidator,
    })),
  }),
  faq: z.object({
    tagline: textValidator,
    title: textValidator,
    retailTitle: textValidator,
    b2bTitle: textValidator,
    itemsRetail: z.array(z.object({
      question: textValidator,
      answer: textValidator,
    })),
    itemsB2b: z.array(z.object({
      question: textValidator,
      answer: textValidator,
    })),
  }),
  contact: z.object({
    address: textValidator,
    phone: textValidator,
    email: textValidator,
  }),
  footer: z.object({
    newsletterTitle: textValidator,
    newsletterDesc: textValidator,
    copyright: textValidator,
    legal: z.object({
      businessName: textValidator,
      taxId: z.string().regex(/^(\d{10}|\d{13}|)$/, "MST phải là 10 hoặc 13 chữ số (hoặc để trống)"),
      businessLicense: textValidator,
      licensedBy: textValidator,
      licensedDate: textValidator,
      hours: textValidator,
    }),
  }),
  social: z.object({
    facebook: urlValidator,
    instagram: urlValidator,
    zalo: urlValidator,
  }),
  seo: z.object({
    siteTitle: textValidator,
    siteDescription: textValidator,
    ogImage: imageValidator,
    ogImageAlt: textValidator,
    favicon: imageValidator,
    robotsIndexable: booleanValidator,
  }),
  analytics: z.object({
    googleAnalyticsId: z.string().regex(/^G-[A-Z0-9]+$/, "Google Analytics 4 ID không hợp lệ (phải bắt đầu bằng G-)").or(z.literal("")),
    facebookPixelId: z.string().regex(/^\d{15,16}$/, "Facebook Pixel ID phải gồm 15-16 chữ số").or(z.literal("")),
    tiktokPixelId: z.string().regex(/^[A-Za-z0-9]+$/, "TikTok Pixel ID phải là chuỗi chữ và số").or(z.literal("")),
  })
});

export type SiteConfig = z.infer<typeof SiteConfigSchema>;

export function validateSiteConfig(data: any) {
  const result = SiteConfigSchema.safeParse(data);
  return {
    valid: result.success,
    errors: result.success ? null : result.error.format(),
    data: result.success ? result.data : null
  };
}
