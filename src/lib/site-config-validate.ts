import { z } from "zod";

// Các base validator
const textValidator = z.string();
const urlValidator = z.string().url().or(z.literal(""));
const imageValidator = z.string();
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
    itemsRetail: z.array(z.any()), // Có thể chi tiết hơn: z.array(z.object({q: z.string(), a: z.string()}))
    itemsB2b: z.array(z.any()),
  }),
  footer: z.object({
    address: textValidator,
    phone: textValidator,
    email: textValidator,
    newsletterTitle: textValidator,
    newsletterDesc: textValidator,
    copyright: textValidator,
  }),
  social: z.object({
    facebook: urlValidator,
    instagram: urlValidator,
    zalo: urlValidator,
  }),
  seo: z.object({
    siteTitle: textValidator,
    siteDescription: textValidator,
    siteKeywords: textValidator,
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
