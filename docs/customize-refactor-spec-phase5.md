# Phase 5 — Public endpoint + Server props + Schema fix homepage

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 4d merged. Verify tip trước khi tạo branch).
**Branch name:** `feature/phase-5-public-endpoint-trust-badges`.

**Mục tiêu:** Sửa 2 sai lầm kiến trúc đang tồn tại + 1 lỗi content trên homepage.

1. **Header/Footer/FloatingActions đang fetch `/api/admin/settings`** (admin endpoint, security smell + FOUC). Refactor sang Server Component nhận config qua server-side props.
2. **Schema homepage section `values`** đang lẫn lộn brand pillar v1 lỗi thời (Mộc Mạc/Bền Bỉ) với trust badges. Rename + content fix theo blueprint Section 9.
3. **`<html lang>` đang là default "en"** từ create-next-app boilerplate. Set "vi" cho SEO basics (Phase 7 sẽ override với locale routing).

**Note:** Draft/Preview/Publish (spec gốc Phase 5) defer sang Phase tiếp. Lý do: yêu cầu Prisma migration + UI lớn ở admin + không critical cho launch. Phase 5 này tập trung security + content accuracy.

---

## 0. Bối cảnh

Sau Phase 4d:
- Schema có 12 section: header, hero, campaign, products, story, **values**, faq, contact, footer, social, seo, analytics, homepage.
- Section `values` được render trong `ValuesSection.tsx` ở homepage với 4 items (title + desc + iconImage Phase 4d).
- Per `D:\CỐC NỐI\site-architecture.md` Section 9, homepage có "Brand value badges" với 4 trust badge cố định: Handmade in Bát Tràng / Earth-friendly / Contemporary design / Ethical & sustainable.
- Per `D:\CỐC NỐI\brand-core.md` v2.0, brand có 4 pillar khác hẳn: KẾT NỐI / CHÂN THÀNH / CHỈN CHU / CỞI MỞ. Pillar đầy đủ thuộc về trang `/discover/our-values` (build ở Phase 6, chưa có).

Hai loại 4 items này LẪN LỘN từ Phase 1. Cần tách:
- Homepage: **trust badges** (4 cố định, marketing-light, customizable text/image).
- `/discover/our-values` (Phase 6): 4 brand pillar đầy đủ với long-form content.

---

## 1. Scope Phase 5 (strict)

**Files được phép sửa:**
- `src/config/site-schema.ts` — rename `values` → `trust_badges`, content update
- `src/lib/site-config-validate.ts` — validator update
- `src/lib/site-config.ts` — reader có backward compat cho key cũ `values`
- `src/components/store/HomepageSections/ValuesSection.tsx` — rename file thành `TrustBadgesSection.tsx`, content update
- `src/app/(store)/page.tsx` — import + render component renamed, sectionComponents map update
- `src/components/shared/Header.tsx` — convert thành Server Component
- `src/components/shared/Footer.tsx` — convert thành Server Component
- `src/components/store/FloatingActions.tsx` — convert thành Server Component
- `src/app/(store)/layout.tsx` — inject config props vào Header/Footer/FloatingActions
- `src/app/api/site-config/route.ts` — NEW public GET endpoint
- `src/app/layout.tsx` — set `<html lang="vi">`
- `docs/customize-refactor-tasks.md` — update status

**Cấm động:**
- `src/components/admin/customize/**` (library Phase 3a)
- `src/components/admin/settings/SiteCustomizerClient.tsx`
- `src/lib/actions/settings.actions.ts`
- `src/lib/services/settings.service.ts`
- `prisma/schema.prisma` (Phase này KHÔNG migration; Draft/Publish phase sau mới động)
- `src/app/api/admin/settings/route.ts` (admin endpoint giữ nguyên, không xóa)
- Sandbox

---

## 2. Detailed task breakdown

### 2.1. Schema rename `values` → `trust_badges`

**File:** `src/config/site-schema.ts`

