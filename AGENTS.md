# Ngữ Cảnh Dự Án & Tiêu Chuẩn Thực Thi

Tài liệu này định nghĩa ngữ cảnh kỹ thuật và nguyên tắc cộng tác cho tác nhân AI khi làm việc trong repo `cocnoi-web`.

---

## 1. Tổng quan

- **Dự án:** website và hệ thống vận hành web của Cốc Nối
- **Tech Stack:** Next.js App Router, Prisma ORM, PostgreSQL, Tailwind CSS, Auth.js, Zustand, Cloudinary
- **Mô hình storefront:** hybrid lead-gen / full cart qua `NEXT_PUBLIC_ENABLE_CART`
- **Route storefront canonical:** `/cua-hang`

---

## 2. Source of truth

Khi có mâu thuẫn giữa tài liệu và code, ưu tiên theo:

1. `src/app`, `src/components`, `src/lib`, `src/config`, `prisma/schema.prisma`
2. `docs/cocnoi-web-structure.md`
3. `docs/web-modules-spec.md`
4. `../site-architecture.md`
5. `README.md`

Không dùng các giả định lịch sử như:

- `/shop` là route chuẩn
- SQLite là DB hiện hành của dự án
- form public mặc định submit sang Google Sheet
- homepage là landing page hard-code cố định

---

## 3. Câu lệnh thường dùng

- Cài dependencies: `npm install`
- Chạy local: `npm run dev`
- Build: `npm run build`
- Lint: `npm run lint`
- Seed finishes: `npm run db:seed-finishes`
- Kiểm tra drift tài liệu: `npm run docs:check`

Trước khi chạy build hoặc migration, luôn kiểm tra `DATABASE_URL` đang trỏ đúng môi trường.

---

## 4. Tiêu chuẩn mã hóa

- Dùng TypeScript cho toàn bộ dự án
- Tôn trọng ranh giới Server Components và Client Components
- Ưu tiên bám theo pattern sẵn có trong repo thay vì phát minh style mới
- Validate input ở các lớp cần thiết bằng schema phù hợp
- Giữ comment ngắn và có lý do; không bình luận cho những thứ tự hiển nhiên

---

## 5. Ranh giới triển khai

### Storefront

- route chuẩn là `/cua-hang`
- full cart chỉ được coi là mặc định khi `NEXT_PUBLIC_ENABLE_CART === "true"`
- copy, nav, homepage sections, payment info có thể được điều khiển từ site customizer

### Admin

Admin không chỉ là dashboard đơn lẻ. Đây là khu vực vận hành gồm:

- catalog/PIM
- inquiries
- orders retail/B2B
- customers/CRM
- finance
- promotions
- website/blog/theme/customize

### Data

- database chuẩn là PostgreSQL
- media upload production theo hướng Cloudinary
- Prisma schema là chuẩn cuối cho model/business enums

---

## 6. Quy tắc đồng bộ tài liệu

Nếu thay đổi một trong các nhóm sau:

- route public / redirect
- env toggle ảnh hưởng storefront
- Prisma schema hoặc DB provider
- form flow public
- site customizer schema
- cấu trúc admin surface

thì phải rà đồng bộ ít nhất các file sau:

1. `../_README.md`
2. `../site-architecture.md`
3. `README.md`
4. `docs/cocnoi-web-structure.md`
5. `docs/web-modules-spec.md`
6. `AGENTS.md`

Sau đó chạy:

```bash
npm run docs:check
```

Nếu script fail, coi như docs chưa được cập nhật xong.

---

## 7. Quy trình làm việc gợi ý cho AI

1. Đọc code liên quan trước
2. Sửa feature hoặc dữ liệu
3. Xác định thay đổi đó có ảnh hưởng docs web không
4. Nếu có, cập nhật bộ 6 file ở trên
5. Chạy `npm run docs:check`
6. Báo lại rõ thay đổi nào là code, thay đổi nào là docs

---

## 8. Tư duy xử lý lỗi và review

- Khi gặp lỗi, ưu tiên nêu nguyên nhân gốc trước
- Khi sửa, giải thích cơ chế mới bằng ngôn ngữ đọc được
- Nếu chưa kiểm chứng được bằng chạy app/test, nói rõ
- Với các thay đổi docs, mục tiêu là giảm drift chứ không tạo thêm một lớp tài liệu mơ hồ
