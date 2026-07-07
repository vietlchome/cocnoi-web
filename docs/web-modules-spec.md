# Đặc Tả Kỹ Thuật Hợp Nhất Website Cốc Nối

> Mục tiêu của file này là mô tả các mô-đun kỹ thuật đang vận hành trong `cocnoi-web` theo trạng thái codebase hiện tại, không phải blueprint lịch sử.
>
> Cập nhật theo codebase ngày 01/07/2026.

---

## 0. Source of truth cho tài liệu web

Khi đọc hoặc cập nhật tài liệu website, dùng thứ tự ưu tiên sau:

1. `src/app`, `src/components`, `src/lib`, `src/config`, `prisma/schema.prisma`
2. `docs/cocnoi-web-structure.md`
3. `../site-architecture.md`
4. `README.md` và `AGENTS.md`

Nếu tài liệu nào mâu thuẫn với source code, source code hiện tại thắng.

Các điểm chuẩn đang phải giữ thống nhất:

- route storefront canonical là `/cua-hang`
- DB chính là PostgreSQL
- media upload đi theo hướng Cloudinary
- website chạy hybrid mode qua `NEXT_PUBLIC_ENABLE_CART`
- form public đi qua API -> Prisma -> admin, không mặc định đi sang spreadsheet
- homepage được quản trị theo section-based customizer

---

## Mô-đun 1: Auth và phân quyền admin

### Mục tiêu

Thiết lập xác thực và phân quyền cho khu vực quản trị.

### Trạng thái hiện tại

- Auth route: `src/app/api/auth/[...nextauth]/route.ts`
- Schema auth chuẩn nằm trong Prisma:
  - `User`
  - `Account`
  - `Session`
  - `VerificationToken`
- `User.role` dùng enum `UserRole` với `USER` và `ADMIN`
- Có route đăng nhập tại `/login`

### Phạm vi chính

- bảo vệ khu vực admin
- xác thực tài khoản quản trị
- chuẩn bị nền cho workflow user/account trong tương lai

### Điều cần giữ đúng trong docs

- gọi đúng là Auth.js / NextAuth
- không mô tả schema auth như một bài toán chưa triển khai
- không ghi stack DB kiểu "SQLite cho dev, PostgreSQL cho prod" như mặc định cũ

---

## Mô-đun 2: Catalog / PIM

### Mục tiêu

Quản trị sản phẩm, taxonomy và hiển thị catalog public.

### Trạng thái hiện tại

Schema liên quan:

- `Category`
- `ProductGroup`
- `ColorOption`
- `SizeOption`
- `FinishOption`
- `Product`

Admin surface hiện có:

- `/admin/products`
- `/admin/products/create`
- `/admin/products/[id]`
- `/admin/products/bulk-upload`
- `/admin/products/inventory`
- `/admin/products/pricing`
- `/admin/products/reviews`
- `/admin/products/settings`

API/admin actions hiện có:

- `api/admin/products/*`
- `api/admin/finishes/route.ts`
- `src/lib/actions/product.actions.ts`
- `src/lib/services/product.service.ts`

### Storefront hiện tại

- landing catalog public nằm ở `/cua-hang`
- trang chi tiết sản phẩm ở `/cua-hang/[slug]`
- `/shop` chỉ là redirect legacy

### Điều cần giữ đúng trong docs

- không dùng `/shop` như route canonical mới
- không mô tả catalog public như đã có cây URL category/collection sâu nếu code chưa có route thật
- không quên rằng catalog public và admin PIM đang ở cùng một app

---

## Mô-đun 3: Hybrid commerce, inquiry và checkout

### Mục tiêu

Cho phép website vận hành linh hoạt giữa hai mode:

- lead-gen + QR/COD
- full cart/checkout

### Trạng thái hiện tại

- biến điều khiển chính: `NEXT_PUBLIC_ENABLE_CART`
- khi biến này khác `"true"`:
  - storefront ưu tiên inquiry flow
  - product detail hiển thị tư vấn / inquiry / payment guidance
  - cart UI bị ẩn
- khi biến này bằng `"true"`:
  - cart UI xuất hiện
  - `/checkout` hoạt động như luồng đặt hàng đầy đủ

### Thành phần liên quan

- `src/app/(store)/checkout/page.tsx`
- `src/app/(store)/cua-hang/[slug]/ProductDetailClient.tsx`
- `src/components/store/CartDrawer.tsx`
- `src/components/store/PaymentInstructionsBlock.tsx`
- `src/components/shared/HeaderClient.tsx`
- `src/components/store/FloatingActions.tsx`

### Điều cần giữ đúng trong docs

