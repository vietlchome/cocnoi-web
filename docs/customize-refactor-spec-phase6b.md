# Phase 6b - Partners sub-pages

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 6a merged, tip `a91b9b8`).
**Branch name:** `feature/phase-6b-partners-subpages`.

**Mục tiêu:** Tách `/partners` single page anchor thành 3 sub-pages chuyên biệt theo blueprint Section 7.

---

## 0. Bối cảnh

Phase 6a merged. Master tip `a91b9b8`. /partners hiện tại là single page với content gộp 3 mục B2B + 1 form chung `PartnerContactForm`. Anchor `#corporate`, `#stockists`, `#wholesale` không match đúng routing trong blueprint.

Per `D:\CỐC NỐI\07_Website\site-architecture.md` Section 7, ĐỐI TÁC có 3 sub-pages:
- `/partners/stockists` - Tìm cửa hàng (Stockist locator)
- `/partners/become-a-stockist` - Trở thành đại lý (B2B wholesale application)
- `/partners/corporate-gifting` - Quà tặng doanh nghiệp (Corporate gifting inquiry)

Mỗi sub-page có form riêng với fields khác nhau.

Đã có sẵn:
- `PartnerContactForm.tsx` - 1 form chung hiện tại (customer name, phone, email, company, quantity, note).
- `OrderInquiry` Prisma model + `/api/inquiry` route + `createInquiry` action.
- `InquiryService.createInquiry`.

Phase 6b reuse infrastructure này, chỉ thêm `source` differentiation theo form.

---

## 1. Scope Phase 6b (strict)

**Files mới:**
- `src/app/(store)/partners/stockists/page.tsx`
- `src/app/(store)/partners/become-a-stockist/page.tsx`
- `src/app/(store)/partners/corporate-gifting/page.tsx`
- `src/components/store/StockistApplicationForm.tsx` (form B2B wholesale)
- `src/components/store/CorporateGiftingForm.tsx` (form corporate)

**Files modify:**
- `src/app/(store)/partners/page.tsx` - convert thành landing với 3 card link.
- `src/components/shared/Header.tsx` - cập nhật ĐỐI TÁC submenu links từ anchor sang sub-pages.
- `src/components/shared/HeaderClient.tsx` - cập nhật submenuMap cho ĐỐI TÁC.
- `src/components/store/PartnerContactForm.tsx` - generalize prop để accept `formType` (corporate / stockist / generic).
- `src/config/site-schema.ts` - thêm section `partners_meta` với MOQ + lead time + min order value editable.
- `src/lib/site-config-validate.ts` - validator.

**Cấm động:**
- `src/components/admin/customize/**` (library Phase 3a)
- `src/components/admin/settings/SiteCustomizerClient.tsx`
- `src/lib/actions/settings.actions.ts`
- `src/lib/actions/inquiry.actions.ts` (giữ API hiện có)
- `src/lib/services/inquiry.service.ts`
- `src/lib/services/settings.service.ts`
- `src/lib/site-config.ts`
- `prisma/schema.prisma` (OrderInquiry model giữ nguyên)
- `src/app/api/inquiry/**`
- Sandbox + admin routes
- Storefront homepage components
- /discover, /community routes (Phase 6a)

---

## 2. Detailed task breakdown

### 2.1. Schema `partners_meta` section

**File:** `src/config/site-schema.ts`

Thêm section sau `our_values`:

```ts
partners_meta: {
  label: "Thông tin Đối Tác (Partners pages)",
  fields: {
    stockistMinOrder: { 
      type: "text", 
      label: "Đơn hàng tối thiểu cho đại lý (mô tả)", 
      default: "10 đôi cốc cho đơn đầu tiên" 
    },
    stockistDiscount: { 
      type: "text", 
      label: "Mô tả chiết khấu đại lý", 
      default: "Chiết khấu 30-40% theo bậc số lượng" 
    },
    corporateMoq: { 
      type: "text", 
      label: "MOQ tối thiểu cho quà doanh nghiệp", 
      default: "20 đôi cho đơn cá nhân hoá logo" 
    },
    corporateLeadTime: { 
      type: "text", 
      label: "Thời gian sản xuất quà doanh nghiệp", 
      default: "2-4 tuần tuỳ số lượng và mức độ tuỳ chỉnh" 
    },
    salesEmail: { 
      type: "text", 
      label: "Email liên hệ B2B", 
      default: "",
      helpText: "Để trống = dùng contact.email mặc định"
    },
    salesPhone: { 
      type: "text", 
      label: "Hotline B2B", 
      default: "",
      helpText: "Để trống = dùng contact.phone mặc định"
    }
  }
}
```

