# Phase 4b — Product Picker + Cleanup

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 4a merged tại `131bc28`).
**Branch name:** `feature/phase-4b-product-picker`.

**Mục tiêu:** Owner chọn tay sản phẩm hiển thị ở section "Sản phẩm nổi bật" qua UI modal trong admin form. Bonus cleanup: tắt double-tracking GA + tighten image validation.

---

## 0. Bối cảnh

Storefront `(store)/page.tsx` (dòng 50-78) đã có logic đọc `featured_products_manual_ids` (flat key JSON array of product IDs) cho mode `manual`. Hiện tại admin **chưa có UI** để chọn — owner phải edit DB trực tiếp.

Phase 4b sẽ:
1. Thêm field mới `manualProductIds: type "product-picker"` vào schema `products` section.
2. Tạo component `ProductPickerFieldInput.tsx` (modal search + multi-select + reorder, lưu mảng ID).
3. Wire vào `FieldRenderer.tsx` (case mới).
4. Backward compat: reader đọc field mới từ blob + fallback alias `featured_products_manual_ids` cũ.
5. Storefront sửa: đọc từ `config.products.manualProductIds` thay vì `SettingsService.getValue("featured_products_manual_ids")`.
6. Cleanup: xóa legacy `<GoogleAnalytics>` ở root layout (Phase 4a đã có analytics ở store layout).
7. Stricter image validation: regex URL hoặc absolute path.

---

## 1. Scope Phase 4b (strict)

**Files được phép sửa:**
- `src/config/site-schema.ts` — thêm field `manualProductIds`
- `src/lib/site-config-validate.ts` — zod cho mảng product IDs + tighten imageValidator
- `src/lib/site-config.ts` — reader handle `product-picker` type + alias fallback
- `src/components/admin/customize/FieldRenderer.tsx` — thêm case `"product-picker"`
- `src/components/admin/customize/fields/ProductPickerFieldInput.tsx` — **NEW component**
- `src/app/api/admin/products/route.ts` — bổ sung GET endpoint (list products cho picker)
- `src/app/(store)/page.tsx` — đọc từ config thay vì SettingsService
- `src/app/layout.tsx` — xóa legacy `<GoogleAnalytics>` + import
- `docs/customize-refactor-tasks.md` — update status

**Cấm động:**
- Library Phase 3a khác (`SectionEditor`, `RepeatableEditor`, các `*FieldInput` cũ)
- `SiteCustomizerClient.tsx` — admin form vẫn auto-render
- `settings.actions.ts`, `settings.service.ts`
- `ProductService` (chỉ tiêu thụ, không sửa)
- `prisma/schema.prisma`
- Sandbox + các route admin khác

---

## 2. Detailed task breakdown

### 2.1. Schema: thêm `manualProductIds` field

**File:** `src/config/site-schema.ts`

Trong section `products`:

```ts
products: {
  label: "Sản phẩm nổi bật",
  fields: {
    tagline: { ... },
    title: { ... },
    desc: { ... },
    type: {
      type: "select",
      label: "Cách chọn SP",
      default: "latest",
      options: [
        { value: "latest", label: "Mới nhất" },
        { value: "bestseller", label: "Bán chạy" },
        { value: "manual", label: "Chọn tay" }
      ],
      aliases: ["featured_products_type"]
    },
    // ⬇ THÊM:
    manualProductIds: {
      type: "product-picker",
      label: "Danh sách sản phẩm chọn tay",
      default: [],
      aliases: ["featured_products_manual_ids"],
      helpText: "Chỉ áp dụng khi 'Cách chọn SP' = 'Chọn tay'. Drag để đổi thứ tự."
    }
  }
}
```

Type `"product-picker"` đã có trong `FieldType` union từ Phase 1 (line 11 `site-schema.ts`) — không cần thêm. Hoặc nếu chưa có, thêm vào `FieldType` union.

### 2.2. Reader

**File:** `src/lib/site-config.ts`

Trong `resolveField`, thêm xử lý `product-picker`:

