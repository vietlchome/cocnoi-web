# Phase 9f spec - UX polish (mega menu compact + drag reorder + table overflow)

**Branch:** `feat/phase9f-ux-polish`
**Effort:** 3-4h
**Phụ thuộc:** Phase 9e merged
**Loại:** UX polish patch
**Executor:** Cline + DeepSeek v4

## 1. Mục tiêu

Polish UX cho 4 vấn đề user feedback sau khi Phase 9e merge:
1. **Mega menu "siêu to"**: thay `w-screen` full-width thành compact bounded dropdown style giống simple dropdown (KHÁM PHÁ/CỘNG ĐỒNG).
2. **Finish image field không cần thiết**: hide khỏi admin form (giữ DB column backward compat).
3. **Drag reorder cho Category + BST**: hiện chỉ Finish có drag, các taxonomy khác chưa có.
4. **Settings table delete icon overflow**: phải scroll ngang mới thấy nút xóa, fix responsive.

KHÔNG đụng:
- Schema database (chỉ render layer + admin UI).
- Phase 9e nav fix (đã merge).
- Featured cards data (giữ schema, hide render).

## 2. Quy tắc bắt buộc (Cline + DeepSeek follow)

- **KHÔNG dùng em-dash `—`**. Dùng dấu phẩy, dấu chấm, hoặc gạch nối ngắn `-`.
- **KHÔNG tự rename hoặc đổi label** ngoài spec (vd KHÔNG đổi "CỬA HÀNG" thành "Sản phẩm").
- **KHÔNG thêm dark mode `dark:*` variants**. Cốc Nối light theme only.
- **KHÔNG tự thêm tính năng ngoài scope** (vd KHÔNG add Size column vào mega menu).
- Code style: TypeScript strict, Next.js 16 App Router, Tailwind v4 (CSS variables via `bg-warm-white`/`text-deep-indigo`).
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- Tách commit theo logical unit (3-4 commits): mega menu / finish form / drag reorder / table overflow.

## 3. Scope

### 3.1 Mega menu compact

**File:** `src/components/store/MegaMenu.tsx`

**Vấn đề hiện tại:**
- Wrapper dùng `absolute top-full left-0 w-screen` chiếm toàn bộ viewport width.
- Padding `py-10 px-8` quá lớn cho nội dung 3-5 items/cột.
- 4 cột grid (3 cột + featured) tạo nhiều khoảng trống.
- Visual không đồng bộ với simple dropdown của KHÁM PHÁ/CỘNG ĐỒNG.

**Yêu cầu fix:**

```tsx
// TRƯỚC:
<div className="absolute top-full left-0 w-screen bg-warm-white shadow-xl pt-3 z-50">
  <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-8">
    {/* 3 col content + 1 col featured cards */}
  </div>
</div>

// SAU:
<div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 z-50">
  <div className="bg-warm-white shadow-lg rounded border border-sand p-6 grid grid-cols-3 gap-6 min-w-[600px] max-w-[720px]">
    {/* Chỉ 3 cột: Danh mục, BST, Hoàn thiện */}
    {/* KHÔNG render featured cards section */}
  </div>
</div>
```

**Chi tiết:**
- Position: `left-1/2 -translate-x-1/2` (center under CỬA HÀNG nav item) thay vì `left-0 w-screen`.
- Wrapper width: `min-w-[600px] max-w-[720px]` để bounded, không quá rộng.
- Padding: `p-6` thay `py-10 px-8`.
- Grid: `grid-cols-3 gap-6` (3 cột text only).
- Style: `shadow-lg rounded border border-sand` match SimpleSubmenu component.
- Background: `bg-warm-white` (giữ nguyên, đã đúng).

**Quan trọng:**
- **KHÔNG render block featured cards** (`config.megaMenu.featuredCards`). Giữ schema field nhưng skip render `<div className="col-span-3 grid grid-rows-2 gap-3">`.
- **KHÔNG xóa** code logic fetch featured cards data, chỉ skip JSX render.
- Hover bridge `pt-3` GIỮ NGUYÊN từ Phase 9e (mouse di chuột nhanh không mất hover).

**Mobile (`MegaMenuMobile.tsx`):**
- Mobile vẫn render accordion 3 group (Danh mục/BST/Hoàn thiện) như Phase 9b.
- KHÔNG render featured cards stack ở mobile.

### 3.2 Hide Finish image field

**File:** `src/components/admin/CatalogSettingsClient.tsx` (hoặc file chứa Finish form)

**Vấn đề hiện tại:**
- Finish form có field "Ảnh minh họa" (imageUrl) với Cloudinary upload.
- User feedback: không cần thiết, làm form rườm rà.

**Yêu cầu fix:**
- **Comment out hoặc remove block JSX** render imageUrl field trong form thêm/sửa Finish.
- **GIỮ field `imageUrl` trong DB Prisma schema** (không migration, không drop column).
- **GIỮ field trong Zod validator** (optional). Nếu future muốn restore, chỉ uncomment JSX.

**Code change minimal:**

