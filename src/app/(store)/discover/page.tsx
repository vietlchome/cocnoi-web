import Link from "next/link";
import { Sparkles, Compass, Map, Shield, Heart, Award, ArrowRight, UserCheck, CheckCircle } from "lucide-react";

export const metadata = {
  title: "Hành Trình Cốc Nối - Câu chuyện gốm sứ Bát Tràng thủ công",
  description: "Khám phá hành trình gìn giữ văn hóa làng nghề của Cốc Nối. Câu chuyện xưởng gốm cổ, quy trình sản xuất 7 bước tinh hoa tỉ mỉ và những nghệ nhân thầm lặng.",
};

export default function DiscoverPage() {
  const steps = [
    {
      num: "01",
      title: "Chuẩn bị nguyên liệu & khuôn",
      desc: "Đất sét cao lanh tinh khiết được chọn lọc kỹ lưỡng, trộn phối màu theo yêu cầu và tạo khuôn riêng biệt (khuôn in dáng tròn hoặc khuôn rót tạo hình đặc biệt).",
    },
    {
      num: "02",
      title: "Tạo hình sản phẩm",
      desc: "Đất được đặt vào máy ép khuôn hoặc rót đất lỏng vào khuôn đổ. Quá trình này đòi hỏi sự đồng đều để đảm bảo độ dày mỏng của xương gốm đạt chuẩn.",
    },
    {
      num: "03",
      title: "Vệ sinh sản phẩm thô",
      desc: "Sau khi dỡ khuôn, người thợ gốm tỉ mỉ gọt giũa phần ba-via thừa và dùng mút ẩm làm nhẵn mịn từng góc cạnh để chuẩn bị cho các khâu nhiệt độ.",
    },
    {
      num: "04",
      title: "Sấy khô & Sơ nung",
      desc: "Sản phẩm được sấy khô tự nhiên rồi xếp vào lò nung sơ bộ ở nhiệt độ khoảng 700 độ C. Đây là khâu nền tảng giúp xương gốm cứng cáp, không bị nứt vỡ.",
    },
    {
      num: "05",
      title: "Họa tiết & Phủ men",
      desc: "Nghệ nhân dùng cọ mảnh vẽ tay từng nét họa tiết trơn phác, dán chìm nhãn thương hiệu, sau đó nhúng cốc vào lớp men tro Bát Tràng truyền thống đặc trưng.",
    },
    {
      num: "06",
      title: "Nung chín lò bầu",
      desc: "Cốc được đưa vào lò nung ở nhiệt độ từ 1150 đến 1200 độ C trong 15-18 tiếng liên tục. Nhiệt độ cao giúp xương đất hóa đá và men tro chảy chín ngọt.",
    },
    {
      num: "07",
      title: "Kiểm tra & Đóng gói",
      desc: "Từng chiếc cốc ra lò đều được gõ thử âm thanh, kiểm tra độ đanh thép của men và đóng gói chỉn chu trong hộp giấy tái chế thân thiện.",
    },
  ];

  const values = [
    {
      icon: <Compass className="w-6 h-6 text-accent" />,
      title: "KẾT NỐI (Cốt lõi)",
      desc: "Cốc Nối tồn tại để khơi mở những kết nối thực chất giữa người với người. Đó là hiện vật lưu giữ những khoảnh khắc trà chiều ấm áp, sẻ chia chân thành.",
    },
    {
      icon: <Shield className="w-6 h-6 text-accent" />,
      title: "CHÂN THÀNH (Chiều sâu)",
      desc: "Chúng tôi chọn kể những câu chuyện thật về gốm mộc, không phóng đại hay tô vẽ. Tôn trọng từng khuyết điểm tự nhiên và trân quý bàn tay thợ gốm.",
    },
    {
      icon: <Heart className="w-6 h-6 text-accent" />,
      title: "CHỈN CHU (Phẩm chất)",
      desc: "Lập trường của chúng tôi là làm kỹ hơn làm nhanh, chú trọng chất lượng hơn sản lượng. Tỉ mỉ trong từng khâu chọn đất, nung chín hay đóng gói.",
    },
    {
      icon: <Sparkles className="w-6 h-6 text-accent" />,
      title: "CỞI MỞ (Phạm vi)",
      desc: "Mở lòng đón nhận những nét khác biệt. Mỗi đôi cốc Cốc Nối được hoàn thiện khác nhau đôi chút về họa tiết để tôn vinh sự tương đồng cùng khác biệt.",
    },
  ];

  return (
    <div className="bg-canvas text-primary overflow-hidden min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative py-24 md:py-32 flex items-center justify-center border-b border-border/40 bg-[#FAF8F5]">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-[900px] mx-auto px-4 text-center relative z-10 animate-fade-in">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-4 block animate-slide-up">
            Hành trình Cốc Nối
          </span>
          <h1 className="font-playfair font-bold text-4xl md:text-6xl text-primary leading-tight mb-6 animate-slide-up">
            Hòa quyện nét mộc mạc <br className="hidden md:inline" />
            <span className="text-accent italic">vào đời sống hiện đại</span>
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed text-center max-w-2xl mx-auto mb-8 animate-slide-up">
            Cốc Nối không tạo ra những món đồ trưng bày xa hoa. Chúng tôi kế thừa kỹ thuật làm gốm thủ công để chế tác nên những vật dụng hàng ngày có tính thẩm mỹ cao — những chiếc cốc nhỏ bé nhưng đủ sức làm chất xúc tác gắn kết tình cảm chân thành trong cuộc sống hối hả.
          </p>
          <div className="flex flex-wrap gap-4 justify-center animate-slide-up">
            <a 
              href="#story" 
              className="bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-2 hover:bg-[#0E1220] transition-all hover:translate-y-[-2px] shadow-sm"
            >
              Hành trình chế tác
            </a>
            <Link 
              href="/shop" 
              className="border border-border bg-canvas text-primary hover:text-accent hover:border-accent font-bvp font-medium text-xs px-6 py-3.5 rounded-2 transition-all hover:translate-y-[-2px]"
            >
              Ghé thăm cửa hàng
            </Link>
          </div>
        </div>
      </section>

      {/* QUICK SUB NAV FOR USER EXPERIENCE */}
      <div className="sticky top-[73px] z-40 bg-canvas/80 backdrop-blur-md border-b border-border/40 py-3 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-8 flex justify-center gap-12 font-bvp text-xs font-semibold text-secondary">
          <a href="#story" className="hover:text-accent transition-colors">Câu chuyện thương hiệu</a>
          <a href="#process" className="hover:text-accent transition-colors">Quy trình thủ công</a>
          <a href="#values" className="hover:text-accent transition-colors">Giá trị cốt lõi</a>
        </div>
      </div>

      {/* 2. BRAND STORY SECTION */}
      <section id="story" className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-center">
          {/* Ceramic clay artwork decoration */}
          <div className="lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-[#EFE9DF] rounded-4 border border-border flex flex-col justify-between p-8 relative overflow-hidden group hover:border-accent transition-all duration-500">
              <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:20px_20px] opacity-15"></div>
              <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/5 filter blur-2xl"></div>
              
              <div className="relative z-10">
                <Compass className="w-12 h-12 text-accent mb-6" />
                <span className="font-playfair text-accent italic font-medium text-lg block mb-2">Sự kế thừa</span>
                <h4 className="font-playfair text-3xl font-bold text-primary leading-tight">Mang giá trị truyền thống vào nếp sống mới</h4>
              </div>

              <div className="border-t border-border/60 pt-6 relative z-10">
                <p className="font-playfair text-xs text-secondary italic">
                  &ldquo;Gốm mộc không tự nói chuyện. Sự hiện diện của nó trong những cuộc trò chuyện hằng ngày mới làm gốm thực sự sống.&rdquo;
                </p>
              </div>
            </div>
            {/* Artistic badge */}
            <div className="absolute -bottom-6 -right-4 bg-primary text-canvas font-playfair font-bold text-xs py-3 px-5 rounded-2 shadow-lg">
              Est. 1994 • Gốm ứng dụng
            </div>
          </div>

          <div className="lg:col-span-7 flex flex-col items-start gap-6">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent">Từ Xưởng Gốm Nhỏ</span>
            <h2 className="font-playfair font-bold text-3xl md:text-5xl text-primary leading-tight">
              Kể tiếp câu chuyện bằng đất mộc và tình người
            </h2>
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify">
              Khởi đầu từ một xưởng làm gốm ven sông vào những năm 1990, gia đình chúng tôi sớm nhận ra tình yêu với những nắm đất sét phù sa thô ráp. Chúng tôi không theo đuổi việc tạo ra những tác phẩm nghệ thuật trưng bày xa tầm với, mà khao khát ứng dụng nét đẹp văn hóa ấy vào đời sống.
            </p>
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify">
              Mỗi chiếc cốc Cốc Nối ra đời đều trải qua bàn tay xoay vuốt tỉ mỉ của những người thợ lành nghề. Việc giữ lại những đường vân tay mộc, lớp men tro tự nhiên không phải để phô trương quá khứ, mà để trân trọng sự khiếm khuyết chân thật. Ở giữa thế giới công nghiệp hóa đồng đều, chúng tôi chọn làm ra những chiếc cốc khác biệt đôi chút, nhưng lại đồng điệu về tinh thần.
            </p>
            <blockquote className="border-l-2 border-accent pl-4 py-1 italic font-playfair text-secondary text-sm md:text-base leading-relaxed text-justify">
              &ldquo;Một món đồ đẹp nhất không nằm trên bục kính, mà nằm trên bàn trà mỗi sớm, trong đôi tay của hai người bạn đang mải miết sẻ chia những buồn vui thường nhật.&rdquo;
            </blockquote>
          </div>
        </div>
      </section>

      {/* 3. TIMELINE: HANDCRAFT PROCESS */}
      <section id="process" className="py-20 md:py-28 bg-[#FAF8F5] border-y border-border/40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">Chế tác công phu</span>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-primary">Quy trình thủ công 7 bước tinh hoa</h2>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mt-3 text-center">
              Mỗi mẻ cốc cần trung bình 7-10 ngày thực hiện nghiêm ngặt qua bàn tay điêu luyện của các nghệ nhân gia đình. Dưới đây là 7 bước chế tác chi tiết.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(25%-18px)] bg-canvas border border-border/60 hover:border-accent p-8 rounded-4 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-sm group"
              >
                <div>
                  <span className="font-playfair text-accent/20 group-hover:text-accent font-bold text-5xl md:text-6xl block mb-6 transition-colors duration-300">
                    {step.num}
                  </span>
                  <h3 className="font-playfair text-lg font-bold text-primary mb-3">{step.title}</h3>
                  <p className="font-bvp text-xs leading-relaxed text-secondary text-justify">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. CORE VALUES SECTION */}
      <section id="values" className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-4 lg:sticky lg:top-32">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent">Kim chỉ nam</span>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-primary leading-tight mt-3">
              Giá trị chúng tôi luôn nâng niu
            </h2>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-justify mt-4">
              Tại Cốc Nối, mỗi quyết định kinh doanh đều hướng tới việc bảo tồn văn hóa làng nghề, chăm chút khách hàng và bảo vệ an toàn cho sức khỏe người dùng tốt nhất.
            </p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-8">
            {values.map((val, idx) => (
              <div key={idx} className="bg-[#FAF8F5] border border-border/40 p-8 rounded-3 hover:border-accent transition-colors duration-300">
                <div className="mb-4 bg-canvas w-12 h-12 rounded-2 flex items-center justify-center border border-border/60">
                  {val.icon}
                </div>
                <h3 className="font-playfair text-lg font-bold text-primary mb-2">{val.title}</h3>
                <p className="font-bvp text-xs leading-relaxed text-secondary text-justify">{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section className="py-20 md:py-28 max-w-[800px] mx-auto px-4 text-center">
        <Award className="w-10 h-10 text-accent mx-auto mb-6" />
        <h2 className="font-playfair font-bold text-3xl md:text-5xl text-primary leading-tight mb-4">
          Sở hữu di sản trên bàn làm việc của bạn
        </h2>
        <p className="font-bvp text-sm text-secondary leading-relaxed text-center max-w-xl mx-auto mb-8">
          Chọn mua một chiếc Cốc Nối để cảm nhận sự mộc mạc của đất sét và gửi gắm sợi dây kết nối đầy ý nghĩa đến người thân thương ngay hôm nay.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link 
            href="/shop" 
            className="bg-primary text-canvas font-bvp font-medium text-xs px-8 py-4 rounded-2 hover:bg-[#0E1220] transition-colors inline-flex items-center gap-2"
          >
            <span>Mua sắm ngay</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link 
            href="/partners" 
            className="border border-border text-primary hover:text-accent hover:border-accent font-bvp font-medium text-xs px-8 py-4 rounded-2 transition-colors"
          >
            Liên hệ hợp tác B2B
          </Link>
        </div>
      </section>
    </div>
  );
}