```ts
// Trước fallback default
if (fieldDef.type === 'product-picker' as any) {
  // Đọc alias: flat key JSON string of array
  if (fieldDef.aliases) {
    for (const alias of fieldDef.aliases) {
      if (dbSettings[alias] !== undefined && dbSettings[alias] !== '') {
        try {
          const parsed = JSON.parse(dbSettings[alias]);
          if (Array.isArray(parsed)) return parsed.filter((id): id is string => typeof id === 'string');
        } catch {}
      }
    }
  }
  return fieldDef.default ?? [];
}
```

Đặt block này SAU repeatable handlers, TRƯỚC generic aliases handler.

### 2.3. Validator

**File:** `src/lib/site-config-validate.ts`

```ts
// Tighten image validator: regex URL hoặc absolute path
const imageValidator = z.string().regex(
  /^(https?:\/\/.+|\/[^\/].*|)$/,
  "Image phải là URL hợp lệ, đường dẫn tuyệt đối (/path), hoặc để trống"
);

// Trong products section:
products: z.object({
  tagline: textValidator,
  title: textValidator,
  desc: textValidator,
  type: z.enum(["latest", "bestseller", "manual"]),
  manualProductIds: z.array(z.string()),
}),
```

**Lưu ý imageValidator:** Hiện `imageValidator = z.string()` chấp nhận mọi chuỗi. Sau khi tighten, kiểm tra mọi field type `image` trong schema có giá trị mặc định "" hoặc URL hợp lệ. Test pass trước khi commit.

### 2.4. ProductPickerFieldInput component

**File:** `src/components/admin/customize/fields/ProductPickerFieldInput.tsx`

