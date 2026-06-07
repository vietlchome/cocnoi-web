import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";
import { PostStatus } from "@prisma/client";
import { getSiteConfig } from "@/lib/site-config";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
      title,
      description,
      images: ogImg ? [ogImg] : [],
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

  let tag = "Nhật ký";
  if (post.category === "UNSUNG_HEROES") tag = "Người Nối";
  else if (post.category === "JOURNEY") tag = "Hành trình";
  else if (post.category === "KNOWLEDGE") tag = "Tạp chí";

  const coverSrc =
    post.coverImage ||
    "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80";

  return (
    <div className="bg-[#FEFCF9] min-h-screen font-bvp">
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

        {post.authorName && (
          <p className="text-[10px] font-bold text-secondary uppercase tracking-widest mb-6">
            Bởi {post.authorName} {post.readingTime ? `· ${post.readingTime} phút đọc` : ""}
          </p>
        )}

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
      <article className="prose max-w-[720px] mx-auto px-6 font-bvp leading-relaxed text-primary/95 prose-headings:font-playfair prose-headings:font-bold prose-headings:text-primary prose-a:text-accent hover:prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-accent prose-blockquote:bg-subtle/30 prose-blockquote:p-4 prose-blockquote:rounded-r-2 prose-blockquote:font-bvp prose-img:rounded-3 prose-img:shadow-md prose-img:mx-auto">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {post.content}
        </ReactMarkdown>
      </article>

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
