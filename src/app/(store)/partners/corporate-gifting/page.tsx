import { getSiteConfig } from "@/lib/site-config";
import CorporateGiftingForm from "@/components/store/CorporateGiftingForm";
import { Gift, Paintbrush, Briefcase, Calendar } from "lucide-react";

export const metadata = {
  title: "Quà tặng doanh nghiệp Cốc Nối - Corporate Gifting",
  description: "Đặt cốc làm quà tặng đối tác, nhân viên, sự kiện chỉn chu. In logo chìm, đóng hộp quà và thiệp viết tay theo yêu cầu.",
};

export default async function CorporateGiftingPage() {
  const config = await getSiteConfig();
  const { corporateMoq, corporateLeadTime } = config.partners_meta;

  const features = [
    {
      icon: <Gift className="w-6 h-6 text-accent" />,
      title: "Chất liệu gốm mộc tự nhiên",
      desc: "Chế tác hoàn toàn thủ công tại Bát Tràng từ đất sét lọc kỹ, nung ở nhiệt độ cao đảm bảo độ bền đanh thép và an toàn khi sử dụng."
    },
    {
      icon: <Paintbrush className="w-6 h-6 text-accent" />,
      title: "Khả năng tùy chỉnh đa dạng",
      desc: `In ấn hoặc khắc chìm logo thương hiệu tinh xảo lên thân/đáy cốc. MOQ tối thiểu chỉ từ ${corporateMoq}.`
    },
    {
      icon: <Briefcase className="w-6 h-6 text-accent" />,
      title: "Đóng gói chỉn chu, trân trọng",
      desc: "Hộp quà bồi kraft cứng cáp ép kim logo hoặc thiệp cảm ơn định lượng cao cấp viết tay theo lời chúc của bạn."
    },
    {
      icon: <Calendar className="w-6 h-6 text-accent" />,
      title: "Tiến độ sản xuất cam kết",
      desc: `Thời gian hoàn thành trung bình từ ${corporateLeadTime}, bàn giao đúng hẹn với tiêu chuẩn đóng thùng chống vỡ tuyệt đối.`
    }
  ];

  const useCases = [
    {
      title: "Quà tặng Tết truyền thống",
      desc: "Bộ đôi cốc gốm men hỏa biến truyền thống kết hợp cùng hộp quà chúc mừng năm mới sang trọng gửi trao đối tác VIP."
    },
    {
      title: "Welcome Kit nhân viên mới",
      desc: "Món quà chào đón ấm áp ghi dấu ấn văn hóa doanh nghiệp ngay ngày đầu đi làm cho nhân sự mới."
    },
    {
      title: "Kỷ niệm ngày thành lập",
      desc: "Vinh danh những chặng đường phát triển của doanh nghiệp với những đôi cốc khắc logo kỷ niệm độc bản."
    },
    {
      title: "Quà tặng sự kiện, hội thảo",
      desc: "Món quà lưu niệm ý nghĩa, bền lâu dành cho các khách mời tham dự các chương trình lớn của doanh nghiệp."
    }
  ];

  return (
    <main className="w-full bg-canvas text-primary">
      {/* Hero section */}
      <section className="py-20 md:py-24 bg-[#FAF8F5] border-b border-border/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">Corporate Gifting</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-6 leading-tight">
            Quà tặng doanh nghiệp ý nghĩa
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-2xl mx-auto leading-relaxed">
            Chúng tôi cung cấp giải pháp quà tặng độc bản, tinh tế và trọn vẹn tình nghĩa, giúp tôn vinh các kết nối giá trị của doanh nghiệp bạn.
          </p>
        </div>
      </section>

      {/* Why select us */}
      <section className="py-16 md:py-20 max-w-5xl mx-auto px-4 md:px-8">
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary mb-10 text-center">
          Điểm nhấn giải pháp quà tặng Cốc Nối
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {features.map((feat, idx) => (
            <div 
              key={idx} 
              className="bg-[#FAF8F5] border border-border/60 p-6 md:p-8 rounded-4 hover:border-accent transition-colors flex gap-5 items-start"
            >
              <div className="bg-canvas border border-border/80 w-12 h-12 rounded-2 flex items-center justify-center shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="font-playfair text-lg font-bold text-primary mb-2">{feat.title}</h3>
                <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed text-justify">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Use cases */}
      <section className="py-16 md:py-20 bg-[#FAF8F5] border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary mb-10 text-center">
            Dịp gửi trao trọn vẹn tình thân
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {useCases.map((use, idx) => (
              <div key={idx} className="bg-canvas border border-border/60 rounded-4 p-6 hover:shadow-sm transition-all duration-300">
                <h3 className="font-playfair text-base font-bold text-primary mb-3">{use.title}</h3>
                <p className="font-bvp text-xs text-secondary leading-relaxed text-justify">{use.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form section */}
      <section className="py-20 md:py-24 max-w-2xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl font-bold text-primary mb-3">
            Đăng ký nhận tư vấn và báo giá
          </h2>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
            Điền chi tiết các yêu cầu của doanh nghiệp bạn dưới đây. Đội ngũ tư vấn quà tặng sẽ liên hệ thiết kế market và báo giá chi tiết trong vòng 24 giờ.
          </p>
        </div>
        <CorporateGiftingForm />
      </section>
    </main>
  );
}
