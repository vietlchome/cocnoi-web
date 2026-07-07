import { MetadataRoute } from "next";
import { PageService } from "@/lib/services/page.service";
import { RESERVED_PAGE_ROUTES } from "@/lib/reserved-pages";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cocnoi.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/cua-hang`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/discover`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/partners`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/journal`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  let pageRoutes: MetadataRoute.Sitemap = [];
  try {
    const slugs = await PageService.getVisiblePageSlugs();
    // Skip reserved slugs - they have canonical URLs above (/privacy, /terms, etc.)
    const publicSlugs = slugs.filter((slug) => !RESERVED_PAGE_ROUTES[slug]);
    pageRoutes = publicSlugs.map((slug) => ({
      url: `${BASE_URL}/trang/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    }));
  } catch {
    // DB unavailable during build, skip dynamic pages
  }

  return [...staticRoutes, ...pageRoutes];
}
