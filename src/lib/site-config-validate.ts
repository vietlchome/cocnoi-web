import { z } from "zod";

// Các base validator
const textValidator = z.string();
const urlValidator = z.string().regex(
  /^(https?:\/\/.+|\/[^\/].*|)$/,
  "Phải là URL hợp lệ (https://...), đường dẫn nội bộ (/path), hoặc để trống"
);
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
    topBarLink: urlValidator,
    stickyHeader: booleanValidator,
  }),
  hero: z.object({
    badge: textValidator,
    title: textValidator,
    subtitle: textValidator,
    ctaPrimary: z.object({
      text: textValidator,
      url: urlValidator,
    }),
    ctaSecondary: z.object({
      text: textValidator,
      url: urlValidator,
    }),
    floatingLabel: textValidator,
    imageUrl: imageValidator,
    imageAlt: textValidator,
    mediaType: z.enum(["image", "video"]).default("image"),
    videoUrl: textValidator,
    videoPosterUrl: textValidator,
    videoAutoplay: booleanValidator,
    showShowcaseCard: booleanValidator.default(false),
  }),
  campaign: z.object({
    badge: textValidator,
    title: textValidator,
    desc: textValidator,
    heroImageUrl: imageValidator,
    heroName: textValidator,
    heroQuote: textValidator,
    cta: z.object({
      text: textValidator,
      url: urlValidator,
    }),
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
    storyImageUrl: imageValidator.optional(),
    stat1Val: textValidator,
    stat1Lbl: textValidator,
    stat2Val: textValidator,
    stat2Lbl: textValidator,
    features: z.array(z.object({
      imgUrl: imageValidator,
      videoUrl: urlValidator.optional().default(""),
      alt: textValidator,
    })),
  }),
  trust_badges: z.object({
    tagline: textValidator,
    title: textValidator,
    desc: textValidator,
    items: z.array(z.object({
      title: textValidator,
      desc: textValidator,
      iconImage: imageValidator,
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
    links: z.array(z.object({
      platform: z.enum(["facebook", "instagram", "tiktok", "youtube", "zalo", "shopee", "lazada", "threads"]),
      url: urlValidator,
      visible: booleanValidator,
    })),
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
  }),
  homepage: z.object({
    sections: z.array(z.object({
      key: z.enum(["hero", "campaign", "products", "story", "trust_badges", "faq"]),
      visible: booleanValidator,
    })),
  }),
  our_values: z.object({
    heroTagline: textValidator,
    heroTitle: textValidator,
    heroSubtitle: textValidator,
    pillars: z.array(z.object({
      name: textValidator,
      role: textValidator,
      question: textValidator,
      body: textValidator,
      image: imageValidator,
    })),
    closingTitle: textValidator,
    closingBody: textValidator,
  }),
  discover_story: z.object({
    eyebrow: textValidator,
    title: textValidator,
    subtitle: textValidator,
    paragraphs: z.array(z.object({
      text: textValidator,
    })),
    quote: textValidator,
    quoteCite: textValidator,
    ctaEyebrow: textValidator,
    ctaHeading: textValidator,
    ctaButtonText: textValidator,
    ctaButtonHref: urlValidator,
  }).optional(),
  partners_meta: z.object({
    stockistMinOrder: textValidator,
    stockistDiscount: textValidator,
    corporateMoq: textValidator,
    corporateLeadTime: textValidator,
    salesEmail: textValidator,
    salesPhone: textValidator,
  }),
  payment_info: z.object({
    showQr: booleanValidator,
    qrImage: imageValidator,
    bankName: textValidator,
    accountNumber: textValidator,
    accountHolder: textValidator,
    transferNote: textValidator,
    codAvailable: booleanValidator,
    codNote: textValidator,
  }),
  navigation: z.object({
    topNavItems: z.array(z.object({
      label: textValidator,
      href: urlValidator,
      submenuType: z.enum(["none", "simple", "mega"]).default("none"),
      simpleSubmenu: z.array(z.object({
        label: textValidator,
        href: urlValidator,
      })).default([]),
      openInNewTab: booleanValidator,
      hasMegaMenu: booleanValidator.optional(), // backward compat
    })),
    megaMenu: z.object({
      column1: z.object({
        title: textValidator,
        viewAllLabel: textValidator,
      }),
      column2: z.object({
        title: textValidator,
        viewAllLabel: textValidator,
      }),
      column3: z.object({
        title: textValidator,
        viewAllLabel: textValidator,
      }),
      featuredCards: z.array(z.object({
        title: textValidator,
        subtitle: textValidator.optional().nullable(),
        image: imageValidator,
        href: urlValidator,
        ctaLabel: textValidator,
      })),
    }),
  }),
  community_stories: z.object({
    title: textValidator,
    intro: textValidator,
    ctaText: textValidator,
    ctaUrl: urlValidator,
    stories: z.array(z.object({
      authorName: textValidator,
      location: textValidator,
      content: textValidator,
      image: textValidator,
      date: textValidator,
    })).default([]),
  }).optional(),
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