Backward compat: section mới, không có legacy data. Reader sẽ return defaults.

**Validator:**
```ts
partners_meta: z.object({
  stockistMinOrder: textValidator,
  stockistDiscount: textValidator,
  corporateMoq: textValidator,
  corporateLeadTime: textValidator,
  salesEmail: textValidator,
  salesPhone: textValidator,
}),
```

### 2.2. /partners/page.tsx -> landing với 3 card

**File:** `src/app/(store)/partners/page.tsx`

Replace toàn bộ content. Layout đơn giản: hero + 3 card link.

```tsx
import Link from "next/link";

export const metadata = {
  title: "Đối Tác Cốc Nối - Hợp tác B2B",
  description: "Trở thành đại lý, đặt quà tặng doanh nghiệp, hoặc tìm cửa hàng có sản phẩm Cốc Nối.",
};

const sections = [
  {
    href: "/partners/stockists",
    title: "Tìm cửa hàng",
    en: "Find a Stockist",
    desc: "Danh sách concept store, café, gallery đang bán Cốc Nối."
  },
  {
    href: "/partners/become-a-stockist",
    title: "Trở thành đại lý",
    en: "Become a Stockist",
    desc: "Đăng ký bán Cốc Nối tại không gian của bạn. Wholesale + chiết khấu theo bậc."
  },
  {
    href: "/partners/corporate-gifting",
    title: "Quà tặng doanh nghiệp",
    en: "Corporate Gifting",
    desc: "Đặt cốc làm quà cho đối tác, nhân viên, sự kiện. Logo, packaging, thiệp tuỳ chỉnh."
  }
];

export default function PartnersLandingPage() {
  return (
    <main className="w-full bg-canvas py-20 md:py-28">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        <header className="text-center mb-16">
          <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-3">Partners</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary mb-4">
            Đối Tác Cốc Nối
          </h1>
          <p className="font-bvp text-base text-secondary max-w-xl mx-auto">
            Ba con đường hợp tác cho 3 nhu cầu khác nhau.
          </p>
        </header>
        <div className="grid md:grid-cols-3 gap-6">
          {sections.map(s => (
            <Link 
              key={s.href} 
              href={s.href}
              className="group block bg-subtle/30 border border-border rounded-4 p-8 hover:border-accent transition-colors"
            >
              <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-2">{s.en}</span>
              <h2 className="font-playfair text-xl md:text-2xl font-semibold text-primary mb-3 group-hover:text-accent transition-colors">
                {s.title}
              </h2>
              <p className="font-bvp text-sm text-secondary leading-relaxed">{s.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
```

### 2.3. /partners/stockists - Stockist locator

**File mới:** `src/app/(store)/partners/stockists/page.tsx`

Phase 6b chỉ build SKELETON. Khi có cửa hàng thật, list ra. Hiện tại empty state.

