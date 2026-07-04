# Đặc Tả Kỹ Thuật Hợp Nhất Website Cốc Nối (Next.js & Prisma)

> **Mục tiêu:** Tổng hợp toàn bộ yêu cầu phát triển của 5 mô-đun cốt lõi cho dự án website `cocnoi-web` nhằm tối ưu cấu trúc tài liệu hướng dẫn cho AI và nhà phát triển.
> **Tech Stack:** Next.js (App Router), Prisma ORM (SQLite / PostgreSQL), Tailwind CSS, Auth.js (NextAuth), Zustand.

---

## MÔ-ĐUN 1: Xác Thực, Phân Quyền Và Quản Lý Người Dùng

### 1. Mục tiêu
Thiết lập hệ thống xác thực người dùng sử dụng Auth.js (NextAuth.js) kết hợp với Prisma Adapter. Xây dựng nền tảng phân quyền (RBAC) giữa người dùng bình thường (USER) và quản trị viên (ADMIN).

### 2. Yêu cầu Cơ sở dữ liệu (Prisma Schema)
Bắt buộc tuân thủ cấu trúc mô hình chuẩn của Auth.js để tránh lỗi:
* **User:** Gồm các trường `id`, `name`, `email` (unique), `emailVerified`, `image`. Thêm trường `role` với kiểu `Enum Role { USER, ADMIN }` mặc định là `USER`.
* **Account:** Quản lý liên kết tài khoản mạng xã hội (`provider`, `providerAccountId`, v.v.).
* **Session:** Quản lý phiên đăng nhập (`sessionToken`, `userId`, `expires`).
* **VerificationToken:** Quản lý token xác thực qua email.

### 3. Yêu cầu Tính năng (Storefront)
* Thiết lập luồng Đăng nhập/Đăng ký.
* Cấu hình OAuth Provider (ví dụ: Google).
* Tạo trang Hồ sơ cá nhân (Profile) cơ bản để người dùng xem và cập nhật thông tin.

### 4. Yêu cầu Tính năng (Admin)
* Tạo Middleware bảo vệ các định tuyến `/admin/*`. Nếu `role !== 'ADMIN'`, trả về HTTP 403 hoặc chuyển hướng về trang chủ.
* Xây dựng trang Quản lý Người dùng: Hiển thị danh sách, tìm kiếm theo email, và tính năng cập nhật quyền (`role`) hoặc khóa tài khoản.

### 5. Yêu cầu Kỹ thuật
* Sử dụng Server Actions cho các thao tác thay đổi dữ liệu.
* Validate dữ liệu đầu vào bằng Zod.

---

## MÔ-ĐUN 2: Quản Lý Thông Tin Sản Phẩm (PIM)

### 1. Mục tiêu
Xây dựng kiến trúc dữ liệu và giao diện quản lý danh mục, sản phẩm cho website bán hàng.

### 2. Yêu cầu Cơ sở dữ liệu (Prisma Schema)
* **Category:** Mô hình danh mục gồm `id`, `name`, `slug`.
* **Product:** Mô hình sản phẩm gồm `id`, `name`, `slug`, `description`, `price`, `stockQuantity`, `images` (mảng string), `isActive` (boolean, mặc định true).
* Thiết lập quan hệ giữa `Product` và `Category` (Quan hệ nhiều-nhiều hoặc 1-nhiều).

### 3. Yêu cầu Tính năng (Storefront)
* Xây dựng API (hoặc Server Components) để lấy danh sách sản phẩm nổi bật hiển thị ở Trang chủ.
* Xây dựng trang Danh sách Sản phẩm (`/shop`) có hỗ trợ phân trang và lọc theo danh mục.
* Trang Chi tiết Sản phẩm: Tối ưu hiển thị hình ảnh với `next/image`. Nút "Thêm vào giỏ" bị vô hiệu hóa nếu `stockQuantity === 0`.

### 4. Yêu cầu Tính năng (Admin)
* Xây dựng giao diện CRUD (Tạo, Đọc, Cập nhật, Xóa) cho Danh mục và Sản phẩm.
* Tích hợp tính năng tải ảnh lên (mô phỏng hoặc kết nối Cloudinary/AWS S3).
* Implement tính năng Xóa mềm (Soft Delete): Khi xóa sản phẩm, chỉ cập nhật trường `isActive = false` thay vì xóa hẳn khỏi CSDL để bảo toàn lịch sử.

---

## MÔ-ĐUN 3: Giỏ Hàng Và Thanh Toán VietQR

### 1. Mục tiêu
Quản lý trạng thái giỏ hàng ở phía client và khởi tạo luồng thanh toán tích hợp mã quét VietQR.

### 2. Yêu cầu Kỹ thuật Giỏ hàng (Client State)
* Sử dụng Zustand để quản lý trạng thái giỏ hàng toàn cục (thêm, sửa số lượng, xóa sản phẩm khỏi giỏ).
* Đồng bộ hóa giỏ hàng với `localStorage` để giữ trạng thái khi tải lại trang.

