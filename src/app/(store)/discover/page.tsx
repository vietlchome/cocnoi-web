import Link from "next/link";

export const metadata = {
  title: "Khám phá Cốc Nối",
  description: "Câu chuyện, con người, quy trình thủ công, và giá trị của Cốc Nối.",
};

const sections = [
  {
    href: "/discover/our-story",
    title: "Câu chuyện",
    en: "Our Story",
    desc: "Khởi nguồn từ Bát Tràng, ý nghĩa cái tên, lý do là đôi cốc."
  },
  {
    href: "/discover/our-human",
    title: "Con người",
    en: "Our Human",
    desc: "Những đôi tay làm nên Cốc Nối. Nghệ nhân, đối tác, founders."
  },
  {
    href: "/discover/our-craft",
    title: "Quy trình thủ công",
    en: "Our Craft",
    desc: "7 bước từ đất đến cốc. Vì sao chúng tôi chọn làm thủ công."
  },
  {
    href: "/discover/our-values",
    title: "Giá trị",
    en: "Our Values",
    desc: "4 pillar: KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ."
  }
];

export default function DiscoverLandingPage() {
  return (
    <main className="w-full bg-canvas py-20 md:py-28 text-primary">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <header className="text-center mb-16">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3 animate-fade-in">
            Khám Phá
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4">
            Khám phá Cốc Nối
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-xl mx-auto">
            Câu chuyện, con người, quy trình, và giá trị làm nên thương hiệu.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6 md:gap-8">
          {sections.map((s) => (
            <Link 
              key={s.href} 
              href={s.href}
              className="group block bg-[#FAF8F5] border border-border/65 rounded-4 p-8 md:p-10 hover:border-accent transition-all duration-300 hover:shadow-md"
            >
              <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-2">
                {s.en}
              </span>
              <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                {s.title}
              </h2>
              <p className="font-bvp text-sm text-secondary leading-relaxed">
                {s.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
