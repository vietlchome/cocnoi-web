# Phase 4a — Compliance & Launch Prep

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau khi Phase 3b merged).
**Branch name:** `feature/phase-4a-compliance-seo`.

**Mục tiêu:** Bổ sung field bắt buộc để website đủ điều kiện công khai — thông tin pháp lý Nghị định 52, SEO/OG image cho share mạng xã hội, analytics tracking. Cleanup 2 schema items tiện dịp.

---

## 0. Bối cảnh

Phase 3a + 3b đã merge. Admin form auto-generate từ `SITE_SCHEMA` qua library. Thêm field mới = sửa 1 file `site-schema.ts` + thêm key vào zod validator + storefront đọc qua `getSiteConfig()`. Migration tự động vì reader tolerant.

Phase 4a thêm 4 nhóm thay đổi:
1. **Footer Legal VN** (compliance — Nghị định 52/2013/NĐ-CP về thương mại điện tử)
2. **SEO/OG Analytics** (share FB/Zalo, tracking conversion)
3. **FAQ json → repeatable** (cleanup)
4. **Footer → Contact namespace rename** (cleanup schema)

---

## 1. Scope Phase 4a (strict)

**Files được phép sửa:**
- `src/config/site-schema.ts` — thêm field/section mới, đổi type
- `src/lib/site-config-validate.ts` — thêm zod rules
- `src/lib/site-config.ts` — reader handle backward compat cho rename + json→repeatable
- `src/app/(store)/page.tsx`, `Header.tsx`, `Footer.tsx`, `FloatingActions.tsx`, `(store)/contact/page.tsx`, `layout.tsx` — render field mới + đọc namespace mới
- `src/app/(store)/faq/page.tsx` (hoặc nơi nào render FAQ) — đọc repeatable mới
- `docs/customize-refactor-tasks.md` — update status

**Cấm động:**
- `src/components/admin/customize/**` (library Phase 3a) — schema-driven nên không cần đụng
- `src/components/admin/settings/SiteCustomizerClient.tsx` — auto-render từ schema
- `src/lib/actions/settings.actions.ts` — không đổi action signature
- `src/lib/services/settings.service.ts`
- `prisma/schema.prisma`
- Library Phase 3a + sandbox

**Test bằng:** mở `/admin/customize`, các field mới hiện ra TỰ ĐỘNG vì admin form đọc từ `SITE_SCHEMA`. Đây là validation của toàn bộ refactor — nếu thêm field mà phải sửa admin → refactor thất bại.

---

## 2. Detailed task breakdown

### 2.1. Footer Legal (Nghị định 52)

**File:** `src/config/site-schema.ts`

Thêm vào section `footer` (sẽ rename ở §2.4 — nhưng làm legal trước, rename sau trong cùng PR):

```ts
legal: {
  type: "group",
  label: "Thông tin pháp lý (NĐ52)",
  fields: {
    businessName: { type: "text", label: "Tên doanh nghiệp đầy đủ", default: "", helpText: "Theo Giấy chứng nhận ĐKKD" },
    taxId: { type: "text", label: "Mã số thuế (MST)", default: "", helpText: "10 hoặc 13 chữ số" },
    businessLicense: { type: "text", label: "Số Giấy chứng nhận ĐKKD", default: "" },
    licensedBy: { type: "text", label: "Cơ quan cấp phép", default: "", helpText: "VD: Sở KH&ĐT TP. Hà Nội" },
    licensedDate: { type: "text", label: "Ngày cấp", default: "", helpText: "DD/MM/YYYY" },
    hours: { type: "text", label: "Giờ hoạt động", default: "8:00 - 18:00 (T2-T7)" }
  }
}
```

**Zod validator:**

```ts
// site-config-validate.ts trong footer schema
legal: z.object({
  businessName: textValidator,
  taxId: z.string().regex(/^(\d{10}|\d{13}|)$/, "MST phải là 10 hoặc 13 chữ số (hoặc để trống)"),
  businessLicense: textValidator,
  licensedBy: textValidator,
  licensedDate: textValidator,
  hours: textValidator,
}),
```

