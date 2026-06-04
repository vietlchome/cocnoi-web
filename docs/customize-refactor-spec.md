# Spec — Refactor hệ thống Customize/Theme Settings

**Mục tiêu tổng:** Tách rời 3 lớp (storefront ↔ schema ↔ database) để backend không vỡ khi frontend redesign, và để thêm/đổi setting chỉ phải sửa 1 file.

**Người thực thi:** Antigravity. Mỗi Phase là 1 PR độc lập, có thể test và merge riêng.

**Nguyên tắc bắt buộc:**

- Không bao giờ break backward compatibility giữa các phase.
- Mọi default value sống trong schema, không hardcode trong storefront.
- Mỗi PR phải kèm note "Cách verify" — Việt sẽ chạy lại để duyệt.

---

## Phase 1 — Schema Foundation + Typed Reader

**Mục tiêu:** Có cây cầu schema và reader. Chưa đụng vào admin form, chưa đụng vào storefront. Code cũ vẫn chạy bình thường sau PR này.

### Files tạo mới

**`src/config/site-schema.ts`**

Khai báo toàn bộ setting hiện có dưới dạng object phân cấp theo section. Mỗi field có:

- `type`: một trong `text | textarea | url | image | boolean | select | color | group | repeatable | icon-picker`
- `default`: giá trị mặc định
- `label`: nhãn hiển thị trong admin form (tiếng Việt)
- `helpText` (optional): mô tả ngắn cho admin
- `aliases` (optional): mảng key cũ — để reader đọc được data lưu trước refactor
- Với `select`: thêm `options: [{value, label}]`
- Với `image`: thêm `aspectRatio`, `folder`
- Với `repeatable`: thêm `min`, `max`, `itemSchema`
- Với `group`: thêm `fields`

Phải khai báo đủ 10 section hiện có trong `SiteCustomizerClient.tsx` (mục 1–10).

Ví dụ shape (không phải code đầy đủ, chỉ minh họa):

```ts
hero: {
  label: "Hero Banner",
  fields: {
    badge: { type: "text", default: "...", aliases: ["hero_badge_text"] },
    title: { type: "text", default: "...", aliases: ["hero_title"] },
    ctaPrimary: {
      type: "group",
      fields: {
        text: { type: "text", default: "Khám phá Cửa Hàng", aliases: ["hero_cta_text"] },
        url: { type: "url", default: "/shop" }
      }
    },
    // ...
  }
}
```

Với mục 6 (Giá trị Cốt lõi), chuyển `value_1_title..value_4_title` thành `items: { type: "repeatable", aliases: ["value_1_title", ...] }` — reader sẽ đọc 4 key cũ và gộp thành mảng. Tương tự với mục 5 (intro_feat_1..4_img_url).

**`src/lib/site-config.ts`**

Hàm `getSiteConfig()`:

1. Gọi `SettingsService.getAllSettings()` → flat `Record<string,string>`.
2. Với mỗi section trong schema:
   - Đọc key mới `section.{sectionName}` (JSON blob). Nếu có, parse.
   - Nếu không có, thử đọc các `aliases` (key cũ flat) → tự gộp về object section.
   - Merge với default từ schema.
   - Parse JSON cho field type `repeatable` nếu cần.
3. Trả về object đã typed (dùng TypeScript inferred type từ schema — nên dùng `as const` + helper type).

Hàm phải tolerant: data lỗi, JSON sai → fallback về default, log warning, không throw.

**`src/lib/site-config-validate.ts`**

Schema validator dùng zod. Mỗi field type có rule riêng (url phải hợp lệ, image phải là string non-empty hoặc rỗng, boolean phải là "true"/"false"). Hàm `validateSiteConfig(data)` trả về `{ valid, errors }`. Chưa dùng trong Phase này, chuẩn bị cho Phase 3.

### Files KHÔNG đụng

- `SiteCustomizerClient.tsx` (giữ nguyên)
- `src/app/(store)/page.tsx` (giữ nguyên)
- `SettingsService` (giữ nguyên)
- Prisma schema (không migration)

### Cách verify