```tsx
import { getSiteConfig } from "@/lib/site-config";
import Link from "next/link";

export const metadata = {
  title: "Tìm cửa hàng Cốc Nối - Find a Stockist",
  description: "Danh sách concept store, café, gallery đang bán sản phẩm Cốc Nối.",
};

export default async function StockistsPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contact?.email || "";

  // TODO Phase sau: load stockists từ DB
  const stockists: any[] = [];

  return (
    <main className="w-full bg-canvas py-20 md:py-28">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <header className="text-center mb-12">
          <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-3">Find a Stockist</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary mb-4">
            Tìm cửa hàng gần bạn
          </h1>
          <p className="font-bvp text-base text-secondary max-w-xl mx-auto">
            Cốc Nối hiện có mặt tại các concept store, café, gallery sau. Danh sách cập nhật liên tục.
          </p>
        </header>

        {stockists.length === 0 ? (
          <div className="bg-subtle/30 border border-dashed border-border rounded-4 p-12 text-center">
            <h2 className="font-playfair text-2xl font-semibold text-primary mb-3">
              Sắp ra mắt tại các cửa hàng đối tác
            </h2>
            <p className="font-bvp text-sm text-secondary mb-6 max-w-md mx-auto">
              Hiện Cốc Nối đang trong giai đoạn ra mắt. Bạn có thể đặt hàng trực tiếp qua website hoặc liên hệ để nhận thông báo khi có cửa hàng đối tác.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-3 rounded-3 font-bvp font-semibold text-canvas bg-primary hover:bg-primary/90 transition-colors">
                Đặt hàng online
              </Link>
              {contactEmail && (
                <a href={`mailto:${contactEmail}`} className="inline-flex items-center gap-2 px-6 py-3 rounded-3 font-bvp font-semibold text-primary bg-subtle hover:bg-border transition-colors">
                  Liên hệ Cốc Nối
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Render stockist list khi có data */}
          </div>
        )}

        <div className="mt-16 bg-canvas border border-border rounded-4 p-8 text-center">
          <h2 className="font-playfair text-2xl font-semibold text-primary mb-3">
            Bạn sở hữu concept store hoặc café?
          </h2>
          <p className="font-bvp text-sm text-secondary mb-4">
            Trở thành đối tác phân phối Cốc Nối với chính sách chiết khấu hấp dẫn.
          </p>
          <Link href="/partners/become-a-stockist" className="inline-flex items-center gap-2 text-accent font-semibold">
            Đăng ký đại lý <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
```

### 2.4. /partners/become-a-stockist - Wholesale application

**File mới:** `src/app/(store)/partners/become-a-stockist/page.tsx`

Server component cho hero + content, embed Client form.

```tsx
import { getSiteConfig } from "@/lib/site-config";
import StockistApplicationForm from "@/components/store/StockistApplicationForm";

export const metadata = {
  title: "Trở thành Đại lý Cốc Nối - Become a Stockist",
  description: "Đăng ký bán Cốc Nối tại không gian của bạn. Wholesale với chiết khấu theo bậc số lượng.",
};

export default async function BecomeStockistPage() {
  const config = await getSiteConfig();
  const { stockistMinOrder, stockistDiscount } = config.partners_meta;

  return (
    <main className="w-full bg-canvas">
      <section className="py-20 md:py-24 bg-subtle/30">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <span className="font-quicksand text-xs uppercase tracking-widest text-accent block mb-3">Become a Stockist</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-semibold text-primary mb-4">
            Bán Cốc Nối tại không gian của bạn
          </h1>
          <p className="font-bvp text-base md:text-lg text-secondary max-w-2xl mx-auto">
            Concept store, café, gallery, retail specialty: đối tác trở thành điểm chạm của Cốc Nối với khách yêu gốm thủ công.
          </p>
        </div>
      </section>

      {/* Vì sao hợp tác - 3 lý do */}
      <section className="py-16">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-10 text-center">
            Vì sao chọn Cốc Nối
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-subtle/30 border border-border rounded-4 p-6">
              <h3 className="font-playfair text-lg font-semibold text-primary mb-2">Câu chuyện thủ công</h3>
              <p className="font-bvp text-sm text-secondary">Mỗi sản phẩm đi kèm câu chuyện làng nghề Bát Tràng 700 năm, hỗ trợ marketing tại cửa hàng.</p>
            </div>
            <div className="bg-subtle/30 border border-border rounded-4 p-6">
              <h3 className="font-playfair text-lg font-semibold text-primary mb-2">Chiết khấu theo bậc</h3>
              <p className="font-bvp text-sm text-secondary">{stockistDiscount}</p>
            </div>
            <div className="bg-subtle/30 border border-border rounded-4 p-6">
              <h3 className="font-playfair text-lg font-semibold text-primary mb-2">Hỗ trợ trưng bày</h3>
              <p className="font-bvp text-sm text-secondary">Cốc Nối hỗ trợ ảnh chất lượng cao, mẫu trưng bày, brand kit để cửa hàng đối tác kể chuyện đúng tinh thần.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quy trình 4 bước */}
      <section className="py-16 bg-subtle/30">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h2 className="font-playfair text-2xl md:text-3xl font-semibold text-primary mb-10 text-center">
            Quy trình hợp tác
          </h2>
          <ol className="grid md:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Đăng ký", desc: "Điền form bên dưới với thông tin cửa hàng." },
              { num: "02", title: "Tư vấn", desc: "Cốc Nối liên hệ trong 24h để hiểu nhu cầu và chia sẻ catalog wholesale." },
              { num: "03", title: "Đơn dùng thử", desc: `${stockistMinOrder}. Trải nghiệm sản phẩm + bán thử.` },
              { num: "04", title: "Hợp tác dài hạn", desc: "Đặt đơn định kỳ với chiết khấu ưu đãi và hỗ trợ marketing tại điểm bán." }
            ].map(s => (
              <li key={s.num} className="bg-canvas border border-border rounded-4 p-6">
                <span className="font-playfair text-3xl font-semibold text-accent block mb-2">{s.num}</span>
                <h3 className="font-playfair text-lg font-semibold text-primary mb-2">{s.title}</h3>
                <p className="font-bvp text-xs text-secondary leading-relaxed">{s.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Form */}
      <section className="py-20">
        <div className="max-w-2xl mx-auto px-4 md:px-8">
          <h2 className="font-playfair text-3xl md:text-4xl font-semibold text-primary mb-3 text-center">
            Đăng ký đại lý
          </h2>
          <p className="font-bvp text-sm text-secondary mb-8 text-center">
            Điền thông tin dưới đây. Cốc Nối sẽ liên hệ trong 24h.
          </p>
          <StockistApplicationForm />
        </div>
      </section>
    </main>
  );
}
```

