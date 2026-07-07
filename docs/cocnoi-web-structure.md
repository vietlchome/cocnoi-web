# Cấu trúc Source Code Website Cốc Nối

> Ảnh chụp nhanh cấu trúc codebase `cocnoi-web` tại thời điểm 01/07/2026.
>
> Mục tiêu của file này là giúp đọc repo nhanh, nắm route groups, module chính và vị trí những phần quan trọng nhất.

---

## 1. Tổng quan

`cocnoi-web` là một ứng dụng Next.js App Router gom nhiều lớp trong cùng một codebase:

- storefront public
- admin dashboard
- journal/blog CMS
- site customizer
- các API phục vụ inquiry, contact, search, upload, admin data

Stack chính đang dùng:

- Next.js 16
- React 19
- Tailwind CSS 4
- Prisma ORM
- PostgreSQL
- Auth.js / NextAuth
- Zustand
- Cloudinary

---

## 2. Cấu trúc thư mục gốc

```text
cocnoi-web/
├── docs/                 # Tài liệu kỹ thuật, phase notes, deployment, DB setup
├── prisma/               # Schema, migrations, seed scripts
├── public/               # Tài nguyên tĩnh public
├── scripts/              # Script hỗ trợ migration / backfill / kiểm thử
├── src/                  # Mã nguồn ứng dụng
├── AGENTS.md             # Hướng dẫn cộng tác trong repo
├── next.config.ts        # Redirects + cấu hình Next
├── package.json          # Scripts và dependencies
└── README.md             # Điểm vào cho developer
```

### Ghi chú

- `docs/` chứa cả tài liệu hiện hành lẫn phase specs lịch sử.
- `public/` có một số asset mặc định và thư mục `uploads/` legacy, nhưng production media upload hiện nên xem theo hướng Cloudinary/Vercel-friendly.
- `prisma/` dùng PostgreSQL làm nguồn dữ liệu chính, không còn mô hình dev SQLite như một số tài liệu cũ.

---

## 3. `src/app` - Route tree

Ứng dụng dùng App Router và chia 3 nhóm lớn:

- `(store)` cho storefront
- `(admin)` cho khu vực quản trị
- `api` cho backend routes

```text
src/app/
├── (store)/
├── (admin)/
├── api/
├── login/
├── layout.tsx
├── globals.css
└── sitemap.ts
```

### 3.1. Storefront route group

```text
src/app/(store)/
├── page.tsx                           # /
├── cua-hang/
│   ├── page.tsx                       # /cua-hang
│   └── [slug]/
│       ├── page.tsx                   # /cua-hang/[slug]
│       └── ProductDetailClient.tsx
├── discover/
│   ├── page.tsx                       # /discover
│   ├── our-story/page.tsx
│   ├── our-human/page.tsx
│   ├── our-craft/page.tsx
│   └── our-values/page.tsx
├── community/
│   ├── nguoi-noi/page.tsx
│   └── your-stories/page.tsx
├── partners/
│   ├── page.tsx
│   ├── stockists/page.tsx
│   ├── become-a-stockist/page.tsx
│   └── corporate-gifting/page.tsx
├── journal/
│   ├── page.tsx
│   └── [slug]/page.tsx
├── contact/page.tsx
├── faq/page.tsx
├── privacy/page.tsx
├── terms/page.tsx
├── checkout/page.tsx
├── don-hang/
│   ├── page.tsx
│   └── OrderTrackingClient.tsx
├── about/page.tsx                     # legacy compatibility route
├── layout.tsx
├── loading.tsx
└── error.tsx
```

### 3.2. Canonical public routes

- `/`
- `/cua-hang`
- `/cua-hang/[slug]`
- `/discover`
- `/discover/our-story`
- `/discover/our-human`
- `/discover/our-craft`
- `/discover/our-values`
- `/community/nguoi-noi`
- `/community/your-stories`
- `/partners`
- `/partners/stockists`
- `/partners/become-a-stockist`
- `/partners/corporate-gifting`
- `/journal`
- `/journal/[slug]`
- `/contact`
- `/faq`
- `/privacy`
- `/terms`
- `/don-hang`
- `/checkout` khi cart mode bật

### 3.3. Redirects cần nhớ

`next.config.ts` hiện redirect:

- `/shop` -> `/cua-hang`
- `/shop/:slug*` -> `/cua-hang/:slug*`
- `/nguoi-noi` -> `/community/nguoi-noi`
- `/community` -> `/community/nguoi-noi`
- `/about` -> `/discover/our-story`

### 3.4. Admin route group

```text
src/app/(admin)/admin/
├── page.tsx
├── analytics/page.tsx
├── complaints/page.tsx
├── customers/
│   ├── page.tsx
│   └── [id]/page.tsx
├── customize/page.tsx
├── finance/page.tsx
├── inquiries/page.tsx
├── orders/
│   ├── retail/page.tsx
│   └── b2b/page.tsx
├── products/
│   ├── page.tsx
│   ├── create/page.tsx
│   ├── [id]/page.tsx
│   ├── bulk-upload/page.tsx
│   ├── inventory/page.tsx
│   ├── pricing/page.tsx
│   ├── reviews/page.tsx
│   └── settings/page.tsx
├── promotions/page.tsx
├── settings/
│   ├── page.tsx
│   ├── bank-account/page.tsx
│   ├── export/page.tsx
│   └── notifications/page.tsx
├── website/
│   ├── blogs/page.tsx
│   ├── navigation/page.tsx
│   ├── pages/page.tsx
│   └── theme/page.tsx
└── sandbox/
    └── customize-preview/page.tsx
```

