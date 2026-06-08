"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

type Item = {
  id: string;
  name: string;
  slug: string;
};

type MegaMenuMobileProps = {
  categories: Item[];
  productGroups: Item[];
  finishes: Item[];
  config: any;
  onClose: () => void;
};

export default function MegaMenuMobile({
  categories,
  productGroups,
  finishes,
  config,
  onClose,
}: MegaMenuMobileProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    categories: true,
    groups: false,
    finishes: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  return (
    <div className="flex flex-col gap-4 pl-4 border-l border-border/80 mt-1 select-none font-bvp">
      {/* 1. DANH MỤC ACCORDION */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-primary uppercase tracking-wider cursor-pointer"
        >
          <span>{config.column1.title}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              openSections.categories ? "rotate-180" : ""
            }`}
          />
        </button>
        {openSections.categories && (
          <ul className="pl-3 mt-1 space-y-2 text-xs">
            {categories.map((cat) => (
              <li key={cat.id}>
                <Link
                  href={`/cua-hang?category=${cat.slug}`}
                  onClick={onClose}
                  className="block py-1 text-secondary hover:text-accent font-medium"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/cua-hang"
                onClick={onClose}
                className="block py-1 text-accent font-bold"
              >
                {config.column1.viewAllLabel}
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* 2. BỘ SƯU TẬP ACCORDION */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("groups")}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-primary uppercase tracking-wider cursor-pointer"
        >
          <span>{config.column2.title}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              openSections.groups ? "rotate-180" : ""
            }`}
          />
        </button>
        {openSections.groups && (
          <ul className="pl-3 mt-1 space-y-2 text-xs">
            {productGroups.map((pg) => (
              <li key={pg.id}>
                <Link
                  href={`/cua-hang?collection=${pg.slug}`}
                  onClick={onClose}
                  className="block py-1 text-secondary hover:text-accent font-medium"
                >
                  {pg.name}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/cua-hang?view=collections"
                onClick={onClose}
                className="block py-1 text-accent font-bold"
              >
                {config.column2.viewAllLabel}
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* 3. HOÀN THIỆN ACCORDION */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection("finishes")}
          className="w-full flex items-center justify-between py-2 text-xs font-bold text-primary uppercase tracking-wider cursor-pointer"
        >
          <span>{config.column3.title}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              openSections.finishes ? "rotate-180" : ""
            }`}
          />
        </button>
        {openSections.finishes && (
          <ul className="pl-3 mt-1 space-y-2 text-xs">
            {finishes.map((f) => (
              <li key={f.id}>
                <Link
                  href={`/cua-hang?finish=${f.slug}`}
                  onClick={onClose}
                  className="block py-1 text-secondary hover:text-accent font-medium"
                >
                  {f.name}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/cua-hang?view=finishes"
                onClick={onClose}
                className="block py-1 text-accent font-bold"
              >
                {config.column3.viewAllLabel}
              </Link>
            </li>
          </ul>
        )}
      </div>

      {/* 4. FEATURED CARDS */}
      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border/40">
        {config.featuredCards.map((card: any, i: number) => (
          <Link
            key={i}
            href={card.href}
            onClick={onClose}
            className="block group"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/40 bg-cream/35">
              {card.image ? (
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-secondary/40 text-[9px] font-bold uppercase tracking-wider">
                  No image
                </div>
              )}
            </div>
            <h4 className="font-playfair text-xs font-bold text-primary mt-1.5 group-hover:text-accent transition-colors line-clamp-1">
              {card.title}
            </h4>
            <span className="text-accent text-[9px] font-bold uppercase tracking-wider block mt-0.5">
              {card.ctaLabel} →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
