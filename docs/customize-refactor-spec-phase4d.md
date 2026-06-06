# Phase 4d — Repeatable upgrades + @dnd-kit + ZodErrors deep flatten

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 4c merged).
**Branch name:** `feature/phase-4d-repeatable-dnd`.

**Mục tiêu:** Mở rộng schema repeatable cho Story/Values/Social, replace nút `↑/↓` bằng `@dnd-kit` drag thật, và fix `flattenZodErrors` để hiện inline error cho field cấp 3+ trong group/repeatable.

---

## 0. Bối cảnh

Phase 4a-4c đã merge. Repeatable hiện đang dùng nút `↑/↓` (stub Phase 3a, comment `// TODO: replace with dnd-kit in Phase 4`). 3 section còn dạng cứng cần upgrade:
- `story.features` — chỉ có `imgUrl`, thiếu `alt` (SEO).
- `values.items` — chỉ `title` + `desc`, thiếu icon.
- `social.*` — 3 field cứng (facebook/instagram/zalo), thiếu mở rộng tiktok/youtube/shopee/lazada/threads.

`flattenZodErrors` Phase 3b chỉ flatten 2 cấp → group/repeatable errors hiện trống → user không biết field nào fail (đã gặp Phase 4c).

---

## 1. Scope Phase 4d (strict)