- không mô tả website như full e-commerce cố định
- cũng không mô tả nó như site chỉ có form prototype
- phải ghi rõ đây là hybrid model

---

## Mô-đun 4: Orders, inquiries và CRM

### Mục tiêu

Gom các tín hiệu chuyển đổi và vận hành hậu cần trong cùng hệ thống dữ liệu.

### Trạng thái hiện tại

Schema liên quan:

- `Order`
- `OrderItem`
- `OrderInquiry`
- `Customer`
- `CustomerNote`

Các enum quan trọng:

- `OrderStatus`
- `OrderType`
- `InquiryStatus`
- `InquiryType`
- `CustomerType`

Admin surface hiện có:

- `/admin/orders/retail`
- `/admin/orders/b2b`
- `/admin/inquiries`
- `/admin/customers`
- `/admin/customers/[id]`
- `/admin/finance`

API liên quan:

- `api/inquiry/route.ts`
- `api/inquiry/draft/route.ts`
- `api/contact/route.ts`

### Điều cần giữ đúng trong docs

- form public mặc định vào app qua API + Prisma + admin
- không mô tả Google Sheet là nguồn chuẩn
- B2B và retail đang dùng chung nền dữ liệu, chỉ khác loại intent/workflow

---

## Mô-đun 5: Content, journal và site customizer

### Mục tiêu

Cho đội ngũ chỉnh website public mà không phải đụng code cho mọi thay đổi nhỏ.

### Trạng thái hiện tại

Schema/content:

- `Post`
- `ThemeSetting`
- `Review`
- `Promotion`
- `Notification`
- `Stockist`

Admin/content surfaces:

- `/admin/website/blogs`
- `/admin/website/navigation`
- `/admin/website/pages`
- `/admin/website/theme`
- `/admin/customize`

Tệp lõi:

- `src/config/site-schema.ts`
- `src/lib/site-config.ts`
- `src/lib/site-config-validate.ts`

Section đang được quản trị qua customizer gồm:

- header
- hero
- campaign
- products
- story
- trust_badges
- faq
- contact
- footer
- social
- seo
- analytics
- homepage
- our_values
- partners_meta
- payment_info
- navigation
- community_stories

Taxonomy bài viết đã chốt cho khu `HÀNH TRÌNH` / `/journal`:

- `Người-Nối`
  - chú giải: `Chân dung những người thầm lặng gìn giữ sự gắn kết.`
- `Câu chuyện Cốc Nối`
- `Kiến thức & Cảm hứng`

Ghi chú triển khai hiện tại:

- UI/admin/public copy dùng bộ tên ở trên
- giá trị nội bộ đang lưu trong DB vẫn là các mã legacy:
  - `UNSUNG_HEROES`
  - `JOURNEY`
  - `KNOWLEDGE`
- khi nào cần migrate sang slug/value mới ở tầng dữ liệu thì làm thành một thay đổi riêng, không gộp lẫn với đổi nhãn hiển thị

### Điều cần giữ đúng trong docs

- homepage hiện là section-based, không xem như landing page hard-code cố định
- navigation và footer là dữ liệu có thể quản trị
- journal/blog là CMS nội bộ thật, không phải placeholder

---

## Mô-đun 6: Hạ tầng, deploy và media

### Mục tiêu

Giữ app chạy ổn trên mô hình deploy gọn nhẹ, phù hợp giai đoạn hiện tại.

### Trạng thái hiện tại

- app framework: Next.js App Router
- ORM: Prisma
- database: PostgreSQL
- media upload: Cloudinary
- deploy docs hiện có:
  - `docs/deployment-vercel-hobby.md`
  - `docs/dev-db-setup.md`

### Điều cần giữ đúng trong docs

- không ghi lại giả định SQLite như setup chuẩn hiện tại
- không mô tả upload local filesystem như chiến lược production chính
- mọi ghi chú về env cần khớp với `README.md` và source đang dùng

---

## 7. Quy tắc cập nhật tài liệu khi web đổi

Khi có thay đổi ở một trong các nhóm sau:

- route public hoặc redirects
- DB provider hoặc model chính
- env toggle ảnh hưởng storefront
- form flow public
- customizer schema
- admin surface mới

thì phải kiểm tra đồng bộ ít nhất 6 file:

1. `../_README.md`
2. `../site-architecture.md`
3. `README.md`
4. `docs/cocnoi-web-structure.md`
5. `docs/web-modules-spec.md`
6. `AGENTS.md`

Sau khi sửa, chạy:

```bash
npm run docs:check
```

Script này dùng để bắt các dấu hiệu drift phổ biến trong tài liệu web.
