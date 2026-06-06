# Phase 7 - Launch Prep (Rollback UI lead gen + DB resilience + Deployment guide)

**Người thực thi:** Antigravity (code) + Việt (deployment manual).
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 6b merged).
**Branch name:** `feature/phase-7-launch-prep`.

**Mục tiêu:** Pivot strategic - giai đoạn 0-1 (3-6 tháng đầu launch) chạy lead gen + QR/COD mode để giảm cost + complexity. E-commerce code GIỮ trong codebase nhưng UI ẩn. Add DB resilience cho UX tốt khi Neon free auto-suspend. Deploy Vercel Hobby FREE.

---

## 0. Bối cảnh

User chốt rollback model 2026-06-07 dựa trên honest assessment:

| Lý do | Mức độ |
|---|---|
| Kinh phí Vercel Pro $20/tháng + complexity cổng thanh toán | Cao giai đoạn 0 |
| Pháp lý thuế VN (MST, hóa đơn điện tử, NĐ52, NĐ13) | Cao giai đoạn 0 |
| Validate market chưa rõ, chưa cần payment auto | Cao |

**Code KHÔNG bị undo**. Cart store, checkout page, Order model - giữ nguyên trong codebase. Chỉ UI ẩn. Phase tương lai re-enable khi mô hình ổn (5tr+/tháng).

Refer `D:\CỐC NỐI\07_Website\site-architecture.md` v1.2 (đã update 07/06/2026 hybrid model).

---

## 1. Scope Phase 7 (3 parts)

### Part A - UI Rollback Lead Gen Mode

**Files modify:**
- `src/components/shared/HeaderClient.tsx` - ẩn cart icon (conditional render off cho launch mode).
- `src/app/(store)/checkout/page.tsx` - redirect về `/cart-disabled` hoặc `/shop` với message lịch sự.
- `src/app/(store)/shop/[slug]/ProductDetailClient.tsx` - ẩn "Add to cart" button, chỉ giữ "Đặt hàng / Order Inquiry" mở inquiry modal.
- `src/components/store/FloatingActions.tsx` - kiểm tra có cart-related action không, ẩn nếu có.
- `src/config/site-schema.ts` - thêm section `payment_info` với QR image + bank account info cho inquiry confirmation.
- `src/lib/site-config-validate.ts` - validator section `payment_info`.

**Files mới:**
- `src/components/store/PaymentInstructionsBlock.tsx` - render QR image + bank info, hiện trong inquiry success modal/page.

**KHÔNG động:**
- `src/store/cart.store.ts` (giữ code)
- `src/app/(store)/checkout/page.tsx` content (chỉ thêm redirect ở top)
- Order model Prisma (giữ)
- `createRetailOrder` action (giữ)

### Part B - DB Resilience + Friendly Error UI

**Files mới:**
- `src/lib/prisma.ts` - thêm middleware retry P1001 (Neon cold start).
- `src/lib/utils/error-messages.ts` - utility `parseError(error)`.
- `src/components/shared/FormErrorAlert.tsx` - shared error component.

**Files update (9 forms áp dụng):**
- `src/components/store/StockistApplicationForm.tsx`
- `src/components/store/CorporateGiftingForm.tsx`
- `src/components/store/PartnerContactForm.tsx`
- `src/components/store/ReviewSection.tsx`
- `src/components/shared/FooterNewsletterForm.tsx`
- `src/app/(store)/contact/page.tsx`
- `src/app/(store)/don-hang/OrderTrackingClient.tsx`
- `src/app/(store)/shop/[slug]/ProductDetailClient.tsx`
- `src/app/(store)/checkout/page.tsx` (vẫn apply để code hoạt động nếu re-enable phase sau)

### Part C - Deployment Guide (doc only)

**File mới (doc):**
- `docs/deployment-vercel-hobby.md` - step-by-step guide deploy Vercel Hobby + custom domain.

---

## 2. Detailed task breakdown

### Part A.1 - Hide cart icon

**File:** `src/components/shared/HeaderClient.tsx`

Wrap cart icon block trong conditional:

```tsx
{/* Cart icon - hidden in lead gen mode (Phase 7 launch) */}
{process.env.NEXT_PUBLIC_ENABLE_CART === "true" && (
  <button onClick={() => setCartOpen(true)}>
    <ShoppingBag className="w-5 h-5" />
    {cartCount > 0 && <span>{cartCount}</span>}
  </button>
)}
```

Set `NEXT_PUBLIC_ENABLE_CART=false` (hoặc không set) trong `.env.production` và `.env.local`. Default = hidden.

