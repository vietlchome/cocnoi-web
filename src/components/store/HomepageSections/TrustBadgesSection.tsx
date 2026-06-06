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

// Map cac inline SVGs lam bieu tuong mac dinh cho 4 loai badge
const fallbackIcons = [
  // 1. Handmade in Bat Trang (Bieu tuong chiec coc/lo gom thu cong)
  <svg key="handmade" className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <path d="M12 3v18M17 8H7M19 13H5M18 18H6" />
    <path d="M6 8v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8" />
  </svg>,
  // 2. Earth-friendly (Bieu tuong chiec la tu nhien)
  <svg key="earth" className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 21 3c-1.5 4-2 5.5-3.1 11.2A7 7 0 0 1 11 20z" />
    <path d="M9 11l3 3" />
  </svg>,
  // 3. Contemporary design (Bieu tuong cac duong net hien dai)
  <svg key="design" className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>,
  // 4. Ethical & sustainable (Bieu tuong trai tim ket noi)
  <svg key="ethical" className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-terracotta)" }}>
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
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
              <div className="mb-6 p-3 rounded-2 bg-subtle flex items-center justify-center min-w-[48px] min-h-[48px]">
                {value.iconImage ? (
                  <img 
                    src={value.iconImage} 
                    alt={value.title} 
                    className="w-6 h-6 object-contain"
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