### 2.5. /partners/corporate-gifting

**File mới:** `src/app/(store)/partners/corporate-gifting/page.tsx`

Tương tự pattern §2.4 nhưng content corporate-focused. Sections: hero, vì sao, ví dụ use case, customization options, MOQ + lead time, form.

Antigravity tự thiết kế layout, tuân thủ:
- Hero với title "Quà tặng doanh nghiệp ý nghĩa" + sub.
- Vì sao Cốc Nối: 3-4 lý do (handmade, văn hoá Việt, customizable, story).
- Use cases: Tết / Welcome kit / Kỷ niệm / Sự kiện (4 card hoặc carousel).
- Customization options: Logo đáy/thân, Thiệp tay, Packaging custom, MOQ từ `config.partners_meta.corporateMoq` đôi.
- Lead time: từ `config.partners_meta.corporateLeadTime`.
- Form CorporateGiftingForm.

### 2.6. StockistApplicationForm component

**File mới:** `src/components/store/StockistApplicationForm.tsx`

```tsx
"use client";

import { useState } from "react";
import { createInquiry } from "@/lib/actions/inquiry.actions";
import { CheckCircle2, AlertCircle, Loader2, Send } from "lucide-react";

export default function StockistApplicationForm() {
  const [formData, setFormData] = useState({
    storeName: "",
    contactName: "",
    phone: "",
    email: "",
    storeType: "concept-store",
    address: "",
    instagram: "",
    expectedQty: "10-20",
    note: ""
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.contactName.trim() || formData.phone.trim().length < 8) {
      setError("Vui lòng nhập đủ tên và số điện thoại hợp lệ.");
      setLoading(false);
      return;
    }

    try {
      const fullNote = [
        `Loại cửa hàng: ${formData.storeType}`,
        `Địa chỉ: ${formData.address}`,
        `Instagram/Website: ${formData.instagram}`,
        `SL dự kiến/tháng: ${formData.expectedQty}`,
        formData.note && `Ghi chú: ${formData.note}`
      ].filter(Boolean).join(" | ");

      const response = await createInquiry({
        customerName: formData.contactName,
        phone: formData.phone,
        email: formData.email || null,
        companyName: formData.storeName || null,
        productId: null,
        quantity: 0,
        note: fullNote,
        source: "Stockist Application",
      });

      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || "Gặp sự cố khi gửi thông tin.");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="bg-subtle/30 border border-border rounded-4 p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-accent mx-auto mb-4" />
        <h3 className="font-playfair text-xl font-semibold text-primary mb-2">Đã gửi đăng ký</h3>
        <p className="font-bvp text-sm text-secondary">Cốc Nối sẽ liên hệ trong vòng 24h. Cảm ơn bạn quan tâm hợp tác.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Tên cửa hàng */}
      <div>
        <label className="text-sm font-semibold text-primary mb-1.5 block">Tên cửa hàng / thương hiệu *</label>
        <input
          type="text"
          required
          value={formData.storeName}
          onChange={e => setFormData({...formData, storeName: e.target.value})}
          className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
        />
      </div>

      {/* Tên liên hệ + SĐT */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-primary mb-1.5 block">Người liên hệ *</label>
          <input
            type="text"
            required
            value={formData.contactName}
            onChange={e => setFormData({...formData, contactName: e.target.value})}
            className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-primary mb-1.5 block">Số điện thoại *</label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={e => setFormData({...formData, phone: e.target.value})}
            className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
          />
        </div>
      </div>

      {/* Email + Loại cửa hàng */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-primary mb-1.5 block">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={e => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-primary mb-1.5 block">Loại hình</label>
          <select
            value={formData.storeType}
            onChange={e => setFormData({...formData, storeType: e.target.value})}
            className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
          >
            <option value="concept-store">Concept store</option>
            <option value="cafe">Café</option>
            <option value="gallery">Gallery</option>
            <option value="retail-specialty">Retail specialty</option>
            <option value="other">Khác</option>
          </select>
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="text-sm font-semibold text-primary mb-1.5 block">Địa chỉ cửa hàng</label>
        <input
          type="text"
          value={formData.address}
          onChange={e => setFormData({...formData, address: e.target.value})}
          className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
        />
      </div>

      {/* Instagram/Web + SL dự kiến */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-semibold text-primary mb-1.5 block">Instagram / Website</label>
          <input
            type="text"
            placeholder="@yourstore"
            value={formData.instagram}
            onChange={e => setFormData({...formData, instagram: e.target.value})}
            className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
          />
        </div>
        <div>
          <label className="text-sm font-semibold text-primary mb-1.5 block">Số lượng dự kiến / tháng</label>
          <select
            value={formData.expectedQty}
            onChange={e => setFormData({...formData, expectedQty: e.target.value})}
            className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
          >
            <option value="10-20">10-20 đôi</option>
            <option value="20-50">20-50 đôi</option>
            <option value="50-100">50-100 đôi</option>
            <option value="100+">100+ đôi</option>
          </select>
        </div>
      </div>

      {/* Note */}
      <div>
        <label className="text-sm font-semibold text-primary mb-1.5 block">Lời nhắn thêm</label>
        <textarea
          rows={3}
          value={formData.note}
          onChange={e => setFormData({...formData, note: e.target.value})}
          className="w-full px-4 py-2.5 border border-border rounded-3 bg-canvas"
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-3 text-sm text-rose-600">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center justify-center gap-2 px-6 py-3 rounded-3 font-bvp font-semibold text-canvas bg-primary hover:bg-primary/90 disabled:opacity-50 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        Gửi đăng ký
      </button>
    </form>
  );
}
```