**Lý do dùng env flag thay vì xóa code:** Phase tương lai re-enable chỉ cần set env, không phải merge code lại.

### Part A.2 - Disable checkout route

**File:** `src/app/(store)/checkout/page.tsx`

Thêm guard ở top:

```tsx
import { redirect } from "next/navigation";

// Phase 7 - lead gen mode: redirect checkout về shop
if (process.env.NEXT_PUBLIC_ENABLE_CART !== "true") {
  // Trong client component, dùng useEffect + router.push, hoặc convert thành server component
  // Cách đơn giản: wrap content trong check, render fallback nếu cart disabled
}
```

**Cách clean:** Tạo wrapper server component check env:

```tsx
// src/app/(store)/checkout/page.tsx
import { redirect } from "next/navigation";
import CheckoutClient from "./CheckoutClient"; // rename current page content

export default function CheckoutPage() {
  if (process.env.NEXT_PUBLIC_ENABLE_CART !== "true") {
    redirect("/shop?msg=checkout-disabled");
  }
  return <CheckoutClient />;
}
```

Hoặc đơn giản nhất: render notice nếu disable:

```tsx
if (process.env.NEXT_PUBLIC_ENABLE_CART !== "true") {
  return (
    <main className="py-20 text-center">
      <h1 className="font-playfair text-3xl mb-4">Đặt hàng qua tư vấn</h1>
      <p className="font-bvp text-secondary mb-6 max-w-xl mx-auto">
        Cốc Nối hiện nhận đơn qua form tư vấn. Hãy chọn sản phẩm trong cửa hàng và bấm "Đặt hàng" để liên hệ.
      </p>
      <Link href="/shop" className="...">Vào cửa hàng</Link>
    </main>
  );
}
```

Antigravity tự chọn pattern phù hợp.

### Part A.3 - Product detail Buy button -> Inquiry

**File:** `src/app/(store)/shop/[slug]/ProductDetailClient.tsx`

Tìm "Add to cart" button. Wrap conditional:

```tsx
{process.env.NEXT_PUBLIC_ENABLE_CART === "true" ? (
  <button onClick={handleAddToCart}>Thêm vào giỏ</button>
) : (
  <button onClick={openInquiryModal}>Đặt đôi này</button>
)}
```

Inquiry modal đã có sẵn (Phase 4 inquiry flow). Re-trigger cùng modal.

### Part A.4 - Schema payment_info section

**File:** `src/config/site-schema.ts`

Thêm sau `partners_meta`:

```ts
payment_info: {
  label: "Hướng dẫn thanh toán (Inquiry Success)",
  fields: {
    showQr: { 
      type: "boolean", 
      label: "Hiển thị QR chuyển khoản", 
      default: true 
    },
    qrImage: { 
      type: "image", 
      label: "Ảnh QR chuyển khoản", 
      default: "", 
      aspectRatio: 1,
      folder: "theme/payment",
      helpText: "Ảnh QR ngân hàng (VietQR sinh từ ngân hàng Vietcombank/Techcombank/MB...)"
    },
    bankName: { 
      type: "text", 
      label: "Tên ngân hàng", 
      default: "" 
    },
    accountNumber: { 
      type: "text", 
      label: "Số tài khoản", 
      default: "" 
    },
    accountHolder: { 
      type: "text", 
      label: "Tên chủ tài khoản", 
      default: "" 
    },
    transferNote: { 
      type: "text", 
      label: "Nội dung CK gợi ý", 
      default: "COC NOI [Tên khách] [SĐT]" 
    },
    codAvailable: { 
      type: "boolean", 
      label: "Có hỗ trợ COD", 
      default: true 
    },
    codNote: { 
      type: "textarea", 
      label: "Ghi chú COD", 
      default: "COD miễn phí Hà Nội. Tỉnh khác phụ phí theo cước vận chuyển." 
    }
  }
}
```

Validator tương ứng.

### Part A.5 - PaymentInstructionsBlock component

**File:** `src/components/store/PaymentInstructionsBlock.tsx`

Render QR + bank info trong inquiry success state. Pattern Server Component nhận props từ getSiteConfig().

