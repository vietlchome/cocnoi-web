import { prisma } from "@/lib/prisma";
import Link from "next/link";
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
          orderBy: { sortOrder: "asc" },
          select: { id: true, name: true, slug: true },
        }),
        prisma.productGroup.findMany({
          orderBy: { sortOrder: "asc" },
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
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
      <div className="bg-warm-white shadow-lg rounded border border-sand p-6 grid grid-cols-3 gap-6 min-w-[600px] max-w-[720px] font-bvp">
        {/* Cột 1 - Danh mục */}
        <div>
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
        <div>
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
        <div>
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

        {/* KHÔNG render featured cards per phase 9f spec - keep schema field but skip render */}
      </div>
    </div>
  );
}