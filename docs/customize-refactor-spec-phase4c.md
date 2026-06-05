# Phase 4c — CTA URLs + Section Visibility/Order

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 4b merged tại `d378bd3`).
**Branch name:** `feature/phase-4c-cta-section-order`.

**Mục tiêu:** Cho owner control mọi link CTA + chọn section nào hiện trên homepage + thứ tự ra sao. Schema-additions, no new library code. Storefront cập nhật render link mới + reorder logic.

---

## 0. Bối cảnh

Hiện tại:
- Top bar có `topBarText` nhưng KHÔNG có link → click không đi đâu.
- Hero `ctaPrimary` và `ctaSecondary` chỉ là text, hardcode `/shop` URL trong storefront page.tsx.
- Campaign section không có CTA button → owner muốn dẫn về landing chiến dịch không làm được.
- Homepage sections render thứ tự fix hardcode: hero → campaign → products → story → values → faq.

Phase 4c sẽ:
1. **Header top bar**: thêm `topBarLink` URL field.
2. **Hero CTAs**: convert `ctaPrimary` + `ctaSecondary` từ `text` thành `group {text, url}`.
3. **Campaign CTA**: thêm `cta: group {text, url}`.
4. **Section visibility/order**: thêm meta section `homepage` với field `sections: repeatable` chứa danh sách section name có thứ tự.

---

## 1. Scope Phase 4c (strict)

**Files được phép sửa:**
- `src/config/site-schema.ts` — thêm field/section mới
- `src/lib/site-config-validate.ts` — zod cho field/section mới
- `src/lib/site-config.ts` — reader handle group default cho `ctaPrimary`/`ctaSecondary`/`cta` (đã có generic group handler từ Phase 4a fix `3887542`)
- `src/components/shared/Header.tsx` — top bar link
- `src/app/(store)/page.tsx` — Hero CTAs URL render + section reorder logic + Campaign CTA render
- `docs/customize-refactor-tasks.md` — update status

**Cấm động:**
- Library Phase 3a (`SectionEditor`, `RepeatableEditor`, `FieldRenderer`, `*FieldInput`)
- `SiteCustomizerClient.tsx`
- `settings.actions.ts`, `settings.service.ts`
- `ProductService`, API routes
- `prisma/schema.prisma`
- Sandbox

---

## 2. Detailed task breakdown

### 2.1. Header top bar link

**Schema:**
```ts
header: {
  fields: {
    // ... existing fields
    topBarLink: { type: "url", label: "Top Bar link đích", default: "", aliases: ["top_bar_link"], helpText: "Để trống = top bar không click được" }
  }
}
```

**Storefront** (`src/components/shared/Header.tsx`): Wrap top bar text trong `<a>` nếu `config.header.topBarLink !== ""`, không wrap nếu rỗng.

```tsx
const link = config.header.topBarLink;
const content = <span>{config.header.topBarText}</span>;
return (
  <div className="top-bar">
    {link ? <a href={link}>{content}</a> : content}
  </div>
);
```

### 2.2. Hero CTAs convert sang group {text, url}

**Schema** — convert `ctaPrimary` và `ctaSecondary`:

```ts
hero: {
  fields: {
    // ...
    ctaPrimary: {
      type: "group",
      label: "CTA Chính",
      default: { text: "Khám phá Cửa Hàng", url: "/shop" },
      fields: {
        text: { type: "text", label: "Nhãn nút", default: "Khám phá Cửa Hàng", aliases: ["hero_cta_text"] },
        url: { type: "url", label: "Link đích", default: "/shop" }
      }
    },
    ctaSecondary: {
      type: "group",
      label: "CTA Phụ",
      default: { text: "Chiến dịch 'Người Nối'", url: "/campaign" },
      fields: {
        text: { type: "text", label: "Nhãn nút", default: "Chiến dịch 'Người Nối'", aliases: ["hero_cta_secondary"] },
        url: { type: "url", label: "Link đích", default: "/campaign" }
      }
    },
  }
}
```

**Lưu ý alias migration:** `aliases` ở nested `text` field đảm bảo đọc được giá trị cũ flat key `hero_cta_text` → put vào `text` của group. Reader hiện chưa handle alias cho field NESTED trong group — cần kiểm tra.

**Reader fix nếu cần** (`src/lib/site-config.ts`): Trong group handler, ngoài việc build default từ sub-field defaults, cần cho mỗi sub-field cũng resolve qua alias riêng. Hiện handler chỉ:
```ts
if (fieldDef.type === 'group') {
  const groupDefault = fieldDef.default ?? {};
  for (const [subKey, subDef] of Object.entries(fieldDef.fields)) {
    if (groupDefault[subKey] === undefined) {
      groupDefault[subKey] = (subDef as any).default ?? "";
    }
  }
  return groupDefault;
}
```

