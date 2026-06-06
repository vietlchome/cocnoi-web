import { getSiteConfig } from "@/lib/site-config";
import Link from "next/link";

export const metadata = {
  title: "Giá trị Cốc Nối - 4 Brand Pillar",
  description: "KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ. Bốn pillar định hình mọi quyết định của Cốc Nối.",
};

export default async function OurValuesPage() {
  const config = await getSiteConfig();
  const { heroTagline, heroTitle, heroSubtitle, pillars, closingTitle, closingBody } = config.our_values;

  return (
    <main className="w-full bg-canvas text-primary">
      {/* Hero section */}
      <section className="py-20 md:py-28 bg-[#FAF8F5] border-b border-border/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">
            {heroTagline}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-6">
            {heroTitle}
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed max-w-2xl mx-auto">
            {heroSubtitle}
          </p>
        </div>
      </section>

      {/* Pillars sections - 1 section per pillar */}
      {pillars.map((pillar, idx) => (
        <section 
          key={idx} 
          className={`py-20 md:py-24 border-b border-border/20 ${idx % 2 === 0 ? 'bg-canvas' : 'bg-[#FAF8F5]'}`}
        >
          <div className="max-w-5xl mx-auto px-4 md:px-8 grid md:grid-cols-2 gap-12 items-center">
            {/* Text block */}
            <div className={idx % 2 === 0 ? 'md:order-1' : 'md:order-2'}>
              <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-2">
                {pillar.role}
              </span>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-primary mb-4 flex items-center gap-2">
                <span className="text-accent/30 font-medium">0{idx + 1} ·</span>
                {pillar.name}
              </h2>
              <p className="font-bvp text-xs md:text-sm italic text-secondary mb-6 font-medium">
                {pillar.question}
              </p>
              <div className="font-bvp text-sm md:text-base text-secondary leading-relaxed whitespace-pre-line text-justify">
                {pillar.body}
              </div>
            </div>

            {/* Image block */}
            <div className={`${idx % 2 === 0 ? 'md:order-2' : 'md:order-1'} aspect-video bg-[#EFE9DF] rounded-4 overflow-hidden border border-border/60 relative flex items-center justify-center`}>
              {pillar.image ? (
                <img 
                  src={pillar.image} 
                  alt={pillar.name} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:16px_16px] opacity-10 flex flex-col items-center justify-center p-6 text-center">
                  <span className="font-playfair text-xl font-bold text-primary opacity-30 block mb-2">{pillar.name}</span>
                  <span className="font-bvp text-xs text-secondary/40">[Ảnh minh họa chưa được tải lên]</span>
                </div>
              )}
            </div>
          </div>
        </section>
      ))}

      {/* Closing section */}
      <section className="py-20 md:py-28 bg-primary text-canvas relative">
        <div className="absolute inset-0 bg-[radial-gradient(var(--color-terracotta)_1px,transparent_1px)] [background-size:32px_32px] opacity-10"></div>
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center relative z-10">
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6 text-canvas">
            {closingTitle}
          </h2>
          <p className="font-bvp text-sm md:text-base leading-relaxed opacity-90 max-w-2xl mx-auto">
            {closingBody}
          </p>
          <div className="mt-12 flex justify-center gap-4">
            <Link 
              href="/shop" 
              className="bg-accent text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-2 hover:bg-[#B36030] transition-colors inline-flex items-center gap-2"
              style={{ backgroundColor: "var(--color-terracotta)" }}
            >
              Ghé thăm cửa hàng
            </Link>
            <Link 
              href="/discover/our-story" 
              className="border border-canvas/20 hover:border-canvas/60 text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-2 transition-colors"
            >
              Đọc câu chuyện thương hiệu
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
