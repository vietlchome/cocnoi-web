import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRIVACY_CONTENT = `<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">1. Thu thập thông tin cá nhân</h2>
  <p>Khi quý khách thực hiện mua lẻ sản phẩm hoặc đăng ký hợp tác B2B tư vấn tại website của chúng tôi, Cốc Nối sẽ thu thập các thông tin cơ bản bao gồm: Họ tên, số điện thoại, địa chỉ giao nhận hàng, địa chỉ email, và tên công ty/cửa hàng nếu có. Thông tin này phục vụ duy nhất cho việc xử lý đơn hàng và liên hệ tư vấn.</p>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">2. Mục đích sử dụng thông tin</h2>
  <p>Chúng tôi cam kết sử dụng thông tin thu thập được của quý khách nhằm:</p>
  <ul class="flex flex-col gap-2 list-disc pl-5 mt-2">
    <li>Xử lý giao dịch giao nhận đơn hàng trên toàn quốc an toàn trôi chảy.</li>
    <li>Liên hệ giải quyết các yêu cầu đổi trả bảo hành gốm hoặc đền bù nứt rạn khi vận chuyển.</li>
    <li>Gửi email giới thiệu bộ sưu tập màu men tro mới, sự kiện vinh danh Người Nối nếu quý khách đồng ý nhận bản tin.</li>
    <li>Quản lý công nợ và lịch sử chăm sóc đối tác CRM một cách tối mật.</li>
  </ul>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">3. Cam kết bảo mật tuyệt đối</h2>
  <p>Cốc Nối tôn trọng quyền riêng tư của quý khách hàng và cam kết bảo mật tuyệt đối. Chúng tôi không bao giờ bán, cho thuê, chia sẻ hay tiết lộ thông tin của quý khách cho bên thứ ba vì bất kỳ mục đích thương mại nào. Dữ liệu đơn hàng được lưu trữ an toàn trên cơ sở dữ liệu Neon Postgres đám mây mã hóa cao cấp.</p>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">4. Bản quyền Cookie</h2>
  <p>Chúng tôi sử dụng cookie phiên duyệt web để duy trì bộ nhớ giỏ hàng tạm thời cho khách hàng. Quý khách hoàn toàn có thể chủ động tắt tính năng cookie trên cài đặt trình duyệt cá nhân bất cứ lúc nào.</p>
</section>`;

const TERMS_CONTENT = `<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">1. Quy định chung</h2>
  <p>Chào mừng bạn đến với Cốc Nối (cocnoi.vn). Bằng việc truy cập trang web của chúng tôi và thực hiện các giao dịch đặt mua sản phẩm, bạn đồng ý tuân thủ và bị ràng buộc bởi các điều khoản, điều kiện dưới đây. Xin vui lòng đọc kỹ trước khi sử dụng dịch vụ.</p>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">2. Quyền sở hữu trí tuệ</h2>
  <p>Toàn bộ nội dung, hình ảnh thiết kế sản phẩm cốc gốm, logo thương hiệu, câu chuyện câu chữ vinh danh và mã nguồn trang web này đều thuộc quyền sở hữu trí tuệ độc quyền của Cốc Nối. Nghiêm cấm mọi hành vi sao chép thương mại, giả mạo sản phẩm khi chưa được sự đồng ý bằng văn bản của đại diện pháp luật Cốc Nối.</p>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">3. Giá cả và Thanh toán</h2>
  <p>Tất cả giá niêm yết trên website được tính bằng Việt Nam Đồng (VND). Chúng tôi có quyền điều chỉnh giá sản phẩm tùy theo chi phí đất cao lanh và men tro nung Bát Tràng nhưng cam kết bảo lưu giá tại thời điểm khách hàng đã tạo đơn hàng thành công. Quý khách có thể lựa chọn thanh toán bằng hình thức chuyển khoản qua MB Bank (ngân hàng Quân Đội) theo cú pháp hướng dẫn chi tiết tại trang thanh toán.</p>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">4. Trách nhiệm B2B và Wholesale</h2>
  <p>Đối với các hợp đồng sản xuất cốc sỉ hoặc in logo B2B đặt thiết kế riêng cho quán café, các điều khoản về đặt cọc, tiến độ giao hàng và tỷ lệ chiết khấu sẽ được thỏa thuận chi tiết riêng trong hợp đồng kinh tế ký kết bằng văn bản có giá trị pháp lý song phương độc lập.</p>
</section>
<section>
  <h2 class="font-playfair text-xl font-bold text-primary mb-3">5. Thay đổi điều khoản</h2>
  <p>Cốc Nối có quyền cập nhật, thay đổi hoặc bổ sung điều khoản này bất kỳ lúc nào để phù hợp với sự phát triển của hệ thống B2B và chính sách bảo vệ người dùng của cơ quan pháp luật. Mọi thay đổi sẽ có hiệu lực ngay sau khi được đăng tải công khai trên trang này.</p>
</section>`;

async function main() {
  console.log('Seeding legal pages...');

  const privacy = await prisma.page.upsert({
    where: { slug: 'privacy' },
    update: { title: 'Chính sách bảo mật', content: PRIVACY_CONTENT, visible: true },
    create: {
      title: 'Chính sách bảo mật',
      slug: 'privacy',
      content: PRIVACY_CONTENT,
      visible: true,
      sortOrder: 0,
    },
  });
  console.log(`Upserted Page: ${privacy.slug} (id: ${privacy.id})`);

  const terms = await prisma.page.upsert({
    where: { slug: 'terms' },
    update: { title: 'Điều khoản dịch vụ', content: TERMS_CONTENT, visible: true },
    create: {
      title: 'Điều khoản dịch vụ',
      slug: 'terms',
      content: TERMS_CONTENT,
      visible: true,
      sortOrder: 1,
    },
  });
  console.log(`Upserted Page: ${terms.slug} (id: ${terms.id})`);

  console.log('Done.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
