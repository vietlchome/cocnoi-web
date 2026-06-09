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
      <div
        className="shadow-lg rounded border p-6 grid grid-cols-3 gap-6 min-w-[600px] max-w-[720px]"
        style={{
          backgroundColor: "var(--color-warm-white)",
          borderColor: "var(--color-sand, #e8e0d5)",
        }}
      >
        {/* Cột 1 - Danh mục */}
        <div>
          <h3
            className="font-playfair text-[11px] tracking-[0.15em] font-bold mb-3 uppercase"
            style={{ color: "var(--color-deep-indigo)", opacity: 0.6 }}
          >
            {config.column1.title}
          </h3>
          <ul className="space-y-1">
            {categories.map((cat: { id: string; name: string; slug: string }) => (
              <li key={cat.id}>
                <Link
                  href={`/cua-hang?category=${cat.slug}`}
                  className="block py-1 text-sm font-bvp font-medium transition-colors"
                  style={{ color: "var(--color-deep-indigo)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-terracotta)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-deep-indigo)")}
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/cua-hang"
                className="block text-xs font-bvp transition-colors"
                style={{ color: "var(--color-terracotta)" }}
              >
                {config.column1.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 2 - BST */}
        <div>
          <h3
            className="font-playfair text-[11px] tracking-[0.15em] font-bold mb-3 uppercase"
            style={{ color: "var(--color-deep-indigo)", opacity: 0.6 }}
          >
            {config.column2.title}
          </h3>
          <ul className="space-y-1">
            {productGroups.map((pg: { id: string; name: string; slug: string }) => (
              <li key={pg.id}>
                <Link
                  href={`/cua-hang?collection=${pg.slug}`}
                  className="block py-1 text-sm font-bvp font-medium transition-colors"
                  style={{ color: "var(--color-deep-indigo)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-terracotta)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-deep-indigo)")}
                >
                  {pg.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/cua-hang?view=collections"
                className="block text-xs font-bvp transition-colors"
                style={{ color: "var(--color-terracotta)" }}
              >
                {config.column2.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Cột 3 - Hoàn thiện */}
        <div>
          <h3
            className="font-playfair text-[11px] tracking-[0.15em] font-bold mb-3 uppercase"
            style={{ color: "var(--color-deep-indigo)", opacity: 0.6 }}
          >
            {config.column3.title}
          </h3>
          <ul className="space-y-1">
            {finishes.map((f: { id: string; name: string; slug: string }) => (
              <li key={f.id}>
                <Link
                  href={`/cua-hang?finish=${f.slug}`}
                  className="block py-1 text-sm font-bvp font-medium transition-colors"
                  style={{ color: "var(--color-deep-indigo)" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-terracotta)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.color = "var(--color-deep-indigo)")}
                >
                  {f.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link
                href="/cua-hang?view=finishes"
                className="block text-xs font-bvp transition-colors"
                style={{ color: "var(--color-terracotta)" }}
              >
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