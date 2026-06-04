# Ngữ Cảnh Dự Án & Tiêu Chuẩn Thực Thi

Tài liệu này định nghĩa ngữ cảnh kỹ thuật và tiêu chuẩn thực thi dành cho tác nhân AI (Antigravity) khi phát triển mã nguồn website Cốc Nối.

---

## 1. Tổng quan
- **Dự án:** Nền tảng thương mại điện tử Cốc Nối (`cocnoi-web`).
- **Tech Stack:** Next.js (App Router), Prisma ORM (SQLite cho dev, PostgreSQL cho production), Tailwind CSS, Auth.js (NextAuth), Zustand.

---

## 2. Câu lệnh thực thi (Commands)
- Cài đặt thư viện: `npm install`
- Khởi chạy môi trường phát triển: `npm run dev`
- Cập nhật schema CSDL: `npx prisma generate` và `npx prisma db push`

---

## 3. Tiêu chuẩn mã hóa (Coding Rules)
- Bắt buộc sử dụng TypeScript cho toàn bộ dự án.
- Ưu tiên dùng Named Exports (ngoại trừ các file config hoặc pages/layouts bắt buộc của Next.js).
- Phân định nghiêm ngặt Server Components và Client Components (khai báo `"use client"`).
- Mọi đoạn mã sinh ra cần có comments rõ ràng về chức năng và các giới hạn kỹ thuật.

---

## 4. Tiêu chuẩn Thực thi cho Tác nhân AI (Antigravity Workflow)

### 4.1 Ranh Giới Môi Trường Thực Thi (Runtime Boundaries)
* **Quy tắc Next.js:** Phân định tuyệt đối giữa Server Components và Client Components.
* **Ràng buộc:** KHÔNG ĐƯỢC gọi các Client Hooks (ví dụ: `useState`, `useEffect`) bên trong Server Components.

### 4.2 Dữ Liệu Mẫu Thực Tế (Seed Data)
* **Yêu cầu:** Tạo dữ liệu mẫu thực tế và đa dạng ngay từ các phase đầu (đặc biệt là Mô-đun Sản phẩm).
* **Mục đích:** Phát hiện sớm các rủi ro vỡ bố cục giao diện (layout) hoặc sai sót trong logic bộ lọc/tìm kiếm.

### 4.3 Tiêu Chuẩn Ghi Chú Mã Nguồn (Documentation)
* **Yêu cầu:** Tự động thêm chú thích (inline comments/JSDoc) rõ ràng vào mọi đoạn mã được tạo ra.
* **Thông tin bắt buộc:** Chức năng cốt lõi, ngày tạo, và các giới hạn kỹ thuật (known limitations) để phục vụ việc truy vết lỗi.

### 4.4 Kiểm Soát Bảo Mật & Bằng Chứng Thực Thi (Security & Artifacts)
* **Phân quyền (Permissions):** Thiết lập nghiêm ngặt danh sách cho phép/từ chối (Allowlists/Denylists) khi giao quyền truy cập Terminal và Browser.
* **Bàn giao (Hand-off):** Yêu cầu xuất bằng chứng thực thi (Mã diff hoặc ảnh chụp màn hình trình duyệt) để con người phê duyệt trước khi hợp nhất (merge) mã.

### 4.5 Tư Duy Xử Lý Lỗi (Errors as Feedback)
* **Quy trình Debug:** Báo cáo lỗi nguyên bản (Raw error logs) sẽ được cung cấp trực tiếp làm đầu vào phản hồi.
* **Rà soát chéo (Code Review):** Khi sửa lỗi, tác nhân phải giải thích nguyên nhân gốc rễ và cơ chế hoạt động của đoạn mã mới để con người có thể đọc hiểu và kiểm chứng.