```tsx
// Trong Finish form modal/inline:
// TRƯỚC:
<div className="mb-4">
  <label>Ảnh minh họa (tùy chọn)</label>
  <ImageCropUploader value={imageUrl} onChange={setImageUrl} />
</div>

// SAU:
{/* Phase 9f: Hide imageUrl field per user feedback. Keep DB column for backward compat. */}
{/* <div className="mb-4">
  <label>Ảnh minh họa (tùy chọn)</label>
  <ImageCropUploader value={imageUrl} onChange={setImageUrl} />
</div> */}
```

Sử dụng JSX comment để rõ intent + dễ restore. KHÔNG xóa hẳn code.

### 3.3 Drag reorder cho Category + BST

**File:** `src/components/admin/CatalogSettingsClient.tsx`

**Vấn đề hiện tại:**
- Tab Finish có drag-and-drop reorder dùng `@dnd-kit`.
- Tab Category + Collection (BST) **KHÔNG có** drag handle. Admin không thể sắp xếp thứ tự hiển thị.

**Yêu cầu fix:**

**Prisma schema check:**
- Verify `Category` model có field `sortOrder Int @default(0)` không. Nếu chưa, **ADD field này** qua migration.
- Verify `Collection` model có field `sortOrder Int @default(0)` không. Nếu chưa, **ADD field này** qua migration.

**Nếu migration cần:**
```prisma
model Category {
  // ... existing
  sortOrder Int @default(0)
}

model Collection {
  // ... existing
  sortOrder Int @default(0)
}
```

Run: `npx prisma migrate dev --name phase9f_category_collection_sort`.

**Service layer (`category.service.ts`, `collection.service.ts` hoặc tương đương):**
- Update `getAllCategories()` orderBy `sortOrder asc`.
- Update `getAllCollections()` orderBy `sortOrder asc`.
- Add `reorderCategories(ids: string[])` function (giống `reorderFinishes`).
- Add `reorderCollections(ids: string[])` function.

**Server actions:**
- Add `reorderCategoriesAction(ids: string[])` trong `category.actions.ts`.
- Add `reorderCollectionsAction(ids: string[])` trong `collection.actions.ts`.

**Admin UI (`CatalogSettingsClient.tsx`):**
- Apply pattern @dnd-kit (DndContext + SortableContext + useSortable) cho tab Category list.
- Apply pattern @dnd-kit cho tab Collection list.
- Drag handle visual: drag dots icon ở left mỗi row (consistent với Finish tab).
- onDragEnd: call `reorderCategoriesAction` hoặc `reorderCollectionsAction` với ids array mới.

**Optimistic UI:**
- Update local state ngay khi drag, sau đó fire server action background.
- Nếu server action fail: revert + toast error.

**Storefront impact:**
- Mega menu cột "Danh mục" hiện đã orderBy `sortOrder asc` (verify trong `MegaMenu.tsx`).
- Mega menu cột "BST" tương tự.
- Nếu chưa: update query `prisma.category.findMany({ orderBy: { sortOrder: "asc" }})`.

### 3.4 Settings table delete icon overflow

**File:** `src/components/admin/CatalogSettingsClient.tsx`

**Vấn đề hiện tại:**
- Bảng list (Category/Collection/Size/Finish) có columns: drag handle, name, description, image (nếu có), edit button, **delete button**.
- Narrow viewport hoặc bảng quá nhiều column: delete button bị cắt khỏi viewport, user phải scroll ngang mới thấy.

**Yêu cầu fix:**

**Option A (em recommend) - Sticky action column:**
```tsx
<table className="w-full">
  <thead>
    <tr>
      <th>Drag</th>
      <th>Tên</th>
      <th>Mô tả</th>
      <th className="sticky right-0 bg-warm-white shadow-md">Thao tác</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td className="sticky right-0 bg-warm-white shadow-md">
        <button>Sửa</button>
        <button>Xóa</button>
      </td>
    </tr>
  </tbody>
</table>
```

**Option B - Convert table sang grid layout:**
```tsx
<div className="grid grid-cols-[auto_1fr_2fr_auto] gap-2 items-center">
  {items.map(item => (
    <Fragment key={item.id}>
      <DragHandle />
      <span>{item.name}</span>
      <span className="text-stone-600 text-sm truncate">{item.description}</span>
      <div className="flex gap-2">
        <button>Sửa</button>
        <button>Xóa</button>
      </div>
    </Fragment>
  ))}
</div>
```

**Em recommend Option A.** Lý do:
- Ít refactor hơn (giữ table semantic).
- Sticky right column đảm bảo action luôn visible.
- Pattern phổ biến trong admin dashboards.

**Apply cho cả 4 tab:** Category, Collection, Size, Finish.

## 4. Acceptance criteria

### 4.1 Mega menu compact
- [ ] Desktop hover CỬA HÀNG: mega menu bounded width (600-720px), centered under nav item.
- [ ] Style match SimpleSubmenu: `shadow-lg rounded border border-sand`.
- [ ] Padding `p-6` (không quá lớn).
- [ ] 3 cột: Danh mục, BST, Hoàn thiện - text only.
- [ ] **KHÔNG render featured cards** (block đó skip).
- [ ] Click items navigate đúng URL filter.
- [ ] Hover bridge OK (mouse di chuột nhanh không mất hover).
- [ ] Mobile accordion vẫn render 3 group đúng.