```ts
// Trước (giữ trong section homepage):
values: {
  label: "Giá trị cốt lõi",
  fields: {
    tagline: { ... default: "Core Principles" },
    title: { ... default: "Giá trị Cốc Nối" },
    desc: { ... default: "Chúng tôi gìn giữ..." },
    items: {
      type: "repeatable",
      default: [
        { title: "Mộc Mạc", ... },  // ← lỗi thời
        { title: "Chân Thành", ... },
        { title: "Bền Bỉ", ... },  // ← lỗi thời
        { title: "Chỉn Chu", ... }
      ],
      ...
    }
  }
}

// Sau:
trust_badges: {
  label: "Trust Badges (Homepage)",
  fields: {
    tagline: { type: "text", label: "Tagline ngắn", default: "Why Cốc Nối", aliases: ["values_tagline"] },
    title: { type: "text", label: "Tiêu đề", default: "Vì sao chọn Cốc Nối", aliases: ["values_title"] },
    desc: { type: "textarea", label: "Mô tả chung", default: "", aliases: ["values_desc"] },
    items: {
      type: "repeatable",
      label: "Các badge",
      default: [
        { 
          title: "Handmade in Bát Tràng", 
          desc: "Thủ công tại làng gốm Bát Tràng 700 năm.",
          iconImage: ""
        },
        { 
          title: "Earth-friendly", 
          desc: "Đất nung tự nhiên, men an toàn, packaging giấy kraft.",
          iconImage: ""
        },
        { 
          title: "Contemporary design", 
          desc: "Thiết kế đương đại, phù hợp bàn làm việc + bàn cà phê hiện đại.",
          iconImage: ""
        },
        { 
          title: "Ethical & sustainable", 
          desc: "Kinh doanh có đạo đức, đối xử công bằng với nghệ nhân.",
          iconImage: ""
        }
      ],
      itemSchema: {
        title: { type: "text", label: "Tên badge", default: "" },
        desc: { type: "textarea", label: "Mô tả ngắn", default: "" },
        iconImage: {
          type: "image",
          label: "Icon / Ảnh",
          default: "",
          aspectRatio: 1,
          folder: "theme/trust-badges",
          helpText: "Có thể là icon line-art minimal hoặc ảnh nhỏ. Vuông 1:1."
        }
      }
    }
  }
}
```

**Quan trọng:** Schema KHÔNG còn key `values`. Section `homepage` (đã có từ Phase 4c) vẫn dùng tên cũ `"values"` trong `homepage.sections.key` enum để backward compat. **Mapping:** key `"values"` trong homepage.sections → component `TrustBadgesSection`. KHÔNG đổi key này, chỉ đổi rendering.

Hoặc: đổi key trong enum lẫn validator. Thêm option `"trust_badges"`, giữ `"values"` làm alias old name. Reader sẽ map `values` → `trust_badges` ở runtime. Phương án này sạch hơn.

**Em đề xuất:** Đổi enum option `"values"` → `"trust_badges"` trong schema. Reader thêm migration tự động: nếu homepage.sections có item key === "values", map ra "trust_badges" khi đọc.

### 2.2. Validator

**File:** `src/lib/site-config-validate.ts`

```ts
// Replace:
values: z.object({
  tagline: textValidator,
  title: textValidator,
  desc: textValidator,
  items: z.array(z.object({
    title: textValidator,
    desc: textValidator,
    iconImage: imageValidator,
  })),
}),

// With:
trust_badges: z.object({
  tagline: textValidator,
  title: textValidator,
  desc: textValidator,
  items: z.array(z.object({
    title: textValidator,
    desc: textValidator,
    iconImage: imageValidator,
  })),
}),

// homepage.sections.key enum update:
homepage: z.object({
  sections: z.array(z.object({
    key: z.enum(["hero", "campaign", "products", "story", "trust_badges", "faq"]),  // ← "values" → "trust_badges"
    visible: z.boolean(),
  })),
}),
```