Sửa thành:
```ts
if (fieldDef.type === 'group') {
  const groupValue: Record<string, any> = { ...(fieldDef.default ?? {}) };
  for (const [subKey, subDef] of Object.entries(fieldDef.fields)) {
    // Nếu sub-field có aliases, đọc từ flat key cũ
    if (groupValue[subKey] === undefined && (subDef as any).aliases) {
      for (const alias of (subDef as any).aliases) {
        if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
          groupValue[subKey] = dbSettings[alias];
          break;
        }
      }
    }
    if (groupValue[subKey] === undefined) {
      groupValue[subKey] = (subDef as any).default ?? "";
    }
  }
  return groupValue;
}
```

**Storefront** (`src/app/(store)/page.tsx` lines 178, 185): Convert text-only CTA render to `<Link href={url}>{text}</Link>`.

Trước:
```tsx
{config.hero.ctaPrimary}
```
Sau:
```tsx
<Link href={config.hero.ctaPrimary.url || "/shop"}>{config.hero.ctaPrimary.text}</Link>
```

### 2.3. Campaign CTA

**Schema:**
```ts
campaign: {
  fields: {
    // ... existing
    cta: {
      type: "group",
      label: "Nút CTA chiến dịch",
      default: { text: "Tìm hiểu thêm", url: "/campaign" },
      fields: {
        text: { type: "text", label: "Nhãn nút", default: "Tìm hiểu thêm" },
        url: { type: "url", label: "Link đích", default: "/campaign", helpText: "Để trống = không hiện nút" }
      }
    }
  }
}
```

**Storefront**: Trong block campaign render (xung quanh `Campaign Visual Pane` ~line 263), thêm CTA button dưới `heroQuote`:

```tsx
{config.campaign.cta?.url && (
  <Link href={config.campaign.cta.url} className="cta-button-style">
    {config.campaign.cta.text || "Tìm hiểu thêm"}
  </Link>
)}
```

Conditional render: nếu `url` rỗng → ẩn nút.

### 2.4. Section visibility/order

**Schema** — thêm section mới `homepage`:

```ts
homepage: {
  label: "Bố cục trang chủ",
  fields: {
    sections: {
      type: "repeatable",
      label: "Section hiển thị (kéo để đổi thứ tự)",
      default: [
        { key: "hero", visible: true },
        { key: "campaign", visible: true },
        { key: "products", visible: true },
        { key: "story", visible: true },
        { key: "values", visible: true },
        { key: "faq", visible: true }
      ],
      itemSchema: {
        key: {
          type: "select",
          label: "Section",
          default: "hero",
          options: [
            { value: "hero", label: "Hero" },
            { value: "campaign", label: "Chiến dịch" },
            { value: "products", label: "Sản phẩm nổi bật" },
            { value: "story", label: "Câu chuyện" },
            { value: "values", label: "Giá trị cốt lõi" },
            { value: "faq", label: "FAQ" }
          ]
        },
        visible: { type: "boolean", label: "Hiển thị", default: true }
      },
      helpText: "Bỏ tick 'Hiển thị' = ẩn section. Dùng ↑/↓ để đổi thứ tự. Section không có trong danh sách = ẩn hoàn toàn."
    }
  }
}
```

**Validator:**
```ts
homepage: z.object({
  sections: z.array(z.object({
    key: z.enum(["hero", "campaign", "products", "story", "values", "faq"]),
    visible: z.boolean(),
  })),
})
```

**Storefront refactor** (`src/app/(store)/page.tsx`): Convert linear hardcoded render thành map theo `config.homepage.sections`.

```tsx
const visibleSections = (config.homepage.sections || [])
  .filter(s => s.visible)
  .map(s => s.key);

// Build section component map
const sectionComponents: Record<string, JSX.Element> = {
  hero: <HeroSection config={config.hero} />,
  campaign: <CampaignSection config={config.campaign} />,
  products: <FeaturedProductsSection products={featuredProducts} config={config.products} />,
  story: <StorySection config={config.story} />,
  values: <ValuesSection brandValues={brandValues} config={config.values} />,
  faq: <FaqSection itemsRetail={...} itemsB2b={...} />
};

return (
  <main>
    {visibleSections.map(key => (
      <React.Fragment key={key}>{sectionComponents[key]}</React.Fragment>
    ))}
  </main>
);
```

**⚠️ Refactor cảnh báo:** `page.tsx` hiện đang inline JSX, không chia thành sub-components. Antigravity có 2 lựa chọn:

**Option A — Tách thành sub-components (preferred, cleaner):**
- Tạo `src/components/store/HomepageSections/{HeroSection,CampaignSection,ProductsSection,StorySection,ValuesSection,FaqSection}.tsx`.
- Mỗi file là server component nhận `config` + data làm props.
- `page.tsx` chỉ orchestrate.

**Option B — Inline conditional render trong `page.tsx`:**
- Giữ JSX inline, wrap mỗi block trong `{visibleSections.includes("hero") && (...)}`.
- KHÔNG support reorder thật (chỉ visibility), vì JSX order vẫn fix.

**Em yêu cầu Option A.** Reorder thật là core feature của task này. Inline conditional chỉ hỗ trợ visibility, không order — không đủ.

### 2.5. Backward compat

Reader đã handle group default (Phase 4a fix `3887542`) + group sub-field aliases (Phase 4c §2.2 update).

Với `homepage.sections`: không có dữ liệu cũ → mọi user lần đầu sẽ thấy default 6 sections theo thứ tự cũ.

Lần save tiếp theo trong admin → blob `section.homepage` được tạo.

Không cần migration script.

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. Mở `/admin/customize`:
   - Accordion **Header** có field "Top Bar link đích" mới.
   - Accordion **Hero** field "CTA Chính" và "CTA Phụ" hiện ra dạng group (2 sub-field text + url mỗi cái).
   - Accordion **Chiến dịch** có group "Nút CTA chiến dịch".
   - Section mới **"Bố cục trang chủ"** trong accordion list (13 sections tổng).
   - Section homepage có 1 field repeatable với 6 item mặc định, mỗi item có select section name + checkbox visible.
3. Backward compat test:
   - DB có flat key `hero_cta_text = "Test CTA"` (legacy).
   - Reader phải đọc thành `config.hero.ctaPrimary.text = "Test CTA"`.
   - Admin form hiện "Test CTA" ở field ctaPrimary.text.
4. Save test:
   - Đổi `hero.ctaPrimary.url = "/test"`, save → reload giữ giá trị.
   - Đổi thứ tự `homepage.sections` (vd đẩy "products" lên đầu), save → reload `/` → section sản phẩm hiện đầu tiên.
   - Bỏ tick "visible" của `faq`, save → reload `/` → không thấy FAQ section.
5. Storefront test:
   - Top bar text click vào → đi đến `topBarLink` URL (nếu set).
   - Hero CTA chính/phụ click → đi đúng URL.
   - Campaign CTA hiện nếu URL set, ẩn nếu rỗng.
6. `scripts/compare-html.ts`:
   - Nếu owner không config gì mới (giữ default) → byte-identical với master vì default keeps same text + URLs.

---

## 4. Non-goals Phase 4c

- ❌ Không drag-and-drop thật `@dnd-kit` cho homepage.sections (vẫn dùng ↑/↓ stub Phase 4d).
- ❌ Không Story/Values/Social repeatable upgrade (Phase 4d).
- ❌ Không FAQ collapse-by-default (already done via `<details>` ở Phase 4a).
- ❌ Không Draft/Preview/Publish (Phase 5).
- ❌ Không public endpoint `/api/site-config` (Phase 5).

---

## 5. Checklist PR

- [ ] Schema có: `header.topBarLink`, `hero.ctaPrimary` (group), `hero.ctaSecondary` (group), `campaign.cta` (group), section mới `homepage.sections` (repeatable).
- [ ] Reader group handler resolve sub-field aliases.
- [ ] Validator zod cho mọi field mới.
- [ ] Storefront Hero CTAs render `<Link>` với URL.
- [ ] Storefront Campaign CTA conditional render.
- [ ] Storefront homepage section reorder logic (Option A — sub-components).
- [ ] Backward compat: alias cũ `hero_cta_text` resolve qua group sub-field.
- [ ] PR description: 3 screenshot — (a) admin form sau 4c có section "Bố cục trang chủ" + Hero CTAs là group, (b) homepage default order, (c) homepage sau khi reorder qua admin.

---

## 6. Phase 4d preview

- 4.5 Story features → repeatable + alt SEO (rework current `features` repeatable, add `alt` field)
- 4.6 Values items + icon picker (add `icon` field to itemSchema)
- 4.9 Social → repeatable [facebook, instagram, tiktok, youtube, zalo, shopee, lazada, threads]
- 4.7 `@dnd-kit` drag reorder thật — thay ↑/↓ buttons trong `RepeatableEditor` + `ProductPickerFieldInput`. Library refactor.

Phase 4d lớn nhất Phase 4 — sẽ chia tiếp nếu cần.
