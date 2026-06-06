import Link from "next/link";
import { ArrowRight, Sparkles, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Con người Cốc Nối - Những đôi tay đắp đất mộc",
  description: "Mỗi đôi cốc đi qua nhiều đôi tay. Đây là những con người dệt nên Cốc Nối - từ đất đến tay bạn.",
};

export default function OurHumanPage() {
  const members = [
    {
      name: "Nghệ nhân Lê Minh",
      role: "Trực giác ngọn lửa lò (32 năm kinh nghiệm)",
      desc: "Người giữ ấm nhiệt độ nung Bát Tràng. Bác Minh điều tiết ngọn lửa bằng trực giác và kinh nghiệm tích lũy lâu năm, giúp lớp men tro chín ngọt đồng đều.",
      tag: "Trưởng thợ lò",
      initial: "M",
    },
    {
      name: "Chị Nguyễn Thị Hương",
      role: "Xoay tay vuốt mộc độc bản (18 năm kinh nghiệm)",
      desc: "Với đôi bàn tay bền bỉ và sự nhạy bén nghệ thuật, chị Hương đã định hình hàng vạn chiếc cốc. Mỗi sản phẩm đều có sự cân đối hoàn mỹ nhưng vẫn giữ lại vết hằn tay mộc mạc.",
      tag: "Nghệ nhân tạo hình",
      initial: "H",
    },
    {
      name: "Chị Lâm Mỹ Duyên",
      role: "Họa nét cọ hoa văn mộc (12 năm kinh nghiệm)",
      desc: "Chăm chút từng nét vẽ thanh tao trên chất liệu gốm mộc chưa nung. Đôi tay khéo léo của chị Duyên thổi hồn vào đất sét những nét hoa cỏ tự nhiên.",
      tag: "Nghệ nhân họa tiết",
      initial: "D",
    },
    {
      name: "Anh Trần Chí Tâm",
      role: "Phủ men tro tự nhiên (15 năm kinh nghiệm)",
      desc: "Chuyên gia chế tạo và phối men tro từ vỏ trấu và gỗ cây tự nhiên. Kỹ thuật tráng dội khéo léo của anh Tâm đảm bảo lớp men chín đều, lên màu mộc mạc đặc trưng.",
      tag: "Thợ tráng men",
      initial: "T",
    }
  ];

  return (
    <main className="w-full bg-canvas text-primary">
      {/* Hero section */}
      <section className="relative py-20 md:py-28 bg-[#FAF8F5] border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">
            Our Human
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-6">
            Những đôi tay làm nên Cốc Nối
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed max-w-2xl mx-auto">
            Mỗi đôi cốc đi qua nhiều đôi tay. Đây là những con người dệt nên Cốc Nối, từ đất sét thô sơ đến bàn tay nâng niu của bạn.
          </p>
        </div>
      </section>

      {/* Team grid */}
      <section className="py-20 md:py-24 max-w-5xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {members.map((art, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-[#FAF8F5] border border-border/60 p-6 md:p-8 rounded-4 hover:border-accent transition-all duration-300 hover:shadow-md group"
            >
              {/* Clay avatar frame */}
              <div className="sm:col-span-4 relative aspect-square bg-[#EFE9DF] rounded-3 border border-border flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:12px_12px] opacity-15"></div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-canvas text-sm font-playfair font-bold group-hover:scale-105 transition-transform duration-300" style={{ backgroundColor: "var(--color-deep-indigo)" }}>
                  {art.initial}
                </div>
                <span className="absolute bottom-2 left-2 right-2 text-center bg-accent text-canvas font-bvp text-[8px] font-bold py-0.5 rounded-1 uppercase tracking-wider" style={{ backgroundColor: "var(--color-terracotta)" }}>
                  {art.tag}
                </span>
              </div>

              <div className="sm:col-span-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-playfair text-xl font-bold text-primary">{art.name}</h3>
                  <span className="font-bvp text-[11px] text-accent font-semibold block mb-3 mt-1 uppercase tracking-wider">{art.role}</span>
                  <p className="font-bvp text-xs leading-relaxed text-secondary text-justify">{art.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-secondary font-bvp font-bold mt-4 pt-3 border-t border-border/60">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                  <span>Nghệ nhân Bát Tràng truyền thống</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA section */}
        <div className="mt-20 text-center max-w-xl mx-auto border-t border-border/40 pt-16">
          <Sparkles className="w-8 h-8 text-accent mx-auto mb-4" />
          <h3 className="font-playfair text-2xl font-bold text-primary mb-3">Đồng hành cùng Cốc Nối</h3>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mb-8">
            Chúng tôi luôn tìm kiếm những cửa hàng kí gửi, đối tác phân phối và các doanh nghiệp muốn chia sẻ câu chuyện gốm thủ công ý nghĩa đến khách hàng.
          </p>
          <Link 
            href="/partners"
            className="inline-flex items-center gap-2 bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-2 hover:bg-[#0E1220] transition-colors"
            style={{ backgroundColor: "var(--color-deep-indigo)" }}
          >
            <span>Tìm hiểu cơ hội hợp tác</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
