# Phase 3b — Wire library vào admin form + migration

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau khi Phase 3a merged tại `a0250b0`).
**Branch name:** `feature/phase-3b-admin-wire`.

**Mục tiêu:** `/admin/customize` không còn hardcode field nào. UI render hoàn toàn từ `SITE_SCHEMA` qua library Phase 3a. Server action validate zod, lưu mỗi section dạng JSON blob `section.{name}`. Xóa code chết.

---

## 0. Bối cảnh

Phase 3a đã merge:
- Library `FieldRenderer/SectionEditor/RepeatableEditor` + 10 `*FieldInput` tại `src/components/admin/customize/`.
- Sandbox tại `/admin/sandbox/customize-preview` đang chạy in-memory, không gọi DB.
- `SiteCustomizerClient.tsx` (480 dòng) vẫn hardcode từng field, không dùng library.
- `HomepageCustomizerClient.tsx` (1020 dòng) hoàn toàn không được import ở đâu — code chết.
- `getSiteConfig()` đã tolerant cả 2 nguồn data: `section.{name}` JSON blob (mới) **ưu tiên hơn** aliases flat keys (cũ). Reader sẵn sàng cho Phase 3b lưu blob mới.
- `SettingsService.updateSettings(data: Record<string, string>)` chỉ nhận flat key→value string + upsert vào table `themeSetting`. KHÔNG cần đổi service.

---

## 1. Scope Phase 3b (strict)

**Phải làm:**

1. Rewrite `src/components/admin/settings/SiteCustomizerClient.tsx` < 150 dòng, dùng `SectionEditor` từ Phase 3a, accordion mỗi section.
2. Update `src/lib/actions/settings.actions.ts` — `updateSettingsAction` nhận hierarchical object (`Record<sectionName, sectionData>`), validate qua `validateSiteConfig`, serialize từng section sang JSON blob, lưu vào key `section.{name}`. Trả `{success, fieldErrors?}` cho UI hiển thị lỗi inline.
3. Migration script `scripts/migrate-settings-to-sections.ts` — đọc DB hiện tại, gộp aliases về section blob, write key `section.{name}`. **Không xóa** key cũ. Idempotent.
4. Xóa `src/components/admin/settings/HomepageCustomizerClient.tsx` (verify zero imports trước khi xóa).
5. Cleanup `prisma/seed.js` row `main_config` (dòng 306) — xóa hoặc thay bằng section blobs.
6. Dọn `field as any` trong `src/components/admin/customize/FieldRenderer.tsx` — dùng discriminated union narrowing đúng (TypeScript tự narrow `field` trong switch case theo `field.type`).

**Cấm động:**
- `src/config/site-schema.ts`
- `src/lib/site-config.ts`
- `src/lib/site-config-validate.ts`
- `src/lib/services/settings.service.ts`
- `prisma/schema.prisma`
- Storefront (`(store)/*`, `Header.tsx`, `Footer.tsx`, ...)
- Library Phase 3a (`src/components/admin/customize/**` ngoại trừ `FieldRenderer.tsx` cleanup `any`)
- Sandbox route (giữ làm dev tool)

---

## 2. Detailed task breakdown

### 2.1. `updateSettingsAction` hierarchical

**File:** `src/lib/actions/settings.actions.ts`

```ts
'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { SettingsService } from '@/lib/services/settings.service';
import { validateSiteConfig, SiteConfig } from '@/lib/site-config-validate';
import { revalidatePath } from 'next/cache';

export async function updateSiteConfigAction(input: SiteConfig) {
  await requireAdmin();
  
  const result = validateSiteConfig(input);
  if (!result.valid) {
    return { success: false, fieldErrors: result.errors, error: 'Dữ liệu không hợp lệ' };
  }
  
  // Build flat payload: section.{name} = JSON.stringify(sectionData)
  const flat: Record<string, string> = {};
  for (const [sectionName, sectionData] of Object.entries(result.data!)) {
    flat[`section.${sectionName}`] = JSON.stringify(sectionData);
  }
  
  await SettingsService.updateSettings(flat);
  
  revalidatePath('/');
  revalidatePath('/admin/customize');
  revalidatePath('/', 'layout');
  
  return { success: true };
}
```