### 2.7. CorporateGiftingForm component

**File mới:** `src/components/store/CorporateGiftingForm.tsx`

Cấu trúc tương tự StockistApplicationForm nhưng fields khác:
- Tên công ty *
- Người liên hệ + chức vụ *
- Email + SĐT *
- Số lượng dự kiến (select: 20-50/50-100/100-200/200+)
- Dịp sử dụng (select: Tết / Kỷ niệm / Welcome kit / Sự kiện / Khác)
- Ngân sách dự kiến / đôi (select: <300K/300-500K/500K-1tr/1tr+)
- Yêu cầu custom (textarea: logo, thiệp, packaging)
- Deadline cần nhận
- Submit

`source: "Corporate Gifting Inquiry"`.

Antigravity tự build pattern, tuân thủ no em-dash + brand vocab.

### 2.8. Header submenu update

**File:** `src/components/shared/HeaderClient.tsx`

Trong `submenuMap`, đổi entries của "ĐỐI TÁC" từ anchor hiện tại sang sub-pages:

```ts
"ĐỐI TÁC": [
  { name: "Tìm cửa hàng", href: "/partners/stockists" },
  { name: "Trở thành đại lý", href: "/partners/become-a-stockist" },
  { name: "Quà tặng doanh nghiệp", href: "/partners/corporate-gifting" },
],
```