```tsx
import type { SiteConfig } from "@/lib/site-config-validate";

export default function PaymentInstructionsBlock({ paymentInfo }: { paymentInfo: SiteConfig['payment_info'] }) {
  if (!paymentInfo) return null;
  return (
    <div className="bg-subtle/30 border border-border rounded-4 p-6">
      <h3 className="font-playfair text-lg font-semibold mb-4">Hướng dẫn thanh toán</h3>
      {paymentInfo.showQr && paymentInfo.qrImage && (
        <div className="flex flex-col items-center mb-4">
          <img src={paymentInfo.qrImage} alt="QR chuyển khoản" className="w-48 h-48 rounded-3" />
          <p className="font-bvp text-xs text-secondary mt-2">Quét QR bằng app ngân hàng</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-2 text-sm">
        <span className="text-secondary">Ngân hàng:</span>
        <span className="font-semibold">{paymentInfo.bankName}</span>
        <span className="text-secondary">Số TK:</span>
        <span className="font-semibold">{paymentInfo.accountNumber}</span>
        <span className="text-secondary">Chủ TK:</span>
        <span className="font-semibold">{paymentInfo.accountHolder}</span>
        <span className="text-secondary">Nội dung CK:</span>
        <span className="font-mono text-xs">{paymentInfo.transferNote}</span>
      </div>
      {paymentInfo.codAvailable && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="font-semibold text-sm mb-1">Hoặc COD</p>
          <p className="font-bvp text-xs text-secondary">{paymentInfo.codNote}</p>
        </div>
      )}
    </div>
  );
}
```

Inquiry forms (StockistApplicationForm, CorporateGiftingForm, PartnerContactForm) render component này trong success state. Hoặc inquiry success page riêng.

### Part B.1 - Prisma middleware retry

**File:** `src/lib/prisma.ts`

```ts
import { PrismaClient, Prisma } from "@prisma/client";

const basePrisma = new PrismaClient({
  // existing config
});

// Retry middleware cho connection error (P1001 - Neon free cold start)
basePrisma.$use(async (params, next) => {
  const MAX_RETRIES = 2;
  const DELAY_MS = 1500;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await next(params);
    } catch (error: any) {
      const isConnError = error?.code === 'P1001' 
        || error?.message?.includes("Can't reach database")
        || error?.message?.includes("Connection terminated");
      if (!isConnError || attempt === MAX_RETRIES) throw error;
      console.warn(`[Prisma retry] Attempt ${attempt + 1}/${MAX_RETRIES + 1} after ${DELAY_MS * (attempt + 1)}ms`);
      await new Promise(r => setTimeout(r, DELAY_MS * (attempt + 1)));
    }
  }
  throw new Error("Unreachable");
});

export const prisma = basePrisma;
```

**Lưu ý:** Prisma 5+ dùng `$extends` thay `$use`. Antigravity check version trong `package.json` và dùng API đúng.

### Part B.2 - parseError utility

**File:** `src/lib/utils/error-messages.ts`

```ts
export interface FriendlyError {
  category: "db_connection" | "validation" | "network" | "unknown";
  message: string;
  showRetryButton: boolean;
  showReloadButton: boolean;
}

export function parseError(error: any): FriendlyError {
  const msg = error?.message || error?.toString() || "";
  const code = error?.code;
  
  // DB connection error (Neon cold start)
  if (code === "P1001" || msg.includes("Can't reach database") || msg.includes("Connection terminated")) {
    return {
      category: "db_connection",
      message: "Hệ thống đang khởi động lại, vui lòng đợi vài giây rồi gửi lại. Nếu vẫn không gửi được, hãy tải lại trang.",
      showRetryButton: true,
      showReloadButton: true,
    };
  }
  
  // Network error
  if (msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("ECONNREFUSED")) {
    return {
      category: "network",
      message: "Mất kết nối mạng. Kiểm tra internet và thử lại.",
      showRetryButton: true,
      showReloadButton: false,
    };
  }
  
  // Validation error (short messages from zod or server validation)
  if (msg.length < 200 && (msg.includes("không") || msg.includes("phải") || msg.includes("invalid"))) {
    return {
      category: "validation",
      message: msg,
      showRetryButton: false,
      showReloadButton: false,
    };
  }
  
  // Unknown error
  return {
    category: "unknown",
    message: "Có sự cố không xác định. Vui lòng thử lại hoặc liên hệ Cốc Nối qua hotline.",
    showRetryButton: true,
    showReloadButton: true,
  };
}
```

### Part B.3 - FormErrorAlert component

**File:** `src/components/shared/FormErrorAlert.tsx`