**Files được phép sửa:**
- `src/config/site-schema.ts` — schema upgrades
- `src/lib/site-config-validate.ts` — validators
- `src/lib/site-config.ts` — repeatable reader (backward compat aliases cũ)
- `src/lib/actions/settings.actions.ts` — `flattenZodErrors` cải thiện
- `src/components/admin/customize/RepeatableEditor.tsx` — replace ↑/↓ bằng `@dnd-kit`
- `src/components/admin/customize/fields/ProductPickerFieldInput.tsx` — replace ↑/↓ bằng `@dnd-kit`
- `src/components/admin/customize/fields/IconPickerFieldInput.tsx` — kiểm tra/extend nếu cần
- `src/components/store/HomepageSections/StorySection.tsx` — render `alt`
- `src/components/store/HomepageSections/ValuesSection.tsx` — render icon
- `src/components/shared/Footer.tsx` — render social repeatable mới
- `src/components/store/FloatingActions.tsx` — render Zalo từ social repeatable
- `package.json` — thêm `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `docs/customize-refactor-tasks.md` — update status

**Cấm động:**
- `SectionEditor`, `FieldRenderer`, các `*FieldInput` không liệt kê trên
- `SiteCustomizerClient.tsx`
- `settings.service.ts`, `ProductService`
- `prisma/schema.prisma`
- Sandbox

---

## 2. Detailed task breakdown

### 2.1. Story features: thêm `alt`

**Schema:**
```ts
features: {
  type: "repeatable",
  label: "Ảnh đặc trưng",
  default: [
    { imgUrl: "", alt: "" },
    { imgUrl: "", alt: "" },
    { imgUrl: "", alt: "" },
    { imgUrl: "", alt: "" }
  ],
  itemSchema: {
    imgUrl: { type: "image", label: "Ảnh", default: "" },
    alt: { type: "text", label: "Mô tả ảnh (alt text - SEO)", default: "", helpText: "Bắt buộc cho SEO + accessibility" }
  },
  aliasGroups: [
    { imgUrl: "intro_feat_1_img_url" },
    { imgUrl: "intro_feat_2_img_url" },
    { imgUrl: "intro_feat_3_img_url" },
    { imgUrl: "intro_feat_4_img_url" }
  ]
}
```

`alt` không có alias (data cũ không có). Reader bắt buộc default `alt: ""` cho item cũ.

**Reader update** (`site-config.ts`): aliasGroups handler hiện chỉ build từ aliases. Thêm logic: với sub-field không có alias, dùng `itemSchema[subKey].default`. (Có thể đã làm — verify.)

**Validator:**
```ts
features: z.array(z.object({
  imgUrl: imageValidator,
  alt: textValidator,
})),
```

**Storefront** (`StorySection.tsx`): render `<img src={feature.imgUrl} alt={feature.alt} />` thay vì `alt=""`.

### 2.2. Values items: thêm icon

**Schema:**
```ts
items: {
  type: "repeatable",
  label: "Các đặc trưng",
  default: [
    { title: "Mộc Mạc", desc: "...", icon: "Sparkles" },
    { title: "Chân Thành", desc: "...", icon: "Heart" },
    { title: "Bền Bỉ", desc: "...", icon: "Shield" },
    { title: "Chỉn Chu", desc: "...", icon: "Star" }
  ],
  itemSchema: {
    title: { type: "text", label: "Tiêu đề", default: "" },
    desc: { type: "textarea", label: "Mô tả", default: "" },
    icon: { type: "icon-picker", label: "Icon", default: "Sparkles" }
  },
  aliasGroups: [
    { title: "value_1_title", desc: "value_1_desc" },
    { title: "value_2_title", desc: "value_2_desc" },
    { title: "value_3_title", desc: "value_3_desc" },
    { title: "value_4_title", desc: "value_4_desc" }
  ]
}
```

**Validator:**
```ts
items: z.array(z.object({
  title: textValidator,
  desc: textValidator,
  icon: textValidator,
})),
```

**Storefront** (`ValuesSection.tsx`): render dynamic icon từ `lucide-react`. Cần lazy import or icon map.

Pattern an toàn:
```tsx
import * as LucideIcons from "lucide-react";
const Icon = (LucideIcons as any)[item.icon] || LucideIcons.Sparkles;
return <Icon className="w-6 h-6" />;
```

Nếu icon name không tồn tại → fallback Sparkles.

### 2.3. Social: convert flat → repeatable

**Schema replace:**
```ts
social: {
  label: "Mạng xã hội",
  fields: {
    links: {
      type: "repeatable",
      label: "Liên kết mạng xã hội",
      default: [
        { platform: "facebook", url: "", visible: true },
        { platform: "instagram", url: "", visible: true },
        { platform: "zalo", url: "", visible: true }
      ],
      itemSchema: {
        platform: {
          type: "select",
          label: "Nền tảng",
          default: "facebook",
          options: [
            { value: "facebook", label: "Facebook" },
            { value: "instagram", label: "Instagram" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
            { value: "zalo", label: "Zalo" },
            { value: "shopee", label: "Shopee" },
            { value: "lazada", label: "Lazada" },
            { value: "threads", label: "Threads" }
          ]
        },
        url: { type: "url", label: "URL", default: "" },
        visible: { type: "boolean", label: "Hiển thị", default: true }
      },
      aliasGroups: [
        { platform: undefined, url: "contact_facebook" },  // mặc định platform="facebook"
        { platform: undefined, url: "contact_instagram" },
        { platform: undefined, url: "contact_zalo" }
      ]
    }
  }
}
```

⚠️ aliasGroups hiện chỉ map key→key, không pre-set platform. Reader cần extension:
- Khi `aliasGroups` có `undefined` value → bỏ qua field này, dùng item default theo position.
- Hoặc cấu trúc `aliasGroups` mới hỗ trợ default values: `[{ platform: { default: "facebook" }, url: "contact_facebook" }, ...]`.

**Đề xuất pragmatic:** thay aliasGroups bằng custom logic trong reader cho `social.links`:

```ts
// Trong getSiteConfig sau khi build config.social:
if (!sectionBlob?.links) {
  const legacySocial = [];
  if (dbSettings.contact_facebook) legacySocial.push({ platform: "facebook", url: dbSettings.contact_facebook, visible: true });
  if (dbSettings.contact_instagram) legacySocial.push({ platform: "instagram", url: dbSettings.contact_instagram, visible: true });
  if (dbSettings.contact_zalo) legacySocial.push({ platform: "zalo", url: dbSettings.contact_zalo, visible: true });
  if (legacySocial.length > 0) config.social = { links: legacySocial };
}
```

Custom backward compat, comment rõ.

**Storefront:**
- `Footer.tsx`: thay `config.social.facebook/instagram/zalo` bằng map `config.social.links`. Render với icon + visible filter.
- `FloatingActions.tsx`: tìm item có `platform === "zalo"` && `visible`, render Zalo button. Nếu không có → ẩn.

**Validator:**
```ts
social: z.object({
  links: z.array(z.object({
    platform: z.enum(["facebook", "instagram", "tiktok", "youtube", "zalo", "shopee", "lazada", "threads"]),
    url: urlValidator,
    visible: booleanValidator,
  })),
}),
```

### 2.4. `@dnd-kit` drag-reorder thật

**Install:**
```bash
pnpm add @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

**RepeatableEditor.tsx refactor:**

```tsx
"use client";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

function SortableItem({ id, idx, children }: { id: string; idx: number; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  return (
    <div ref={setNodeRef} style={style} className="border border-border rounded-3 bg-canvas">
      <div className="flex items-start gap-2 p-2">
        <button {...attributes} {...listeners} className="p-1 cursor-grab hover:bg-subtle rounded-2">
          <GripVertical className="w-4 h-4 text-secondary" />
        </button>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

export default function RepeatableEditor({ field, value, onChange, path, disabled }: ...) {
  const items = value.map((_, idx) => ({ ...value[idx], _dndId: `${path}-${idx}` }));
  const sensors = useSensors(useSensor(PointerSensor), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = items.findIndex(i => i._dndId === active.id);
    const newIdx = items.findIndex(i => i._dndId === over.id);
    onChange(arrayMove(value, oldIdx, newIdx));
  };

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map(i => i._dndId)} strategy={verticalListSortingStrategy}>
          {items.map((item, idx) => (
            <SortableItem key={item._dndId} id={item._dndId} idx={idx}>
              {/* existing item card content here, no ↑/↓ buttons */}
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <button onClick={addItem}>+ Thêm</button>
    </div>
  );
}
```

**XÓA nút `↑/↓` và logic `moveUp`/`moveDown`.** Replace bằng drag handle (`GripVertical`).

Lưu ý: `_dndId` là internal key, không lưu vào value gửi cho onChange. Phải strip khi onChange.

**ProductPickerFieldInput.tsx**: same refactor pattern — replace `↑/↓` bằng `useSortable` cho mỗi card sản phẩm trong selected list.

### 2.5. `flattenZodErrors` deep flatten

**File:** `src/lib/actions/settings.actions.ts`

Current `flattenZodErrors` chỉ đi 2 cấp. Cần đệ quy hỗ trợ arbitrary depth:

```ts
function flattenZodErrors(formatted: any, prefix = ""): Record<string, string> {
  const flat: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(formatted)) {
    if (key === "_errors") continue;
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && "_errors" in value) {
      const errs = (value as any)._errors;
      if (Array.isArray(errs) && errs.length > 0) {
        flat[path] = errs[0];
      }
      // Recurse vào sub-fields
      const subFlat = flattenZodErrors(value, path);
      Object.assign(flat, subFlat);
    }
  }
  
  return flat;
}
```

Format trả về: `{ "hero.ctaPrimary.url": "URL không hợp lệ", "social.links.0.url": "..." }`.

**Update `SectionEditor.errors` prop**: hiện nhận `Record<string, string>` per-section. Cần update để hiểu nested path. Hoặc đơn giản hơn: re-group flat errors về structure cũ trước khi pass vào SectionEditor.

**Đề xuất**: `updateSiteConfigAction` trả `fieldErrors: Record<string, string>` (flat with dot-paths). `SiteCustomizerClient` re-group về `Record<sectionName, Record<fieldKey, string>>` trước khi pass vào SectionEditor (giữ contract Phase 3a).

Helper `regroupErrors(flat)`:
```ts
function regroupErrors(flat: Record<string, string>): Record<string, Record<string, string>> {
  const grouped: Record<string, Record<string, string>> = {};
  for (const [path, msg] of Object.entries(flat)) {
    const [section, ...rest] = path.split(".");
    if (!grouped[section]) grouped[section] = {};
    grouped[section][rest.join(".")] = msg;
  }
  return grouped;
}
```

Lưu ý: SectionEditor + FieldRenderer hiện chỉ pass `error?: string` ở cấp field, không nested. Nếu user nhập sai `hero.ctaPrimary.url` → error sẽ ở key `"ctaPrimary.url"` trong `errors[hero]`. FieldRenderer của ctaPrimary group nhận `error = "ctaPrimary.url"`? Không, group có `errors` prop cho sub-field.

**Phase 4d task này phức tạp.** Em đề xuất chia 2 sub-task:
- (a) `flattenZodErrors` deep flatten + regroup helper (action layer).
- (b) `SectionEditor`/`GroupFieldInput` accept nested error paths và pass đúng sub-field. Có thể phát hiện cần update library — vi phạm "không động library" rule. Đề xuất giải pháp tạm:

**Pragmatic Phase 4d:** Server action trả `fieldErrors` deep-flatten. UI hiện chưa render được sub-field errors (kiến trúc Phase 3a chưa hỗ trợ). Nhưng **top-level error message** vẫn hiển thị qua `alert(res.error || ...)` (đã có). User nhìn alert + nhìn Console (em đã có console.warn) là biết.

Hoặc, làm thêm: trong `SiteCustomizerClient`, khi `fieldErrors` có data, hiển thị thêm 1 panel debug ở đầu form list tất cả field paths sai + message. Quick win, không phải refactor library:

```tsx
{fieldErrors && Object.keys(fieldErrors).length > 0 && (
  <div className="border border-rose-200 bg-rose-50 p-3 rounded-3 text-sm">
    <p className="font-semibold text-rose-700 mb-2">Lỗi validation:</p>
    <ul className="space-y-1">
      {Object.entries(fieldErrors).map(([path, msg]) => (
        <li key={path}>
          <code className="text-rose-600">{path}</code>: {msg}
        </li>
      ))}
    </ul>
  </div>
)}
```

Đây là `SiteCustomizerClient.tsx` change — KHÔNG vi phạm "không động library" vì client là wrapper, không phải library. OK update được.

---

## 3. Verify checklist

1. `pnpm install` (add 3 dnd-kit packages).
2. `pnpm build`, `pnpm lint`, `npx tsc --noEmit` clean.
3. Admin form `/admin/customize`:
   - Story → "Ảnh đặc trưng": mỗi item có 2 field (imgUrl + alt).
   - Values → "Các đặc trưng": mỗi item có 3 field (title + desc + icon picker).
   - Social: 1 field repeatable "Liên kết mạng xã hội" thay 3 field cứng cũ. Mỗi item có platform (select 8 option), url, visible.
   - Repeatable nào (story.features, values.items, social.links, faq.itemsRetail, faq.itemsB2b, homepage.sections, products.manualProductIds): bỏ nút ↑/↓, có drag handle `GripVertical` bên trái. Drag thật mượt với @dnd-kit.
4. Backward compat:
   - DB legacy `intro_feat_1_img_url` → reader build `story.features[0].imgUrl` đúng, `alt` = "".
   - DB legacy `value_1_title` + `value_1_desc` → reader build `values.items[0]` với title + desc đúng, `icon = "Sparkles"` (default).
   - DB legacy `contact_facebook` → reader build `social.links[0] = {platform: "facebook", url: ..., visible: true}`.
5. Save test:
   - Drag đổi thứ tự item trong values → save → reload giữ.
   - Add social platform mới (TikTok) → save → Footer hiện link mới.
   - Nhập URL invalid trong social.links[0].url → save fail → panel error đỏ ở đầu form hiện `social.links.0.url: ...`.
6. Storefront:
   - Story images render với alt attribute đúng (View Source check).
   - Values items hiện icon từ schema (`<Sparkles>` etc).
   - Footer render socials theo `links` array, ẩn cái `visible: false`.
   - FloatingActions Zalo hiện nếu có item zalo + visible.
7. `scripts/compare-html.ts`: nếu data default → byte-identical với master.

---

## 4. Non-goals Phase 4d

- ❌ Không touch SectionEditor/FieldRenderer/GroupFieldInput để pass nested error props (kiến trúc phức tạp, đẩy Phase 5).
- ❌ Không Draft/Preview/Publish (Phase 5).
- ❌ Không public endpoint `/api/site-config` (Phase 5).

---

## 5. Checklist PR

- [ ] `package.json` thêm 3 dep dnd-kit.
- [ ] Schema: story.features có `alt`, values.items có `icon`, social.links repeatable.
- [ ] Reader custom backward compat cho social legacy.
- [ ] Validator zod đầy đủ.
- [ ] RepeatableEditor + ProductPickerFieldInput dùng @dnd-kit drag thật. Xóa nút ↑/↓.
- [ ] flattenZodErrors deep recurse.
- [ ] SiteCustomizerClient hiện error panel với dot-paths khi fail.
- [ ] StorySection render alt, ValuesSection render icon.
- [ ] Footer + FloatingActions migrate sang social.links.
- [ ] PR description 3 screenshot: (a) Values với icon picker mở, (b) drag item bằng dnd-kit, (c) Footer storefront social với 4+ platforms.

---

## 6. Phase 5 preview

- Public endpoint `/api/site-config` cho Header/Footer/FloatingActions consume server-side props (xoá client fetching, fix FOUC).
- Draft/Preview/Publish: thay đổi `prisma/schema.prisma` (`draftValue`, `publishedAt`), route `/?preview=true&token=...`.
- Improve nested error rendering trong library Phase 3a (refactor SectionEditor để pass nested errors path).

Phase 5 là cuối, hoàn thiện refactor.
