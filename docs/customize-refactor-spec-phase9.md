# Phase 9 spec - Navigation schema + Finish taxonomy + Hero video + UX cleanup

**Status:** Draft, ready for Antigravity execution
**Branch dự kiến:** `feat/phase9-nav-finish-hero`
**Effort estimate:** 25-30h
**Phụ thuộc:** Master tip `43054e4` (sau hotfix isPublished + hover gap)

## 1. Mục tiêu

Hoàn tất 4 việc trên Cốc Nối live tại `cocnoi.com`:

1. **Schema-driven Navigation**: bỏ hardcode `submenuMap` trong `HeaderClient.tsx`, mega menu CỬA HÀNG (rename từ SHOP) thành 3-column auto-pull DB + 2 featured card admin config.
2. **Finish taxonomy mới**: thêm model `FinishOption` M2M với Product, replace dimension "Màu sắc" trên mega menu bằng "Hoàn thiện" - kỹ thuật làm gốm.
3. **Size global**: migrate `SizeOption` từ per-category sang global (nhất quán với Color đã global).
4. **Hero video support**: schema cho phép Hero section dùng video MP4/WebM thay ảnh tĩnh, có poster fallback + mobile reduced-motion handling.
5. **UX cleanup**: footer hết fallback hardcode, 3 stub pages xử lý dứt khoát (DB-driven hoặc remove).

## 2. Bối cảnh + lý do

### 2.1 Hardcode mega menu hiện tại

`src/components/shared/HeaderClient.tsx` line 95-117 chứa `submenuMap` hardcode:

```ts
const submenuMap: Record<string, Array<{ name: string; href: string }>> = {
  "SHOP": [
    { name: "Cốc có quai (Mugs)", href: "/shop?category=Mugs" },
    { name: "Cốc không quai (Beakers)", href: "/shop?category=Beakers" },
    { name: "Bộ sưu tập đặc biệt", href: "/shop?category=Limited" },
    { name: "Tất cả sản phẩm", href: "/shop" },
  ],
  // ...
};
```

Vấn đề:
- Tên category trong submenu không đồng bộ với Category table thực tế.
- Đổi tên category trong DB không phản ánh menu.
- Không có BST, không có Hoàn thiện làm dimension browse.

### 2.2 Schema Size per-category lỗi thời

`prisma/schema.prisma` line 152-162:

```prisma
model SizeOption {
  id          String    @id @default(cuid())
  name        String
  categoryId  String?
  category    Category? @relation(...)
  // @@unique([name, categoryId])
}
```

`ColorOption` đã global. `SizeOption` per-category gây inconsistency, UX phức tạp, shop page lại không filter theo size. Migrate sang global để cleanup.

### 2.3 Hero hiện chỉ image

`src/config/site-schema.ts` section `hero` chỉ có `imageUrl`. Brand handcraft như Cốc Nối cần video kể chuyện process (clay shape, glaze, kiln). Cần thêm support video mà không break section structure hiện tại.

### 2.4 Cleanup nợ cũ

- `src/components/shared/Footer.tsx` line 55-56 vẫn có fallback strings hardcode.
- `/partners/stockists` placeholder "Sắp ra mắt tại các cửa hàng đối tác".
- `/community/your-stories` chưa có content.
- `/checkout` stub vì lead-gen mode.

## 3. Scope

### 3.1 Schema database

**Migration 1 - SizeOption global:**

