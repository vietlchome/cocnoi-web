import Link from "next/link";
import { Sparkles, MapPin, Heart, ShieldCheck, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Giới thiệu về Cốc Nối - Gốm sứ Bát Tràng truyền thống",
  description: "Tìm hiểu về Cốc Nối, xưởng gốm thủ công gìn giữ ngọn lửa di sản làng nghề Bát Tràng từ năm 1994, kết hợp tinh hoa truyền thống với nét tối giản đương đại.",
};

export default function AboutPage() {
  return (
    <div className="bg-canvas text-primary overflow-hidden min-h-screen">
      {/* HERO SECTION */}
      <section className="relative py-20 md:py-28 bg-[#FAF8F5] border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-[800px] mx-auto px-4 text-center relative z-10 animate-fade-in">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
            Về Cốc Nối
          </span>
          <h1 className="font-playfair font-bold text-4xl md:text-5xl text-primary leading-tight mb-4">
            Câu Chuyện Của Đất & Hơi Ấm Con Người
          </h1>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed max-w-xl mx-auto text-justify">
            Hành trình hơn 30 năm nỗ lực gìn giữ nước men tro tự nhiên độc bản và kỹ thuật chế tác xoay tay truyền thống tại làng cổ Bát Tràng, Hà Nội.
          </p>
        </div>
      </section>

      {/* CORE INTRO */}
      <section className="py-16 md:py-24 max-w-[800px] mx-auto px-4 font-bvp text-sm text-secondary leading-relaxed flex flex-col gap-10">
        <div>
          <h2 className="font-playfair text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-accent" />
            Khởi nguồn từ làng cổ Bát Tràng
          </h2>
          <p className="mb-4 text-justify">
            Được thành lập từ năm 1994 dưới mô hình xưởng gốm hộ gia đình nhỏ bé giữa lòng làng cổ Bát Tràng ngàn năm tuổi, Cốc Nối ra đời với khát vọng lưu truyền tinh hoa nghề gốm mộc. Trải qua bao cuộc chuyển mình của nền kinh tế thị trường, chúng tôi từ chối chạy theo dây chuyền dập khuôn công nghiệp hàng loạt để trung thành tuyệt đối với lối xoay tay thủ công tỉ mỉ.
          </p>
          <p className="text-justify">
            Đối với Cốc Nối, mỗi chiếc cốc là một thực thể độc lập có linh hồn. Sự không hoàn hảo nhẹ nhàng của các vết hằn vân ngón tay nghệ nhân trên bề mặt đất sét mới là minh chứng chân thực nhất cho nghệ thuật thủ công quý báu.
          </p>
        </div>

        <div>
          <h2 className="font-playfair text-2xl font-bold text-primary mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Nước men tro tự nhiên độc bản
          </h2>
          <p className="mb-4 text-justify">
            Điểm độc đáo tạo nên danh tiếng của Cốc Nối chính là bí quyết bào chế nước men tro trấu gạo nếp cổ truyền. Men tro trấu mang lại độ sâu thẳm thâm trầm, sắc trắng ngà trầm ấm và mộc mạc như ngọc. Quá trình nung ở nhiệt độ 1250 độ C khép kín giúp các tạp chất có hại hoàn toàn bay hơi, mang lại độ bền vĩnh cửu và an toàn sức khỏe tối đa cho người dùng.
          </p>
        </div>

        {/* 3 CARD CORE STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-4 text-center">
          <div className="bg-[#FAF8F5] border border-border/50 p-6 rounded-3">
            <span className="font-playfair text-3xl font-bold text-accent block mb-1">1994</span>
            <span className="font-bvp text-[11px] font-bold text-primary uppercase">Năm thành lập</span>
          </div>
          <div className="bg-[#FAF8F5] border border-border/50 p-6 rounded-3">
            <span className="font-playfair text-3xl font-bold text-accent block mb-1">100%</span>
            <span className="font-bvp text-[11px] font-bold text-primary uppercase">Vuốt xoay tay</span>
          </div>
          <div className="bg-[#FAF8F5] border border-border/50 p-6 rounded-3">
            <span className="font-playfair text-3xl font-bold text-accent block mb-1">1250°C</span>
            <span className="font-bvp text-[11px] font-bold text-primary uppercase">Độ nung đanh đá</span>
          </div>
        </div>

        <div className="bg-[#FAF8F5] border border-border/50 p-8 rounded-4 flex flex-col items-center text-center mt-4">
          <Heart className="w-8 h-8 text-accent mb-4" />
          <h3 className="font-playfair text-xl font-bold text-primary mb-3">Sứ mệnh làm cầu nối cảm xúc</h3>
          <p className="font-bvp text-xs text-secondary leading-relaxed max-w-lg mb-6 text-justify">
            Chúng tôi đặt tên xưởng là &ldquo;Cốc Nối&rdquo; vì mong muốn mỗi tác phẩm gốm mộc sẽ trở thành sợi dây kết nối vô hình gắn kết tình cảm gia đình, tình bạn bè tâm giao và sự trân trọng chân thành giữa các đối tác.
          </p>
          <div className="flex gap-4">
            <Link 
              href="/shop" 
              className="bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3 rounded-2 hover:bg-[#0E1220] transition-colors inline-flex items-center gap-1.5"
            >
              <span>Mua sắm gốm mộc</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link 
              href="/discover" 
              className="border border-border text-primary hover:text-accent hover:border-accent font-bvp font-medium text-xs px-6 py-3 rounded-2 transition-colors"
            >
              Hành trình chế tác
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
