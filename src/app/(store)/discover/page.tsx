import Link from "next/link";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Khám phá Cốc Nối",
  description: "Câu chuyện, con người, quy trình thủ công, và giá trị của Cốc Nối.",
};

const DEFAULT_CARDS = [
  { en: "Our Story",  title: "Câu chuyện",         desc: "Khởi nguồn từ Bát Tràng, ý nghĩa cái tên, lý do là đôi cốc.",     href: "/discover/our-story"  },
  { en: "Our Human",  title: "Con người",           desc: "Những đôi tay làm nên Cốc Nối. Nghệ nhân, đối tác, founders.",    href: "/discover/our-human"  },
  { en: "Our Craft",  title: "Quy trình thủ công",  desc: "7 bước từ đất đến cốc. Vì sao chúng tôi chọn làm thủ công.",      href: "/discover/our-craft"  },
  { en: "Our Values", title: "Giá trị",             desc: "4 pillar: KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ.",               href: "/discover/our-values" },
];

export default async function DiscoverLandingPage() {
  const config = await getSiteConfig();
  const s = config.discover_index;

  const eyebrow  = s?.eyebrow  || "Khám Phá";
  const title    = s?.title    || "Khám phá Cốc Nối";
  const subtitle = s?.subtitle || "Câu chuyện, con người, quy trình, và giá trị làm nên thương hiệu.";
  const cards    = s?.cards?.length ? s.cards : DEFAULT_CARDS;

  return (
    <main className="w-full bg-canvas py-20 md:py-28 text-primary">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <header className="text-center mb-16">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3 animate-fade-in">
            {eyebrow}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4">
            {title}
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-xl mx-auto">
            {subtitle}
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {cards.map((c, idx) => (
            <Link
              key={idx}
              href={c.href}
              className="group block bg-[#FAF8F5] border border-border/65 rounded-4 p-8 md:p-10 hover:border-accent transition-all duration-300 hover:shadow-md"
            >
              <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-2">
                {c.en}
              </span>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                {c.title}
              </h2>
              <p className="font-bvp text-sm text-secondary leading-relaxed">
                {c.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