1. Tạo file test `src/lib/__tests__/site-config.test.ts` (hoặc script trong `scripts/`) chạy `getSiteConfig()` trên DB hiện tại và in ra cây config.
2. Đảm bảo mọi key cũ đọc được qua aliases (vd `config.hero.title` ra đúng giá trị `hero_title` trong DB).
3. Storefront `/` vẫn render giống hệt trước khi merge PR này (chưa đổi gì).

### Non-goals Phase 1

- Không đổi admin form.
- Không đổi storefront.
- Không xóa key cũ trong DB.
- Không thêm field mới.

---

## Phase 2 — Storefront chuyển sang dùng `getSiteConfig()`

**Mục tiêu:** Mọi nơi trong `(store)/*` đọc setting qua `config.section.field`, bỏ pattern `getSetting("key", "fallback")`. Không thay đổi giao diện.

### Files đụng

- `src/app/(store)/page.tsx` — section nhiều nhất, đổi từng section một.
- `src/components/shared/Header.tsx` — đọc `config.header.*`.
- `src/components/shared/Footer.tsx` — đọc `config.footer.*`, `config.social.*`.
- `src/components/store/FloatingActions.tsx` — đọc `config.social.zalo`.
- `src/app/layout.tsx` (nếu có meta) — đọc `config.seo.title/description/keywords` cho `<head>`.

### Quy tắc

- Xóa toàn bộ `getSetting(key, fallback)` cục bộ. Default đã nằm trong schema.
- Không xóa key cũ trong DB. Aliases đảm bảo đọc được.
- Render output phải BYTE-IDENTICAL với trước PR. Kiểm bằng screenshot diff hoặc `curl` HTML 2 bản.

### Cách verify

1. Trước PR: `pnpm dev`, vào `/`, F12 → save HTML.
2. Sau PR: làm lại, diff 2 file HTML. Chỉ khác về whitespace/attribute order là OK.
3. Test các page: `/`, `/shop`, `/faq`, `/about`. Không page nào vỡ.

### Non-goals Phase 2

- Không refactor admin form.
- Không thêm field hay section mới.
- Không đổi visual.

---

## Phase 3 — Admin Form auto-generated từ schema

**Mục tiêu:** `SiteCustomizerClient.tsx` không hardcode field nữa. UI render từ `SITE_SCHEMA`. Thêm field mới = sửa schema duy nhất.

### Files tạo mới

**`src/components/admin/customize/FieldRenderer.tsx`** — 1 component switch theo `field.type`:

- `text` → `<input>`
- `textarea` → `<textarea>`
- `url` → `<input type="url">` + validate format
- `image` → reuse `ImageCropUploader`
- `boolean` → toggle switch (không phải checkbox xấu hiện tại)
- `select` → `<select>` từ `field.options`
- `color` → swatch (read-only, lock như hiện tại với BRAND_COLORS)
- `group` → render nested fields lồng nhau
- `repeatable` → list có nút Add/Remove + drag-to-reorder
- `icon-picker` → grid lucide icons có search

**`src/components/admin/customize/SectionEditor.tsx`** — render 1 section: lặp qua `fields` của section, gọi `<FieldRenderer>` cho từng field.

**`src/components/admin/customize/RepeatableEditor.tsx`** — UI cho mảng items: card collapse được, drag handle, nút xóa, nút "+ Thêm".

### Files refactor

**`src/components/admin/settings/SiteCustomizerClient.tsx`** — viết lại từ đầu, ngắn gọn:

```tsx
{Object.entries(SITE_SCHEMA).map(([key, section]) => (
  <AccordionSection key={key} label={section.label} icon={section.icon}>
    <SectionEditor
      schema={section.fields}
      value={data[key]}
      onChange={(v) => updateSection(key, v)}
    />
  </AccordionSection>
))}
```

Mục tiêu: file này dưới 150 dòng.

**`src/lib/actions/settings.actions.ts`** — `updateSettingsAction`:

1. Nhận object phân cấp (per-section).
2. Validate qua zod (`validateSiteConfig` từ Phase 1).
3. Lưu mỗi section dạng JSON string vào key `section.{name}` (key mới).
4. Trả `{ success, errors: { field: msg } }` để form hiển thị inline error.

