import { Award, ShieldCheck, MessageSquare, Handshake, Users2, ArrowRight } from "lucide-react";
import PartnerContactForm from "@/components/store/PartnerContactForm";

export const metadata = {
  title: "Đối Tác & Hợp Tác B2B - Quà tặng Doanh nghiệp Cốc Nối",
  description: "Trở thành đối tác phân phối hoặc đặt hàng quà tặng doanh nghiệp chỉn chu từ Cốc Nối. Chúng tôi cung cấp chính sách chiết khấu tốt nhất, in khắc logo chìm, và cốc thiết kế riêng cho chuỗi quán cà phê.",
};

export default function PartnersPage() {
  const collaborationSteps = [
    {
      step: "01",
      title: "Liên hệ & Đề xuất",
      desc: "Quý đối tác điền form đăng ký tư vấn. Đội ngũ phát triển B2B của chúng tôi sẽ liên hệ trong 24 giờ để làm rõ yêu cầu về mẫu mã, số lượng và thời gian bàn giao.",
    },
    {
      step: "02",
      title: "Duyệt mẫu & Ký hợp đồng",
      desc: "Cốc Nối lên bản vẽ kỹ thuật 2D/3D in chìm logo và sản xuất 01 sản phẩm thực tế để đối tác cầm duyệt chất lượng trước khi ký hợp đồng và thanh toán tạm ứng.",
    },
    {
      step: "03",
      title: "Chế tác thủ công đợt lớn",
      desc: "Xưởng gốm tại Bát Tràng thực hiện xoay vuốt, in ấn và nung chín gốm mộc. Mỗi sản phẩm trải qua 3 khâu kiểm tra chất lượng trước khi đóng gói hộp kraft cao cấp.",
    },
    {
      step: "04",
      title: "Bàn giao & Thanh quyết toán",
      desc: "Hỗ trợ vận chuyển an toàn trên toàn quốc bằng kiện gỗ xốp khí. Đối tác nghiệm thu sản phẩm đầy đủ và thanh toán phần công nợ còn lại theo hợp đồng.",
    },
  ];

  return (
    <div className="bg-canvas text-primary overflow-hidden min-h-screen">
      {/* 1. HERO HEADER */}
      <section className="relative py-24 md:py-32 flex items-center justify-center border-b border-border/40 bg-[#FAF8F5]">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-[900px] mx-auto px-4 text-center relative z-10 animate-fade-in">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-4 block animate-slide-up">
            Hợp tác đồng hành
          </span>
          <h1 className="font-playfair font-bold text-4xl md:text-6xl text-primary leading-tight mb-6 animate-slide-up">
            Cùng Đồng Hành <br className="hidden md:inline" />
            <span className="text-accent italic">Kiến Tạo Tương Lai</span> Bền Vững
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed text-center max-w-2xl mx-auto mb-8 animate-slide-up">
            Chúng tôi tự hào là đối tác gia công quà tặng doanh nghiệp chỉn chu, sản xuất dòng sản phẩm cốc in logo độc quyền cho các chuỗi specialty coffee và liên minh bán lẻ nghệ thuật trên toàn quốc.
          </p>
          <div className="flex justify-center animate-slide-up">
            <a 
              href="#form" 
              className="bg-primary text-canvas font-bvp font-medium text-xs px-8 py-4 rounded-2 hover:bg-[#0E1220] transition-all hover:translate-y-[-2px] shadow-sm flex items-center gap-2"
            >
              <span>Đăng ký nhận báo giá B2B</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </a>
          </div>
        </div>
      </section>

      {/* QUICK STICKY SUB NAV */}
      <div className="sticky top-[73px] z-40 bg-canvas/80 backdrop-blur-md border-b border-border/40 py-3 hidden md:block">
        <div className="max-w-[1280px] mx-auto px-8 flex justify-center gap-12 font-bvp text-xs font-semibold text-secondary">
          <a href="#corporate" className="hover:text-accent transition-colors">Quà tặng doanh nghiệp</a>
          <a href="#wholesale" className="hover:text-accent transition-colors">Cốc specialty cho Quán</a>
          <a href="#stockists" className="hover:text-accent transition-colors">Chính sách Đại lý</a>
          <a href="#steps" className="hover:text-accent transition-colors">Quy trình 4 bước</a>
        </div>
      </div>

      {/* 2. SPECIFIC VERTICAL COLLABORATION SERVICES */}
      <section className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8 flex flex-col gap-24 md:gap-32">
        
        {/* SECTION 2.1: CORPORATE GIFT */}
        <div id="corporate" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 bg-[#FAF8F5] p-8 md:p-12 rounded-4 border border-border flex flex-col justify-center relative min-h-[350px]">
            <Award className="w-12 h-12 text-accent mb-6" />
            <h3 className="font-playfair text-3xl font-bold text-primary mb-4 leading-tight">Món Quà Tri Ân Chỉn Chu Nhất</h3>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-justify">
              Cốc gốm in khắc chìm logo nhãn hàng tinh xảo, đi kèm hộp quà tặng xi mạ kraft ép kim nổi sang trọng, đi kèm thiệp viết tay mộc mạc lưu lại dấu ấn thương hiệu bền lâu trong lòng đối tác VIP.
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent">B2B Corporate Gift</span>
            <h2 className="font-playfair font-bold text-2xl md:text-4xl text-primary leading-tight">
              Giải pháp Quà tặng doanh nghiệp tinh tế & Độc bản
            </h2>
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify">
              Quà tặng sự kiện hay quà tri ân khách hàng thân thiết thể hiện sự chu đáo và tầm nhìn của thương hiệu. Chúng tôi đã sản xuất hơn 12.000 cốc quà tặng cho các tổ chức công nghệ hàng đầu và ngân hàng lớn tại Việt Nam.
            </p>
            <ul className="flex flex-col gap-2 font-bvp text-xs text-secondary mt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                In logo chất lượng cực cao, chống phai bong tróc trong lò vi sóng
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Thiết kế bao bì Kraft bảo vệ môi trường, mang đậm nét tối giản đương đại
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Hỗ trợ viết tay thiệp cảm ơn định lượng giấy nghệ thuật dày dặn
              </li>
            </ul>
          </div>
        </div>

        {/* SECTION 2.2: WHOLESALE CAFES */}
        <div id="wholesale" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start gap-4 lg:order-2">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent">Specialty Cup Solution</span>
            <h2 className="font-playfair font-bold text-2xl md:text-4xl text-primary leading-tight">
              Đồng hành cùng nghệ thuật Specialty Coffee
            </h2>
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify">
              Hương vị cà phê specialty hảo hạng xứng đáng được thưởng thức trong một tác phẩm gốm mộc giữ nhiệt tuyệt hảo. Chúng tôi thiết kế các dung tích cốc chuyên biệt chuẩn xác từ Espresso (60ml), Flat White (150ml), Latte/Cappuccino (220ml-280ml) với độ dày và miệng cốc tối ưu hóa cho nghệ thuật latte art tinh tế.
            </p>
            <ul className="flex flex-col gap-2 font-bvp text-xs text-secondary mt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Phối màu men đồng điệu với không gian kiến trúc và bộ nhận diện của quán
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Chân cốc mài nhẵn mịn bảo vệ mặt bàn gỗ cao cấp khỏi trầy xước
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Độ nung 1250 độ C siêu đanh chắc, chịu lực va chạm tốt khi rửa liên tục
              </li>
            </ul>
          </div>
          <div className="lg:col-span-5 bg-[#FAF8F5] p-8 md:p-12 rounded-4 border border-border flex flex-col justify-center relative min-h-[350px] lg:order-1">
            <ShieldCheck className="w-12 h-12 text-accent mb-6" />
            <h3 className="font-playfair text-3xl font-bold text-primary mb-4 leading-tight">Chế Tác Cốc Chuyên Biệt Cho Quán</h3>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-justify">
              Cung cấp giải pháp trọn gói về cốc gốm đồng điệu với câu chuyện thiết kế của các quán cà phê specialty. Hỗ trợ tùy chỉnh tay cầm công thái học hoàn mỹ cho barista.
            </p>
          </div>
        </div>

        {/* SECTION 2.3: DISTRIBUTORS & STOCKISTS */}
        <div id="stockists" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-5 bg-[#FAF8F5] p-8 md:p-12 rounded-4 border border-border flex flex-col justify-center relative min-h-[350px]">
            <MessageSquare className="w-12 h-12 text-accent mb-6" />
            <h3 className="font-playfair text-3xl font-bold text-primary mb-4 leading-tight">Hỗ Trợ Kệ Trưng Bày Độc Đáo</h3>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-justify">
              Chúng tôi đồng hành thiết kế các kệ trưng bày bằng gỗ sồi ấm áp, cung cấp đầy đủ tài liệu truyền thông số, ảnh chụp studio mộc nghệ thuật cho các cửa hàng đối tác liên kết.
            </p>
          </div>
          <div className="lg:col-span-7 flex flex-col items-start gap-4">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent">Retailers & Stockists</span>
            <h2 className="font-playfair font-bold text-2xl md:text-4xl text-primary leading-tight">
              Đại lý & Concept Store trên mọi tỉnh thành
            </h2>
            <p className="font-bvp text-sm text-secondary leading-relaxed text-justify">
              Chính sách đại lý bán lẻ của Cốc Nối được xây dựng với tinh thần hợp tác đôi bên cùng phát triển thịnh vượng. Cung cấp tỷ lệ chiết khấu ưu việt và hạn mức thanh toán linh hoạt cho các chủ cửa hàng gốm nghệ thuật, đồ lưu niệm cao cấp.
            </p>
            <ul className="flex flex-col gap-2 font-bvp text-xs text-secondary mt-2">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Chính sách chiết khấu lũy tiến hấp dẫn theo doanh thu bán hàng hàng quý
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Độc quyền khu vực địa lý phân phối cho đối tác cam kết sản lượng tốt
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent"></span>
                Hỗ trợ đổi trả hàng lỗi nứt do quá trình sản xuất hay vận chuyển 100%
              </li>
            </ul>
          </div>
        </div>

      </section>

      {/* 3. PARTNERSHIP COLLABORATION PROCESS TIMELINE */}
      <section id="steps" className="py-20 md:py-28 bg-[#FAF8F5] border-y border-border/40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-16 md:mb-20">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">Chỉn chu chuyên nghiệp</span>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-primary">Quy trình 4 bước hợp tác trôi chảy</h2>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-center mt-3">
              Cung cấp quy trình vận hành minh bạch và chuyên nghiệp giúp đối tác hoàn toàn yên tâm khi thực hiện đơn hàng số lượng lớn.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {collaborationSteps.map((step, idx) => (
              <div 
                key={idx} 
                className="bg-canvas border border-border/60 hover:border-accent p-8 rounded-4 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-sm group"
              >
                <div>
                  <span className="font-playfair text-accent/20 group-hover:text-accent font-bold text-5xl md:text-6xl block mb-6 transition-colors duration-300">
                    {step.step}
                  </span>
                  <h3 className="font-playfair text-lg font-bold text-primary mb-3">{step.title}</h3>
                  <p className="font-bvp text-xs leading-relaxed text-justify text-secondary">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. CRM PARTNER INQUIRY FORM */}
      <section id="form" className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-4 flex flex-col items-start gap-4">
            <Handshake className="w-10 h-10 text-accent mb-2" />
            <h2 className="font-playfair font-bold text-3xl text-primary leading-tight">
              Bắt đầu mối quan hệ đồng hành ngay hôm nay
            </h2>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-justify">
              Vui lòng cung cấp các thông tin cơ bản của quý doanh nghiệp. Đại diện B2B chuyên trách của chúng tôi sẽ gọi điện trao đổi trực tiếp và gửi báo giá ưu đãi tùy chỉnh đính kèm trong thời gian ngắn nhất.
            </p>
            <div className="mt-4 flex items-center gap-3 bg-[#FAF8F5] border border-border/60 p-4 rounded-3 w-full">
              <Users2 className="w-8 h-8 text-accent shrink-0" />
              <div className="font-bvp text-[11px] text-secondary leading-normal">
                <span>Hơn 85 quán café và 40 doanh nghiệp đã trở thành đối tác tin cậy của Cốc Nối.</span>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-8">
            <PartnerContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
