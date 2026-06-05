# Phase 3a — Field/Section/Repeatable Library (chưa wire vào admin)

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**PR:** 1 PR độc lập, không động đến `SiteCustomizerClient.tsx` hiện tại, không động `settings.actions.ts`, không migration. Mục tiêu là tách rủi ro: build library xong, verify trên sandbox, mới qua Phase 3b để rewrite admin form.

---

## 1. Mục tiêu Phase 3a

Tạo bộ component **pure, schema-driven, controlled** để render UI cho mọi `FieldType` trong `SITE_SCHEMA`. Bộ này phải:

- Render chính xác cho mọi `type` đã khai báo trong `src/config/site-schema.ts` (text, textarea, url, image, boolean, select, color, group, repeatable, icon-picker, json).
- Là **controlled components**: nhận `value` + `onChange`, không quản state nội bộ (trừ UI state thuần — accordion open/close, drag handle).
- Không gọi server action, không fetch, không biết về `settings.service`.
- Type-safe: prop `field: SchemaField` ràng buộc đúng cái `value` được nhận.
- Có **sandbox route `/admin/_sandbox/customize-preview`** để Việt mở browser xem live.

Sau Phase 3a, `SiteCustomizerClient.tsx` vẫn nguyên xi 480 dòng. Phase 3b sẽ thay nó.

---

## 2. Files tạo mới

```
src/components/admin/customize/
├── FieldRenderer.tsx          # switch theo field.type, dispatch sang sub-component
├── SectionEditor.tsx          # render 1 section: lặp fields, gọi FieldRenderer
├── RepeatableEditor.tsx       # UI mảng item (add/remove/reorder)
├── fields/
│   ├── TextFieldInput.tsx
│   ├── TextareaFieldInput.tsx
│   ├── UrlFieldInput.tsx
│   ├── ImageFieldInput.tsx    # wrapper mỏng cho ImageCropUploader hiện có
│   ├── BooleanFieldInput.tsx  # toggle switch, không phải checkbox
│   ├── SelectFieldInput.tsx
│   ├── ColorFieldInput.tsx    # swatch read-only (BRAND_COLORS) — giữ behavior cũ
│   ├── IconPickerFieldInput.tsx
│   ├── JsonFieldInput.tsx     # textarea JSON + validate parse, hiển thị lỗi inline
│   └── GroupFieldInput.tsx    # render nested fields qua FieldRenderer
└── __sandbox__/
    └── SandboxPage.tsx        # client component cho sandbox route

src/app/(admin)/admin/sandbox/customize-preview/
└── page.tsx                   # server page mỏng, render <SandboxPage />
                               # ⚠ KHÔNG đặt tên folder bắt đầu bằng "_" — Next.js loại khỏi routing
```

**Không động** tới: `SiteCustomizerClient.tsx`, `HomepageCustomizerClient.tsx`, `settings.actions.ts`, `site-config.ts`, `site-config-validate.ts`, `site-schema.ts`, route `/admin/customize`.

---

## 3. API contract — bắt buộc tuân thủ

### 3.1. `FieldRenderer`

```tsx
import type { SchemaField } from "@/config/site-schema";

export interface FieldRendererProps {
  field: SchemaField;            // định nghĩa field
  value: unknown;                // giá trị hiện tại (có thể undefined)
  onChange: (next: unknown) => void;
  path: string;                  // dot-path để debug & key, vd "hero.title"
  error?: string;                // message lỗi inline (chưa dùng Phase 3a, prop sẵn)
  disabled?: boolean;
}

export function FieldRenderer(props: FieldRendererProps): JSX.Element;
```

Bên trong: `switch (field.type)` dispatch sang component con. **Không có default field type nào throw** — type lạ phải render `<UnknownField>` log warning + đổ JSON raw, không crash UI.

### 3.2. `SectionEditor`

```tsx
export interface SectionEditorProps {
  schema: Record<string, SchemaField>;
  value: Record<string, unknown>;
  onChange: (next: Record<string, unknown>) => void;
  path: string;                  // vd "hero"
  errors?: Record<string, string>;
  disabled?: boolean;
}
```

Lặp `Object.entries(schema)`, render `<FieldRenderer field={...} value={value[k]} onChange={v => onChange({...value, [k]: v})} path={`${path}.${k}`} />`. Mỗi field bọc trong `<label>` lấy `field.label` + `helpText` nếu có.

### 3.3. `RepeatableEditor`

```tsx
import type { RepeatableField } from "@/config/site-schema";

export interface RepeatableEditorProps {
  field: RepeatableField;
  value: Record<string, unknown>[];   // mảng item
  onChange: (next: Record<string, unknown>[]) => void;
  path: string;
  disabled?: boolean;
}
```

