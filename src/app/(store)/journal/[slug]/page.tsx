import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { embedVideos } from "@/lib/utils/video";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function ArticleDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug, isPublished: true },
  });

  if (!post) {
    notFound();
  }

  const articleData = {
    title: post.title,
    excerpt: post.excerpt,
    createdAt: post.createdAt,
    coverImage: post.coverImage,
    tag: "Nhật ký",
    content: post.content
  };

  const coverSrc =
    articleData.coverImage ||
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80";

  return (
    <div className="bg-canvas min-h-screen font-bvp">
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
          {articleData.tag} &nbsp;·&nbsp; {formatDate(articleData.createdAt)}
        </span>

        <h1 className="font-playfair text-3xl md:text-[2.8rem] leading-[1.15] font-normal text-primary mb-6">
          {articleData.title}
        </h1>

        {articleData.excerpt && (
          <p className="font-bvp text-sm md:text-[15px] text-secondary/60 leading-relaxed max-w-lg mx-auto italic">
            {articleData.excerpt}
          </p>
        )}
      </header>

      {/* ─── COVER IMAGE (WIDER THAN COLUMN) ─── */}
      <div className="max-w-[860px] mx-auto px-6 mb-14 md:mb-16">
        <div className="relative w-full aspect-[16/9] overflow-hidden bg-subtle/10">
          <img
            src={coverSrc}
            alt={articleData.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>

      {/* ─── ARTICLE BODY (CONSTRAINED READABILITY COLUMN) ─── */}
      <article
        className="prose max-w-[720px] mx-auto px-6"
        dangerouslySetInnerHTML={{ __html: embedVideos(articleData.content) }}
      />

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
