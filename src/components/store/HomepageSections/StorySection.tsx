interface StorySectionProps {
  config: any;
}

// Detect video extension
function isVideo(url: string): boolean {
  if (!url) return false;
  const lower = url.toLowerCase();
  return lower.endsWith(".mp4") || lower.endsWith(".webm") || lower.endsWith(".mov");
}

function FeatureMedia({ imgUrl, videoUrl, alt, placeholder }: { imgUrl?: string; videoUrl?: string; alt?: string; placeholder: string }) {
  // URL paste field (videoUrl) takes precedence over upload (imgUrl)
  // Detect video extension to decide <video> vs <img>
  const url = videoUrl || imgUrl;
  if (!url) {
    return <div className="text-secondary/50 font-bvp text-xs">{placeholder}</div>;
  }
  if (isVideo(url)) {
    return (
      <video
        src={url}
        autoPlay
        muted
        loop
        playsInline
        className="w-full h-full object-cover"
      />
    );
  }
  return <img src={url} alt={alt || ""} className="w-full h-full object-cover" />;
}

export default function StorySection({ config }: StorySectionProps) {
  return (
    <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8 border-b border-border">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

        <div className="lg:col-span-6 flex flex-col items-start font-bvp">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3" style={{ color: "var(--color-terracotta)" }}>
            {config.tagline}
          </span>
          <h2 className="font-playfair font-semibold text-3xl md:text-5xl mb-6 text-primary leading-tight">
            {config.title}
          </h2>
          <p className="font-bvp text-base text-secondary mb-5 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
            {config.desc1}
          </p>
          <p className="font-bvp text-base text-secondary mb-8 leading-relaxed text-justify" style={{ color: "var(--color-dark-brown)" }}>
            {config.desc2}
          </p>

          <div className="grid grid-cols-2 gap-6 w-full border-t border-border pt-8">
            <div>
              <p className="font-playfair text-3xl font-bold text-accent" style={{ color: "var(--color-terracotta)" }}>
                {config.stat1Val}
              </p>
              <p className="font-bvp text-xs text-secondary mt-1">{config.stat1Lbl}</p>
            </div>
            <div>
              <p className="font-playfair text-3xl font-bold text-accent" style={{ color: "var(--color-terracotta)" }}>
                {config.stat2Val}
              </p>
              <p className="font-bvp text-xs text-secondary mt-1">{config.stat2Lbl}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6 grid grid-cols-2 gap-4">
          <div className="bg-subtle rounded-4 border border-border flex items-center justify-center text-center aspect-square overflow-hidden relative">
            <FeatureMedia imgUrl={config.features?.[0]?.imgUrl} videoUrl={config.features?.[0]?.videoUrl} alt={config.features?.[0]?.alt} placeholder="Ảnh đặc trưng 1" />
          </div>
          <div className="bg-canvas rounded-4 border border-border flex items-center justify-center text-center aspect-square mt-6 overflow-hidden relative">
            <FeatureMedia imgUrl={config.features?.[1]?.imgUrl} videoUrl={config.features?.[1]?.videoUrl} alt={config.features?.[1]?.alt} placeholder="Ảnh đặc trưng 2" />
          </div>
          <div className="bg-canvas rounded-4 border border-border flex items-center justify-center text-center aspect-square -mt-6 overflow-hidden relative">
            <FeatureMedia imgUrl={config.features?.[2]?.imgUrl} videoUrl={config.features?.[2]?.videoUrl} alt={config.features?.[2]?.alt} placeholder="Ảnh đặc trưng 3" />
          </div>
          <div className="bg-subtle rounded-4 border border-border flex items-center justify-center text-center aspect-square overflow-hidden relative">
            <FeatureMedia imgUrl={config.features?.[3]?.imgUrl} videoUrl={config.features?.[3]?.videoUrl} alt={config.features?.[3]?.alt} placeholder="Ảnh đặc trưng 4" />
          </div>
        </div>

      </div>
    </section>
  );
}
