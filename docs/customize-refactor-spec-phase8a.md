# Phase 8a - Pre-Launch Critical + B2B Convert + Polish

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 7 merged tại `2d23e90`).
**Branch name:** `feature/phase-8a-prelaunch-critical`.

**Mục tiêu:** Đưa code sẵn sàng public launch giai đoạn 0. Fix P0 blockers (image upload Vercel-ready, mock APIs, rate limit), thêm B2B Convert-to-Order workflow (lead → đơn) với hidden custom products, hide 8 stub pages khỏi sidebar, polish UI residual.

Phase 8b (sau soft launch): Excel bulk import + Blog editor.

---

## 0. Bối cảnh

Sau Phase 7 (PR #9 merged, master `2d23e90`):
- Lead gen mode active qua `NEXT_PUBLIC_ENABLE_CART=false` env flag.
- DB retry + FormErrorAlert applied cho 9 forms.
- Deployment guide `docs/deployment-vercel-hobby.md` ready.

User chốt strategic 2026-06-07 sau review tổng:
- B2C retail: dùng tạm cart/checkout đã code (mở UI sau).
- B2B (stockist + corporate): form lead → admin convert thành Order, có thể tạo custom product hidden cho đơn cụ thể.
- 8 stub pages (pricing, reviews, complaints, navigation, pages, notifications, bank-account, export) HIDE khỏi sidebar, không implement.
- Inventory + Blog: Phase 8b qua Excel bulk + Markdown editor.

Refer `D:\CỐC NỐI\07_Website\cocnoi-web\CLAUDE.md` cho brand rules. Read trước khi code.

---

## 1. Scope Phase 8a (strict)

### Part A - P0 Critical Blockers

A1. **Image upload Cloudinary migration** (5h)
A2. **Fix 3 mock API routes** (3h)
A3. **Fix /contact admin endpoint leak** (0.5h)
A4. **Rate limit public APIs** (2h)
A5. **ImageCropUploader UX fix** (1h)
A6. **HIDE 8 stub pages khỏi sidebar** (1h)

### Part B - B2B Convert-to-Order Workflow

B1. **Schema enhancements**: `inquiryType` enum + `convertedOrderId` FK + `sourceInquiryId` FK + Visibility enum thêm `HIDDEN` value (2h)
B2. **`/admin/inquiries` filter tabs theo inquiryType** (2h)
B3. **Convert-to-Order modal** trong inquiry detail page (4h)
B4. **Quick Create Product (custom B2B) form** trong convert flow (2h)

### Part C - Polish

C1. **PaymentInstructionsBlock bank name wrap fix** (0.5h)
C2. **/about redirect to /discover/our-story** (0.5h)
C3. **ReviewSection typo fix** "ệt vời!" → "Tuyệt vời!" (5 phút)
C4. **Replace placeholder bank info empty state** (0.5h)
C5. **Modal sizing audit** ProductDetailClient inquiry modal (1.5h)

### Part D - Performance

D1. **Prisma index basics cho 9 hot query patterns** (2h)

**Cấm động:**
- `src/components/admin/customize/**` (library Phase 3a)
- `src/components/admin/settings/SiteCustomizerClient.tsx`
- `src/lib/site-config.ts` (reader stable từ Phase 5)
- Sandbox route
- Library Phase 3a (FieldRenderer, SectionEditor, RepeatableEditor, *FieldInput)

---

## 2. Detailed task breakdown

### A1. Cloudinary image upload migration

**Why:** Vercel filesystem read-only. `writeFile()` ở `/api/admin/upload` route sẽ crash production.

**Pre-req:** Việt setup Cloudinary account free tier 25GB, lấy 3 env:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Lưu trong `.env.production` + Vercel dashboard.

**Files modify:**

- `src/app/api/admin/upload/route.ts`: thay logic `writeFile` bằng Cloudinary SDK upload.

```ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Trong handler:
for (const file of files) {
  // Validate MIME + size (giữ logic cũ)
  // Đọc file thành buffer
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  
  // Upload Cloudinary
  const result = await new Promise<any>((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder: relativeFolder ? `cocnoi/${relativeFolder}` : 'cocnoi/general',
        resource_type: 'image',
        // Auto optimize: format webp + quality auto
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
  
  uploadedUrls.push(result.secure_url);
}
```

**Install:** `npm install cloudinary`

**Migrate existing 4.5MB ảnh:**
- Tạo script `scripts/migrate-images-to-cloudinary.ts`: đọc `public/uploads/`, upload từng ảnh lên Cloudinary, output mapping cũ→mới.
- KHÔNG auto update DB URLs trong Phase 8a (rủi ro). User chạy script, save mapping, sau manually update qua admin form khi cần.

**Update `next.config.ts`:**
```ts
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'res.cloudinary.com' },
    // existing patterns
  ],
}
```

**Test:**
- Local dev: upload QR → URL trả về `https://res.cloudinary.com/cocnoi/...`
- Cloudinary dashboard hiện file.
- Storefront `<img src={url}>` hiện ảnh.

### A2. Fix 3 mock API routes

Per audit, 3 routes return success but không lưu DB:
- `PATCH /api/admin/inquiries/[id]` - mock status update
- `POST /api/admin/posts` - mock create post
- `POST /api/admin/settings` - mock save settings

**Fix path:**

Option A (preferred): xóa routes này hoàn toàn. UI không gọi nó (em verify), data flow đi qua server actions. Routes là dead code legacy Antigravity.

Verify: 
```bash
grep -rn "api/admin/inquiries.*PATCH\|api/admin/posts.*POST\|api/admin/settings.*POST" src/components src/app
```

Nếu output empty (chỉ self-reference trong route.ts) → SAFE TO DELETE.

Option B (safer): rewrite route gọi đúng service. Inquiries PATCH → `InquiryService.updateStatus`. Posts POST → `ContentService.createPost`. Settings POST → reject hoặc proxy qua action.

**Em yêu cầu Option A**: xóa thẳng mock routes. Giảm surface area + dead code. Verify không có caller trước.

### A3. /contact admin endpoint leak

**File:** `src/app/(store)/contact/page.tsx`

Tìm fetch `/api/admin/settings` (audit nói có ở line 14). Thay bằng:

```tsx
// Before
const settings = await fetch('/api/admin/settings').then(r => r.json());

// After (server component, dùng getSiteConfig trực tiếp):
import { getSiteConfig } from '@/lib/site-config';
const config = await getSiteConfig();
const contactInfo = config.contact;
```

Hoặc nếu contact page đang là client component, dùng `/api/site-config` (public endpoint Phase 5):
```tsx
const res = await fetch('/api/site-config');
const { data: config } = await res.json();
```

### A4. Rate limit public APIs

**Approach minimal:** in-memory rate limit by IP, không cần Redis.

**File mới:** `src/lib/utils/rate-limit.ts`

```ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(ip: string, limit: number = 10, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) return false;
  
  entry.count++;
  return true;
}

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of requestCounts) {
    if (now > entry.resetAt) requestCounts.delete(ip);
  }
}, 5 * 60_000);
```

**Apply trong routes:**
- `src/app/api/inquiry/route.ts`
- `src/app/api/inquiry/draft/route.ts`
- `src/app/api/contact/route.ts`

```ts
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip, 5, 60_000)) {
    return NextResponse.json(
      { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
      { status: 429 }
    );
  }
  // existing logic
}
```

5 requests/phút/IP cho inquiry. Đủ chống bot flood, không cản khách thật.

**Lưu ý:** In-memory rate limit reset khi server restart. Không persistent. Acceptable cho launch giai đoạn 0. Phase 9+ upgrade Upstash Redis nếu cần.

### A5. ImageCropUploader UX fix

**File:** `src/components/admin/ImageCropUploader.tsx`

Vấn đề: overlay "Xóa ảnh" hover đè trên image preview. Click vào image (intent xem URL/inspect) = trigger remove. User mất ảnh không cố ý.

**Fix:**

```tsx
// Before (current):
<div className="relative group">
  <img src={value} alt="Preview" />
  <button 
    onClick={() => onChange("")} 
    className="absolute inset-0 opacity-0 group-hover:opacity-100"
  >
    Xóa ảnh
  </button>
</div>

// After:
<div className="relative inline-block">
  <img src={value} alt="Preview" className="..." />
  <button 
    onClick={() => {
      if (confirm("Xóa ảnh này?")) onChange("");
    }}
    className="absolute top-1 right-1 w-6 h-6 bg-rose-500 text-canvas rounded-full flex items-center justify-center text-xs shadow-md"
    title="Xóa ảnh"
    type="button"
  >
    <X className="w-3 h-3" />
  </button>
</div>
```

Nút X nhỏ góc trên-phải, có confirm dialog trước khi xóa. Không đè trên image. Click image còn lại = không destructive.

### A6. HIDE 8 stub pages khỏi sidebar

**File:** `src/components/admin/AdminSidebar.tsx`

Tìm menu config trong sidebar component. Comment out hoặc remove items:
- products/pricing
- products/reviews
- complaints
- website/navigation
- website/pages
- settings/notifications
- settings/bank-account
- settings/export

**KHÔNG xóa pages files** (giữ stub) - chỉ ẩn khỏi navigation. Lý do: future Phase muốn implement, route đã có sẵn.

Inventory + journal/blogs **GIỮ visible** vì Phase 8b sẽ implement.

### B1. Schema enhancements

**File:** `prisma/schema.prisma`

```prisma
enum InquiryType {
  RETAIL_B2C        // Đặt lẻ cá nhân
  WHOLESALE_B2B     // Đăng ký đại lý / stockist
  CORPORATE_B2B     // Quà tặng doanh nghiệp
  CONTACT_GENERAL   // Liên hệ chung chưa có intent mua
}

enum Visibility {
  PUBLIC            // hiện trên storefront
  B2B_ONLY          // (existing) chỉ hiện cho B2B context
  HIDDEN            // (new) ẩn hoàn toàn, dùng cho custom B2B orders
}

model OrderInquiry {
  // existing fields...
  inquiryType       InquiryType  @default(RETAIL_B2C)
  convertedOrderId  String?      @unique
  convertedAt       DateTime?
  convertedOrder    Order?       @relation(fields: [convertedOrderId], references: [id], onDelete: SetNull)
  // ...
  
  @@index([status, inquiryType, createdAt])
}

model Order {
  // existing fields...
  sourceInquiryId   String?      @unique
  sourceInquiry     OrderInquiry? @relation(...)
  // ...
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_inquiry_type_and_convert_link
```

**Backfill existing inquiries:**
- Set `inquiryType = WHOLESALE_B2B` for inquiries có source = "Stockist Application"
- Set `inquiryType = CORPORATE_B2B` for source = "Corporate Gifting Inquiry"
- Set `inquiryType = RETAIL_B2C` for source = sản phẩm hoặc "Trang Đối Tác B2B" (catch-all)
- Default RETAIL_B2C cho rest

Migration script (chạy 1 lần): `scripts/backfill-inquiry-types.ts`.

### B2. Admin inquiries filter tabs

**File:** `src/app/(admin)/admin/inquiries/page.tsx`

Convert thành page với tabs filter:

```tsx
const tabs = [
  { key: 'all', label: 'Tất cả' },
  { key: 'RETAIL_B2C', label: 'Khách lẻ' },
  { key: 'WHOLESALE_B2B', label: 'Đại lý' },
  { key: 'CORPORATE_B2B', label: 'Quà tặng DN' },
  { key: 'CONTACT_GENERAL', label: 'Liên hệ chung' },
];

// Query filter:
const inquiries = await InquiryService.list({ 
  inquiryType: activeTab !== 'all' ? activeTab : undefined,
  status: filterStatus,
});
```

UI tabs ngang ở top, count badge per tab (vd "Đại lý (3)").

### B3. Convert-to-Order modal

**File mới:** `src/app/(admin)/admin/inquiries/[id]/ConvertOrderModal.tsx`

Hoặc modify inquiry detail page (em check file structure):

```tsx
"use client";

export default function ConvertOrderModal({ inquiry, products, onClose }) {
  const [step, setStep] = useState<'select-products' | 'order-info'>('select-products');
  const [orderItems, setOrderItems] = useState<Array<{ productId: string; quantity: number; unitPrice: number }>>([]);
  // ...
  
  return (
    <Modal title="Chuyển Lead sang Đơn">
      {step === 'select-products' && (
        <>
          {/* Tab "SP có sẵn" + "Tạo SP mới custom" */}
          <Tabs>
            <Tab label="SP có sẵn">
              <ProductSearchPicker 
                products={products}  // includes PUBLIC + HIDDEN + B2B_ONLY
                onSelect={(p) => addOrderItem(p)}
              />
              {/* Render orderItems list với edit qty + price */}
            </Tab>
            <Tab label="Tạo SP mới (custom B2B)">
              <QuickCreateProductForm 
                defaultVisibility="HIDDEN"
                onCreate={(newProduct) => addOrderItem(newProduct)}
              />
            </Tab>
          </Tabs>
          <button onClick={() => setStep('order-info')}>Tiếp tục</button>
        </>
      )}
      
      {step === 'order-info' && (
        <>
          {/* Pre-fill từ inquiry */}
          <input value={customerName} ... />
          <input value={customerPhone} ... />
          <textarea value={shippingAddress} ... />
          <select value={paymentMethod}>...</select>
          <textarea placeholder="Ghi chú internal (vd: Cọc 50%)" />
          
          <button onClick={handleConvert}>Tạo đơn hàng</button>
        </>
      )}
    </Modal>
  );
}
```

**Handler `handleConvert`:**

```ts
async function handleConvert() {
  // Server action: createOrderFromInquiry
  const order = await createOrderFromInquiry({
    inquiryId: inquiry.id,
    orderType: 'B2B',
    items: orderItems,
    customer: { ... },
    payment: { method: paymentMethod, status: 'PENDING' },
    internalNote: note,
  });
  
  // Action tự update inquiry.convertedOrderId + status = 'CONVERTED'
  // Redirect to /admin/orders/b2b/[id]
}
```

**Server action `createOrderFromInquiry`:**

File: `src/lib/actions/order.actions.ts` (add new function).

```ts
'use server';

export async function createOrderFromInquiry(data: {
  inquiryId: string;
  orderType: 'B2B' | 'RETAIL';
  items: Array<{ productId: string; quantity: number; unitPrice: number }>;
  customer: { name: string; phone: string; email?: string; shippingAddress: string };
  payment: { method: string; status: string };
  internalNote?: string;
}) {
  await requireAdmin();
  
  return await prisma.$transaction(async (tx) => {
    // 1. Create Order
    const totalAmount = data.items.reduce((sum, i) => sum + (i.quantity * i.unitPrice), 0);
    const order = await tx.order.create({
      data: {
        orderType: data.orderType,
        sourceInquiryId: data.inquiryId,
        customer: { ... },
        totalAmount,
        status: 'CONFIRMED',
        items: { create: data.items.map(i => ({ ... })) },
      },
    });
    
    // 2. Update Inquiry
    await tx.orderInquiry.update({
      where: { id: data.inquiryId },
      data: {
        status: 'CONVERTED',
        convertedOrderId: order.id,
        convertedAt: new Date(),
      },
    });
    
    // 3. Stock decrement nếu cần
    for (const item of data.items) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
    }
    
    return { success: true, orderId: order.id };
  });
}
```

### B4. Quick Create Product (custom B2B)

**Component:** `QuickCreateProductForm` (nằm trong ConvertOrderModal).

Form fields tối thiểu:
- Tên SP (text)
- SKU (auto-gen với prefix "B2B-" + timestamp, editable)
- Giá unit (number)
- Mô tả ngắn (optional textarea)
- Image upload (ImageCropUploader, optional)
- Visibility (default `HIDDEN`, có thể đổi `PUBLIC` nếu owner muốn lưu lại catalog public sau)

Submit:
```ts
async function handleQuickCreate(data: ProductData) {
  const product = await createProduct({
    ...data,
    visibility: data.visibility ?? 'HIDDEN',
    isActive: true,
  });
  
  onCreate(product);  // callback parent add to order items
}
```

Reuse `createProduct` action existing.

**Storefront filter:**

Update `/shop` page + product list queries → filter `visibility: 'PUBLIC'` only.

```ts
const products = await prisma.product.findMany({
  where: { 
    isActive: true,
    visibility: 'PUBLIC',  // hide B2B_ONLY + HIDDEN
  },
  // ...
});
```

Admin product list show all visibilities, có filter dropdown.

### C1-C5. Polish items

**C1 - bank name wrap fix:**

`PaymentInstructionsBlock.tsx`: chuyển bank info từ grid 2 col uniformly sang layout flex flexible:

```tsx
<div className="flex flex-col gap-3 text-xs">
  {/* Bank name full width */}
  <div>
    <span className="text-secondary block text-[10px] mb-0.5">Ngân hàng</span>
    <span className="font-semibold text-primary">{bankName}</span>
  </div>
  {/* 3 còn lại grid 2 col */}
  <div className="grid grid-cols-2 gap-x-3 gap-y-2">
    <div>Số TK + copy</div>
    <div>Chủ TK</div>
    <div className="col-span-2">Nội dung CK + copy</div>
  </div>
</div>
```

**C2 - /about redirect:**

`src/app/(store)/about/page.tsx` thay content bằng:
```tsx
import { redirect } from "next/navigation";
export default function AboutPage() {
  redirect("/discover/our-story");
}
```

Hoặc `next.config.ts` redirects (permanent 308):
```ts
{ source: '/about', destination: '/discover/our-story', permanent: true }
```

Em prefer next.config redirects vì SEO + simpler.

**C3 - ReviewSection typo:**

`src/components/store/ReviewSection.tsx` tìm "ệt vời!" → đổi "Tuyệt vời!". Grep dễ tìm.

**C4 - Placeholder bank info:**

`src/config/site-schema.ts` schema `payment_info` defaults hiện có ví dụ STK + name "NGUYEN VAN A"? Verify. Nếu có, đổi default empty string `""` để owner phải fill.

Hoặc nếu user đã fill data thật trong DB → ignore, default chỉ apply lần đầu.

Storefront PaymentInstructionsBlock: render empty state nếu data chưa fill: "Thông tin thanh toán đang cập nhật, vui lòng liên hệ Cốc Nối."

**C5 - Modal sizing audit:**

Em ngồi review từng modal/form scrollable:
- ProductDetailClient inquiry form: chiều cao OK?
- ProductDetailClient success modal: Phase 7 fix rồi nhưng test responsive.
- StockistApplicationForm: dài, có nên break ra page riêng?
- CorporateGiftingForm: tương tự.

Action: chỉ adjust modal `max-h-[85vh]` đảm bảo trên 768px (laptop) + 667px (mobile portrait small). Body scroll internal nếu cần.

### D1. Prisma index basics

**File:** `prisma/schema.prisma`

Thêm `@@index` cho 9 hot patterns (per audit report):

```prisma
model Order {
  // existing
  @@index([status, orderType, createdAt])
  @@index([customerId])
}

model OrderInquiry {
  // existing
  @@index([status, inquiryType, createdAt])
  @@index([customerId])
}

model Product {
  // existing
  @@index([isActive, visibility, categoryId])
  @@index([productGroupId])
}

model Review {
  // existing
  @@index([productId])
}

model Customer {
  // existing
  @@index([customerType])
}

model Notification {
  // existing
  @@index([isRead, createdAt])
}
```

Migration:
```bash
npx prisma migrate dev --name add_indexes_for_hot_queries
```

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. **Cloudinary upload**:
   - Tải QR ảnh trong `/admin/customize` → URL Cloudinary trả về.
   - View source `/shop/[product]` modal success → `<img src="https://res.cloudinary.com/...">`.
3. **3 mock routes deleted**: `grep -rn "api/admin/inquiries.*PATCH\|api/admin/posts.*POST" src/app` → empty.
4. **/contact**: open as guest (logout), page load OK, hiện info từ getSiteConfig.
5. **Rate limit**: spam 6 lần `/api/inquiry` POST cùng IP → request 6 trả 429.
6. **ImageCropUploader**: hover ảnh preview → KHÔNG có overlay đè. Click ảnh không trigger remove. Click nút X góc trên → confirm dialog → xóa.
7. **Sidebar admin**: 8 stub items KHÔNG còn trong nav. `/admin/products/inventory` + `/admin/website/blogs` VẪN visible cho Phase 8b.
8. **B2B Convert workflow**:
   - Tạo inquiry mới B2B (form Stockist hoặc Corporate).
   - Admin `/admin/inquiries` thấy inquiry, tab "Đại lý" hoặc "Quà tặng DN".
   - Click inquiry → "Convert to Order" modal mở.
   - Tab "SP có sẵn": chọn 1 SP, nhập SL=10, giá=300k → Add.
   - Tab "Tạo SP mới": tạo "Đôi cốc khắc logo Test" giá 350k → Add.
   - Step 2: pre-fill từ inquiry, complete form.
   - Save → check DB: Order tạo với orderType=B2B + sourceInquiryId set, Inquiry status=CONVERTED.
   - Storefront `/shop`: KHÔNG hiện "Đôi cốc khắc logo Test" (HIDDEN).
9. **Polish**:
   - Bank name dài "NGÂN HÀNG VIỆT NAM THỊNH VƯỢNG - VP BANK" hiện 1 dòng full-width không wrap ugly.
   - Truy cập `/about` → redirect `/discover/our-story`.
   - ReviewSection text "Tuyệt vời!" complete.
10. **Prisma index**: `npx prisma migrate status` clean. Migration apply OK.
11. **No em-dash** trong copy mới.

---

## 4. Non-goals Phase 8a

- ❌ Không implement 8 stub pages (Phase 8b/Phase 9+).
- ❌ Không Excel bulk import (Phase 8b).
- ❌ Không Blog editor (Phase 8b).
- ❌ Không EN/VN bilingual.
- ❌ Không Draft/Publish admin form.
- ❌ Không refactor admin UI framework.
- ❌ Không server-side analytics events.

---

## 5. Checklist PR

- [ ] Cloudinary integration: route updated + next.config.ts remote pattern + env vars documented in `.env.example`.
- [ ] 3 mock routes deleted (verify no caller before delete).
- [ ] /contact rewrite không fetch admin endpoint.
- [ ] Rate limit utility + applied to 3 public routes.
- [ ] ImageCropUploader UX: nút X góc + confirm dialog.
- [ ] AdminSidebar config: 8 items removed.
- [ ] Schema: InquiryType enum, Visibility HIDDEN value, FK convertedOrderId + sourceInquiryId, indexes.
- [ ] Migration backfill inquiry types từ source field.
- [ ] InquiryService.list() support filter by inquiryType.
- [ ] `/admin/inquiries` page với tabs filter.
- [ ] ConvertOrderModal + QuickCreateProductForm components.
- [ ] `createOrderFromInquiry` server action.
- [ ] Storefront filter `visibility = PUBLIC` cho `/shop`.
- [ ] Polish: bank name layout + /about redirect + ReviewSection typo.
- [ ] Prisma index migrations apply.
- [ ] PR description 6 screenshot:
  - (a) Admin inquiry list với tabs filter B2C/B2B.
  - (b) Convert-to-Order modal step 1 (product picker).
  - (c) Convert-to-Order modal step 2 (order info).
  - (d) Order B2B mới tạo trong `/admin/orders/b2b`.
  - (e) Bank name layout fixed trong modal success.
  - (f) Admin sidebar không có 8 stub items.

---

## 6. Phase 8b preview (sau Phase 8a merge + soft launch)

- **Excel bulk operations**: 1 admin page `/admin/products/bulk-upload` với 3 mode (create / update stock / update price). Template Excel download. Parse + preview + commit. Conflict resolution UI.
- **Blog/Journal editor**: `/admin/website/blogs/new` + `/admin/website/blogs/[id]/edit`. Markdown editor với SEO fields, draft/publish, scheduled.

Effort Phase 8b: ~27h.

---

## 7. Antigravity instructions tổng kết

1. Đọc spec này full + `D:\CỐC NỐI\07_Website\cocnoi-web\CLAUDE.md` + `D:\CỐC NỐI\README.md` Quy tắc 9 (no em-dash).
2. Tạo branch `feature/phase-8a-prelaunch-critical` từ master.
3. Implement Part A → Part B → Part C → Part D theo thứ tự.
4. Mỗi Part xong test riêng before continue.
5. Verify §3 toàn bộ.
6. Commit theo từng Part (vd `feat(phase-8a/A1): cloudinary image upload migration`).
7. Push + báo lại để Việt test merge.

**Đặc biệt cảnh báo:**
- A1 Cloudinary: cần Việt setup account + env vars TRƯỚC khi code work.
- B1 schema migration: chạy `prisma migrate dev` cẩn thận, backfill data trước khi merge production.
- B3-B4 Convert workflow: reuse existing services/actions nhiều nhất có thể, không duplicate.
- A6 hide sidebar: chỉ ẩn UI items, KHÔNG xóa route files (preserve future implement).
