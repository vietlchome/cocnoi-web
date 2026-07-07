import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Quy trình thủ công Cốc Nối - 7 bước từ đất đến cốc",
  description: "Khám phá quy trình chế tác công phu qua 7 bước từ đất sét thô sơ đến đôi cốc gốm tinh hoa của Cốc Nối.",
};

const DEFAULT_STEPS = [
  { num: "01", title: "Chuẩn bị nguyên liệu & khuôn",  desc: "Đất sét cao lanh tinh khiết được chọn lọc kỹ lưỡng, trộn phối màu theo yêu cầu và tạo khuôn riêng biệt (khuôn in dáng tròn hoặc khuôn rót tạo hình đặc biệt)." },
  { num: "02", title: "Tạo hình sản phẩm",               desc: "Đất được đặt vào máy ép khuôn hoặc rót đất lỏng vào khuôn đổ. Quá trình này đòi hỏi sự đồng đều để đảm bảo độ dày mỏng của xương gốm đạt chuẩn." },
  { num: "03", title: "Vệ sinh sản phẩm thô",            desc: "Sau khi dỡ khuôn, người thợ gốm tỉ mỉ gọt giũa phần ba-via thừa và dùng mút ẩm làm nhẵn mịn từng góc cạnh để chuẩn bị cho các khâu nhiệt độ." },
  { num: "04", title: "Sấy khô & Sơ nung",              desc: "Sản phẩm được sấy khô tự nhiên rồi xếp vào lò nung sơ bộ ở nhiệt độ khoảng 700 độ C. Đây là khâu nền tảng giúp xương gốm cứng cáp, không bị nứt vỡ." },
  { num: "05", title: "Họa tiết & Phủ men",              desc: "Nghệ nhân dùng cọ mảnh vẽ tay từng nét họa tiết trơn phác, dán chìm nhãn thương hiệu, sau đó nhúng cốc vào lớp men tro Bát Tràng truyền thống đặc trưng." },
  { num: "06", title: "Nung chín lò bầu",                desc: "Cốc được đưa vào lò nung ở nhiệt độ từ 1150 đến 1200 độ C trong 15-18 tiếng liên tục. Nhiệt độ cao giúp xương đất hóa đá và men tro chảy chín ngọt." },
  { num: "07", title: "Kiểm tra & Đóng gói",             desc: "Từng chiếc cốc ra lò đều được gõ thử âm thanh, kiểm tra độ đanh thép của men và đóng gói chỉn chu trong hộp giấy tái chế thân thiện." },
];

export default async function OurCraftPage() {
  const config = await getSiteConfig();
  const s = config.discover_craft;

  const eyebrow            = s?.eyebrow            || "Our Craft";
  const title              = s?.title              || "Quy trình thủ công, từ đất đến cốc";
  const subtitle           = s?.subtitle           || "Mỗi mẻ cốc cần trung bình 7-10 ngày thực hiện nghiêm ngặt qua bàn tay điêu luyện của các nghệ nhân gia đình Bát Tràng.";
  const steps              = s?.steps?.length      ? s.steps : DEFAULT_STEPS;
  const closingHeading     = s?.closingHeading     || "Vì sao chúng tôi chọn làm thủ công?";
  const closingText        = s?.closingText        || "Giữa thế giới công nghiệp hóa đồng đều, chúng tôi chọn giữ lại những nét hằn tay mộc mạc và sự biến thiên màu sắc tự nhiên của từng mẻ nung lò. Những khiếm khuyết nhỏ chính là nét độc bản làm nên hồn của gốm thủ công Cốc Nối. Chúng tôi muốn mỗi chiếc cốc khi cầm trên tay đều mang một câu chuyện chân thật, kết nối cảm xúc trọn vẹn của bạn với những người xung quanh.";
  const primaryButtonText  = s?.primaryButtonText  || "Mua sắm ngay";
  const primaryButtonHref  = s?.primaryButtonHref  || "/cua-hang";
  const secondaryButtonText = s?.secondaryButtonText || "Xem 4 Brand Pillar";
  const secondaryButtonHref = s?.secondaryButtonHref || "/discover/our-values";
  const closingImage        = s?.closingImage        || "";
  const closingImageAlt     = s?.closingImageAlt     || s?.closingHeading || "";

  return (
    <main className="w-full bg-canvas text-primary">
      {/* Hero section */}
      <section className="relative py-20 md:py-28 bg-[#FAF8F5] border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">
            {eyebrow}
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-6">
            {title}
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>
      </section>

      {/* Timeline steps */}
      <section className="py-20 md:py-24 max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-center">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-[#FAF8F5] border border-border/60 hover:border-accent p-8 rounded-4 flex flex-col justify-between transition-all duration-300 hover:translate-y-[-4px] shadow-sm group"
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
      </section>

      {/* Why Handcrafted closing section */}
      <section className="py-20 md:py-28 bg-[#FAF8F5] border-t border-border/40 relative">
        <div className="max-w-3xl mx-auto px-4 md:px-8 text-center relative z-10">
          {closingImage && (
            <div className="overflow-hidden rounded-4 border border-border/60 aspect-[16/9] mb-10">
              <img
                src={closingImage}
                alt={closingImageAlt}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          )}
          <Award className="w-10 h-10 text-accent mx-auto mb-6" />
          <h2 className="font-playfair text-3xl md:text-4xl font-bold mb-6">
            {closingHeading}
          </h2>
          <p className="font-bvp text-sm md:text-base leading-relaxed text-secondary text-justify max-w-2xl mx-auto mb-10">
            {closingText}
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href={primaryButtonHref}
              className="bg-primary text-canvas font-bvp font-medium text-xs px-8 py-4 rounded-2 hover:bg-[#0E1220] transition-colors inline-flex items-center gap-2"
              style={{ backgroundColor: "var(--color-deep-indigo)" }}
            >
              <span>{primaryButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href={secondaryButtonHref}
              className="border border-border text-primary hover:text-accent hover:border-accent font-bvp font-medium text-xs px-8 py-4 rounded-2 transition-colors"
            >
              {secondaryButtonText}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