```prisma
model SizeOption {
  id          String    @id @default(cuid())
  name        String    @unique           // Lớn (350ml+), Vừa (240-340ml), ...
  slug        String    @unique           // lon, vua, nho
  description String?                     // "Phù hợp cà phê espresso double shot"
  sortOrder   Int       @default(0)
  
  products    Product[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

Bỏ `categoryId`. Bỏ `@@unique([name, categoryId])`. Thêm `slug` unique.

**Migration 2 - FinishOption mới:**

```prisma
model FinishOption {
  id          String    @id @default(cuid())
  name        String    @unique           // Vẽ tay thủ công
  slug        String    @unique           // ve-tay-thu-cong
  description String?                     // Mô tả kỹ thuật
  imageUrl    String?                     // Optional ảnh minh họa
  sortOrder   Int       @default(0)
  
  products    Product[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Migration 3 - Product.finishes M2M:**

```prisma
model Product {
  // ... existing fields
  finishes    FinishOption[]              // M2M
  // sizeId vẫn giữ M2O với SizeOption global
}
```

Prisma tự tạo bảng trung gian `_FinishOptionToProduct` cho M2M.

### 3.2 Migration script

File: `prisma/migrations/<timestamp>_phase9_taxonomy/migration.sql`

Logic:
1. Tạo bảng `FinishOption` mới.
2. Tạo bảng trung gian `_FinishOptionToProduct`.
3. Backup `SizeOption` data: tạo bảng temp `_SizeOption_backup`.
4. Alter `SizeOption`: drop `categoryId` FK, drop unique `(name, categoryId)`, add unique `name`.
5. Data backfill: nếu có duplicate name khác category, append " (Mugs)" / " (Beakers)" suffix. Vì hiện tại data ít, manual review qua script là OK.
6. Add `slug` field auto-gen từ name (utility `slugify`).
7. Seed default Finish (script `prisma/seed-finishes.ts` chạy sau migration).

**Seed Finish defaults** (`prisma/seed-finishes.ts`):

```ts
const FINISHES = [
  { name: "Vẽ tay thủ công", slug: "ve-tay-thu-cong", description: "Họa tiết vẽ trực tiếp bằng cọ trên bề mặt gốm.", sortOrder: 1 },
  { name: "Tráng men màu", slug: "trang-men-mau", description: "Phủ lớp men màu, bao gồm cả bóng và mát.", sortOrder: 2 },
  { name: "Tráng men hỏa biến", slug: "trang-men-hoa-bien", description: "Men chảy + hỏa biến, mỗi sản phẩm 1 vẻ duy nhất.", sortOrder: 3 },
  { name: "Khắc/dập nổi & chìm", slug: "khac-dap-noi-chim", description: "Họa tiết tạo bằng kỹ thuật khắc tay hoặc khuôn dập.", sortOrder: 4 },
  { name: "Nung củi", slug: "nung-cui", description: "Nung trong lò củi truyền thống Bát Tràng, tro củi tạo hiệu ứng tự nhiên.", sortOrder: 5 },
];
```

**Migration cho products hiện có:**

Backfill: tất cả product hiện tại gắn finish "Tráng men màu" default. Admin có thể bulk edit lại sau qua admin UI.

```ts
// trong seed-finishes.ts
const defaultFinish = await prisma.finishOption.findUnique({ where: { slug: "trang-men-mau" }});
await prisma.product.updateMany({
  where: { finishes: { none: {} }},
  data: { /* M2M connect không dùng updateMany được, cần loop */ }
});
// Loop từng product, prisma.product.update({ data: { finishes: { connect: [{id: defaultFinish.id}] }}})
```

### 3.3 Schema config (`src/config/site-schema.ts`)

**Section mới `navigation`:**

```ts
{
  id: "navigation",
  label: "Navigation menu",
  description: "Cấu hình menu chính + mega menu CỬA HÀNG",
  fields: [
    {
      key: "topNavItems",
      type: "repeatable",
      label: "Các mục menu chính",
      itemLabel: "Mục menu",
      fields: [
        { key: "label", type: "text", label: "Tên hiển thị", required: true },
        { key: "href", type: "url", label: "Link", required: true },
        { key: "hasMegaMenu", type: "boolean", label: "Có mega menu xổ xuống?", default: false },
        { key: "openInNewTab", type: "boolean", label: "Mở tab mới?", default: false },
      ],
      default: [
        { label: "CỬA HÀNG", href: "/cua-hang", hasMegaMenu: true, openInNewTab: false },
        { label: "KHÁM PHÁ", href: "/discover", hasMegaMenu: false, openInNewTab: false },
        { label: "CỘNG ĐỒNG", href: "/community/nguoi-noi", hasMegaMenu: false, openInNewTab: false },
        { label: "ĐỐI TÁC", href: "/partners", hasMegaMenu: false, openInNewTab: false },
        { label: "HÀNH TRÌNH", href: "/journey", hasMegaMenu: false, openInNewTab: false },
      ],
    },
    {
      key: "megaMenu",
      type: "group",
      label: "Cấu hình mega menu CỬA HÀNG",
      fields: [
        {
          key: "column1",
          type: "group",
          label: "Cột 1 - Danh mục",
          fields: [
            { key: "title", type: "text", label: "Tiêu đề cột", default: "DANH MỤC" },
            { key: "viewAllLabel", type: "text", label: "Text link 'Xem tất cả'", default: "→ Xem tất cả sản phẩm" },
          ],
        },
        {
          key: "column2",
          type: "group",
          label: "Cột 2 - Bộ sưu tập",
          fields: [
            { key: "title", type: "text", label: "Tiêu đề cột", default: "BỘ SƯU TẬP" },
            { key: "viewAllLabel", type: "text", label: "Text link 'Xem tất cả'", default: "→ Xem tất cả BST" },
          ],
        },
        {
          key: "column3",
          type: "group",
          label: "Cột 3 - Hoàn thiện",
          fields: [
            { key: "title", type: "text", label: "Tiêu đề cột", default: "HOÀN THIỆN" },
            { key: "viewAllLabel", type: "text", label: "Text link 'Xem tất cả'", default: "→ Xem tất cả kỹ thuật" },
          ],
        },
        {
          key: "featuredCards",
          type: "repeatable",
          label: "Card nổi bật (tối đa 2)",
          itemLabel: "Card",
          maxItems: 2,
          fields: [
            { key: "title", type: "text", label: "Tiêu đề", required: true },
            { key: "subtitle", type: "text", label: "Phụ đề", required: false },
            { key: "image", type: "image", label: "Ảnh", required: true },
            { key: "href", type: "url", label: "Link đến", required: true },
            { key: "ctaLabel", type: "text", label: "Text CTA", default: "Khám phá" },
          ],
          default: [
            {
              title: "BST Mộc 2026",
              subtitle: "Bộ sưu tập mới nhất",
              image: "",
              href: "/bst/mocc-2026",
              ctaLabel: "Khám phá",
            },
            {
              title: "Bán chạy nhất",
              subtitle: "Top picks",
              image: "",
              href: "/cua-hang?sort=bestsellers",
              ctaLabel: "Xem ngay",
            },
          ],
        },
      ],
    },
  ],
}
```

**Section `hero` upgrade:**

Thêm field `mediaType` + `videoUrl` + `videoPosterUrl` + `videoAutoplay`:

```ts
// Trong section hero hiện tại, thêm:
{ key: "mediaType", type: "select", label: "Loại media", options: [
    { value: "image", label: "Ảnh tĩnh" },
    { value: "video", label: "Video" },
  ], default: "image", required: true },
{ key: "videoUrl", type: "text", label: "URL video (Cloudinary, MP4/WebM)", 
  description: "Chỉ dùng khi mediaType = video. Upload lên Cloudinary trước, paste URL public.",
  showIf: { field: "mediaType", value: "video" } },
{ key: "videoPosterUrl", type: "image", label: "Ảnh poster (fallback mobile + before load)", 
  showIf: { field: "mediaType", value: "video" } },
{ key: "videoAutoplay", type: "boolean", label: "Tự động phát", default: true,
  showIf: { field: "mediaType", value: "video" } },
```

Field type `select` đã có. Add support `showIf` conditional rendering trong FieldRenderer nếu chưa có (check `src/components/admin/customize/FieldRenderer.tsx`). Nếu chưa support `showIf`, render unconditional + để admin tự ignore khi mediaType = image.

### 3.4 Component changes

**`src/components/shared/HeaderClient.tsx`:**

Refactor:
1. Bỏ `submenuMap` hardcode.
2. Đọc `config.navigation` từ `getSiteConfig()` (đã pass qua prop từ server component).
3. Render `topNavItems` repeatable, mỗi item check `hasMegaMenu`.
4. Item có `hasMegaMenu = true` (label === "CỬA HÀNG") → render `<MegaMenu>` component mới.
5. Item khác render simple link.

**`src/components/store/MegaMenu.tsx` (new):**

Props:
```ts
type MegaMenuProps = {
  megaMenuConfig: NavigationConfig["megaMenu"];
  categories: Category[];      // server-side fetch
  collections: Collection[];   // server-side fetch
  finishes: FinishOption[];    // server-side fetch
};
```

Server fetch trong `HeaderClient` parent (Header server component):
```ts
const [categories, collections, finishes] = await Promise.all([
  prisma.category.findMany({ orderBy: { name: "asc" }}),
  prisma.collection.findMany({ orderBy: { name: "asc" }}),
  prisma.finishOption.findMany({ orderBy: { sortOrder: "asc" }}),
]);
```

Render structure:
```tsx
<div className="absolute top-full left-0 w-screen bg-warm-white shadow-lg pt-3" 
     onMouseLeave={...}>
  <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-8">
    {/* Col 1 - Danh mục */}
    <div className="col-span-3">
      <h3 className="font-playfair text-sm tracking-wider mb-4">{column1.title}</h3>
      <ul className="space-y-2">
        {categories.map(cat => (
          <li key={cat.id}>
            <Link href={`/cua-hang/${cat.slug}`} className="hover:text-terracotta">
              {cat.name}
            </Link>
          </li>
        ))}
        <li><Link href="/cua-hang" className="text-terracotta">{column1.viewAllLabel}</Link></li>
      </ul>
    </div>
    
    {/* Col 2 - BST */}
    <div className="col-span-3">{/* similar */}</div>
    
    {/* Col 3 - Hoàn thiện */}
    <div className="col-span-3">
      <h3>{column3.title}</h3>
      <ul>
        {finishes.map(f => (
          <li><Link href={`/cua-hang?finish=${f.slug}`}>{f.name}</Link></li>
        ))}
      </ul>
    </div>
    
    {/* Featured cards */}
    <div className="col-span-3 grid grid-rows-2 gap-3">
      {featuredCards.map(card => (
        <Link href={card.href} className="block group">
          <div className="relative aspect-[4/3]">
            <Image src={card.image} alt={card.title} fill className="object-cover" />
          </div>
          <h4 className="font-playfair mt-2">{card.title}</h4>
          {card.subtitle && <p className="text-sm text-stone-600">{card.subtitle}</p>}
          <span className="text-terracotta">{card.ctaLabel} →</span>
        </Link>
      ))}
    </div>
  </div>
</div>
```

**Mobile mega menu** (collapse accordion):
- Mobile breakpoint (`<lg`): mega menu thành accordion full-width.
- 3 column thành 3 accordion section. Featured cards stack dưới.

**`src/components/store/HomepageSections/HeroSection.tsx`:**

Refactor:
1. Check `hero.mediaType`.
2. Nếu `image`: render `<Image>` như cũ.
3. Nếu `video`: render `<video autoPlay muted loop playsInline poster={posterUrl}>`.
4. CSS `@media (prefers-reduced-motion: reduce)` → fallback poster image, không autoplay.
5. Lazy load consideration: video loading="lazy" attribute không support, nhưng có thể delay set `src` qua intersection observer nếu cần optimize LCP. Phase này skip optimize, giữ basic.

```tsx
{hero.mediaType === "video" && hero.videoUrl ? (
  <>
    <video
      autoPlay={hero.videoAutoplay}
      muted
      loop
      playsInline
      poster={hero.videoPosterUrl}
      className="motion-safe:block motion-reduce:hidden absolute inset-0 w-full h-full object-cover"
    >
      <source src={hero.videoUrl} type="video/mp4" />
    </video>
    <img
      src={hero.videoPosterUrl}
      alt=""
      className="motion-safe:hidden motion-reduce:block absolute inset-0 w-full h-full object-cover"
    />
  </>
) : (
  <Image src={hero.imageUrl} ... />
)}
```

### 3.5 Admin Finish management

**Route mới: `/admin/products/settings`** (đã có cho Color/Size hiện tại, extend thêm Finish section).

UI tương tự pattern Color management:
- Section "HOÀN THIỆN" với list + nút "Thêm mới".
- Form thêm/sửa: name, slug auto-gen (editable), description, imageUrl Cloudinary upload, sortOrder.
- Drag-and-drop reorder dùng `@dnd-kit` (đã có trong project).
- Xóa: confirm modal, kiểm tra products đang gắn finish, nếu có thì cảnh báo cụ thể "X sản phẩm đang dùng kỹ thuật này, vẫn xóa?".

**Product form (`src/components/admin/products/ProductForm.tsx`):**

Thêm field Finish multi-select toggle pills:
```tsx
<div>
  <label>Hoàn thiện (chọn 1-3 kỹ thuật)</label>
  <div className="flex flex-wrap gap-2">
    {allFinishes.map(f => (
      <button
        key={f.id}
        type="button"
        onClick={() => toggleFinish(f.id)}
        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
          selectedFinishIds.includes(f.id)
            ? "bg-deep-indigo text-warm-white"
            : "bg-cream text-deep-indigo hover:bg-sand"
        }`}
      >
        {selectedFinishIds.includes(f.id) && <span>✓ </span>}
        {f.name}
      </button>
    ))}
  </div>
