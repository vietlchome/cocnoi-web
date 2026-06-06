import { getSiteConfig } from "@/lib/site-config";
import StockistApplicationForm from "@/components/store/StockistApplicationForm";
import { Award, ShieldCheck, Handshake } from "lucide-react";

export const metadata = {
  title: "Trở thành Đại lý Cốc Nối - Become a Stockist",
  description: "Đăng ký bán Cốc Nối tại không gian của bạn. Wholesale với chiết khấu theo bậc số lượng.",
};

export default async function BecomeStockistPage() {
  const config = await getSiteConfig();
  const { stockistMinOrder, stockistDiscount } = config.partners_meta;

  return (
    <main className="w-full bg-canvas text-primary">
      {/* Hero section */}
      <section className="py-20 md:py-24 bg-[#FAF8F5] border-b border-border/40 relative">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-5"></div>
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center relative z-10">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">Become a Stockist</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4">
            Bán Cốc Nối tại không gian của bạn
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-2xl mx-auto leading-relaxed">
            Concept store, café, gallery, retail specialty: đối tác trở thành điểm chạm vật lý của Cốc Nối với những tâm hồn yêu gốm thủ công.
          </p>
        </div>
      </section>

      {/* Why cooperate */}
      <section className="py-16 md:py-20 max-w-5xl mx-auto px-4 md:px-8">
        <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary mb-10 text-center">
          Vì sao chọn Cốc Nối
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-[#FAF8F5] border border-border/60 rounded-4 p-6 hover:border-accent transition-colors">
            <Award className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-playfair text-lg font-bold text-primary mb-2">Câu chuyện thủ công</h3>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
              Mỗi sản phẩm đi kèm câu chuyện làng nghề Bát Tràng 700 năm, mang lại giá trị gia tăng độc bản cho kệ hàng của bạn.
            </p>
          </div>
          <div className="bg-[#FAF8F5] border border-border/60 rounded-4 p-6 hover:border-accent transition-colors">
            <ShieldCheck className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-playfair text-lg font-bold text-primary mb-2">Chiết khấu theo bậc</h3>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
              {stockistDiscount}. Tối ưu hóa lợi nhuận kinh doanh dài hạn cho đối tác.
            </p>
          </div>
          <div className="bg-[#FAF8F5] border border-border/60 rounded-4 p-6 hover:border-accent transition-colors">
            <Handshake className="w-8 h-8 text-accent mb-4" />
            <h3 className="font-playfair text-lg font-bold text-primary mb-2">Hỗ trợ trưng bày</h3>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
              Hỗ trợ đầy đủ hình ảnh chất lượng cao, ấn phẩm kể chuyện tại bàn hoặc kệ trưng bày tinh tế theo tinh thần mộc mạc của gốm.
            </p>
          </div>
        </div>
      </section>

      {/* Cooperation process */}
      <section className="py-16 md:py-20 bg-[#FAF8F5] border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-primary mb-10 text-center">
            Quy trình hợp tác
          </h2>
          <ol className="grid md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Đăng ký", desc: "Điền biểu mẫu đăng ký đại lý với thông tin chi tiết về không gian của bạn." },
              { num: "02", title: "Tư vấn", desc: "Đội ngũ phát triển đối tác sẽ liên hệ trong 24 giờ để chia sẻ wholesale catalog." },
              { num: "03", title: "Đơn dùng thử", desc: `${stockistMinOrder}. Giúp cửa hàng trải nghiệm thực tế phản hồi của khách hàng.` },
              { num: "04", title: "Đồng hành", desc: "Ký hợp đồng phân phối chính thức, độc quyền khu vực theo cam kết sản lượng." }
            ].map((s) => (
              <li key={s.num} className="bg-canvas border border-border/60 rounded-4 p-6 flex flex-col justify-between">
                <div>
                  <span className="font-playfair text-3xl font-bold text-accent block mb-2" style={{ color: "var(--color-terracotta)" }}>{s.num}</span>
                  <h3 className="font-playfair text-base font-bold text-primary mb-2">{s.title}</h3>
                  <p className="font-bvp text-[11px] text-secondary leading-relaxed text-justify">{s.desc}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form section */}
      <section className="py-20 md:py-24 max-w-2xl mx-auto px-4 md:px-8">
        <div className="text-center mb-10">
          <h2 className="font-playfair text-3xl font-bold text-primary mb-3">
            Đăng ký đại lý phân phối
          </h2>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
            Vui lòng điền thông tin bên dưới. Cốc Nối sẽ phản hồi đề xuất của bạn trong vòng 24 giờ làm việc.
          </p>
        </div>
        <StockistApplicationForm />
      </section>
    </main>
  );
}