```tsx
"use client";

import { AlertCircle, RotateCw, RefreshCw } from "lucide-react";
import type { FriendlyError } from "@/lib/utils/error-messages";

interface Props {
  error: FriendlyError;
  onRetry?: () => void;
}

export default function FormErrorAlert({ error, onRetry }: Props) {
  return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-3">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bvp text-sm text-rose-700 mb-3">{error.message}</p>
          <div className="flex flex-wrap gap-2">
            {error.showRetryButton && onRetry && (
              <button 
                type="button"
                onClick={onRetry} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-2"
              >
                <RotateCw className="w-3.5 h-3.5" />
                Thử lại
              </button>
            )}
            {error.showReloadButton && (
              <button 
                type="button"
                onClick={() => window.location.reload()} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Tải lại trang
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Part B.4 - Update 9 forms với parseError

Trong mỗi form (9 files trong §1 Part B), pattern:

```tsx
// Before
const [error, setError] = useState("");
// catch
catch (err: any) {
  setError(err.message || "Có lỗi xảy ra");
}
// render
{error && <div className="text-rose-600">{error}</div>}

// After
import { parseError, type FriendlyError } from "@/lib/utils/error-messages";
import FormErrorAlert from "@/components/shared/FormErrorAlert";

const [error, setError] = useState<FriendlyError | null>(null);
// catch
catch (err: any) {
  setError(parseError(err));
}
// render
{error && <FormErrorAlert error={error} onRetry={handleSubmit} />}
```

### Part C - Deployment Guide

**File mới (doc):** `D:\CỐC NỐI\07_Website\cocnoi-web\docs\deployment-vercel-hobby.md`

Step-by-step manual cho Việt thực hiện:

```markdown
# Deployment Guide - Vercel Hobby + Custom Domain (Cốc Nối Phase 7)

## Pre-requisite
- GitHub repo cocnoi-web đã push lên (đã có)
- Neon DB free account + DATABASE_URL (đã có)
- Cloudinary account free (chưa có, đăng ký free)
- Domain mua xong (chưa có, mua Namecheap .com hoặc Mắt Bão .vn)

## Step 1 - Cloudinary setup (15 phút)
1. Đăng ký https://cloudinary.com (free 25GB).
2. Vào Dashboard → Settings → Account → copy `CLOUD_NAME`, `API_KEY`, `API_SECRET`.
3. Lưu 3 env này vào `.env.production` local.

## Step 2 - Migrate image upload sang Cloudinary (CẦN code change)
Đây là blocker chính. Hiện `/api/admin/upload` ghi vào filesystem.
- **Defer Phase 11**: chấp nhận giai đoạn 0-1 admin upload TỪ MÁY ANH chỉ. Image existing trong public/uploads commit vào Git, deploy cùng codebase.
- **Hoặc làm ngay**: spec migration Cloudinary, effort ~5h Antigravity.

## Step 3 - Vercel deploy (10 phút)
1. Đăng ký Vercel với GitHub OAuth.
2. Import project cocnoi-web từ GitHub.
3. Configure environment variables (lấy từ `.env.production` local):
   - `DATABASE_URL` (Neon connection string)
   - `NEXT_PUBLIC_ENABLE_CART=false` (cart disabled mode)
   - `CLOUDINARY_*` (nếu đã migrate)
   - Other secrets nếu có
4. Deploy → URL `cocnoi-web-xxx.vercel.app` hoạt động.

## Step 4 - Mua domain (15 phút)
- Namecheap.com → search "cocnoi" → đăng ký .com ~$11/năm. Hoặc .vn qua Mắt Bão.
- Khi domain active (~15 phút sau khi mua), vào Domain Management → DNS settings.

## Step 5 - Trỏ domain về Vercel (5 phút)
1. Vercel dashboard → Project Settings → Domains.
2. Add domain `cocnoi.com` và `www.cocnoi.com`.
3. Vercel hiện instruction add CNAME / A record. Copy.
4. Namecheap → Advanced DNS:
   - A record `@` → `76.76.21.21` (Vercel IP)
   - CNAME `www` → `cname.vercel-dns.com`
5. Đợi 5-30 phút DNS propagate. Vercel auto issue HTTPS cert.
6. Truy cập `https://cocnoi.com` → site live.

## Step 6 - Test production
1. Test form Inquiry → DB write OK.
2. Test page load tất cả routes.
3. Test admin login `/admin`.
4. Test customizer `/admin/customize` save data.

## Step 7 - Monitor
- Vercel dashboard → Analytics tab (free tier có basic).
- Neon dashboard → check compute hours usage.
- Cloudinary dashboard → check storage usage.

