# Cốc Nối Web

Website và hệ thống vận hành web cho Cốc Nối. Project này không chỉ là storefront public, mà còn bao gồm:

- admin dashboard
- catalog/PIM
- inquiry & customer management
- journal/blog CMS
- site customizer cho homepage, navigation, footer, SEO, payment info

## Những gì project đang làm

- Vận hành website public của Cốc Nối bằng Next.js App Router
- Hiển thị catalog sản phẩm với route canonical `/cua-hang`
- Hỗ trợ mô hình hybrid:
  - mặc định lead-gen + QR/COD
  - có thể bật full cart/checkout bằng env
- Quản trị đơn hàng, inquiry, khách hàng, promotion và content trong cùng một app

## Stack chính

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Auth.js / NextAuth
- Zustand
- Cloudinary

## Route public đáng nhớ

- `/`
- `/cua-hang`
- `/cua-hang/[slug]`
- `/discover/*`
- `/community/*`
- `/partners/*`
- `/journal/*`

Legacy redirects hiện có:

- `/shop` -> `/cua-hang`
- `/shop/:slug*` -> `/cua-hang/:slug*`
- `/about` -> `/discover/our-story`
- `/nguoi-noi` -> `/community/nguoi-noi`

## Chạy local

### 1. Cài dependencies

```bash
npm install
```

### 2. Chuẩn bị biến môi trường

Project cần ít nhất các nhóm biến sau:

- `DATABASE_URL`
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ENABLE_CART`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Nếu cần test login/admin đầy đủ, đọc thêm `docs/deployment-vercel-hobby.md` để cấu hình nhóm biến auth tương ứng.

Nếu đang phát triển local, đọc trước `docs/dev-db-setup.md` để tránh dùng nhầm DB production.

### 3. Chạy dev server

```bash
npm run dev
```

Mặc định app chạy tại [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run db:seed-finishes
```

### Ghi chú về build

`npm run build` hiện chạy:

```bash
prisma generate && prisma migrate deploy && next build
```

Vì vậy hãy chắc chắn `DATABASE_URL` đang trỏ đúng môi trường trước khi build.

## Các tài liệu nên đọc đầu tiên

- `docs/cocnoi-web-structure.md`
- `docs/deployment-vercel-hobby.md`
- `docs/dev-db-setup.md`
- `src/config/site-schema.ts`
- `../site-architecture.md`

## Một vài lưu ý để khỏi đọc lệch

- Tài liệu cũ có thể còn nhắc `/shop` hoặc mô hình prototype trước đây; hiện tại route chuẩn là `/cua-hang`.
- Luồng form public mặc định đi vào app qua API + Prisma + admin, không xem spreadsheet là nguồn dữ liệu chuẩn.
- Homepage hiện là section-based và nhiều phần nội dung được quản lý từ customizer, không phải một landing page hard-code thuần.
