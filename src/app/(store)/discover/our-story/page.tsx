import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Câu chuyện Cốc Nối - Khởi nguồn từ Bát Tràng",
  description: "Hai bàn tay, một làng nghề. Khởi đầu của những kết nối từ xưởng gốm gia đình tại Bát Tràng.",
};

export default function OurStoryPage() {
  return (
    <main className="w-full bg-canvas text-primary">
      {/* Hero section */}
      <section className="py-20 md:py-28 bg-[#FAF8F5] border-b border-border/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">
            Our Story
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-6">
            Câu chuyện Cốc Nối
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed max-w-2xl mx-auto">
            Khởi nguồn từ xưởng gốm nhỏ tại Bát Tràng, nối sợi dây gắn kết giữa người với người.
          </p>
        </div>
      </section>

      {/* Story body */}
      <section className="py-20 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-8">
          <div className="font-bvp text-base text-primary leading-relaxed space-y-8 text-justify">
            <p>
              Chúng ta thấy chiếc cốc ở khắp mọi nơi: ở nhà, ở trường, hay ngay trên bàn làm việc. Nó gần gũi đến mức đôi khi ta quên mất rằng: mỗi chiếc cốc đều có thể là một khởi đầu cho những tâm sự và sẻ chia.
            </p>
            
            <p>
              Cái tên Cốc Nối ra đời từ một chữ "Nối" mang nhiều lớp nghĩa. Đó là sự kết nối giữa những người thân thương đang cần một khoảnh khắc thật để hiểu nhau. Đó là sự giao thoa của những miền đất, nơi mỗi loại men gốm đều kể một câu chuyện riêng. Đó còn là kỳ vọng nối truyền thống trăm năm của gốm thủ công Bát Tràng vào nhịp thở đầy năng lượng của năm 2026, cân bằng giữa mỹ thuật và công năng sử dụng.
            </p>
            
            <p>
              Trong một thế giới mà chỉ một cái chạm là có thể gửi tin, gọi video, thì những kết nối "thật" lại trở nên xa xỉ. Mỗi chiếc Cốc Nối gửi đến bạn một lời nhắn: những gì đi từ trái tim, sẽ chạm được đến trái tim.
            </p>
          </div>

          <blockquote className="border-l-2 border-accent pl-6 my-16 bg-[#FAF8F5] py-6 pr-4 rounded-r-4">
            <p className="font-playfair text-2xl md:text-3xl italic text-primary leading-relaxed">
              Kết tình thân, Nối tinh thần.
            </p>
            <cite className="font-quicksand text-xs uppercase tracking-widest text-accent block mt-3 not-italic">
              Crafted bonds. Connected souls.
            </cite>
          </blockquote>

          <div className="text-center mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-left">
              <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-1">Tiếp tục tìm hiểu</span>
              <h3 className="font-playfair text-lg font-bold text-primary">Bốn trụ cột định hình thương hiệu</h3>
            </div>
            <Link 
              href="/discover/our-values" 
              className="inline-flex items-center gap-2 bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-2 hover:bg-[#0E1220] transition-colors"
            >
              <span>Khám phá 4 Brand Pillar</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