Behavior:
- Render mỗi item là 1 card có header thu gọn (hiện preview ngắn — ưu tiên field `title` → `q` → first text field), expand/collapse được.
- Nút "+ Thêm" tạo item mới = object có mọi key trong `itemSchema` set sang `default` của từng sub-field. Disable khi `field.max` đạt.
- Nút "Xóa" mỗi item. Disable khi `field.min` đạt.
- **Drag-to-reorder Phase 3a CHƯA bắt buộc**. Stub bằng nút "↑ / ↓" 2 mũi tên. Phase 4 sẽ thay bằng `@dnd-kit` thật. Comment `// TODO: replace with dnd-kit in Phase 4` ở chỗ render arrow buttons.
- Item body = `<SectionEditor schema={field.itemSchema} value={item} onChange={...} path={`${path}[${idx}]`} />`.

### 3.4. Mỗi `*FieldInput.tsx`

Signature đồng nhất:

```tsx
interface FieldInputProps<TField, TValue> {
  field: TField;
  value: TValue;
  onChange: (next: TValue) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}
```

Cụ thể:

| Component | TField | TValue | Ghi chú |
|---|---|---|---|
| `TextFieldInput` | `TextField` | `string` | `<input type="text">` |
| `TextareaFieldInput` | `TextareaField` | `string` | `<textarea rows={3}>` |
| `UrlFieldInput` | `UrlField` | `string` | `<input type="url">`, không validate ở client (zod validate ở Phase 3b) |
| `ImageFieldInput` | `ImageField` | `string` | render `<ImageCropUploader value={value} onChange={onChange} aspectRatio={field.aspectRatio} folder={field.folder ?? "theme"} label={field.label}>` |
| `BooleanFieldInput` | `BooleanField` | `boolean` | toggle switch tailwind, label bên trái |
| `SelectFieldInput` | `SelectField` | `string` | `<select>` với `field.options` |
| `ColorFieldInput` | `ColorField` | `string` | hiển thị swatch + hex code read-only. Hardcode tham chiếu `BRAND_COLORS` từ `SiteCustomizerClient.tsx` — copy constant vào `lib/brand-colors.ts` mới (xem §4) |
| `IconPickerFieldInput` | `BaseField` (type='icon-picker') | `string` | grid lucide icon có search, lưu icon name. Set tối thiểu 30 icon thông dụng để Phase 3a render được — danh sách đầy đủ Phase 4 |
| `JsonFieldInput` | `JsonField` | `unknown` | `<textarea>` chứa JSON.stringify(value, null, 2), parse mỗi lần onChange, hiển thị lỗi parse inline đỏ ở dưới |
| `GroupFieldInput` | `GroupField` | `Record<string, unknown>` | reuse `<SectionEditor schema={field.fields} ...>` |

---

## 4. File phụ — `src/lib/brand-colors.ts`

Tách `BRAND_COLORS` constant từ `SiteCustomizerClient.tsx` (dòng 15–22) sang `src/lib/brand-colors.ts`. Export named const. `SiteCustomizerClient.tsx` cũng đổi import sang file mới (đây là move-only, không refactor logic — diff phải sạch).

Lý do: ColorFieldInput cần dùng, không muốn import từ client component cũ.

---

## 5. Sandbox route — bắt buộc để verify

**File:** `src/app/(admin)/admin/_sandbox/customize-preview/page.tsx`

Server component mỏng (chỉ render client component). Trang này:

1. Import `SITE_SCHEMA` từ `@/config/site-schema`.
2. Tạo state local seed = build object từ schema (`section → { fieldKey: field.default }`), giống cách `getSiteConfig` sinh ra cây config.
3. Render 1 dropdown chọn section, dưới đó render `<SectionEditor schema={SITE_SCHEMA[selected].fields} value={state[selected]} onChange={...} path={selected} />`.
4. Bên phải hiển thị `<pre>{JSON.stringify(state[selected], null, 2)}</pre>` realtime — Việt nhìn JSON thay đổi để kiểm tra controlled flow.
5. KHÔNG gọi DB, KHÔNG gọi server action, KHÔNG `getSiteConfig`. Hoàn toàn in-memory.

Bảo vệ route: thêm `requireAdmin()` ở server component để không lộ ngoài. Layout `(admin)` đã có auth chung, kiểm tra lại.

URL: `http://localhost:3000/admin/sandbox/customize-preview`

> **Lưu ý Next.js routing:** Folder bắt đầu bằng `_` (vd `_sandbox`) bị App Router treat là **private folder** và LOẠI KHỎI routing → 404. Dùng tên `sandbox` (không underscore) cho route segment. Folder `__sandbox__` dưới `src/components/` vẫn OK vì không phải route.

