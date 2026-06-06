import Link from "next/link";

export const metadata = {
  title: "Đối Tác Cốc Nối - Hợp tác B2B",
  description: "Trở thành đại lý, đặt quà tặng doanh nghiệp, hoặc tìm cửa hàng có sản phẩm Cốc Nối.",
};

const sections = [
  {
    href: "/partners/stockists",
    title: "Tìm cửa hàng",
    en: "Find a Stockist",
    desc: "Danh sách concept store, café, gallery đang bán sản phẩm Cốc Nối."
  },
  {
    href: "/partners/become-a-stockist",
    title: "Trở thành đại lý",
    en: "Become a Stockist",
    desc: "Đăng ký bán Cốc Nối tại không gian của bạn. Wholesale với chiết khấu theo bậc số lượng."
  },
  {
    href: "/partners/corporate-gifting",
    title: "Quà tặng doanh nghiệp",
    en: "Corporate Gifting",
    desc: "Đặt cốc làm quà tặng đối tác, nhân viên, sự kiện. Logo, hộp quà, và thiệp tay tùy chỉnh."
  }
];

export default function PartnersLandingPage() {
  return (
    <main className="w-full bg-canvas py-20 md:py-28 text-primary">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <header className="text-center mb-16">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3 animate-fade-in">
            Partners
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4 animate-fade-in">
            Đối Tác Cốc Nối
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-xl mx-auto leading-relaxed">
            Các cơ hội kết nối và đồng hành cùng Cốc Nối cho cửa hàng bán lẻ và đối tác doanh nghiệp.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {sections.map((s) => (
            <Link 
              key={s.href} 
              href={s.href}
              className="group block bg-[#FAF8F5] border border-border/65 rounded-4 p-8 md:p-10 hover:border-accent transition-all duration-300 hover:shadow-md flex flex-col justify-between"
            >
              <div>
                <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-2">
                  {s.en}
                </span>
                <h2 className="font-playfair text-xl md:text-2xl font-bold text-primary mb-3 group-hover:text-accent transition-colors">
                  {s.title}
                </h2>
                <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
                  {s.desc}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-1.5 text-xs text-accent font-semibold group-hover:translate-x-1 transition-transform" style={{ color: "var(--color-terracotta)" }}>
                <span>Tìm hiểu thêm</span>
                <span aria-hidden>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