**Lưu ý:**
- Giữ nguyên `updateSettingsAction(data: Record<string, string>)` cũ (legacy) — KHÔNG xóa. Một số chỗ khác có thể đang dùng (vd brand color settings). Hàm mới là `updateSiteConfigAction`, dùng riêng cho `/admin/customize`.
- `getSettingsAction` cũ giữ nguyên (legacy). Có thể thêm `getSiteConfigAction` riêng nếu admin form cần initial data dạng hierarchical — xem 2.2.

### 2.2. Initial data cho admin form

Server component `src/app/(admin)/admin/customize/page.tsx` (kiểm tra path chính xác) đang inject `initialSettings: Record<string, string>` vào `SiteCustomizerClient`. Phase 3b chuyển sang inject `initialConfig: SiteConfig` qua `getSiteConfig()`.

```tsx
// page.tsx
import { getSiteConfig } from '@/lib/site-config';
import SiteCustomizerClient from '@/components/admin/settings/SiteCustomizerClient';

export default async function Page() {
  await requireAdmin();
  const initialConfig = await getSiteConfig();
  return <SiteCustomizerClient initialConfig={initialConfig} />;
}
```

`getSiteConfig` đã tolerant — đọc blob mới nếu có, fallback aliases cũ. Lần đầu sau Phase 3b chưa migration thì sẽ trả default + aliases cũ; sau migration sẽ trả blob mới.

### 2.3. Rewrite `SiteCustomizerClient.tsx` < 150 dòng

Skeleton (chỉ minh họa, Antigravity tự hoàn thiện UI):

```tsx
"use client";

import { useState, useTransition } from "react";
import { SITE_SCHEMA } from "@/config/site-schema";
import { updateSiteConfigAction } from "@/lib/actions/settings.actions";
import SectionEditor from "@/components/admin/customize/SectionEditor";
import type { SiteConfig } from "@/lib/site-config-validate";
import { Save, Eye, ChevronDown, ChevronUp, Loader2 } from "lucide-react";

interface Props { initialConfig: SiteConfig; }

export default function SiteCustomizerClient({ initialConfig }: Props) {
  const [config, setConfig] = useState<SiteConfig>(initialConfig);
  const [openSection, setOpenSection] = useState<string | null>("header");
  const [isPending, startTransition] = useTransition();
  const [fieldErrors, setFieldErrors] = useState<Record<string, any> | null>(null);
  const [status, setStatus] = useState<"idle"|"saving"|"success"|"error">("idle");

  const updateSection = (name: string, data: any) => {
    setConfig(prev => ({ ...prev, [name]: data }));
  };

  const handleSave = () => {
    setStatus("saving");
    startTransition(async () => {
      const res = await updateSiteConfigAction(config);
      if (res.success) {
        setFieldErrors(null);
        setStatus("success");
        setTimeout(() => setStatus("idle"), 3000);
      } else {
        setFieldErrors(res.fieldErrors ?? null);
        setStatus("error");
      }
    });
  };

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <StickyHeader onSave={handleSave} status={status} isPending={isPending} />
      <div className="flex flex-col gap-3">
        {Object.entries(SITE_SCHEMA).map(([key, section]) => (
          <AccordionSection
            key={key}
            label={section.label}
            isOpen={openSection === key}
            onToggle={() => setOpenSection(openSection === key ? null : key)}
          >
            <SectionEditor
              schema={section.fields}
              value={config[key as keyof SiteConfig]}
              onChange={(v) => updateSection(key, v)}
              path={key}
              errors={fieldErrors?.[key]}
              disabled={isPending}
            />
          </AccordionSection>
        ))}
      </div>
    </div>
  );
}
```

