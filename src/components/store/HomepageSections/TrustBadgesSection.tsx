import React from "react";

interface TrustBadgesSectionProps {
  config: {
    tagline: string;
    title: string;
    desc: string;
    items: Array<{
      title: string;
      desc: string;
      iconImage?: string;
    }>;
  };
}

// Inline SVG fallback - 4 icons phù hợp ý nghĩa từng badge
const fallbackIcons = [
  // 1. Handmade - bàn xoay gốm (pottery wheel)
  <svg key="handmade" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <ellipse cx="12" cy="18" rx="9" ry="2.5" />
    <path d="M8 18v-5a4 4 0 0 1 8 0v5" />
    <path d="M10 13v-3a2 2 0 0 1 4 0v3" />
  </svg>,
  // 2. Earth-friendly - chiếc lá
  <svg key="earth" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 21 3c-1.5 4-2 5.5-3.1 11.2A7 7 0 0 1 11 20z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>,
  // 3. Contemporary design - chiếc cốc hiện đại
  <svg key="design" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
    <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
    <line x1="6" y1="2" x2="6" y2="4" />
    <line x1="10" y1="2" x2="10" y2="4" />
    <line x1="14" y1="2" x2="14" y2="4" />
  </svg>,
  // 4. Ethical & sustainable - tay bắt tay (kết nối / công bằng)
  <svg key="ethical" className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <path d="m11 17 2 2a1 1 0 1 0 3-3" />
    <path d="m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4" />
    <path d="m21 3 1 11h-2" />
    <path d="M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3" />
    <path d="M3 4h8" />
  </svg>
];

export default function TrustBadgesSection({ config }: TrustBadgesSectionProps) {
  const items = config?.items || [];

  return (
    <section className="py-20 md:py-24 bg-subtle/40 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">

        <div className="text-center max-w-2xl mx-auto mb-16 font-bvp">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
            {config?.tagline || "Why Cốc Nối"}
          </span>
          <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary mb-4">
            {config?.title || "Vì sao chọn Cốc Nối"}
          </h2>
          {config?.desc && (
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify max-w-3xl mx-auto" style={{ color: "var(--color-dark-brown)" }}>
              {config.desc}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {items.map((value, idx) => (
            <div
              key={idx}
              className="bg-canvas p-8 rounded-3 border border-border flex flex-col items-start hover:border-accent transition-colors duration-300"
              style={{ borderColor: "transparent", borderStyle: "solid", borderWidth: "1px" }}
            >
              {/* Icon container - icon-only, no upload */}
              <div className="mb-6 rounded-2 bg-subtle flex items-center justify-center w-14 h-14">
                {value.iconImage ? (
                  <img
                    src={value.iconImage}
                    alt={value.title}
                    className="w-8 h-8 object-contain"
                  />
                ) : (
                  fallbackIcons[idx % fallbackIcons.length]
                )}
              </div>
              <h3 className="font-playfair text-lg font-bold text-primary mb-3">
                {value.title}
              </h3>
              <p className="font-bvp text-xs text-secondary leading-relaxed" style={{ color: "var(--color-dark-brown)" }}>
                {value.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
