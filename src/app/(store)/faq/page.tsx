import Link from "next/link";
import { HelpCircle, ChevronDown } from "lucide-react";
import { getSiteConfig } from "@/lib/site-config";

export default async function FAQPage() {
  const config = await getSiteConfig();
  
  const itemsRetail = config.faq?.itemsRetail || [];
  const itemsB2b = config.faq?.itemsB2b || [];

  const fallbackFaqs = [
    {
      q: "Gốm Cốc Nối nung ở nhiệt độ bao nhiêu? Có dùng được máy rửa bát không?",
      a: "Tất cả sản phẩm của Cốc Nối đều được nung chín ở nhiệt độ chuẩn xác 1250 độ C trong lò ga hiện đại. Ở mức nhiệt cực cao này, xương đất cao lanh và các oxit kim loại trong men thủy tinh hoàn toàn nóng chảy kết hợp chặt chẽ, tạo cấu trúc xương gốm đanh thép như đá. Sản phẩm chịu nhiệt tốt và hoàn toàn an toàn khi sử dụng với máy rửa bát, lò vi sóng, tủ đông.",
    },
    {
      q: "Có in logo lên cốc làm quà tặng doanh nghiệp không? Số lượng tối thiểu bao nhiêu?",
      a: "Chúng tôi nhận thiết kế và gia công in chìm/khắc chìm logo lên cốc gốm B2B chỉn chu cho sự kiện, quà tặng doanh nghiệp. Số lượng tối thiểu (MOQ) cho đơn hàng in logo là từ 20 chiếc trở lên. Đi kèm với đơn hàng quà tặng là tùy chỉnh hộp quà Kraft thắt nơ nghệ thuật, thiệp cảm ơn viết tay mộc mạc.",
    },
    {
      q: "Chính sách đền bù và giao nhận nứt vỡ trong vận chuyển như thế nào?",
      a: "Gốm sứ là mặt hàng dễ vỡ, do đó Cốc Nối đóng gói cực kỳ cẩn thận với 3 lớp bọc xốp bóng khí và chèn xốp định hình trong thùng carton 5 lớp dầy dặn. Đối với đơn sỉ số lượng lớn, chúng tôi đóng gói trong kiện gỗ chắc chắn. Chúng tôi cam kết đền bù 100% (gửi sản phẩm thay thế mới hoàn toàn miễn phí vận chuyển) nếu cốc bị nứt rạn, sứt mẻ do lỗi trong quá trình vận chuyển. Quý khách chỉ cần chụp ảnh/quay video khi khui mở hộp gửi về hotline.",
    },
    {
      q: "Tôi muốn đăng ký làm đại lý phân phối, chính sách chiết khấu ra sao?",
      a: "Chúng tôi chào đón các concept store, tiệm lưu niệm nghệ thuật và đại lý bán lẻ trên cả nước gia nhập hệ thống. Chính sách chiết khấu đại lý lũy tiến dao động hấp dẫn dựa trên giá trị đơn hàng đặt định kỳ và mức độ cam kết doanh thu hàng quý. Chúng tôi hỗ trợ thiết kế kệ gỗ trưng bày mộc mạc và cung cấp hình ảnh chụp studio độc quyền.",
    },
    {
      q: "Làm sao để phân biệt nước men tro Bát Tràng tự nhiên và men công nghiệp?",
      a: "Men tro tự nhiên của Cốc Nối được chế tác thủ công từ tro củi gỗ trấu gạo nếp và đất sét giàu sắt Bát Tràng. Lớp men tro tự nhiên sau nung sẽ có độ bóng dịu như ngọc, chiều sâu thâm trầm, sắc men ngả ngà đặc trưng và có các đốm sắt nhỏ li ti ngẫu nhiên nghệ thuật. Ngược lại, men hóa học công nghiệp thường bóng gắt chói, màu sắc phẳng lì nhân tạo không có chiều sâu linh hồn.",
    },
    {
      q: "Cốc Nối có sản xuất dung tích cốc chuẩn Specialty Coffee không?",
      a: "Có. Chúng tôi đồng hành cùng các barista và chuyên gia specialty coffee để nghiên cứu và tạo hình 4 dòng cốc chuẩn dung tích phục vụ lý tưởng: Espresso (60ml), Flat White (150ml), Latte/Cappuccino miệng rộng nghệ thuật (220ml & 280ml) với độ dày thành cốc tối ưu nhằm duy trì nhiệt độ ổn định cho bọt sữa sữa thơm ngậy.",
    },
    {
      q: "Tôi muốn thanh toán đơn hàng thì chuyển khoản ngân hàng nào?",
      a: "Sau khi tạo đơn hàng lẻ tại checkout, quý khách có thể thực hiện chuyển khoản trực tiếp qua ngân hàng MB Bank (Ngân hàng Quân Đội), thông tin chuyển khoản: Số tài khoản: 0979899999, Chủ tài khoản: NGUYEN VAN A, chi nhánh Hà Nội. Nội dung chuyển khoản vui lòng ghi rõ mã đơn hàng để kế toán duyệt tự động nhanh chóng.",
    },
    {
      q: "Mã đơn hàng Cuid lấy ở đâu để gửi đánh giá sản phẩm?",
      a: "Mỗi đơn hàng lẻ sau khi thanh toán và giao hàng thành công sẽ nhận được một mã đơn hàng (ví dụ: clx123abc456...) trên biên lai điện tử gửi về điện thoại/email hoặc ghi trên hóa đơn đính kèm gói hàng. Bạn nhập mã này vào phần đánh giá ở trang chi tiết sản phẩm để xác minh đơn hàng đã giao thành công và tiến hành viết nhận xét đánh giá.",
    },
  ];

  let faqs = [
    ...itemsRetail.map((item: any) => ({ q: item.question, a: item.answer })),
    ...itemsB2b.map((item: any) => ({ q: item.question, a: item.answer })),
  ];

  if (faqs.length === 0) {
    faqs = fallbackFaqs;
  }

  return (
    <div className="bg-canvas py-16 md:py-24 text-primary min-h-screen">
      <div className="max-w-[800px] mx-auto px-4">
        
        {/* HEADER */}
        <div className="border-b border-border/60 pb-8 mb-12 text-center">
          <HelpCircle className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="font-playfair font-bold text-3xl md:text-5xl text-primary mb-3">
            {config.faq?.title || "Câu hỏi thường gặp"}
          </h1>
          <p className="font-bvp text-xs text-secondary">
            {config.faq?.tagline || "Giải đáp nhanh chóng các thắc mắc phổ biến về chất lượng gốm Bát Tràng và dịch vụ hợp tác"}
          </p>
        </div>

        {/* FAQ ACCORDION LIST */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => {
            return (
              <details 
                key={idx} 
                className="group bg-[#FAF8F5] border border-border/60 rounded-3 overflow-hidden transition-all duration-300"
              >
                <summary className="w-full list-none p-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer select-none [&::-webkit-details-marker]:hidden">
                  <h3 className="font-playfair text-sm md:text-base font-bold text-primary leading-tight inline">
                    {faq.q}
                  </h3>
                  <span className="text-accent shrink-0">
                    <ChevronDown className="w-4 h-4 text-secondary group-open:rotate-180 transition-transform duration-300" />
                  </span>
                </summary>

                <div className="border-t border-border/40 p-5 bg-canvas">
                  <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed">
                    {faq.a}
                  </p>
                </div>
              </details>
            );
          })}
        </div>

        {/* CTA BOTTOM */}
        <div className="mt-16 text-center border-t border-border/60 pt-12 max-w-md mx-auto">
          <p className="font-bvp text-xs text-secondary leading-relaxed mb-4">
            Bạn vẫn chưa tìm được câu trả lời cần thiết? Vui lòng trực tiếp gọi hotline hoặc gửi tin nhắn tư vấn.
          </p>
          <div className="flex justify-center gap-4">
            <Link 
              href="/contact" 
              className="bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3 rounded-2 hover:bg-[#0E1220] transition-colors"
            >
              Liên hệ chúng tôi
            </Link>
            <Link 
              href="/partners" 
              className="border border-border text-primary hover:text-accent hover:border-accent font-bvp font-medium text-xs px-6 py-3 rounded-2 transition-colors"
            >
              Đăng ký hợp tác B2B
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
