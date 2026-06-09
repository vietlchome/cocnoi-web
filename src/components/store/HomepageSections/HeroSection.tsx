import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

interface HeroSectionProps {
  config: any;
}

export default function HeroSection({ config }: HeroSectionProps) {
  const isVideo = config.mediaType === "video" && !!config.videoUrl;
  const showSecondaryCta = config.ctaSecondary?.text && config.ctaSecondary.text.trim() !== "";
  const showShowcase = config.showShowcaseCard === true;

  // Phase 9g: split title to highlight "Nối" in terracotta accent color
  const titleParts = (config.title || "").split(/(Nối)/g);

  return (
    <section className="relative overflow-hidden bg-subtle border-b border-border min-h-[80vh] flex items-center">
      {/* === MEDIA BACKGROUND === */}
      <div className="absolute inset-0 z-0">
        {isVideo ? (
          <>
            <video
              autoPlay={config.videoAutoplay !== false}
              muted
              loop
              playsInline
              poster={config.videoPosterUrl || undefined}
              className="motion-safe:block motion-reduce:hidden absolute inset-0 w-full h-full object-cover"
            >
              <source src={config.videoUrl} type="video/mp4" />
            </video>
            {config.videoPosterUrl && (
              <Image
                src={config.videoPosterUrl}
                alt={config.imageAlt || config.title || ""}
                fill
                priority
                sizes="100vw"
                className="motion-safe:hidden motion-reduce:block object-cover"
              />
            )}
          </>
        ) : (
          config.imageUrl && (
            <Image
              src={config.imageUrl}
              alt={config.imageAlt || config.title || ""}
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          )
        )}
        {(isVideo || config.imageUrl) && (
          <div className="absolute inset-0 bg-deep-indigo/20" />
        )}
      </div>

      {/* === CONTENT === */}
      <div className="relative z-10 w-full max-w-[1280px] mx-auto px-4 md:px-8 py-20 md:py-32 lg:py-40 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

        {/* LEFT: Glass panel content */}
        <div className={`${showShowcase ? "lg:col-span-7" : "lg:col-span-6"} flex flex-col items-start text-left font-bvp`}>
          <div className="bg-canvas/85 backdrop-blur-md border border-border/40 shadow-xl rounded-4 p-6 md:p-8 w-full max-w-2xl">
            <div className="inline-flex items-center gap-2 border border-border px-3.5 py-1.5 rounded-pill mb-6 bg-canvas shadow-xs">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" style={{ backgroundColor: "var(--color-accent)" }}></span>
              <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-secondary">
                {config.badge}
              </span>
            </div>

            <h1 className="font-playfair italic font-semibold text-2xl md:text-3xl lg:text-4xl mb-5 text-primary leading-tight whitespace-nowrap">
              {titleParts.map((part, idx) =>
                part === "Nối" ? (
                  <span key={idx} style={{ color: "var(--color-terracotta)" }}>{part}</span>
                ) : (
                  <span key={idx}>{part}</span>
                )
              )}
            </h1>

            <p className="font-bvp text-sm md:text-base max-w-xl mb-6 leading-relaxed" style={{ color: "var(--color-dark-brown)" }}>
              {config.subtitle}
            </p>

            <div className="flex flex-wrap gap-3 w-full sm:w-auto">
              <Link
                href={config.ctaPrimary?.url || "/cua-hang"}
                style={{ backgroundColor: "var(--color-deep-indigo)" }}
                className="inline-flex items-center justify-center text-canvas font-bvp font-medium text-sm px-6 py-3 rounded-2 hover:opacity-90 transition-all duration-300 w-full sm:w-auto text-center group"
              >
                {config.ctaPrimary?.text || "Khám phá Cửa Hàng"}
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              {showSecondaryCta && (
                <Link
                  href={config.ctaSecondary?.url || "/"}
                  className="inline-flex items-center justify-center bg-transparent border border-border text-primary font-bvp font-medium text-sm px-6 py-3 rounded-2 hover:bg-canvas hover:border-accent transition-all duration-300 w-full sm:w-auto text-center"
                >
                  {config.ctaSecondary.text}
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: Showcase card (optional, off by default) */}
        {showShowcase && (
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

            {config.floatingLabel && (
              <div
                style={{ backgroundColor: "var(--color-terracotta)", borderColor: "var(--color-terracotta)" }}
                className="absolute bottom-4 left-4 text-canvas font-playfair italic text-xs md:text-sm px-4 py-2.5 rounded-3 shadow-md -rotate-6 border"
              >
                "{config.floatingLabel}"
              </div>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