</div>
```

Service layer `product.service.ts` update để handle `finishes: { set: [...ids] }` khi update Product.

### 3.6 Shop filter support Finish

`src/app/(store)/shop/page.tsx` (hoặc rename `cua-hang`):

Add query param `?finish=ve-tay-thu-cong`:
```ts
const finish = searchParams.finish;
const products = await prisma.product.findMany({
  where: {
    visibility: "PUBLIC",
    isActive: true,
    ...(finish && { finishes: { some: { slug: finish }}}),
    ...(category && { category: { slug: category }}),
    ...(collection && { collection: { slug: collection }}),
  },
});
```

Optional: hiển thị filter UI trên shop page (chip Finish, Color, ...). Phase 9 chỉ cần query param work, UI filter có thể defer.

### 3.7 Footer cleanup

`src/components/shared/Footer.tsx`:

Xóa fallback strings line 55-56:
```tsx
// TRƯỚC:
<p>{config.footer.tagline || "Mỗi chiếc cốc là một câu chuyện"}</p>

// SAU:
<p>{config.footer.tagline}</p>
```

Nếu schema không có data, render empty. Schema bắt buộc default value trong site-schema.ts (đã có).

### 3.8 Stub pages handling

**`/partners/stockists`:**
- Tạo DB-driven: model `Stockist` mới (name, address, city, mapUrl, image).
- Admin UI quản lý trong `/admin/website/pages` (Phase 11) hoặc tạm tạo `/admin/stockists` simple list.
- Hiện tại Phase 9 chỉ cần xử lý frontend: nếu DB chưa có data, show "Chúng tôi sẽ sớm hợp tác với các cửa hàng đối tác. Liên hệ để trở thành đối tác." + CTA link `/partners/become-a-stockist`.
- Sau khi có data DB, render grid stockist cards.

Schema thay đổi:
```prisma
model Stockist {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  address     String
  city        String
  mapUrl      String?
  imageUrl    String?
  description String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**`/community/your-stories`:**
- Có thể là kênh nhận user-submitted stories về cốc.
- Phase 9 chỉ cần content placeholder: schema section mới `community.yourStories` với title + intro + CTA submit form (link Telegram hoặc form contact).
- Defer build full submission flow đến phase sau.

**`/checkout`:**
- Lead-gen mode active (`NEXT_PUBLIC_ENABLE_CART=false`).
- Page hiện tại có thể đã có guard redirect. Confirm logic:
  - Nếu `NEXT_PUBLIC_ENABLE_CART !== "true"`: redirect về `/cua-hang` với toast "Liên hệ tư vấn để đặt hàng".
  - Skip mọi UI checkout phức tạp.

### 3.9 Route rename `/shop` → `/cua-hang`

Cập nhật:
- Move folder `src/app/(store)/shop/` → `src/app/(store)/cua-hang/`.
- Update mọi internal link từ `/shop` sang `/cua-hang`.
- Add redirect `next.config.ts`:
  ```ts
  { source: "/shop", destination: "/cua-hang", permanent: true },
  { source: "/shop/:path*", destination: "/cua-hang/:path*", permanent: true },
  ```
- Update sitemap.xml generator.

## 4. Acceptance criteria

### 4.1 Database

- [ ] `SizeOption.categoryId` đã drop, unique constraint mới là `name` + `slug`.
- [ ] `FinishOption` table tồn tại với 5 default rows.
- [ ] `_FinishOptionToProduct` M2M table tồn tại.
- [ ] Tất cả products hiện có gắn finish "Tráng men màu" sau migration.
- [ ] Không có data loss (count products trước = sau).

### 4.2 Schema config

- [ ] Section `navigation` xuất hiện trong `/admin/customize` page.
- [ ] Default `topNavItems` có 5 mục, "CỬA HÀNG" có `hasMegaMenu = true`.
- [ ] Default `megaMenu.featuredCards` có 2 entry placeholder.
- [ ] Section `hero` có 4 field video mới (mediaType, videoUrl, videoPosterUrl, videoAutoplay).

### 4.3 Storefront

- [ ] Header desktop hover vào "CỬA HÀNG" → mega menu 3 col + 2 featured card hiện ra.
- [ ] Cột 1 list categories từ DB (Cốc có quai, Cốc không quai, ...).
- [ ] Cột 2 list collections từ DB (BST nào tồn tại).
- [ ] Cột 3 list 5 finishes từ DB.
- [ ] Click vào item Finish → URL `/cua-hang?finish=<slug>` filter đúng.
- [ ] Click vào featured card → đi đến link config.
- [ ] Mobile (`<lg`): mega menu thành accordion.
- [ ] Hover bridge OK (mouse di chuột nhanh không mất menu) - giữ pattern `pt-3` từ hotfix.
- [ ] Set `hero.mediaType = video`, paste URL video Cloudinary → Hero render video autoplay loop.
- [ ] prefers-reduced-motion: video bị thay bằng poster image static.

### 4.4 Admin

- [ ] `/admin/products/settings` có section "HOÀN THIỆN" với CRUD.
- [ ] Thêm/sửa/xóa Finish hoạt động.
- [ ] Drag reorder Finish lưu đúng `sortOrder`.
- [ ] Product form thấy toggle pills 5 finish.
- [ ] Tạo/sửa product chọn 1-3 finish, save persist đúng M2M.

### 4.5 Route + redirects

- [ ] Truy cập `/shop` redirect 301 → `/cua-hang`.
- [ ] Truy cập `/shop/coc-mộc-001` redirect 301 → `/cua-hang/coc-mộc-001`.
- [ ] Sitemap.xml chứa URL `/cua-hang/*` đúng.
- [ ] Mega menu link mặc định trỏ `/cua-hang/*` (không `/shop/*`).

### 4.6 Cleanup

- [ ] Footer không còn fallback hardcode string.
- [ ] `/partners/stockists` render placeholder hoặc data thật, không lỗi.
- [ ] `/community/your-stories` render placeholder OK.
- [ ] `/checkout` redirect về `/cua-hang` khi cart disabled.

### 4.7 Build + performance

- [ ] `npm run build` pass.
- [ ] `tsc --noEmit` pass.
- [ ] Lighthouse mobile home page: LCP < 2.5s (nếu hero video).
- [ ] No console errors.

## 5. Migration order (deployment)

1. Tạo branch `feat/phase9-nav-finish-hero` từ master.
2. Code change theo thứ tự:
   - Prisma schema migration.
   - Run migration script local (sqlite dev).
   - Seed Finish defaults.
   - Backfill product finishes.
   - Schema config additions.
   - Component refactor (HeaderClient, MegaMenu, HeroSection).
   - Admin UI Finish CRUD.
   - Route rename + redirects.
   - Footer + stub cleanup.
3. Commit per logical unit (5-7 commits).
4. Test local end-to-end.
5. Push branch, mở PR.
6. Verify Antigravity self-test pass.
7. Em review PR diff.
8. Merge master → Vercel auto-rebuild.
9. Verify production cocnoi.com.

## 6. Out of scope (defer)

- **Bilingual EN/VN** (Phase 12).
- **Sub-category routes `/cua-hang/[category]`**: Phase 10 sẽ làm. Phase 9 chỉ rename `/shop` → `/cua-hang` flat structure, query param filter.
- **BST detail page template `/bst/[slug]`**: Phase 10.
- **Filter UI chip trên shop page**: chỉ cần query param work, UI defer.
- **Admin Stockist full CRUD UI**: Phase 11.
- **`/community/your-stories` submission flow**: Phase 11.
- **Video optimization** (lazy load via IntersectionObserver, multi-format source): basic OK cho Phase 9.

## 7. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Size migration mất data | Backup table trước, dry-run trên dev DB. Có rollback script. |
| Route rename `/shop` → `/cua-hang` break external link, SEO | 301 redirect permanent + update sitemap. Email khách có link cũ vẫn work. |
| Mega menu performance (3 queries Prisma trên mỗi page load) | Cache với React.cache() hoặc unstable_cache 5 phút. Header là server component, không re-fetch mỗi navigation. |
| Video file lớn ảnh hưởng LCP | Optional Phase 10 optimize. Phase 9 chấp nhận LCP tăng nhẹ, document. |
| Schema additions break existing customize page | Reader (`getSiteConfig`) đã có default merge logic từ Phase 4a. Test on dev DB không có data navigation, expect default render đúng. |

## 8. Estimated effort breakdown

| Việc | Time |
|---|---|
| Prisma schema + migration + seed | 3h |
| Migration script + backfill product finishes | 2h |
| Schema config additions (navigation + hero video) | 3h |
| HeaderClient refactor + MegaMenu component | 5h |
| Mobile menu accordion responsive | 2h |
| HeroSection video support + reduced-motion | 4h |
| Admin Finish CRUD UI | 3h |
| Product form toggle pills Finish | 1h |
| Route rename `/shop` → `/cua-hang` + redirects | 2h |
| Footer fallback cleanup | 0.5h |
| Stub pages handle (stockists, your-stories, checkout) | 2h |
| Build + manual test E2E | 1.5h |
| **Tổng** | **29h** |

## 9. Handoff cho Antigravity

Spec này đủ chi tiết để chạy. Antigravity có thể tự:
1. Tạo branch.
2. Implement theo thứ tự section 5.
3. Run test local.
4. Push PR.

Sau khi PR sẵn sàng, Cowork (em) sẽ:
1. Verify diff bằng `git show` (mount cached stale, ưu tiên git CLI).
2. Review acceptance criteria checklist.
3. Test thử mega menu + hero video trên local nếu cần.
4. Approve hoặc gửi feedback cụ thể.

## 10. Default schema seed JSON (Antigravity reference)

```json
{
  "navigation": {
    "topNavItems": [
      { "label": "CỬA HÀNG", "href": "/cua-hang", "hasMegaMenu": true, "openInNewTab": false },
      { "label": "KHÁM PHÁ", "href": "/discover", "hasMegaMenu": false, "openInNewTab": false },
      { "label": "CỘNG ĐỒNG", "href": "/community/nguoi-noi", "hasMegaMenu": false, "openInNewTab": false },
      { "label": "ĐỐI TÁC", "href": "/partners", "hasMegaMenu": false, "openInNewTab": false },
      { "label": "HÀNH TRÌNH", "href": "/journey", "hasMegaMenu": false, "openInNewTab": false }
    ],
    "megaMenu": {
      "column1": { "title": "DANH MỤC", "viewAllLabel": "→ Xem tất cả sản phẩm" },
      "column2": { "title": "BỘ SƯU TẬP", "viewAllLabel": "→ Xem tất cả BST" },
      "column3": { "title": "HOÀN THIỆN", "viewAllLabel": "→ Xem tất cả kỹ thuật" },
      "featuredCards": [
        {
          "title": "BST Mộc 2026",
          "subtitle": "Bộ sưu tập mới nhất",
          "image": "",
          "href": "/bst/moc-2026",
          "ctaLabel": "Khám phá"
        },
        {
          "title": "Bán chạy nhất",
          "subtitle": "Top picks",
          "image": "",
          "href": "/cua-hang?sort=bestsellers",
          "ctaLabel": "Xem ngay"
        }
      ]
    }
  }
}
```

---

**End of Phase 9 spec.**
