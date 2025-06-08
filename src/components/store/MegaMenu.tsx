import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { unstable_cache } from "next/cache";

type NavigationConfig = {
  megaMenu: {
    column1: { title: string; viewAllLabel: string };
    column2: { title: string; viewAllLabel: string };
    column3: { title: string; viewAllLabel: string };
    featuredCards: Array<{
      title: string;
      subtitle?: string | null;
      image: string;
      href: string;
      ctaLabel: string;
    }>;
  };
};

type MegaMenuProps = {
  config: NavigationConfig["megaMenu"];
};

// Caching DB queries for 5 minutes
const getCachedMegaMenuData = unstable_cache(
  async () => {
    try {
      const [categories, productGroups, finishes] = await Promise.all([
        prisma.category.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.productGroup.findMany({
          orderBy: { name: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.finishOption.findMany({
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true },
        }),
      ]);
      return { categories, productGroups, finishes };
    } catch (err) {
      console.warn("Failed to fetch mega menu data from DB:", err);
      return { categories: [], productGroups: [], finishes: [] };
    }
  },
  ["mega-menu-data"],
  { revalidate: 300, tags: ["mega-menu-data"] }
);

export async function MegaMenu({ config }: MegaMenuProps) {
  const { categories, productGroups, finishes } = await getCachedMegaMenuData();

  return (
    <div className="absolute top-full left-0 w-screen bg-warm-white border-b border-gray-100 shadow-xl pt-3 z-50">
      <div className="max-w-[1280px] mx-auto px-8 py-10 grid grid-cols-12 gap-8 font-bvp">
        {/* Cột 1 - Danh mục */}
        <div className="col-span-3">
          <h3 className="font-playfair text-xs tracking-[0.15em] text-primary/80 font-bold mb-4 uppercase">
            {config.column1.title}
          </h3>
          <ul className="space-y-2.5 text-xs font-semibold">
            {categories.map((cat: { id: string; name: string; slug: string }) => (
              <li key={cat.id}>
                <Link
                  href={`/cua-hang?category=${cat.slug}`}
                  className="text-secondary hover:text-accent transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/cua-hang" className="text-accent hover:text-accent/80 transition-colors">
                {config.column1.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 2 - BST */}
        <div className="col-span-3">
          <h3 className="font-playfair text-xs tracking-[0.15em] text-primary/80 font-bold mb-4 uppercase">
            {config.column2.title}
          </h3>
          <ul className="space-y-2.5 text-xs font-semibold">
            {productGroups.map((pg: { id: string; name: string; slug: string }) => (
              <li key={pg.id}>
                <Link
                  href={`/cua-hang?collection=${pg.slug}`}
                  className="text-secondary hover:text-accent transition-colors"
                >
                  {pg.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/cua-hang?view=collections" className="text-accent hover:text-accent/80 transition-colors">
                {config.column2.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3 - Hoàn thiện */}
        <div className="col-span-3">
          <h3 className="font-playfair text-xs tracking-[0.15em] text-primary/80 font-bold mb-4 uppercase">
            {config.column3.title}
          </h3>
          <ul className="space-y-2.5 text-xs font-semibold">
            {finishes.map((f: { id: string; name: string; slug: string }) => (
              <li key={f.id}>
                <Link
                  href={`/cua-hang?finish=${f.slug}`}
                  className="text-secondary hover:text-accent transition-colors"
                >
                  {f.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/cua-hang?view=finishes" className="text-accent hover:text-accent/80 transition-colors">
                {config.column3.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Card nổi bật */}
        <div className="col-span-3 grid grid-cols-2 gap-4">
          {config.featuredCards.map((card, i) => (
            <Link key={i} href={card.href} className="block group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-canvas border border-border/40">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 1024px) 0vw, 200px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-cream/35 flex items-center justify-center text-secondary/40 text-[10px] font-bold uppercase tracking-wider select-none">
                    No image
                  </div>
                )}
              </div>
              <h4 className="font-playfair text-xs font-bold text-primary mt-2 group-hover:text-accent transition-colors line-clamp-1">
                {card.title}
              </h4>
              {card.subtitle && (
                <p className="text-[10px] text-secondary/60 mt-0.5 line-clamp-1">{card.subtitle}</p>
              )}
              <span className="text-accent text-[10px] font-bold uppercase tracking-wider block mt-1 hover:text-accent/80 transition-colors">
                {card.ctaLabel} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