### Migration data

**`scripts/migrate-settings-to-sections.ts`** — script chạy 1 lần:

1. Đọc toàn bộ row cũ trong `ThemeSetting`.
2. Dùng aliases trong schema để gộp về section JSON.
3. Ghi key mới `section.{name}` = JSON blob.
4. KHÔNG xóa key cũ (giữ làm backup, có thể cleanup ở Phase sau khi yên tâm).

Script phải idempotent — chạy nhiều lần không hỏng data.

### Xóa code chết

- Xóa `src/components/admin/settings/HomepageCustomizerClient.tsx` (không nơi nào import).

### Cách verify

1. Chạy migration script trên local DB.
2. Mở `/admin/customize`, mọi field đều có data đúng.
3. Sửa 1 field bất kỳ, lưu, F5 → giá trị đúng.
4. Mở `/` → render giống trước (vì Phase 2 đã dùng reader, reader đọc cả key mới lẫn aliases).
5. Test edge: paste meta description 1000 ký tự → form báo lỗi inline, không sập.

### Non-goals Phase 3

- Chưa thêm section mới hay field mới (làm ở Phase 4).
- Chưa làm draft/preview.

---

## Phase 4 — Bổ sung field & section còn thiếu

**Mục tiêu:** Thêm các thứ tôi đã chỉ ra trong review (xem `customize-review-notes.md` nếu cần). Mỗi mục là 1 commit riêng trong cùng PR (hoặc tách PR nhỏ).

### 4.1. Mục Header

Thêm vào schema.header:
- `topBar.link` (url) — click vào top bar đi đâu
- Cross-reference (helpText): "Quản lý menu chính tại /admin/website/navigation"

### 4.2. Mục Hero — CTA URLs

Đổi `hero.ctaPrimary` và `hero.ctaSecondary` thành group `{text, url}`. Đã có trong schema Phase 1 — Phase 4 chỉ cần thêm URL vào storefront render.

### 4.3. Mục Campaign — CTA

Thêm `campaign.cta: { type: "group", fields: { text, url } }`. Storefront render thêm button bên dưới quote.

### 4.4. Mục Sản phẩm Nổi bật — Manual Picker (ƯU TIÊN)

Khi `featured_products_type === "manual"`:
- Field mới `featured_products_manual_ids`: `type: "product-picker"` (component mới).
- `ProductPickerField.tsx`: modal hiển thị danh sách sản phẩm từ API `/api/admin/products?published=true`, search được, multi-select, drag-to-reorder thứ tự hiển thị, lưu mảng ID.
- Storefront đã có logic đọc `featured_products_manual_ids` (kiểm tra trong `page.tsx`) — chỉ cần đảm bảo schema key match.

Thêm các field:
- `featured_products.count` (number, default 8)
- `featured_products.visible` (boolean, default true)
- `featured_products.viewAllUrl` (url, default `/shop`)

### 4.5. Mục Story — chuyển ảnh sang repeatable

`intro.features` = `repeatable` thay cho `intro_feat_1..4_img_url`. Mỗi item: `{ image, alt, caption? }`. Thêm `alt` để SEO không chết.

Thêm 2 stat nữa (4 stats tổng) hoặc convert thành repeatable.

### 4.6. Mục Giá trị Cốt lõi — repeatable + icon

`values.items` = `repeatable` (đã set up Phase 1). Mỗi item: `{ title, desc, icon }`. Min 2, max 8. Icon picker chọn từ lucide-react.

### 4.7. Mục FAQ — drag reorder + collapse

`RepeatableEditor` đã hỗ trợ drag (Phase 3). Cần thêm: mỗi FAQ item mặc định collapsed (chỉ hiện câu hỏi), bấm vào expand.

### 4.8. Mục Footer — thông tin pháp lý VN

Thêm vào `footer`:
- `legal.businessName` (text) — Tên công ty đầy đủ
- `legal.taxId` (text) — Mã số thuế (MST)
- `legal.businessLicense` (text) — Số ĐKKD
- `legal.licensedBy` (text) — Cơ quan cấp
- `columns` (repeatable) — các cột link footer: `{ title, links: repeatable {label, url} }`
- `hours` (text) — Giờ hoạt động