---

## 6. Quy tắc styling

- Dùng đúng tailwind class & token đang dùng trong `SiteCustomizerClient.tsx` (`bg-canvas`, `border-border`, `text-primary`, `text-secondary`, `font-bvp`, `rounded-3`, `rounded-4`...).
- Field label: `text-sm font-semibold text-primary` + `text-xs text-secondary` cho `helpText`.
- Spacing nhất quán: gap-4 giữa các field trong section, gap-2 trong group.
- Không tự sáng tạo component cha mới (accordion). Phase 3b mới ráp accordion.

---

## 7. Edge cases bắt buộc handle

| Case | Behavior |
|---|---|
| `value === undefined` | Hiển thị `field.default`. Nếu default cũng `undefined`, dùng empty string / `[]` / `false` / `{}` theo type. **Không** auto-call `onChange` để inject default — chỉ render. |
| `value` sai type (vd `string` cho `BooleanField`) | Render với coerce best-effort + log `console.warn("Type mismatch at", path)`. Không crash. |
| Repeatable item thiếu key trong itemSchema | Render field với value undefined (fallback default), không xóa. |
| Repeatable empty array | Hiển thị empty state "Chưa có item nào" + nút "+ Thêm". |
| JSON parse fail trong JsonFieldInput | Giữ chuỗi user gõ, hiển thị lỗi đỏ "JSON không hợp lệ: ...", **không** gọi onChange với value cũ. Chỉ onChange khi parse OK. |
| Image field value rỗng `""` | Render ImageCropUploader trạng thái empty (component đã handle). |
| Disabled prop = true | Mọi input disable, opacity 50%, không click được. |

---

## 8. Cách verify (Antigravity gửi note này trong PR)

1. `pnpm build` — pass, không TS error.
2. `pnpm lint` — clean.
3. `pnpm dev`, login admin, mở `/admin/_sandbox/customize-preview`.
4. Chọn từng section trong dropdown. Mỗi section:
   - Gõ vào text/textarea → JSON bên phải update realtime.
   - Toggle boolean → JSON update.
   - Chọn select → JSON update.
   - Upload ảnh (image field) → URL hiện trong JSON.
   - Với section có repeatable (`story.features`, `values.items`): bấm "+ Thêm" → item mới có default đúng. Bấm "Xóa" → item biến mất. Bấm "↑ / ↓" → đổi vị trí.
   - Với section `faq`: JsonFieldInput parse OK, gõ JSON sai → báo lỗi inline.
5. Mở `/admin/customize` (route cũ) — phải nguyên trạng, không bị Phase 3a động chạm.
6. Mở `/` (storefront) — render giống hệt trước PR.

Screenshot 2 thứ trong PR: sandbox đang render 1 section repeatable + storefront homepage không đổi.

---

## 9. Non-goals Phase 3a

- ❌ Không động `SiteCustomizerClient.tsx`.
- ❌ Không thêm migration script.
- ❌ Không thêm zod validate vào component (Phase 3b sẽ wire `validateSiteConfig`).
- ❌ Không drag-and-drop thật (Phase 4).
- ❌ Không xóa `HomepageCustomizerClient.tsx` (Phase 3b).
- ❌ Không thêm field/section mới vào schema (Phase 4).
- ❌ Không đổi `settings.actions.ts`, `SettingsService`.

---

## 10. Checklist gửi PR

- [ ] Mọi component dưới `src/components/admin/customize/` xuất default + có JSDoc 1 dòng mô tả contract.
- [ ] Không `any` ngoại trừ JsonFieldInput value (vì JSON nested có thể là gì cũng được).
- [ ] Sandbox route `_sandbox/customize-preview` ẩn sau requireAdmin.
- [ ] `BRAND_COLORS` đã chuyển sang `src/lib/brand-colors.ts`, `SiteCustomizerClient.tsx` import từ file mới.
- [ ] PR description ghi: "Phase 3a closed. Library ready. Phase 3b sẽ rewrite SiteCustomizerClient."
- [ ] Screenshot sandbox.

---

## 11. Phase 3b sẽ làm sau (preview)

Khi Phase 3a merge:

1. Rewrite `SiteCustomizerClient.tsx` dùng `SectionEditor` cho mọi section.
2. Đổi `updateSettingsAction` nhận object phân cấp, validate zod, lưu mỗi section ở key `section.{name}`.
3. Migration script `scripts/migrate-settings-to-sections.ts`.
4. Xóa `HomepageCustomizerClient.tsx`.
5. Xóa sandbox route hoặc giữ làm dev tool (quyết định lúc đó).

Phase 3b chỉ làm khi Việt approve Phase 3a.
