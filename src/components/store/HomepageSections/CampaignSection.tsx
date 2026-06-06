import Link from "next/link";
import { ArrowRight, Users } from "lucide-react";

interface CampaignSectionProps {
  config: any;
}

export default function CampaignSection({ config }: CampaignSectionProps) {
  return (
    <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8 border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 md:gap-16 items-center">
        
        {/* Campaign Visual Pane */}
        <div className="lg:col-span-6 relative w-full max-w-xl mx-auto aspect-[4/3] bg-subtle rounded-4 overflow-hidden border border-border p-8 flex flex-col justify-between">
          {config.heroImageUrl ? (
            <div className="absolute inset-0">
              <img 
                src={config.heroImageUrl} 
                alt="Nhân vật Người Nối" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--color-deep-indigo) 90%, transparent), transparent, transparent)" }}></div>
            </div>
          ) : (
            <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
          )}
          
          <div className="z-10 bg-canvas/80 backdrop-blur-xs border border-border p-4 rounded-3 self-start max-w-xs">
            <span className="font-playfair text-accent font-semibold italic text-base" style={{ color: "var(--color-terracotta)" }}>
              Câu chuyện tiêu điểm
            </span>
            <p className="font-bvp text-xs text-secondary mt-1">
              "{config.heroName}"
            </p>
          </div>

          {!config.heroImageUrl && (
            <div className="my-auto flex justify-center z-10 py-6">
              <div className="w-40 h-40 rounded-full border-2 border-dashed border-accent/40 flex items-center justify-center p-3">
                <div className="w-full h-full rounded-full bg-primary/5 flex items-center justify-center">
                  <Users className="w-12 h-12 text-accent" style={{ color: "var(--color-terracotta)" }} />
                </div>
              </div>
            </div>
          )}

          <div className="z-10 flex items-center justify-between mt-auto">
            <span className={`font-quicksand font-bold text-xs tracking-widest uppercase ${config.heroImageUrl ? "text-canvas" : "text-secondary"}`}>
              {config.badge}
            </span>
            <span className={`font-playfair italic text-xs truncate max-w-[200px] ${config.heroImageUrl ? "text-accent/90" : "text-primary"}`} style={{ color: config.heroImageUrl ? undefined : "var(--color-terracotta)" }}>
              "{config.heroQuote ? config.heroQuote.slice(0, 30) : ""}..."
            </span>
          </div>
        </div>

        <div className="lg:col-span-6 flex flex-col items-start font-bvp">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3" style={{ color: "var(--color-terracotta)" }}>
            {config.badge}
          </span>
          <h2 className="font-playfair font-semibold text-3xl md:text-5xl mb-6 text-primary leading-tight">
            {config.title}
          </h2>
          <p className="font-bvp text-base text-secondary mb-6 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
            {config.desc}
          </p>
          
          {/* Highlighted character quote */}
          <div className="border-l-2 border-accent pl-4.5 py-1 mb-8 italic text-xs text-secondary font-bvp" style={{ borderColor: "var(--color-terracotta)" }}>
            <p className="font-semibold text-primary">"{config.heroQuote}"</p>
            <p className="mt-1 font-quicksand font-bold uppercase tracking-wider text-[10px]">— {config.heroName}</p>
          </div>

          {config.cta?.url && (
            <Link 
              href={config.cta.url}
              style={{ backgroundColor: "var(--color-terracotta)" }}
              className="inline-flex items-center justify-center bg-accent text-canvas font-bvp font-medium text-sm md:text-base px-7 py-3.5 rounded-2 hover:opacity-90 transition-colors shadow-sm cursor-pointer"
            >
              {config.cta.text || "Tìm hiểu thêm"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          )}
        </div>

      </div>
    </section>
  );
}