### 4.2 Finish image field
- [ ] Form thêm/sửa Finish KHÔNG có field upload "Ảnh minh họa".
- [ ] DB Prisma `FinishOption.imageUrl` vẫn tồn tại (không drop).
- [ ] Zod validator vẫn accept `imageUrl?` (optional).
- [ ] Existing Finishes có imageUrl data: không bị xóa, chỉ ẩn UI.

### 4.3 Drag reorder
- [ ] Prisma `Category.sortOrder` field tồn tại.
- [ ] Prisma `Collection.sortOrder` field tồn tại.
- [ ] Admin tab Category: drag handle visible, kéo thả reorder, save persist.
- [ ] Admin tab Collection (BST): same.
- [ ] Refresh page: thứ tự giữ đúng `sortOrder asc`.
- [ ] Mega menu cột Danh mục/BST: hiển thị theo `sortOrder asc`.
- [ ] Storefront `/cua-hang` filter list categories/collections theo `sortOrder asc`.

### 4.4 Table overflow fix
- [ ] Settings page: action column (Sửa/Xóa) luôn visible kể cả viewport hẹp.
- [ ] Sticky right pattern hoặc grid layout không bị cắt.
- [ ] Test viewport 1024px, 768px (tablet), 1440px (desktop): OK.
- [ ] 4 tabs (Category, Collection, Size, Finish) đều apply fix.

### 4.5 Build + test
- [ ] `npx tsc --noEmit` PASS.
- [ ] `npm run build` PASS.
- [ ] No console errors.
- [ ] Migration `phase9f_category_collection_sort` chạy clean nếu cần.

## 5. Migration order (Cline execute theo thứ tự)

1. **Branch:** Create `feat/phase9f-ux-polish` từ master.
2. **Prisma schema:** Check Category + Collection có `sortOrder` chưa. Nếu chưa, add field + run `npx prisma migrate dev --name phase9f_category_collection_sort`.
3. **Mega menu compact:** Edit `src/components/store/MegaMenu.tsx` theo section 3.1.
4. **Mobile mega menu:** Edit `src/components/store/MegaMenuMobile.tsx` skip featured cards.
5. **Finish image hide:** Edit Finish form trong `CatalogSettingsClient.tsx` comment out imageUrl block.
6. **Drag reorder Category:** Add @dnd-kit pattern + service `reorderCategories` + action.
7. **Drag reorder Collection:** Same pattern.
8. **Storefront query orderBy:** Update mega menu + shop page queries với `orderBy: { sortOrder: "asc" }`.
9. **Table overflow:** Apply sticky right column cho 4 tabs.
10. **Test:** `npx tsc --noEmit` + `npm run build` PASS.
11. **Commit:** 4-5 commits logical:
    - `feat(phase9f): compact mega menu width + dropdown style`
    - `fix(phase9f): hide Finish imageUrl field in admin`
    - `feat(phase9f): drag reorder Category + Collection`
    - `fix(phase9f): sticky action column in settings tables`
12. **Push branch** + open PR với description copy section 4 acceptance.

## 6. Out of scope

- Size as 4th mega menu column (em decided skip, dùng Hoàn thiện thay thế).
- Featured cards render (skip, giữ schema future).
- Schema migration drop `FinishOption.imageUrl` (giữ DB).
- Brand config externalization (Phase 10).
- Sub-category routes `/cua-hang/[category]` (Phase 10).

## 7. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Mega menu compact bị cắt nội dung khi Category > 10 items | `max-h-[400px] overflow-y-auto` trong từng cột |
| Drag reorder fail save (network error) | Optimistic UI + revert + toast error |
| Migration sortOrder break existing data | Default `@default(0)` đảm bảo backward compat |
| Sticky column conflict với table-layout-fixed | Test cả 4 tabs sau apply |

## 8. Test checklist user manual (sau Cline push)

| Test case | Expected | Pass? |
|---|---|---|
| Desktop hover CỬA HÀNG | Mega menu compact ~700px wide, centered | |
| Desktop hover KHÁM PHÁ | Simple dropdown 4 items | |
| Style consistency CỬA HÀNG vs KHÁM PHÁ | Cùng shadow, rounded, border | |
| Admin tab Category drag reorder | Save + refresh giữ thứ tự | |
| Admin tab Collection drag reorder | Save + refresh giữ thứ tự | |
| Settings page narrow viewport | Nút Xóa vẫn visible không cần scroll | |
| Finish form (thêm mới) | Không có field "Ảnh minh họa" | |
| Mobile hamburger CỬA HÀNG accordion | 3 group expand đúng | |

---

**Cline instructions:**

1. Read `cline.md` project rules trước.
2. Read this spec đầy đủ.
3. Execute section 5 migration order.
4. Self-verify acceptance criteria section 4.
5. Push PR.

Brief, no surprises, no scope creep.