### 2.3. Reader backward compat

**File:** `src/lib/site-config.ts`

Thêm 2 layer compat:

**Layer A — section blob `section.values` → `section.trust_badges`:**

Trong `getSiteConfig`, sau khi loop qua schema sections, thêm:

```ts
// Backward compat: section.values blob cũ → trust_badges (Phase 5 rename)
if (!dbSettings['section.trust_badges'] && dbSettings['section.values']) {
  // Reuse data nhưng KHÔNG migrate content lỗi thời.
  // Chỉ migrate metadata (tagline/title/desc) nếu user đã save customized.
  // Items mới hoàn toàn theo schema default (trust badges).
  try {
    const oldValues = JSON.parse(dbSettings['section.values']);
    config.trust_badges = {
      tagline: oldValues.tagline ?? SITE_SCHEMA.trust_badges.fields.tagline.default,
      title: oldValues.title ?? SITE_SCHEMA.trust_badges.fields.title.default,
      desc: oldValues.desc ?? SITE_SCHEMA.trust_badges.fields.desc.default,
      items: SITE_SCHEMA.trust_badges.fields.items.default  // ← Force default trust badges
    };
  } catch {}
}
```

**Lý do force items default:** Items cũ ("Mộc Mạc"/"Bền Bỉ") sai content. Không migrate. User sẽ thấy 4 trust badges đúng. Nếu user muốn giữ pillar content, copy paste sang `/discover/our-values` (Phase 6).

**Layer B — homepage.sections key `"values"` → `"trust_badges"`:**

Trong reader resolve `homepage.sections`, sau khi đọc array, map:

```ts
if (config.homepage?.sections) {
  config.homepage.sections = config.homepage.sections.map((s: any) => ({
    ...s,
    key: s.key === 'values' ? 'trust_badges' : s.key
  }));
}
```

### 2.4. Rename component file

```bash
git mv src/components/store/HomepageSections/ValuesSection.tsx \
       src/components/store/HomepageSections/TrustBadgesSection.tsx
```

**Trong file:** rename export default function `ValuesSection` → `TrustBadgesSection`. Props giữ tương tự nhưng `config` là từ `config.trust_badges`. Render 4 badges trong grid 4-col. Phase 4d đã có image upload pattern, dùng lại.

**Visual hint per blueprint:** Badge layout đơn giản hơn pillar (badge = icon nhỏ + tên ngắn + 1 câu). Không cần ảnh to. Có thể dùng icon line-art SVG inline nếu owner chưa upload.

### 2.5. Storefront page update

**File:** `src/app/(store)/page.tsx`

```tsx
// Trước:
import ValuesSection from "@/components/store/HomepageSections/ValuesSection";
...
const sectionComponents = {
  ...
  values: <ValuesSection config={config.values} brandValues={brandValues} />,
};

// Sau:
import TrustBadgesSection from "@/components/store/HomepageSections/TrustBadgesSection";
...
const sectionComponents = {
  ...
  trust_badges: <TrustBadgesSection config={config.trust_badges} />,
};
```

**Bỏ block process `brandValues` từ `config.values.items`** — không cần xử lý Lucide icon resolution nữa (Phase 4d đã chuyển sang iconImage). Trust badges có thể render trực tiếp từ `config.trust_badges.items`.

### 2.6. Public endpoint `/api/site-config`

**File mới:** `src/app/api/site-config/route.ts`

```ts
import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 300;  // ISR cache 5 phút

/**
 * Public endpoint trả về toàn bộ site config cho client/SSR consume.
 * Không yêu cầu auth — tất cả data ở đây là public visible trên storefront.
 * Cache 5 phút để giảm DB load.
 */
export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({ success: true, data: config }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error: any) {
    console.error("GET /api/site-config error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch config" },
      { status: 500 }
    );
  }
}
```