**File:** `src/components/shared/Header.tsx`

Trong fallback navLinks (nếu có submenu config inline cho ĐỐI TÁC), cập nhật tương ứng. Bỏ link cũ với anchor `#corporate`, `#stockists`, `#wholesale`.

### 2.9. Cấm em-dash

Mọi text mới (page titles, descriptions, content, form labels) KHÔNG được dùng `—`. Thay bằng dấu phẩy, dấu chấm, dấu hai chấm, hoặc gạch nối ngắn `-`. Quy tắc 9 README.

---

## 3. Verify checklist

1. `pnpm build` pass, `pnpm lint` clean, `npx tsc --noEmit` clean.
2. Routes mới:
   - `/partners` -> landing 3 card link.
   - `/partners/stockists` -> empty state + CTA "Đăng ký đại lý".
   - `/partners/become-a-stockist` -> hero + 3 lý do + 4 bước + form.
   - `/partners/corporate-gifting` -> hero + use cases + customization + form.
3. Header desktop ĐỐI TÁC dropdown link 3 sub-pages mới (không còn anchor `#`).
4. Mobile drawer ĐỐI TÁC accordion 3 sub-pages.
5. Form submit test:
   - Stockist application: điền form, submit → success → check DB `OrderInquiry` table có row mới với `source: "Stockist Application"`.
   - Corporate gifting: tương tự, `source: "Corporate Gifting Inquiry"`.
6. Admin form `/admin/customize`:
   - Section "Thông tin Đối Tác (Partners pages)" mới hiện, 6 field editable.
   - Đổi `corporateMoq`, save, reload `/partners/corporate-gifting` -> giá trị mới hiện.
7. SEO: view source mỗi page có `<title>` và `<meta description>` đúng.
8. Em-dash check: `grep -r '—' src/app/\(store\)/partners src/components/store/StockistApplicationForm.tsx src/components/store/CorporateGiftingForm.tsx` -> empty.

---

## 4. Non-goals Phase 6b

- ❌ Không Shop sub-categories (Phase 6c).
- ❌ Không thêm Stockist model Prisma (Phase sau khi có stockist thật).
- ❌ Không EN/VN bilingual (Phase 7).
- ❌ Không tích hợp Google Maps locator (Phase sau khi có store data).
- ❌ Không xóa `PartnerContactForm.tsx` cũ (giữ để bookkeeping, không reference trong UI mới).

---

## 5. Checklist PR

- [ ] 3 routes mới `/partners/stockists`, `/partners/become-a-stockist`, `/partners/corporate-gifting`.
- [ ] /partners/page.tsx converted thành landing 3 card.
- [ ] StockistApplicationForm + CorporateGiftingForm components mới với `source` distinguishable.
- [ ] Schema `partners_meta` section với 6 field editable (MOQ, lead time, discount, sales contact).
- [ ] Header desktop + mobile submenu ĐỐI TÁC đổi từ anchor sang sub-pages.
- [ ] Mọi copy mới KHÔNG có em-dash `—`.
- [ ] PR description 3 screenshot: (a) /partners landing 3 card, (b) /partners/become-a-stockist với form, (c) Header dropdown ĐỐI TÁC mở với 3 sub-link mới.

---

## 6. Phase 6c preview

- Shop sub-categories: `/shop/mugs`, `/shop/beakers`, `/shop/collections`, `/shop/limited`, `/shop/best-sellers`.
- BST detail template: `/shop/collections/[slug]` với 5 sections (hero / story / behind / grid / related).
- Convert `/shop` từ filter query param sang landing với 5 tile categories.
- ProductGroup model có thể thêm metadata (cover image, story text).
