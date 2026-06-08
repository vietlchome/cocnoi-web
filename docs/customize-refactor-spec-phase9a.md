# Phase 9a spec - Schema taxonomy foundation

**Branch:** `feat/phase9a-taxonomy`
**Effort:** 8-10h
**Phụ thuộc:** Master tip `43054e4`
**Phase tiếp theo:** 9b (mega menu, dùng Finish từ 9a)

## 1. Mục tiêu

Cleanup hệ thống taxonomy Product trước khi build mega menu:
1. **Migrate Size sang global** (drop `categoryId`, nhất quán với Color).
2. **Thêm Model FinishOption** M2M với Product, 5 default Finish.
3. **Admin UI quản lý Finish** trong `/admin/products/settings`.
4. **Product form toggle pills** chọn Finish cho sản phẩm.

KHÔNG đụng frontend storefront (mega menu chưa thay đổi).

## 2. Scope

### 2.1 Prisma schema changes

**SizeOption (modify):**
```prisma
model SizeOption {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  sortOrder   Int       @default(0)
  
  products    Product[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

Drop:
- `categoryId` field + FK
- `@@unique([name, categoryId])` constraint

Add:
- `slug` field unique
- `name` unique (replace composite)
- `description` optional

**FinishOption (new):**
```prisma
model FinishOption {
  id          String    @id @default(cuid())
  name        String    @unique
  slug        String    @unique
  description String?
  imageUrl    String?
  sortOrder   Int       @default(0)
  
  products    Product[]
  
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

**Product (modify):**
```prisma
model Product {
  // ... existing
  finishes    FinishOption[]   // M2M, Prisma tự tạo bảng trung gian
}
```

### 2.2 Migration script

File: `prisma/migrations/<timestamp>_phase9a_taxonomy/migration.sql`

Steps:
1. Backup `SizeOption` data (temp table hoặc dump JSON).
2. Generate slug cho mọi Size hiện có (slugify name).
3. Detect duplicate name khác category (vd "Lớn" trong Mugs + Beakers): append suffix "Lớn (Mugs)" "Lớn (Beakers)" để giữ unique. Vì data ít, có thể manual rename qua data script.
4. Drop FK `Size.categoryId → Category.id`.
5. Drop column `Size.categoryId`.
6. Drop unique `(name, categoryId)`, add unique `name` + unique `slug`.
7. Create `FinishOption` table.
8. Create `_FinishOptionToProduct` M2M.

### 2.3 Seed Finish defaults

File: `prisma/seed-finishes.ts`

```ts
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const FINISHES = [
  { name: "Vẽ tay thủ công", slug: "ve-tay-thu-cong", description: "Họa tiết vẽ trực tiếp bằng cọ trên bề mặt gốm.", sortOrder: 1 },
  { name: "Tráng men màu", slug: "trang-men-mau", description: "Phủ lớp men màu, bao gồm cả bóng và mát.", sortOrder: 2 },
  { name: "Tráng men hỏa biến", slug: "trang-men-hoa-bien", description: "Men chảy và hỏa biến, mỗi sản phẩm 1 vẻ duy nhất.", sortOrder: 3 },
  { name: "Khắc/dập nổi & chìm", slug: "khac-dap-noi-chim", description: "Họa tiết tạo bằng kỹ thuật khắc tay hoặc khuôn dập.", sortOrder: 4 },
  { name: "Nung củi", slug: "nung-cui", description: "Nung trong lò củi truyền thống Bát Tràng, tro củi tạo hiệu ứng tự nhiên.", sortOrder: 5 },
];

async function main() {
  for (const f of FINISHES) {
    await prisma.finishOption.upsert({
      where: { slug: f.slug },
      create: f,
      update: f,
    });
  }
  
  // Backfill: gắn finish "Tráng men màu" cho mọi product chưa có finish
  const defaultFinish = await prisma.finishOption.findUnique({ where: { slug: "trang-men-mau" }});
  if (!defaultFinish) throw new Error("Default finish not found");
  
  const productsWithoutFinish = await prisma.product.findMany({
    where: { finishes: { none: {}}},
    select: { id: true }
  });
  
  for (const p of productsWithoutFinish) {
    await prisma.product.update({
      where: { id: p.id },
      data: { finishes: { connect: [{ id: defaultFinish.id }]}}
    });
  }
  
  console.log(`Seeded ${FINISHES.length} finishes, backfilled ${productsWithoutFinish.length} products`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
```

Add to `package.json`:
```json
"scripts": {
  "db:seed-finishes": "tsx prisma/seed-finishes.ts"
}
```

Run sau migration deploy: `npm run db:seed-finishes`.

### 2.4 Admin Finish CRUD UI

**Route:** `/admin/products/settings` (extend page hiện có)

Section mới "HOÀN THIỆN" tương tự pattern Color section hiện tại:
- List Finish với drag handle, name, edit, delete buttons.
- Nút "+ Thêm mới" mở modal/inline form.
- Form fields: name (required), slug (auto-gen từ name, editable), description (textarea optional), imageUrl (Cloudinary upload optional), sortOrder (auto từ drag).
- Drag reorder dùng `@dnd-kit` (đã có trong project).

**Server actions (`src/lib/actions/finish.actions.ts` mới):**
```ts
"use server";

export async function createFinish(data: FinishInput) {...}
export async function updateFinish(id: string, data: FinishInput) {...}
export async function deleteFinish(id: string) {
  // Check products đang dùng
  const productCount = await prisma.product.count({
    where: { finishes: { some: { id }}}
  });
  if (productCount > 0) {
    return { error: `${productCount} sản phẩm đang dùng kỹ thuật này. Xóa sẽ unlink khỏi products. Vẫn tiếp tục?` };
  }
  await prisma.finishOption.delete({ where: { id }});
}
export async function reorderFinishes(ids: string[]) {...}
```

**API endpoint:** `/api/admin/finishes` GET for listing in product form.

### 2.5 Product form toggle pills

File: `src/components/admin/products/ProductForm.tsx`

Add field group "Hoàn thiện":

```tsx
const [selectedFinishIds, setSelectedFinishIds] = useState<string[]>(
  product?.finishes?.map(f => f.id) ?? []
);

<div className="mb-6">
  <label className="block font-medium mb-2">
    Hoàn thiện <span className="text-stone-500 text-sm">(chọn 1-3 kỹ thuật)</span>
  </label>
  <div className="flex flex-wrap gap-2">
    {allFinishes.map(f => {
      const isSelected = selectedFinishIds.includes(f.id);
      return (
        <button
          key={f.id}
          type="button"
          onClick={() => {
            setSelectedFinishIds(prev =>
              prev.includes(f.id)
                ? prev.filter(id => id !== f.id)
                : [...prev, f.id]
            );
          }}
          className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
            isSelected
              ? "bg-deep-indigo text-warm-white"
              : "bg-cream text-deep-indigo hover:bg-sand"
          }`}
        >
          {isSelected && "✓ "}{f.name}
        </button>
      );
    })}
  </div>
  <input type="hidden" name="finishIds" value={JSON.stringify(selectedFinishIds)} />
