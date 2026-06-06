import Link from "next/link";
import { Users, Award, ChevronDown } from "lucide-react";

interface FaqSectionProps {
  config: any;
  faqs: any[];
  faqsB2b: any[];
}

export default function FaqSection({ config, faqs, faqsB2b }: FaqSectionProps) {
  const links = config.social?.links || [];
  const getUrl = (platform: string, fallback: string) => {
    const item = links.find((l: any) => l.platform === platform);
    return item && item.visible ? (item.url || fallback) : fallback;
  };

  const zaloUrl = getUrl("zalo", "https://zalo.me/");
  const facebookUrl = getUrl("facebook", "https://facebook.com/");
  const instagramUrl = getUrl("instagram", "https://instagram.com/");

  return (
    <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8">
      
      <div className="text-center mb-12 md:mb-16 font-bvp">
        <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
          {config.tagline}
        </span>
        <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary">
          {config.title}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        
        {/* Cột Khách Lẻ */}
        <div>
          <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center border border-border shrink-0">
              <Users className="w-5 h-5 text-accent" style={{ color: "var(--color-terracotta)" }} />
            </div>
            <h3 className="font-playfair text-2xl font-bold text-primary">
              {config.retailTitle}
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {faqs.map((faq: any, idx: number) => (
              <details 
                key={idx} 
                className="group bg-canvas border border-border rounded-3 overflow-hidden transition-all duration-300"
              >
                <summary className="w-full list-none flex items-center justify-between px-6 py-5 text-left font-playfair font-semibold text-primary text-base hover:text-accent transition-colors cursor-pointer select-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q || faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-secondary group-open:rotate-180 transition-transform duration-300 shrink-0" />
                </summary>
                
                <div className="px-6 py-5 font-bvp text-sm text-secondary leading-relaxed bg-subtle/30 border-t border-border" style={{ color: "var(--color-dark-brown)" }}>
                  {faq.a || faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Cột Khách Sỉ */}
        <div>
          <div className="flex items-center gap-3 mb-8 border-b border-border pb-4">
            <div className="w-10 h-10 rounded-full bg-subtle flex items-center justify-center border border-border shrink-0">
              <Award className="w-5 h-5 text-accent" style={{ color: "var(--color-terracotta)" }} />
            </div>
            <h3 className="font-playfair text-2xl font-bold text-primary">
              {config.b2bTitle}
            </h3>
          </div>
          
          <div className="flex flex-col gap-4">
            {faqsB2b.map((faq: any, idx: number) => (
              <details 
                key={idx} 
                className="group bg-canvas border border-border rounded-3 overflow-hidden transition-all duration-300"
              >
                <summary className="w-full list-none flex items-center justify-between px-6 py-5 text-left font-playfair font-semibold text-primary text-base hover:text-accent transition-colors cursor-pointer select-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.q || faq.question}</span>
                  <ChevronDown className="w-5 h-5 text-secondary group-open:rotate-180 transition-transform duration-300 shrink-0" />
                </summary>
                
                <div className="px-6 py-5 font-bvp text-sm text-secondary leading-relaxed bg-subtle/30 border-t border-border" style={{ color: "var(--color-dark-brown)" }}>
                  {faq.a || faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

      </div>

      <div className="text-center mt-12 font-bvp">
        <p className="font-bvp text-sm text-secondary mb-4">Bạn vẫn còn câu hỏi khác?</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          
          {/* 1. Nút Form Liên Hệ */}
          <Link 
            href="/contact" 
            style={{ backgroundColor: "var(--color-deep-indigo)" }}
            className="inline-flex items-center gap-2 bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
          >
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <span>Form Liên hệ</span>
          </Link>

          {/* 2. Nút Zalo */}
          <a 
            href={zaloUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#0068FF] text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
          >
            {/* Zalo Logo SVG */}
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M21.547 12.016c0-4.32-3.805-7.838-8.496-7.838-4.693 0-8.498 3.518-8.498 7.838 0 4.045 3.321 7.371 7.64 7.801l.836 2.399c.095.27.424.331.62.115l3.228-3.504a8.91 8.91 0 0 0 4.67-6.811z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8.5 12h7M8.5 9h7M10 15h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>Chat qua Zalo</span>
          </a>

          {/* 3. Nút Facebook */}
          <a 
            href={facebookUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#1877F2] text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
          >
            {/* Standard Facebook SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            <span>Facebook</span>
          </a>

          {/* 4. Nút Instagram */}
          <a 
            href={instagramUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#FCB045] text-white font-bvp font-medium text-xs px-6 py-3.5 rounded-pill hover:opacity-90 transition-colors shadow-sm cursor-pointer"
          >
            {/* Standard Instagram SVG */}
            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
            </svg>
            <span>Instagram</span>
          </a>
        </div>
      </div>

    </section>
  );
}