`StickyHeader` và `AccordionSection` là sub-component cùng file (hoặc tách `src/components/admin/customize/AdminAccordion.tsx` nếu Antigravity thấy dài quá).

**Yêu cầu:**
- Style accordion + sticky header tái sử dụng class hiện có (`bg-canvas`, `border-border`, `font-playfair`, `rounded-4`...) để UX không đổi.
- Mỗi section icon: lấy từ map riêng `const SECTION_ICONS: Record<string, LucideIcon> = { header: Layout, hero: ImageIcon, ... }` (giữ icon hiện tại trong `SiteCustomizerClient.tsx` cũ).

### 2.4. Migration script

**File:** `scripts/migrate-settings-to-sections.ts`

```ts
// pnpm tsx scripts/migrate-settings-to-sections.ts
import { prisma } from '@/lib/prisma';
import { SITE_SCHEMA } from '@/config/site-schema';
import { getSiteConfig } from '@/lib/site-config';

async function main() {
  // 1. Đọc state hiện tại qua reader (đã handle aliases + defaults)
  const config = await getSiteConfig();
  
  // 2. Build operations: 1 row per section
  const ops: Array<{ key: string; value: string }> = [];
  for (const sectionName of Object.keys(SITE_SCHEMA)) {
    const blob = JSON.stringify(config[sectionName as keyof typeof config]);
    ops.push({ key: `section.${sectionName}`, value: blob });
  }
  
  // 3. Upsert
  await prisma.$transaction(
    ops.map(({ key, value }) =>
      prisma.themeSetting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      })
    )
  );
  
  // 4. KHÔNG xóa key cũ (aliases). Giữ làm backup.
  console.log(`✅ Migrated ${ops.length} sections`);
  console.log(`ℹ️  Aliases keys vẫn còn trong DB làm backup`);
  console.log(`   Cleanup ở Phase sau khi xác định ổn định`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

**Idempotency:** Chạy nhiều lần kết quả như nhau vì `upsert` + `getSiteConfig` luôn deterministic theo data hiện tại.

**Cảnh báo:** Lần đầu chạy migration, `getSiteConfig` đọc aliases → tạo blob mới. Sau khi UI Phase 3b sửa & save, blob được update. Chạy migration lần thứ 2 sẽ OVERWRITE blob bằng data đọc lại từ chính blob → idempotent. Antigravity test bằng cách chạy migration 2 lần, so sánh row count không tăng.

### 2.5. Xóa code chết

```bash
# Verify không có import
grep -r "HomepageCustomizerClient" src/ 2>/dev/null
# Nếu empty:
rm src/components/admin/settings/HomepageCustomizerClient.tsx
```

`prisma/seed.js` dòng 306 — đọc context xung quanh `main_config` rồi:
- Nếu là dummy data: xóa block.
- Nếu cần seed: thay bằng section blobs đúng format mới (build qua `SITE_SCHEMA` defaults).

### 2.6. Dọn `field as any` trong `FieldRenderer.tsx`

Vấn đề Phase 3a: switch case không narrow đúng. Giải bằng discriminated union — đảm bảo `SchemaField` là **union by `type` field** và `switch (field.type)` tự narrow `field` về subtype.

Kiểm tra `src/config/site-schema.ts`:

```ts
export type SchemaField = 
  | TextField | TextareaField | UrlField | ImageField 
  | BooleanField | SelectField | ColorField | JsonField
  | GroupField | RepeatableField;
