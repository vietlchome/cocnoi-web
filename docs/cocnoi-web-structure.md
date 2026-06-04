# Cấu trúc Source Code Website Cốc Nối

Dựa trên quá trình kiểm tra thư mục mã nguồn tại `d:\CỐC NỐI\07_Website\cocnoi-web`, đây là cấu trúc hiện tại của dự án website đang được xây dựng (sử dụng Next.js và Prisma):

## Cấu trúc Tổng quan

Dự án được phát triển theo kiến trúc App Router của Next.js, kết hợp Prisma cho cơ sở dữ liệu.

```text
cocnoi-web/
├── prisma/
│   ├── dev.db              # SQLite Database cho môi trường dev
│   ├── schema.prisma       # Định nghĩa model dữ liệu (Prisma schema)
│   └── seed.js             # Script tạo dữ liệu mẫu ban đầu
├── public/                 # Các tài nguyên tĩnh công khai (ảnh, svg, icon...)
│   ├── uploads/            # Thư mục lưu trữ ảnh người dùng tải lên
│   │   └── products/       # Ảnh riêng biệt cho từng sản phẩm
│   └── ...                 # Các file SVG hệ thống (next.svg, vercel.svg...)
├── src/
│   ├── app/                # Chứa các Route và Layout chính (Next.js App Router)
│   ├── components/         # Chứa các UI Component dùng chung (React components)
│   └── lib/                # Chứa thư viện, cấu hình logic phụ (Prisma Client, utils...)
├── .env                    # Biến môi trường
├── package.json            # Quản lý các dependencies và scripts (npm/yarn)
├── tsconfig.json           # Cấu hình TypeScript
└── next.config.ts          # Cấu hình framework Next.js
```

---

## Chi tiết Thư mục `src/app` (Kiến trúc Routes)

Toàn bộ logic và các trang (pages) của website được cấu trúc trong `src/app`. Dự án sử dụng **Route Groups** để tách biệt phần quản trị (Admin) và giao diện người dùng (Store).

```text
src/app/
├── favicon.ico
├── globals.css                # Style chung toàn cục
├── layout.tsx                 # Root layout bọc toàn bộ ứng dụng
│
├── (admin)/                   # [Route Group] Dành cho Quản trị viên
│   ├── layout.tsx             # Layout riêng cho màn hình Admin
│   └── admin/
│       └── page.tsx           # Trang Dashboard quản trị chính
│
├── (store)/                   # [Route Group] Dành cho Giao diện Khách hàng
│   ├── layout.tsx             # Layout riêng cho phần Store (chứa Header, Footer chung)
│   ├── page.tsx               # Trang chủ (Home - /)
│   ├── contact/
│   │   └── page.tsx           # Trang Liên hệ (/contact)
│   ├── discover/
│   │   └── page.tsx           # Trang Khám phá (/discover)
│   ├── journal/
│   │   └── page.tsx           # Trang Hành trình/Blog (/journal)
│   ├── nguoi-noi/
│   │   └── page.tsx           # Trang Chiến dịch Người Nối (/nguoi-noi)
│   ├── partners/
│   │   └── page.tsx           # Trang Đối tác (/partners)
│   └── shop/
│       ├── page.tsx           # Trang Cửa hàng chính (/shop)
│       └── [slug]/
│           ├── page.tsx               # Route cho Chi tiết sản phẩm (/shop/[slug])
│           └── ProductDetailClient.tsx # Client component hiển thị chi tiết sản phẩm
│
└── api/                       # API Routes (Backend chạy trên Next.js)
    ├── admin/
    │   ├── data/route.ts      # API lấy/cập nhật dữ liệu quản trị
    │   ├── inquiries/route.ts # API quản lý yêu cầu đơn hàng
    │   ├── posts/route.ts     # API quản lý bài viết/journal
    │   ├── products/route.ts  # API quản lý sản phẩm
    │   └── settings/route.ts  # API quản lý cấu hình chung
    ├── contact/
    │   └── route.ts           # API xử lý form liên hệ
    ├── inquiry/
    │   └── route.ts           # API xử lý form đặt hàng (inquiry) từ user
    └── upload/
    │   └── route.ts           # API xử lý việc tải lên file/hình ảnh
```

---

## Chi tiết Thư mục `src/components` (Kiến trúc UI)

Thư mục này tổ chức các thành phần giao diện được chia sẻ và tái sử dụng qua nhiều trang.

```text
src/components/
├── admin/
│   └── ImageCropUploader.tsx  # Component hỗ trợ upload và cắt ảnh (dành cho Admin)
├── shared/
│   ├── Header.tsx             # Component Navigation Header (Store)
│   └── Footer.tsx             # Component Footer (Store)
└── ui/                        # Chứa các UI element cơ bản
```

## Ghi chú cập nhật (Dành cho AI & Developer)
- **Lưu ý quan trọng**: File cấu trúc này cần được **cập nhật song song** mỗi khi có thay đổi (thêm file, đổi tên thư mục, thêm route mới) trong quá trình phát triển mã nguồn website.
