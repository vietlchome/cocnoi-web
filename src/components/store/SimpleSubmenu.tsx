import Link from "next/link";

type SimpleSubmenuItem = { label: string; href: string };

type SimpleSubmenuProps = {
  items: SimpleSubmenuItem[];
};

export function SimpleSubmenu({ items }: SimpleSubmenuProps) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 min-w-[220px] z-50">
      <div
        className="shadow-lg rounded border py-2"
        style={{
          backgroundColor: "var(--color-warm-white)",
          borderColor: "var(--color-sand, #e8e0d5)",
        }}
      >
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="block px-4 py-2.5 text-sm font-bvp font-medium transition-colors"
            style={{ color: "var(--color-deep-indigo)" }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-cream, #f5efe6)";
              (e.currentTarget as HTMLElement).style.color = "var(--color-terracotta)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "";
              (e.currentTarget as HTMLElement).style.color = "var(--color-deep-indigo)";
            }}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