```

Mỗi subtype đã có `type: 'text'`, `type: 'textarea'`, ... — discriminator đúng rồi. Vấn đề ở `FieldRenderer.tsx` là switch không khai báo type rõ. Fix:

```tsx
// Trước (sai):
switch (field.type) {
  case "text":
    return <TextFieldInput field={field as any} ... />

// Sau (đúng):
switch (field.type) {
  case "text":
    return <TextFieldInput field={field} ... />  // TS tự narrow field thành TextField
```

Nếu sau khi bỏ `as any` mà TS vẫn báo lỗi, chuyển sang **assertion function** hoặc kiểu helper:

```tsx
function assertFieldType<T extends SchemaField['type']>(
  field: SchemaField, expected: T
): asserts field is Extract<SchemaField, { type: T }> {
  if (field.type !== expected) throw new Error(`Expected ${expected}`);
}
```

Hoặc đơn giản: mỗi case dùng `Extract<SchemaField, { type: 'text' }>` để type-cast khai báo (vẫn tốt hơn `any`):

```tsx
case "text": {
  const f = field as Extract<SchemaField, { type: 'text' }>;
  return <TextFieldInput field={f} ... />
}
```

Hai cách đều OK, miễn không còn `any` floating.

---

## 3. Cách verify (Antigravity ghi trong PR)

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean (KHÔNG còn `any` cast trong FieldRenderer).
2. Chạy migration: `pnpm tsx scripts/migrate-settings-to-sections.ts` → in success.
3. Mở `/admin/customize`:
   - Tất cả section hiện đúng dữ liệu (giống pre-migration).
   - Sửa 1 text field (vd `hero.title`), bấm Lưu → reload page → giá trị giữ.
   - Sửa 1 repeatable item (vd `values.items[0].desc`), bấm Lưu → reload → giữ.
   - Sửa 1 URL field invalid (vd `social.facebook = "not-a-url"`) → form báo lỗi inline, không sập.
4. Mở `/` storefront → render giống trước migration. So sánh bằng `scripts/compare-html.ts` — phải byte-identical.
5. Mở `/admin/sandbox/customize-preview` → vẫn hoạt động bình thường (sanity check không vỡ library).
6. Chạy migration lần 2 → idempotent (số row trong DB không tăng).
7. `grep -r "HomepageCustomizerClient" src/` → empty.

Screenshot PR:
- (a) `/admin/customize` mở section `values` show repeatable items render qua library.
- (b) Inline error khi nhập URL invalid.
- (c) `/` homepage không đổi.

---

## 4. Non-goals Phase 3b

- ❌ Không xóa aliases keys cũ trong DB (giữ làm backup).
- ❌ Không thêm field/section mới (Phase 4).
- ❌ Không convert FAQ `json` → `repeatable` (TODO Phase 3b cleanup nhưng đẩy sang Phase 4 nếu hết thời gian).
- ❌ Không thêm Draft/Preview/Publish (Phase 5).
- ❌ Không đụng `SettingsService`, `prisma/schema.prisma`.
- ❌ Không rename `footer.address/phone/email` → `contact.*` (TODO Phase 4).

---

## 5. Checklist gửi PR

- [ ] `SiteCustomizerClient.tsx` < 150 dòng (đếm bằng `wc -l`).
- [ ] `HomepageCustomizerClient.tsx` đã xóa, `grep` không còn ref.
- [ ] `field as any` không còn trong `FieldRenderer.tsx`.
- [ ] Migration script tồn tại, chạy 2 lần idempotent.
- [ ] `prisma/seed.js` không còn row `main_config` dummy.
- [ ] PR description ghi rõ "Phase 3b closed", kèm 3 screenshot.
- [ ] Commit message conventional: `feat(customizer):`, `chore(cleanup):`, `refactor(actions):`.
- [ ] KHÔNG có CRLF noise trên file không liên quan (Antigravity config `core.autocrlf=input` từ Phase 3a đã).

---

## 6. Phase 4 sẽ làm sau (preview)

Sau khi Phase 3b ổn định:
- Convert FAQ `json` → `repeatable`.
- Rename `footer.address/phone/email` → `contact.*` (giữ aliases legacy).
- Public endpoint `/api/site-config` cho Header/Footer/FloatingActions consume server-side props (xoá client fetching, fix FOUC).
- Thêm 11 sub-task: product picker, MST, OG image, drag-reorder thật (`@dnd-kit`), section visibility & order...