**Quan trọng:** Endpoint return data identical với getSiteConfig() server-side. Client component nào fetch nó sẽ có cùng shape config làm việc với.

### 2.7. Refactor Header/Footer/FloatingActions sang Server Component

**File:** `src/components/shared/Header.tsx`

```tsx
// Trước (Client):
"use client";
import { useState, useEffect } from "react";
export default function Header() {
  const [themeConfig, setThemeConfig] = useState<any>(null);
  useEffect(() => {
    fetch("/api/admin/settings").then(r => r.json()).then(setThemeConfig);
  }, []);
  // ... render dùng themeConfig
}

// Sau (Server with client sub-component cho interactive parts):
import type { SiteConfig } from "@/lib/site-config-validate";
import HeaderClient from "./HeaderClient";  // ← move interactive parts here

interface HeaderProps {
  config: SiteConfig;
  navLinks?: any[];  // nếu có
}

export default function Header({ config, navLinks }: HeaderProps) {
  // Render static markup ở server với config
  // Drop downs, hover menus, mobile toggle move sang HeaderClient
  return (
    <header>
      {/* Static top bar */}
      <div>{config.header.topBarText}</div>
      {/* Logo + nav static */}
      <HeaderClient config={config} navLinks={navLinks} />
    </header>
  );
}
```

**Lưu ý:** Header.tsx hiện tại có nhiều state (hover menu, scroll detection, mobile toggle). Antigravity có 2 lựa chọn:

**Option A (preferred):** Tách Header.tsx thành:
- `Header.tsx` (Server) — nhận config props, render shell + import client subcomponents.
- `HeaderClient.tsx` (Client) — chứa state hover/scroll/toggle, nhận config qua props từ parent.

**Option B (lazy):** Giữ Header.tsx là Client, nhưng đổi `fetch("/api/admin/settings")` → `fetch("/api/site-config")`. Đơn giản hơn nhưng vẫn FOUC (client fetch sau hydrate).

**Em yêu cầu Option A.** Lý do: blueprint nói "Server-Side Config (props injection)" trong customize-refactor-tasks.md từ Phase 4. Cố định FOUC là goal chính của task này.

Footer.tsx + FloatingActions.tsx làm tương tự.

**File:** `src/app/(store)/layout.tsx` (đã là Server Component sau Phase 4a)

```tsx
import { getSiteConfig } from "@/lib/site-config";
import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";
import FloatingActions from "@/components/store/FloatingActions";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const config = await getSiteConfig();
  return (
    <>
      <Header config={config} />
      {children}
      <Footer config={config} />
      <FloatingActions config={config} />
      {/* Analytics scripts (đã có Phase 4a, vẫn ở đây) */}
    </>
  );
}
```

### 2.8. Set html lang vi

**File:** `src/app/layout.tsx`

```tsx
// Trước (default từ create-next-app):
<html lang="en">

// Sau:
<html lang="vi">
```

Trivial. Phase 7 sẽ override với locale param.

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. Admin form `/admin/customize`:
   - Section **"Giá trị cốt lõi"** đổi tên thành **"Trust Badges (Homepage)"**.
   - 4 items mặc định: Handmade in Bát Tràng / Earth-friendly / Contemporary design / Ethical & sustainable. KHÔNG còn Mộc Mạc / Bền Bỉ.
   - User đã save tagline/title/desc customized cũ → vẫn giữ (backward compat).
   - Items cũ ("Mộc Mạc"...) bị reset về 4 trust badges mặc định (intentional, document trong PR).
3. Homepage `/`:
   - Section trust badges render đúng vị trí (theo `homepage.sections` order Phase 4c).
   - Footer/Header/FloatingActions render server-side, KHÔNG FOUC (test mạng chậm trong DevTools, phần này phải hiện ngay không delay).
   - View source `/` → có `<html lang="vi">`.
