# Hướng dẫn triển khai - Vercel Hobby và Tên miền riêng (Cốc Nối Phase 7)

Tài liệu này cung cấp hướng dẫn chi tiết từng bước để triển khai mã nguồn dự án Cốc Nối lên nền tảng đám mây Vercel gói Hobby (miễn phí), kết nối cơ sở dữ liệu Neon DB và cấu hình tên miền tùy chỉnh.

## Điều kiện chuẩn bị

* Tài khoản GitHub chứa mã nguồn dự án `cocnoi-web` đã được cập nhật bản mới nhất.
* Tài khoản Neon DB miễn phí và chuỗi kết nối `DATABASE_URL`.
* Tài khoản Cloudinary miễn phí (sẽ dùng để quản lý hình ảnh tải lên từ xa).
* Tên miền đã mua (ví dụ: đăng ký qua các nhà cung cấp như Namecheap, GoDaddy, Mắt Bão, Pavietnam...).

---

## Bước 1: Thiết lập tài khoản Cloudinary (15 phút)

Vì hệ thống tệp tin trên môi trường máy chủ Vercel là chỉ đọc (read-only), chúng ta cần một dịch vụ lưu trữ bên thứ ba để lưu các ảnh tải lên từ trang Admin. Cloudinary cung cấp gói miễn phí 25GB băng thông rộng rãi cho mục đích này.