### 3. Yêu cầu Tính năng Thanh toán (Checkout)
* Xây dựng trang Thanh toán cho phép người dùng điền thông tin giao hàng (Sử dụng React Hook Form + Zod).
* Tự động tính toán: `Tổng tiền = Giá sản phẩm * Số lượng + Phí vận chuyển`.
* Tích hợp bộ tạo mã VietQR động trực tiếp tại phía máy khách để bảo mật.
    * Sử dụng thư viện React sinh mã QR.
    * Cấu hình mức độ sửa lỗi (Error Correction Level) ở mức Medium (~15%) hoặc High (~30% nếu có chèn logo).
    * Dữ liệu mã QR phải chứa: STK ngân hàng thụ hưởng, số tiền chính xác, và mã giao dịch ngẫu nhiên.

---

## MÔ-ĐUN 4: Quản Lý Đơn Hàng Và Tính Toàn Vẹn Giao Dịch

### 1. Mục tiêu
Lưu trữ lịch sử giao dịch một cách bất biến và thiết lập bảng điều khiển quản lý quy trình xử lý đơn hàng.

### 2. Yêu cầu Cơ sở dữ liệu (Prisma Schema)
* Cần định nghĩa Enum cho trạng thái để đảm bảo tính nhất quán: `enum OrderStatus { PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED }`.
* **Order:** Lưu trữ `id`, `userId` (optional), `totalAmount`, `shippingAddress`, `status` (OrderStatus), `paymentStatus` (boolean).
* **OrderItem:** Lưu `orderId`, `productId`, `quantity`, và **BẮT BUỘC** có trường `priceAtPurchase` (lưu giá trị sản phẩm tại thời điểm mua để tránh sai lệch nếu giá sản phẩm thay đổi sau này). Thiết lập khóa ngoại tham chiếu đến `Product`.

### 3. Yêu cầu Tính năng (Storefront)
* Xây dựng trang Lịch sử đơn hàng cho người dùng đã đăng nhập.
* Hiển thị chi tiết từng đơn hàng, trạng thái hiện tại và lịch sử thanh toán.

### 4. Yêu cầu Tính năng (Admin)
* Xây dựng giao diện Bảng điều khiển Đơn hàng (Order Fulfillment Panel) hiển thị danh sách đơn hàng.
* Cho phép Admin thay đổi trạng thái đơn hàng (ví dụ: `PENDING` -> `PROCESSING`).
* Tính năng xác nhận thanh toán thủ công (Đối soát với mã VietQR).

---

## MÔ-ĐUN 9/10: CMS Trang Nội Dung (Pages CMS - Phase 10c)

### 1. Mục tiêu
Cung cấp hệ thống quản lý trang nội dung tĩnh do admin tạo tại `/admin/website/pages`. Mỗi trang render công khai tại `/trang/[slug]`. Thay thế các trang hard-code dần dần (không đụng route tĩnh cũ như /privacy, /faq...).

### 2. Prisma model
Model `Page` với các trường: id, title, slug (unique), content (db.Text - HTML format), excerpt (optional), metaTitle, metaDescription, ogImage, visible (boolean, default true), sortOrder, createdAt, updatedAt.

### 3. Files kỹ thuật
- Validator: `src/lib/validators/page.schema.ts` (Zod)
- Service: `src/lib/services/page.service.ts` (PageService static - listPages, getPageById, getPageBySlugPublic, getVisiblePageSlugs, createPage, updatePage, deletePage, togglePageVisibility)
- Actions: `src/lib/actions/page.actions.ts` (createPageAction, updatePageAction, deletePageAction, togglePageVisibilityAction)

### 4. Admin CRUD
- `/admin/website/pages` - danh sach trang (PagesListClient.tsx - table layout, badge Hien thi/An, search, sticky action column)
- `/admin/website/pages/create` - tao trang moi (PageEditorClient.tsx)
- `/admin/website/pages/[id]` - chinh sua trang (PageEditorClient.tsx)

### 5. Storefront
- `/trang/[slug]` - render trang visible, notFound neu an hoac khong ton tai
- generateMetadata voi metaTitle, metaDescription, ogImage fallback
- Content render qua `dangerouslySetInnerHTML` (mirror journal/[slug])
- Sitemap tu dong them cac slug visible

---

## MÔ-ĐUN 5: Bảng Chỉ Huy Trung Tâm & Phân Tích Dữ Liệu

### 1. Mục tiêu
Biến Admin Dashboard thành một trung tâm khai thác dữ liệu thực tế bằng các truy vấn nâng cao của Prisma.

### 2. Yêu cầu Kỹ thuật & Giao diện (Admin)
* **Widget KPIs:** Hiển thị tổng doanh thu, tổng số đơn hàng trong tháng.
* **Cảnh báo Tồn kho:** Truy vấn danh sách các sản phẩm có `stockQuantity < 10` để cảnh báo nhập hàng.
* **Xếp hạng Khách hàng (Leaderboard):**
    * Khai thác tính năng tập hợp quan hệ (Relation Aggregates) của Prisma.
    * Truy vấn 10 khách hàng mua nhiều đơn nhất bằng cách sử dụng `orderBy: { orders: { _count: 'desc' } }` để tối ưu hóa hiệu suất cơ sở dữ liệu gốc.
* **Hệ thống thông báo:** Cài đặt hệ thống thông báo trạng thái Toast (ví dụ: Sonner) để phản hồi ngay lập tức cho Admin khi các thao tác (như cập nhật trạng thái đơn hàng) thành công hoặc thất bại.