</div>
```

**Service update (`product.service.ts`):**

Khi save Product, parse `finishIds` từ form, dùng `finishes: { set: ids.map(id => ({ id }))}` để update M2M.

### 2.6 Type updates

`src/lib/types/product.ts` (hoặc tương đương):
- Thêm `finishes: FinishOption[]` vào Product type.

## 3. Acceptance criteria

### 3.1 Database
- [ ] `SizeOption.categoryId` đã drop hoàn toàn.
- [ ] `SizeOption.slug` unique field tồn tại.
- [ ] `FinishOption` table tồn tại với 5 rows default sau seed.
- [ ] `_FinishOptionToProduct` M2M table tồn tại.
- [ ] Backfill: 100% products hiện có gắn finish "Tráng men màu".
- [ ] Không có data loss (count products trước = sau).
- [ ] Existing sizes giữ nguyên name (chỉ thay đổi constraint).

### 3.2 Admin UI
- [ ] `/admin/products/settings` có section "HOÀN THIỆN" với 5 default items.
- [ ] Thêm Finish mới hoạt động, save persist DB.
- [ ] Sửa Finish (name, description, imageUrl) hoạt động.
- [ ] Xóa Finish hiện cảnh báo nếu có products dùng.
- [ ] Drag-and-drop reorder persists `sortOrder` đúng.

### 3.3 Product form
- [ ] Tạo product mới: 5 finish pills hiện ra, click toggle on/off.
- [ ] Save product với 2-3 finish chọn, DB persist M2M đúng.
- [ ] Sửa product hiện có: pills check ✓ những finish đã chọn.
- [ ] Bỏ chọn finish và save: M2M unlink đúng.

### 3.4 Existing functionality không vỡ
- [ ] Product list, detail vẫn render OK (kể cả khi có finish data).
- [ ] Existing size selection trong product form vẫn hoạt động (Size global, dropdown thay vì lọc theo category).
- [ ] Order/Inquiry/Cart flow không break.
- [ ] Admin sidebar, customize, blog editor không bị ảnh hưởng.

### 3.5 Build + test
- [ ] `npx prisma migrate dev` pass.
- [ ] `npm run db:seed-finishes` pass.
- [ ] `npm run build` pass.
- [ ] `tsc --noEmit` pass.
- [ ] No console errors khi load admin pages.

## 4. Migration order

1. Branch `feat/phase9a-taxonomy` từ master.
2. Edit `prisma/schema.prisma`.
3. Run `npx prisma migrate dev --name phase9a_taxonomy` local.
4. Create `prisma/seed-finishes.ts` + run local.
5. Verify dev DB OK.
6. Create `finish.actions.ts` server actions.
7. Extend admin settings page với Finish CRUD section.
8. Update ProductForm với toggle pills.
9. Type updates.
10. Build + manual test E2E.
11. Commit (3-5 commits logical).
12. Push PR.

## 5. Out of scope

- Mega menu / Navigation schema (Phase 9b).
- Hero video (Phase 9c).
- Route rename `/shop` → `/cua-hang` (Phase 9c).
- Footer cleanup, stub pages (Phase 9d).

## 6. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Size duplicate name khác category | Detect trong migration script, append " (Mugs)" suffix nếu collision |
| Backfill 100+ products chậm | Chấp nhận, run 1 lần sau deploy |
| Existing Size data corrupted khi drop categoryId | Backup table trước, rollback script ready |

---

Antigravity start with section 4 migration order. Section 3 acceptance criteria là checklist self-test trước khi push PR.
