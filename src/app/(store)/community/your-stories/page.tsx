import { getSiteConfig } from "@/lib/site-config";

export const metadata = {
  title: "Câu chuyện của bạn - Cốc Nối",
  description: "Những khoảnh khắc ý nghĩa các bạn đã chia sẻ cùng Cốc Nối.",
};

export default async function YourStoriesPage() {
  const config = await getSiteConfig();
  const cs = config.community_stories ?? {
    title: "Câu chuyện của bạn",
    intro: "Chiếc cốc Cốc Nối của bạn đã đi cùng những khoảnh khắc nào? Chúng tôi muốn lắng nghe câu chuyện của bạn.",
    ctaText: "Gửi câu chuyện qua Telegram",
    ctaUrl: "https://t.me/cocnoi",
    stories: [],
  };

  return (
    <main className="w-full bg-canvas py-20 md:py-28 font-bvp text-primary">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <header className="mb-12 text-center">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">#cocnoiwithyou</span>
          <h1 className="font-playfair text-4xl md:text-5xl font-bold mb-4">{cs.title}</h1>
          <p className="text-secondary text-sm md:text-base max-w-xl mx-auto leading-relaxed">{cs.intro}</p>
        </header>

        {cs.stories.length === 0 ? (
          <div className="bg-cream rounded-2xl p-8 text-center border border-border">
            <p className="text-secondary mb-6 leading-relaxed">Hãy là người đầu tiên chia sẻ câu chuyện.</p>
            <a
              href={cs.ctaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-canvas px-6 py-3 rounded-pill"
              style={{ backgroundColor: "var(--color-terracotta)" }}
            >
              {cs.ctaText}
            </a>
          </div>
        ) : (
          <>
            <div className="space-y-8">
              {cs.stories.map((s, i) => (
                <article key={i} className="border-l-4 pl-6" style={{ borderColor: "var(--color-terracotta)" }}>
                  <p className="text-secondary italic leading-relaxed">"{s.content}"</p>
                  <footer className="mt-3 text-xs text-secondary/60 font-bold uppercase tracking-wider">
                    {s.authorName}
                    {s.location && ` · ${s.location}`}
                    {s.date && ` · ${s.date}`}
                  </footer>
                </article>
              ))}
            </div>
            <div className="mt-14 text-center">
              <a
                href={cs.ctaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 font-bold text-xs uppercase tracking-widest text-canvas px-6 py-3 rounded-pill"
                style={{ backgroundColor: "var(--color-terracotta)" }}
              >
                {cs.ctaText}
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
