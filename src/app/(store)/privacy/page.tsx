import Link from "next/link";
import { Lock } from "lucide-react";
import { PageService } from "@/lib/services/page.service";
import { formatDate } from "@/lib/utils/format";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Chính sách bảo mật - Cốc Nối Bát Tràng",
  description: "Chính sách bảo mật thông tin cá nhân và bảo mật giao dịch tại hệ thống Cốc Nối.",
};

const FALLBACK_UPDATED = "ngày 30 tháng 5 năm 2026";

function FallbackContent() {
  return (
    <>
      <section>
        <h2 className="font-playfair text-xl font-bold text-primary mb-3">1. Thu thập thông tin cá nhân</h2>
        <p>
          Khi quý khách thực hiện mua lẻ sản phẩm hoặc đăng ký hợp tác B2B tư vấn tại website của chúng tôi, Cốc Nối sẽ thu thập các thông tin cơ bản bao gồm: Họ tên, số điện thoại, địa chỉ giao nhận hàng, địa chỉ email, và tên công ty/cửa hàng nếu có. Thông tin này phục vụ duy nhất cho việc xử lý đơn hàng và liên hệ tư vấn.
        </p>
      </section>

      <section>
        <h2 className="font-playfair text-xl font-bold text-primary mb-3">2. Mục đích sử dụng thông tin</h2>
        <p>Chúng tôi cam kết sử dụng thông tin thu thập được của quý khách nhằm:</p>
        <ul className="flex flex-col gap-2 list-disc pl-5 mt-2">
          <li>Xử lý giao dịch giao nhận đơn hàng trên toàn quốc an toàn trôi chảy.</li>
          <li>Liên hệ giải quyết các yêu cầu đổi trả bảo hành gốm hoặc đền bù nứt rạn khi vận chuyển.</li>
          <li>Gửi email giới thiệu bộ sưu tập màu men tro mới, sự kiện vinh danh Người Nối nếu quý khách đồng ý nhận bản tin.</li>
          <li>Quản lý công nợ và lịch sử chăm sóc đối tác CRM một cách tối mật.</li>
        </ul>
      </section>

      <section>
        <h2 className="font-playfair text-xl font-bold text-primary mb-3">3. Cam kết bảo mật tuyệt đối</h2>
        <p>
          Cốc Nối tôn trọng quyền riêng tư của quý khách hàng và cam kết bảo mật tuyệt đối. Chúng tôi không bao giờ bán, cho thuê, chia sẻ hay tiết lộ thông tin của quý khách cho bên thứ ba vì bất kỳ mục đích thương mại nào. Dữ liệu đơn hàng được lưu trữ an toàn trên cơ sở dữ liệu Neon Postgres đám mây mã hóa cao cấp.
        </p>
      </section>

      <section>
        <h2 className="font-playfair text-xl font-bold text-primary mb-3">4. Bản quyền Cookie</h2>
        <p>
          Chúng tôi sử dụng cookie phiên duyệt web để duy trì bộ nhớ giỏ hàng tạm thời cho khách hàng. Quý khách hoàn toàn có thể chủ động tắt tính năng cookie trên cài đặt trình duyệt cá nhân bất cứ lúc nào.
        </p>
      </section>
    </>
  );
}

export default async function PrivacyPolicyPage() {
  const page = await PageService.getPageBySlugPublic("privacy").catch(() => null);

  const updatedLabel = page
    ? `Cập nhật lần cuối: ${formatDate(page.updatedAt)}`
    : `Cập nhật lần cuối: ${FALLBACK_UPDATED}`;

  return (
    <div className="bg-canvas py-16 md:py-24 text-primary">
      <div className="max-w-[800px] mx-auto px-4">
        <div className="border-b border-border/60 pb-8 mb-12 text-center">
          <Lock className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="font-playfair font-bold text-3xl md:text-5xl text-primary mb-3">
            {page?.title ?? "Chính sách bảo mật"}
          </h1>
          <p className="font-bvp text-xs text-secondary">{updatedLabel}</p>
        </div>

        <div className="font-bvp text-sm text-secondary leading-relaxed flex flex-col gap-8">
          {page?.content ? (
            <div dangerouslySetInnerHTML={{ __html: page.content }} />
          ) : (
            <FallbackContent />
          )}
        </div>

        <div className="mt-16 pt-8 border-t border-border/60 text-center">
          <Link href="/cua-hang" className="font-bvp font-medium text-xs text-accent hover:underline">
            Quay lại Cửa Hàng mua sắm
          </Link>
        </div>
      </div>
    </div>
  );
}
