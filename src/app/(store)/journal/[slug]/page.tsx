import React from "react";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPostCategoryLabel } from "@/lib/post-categories";
import { formatDate } from "@/lib/utils/format";
import { PostStatus } from "@prisma/client";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const post = await prisma.post.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    },
  });

  if (!post) {
    return {};
  }

  const config = await getSiteConfig();

  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt || post.title;
  const ogImg = post.ogImage || post.coverImage || config.seo.ogImage;

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
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
      images: [post.ogImage || post.coverImage].filter(Boolean) as string[],
    },
    alternates: {
      canonical: `https://${process.env.NEXT_PUBLIC_SITE_URL || "cocnoi.com"}/journal/${post.slug}`,
    },
  };
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findFirst({
    where: {
      slug,
      status: PostStatus.PUBLISHED,
      publishedAt: {
        lte: new Date(),
      },
    },
  });

  if (!post) {
    notFound();
  }

  const tag = getPostCategoryLabel(post.category);

  const coverSrc =
    post.coverImage ||
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80";

  const jsonLdImage = post.ogImage || post.coverImage || null;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.metaDescription || post.excerpt || "",
    "image": jsonLdImage ? [jsonLdImage] : [],
    "datePublished": post.publishedAt ? post.publishedAt.toISOString() : post.createdAt.toISOString(),
    "dateModified": post.updatedAt.toISOString(),
    "author": {
      "@type": "Person",
      "name": post.authorName || "Cốc Nối"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Cốc Nối",
      "logo": {
        "@type": "ImageObject",
        "url": `https://${process.env.NEXT_PUBLIC_SITE_URL || "cocnoi.com"}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://${process.env.NEXT_PUBLIC_SITE_URL || "cocnoi.com"}/journal/${post.slug}`
    }
  };

  return (
    <div className="bg-[#FEFCF9] min-h-screen font-bvp">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ─── BACK NAV ─── */}
      <div className="max-w-[720px] mx-auto px-6 pt-10 md:pt-14">
        <Link
          href="/journal"
          className="inline-block font-quicksand text-[10px] font-bold uppercase tracking-[.22em] text-secondary/50 hover:text-accent transition-colors duration-300"
        >
          ← &nbsp;Trở lại Nhật ký
        </Link>
      </div>

      {/* ─── ARTICLE HEADER ─── */}
      <header className="max-w-[720px] mx-auto px-6 pt-12 md:pt-16 pb-10 md:pb-14 text-center">
        <span className="inline-block font-quicksand text-[10px] font-bold uppercase tracking-[.22em] text-accent/80 mb-5">
          {tag} &nbsp;·&nbsp; {formatDate(post.publishedAt || post.createdAt)}
        </span>

        <h1 className="font-playfair text-3xl md:text-[2.8rem] leading-[1.15] font-normal text-primary mb-6">
          {post.title}
        </h1>

        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-6 flex items-center justify-center gap-1.5 flex-wrap">
          {post.authorName && <span>Bởi {post.authorName}</span>}
          {post.readingTime && (
            <>
              <span className="opacity-45">·</span>
              <span>📖 {post.readingTime} phút đọc</span>
            </>
          )}
        </div>

        {post.excerpt && (
          <p className="font-bvp text-sm md:text-[15px] text-secondary/60 leading-relaxed max-w-lg mx-auto italic">
            {post.excerpt}
          </p>
        )}
      </header>

      {/* ─── COVER IMAGE (WIDER THAN COLUMN) ─── */}
      <div className="max-w-[860px] mx-auto px-6 mb-14 md:mb-16">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-subtle/10">
          <img
            src={coverSrc}
            alt={post.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ─── ARTICLE BODY (CONSTRAINED READABILITY COLUMN) ─── */}
      <article
        className="prose prose-cocnoi prose-stone prose-lg max-w-[720px] mx-auto px-6 font-bvp leading-relaxed text-primary/95"
        style={{ "--tw-prose-headings": "var(--color-deep-indigo)" } as React.CSSProperties}
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Tags list */}
      {post.tags && post.tags.length > 0 && (
        <div className="max-w-[720px] mx-auto px-6 mt-8 flex flex-wrap gap-2">
          {post.tags.map((t: string, idx: number) => (
            <span key={idx} className="bg-subtle text-secondary px-3 py-1 rounded-[3px] text-xs font-medium border border-border/20">
              #{t}
            </span>
          ))}
        </div>
      )}

      {/* ─── END MARK ─── */}
      <div className="max-w-[720px] mx-auto px-6 py-16 md:py-20 flex flex-col items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="w-8 h-px bg-border/50" />
          <span className="font-playfair text-lg text-accent/60">✦</span>
          <span className="w-8 h-px bg-border/50" />
        </div>
        <Link
          href="/journal"
          className="font-quicksand text-[11px] font-bold uppercase tracking-[.22em] text-secondary/45 hover:text-accent transition-colors duration-300"
        >
          Quay lại Nhật ký
        </Link>
      </div>

      <div className="h-8 md:h-16" />
    </div>
  );
}