```tsx
"use client";

import { useState, useEffect } from "react";
import { Plus, X, Search, Loader2, GripVertical } from "lucide-react";

interface ProductPickerFieldInputProps {
  field: { label: string; helpText?: string };
  value: string[];
  onChange: (next: string[]) => void;
  path: string;
  error?: string;
  disabled?: boolean;
}

interface Product {
  id: string;
  name: string;
  sku?: string | null;
  price: number;
  images?: string[];
}

export default function ProductPickerFieldInput({ field, value, onChange, path, error, disabled }: ProductPickerFieldInputProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  // Lazy load product list khi mở modal
  useEffect(() => {
    if (!modalOpen || allProducts.length > 0) return;
    setLoading(true);
    fetch('/api/admin/products?published=true')
      .then(r => r.json())
      .then(data => setAllProducts(data.data ?? []))
      .catch(() => setAllProducts([]))
      .finally(() => setLoading(false));
  }, [modalOpen]);

  const selectedIds = value || [];
  const selectedProducts = selectedIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => !!p);

  const availableProducts = allProducts.filter(
    p => !selectedIds.includes(p.id) && 
         (search === "" || p.name.toLowerCase().includes(search.toLowerCase()))
  );

  const addProduct = (id: string) => onChange([...selectedIds, id]);
  const removeProduct = (id: string) => onChange(selectedIds.filter(x => x !== id));
  
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...selectedIds];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    onChange(next);
  };
  const moveDown = (idx: number) => {
    if (idx === selectedIds.length - 1) return;
    const next = [...selectedIds];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    onChange(next);
  };

  return (
    <div className={`flex flex-col gap-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>
      <label className="text-sm font-semibold text-primary">{field.label}</label>
      {field.helpText && <p className="text-xs text-secondary">{field.helpText}</p>}
      
      {/* Selected list */}
      <div className="flex flex-col gap-2">
        {selectedProducts.length === 0 ? (
          <p className="text-sm text-secondary italic p-3 border border-dashed border-border rounded-3">
            Chưa chọn sản phẩm nào.
          </p>
        ) : (
          selectedProducts.map((p, idx) => (
            <div key={p.id} className="flex items-center gap-2 p-2 bg-subtle/30 border border-border rounded-3">
              <span className="text-xs text-secondary w-6">{idx + 1}.</span>
              {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-2" />}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-primary truncate">{p.name}</p>
                {p.sku && <p className="text-xs text-secondary">{p.sku}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => moveUp(idx)} disabled={idx === 0} className="p-1.5 hover:bg-canvas rounded-2 disabled:opacity-30">↑</button>
                <button onClick={() => moveDown(idx)} disabled={idx === selectedProducts.length - 1} className="p-1.5 hover:bg-canvas rounded-2 disabled:opacity-30">↓</button>
                <button onClick={() => removeProduct(p.id)} className="p-1.5 hover:bg-rose-50 text-rose-500 rounded-2"><X className="w-4 h-4" /></button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="flex items-center justify-center gap-2 p-2 border border-dashed border-border rounded-3 text-sm text-primary hover:bg-subtle/30"
      >
        <Plus className="w-4 h-4" />
        Thêm sản phẩm
      </button>

      {error && <p className="text-xs text-rose-500">{error}</p>}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setModalOpen(false)}>
          <div className="bg-canvas rounded-4 p-5 w-full max-w-2xl max-h-[80vh] flex flex-col gap-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg">Chọn sản phẩm</h3>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo tên..."
                className="w-full pl-10 pr-3 py-2 border border-border rounded-3 bg-canvas"
              />
            </div>
            <div className="flex-1 overflow-y-auto flex flex-col gap-1">
              {loading ? (
                <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin" /></div>
              ) : availableProducts.length === 0 ? (
                <p className="text-sm text-secondary text-center p-4">Không có sản phẩm nào khớp.</p>
              ) : (
                availableProducts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => { addProduct(p.id); setSearch(""); }}
                    className="flex items-center gap-3 p-2 hover:bg-subtle/50 rounded-2 text-left"
                  >
                    {p.images?.[0] && <img src={p.images[0]} alt="" className="w-12 h-12 object-cover rounded-2" />}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-primary truncate">{p.name}</p>
                      {p.sku && <p className="text-xs text-secondary">{p.sku}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

**Drag-reorder Phase 4b CHƯA bắt buộc** — dùng nút `↑/↓` như spec. `@dnd-kit` để Phase 4c.

### 2.5. FieldRenderer case

**File:** `src/components/admin/customize/FieldRenderer.tsx`

Thêm case:

```tsx
case "product-picker": {
  const v = Array.isArray(value) ? (value as string[]) : [];
  return (
    <ProductPickerFieldInput
      field={field as Extract<SchemaField, { type: 'product-picker' }>}
      value={v}
      onChange={onChange as (next: string[]) => void}
      path={path}
      error={error}
      disabled={disabled}
    />
  );
}
```

Import `ProductPickerFieldInput` ở đầu file.

### 2.6. API GET endpoint

**File:** `src/app/api/admin/products/route.ts`

Bổ sung GET handler:

```ts
import { ProductService } from "@/lib/services/product.service";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (authError: any) {
    return NextResponse.json(
      { error: authError.message || "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const published = searchParams.get('published');

  try {
    const products = await ProductService.listProducts({
      // Antigravity tự xem signature của listProducts trong product.service.ts
      // để pass đúng params (publishedOnly, take limit cao như 200, etc.)
    });
    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

Antigravity kiểm tra `ProductService.listProducts` signature thật trước khi viết. Field trả về tối thiểu: `id`, `name`, `sku`, `price`, `images` (cho picker UI).

### 2.7. Storefront update

**File:** `src/app/(store)/page.tsx`

Đổi dòng 54-66 (đọc `featured_products_manual_ids`) thành đọc qua `config.products.manualProductIds`:

```ts
if (displayType === "manual") {
  const manualIds = config.products.manualProductIds || [];
  if (manualIds.length > 0) {
    sortedProducts = manualIds
      .map(id => dbProducts.find(p => p.id === id))
      .filter((p): p is typeof dbProducts[number] => !!p);
  }
}
```

Bỏ block try/catch parse JSON từ `SettingsService.getValue()` — config đã handle.

### 2.8. Cleanup legacy GA

**File:** `src/app/layout.tsx`

Xóa:
```ts
// import { GoogleAnalytics } from "@next/third-parties/google";  ❌ XÓA
// <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />  ❌ XÓA
```

Lý do: Phase 4a đã đặt GA4 ở `(store)/layout.tsx` với conditional load. Giữ cả 2 → double tracking + tracking admin user.

Nếu env var `NEXT_PUBLIC_GA_MEASUREMENT_ID` đang dùng ở chỗ khác trong code, search trước khi xóa. Nếu không (likely chỉ ở layout này), xóa env var khỏi `.env*` files cũng được.

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. Mở `/admin/customize`:
   - Accordion **"Sản phẩm nổi bật"** có field mới "Danh sách sản phẩm chọn tay".
   - Click "+ Thêm sản phẩm" → modal mở, fetch product list, hiển thị grid.
   - Search filter hoạt động.
   - Click 1 sản phẩm → modal đóng (hoặc giữ mở tùy UX), sản phẩm xuất hiện trong selected list.
   - Bấm `↑/↓` đổi thứ tự, bấm `X` xóa.
   - Lưu → reload trang → giá trị giữ nguyên (mảng ID).
3. Storefront test:
   - Đổi `config.products.type = "manual"` + chọn 3 sản phẩm.
   - Mở `/` → section "Sản phẩm nổi bật" hiển thị đúng 3 sản phẩm theo thứ tự đã chọn.
4. Backward compat:
   - DB có legacy key `featured_products_manual_ids` = `["id1","id2"]` (flat string).
   - KHÔNG có `manualProductIds` trong blob `section.products`.
   - Reload `/admin/customize` → form hiện 2 sản phẩm từ alias cũ.
   - Save → blob mới có `manualProductIds` = `["id1","id2"]`.
5. Cleanup GA:
   - View source `/admin/customize` → KHÔNG có `<script src=".*googletagmanager.*">` (không track admin).
   - View source `/` → CÓ script GA4 nếu owner đã save `analytics.googleAnalyticsId`.
6. Image validation:
   - Vào field image bất kỳ (vd `hero.imageUrl`), paste invalid string `not-a-url`, Save → fail với error inline đỏ.
   - Paste `/images/hero.jpg` (absolute path) hoặc `https://example.com/hero.jpg` → success.
7. `scripts/compare-html.ts` so với master:
   - Nếu owner không config manual products → byte-identical.
   - Nếu config → diff đúng products section.

---

## 4. Non-goals Phase 4b

- ❌ Không drag-and-drop thật `@dnd-kit` (Phase 4c).
- ❌ Không Header/Hero/Campaign CTA URLs (Phase 4c).
- ❌ Không Story/Values/Social repeatable upgrade (Phase 4c).
- ❌ Không FAQ collapse-by-default (Phase 4c).
- ❌ Không section visibility/order (Phase 4c).
- ❌ Không Draft/Preview/Publish (Phase 5).
- ❌ Không public endpoint `/api/site-config` (Phase 5).

---

## 5. Checklist PR

- [ ] Schema có field mới `products.manualProductIds`.
- [ ] Component `ProductPickerFieldInput.tsx` mới.
- [ ] FieldRenderer có case `"product-picker"`.
- [ ] API GET `/api/admin/products` thêm.
- [ ] Storefront `(store)/page.tsx` đọc từ config.
- [ ] Root `layout.tsx` xóa `<GoogleAnalytics>` + import.
- [ ] Image validator tightened, mọi default value qua test.
- [ ] PR description 3 screenshot: (a) admin modal mở, (b) selected list với 3 sản phẩm, (c) homepage hiển thị đúng thứ tự.
- [ ] Verify backward compat với alias `featured_products_manual_ids` cũ.

---

## 6. Phase 4c preview

- 4.1 Header topBar link
- 4.2 Hero CTA URLs (group)
- 4.3 Campaign CTA (group)
- 4.5 Story features repeatable + alt
- 4.6 Values items + icon picker
- 4.7 FAQ collapse-by-default + `@dnd-kit` drag reorder thật
- 4.9 Social repeatable + platform select
- 4.11 Section visibility/order (`homepage.sections`)

Phase 4c lớn, sẽ chia tiếp khi gần.