1. Đăng ký tài khoản miễn phí tại [Cloudinary](https://cloudinary.com).
2. Sau khi đăng nhập, truy cập bảng điều khiển Dashboard.
3. Tìm phần **Product Environment Settings** và sao chép các thông tin sau:
   * **Cloud Name**
   * **API Key**
   * **API Secret**
4. Các thông tin này sẽ được cấu hình làm biến môi trường trong Bước 3.

---

## Bước 2: Triển khai dự án lên Vercel (10 phút)

1. Đăng nhập vào bảng điều khiển [Vercel](https://vercel.com) bằng tài khoản GitHub của bạn.
2. Nhấn nút **Add New** -> chọn **Project**.
3. Import kho lưu trữ (repository) `cocnoi-web` từ tài khoản GitHub của bạn.
4. Cấu hình cài đặt dự án (Project Settings):
   * **Framework Preset**: Chọn **Next.js**.
   * **Root Directory**: `./` (để nguyên mặc định).
   * **Build and Output Settings**: Giữ nguyên mặc định.
5. Cấu hình các biến môi trường (**Environment Variables**). Sao chép và dán đầy đủ các cặp khóa - giá trị sau:
   * `DATABASE_URL`: Đường dẫn kết nối Neon DB.
   * `NEXTAUTH_SECRET`: Một chuỗi ngẫu nhiên dài dùng để mã hóa session (ví dụ sinh ra từ lệnh `openssl rand -base64 32`).
   * `NEXTAUTH_URL`: Địa chỉ URL chính thức của trang web sau khi chạy (ví dụ: `https://cocnoi.com` hoặc URL tạm thời của Vercel).
   * `NEXT_PUBLIC_ENABLE_CART`: Thiết lập là `false` để tắt giỏ hàng/thanh toán tự động (Lead Gen Mode cho giai đoạn đầu chạy thử nghiệm).
   * `CLOUDINARY_CLOUD_NAME`: Điền Cloud Name đã lấy ở Bước 1.
   * `CLOUDINARY_API_KEY`: Điền API Key đã lấy ở Bước 1.
   * `CLOUDINARY_API_SECRET`: Điền API Secret đã lấy ở Bước 1.
6. Nhấn nút **Deploy** và chờ khoảng 2 đến 3 phút để Vercel biên dịch và triển khai trang web.

---

## Bước 3: Đăng ký và cấu hình Tên miền riêng (20 phút)

Nếu bạn chưa có tên miền riêng, bạn có thể mua một tên miền `.com` trên Namecheap hoặc `.vn` trên Mắt Bão. Khi tên miền đã được kích hoạt, bạn tiến hành cấu hình DNS.

1. Truy cập trang quản trị dự án trên Vercel.
2. Vào mục **Settings** -> chọn tab **Domains**.
3. Nhập tên miền của bạn (ví dụ: `cocnoi.com`) và nhấn **Add**.
4. Vercel sẽ yêu cầu bạn thêm cả phiên bản `www.cocnoi.com`. Hãy xác nhận thêm cả hai.
5. Hệ thống sẽ hiển thị các bản ghi DNS cần cấu hình. Bạn hãy ghi lại các giá trị này:
   * Đối với tên miền gốc (`@` hoặc tên miền không có `www`): Bản ghi **A** trỏ tới IP `76.76.21.21`.
   * Đối với tên miền phụ (`www`): Bản ghi **CNAME** trỏ tới `cname.vercel-dns.com`.
6. Đăng nhập vào trang quản trị DNS của nhà đăng ký tên miền:
   * Thêm một bản ghi loại **A** với host là `@` và trỏ đến IP `76.76.21.21`.
   * Thêm một bản ghi loại **CNAME** với host là `www` và trỏ đến `cname.vercel-dns.com`.
7. Đợi từ 5 đến 30 phút để các bản ghi cập nhật toàn cầu. Vercel sẽ tự động cấp chứng chỉ bảo mật SSL/HTTPS cho tên miền của bạn khi quá trình kết nối thành công.

---

## Bước 4: Kiểm tra và vận hành thử nghiệm trên Production

Sau khi tên miền được kết nối thành công và trang web hiển thị trực tuyến:

1. **Kiểm tra Lead Gen Mode**:
   * Truy cập trang chủ và trang cửa hàng -> Đảm bảo biểu tượng giỏ hàng ở Header không hiển thị.
   * Truy cập trang chi tiết sản phẩm -> Xác nhận nút mua hàng hiển thị là "Đặt đôi này".
   * Click vào nút để mở biểu mẫu tư vấn, nhập thông tin liên hệ và gửi thử -> Đảm bảo yêu cầu được gửi thành công và hiển thị popup thông tin tài khoản chuyển khoản cùng mã QR ngân hàng.
   * Thử truy cập trực tiếp đường dẫn `/checkout` -> Xác nhận hệ thống hiển thị thông báo hướng dẫn đặt hàng tư vấn lịch sự, không hiển thị form nhập thông tin giao nhận lẻ.
2. **Kiểm tra biểu mẫu**:
   * Thử gửi dữ liệu qua các biểu mẫu liên hệ tại trang `/contact`, đăng ký đại lý, yêu cầu quà tặng doanh nghiệp B2B và đăng ký nhận tin ở chân trang.
   * Đăng nhập vào trang Admin tại `/admin` để kiểm tra xem các thông tin đăng ký trên đã hiển thị đầy đủ trong phần quản trị Inquiries (Yêu cầu tư vấn) chưa.

---

## Các vấn đề thường gặp và cách xử lý (Troubleshooting)

* **Build bị lỗi**: Kiểm tra lại Build Log trên Vercel xem có lỗi TypeScript hay thiếu biến môi trường nào không. Hãy đảm bảo chạy lệnh `npx tsc --noEmit` ở local để sửa sạch lỗi trước khi push code lên GitHub.
* **Lỗi Neon DB cold start**: Neon free tier sẽ tự động tạm dừng hoạt động nếu không có truy vấn nào sau 5 đến 10 phút. Lần truy cập đầu tiên sau thời gian này có thể mất thêm từ 3 đến 5 giây để đánh thức DB. Cơ chế tự động thử lại (retry) trong mã nguồn đã được thiết lập để tự động gửi lại truy vấn, giảm thiểu tối đa lỗi hiển thị cho người dùng.
* **Hình ảnh tải lên từ Admin không lưu lại**: Hãy kiểm tra xem các biến môi trường Cloudinary đã được nhập chính xác chưa. Do Vercel là môi trường không trạng thái (stateless), việc ghi tệp trực tiếp vào thư mục `/public/uploads` trên production sẽ bị mất sau khi ứng dụng khởi động lại hoặc redeploy.
