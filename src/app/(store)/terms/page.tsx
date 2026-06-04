import Link from "next/link";
import { Shield } from "lucide-react";

export const metadata = {
  title: "Điều khoản sử dụng - Cốc Nối Bát Tràng",
  description: "Điều khoản sử dụng dịch vụ và chính sách giao kết giao dịch tại cửa hàng gốm sứ Cốc Nối.",
};

export default function TermsOfServicePage() {
  return (
    <div className="bg-canvas py-16 md:py-24 text-primary">
      <div className="max-w-[800px] mx-auto px-4">
        <div className="border-b border-border/60 pb-8 mb-12 text-center">
          <Shield className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="font-playfair font-bold text-3xl md:text-5xl text-primary mb-3">Điều khoản sử dụng</h1>
          <p className="font-bvp text-xs text-secondary">Cập nhật lần cuối: ngày 30 tháng 5 năm 2026</p>
        </div>

        <div className="font-bvp text-sm text-secondary leading-relaxed flex flex-col gap-8">
          <section>
            <h2 className="font-playfair text-xl font-bold text-primary mb-3">1. Quy định chung</h2>
            <p>
              Chào mừng bạn đến với Cốc Nối (cocnoi.vn). Bằng việc truy cập trang web của chúng tôi và thực hiện các giao dịch đặt mua sản phẩm, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản, điều kiện dưới đây. Xin vui lòng đọc kỹ trước khi sử dụng dịch vụ.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-primary mb-3">2. Quyền sở hữu trí tuệ</h2>
            <p>
              Toàn bộ nội dung, hình ảnh thiết kế sản phẩm cốc gốm, logo thương hiệu, câu chuyện câu chữ vinh danh và mã nguồn trang web này đều thuộc quyền sở hữu trí tuệ độc quyền của Cốc Nối. Nghiêm cấm mọi hành vi sao chép thương mại, giả mạo sản phẩm khi chưa được sự đồng ý bằng văn bản của đại diện pháp luật Cốc Nối.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-primary mb-3">3. Giá cả và Thanh toán</h2>
            <p>
              Tất cả giá niêm yết trên website được tính bằng Việt Nam Đồng (VND). Chúng tôi có quyền điều chỉnh giá sản phẩm tùy theo chi phí đất cao lanh và men tro nung Bát Tràng nhưng cam kết bảo lưu giá tại thời điểm khách hàng đã tạo đơn hàng thành công. Quý khách có thể lựa chọn thanh toán bằng hình thức chuyển khoản qua MB Bank (ngân hàng Quân Đội) theo cú pháp hướng dẫn chi tiết tại trang thanh toán.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-primary mb-3">4. Trách nhiệm B2B & Wholesale</h2>
            <p>
              Đối với các hợp đồng sản xuất cốc sỉ hoặc in logo B2B đặt thiết kế riêng cho quán café, các điều khoản về đặt cọc, tiến độ giao hàng và tỷ lệ chiết khấu sẽ được thỏa thuận chi tiết riêng trong hợp đồng kinh tế ký kết bằng văn bản có giá trị pháp lý song phương độc lập.
            </p>
          </section>

          <section>
            <h2 className="font-playfair text-xl font-bold text-primary mb-3">5. Thay đổi điều khoản</h2>
            <p>
              Cốc Nối có quyền cập nhật, thay đổi hoặc bổ sung điều khoản này bất kỳ lúc nào để phù hợp với sự phát triển của hệ thống B2B và chính sách bảo vệ người dùng của cơ quan pháp luật. Mọi thay đổi sẽ có hiệu lực ngay sau khi được đăng tải công khai trên trang này.
            </p>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-border/60 text-center">
          <Link href="/shop" className="font-bvp font-medium text-xs text-accent hover:underline">
            Quay lại Cửa Hàng mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
