import { notFound, redirect } from "next/navigation";
import { PageService } from "@/lib/services/page.service";
import { RESERVED_PAGE_ROUTES } from "@/lib/reserved-pages";
import { getSiteConfig } from "@/lib/site-config";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;

  // Reserved slugs have canonical URLs elsewhere - no metadata needed here
  if (RESERVED_PAGE_ROUTES[slug]) return {};

  const page = await PageService.getPageBySlugPublic(slug);

  if (!page) return {};

  const config = await getSiteConfig();
  const title = page.metaTitle || page.title;
  const description = page.metaDescription || page.excerpt || page.title;
  const ogImg = page.ogImage || config.seo.ogImage;

  return {
    title: `${title} | Cốc Nối`,
    description,
    openGraph: {
      title,
      description,
      images: ogImg ? [{ url: ogImg }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ogImg ? [ogImg] : [],
    },
    alternates: {
      canonical: `https://${process.env.NEXT_PUBLIC_SITE_URL || "cocnoi.com"}/trang/${slug}`,
    },
  };
}

export default async function StorefrontPageDetail({ params }: PageProps) {
  const { slug } = await params;

  // Redirect reserved slugs to their canonical routes (301)
  const canonicalRoute = RESERVED_PAGE_ROUTES[slug];
  if (canonicalRoute) {
    redirect(canonicalRoute);
  }

  const page = await PageService.getPageBySlugPublic(slug);

  if (!page) notFound();

  return (
    <div className="bg-[#FEFCF9] min-h-screen font-bvp">
      {/* Header */}
      <header className="max-w-[800px] mx-auto px-6 pt-16 md:pt-24 pb-10 md:pb-14">
        <p className="font-quicksand text-[10px] font-bold uppercase tracking-[.22em] text-secondary/50 mb-6">
          {formatDate(page.updatedAt)}
        </p>
        <h1 className="font-playfair text-3xl md:text-4xl leading-[1.2] font-normal text-primary mb-6">
          {page.title}
        </h1>
        {page.excerpt && (
          <p className="font-bvp text-sm md:text-[15px] text-secondary/60 leading-relaxed max-w-xl italic">
            {page.excerpt}
          </p>
        )}
      </header>

      <div className="max-w-[800px] mx-auto px-6 mb-16">
        <div className="h-px bg-border/30" />
      </div>

      {/* Content */}
      <article
        className="prose prose-cocnoi prose-stone prose-lg max-w-[800px] mx-auto px-6 font-bvp leading-relaxed text-primary/95 pb-20"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </div>
  );
}
