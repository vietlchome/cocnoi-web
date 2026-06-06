import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  config: any;
  quickChips: Array<{ text: string; url: string }>;
}

export default function HeroSection({ config, quickChips }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-subtle border-b border-border py-20 md:py-32 lg:py-40">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        <div className="lg:col-span-7 flex flex-col items-start text-left z-10 font-bvp">
          <div className="inline-flex items-center gap-2 border border-border px-3.5 py-1.5 rounded-pill mb-6 bg-canvas shadow-xs">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ backgroundColor: "var(--color-terracotta)" }}></span>
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-secondary">
              {config.badge}
            </span>
          </div>
          
          <h1 className="font-playfair font-semibold text-4xl md:text-6xl lg:text-7xl mb-6 text-primary leading-tight">
            {config.title}
          </h1>
          
          <p className="font-bvp text-base md:text-lg text-secondary max-w-xl mb-10 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
            {config.subtitle}
          </p>
          
          <div className="flex flex-wrap gap-4 w-full sm:w-auto">
            <Link 
              href={config.ctaPrimary?.url || "/shop"}
              style={{ backgroundColor: "var(--color-deep-indigo)" }}
              className="inline-flex items-center justify-center bg-primary text-canvas font-bvp font-medium text-sm md:text-base px-8 py-4 rounded-2 hover:opacity-90 transition-all duration-300 w-full sm:w-auto text-center group"
            >
              {config.ctaPrimary?.text || "Khám phá Cửa Hàng"}
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href={config.ctaSecondary?.url || "/community/nguoi-noi"}
              className="inline-flex items-center justify-center bg-transparent border border-border text-primary font-bvp font-medium text-sm md:text-base px-8 py-4 rounded-2 hover:bg-canvas hover:border-accent transition-all duration-300 w-full sm:w-auto text-center"
            >
              {config.ctaSecondary?.text || "Chiến dịch 'Người Nối'"}
            </Link>
          </div>

          {/* Quick Link Chips */}
          <div className="flex flex-wrap items-center gap-2.5 mt-10 md:mt-14 pt-6 border-t border-border/60 w-full">
            <span className="font-bvp text-xs font-bold text-secondary mr-2 uppercase tracking-wider">Tìm nhanh:</span>
            {quickChips.map((chip: any, idx: number) => (
              <Link 
                key={idx}
                href={chip.url}
                className="font-bvp text-xs bg-canvas text-secondary hover:text-accent hover:border-accent border border-border px-3 py-1.5 rounded-2 transition-all"
              >
                {chip.text}
              </Link>
            ))}
          </div>
        </div>

        {/* Styled Abstract Image / User Uploaded Image */}
        <div className="lg:col-span-5 relative w-full max-w-md mx-auto aspect-[3/4] flex items-center justify-center">
          {config.imageUrl ? (
            <div className="absolute inset-0 rounded-6 overflow-hidden border border-border shadow-md">
              <img 
                src={config.imageUrl} 
                alt="Cốc Nối Banner" 
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[#EFE9DF] rounded-6 transform rotate-2 overflow-hidden border border-border flex items-center justify-center">
              <div className="relative w-[75%] h-[80%] bg-[#FEFCF9] rounded-4 shadow-sm border border-border p-6 flex flex-col justify-between overflow-hidden">
                <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#E5D7C2] opacity-40 blur-xl"></div>
                <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-[#C2703E] opacity-10 blur-xl"></div>
                
                <div className="flex justify-between items-start">
                  <span className="font-playfair text-xl italic text-accent" style={{ color: "var(--color-terracotta)" }}>No.01</span>
                  <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center font-playfair font-semibold text-secondary">CN</div>
                </div>

                <div className="my-auto py-4 flex flex-col items-center">
                  <svg viewBox="0 0 100 100" className="w-32 h-32 text-primary drop-shadow-sm" style={{ color: "var(--color-deep-indigo)" }}>
                    <path d="M68,35 C82,35 82,65 68,65" fill="none" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
                    <path d="M28,30 L64,30 C64,30 64,72 46,72 C28,72 28,30 28,30 Z" fill="var(--color-cream)" stroke="currentColor" strokeWidth="4" strokeLinejoin="round" />
                    <path d="M30,42 Q46,38 62,42" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  </svg>
                  <span className="font-quicksand font-light italic text-xs text-secondary mt-3 uppercase tracking-wider">Cốc Gốm Mộc Bát Tràng</span>
                </div>

                <div className="flex justify-between items-end border-t border-border pt-4">
                  <div>
                    <p className="font-bvp text-[10px] text-secondary">Chế tác</p>
                    <p className="font-bvp text-xs font-bold">100% Thủ Công</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bvp text-[10px] text-secondary">Nhiệt độ nung</p>
                    <p className="font-bvp text-xs font-bold">1250°C</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div 
            style={{ backgroundColor: "var(--color-terracotta)", borderColor: "var(--color-terracotta)" }}
            className="absolute bottom-4 left-4 bg-accent text-canvas font-playfair italic text-xs md:text-sm px-4 py-2.5 rounded-3 shadow-md -rotate-6 border"
          >
            "{config.floatingLabel}"
          </div>
        </div>

      </div>
    </section>
  );
}