## Troubleshooting
- **Build fail**: check Vercel build log. Common: missing env, TypeScript error.
- **DB cold start lỗi**: parseError đã handle. Nếu vẫn fail nhiều, monitor + xem có cần Vercel Cron warmup.
- **Image upload fail**: filesystem readonly. Phải migrate Cloudinary (Phase 11) trước khi production admin upload.

## Khi nào upgrade Vercel Pro?
Triggers:
- Doanh thu 5tr+/tháng (chi phí $20 < 1% revenue).
- Traffic > 100k requests/tháng (Hobby limit).
- Cần commercial use compliance.
- Cần custom support / SLA.
```

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. Set `NEXT_PUBLIC_ENABLE_CART=false` trong `.env.local` → cart icon biến mất khỏi Header.
3. Truy cập `/checkout` → redirect/notice "Đặt hàng qua tư vấn".
4. Product detail page → button "Đặt đôi này" thay vì "Thêm vào giỏ".
5. Set `NEXT_PUBLIC_ENABLE_CART=true` → cart UI hiện lại, checkout hoạt động. Verify code không bị break.
6. Admin form `/admin/customize` → section "Hướng dẫn thanh toán (Inquiry Success)" hiện, 8 field editable.
7. Form submit test (StockistApplication, CorporateGifting):
   - Mô phỏng DB cold (đợi 6 phút idle hoặc stop DB tạm) → submit → retry transparent thành công lần 2-3.
   - Nếu vẫn fail → friendly FormErrorAlert hiện với nút Thử lại + Tải lại trang.
8. Toàn bộ 9 forms render error qua `<FormErrorAlert>` thay vì raw red text.
9. `grep -r '—' src/components/store/PaymentInstructionsBlock.tsx src/components/shared/FormErrorAlert.tsx src/lib/utils/error-messages.ts docs/deployment-vercel-hobby.md` → 0 em-dashes.
10. Document `deployment-vercel-hobby.md` đầy đủ steps.

---

## 4. Non-goals Phase 7

- ❌ KHÔNG xóa cart store / checkout code (giữ làm dormant feature).
- ❌ KHÔNG integrate VietQR/VNPay/Momo API (chỉ display QR tĩnh manual).
- ❌ KHÔNG migrate image sang Cloudinary (Phase 11 - blocker production).
- ❌ KHÔNG setup MST + hóa đơn điện tử (giai đoạn pháp lý sau).
- ❌ KHÔNG Shop sub-categories (Phase 8 deferred).
- ❌ KHÔNG EN/VN bilingual (Phase 9 deferred).
- ❌ KHÔNG actual deploy (Việt làm manual theo guide).

---

## 5. Checklist PR

- [ ] Env flag `NEXT_PUBLIC_ENABLE_CART` được dùng trong Header, checkout, product detail.
- [ ] Schema `payment_info` section + validator + default values em đặt.
- [ ] `PaymentInstructionsBlock` component mới.
- [ ] Prisma middleware retry cho P1001.
- [ ] `parseError` utility + `FormErrorAlert` component.
- [ ] 9 forms apply parseError + FormErrorAlert.
- [ ] `deployment-vercel-hobby.md` doc đầy đủ steps.
- [ ] 0 em-dash trong copy mới.
- [ ] PR description 4 screenshot: (a) Header không có cart icon, (b) Product detail "Đặt đôi này", (c) Admin form section "Hướng dẫn thanh toán", (d) Form FormErrorAlert UI khi mô phỏng error.

---

## 6. Phase 8+ preview

- **Phase 8**: Shop sub-categories + BST detail template (deferred, làm khi đã launch + có data behavior khách).
- **Phase 9**: EN/VN bilingual via next-intl.
- **Phase 10**: Draft/Preview/Publish admin (Prisma migration + UI).
- **Phase 11**: Cloudinary image migration (CẦN trước Vercel production nếu admin upload từ remote).
- **Phase 12**: Re-enable e-commerce (cart + checkout + VietQR API auto-confirm). Trigger: doanh thu 5tr+/tháng.

---

## 7. Antigravity instructions tổng kết

1. Read `D:\CỐC NỐI\07_Website\cocnoi-web\docs\customize-refactor-spec-phase7.md` (file này) full.
2. Read `D:\CỐC NỐI\07_Website\cocnoi-web\CLAUDE.md`.
3. Read `D:\CỐC NỐI\07_Website\site-architecture.md` v1.2.
4. Read `D:\CỐC NỐI\README.md` Quy tắc 9 (no em-dash).
5. Tạo branch + implement theo §2.
6. Verify §3.
7. Commit + push.
8. Báo lại với screenshot PR.