4. API endpoint:
   - `curl http://localhost:3000/api/site-config` (no auth) → 200 OK + JSON config.
   - `curl -I http://localhost:3000/api/site-config` → `Cache-Control: public, s-maxage=300, ...`.
   - `curl http://localhost:3000/api/admin/settings` (no auth) → 401 hoặc redirect login (admin endpoint, expected).
5. Backward compat:
   - DB có blob `section.values` cũ (Phase 3b migration tạo) → reader migrate thành config.trust_badges với tagline/title/desc giữ + items reset default.
   - DB có `homepage.sections` blob với item `{key: "values", visible: true}` → reader map thành `{key: "trust_badges", visible: true}` runtime.
6. Sandbox `/admin/sandbox/customize-preview`:
   - Dropdown section list có "Trust Badges (Homepage)" thay vì "Giá trị cốt lõi".
   - Render đúng.
7. `scripts/compare-html.ts`:
   - Storefront homepage trust badges content sẽ KHÁC pre-Phase 5 (text Mộc Mạc → Handmade). Document khác biệt trong PR.
   - Header/Footer markup nên byte-identical (chỉ thay đổi runtime model server vs client, output HTML giống nhau).

---

## 4. Non-goals Phase 5

- ❌ Không Draft/Preview/Publish (defer Phase tiếp).
- ❌ Không thêm Prisma migration.
- ❌ Không multi-page refactor (Phase 6).
- ❌ Không EN/VN bilingual (Phase 7).
- ❌ Không tạo /discover/our-values page với 4 pillar (Phase 6).
- ❌ Không xóa `section.values` key cũ trong DB.

---

## 5. Checklist PR

- [ ] Schema: `values` section rename → `trust_badges`, content 4 items mới.
- [ ] Validator zod update.
- [ ] Reader backward compat 2 layer (section blob + homepage.sections.key mapping).
- [ ] `ValuesSection.tsx` rename → `TrustBadgesSection.tsx`, content render trust badges.
- [ ] `page.tsx` storefront import + map update, bỏ block process brandValues icon.
- [ ] Header/Footer/FloatingActions refactor: Server shell + Client interactive subcomponent (Option A).
- [ ] `(store)/layout.tsx` fetch `getSiteConfig()` server-side và inject vào children props.
- [ ] `api/site-config/route.ts` mới với ISR cache 5 phút.
- [ ] Root `layout.tsx` set `<html lang="vi">`.
- [ ] PR description 3 screenshot: (a) admin form với "Trust Badges (Homepage)" section, (b) homepage trust badges render đúng 4 cái, (c) DevTools Network tab show NO `/api/admin/settings` request từ client.

---

## 6. Phase 6 preview (sau Phase 5)

- Multi-page refactor: tách `/discover` thành 4 sub-pages (`/our-story`, `/our-human`, `/our-craft`, `/our-values`). Trang `/our-values` chứa **4 brand pillar đầy đủ** (KẾT NỐI/CHÂN THÀNH/CHỈN CHU/CỞI MỞ) với long-form content per `brand-core.md` Section 4.
- Tách `/partners` thành 3 sub-pages: `/stockists`, `/become-a-stockist`, `/corporate-gifting`.
- Tách `/shop` sub-categories: `/shop/mugs`, `/shop/beakers`, `/shop/collections`, `/shop/limited`, `/shop/best-sellers`.
- Thêm CỘNG ĐỒNG top-nav + 2 sub-pages: `/community/your-stories` (#cocnoiwithyou UGC gallery), `/community/nguoi-noi` (move từ root `/nguoi-noi`).
- Update Header nav từ 4 mục thành 5 mục per blueprint.

## 7. Phase 7 preview (cuối cùng)

- EN/VN bilingual via next-intl.
- Locale routing `/vi/...` và `/en/...`, default `/vi`.
- Translate toàn bộ static copy (homepage + sub-pages).
- Switcher EN/VN ở header + footer.
- Schema seo có `siteTitleEn`, `siteDescriptionEn` (hoặc dùng namespace `seo.en.*`).