**Storefront render:** Trong `Footer.tsx`, thêm 1 block "Thông tin pháp lý" ở column footer phù hợp (Antigravity tự chọn layout). Bắt buộc hiển thị:
- "© {year} {legal.businessName} — MST: {legal.taxId}"
- "GCN ĐKKD: {legal.businessLicense} do {legal.licensedBy} cấp ngày {legal.licensedDate}"
- "Giờ hoạt động: {legal.hours}"

Chỉ render nếu field có giá trị (`!== ""`). Nếu owner để trống = không hiện = không vi phạm rỗng.

### 2.2. SEO / OG / Analytics

**File:** `src/config/site-schema.ts`

Refactor section `seo`:

```ts
seo: {
  label: "SEO & Analytics",
  fields: {
    siteTitle: { type: "text", label: "Meta Title", default: "Cốc Nối · Gốm thủ công Bát Tràng", aliases: ["site_title"] },
    siteDescription: { type: "textarea", label: "Meta Description", default: "Kết tình thân, Nối tinh thần. Cốc gốm thủ công từ xưởng gia đình tại Bát Tràng từ 1994.", aliases: ["site_description"] },
    // BỎ siteKeywords khỏi UI nhưng giữ alias để legacy DB không vỡ
    ogImage: { type: "image", label: "Ảnh chia sẻ (OG Image)", default: "", aspectRatio: 1200/630, folder: "theme/og", helpText: "1200x630px. Hiện khi share lên Facebook/Zalo." },
    ogImageAlt: { type: "text", label: "Mô tả OG image", default: "", helpText: "Alt text cho ảnh share, hỗ trợ screen reader" },
    favicon: { type: "image", label: "Favicon", default: "", aspectRatio: 1, folder: "theme/favicon", helpText: "PNG vuông, tối thiểu 32x32" },
    robotsIndexable: { type: "boolean", label: "Cho phép Google index", default: true, helpText: "Tắt khi đang test, bật khi public" },
  }
},
analytics: {
  label: "Tracking & Analytics",
  fields: {
    googleAnalyticsId: { type: "text", label: "Google Analytics 4 ID", default: "", helpText: "G-XXXXXXXXXX" },
    facebookPixelId: { type: "text", label: "Facebook Pixel ID", default: "", helpText: "Chuỗi 15-16 chữ số" },
    tiktokPixelId: { type: "text", label: "TikTok Pixel ID", default: "", helpText: "Chuỗi alphanumeric" },
  }
}
```

**Lưu ý:** `siteKeywords` xóa khỏi schema → admin form không hiện field này nữa. Nhưng DB vẫn còn key cũ `site_keywords`. **Không xóa key trong DB.** Reader `getSiteConfig()` không đọc nó nữa (không có trong schema → không trong output type) — đây là behavior đúng.

**Zod validator:** Thêm `analytics` section. GA ID nên match `/^G-[A-Z0-9]+$/`, FB Pixel `/^\d{15,16}$/` — nhưng cho phép empty string. Image `ogImage`/`favicon` reuse `imageValidator`.

**Storefront:**
- `layout.tsx`: render `<meta property="og:image">`, `<meta name="robots">` theo `seo.robotsIndexable`, `<link rel="icon">` cho favicon.
- `<Script>` tag GA4 + FB Pixel + TikTok Pixel ở `layout.tsx` — load conditional `if (id !== "")`.

**Cảnh báo Antigravity:** Pixel/Analytics scripts là **third-party scripts**, dùng `next/script` với `strategy="afterInteractive"` để không block render. KHÔNG inline trong `<head>`.

### 2.3. FAQ json → repeatable

**File:** `src/config/site-schema.ts`

Thay 2 field hiện tại:

```ts
// BEFORE
itemsRetail: { type: "json", label: "Danh sách B2C", default: [...], aliases: ["faq_items"] },
itemsB2b: { type: "json", label: "Danh sách B2B", default: [...], aliases: ["faq_items_b2b"] },

// AFTER
itemsRetail: {
  type: "repeatable",
  label: "Câu hỏi - Khách lẻ (B2C)",
  default: [/* same default as before */],
  itemSchema: {
    question: { type: "text", label: "Câu hỏi", default: "" },
    answer: { type: "textarea", label: "Trả lời", default: "" }
  },
  aliases: ["faq_items"]
},
itemsB2b: {
  type: "repeatable",
  label: "Câu hỏi - Doanh nghiệp (B2B)",
  default: [/* same default as before */],
  itemSchema: {
    question: { type: "text", label: "Câu hỏi", default: "" },
    answer: { type: "textarea", label: "Trả lời", default: "" }
  },
  aliases: ["faq_items_b2b"]
}
```

**Reader compat:** `site-config.ts` `resolveField` hiện chưa handle case "alias là JSON string của một mảng → repeatable items". Cần thêm logic:

```ts
// Trong resolveField, sau check sectionBlob:
if (fieldDef.type === 'repeatable' && fieldDef.aliases) {
  for (const alias of fieldDef.aliases) {
    if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
      try {
        const parsed = JSON.parse(dbSettings[alias]);
        if (Array.isArray(parsed)) return parsed;
      } catch {}
    }
  }
}
// Tiếp tục với aliasGroups logic cũ (cho các repeatable dùng flat keys)
```

**Zod validator:** Đổi `itemsRetail: z.array(z.any())` → `z.array(z.object({ question: z.string(), answer: z.string() }))`.

**Storefront FAQ render:** Update `faq/page.tsx` (hoặc component nào render FAQ) — đổi từ `item.question/answer` ban đầu nếu cần. Field name `question`/`answer` giữ nguyên, không break.

### 2.4. Rename footer.address/phone/email → contact.*

**File:** `src/config/site-schema.ts`

Tạo section mới `contact`, MOVE 3 field từ `footer`:

```ts
contact: {
  label: "Thông tin liên hệ",
  fields: {
    address: { type: "text", label: "Địa chỉ", default: "", aliases: ["contact_address"], helpText: "Hiển thị ở Footer + trang Liên hệ" },
    phone: { type: "text", label: "Điện thoại", default: "", aliases: ["contact_phone"] },
    email: { type: "text", label: "Email", default: "", aliases: ["contact_email"] },
  }
},
footer: {
  label: "Footer",
  fields: {
    // ❌ XÓA: address, phone, email
    newsletterTitle: { ... },
    newsletterDesc: { ... },
    copyright: { ... },
    legal: { ... }  // từ §2.1
  }
}
```

**Backward compat:** Aliases trong section mới `contact` đảm bảo đọc được key cũ. Người dùng đã save section blob `section.footer` cũ (có address/phone/email) — sẽ KHÔNG match `section.contact` mới. Cần migration handler:

Trong `site-config.ts` resolveField, cho field `contact.address`:
1. Đọc blob `section.contact` (mới) — nếu có, dùng.
2. Nếu không, đọc blob `section.footer` (cũ) — nếu có `address` key trong đó, dùng.
3. Nếu không, đọc aliases `contact_address`.
4. Fallback default.

Logic mới thêm vào reader (chỉ áp dụng cho 3 field này):

```ts
// Trong getSiteConfig sau khi đọc sectionBlob 'contact':
if (sectionName === 'contact' && !sectionBlob) {
  // Fallback đọc từ section.footer cũ
  const footerBlob = dbSettings['section.footer'] ? JSON.parse(dbSettings['section.footer']) : null;
  if (footerBlob) {
    sectionBlob = {
      address: footerBlob.address,
      phone: footerBlob.phone,
      email: footerBlob.email,
    };
  }
}
```

**Storefront:** Update `Footer.tsx`, `FloatingActions.tsx`, `(store)/contact/page.tsx` đọc `config.contact.address` thay vì `config.footer.address`.

**Migration script:** Không cần riêng. Lần save tiếp theo trong admin → blob mới `section.contact` được tạo + blob `section.footer` mất 3 field cũ. Backward compat đảm bảo storefront vẫn đọc đúng cả 2 trạng thái.

