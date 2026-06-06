import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

/** Strip HTML tags → clean plaintext excerpt */
function excerpt(html: string, max = 160): string {
  if (!html) return "";
  const t = html.replace(/<\/?[^>]+(>|$)/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
  return t.length <= max ? t : t.slice(0, max).replace(/\s+\S*$/, "") + " …";
}

export default async function JournalPage() {
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { createdAt: "desc" },
  });

  /* ---------- data types ---------- */
  interface Article {
    id: string;
    slug: string;
    title: string;
    excerpt: string;
    date: string;
    author: string;
    coverImage: string;
    tag: string;
  }

  const dbArticles: Article[] = posts.map((p: any) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt || excerpt(p.content, 140),
    date: formatDate(p.createdAt),
    author: "CỐC NỐI",
    coverImage:
      p.coverImage ||
      "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=960&q=80",
    tag: "Nhật ký",
  }));

  const articles = dbArticles;
  const heroArticle = articles.length > 0 ? articles[0] : null;
  const remainingArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="bg-[#FEFCF9] min-h-screen">
      {/* ─── MAIN BREADCRUMB HEADER ─── */}
      <section className="max-w-[1200px] mx-auto px-6 pt-12 pb-6 border-b border-border/20">
        <div className="flex flex-col gap-2">
          <p className="font-quicksand text-[10px] font-bold uppercase tracking-[.25em] text-accent">
            Khám phá & Cảm hứng
          </p>
          <h1 className="font-playfair text-3xl font-bold text-primary tracking-tight">
            Nhật Ký Làng Nghề
          </h1>
        </div>
      </section>

      {/* ─── LAYOUT: EDITORIAL MAGAZINE ─── */}
      <section className="max-w-[1200px] mx-auto px-6 py-10 md:py-16">
        
        {articles.length === 0 ? (
          <div className="py-16 text-center text-secondary/60 font-bvp text-sm border border-dashed border-border/40 bg-canvas">
            Chưa có bài viết nào được đăng tải.
          </div>
        ) : (
          <div className="space-y-16">
            
            {/* ─── HERO FEATURED ARTICLE ─── */}
            {heroArticle && (
              <article className="group flex flex-col lg:flex-row bg-primary text-canvas overflow-hidden shadow-sm">
                {/* Image Section */}
                <Link href={`/journal/${heroArticle.slug}`} className="relative w-full lg:w-[55%] aspect-[4/3] lg:aspect-auto overflow-hidden bg-subtle/10">
                  <img
                    src={heroArticle.coverImage}
                    alt={heroArticle.title}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-[1.03]"
                    loading="lazy"
                  />
                </Link>
                
                {/* Text Section */}
                <div className="w-full lg:w-[45%] flex flex-col justify-center p-8 md:p-12 lg:p-16 relative">
                  {/* Subtle Background Pattern or Number */}
                  <span className="absolute top-6 right-8 text-[6rem] font-playfair font-bold text-canvas/5 select-none leading-none">
                    01
                  </span>

                  <span className="text-[10px] font-bold text-accent uppercase tracking-[.2em] mb-4 block">
                    BÀI VIẾT NỔI BẬT
                  </span>

                  <h2 className="font-playfair font-bold text-2xl md:text-3xl lg:text-4xl text-canvas hover:text-accent transition-colors duration-300 leading-tight mb-4">
                    <Link href={`/journal/${heroArticle.slug}`}>
                      {heroArticle.title}
                    </Link>
                  </h2>

                  <span className="text-[10px] font-medium text-canvas/60 uppercase tracking-wider mb-6 block">
                    {heroArticle.date} &nbsp;/&nbsp; BỞI {heroArticle.author}
                  </span>

                  <p className="font-bvp text-canvas/80 text-sm leading-relaxed line-clamp-4 mb-8">
                    {heroArticle.excerpt}
                  </p>

                  <div>
                    <Link
                      href={`/journal/${heroArticle.slug}`}
                      className="border border-canvas/30 hover:bg-accent hover:border-accent text-canvas font-bold text-[10px] tracking-wider uppercase px-6 py-3 inline-block transition-all duration-300 cursor-pointer"
                    >
                      Khám phá ngay
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* ─── REMAINING ARTICLES (3-COLUMN GRID) ─── */}
            {remainingArticles.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-8">
                  <h3 className="font-bvp text-xs font-bold uppercase tracking-[.2em] text-primary">
                    Các bài viết khác
                  </h3>
                  <div className="h-[1px] flex-grow bg-border/20"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 xl:gap-12">
                  {remainingArticles.map((article) => (
                    <article key={article.id} className="flex flex-col group">
                      {/* Cover Image aspect 4:3 */}
                      <Link href={`/journal/${article.slug}`} className="relative aspect-[4/3] overflow-hidden bg-subtle/10 block mb-5">
                        <img
                          src={article.coverImage}
                          alt={article.title}
                          className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1s] ease-out group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </Link>

                      {/* Metadata & Title */}
                      <div className="flex flex-col flex-grow">
                        <span className="text-[9px] font-bold text-accent uppercase tracking-wider mb-2 block">
                          {article.tag}
                        </span>

                        <h2 className="font-playfair font-bold text-lg md:text-xl text-primary hover:text-accent transition-colors duration-300 leading-snug line-clamp-2 mb-2">
                          <Link href={`/journal/${article.slug}`}>
                            {article.title}
                          </Link>
                        </h2>

                        <span className="text-[10px] font-medium text-secondary/45 uppercase tracking-wider mb-4 block">
                          {article.date}
                        </span>

                        {/* Excerpt */}
                        <p className="font-bvp text-secondary/75 text-sm leading-relaxed line-clamp-3 mb-6">
                          {article.excerpt}
                        </p>

                        {/* Read More Text Link */}
                        <div className="mt-auto">
                          <Link
                            href={`/journal/${article.slug}`}
                            className="text-accent font-bold text-[10px] tracking-[.15em] uppercase inline-flex items-center group-hover:text-primary transition-colors"
                          >
                            Đọc tiếp
                            <span className="ml-2 transform group-hover:translate-x-1 transition-transform">
                              →
                            </span>
                          </Link>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </section>

      {/* ─── BOTTOM QUIET SPACER ─── */}
      <div className="h-12 md:h-20" />
    </div>
  );
}