Lưu ý: Nghị định 52/2013 yêu cầu hiển thị thông tin doanh nghiệp trên website ecom.

### 4.9. Mục Mạng xã hội — chuyển sang repeatable

`social.links` = `repeatable`. Item: `{ platform: select [facebook, instagram, tiktok, youtube, zalo, shopee, lazada, threads], url, visible }`. Bỏ 3 field cứng FB/IG/Zalo (giữ aliases để migration).

### 4.10. Mục SEO — bỏ keywords, thêm cái thực sự cần

Schema `seo`:
- Bỏ `keywords` khỏi UI (Google không dùng từ 2009). Giữ key trong DB cho legacy.
- Thêm `ogImage` (image, aspectRatio 1200/630, folder "theme/og") — quan trọng cho share FB/Zalo.
- Thêm `ogImageAlt` (text)
- Thêm `favicon` (image, aspectRatio 1)
- Thêm `analytics.googleId` (text) — GA4 measurement ID
- Thêm `analytics.facebookPixelId` (text)
- Thêm `analytics.tiktokPixelId` (text)
- Thêm `robots.indexable` (boolean) — bật/tắt cho phép index (hữu ích khi test)

Tách section "SEO/Analytics" và "Brand Colors" thành 2 accordion riêng.

### 4.11. Section visibility & order

Thêm field meta cấp top:
- `homepage.sections` (repeatable, items = select section name) — quyết định section nào hiện, thứ tự ra sao.
- Default: `["hero", "campaign", "products", "story", "values", "faq"]`.

Storefront `(store)/page.tsx` đọc mảng này, render theo thứ tự, ẩn section không có trong mảng.

### Cách verify Phase 4

Mỗi mục có 2 test:
1. Vào `/admin/customize`, sửa field, lưu, xem `/` cập nhật.
2. Field validate đúng (URL sai báo lỗi, số ngoài range báo lỗi).

---

## Phase 5 (Optional) — Draft / Preview / Publish

**Khi nào làm:** Sau khi Phase 1–4 ổn định ít nhất 2 tuần.

### Thay đổi schema Prisma

```prisma
model ThemeSetting {
  key         String  @id
  value       String  // published
  draftValue  String? // draft
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
}
```

### Flow

1. Admin sửa field → "Lưu nháp" (draft) hoặc "Xuất bản" (publish).
2. URL `/?preview=true&token=xxx` đọc `draftValue`, các URL khác đọc `value`.
3. Nút "So sánh draft vs live" trong admin.
4. Nút "Hoàn tác" lấy `value` đè vào `draftValue`.

### Cách verify

1. Sửa hero title, lưu nháp.
2. Mở `/` ẩn danh → vẫn title cũ.
3. Mở `/?preview=true&token=...` → title mới.
4. Bấm "Xuất bản" → cả 2 URL đều ra title mới.

---

## Checklist tổng cho Antigravity

Trước khi mark Phase nào là done, đảm bảo:

- [ ] `pnpm build` không lỗi.
- [ ] `pnpm lint` clean.
- [ ] TypeScript strict, không `any` ngoài chỗ thực sự cần (đã có chỗ dùng `any` trong code cũ — phase này không phải dịp dọn, để TODO).
- [ ] Test bằng tay: `/`, `/admin/customize`, `/shop`, `/faq`.
- [ ] Note rõ trong PR description: phase nào, breaking change gì (mặc định: không), cách verify.

## Thứ tự khuyến nghị

1. Phase 1 (foundation) — 1–2 ngày.
2. Phase 2 (storefront migration) — 1 ngày.
3. Phase 3 (admin auto-gen) — 2–3 ngày.
4. Phase 4 (missing features) — chia nhỏ, mỗi mục 0.5–1 ngày, làm dần.
5. Phase 5 (draft/publish) — 2 ngày, optional.

Không nhảy Phase. Mỗi Phase merge xong mới qua Phase tiếp.