---

## 3. Verify checklist

1. `pnpm build` pass.
2. `pnpm lint` clean.
3. `npx tsc --noEmit` clean.
4. **KHÔNG sửa file nào trong `src/components/admin/customize/` hoặc `SiteCustomizerClient.tsx`** — nếu cần sửa = refactor Phase 3 đã thất bại.
5. Vào `/admin/customize`:
   - Field mới `footer.legal.*` hiện ra trong accordion footer.
   - Section mới `contact` xuất hiện trong accordion (10 → 11 sections).
   - Section mới `analytics` xuất hiện.
   - Field cũ `address/phone/email` không còn trong accordion `footer`.
   - Field cũ `siteKeywords` không còn trong UI.
   - FAQ `itemsRetail`/`itemsB2b` hiện dạng repeatable (nút + Thêm, Xóa, ↑↓).
6. Save 1 field bất kỳ (vd `contact.email` = "test@cocnoi.vn") → reload → giữ giá trị.
7. Test backward compat:
   - Reset DB về trước migration (hoặc dùng DB của test env có data cũ flat keys).
   - Mở `/admin/customize` → `contact.address` hiện ra giá trị từ key cũ `contact_address`.
   - Save → blob mới `section.contact` tạo, key cũ vẫn còn.
8. Storefront test:
   - `/` không vỡ. Footer hiện legal info nếu owner đã save.
   - `/contact` đọc đúng `contact.address` (cả case mới và cũ).
   - `/faq` render đúng từ repeatable.
   - View source `/` → `<meta property="og:image">` có nếu owner upload OG.
   - View source → `<script>` GA4/FB Pixel/TikTok inject nếu owner save ID.
9. `scripts/compare-html.ts`:
   - Nếu chưa save section mới, storefront phải byte-identical với master.
   - Sau khi save legal info, có 1 block HTML mới — document trong PR.

---

## 4. Non-goals Phase 4a

- ❌ Không thêm product picker (Phase 4b).
- ❌ Không drag-and-drop thật `@dnd-kit` (Phase 4b).
- ❌ Không section visibility/order (Phase 4b).
- ❌ Không Header topBar link, Hero CTA URLs, Campaign CTA, Story repeatable, Values icon, Social repeatable (Phase 4b).
- ❌ Không Draft/Preview/Publish (Phase 5).
- ❌ Không public endpoint `/api/site-config` (Phase 5).
- ❌ Không xóa key cũ trong DB (giữ làm backup mãi mãi).

---

## 5. Checklist PR

- [ ] Schema có thêm: section `contact`, section `analytics`, group `footer.legal`, group SEO refactor, FAQ repeatable.
- [ ] Zod validator update cho mọi field mới.
- [ ] Reader `getSiteConfig()` handle: (a) FAQ alias = JSON array string, (b) contact fallback đọc từ blob footer cũ.
- [ ] Storefront render legal info có conditional `!== ""`.
- [ ] Pixel/GA scripts dùng `next/script` với `strategy="afterInteractive"`, conditional load.
- [ ] Robots meta tag theo `seo.robotsIndexable`.
- [ ] OG image meta tag.
- [ ] Favicon `<link rel="icon">`.
- [ ] Tổng line count change tập trung vào schema + validator + storefront. KHÔNG đụng library/admin form.
- [ ] PR description: 3 screenshot — (a) admin form sau Phase 4a có section mới, (b) Footer storefront có legal info, (c) view-source HTML có OG meta + favicon.

---

## 6. Phase 4b preview (sẽ làm sau)

- Product picker manual (4.4) — modal search + multi-select + drag-reorder
- Header topBar link, Hero CTA URLs (group), Campaign CTA (group)
- Story features → repeatable với `alt` text (SEO)
- Values items thêm `icon` field
- Social → repeatable [facebook, instagram, tiktok, youtube, zalo, shopee, lazada, threads]
- FAQ collapse-by-default + drag reorder thật với `@dnd-kit`
- Section visibility & order (`homepage.sections` repeatable)
- Stricter image validation (regex URL hoặc path)