Admin là nơi gom nhiều chức năng vận hành:
- catalog
- inquiries
- orders retail/B2B
- customers/CRM
- finance
- promotions
- content/blog
- navigation/theme/site customizer

### 3.5. API routes

```text
src/app/api/
├── auth/[...nextauth]/route.ts
├── contact/route.ts
├── inquiry/
│   ├── route.ts
│   └── draft/route.ts
├── search/route.ts
├── site-config/route.ts
└── admin/
    ├── data/route.ts
    ├── finishes/route.ts
    ├── products/
    │   ├── route.ts
    │   ├── bulk-upload/route.ts
    │   ├── bulk-commit/route.ts
    │   └── bulk-template/route.ts
    ├── settings/route.ts
    └── upload/route.ts
```

---

## 4. `src/components` - UI theo lớp chức năng

```text
src/components/
├── admin/
├── shared/
├── store/
└── ui/
```

### `components/store`

Chứa phần giao diện public đặc thù như:

- `MegaMenu`, `MegaMenuMobile`
- `CartDrawer`
- `FloatingActions`
- `PaymentInstructionsBlock`
- `ReviewSection`, `ReviewList`
- `StockistApplicationForm`, `CorporateGiftingForm`, `PartnerContactForm`
- `HomepageSections/*` cho các section động của homepage

### `components/shared`

Các thành phần dùng chung giữa nhiều page:

- `Header`
- `HeaderClient`
- `Footer`
- `FooterNewsletterForm`
- `SearchOverlay`
- `FormErrorAlert`

### `components/admin`

Các client/admin surfaces lớn:

- dashboard widgets
- products / product form / bulk upload
- orders / inquiries / customers
- analytics / finance / promotions
- content/blog editor
- site customizer
- settings / notifications / export / bank account

### `components/ui`

UI primitives và generic building blocks:

- `Button`
- `Modal`
- `DataTable`
- `ConfirmDialog`
- `SearchInput`
- `Tabs`
- `StatusBadge`

---

## 5. `src/lib` và `src/config` - logic ứng dụng

### `src/lib/actions`

Server-side actions để gom thao tác nghiệp vụ theo module:

- analytics
- auth
- content
- customer
- export
- finish
- inquiry
- order
- product
- promotion
- review
- search
- settings

### `src/lib/services`

Lớp service truy vấn và xử lý domain:

- `product.service.ts`
- `order.service.ts`
- `inquiry.service.ts`
- `customer.service.ts`
- `content.service.ts`
- `analytics.service.ts`
- `finance.service.ts`
- `inventory.service.ts`
- `search.service.ts`
- `settings.service.ts`

### `src/lib/validators`

Schema validate bằng Zod cho:

- product
- order
- inquiry
- customer
- content
- review

### `src/lib/utils`

Utility cho:

- format
- slug
- phone
- rate limit
- telegram
- video handling
- error messages

### Các file lõi khác

- `src/lib/prisma.ts`: Prisma client bootstrap
- `src/lib/site-config.ts`: đọc/ghi cấu hình site
- `src/lib/site-config-validate.ts`: validate dữ liệu customizer
- `src/lib/auth-helpers.ts`: helper auth
- `src/lib/constants.ts`: constant app-level

### `src/config/site-schema.ts`

Đây là schema trung tâm của site customizer, mô tả các section và field đang có thể quản trị trong admin, ví dụ:

- header
- hero
- campaign
- products
- story
- trust_badges
- faq
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

---

## 6. `prisma/` - dữ liệu và migrations

```text
prisma/
├── schema.prisma
├── seed.js
├── seed-finishes.ts
├── seed-reviews.ts
└── migrations/
```

### Những nhóm model chính trong schema hiện tại

- Auth: `User`, `Account`, `Session`, `VerificationToken`
- Catalog/PIM: `Category`, `ProductGroup`, `ColorOption`, `SizeOption`, `FinishOption`, `Product`
- Orders/Inquiries: `Order`, `OrderItem`, `OrderInquiry`
- CRM: `Customer`, `CustomerNote`
- Content & Theme: `Post`, `ThemeSetting`, `Review`
- Commercial ops: `Promotion`, `Notification`, `Stockist`

### Ghi chú

- DB provider hiện tại là PostgreSQL.
- Đã có migration history trong `prisma/migrations/`.
- Không dùng file `dev.db` SQLite như mô tả ở tài liệu cũ.

---

## 7. `scripts/` - công cụ hỗ trợ

Một số script nổi bật:

- `migrate-settings-to-sections.ts`
- `migrate-images-to-cloudinary.ts`
- `backfill-inquiry-types.ts`
- `download-pages.ts`
- `compare-html.ts`
- `read-posts.ts`
- `test-site-config.ts`

Nhóm này phục vụ migration dữ liệu, import/export, backfill và test nhanh.

---

## 8. Runtime notes quan trọng

- Route storefront chuẩn là `/cua-hang`, không phải `/shop`.
- Chế độ cart phụ thuộc `NEXT_PUBLIC_ENABLE_CART`.
- `NEXT_PUBLIC_SITE_URL` ảnh hưởng sitemap và canonical URL.
- Upload media admin đang đi theo hướng Cloudinary.
- Storefront, admin và CMS nằm chung app; thay đổi dữ liệu thường có tác động chéo giữa catalog, inquiry, content và customizer.

---

## 9. Khi nào cần cập nhật file này

Hãy sửa file này khi có một trong các thay đổi sau:

- thêm/bớt route public hoặc admin
- đổi route canonical
- thêm API route mới
- đổi vị trí module trong `src/components`, `src/lib`, `src/config`
- thay đổi đáng kể schema Prisma

Nếu chỉ đổi copy hoặc layout intent của website, ưu tiên cập nhật `../site-architecture.md` trước.
