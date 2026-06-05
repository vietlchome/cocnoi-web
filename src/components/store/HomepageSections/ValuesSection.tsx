import React from "react";

interface ValuesSectionProps {
  config: any;
  brandValues: Array<{ icon: React.ReactNode; title: string; desc: string }>;
}

export default function ValuesSection({ config, brandValues }: ValuesSectionProps) {
  return (
    <section className="py-20 md:py-24 bg-subtle/40 border-b border-border">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        <div className="text-center max-w-2xl mx-auto mb-16 font-bvp">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block" style={{ color: "var(--color-terracotta)" }}>
            {config.tagline}
          </span>
          <h2 className="font-playfair font-semibold text-3xl md:text-5xl text-primary mb-4">
            {config.title}
          </h2>
          <p className="font-bvp text-sm text-secondary leading-relaxed text-justify max-w-3xl mx-auto" style={{ color: "var(--color-dark-brown)" }}>
            {config.desc}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {brandValues.map((value, idx) => (
            <div 
              key={idx} 
              className="bg-canvas p-8 rounded-3 border border-border flex flex-col items-start hover:border-accent transition-colors duration-300"
              style={{ borderColor: "transparent", borderStyle: "solid", borderWidth: "1px" }}
            >
              <div className="mb-6 p-3 rounded-2 bg-subtle">{value.icon}</div>
              <h3 className="font-playfair text-lg font-bold text-primary mb-3">
                {value.title}
              </h3>
              <p className="font-bvp text-xs text-secondary leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
                {value.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
