# Phase 9d spec - Cleanup polish

**Branch:** `feat/phase9d-cleanup`
**Effort:** 3-5h
**Phụ thuộc:** Phase 9c merged
**Phase tiếp theo:** Phase 10 (sub-category routing) hoặc 11/12 tuỳ priority

## 1. Mục tiêu

Hoàn thiện các stub + cleanup hardcode còn sót sau Phase 9a/b/c:
1. **Footer fallback hardcode** removal.
2. **`/partners/stockists`** xử lý DB-driven hoặc placeholder cố định.
3. **`/community/your-stories`** placeholder content schema-driven.
4. **`/checkout`** confirm redirect khi cart disabled.
5. **AdminSidebar branding** chuẩn bị cho Phase 10 (brand config) - tạm thời comment-out hardcode.

## 2. Scope

### 2.1 Footer cleanup

File: `src/components/shared/Footer.tsx`

**Xóa fallback hardcode:**

Grep tất cả `||` fallback strings trong Footer.tsx:
```tsx
// TRƯỚC (sẽ xóa):
<p>{config.footer.tagline || "Mỗi chiếc cốc là một câu chuyện"}</p>
<address>{config.contact.address || "Bát Tràng, Gia Lâm, Hà Nội"}</address>
<a>{config.contact.phone || "0123 456 789"}</a>

// SAU:
<p>{config.footer.tagline}</p>
<address>{config.contact.address}</address>
<a href={`tel:${config.contact.phone}`}>{config.contact.phone}</a>
```

Schema bắt buộc default value trong `site-schema.ts` (đã có từ Phase 4a). Nếu DB không có data, reader merge default = OK.

Test: empty DB record → Footer vẫn render đúng từ default.

### 2.2 `/partners/stockists` page

**File:** `src/app/(store)/partners/stockists/page.tsx`

**Schema thêm Model `Stockist`:**

```prisma
model Stockist {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  address     String
  city        String
  province    String?
  mapUrl      String?
  imageUrl    String?
  description String?
  phone       String?
  hours       String?
  isActive    Boolean  @default(true)
  sortOrder   Int      @default(0)
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Migration script tạo bảng.

**Page logic:**
```tsx
import { prisma } from "@/lib/prisma";

export default async function StockistsPage() {
  const stockists = await prisma.stockist.findMany({
    where: { isActive: true },
    orderBy: [{ city: "asc" }, { sortOrder: "asc" }],
  });
  
  if (stockists.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-8 py-20 text-center">
        <h1 className="font-playfair text-4xl mb-6">Cửa hàng đối tác</h1>
        <p className="text-stone-600 mb-8">
          Chúng tôi sẽ sớm hợp tác với các cửa hàng đối tác trên toàn quốc.
          Liên hệ để trở thành đối tác phân phối Cốc Nối.
        </p>
        <Link href="/partners/become-a-stockist" className="btn-primary">
          Trở thành đối tác
        </Link>
      </div>
    );
  }
  
  // Group by city
  const byCity = stockists.reduce((acc, s) => {
    if (!acc[s.city]) acc[s.city] = [];
    acc[s.city].push(s);
    return acc;
  }, {} as Record<string, typeof stockists>);
  
  return (
    <div className="max-w-7xl mx-auto px-8 py-20">
      <h1 className="font-playfair text-5xl mb-12">Cửa hàng đối tác</h1>
      {Object.entries(byCity).map(([city, list]) => (
        <section key={city} className="mb-12">
          <h2 className="font-playfair text-2xl text-terracotta mb-6">{city}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {list.map(s => (
              <article key={s.id} className="border border-sand rounded p-6">
                {s.imageUrl && (
                  <div className="relative aspect-[4/3] mb-4">
                    <Image src={s.imageUrl} alt={s.name} fill className="object-cover rounded" />
                  </div>
                )}
                <h3 className="font-playfair text-xl">{s.name}</h3>
                <p className="text-stone-600 text-sm mt-2">{s.address}</p>
                {s.phone && <p className="text-sm mt-1">{s.phone}</p>}
                {s.hours && <p className="text-sm text-stone-500">{s.hours}</p>}
                {s.mapUrl && (
                  <a href={s.mapUrl} target="_blank" rel="noopener" className="text-terracotta text-sm mt-2 inline-block">
                    Xem bản đồ →
                  </a>
                )}
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
```

**Admin UI quản lý Stockist:**

Defer phần admin CRUD UI sang Phase 11 (Pages CMS). Phase 9d chỉ cần:
- Schema migration tạo bảng.
- Public page render (empty state hoặc data).
- Manual insert SQL khi cần test.

### 2.3 `/community/your-stories` page

**File:** `src/app/(store)/community/your-stories/page.tsx`

**Schema thêm section `communityYourStories` vào `site-schema.ts`:**

```ts
{
  id: "communityYourStories",
  label: "Trang 'Câu chuyện của bạn'",
  description: "Nội dung cho trang /community/your-stories",
  icon: "message-circle",
  fields: [
    { key: "title", type: "text", label: "Tiêu đề trang", default: "Câu chuyện của bạn" },
    { key: "intro", type: "textarea", label: "Đoạn mở đầu", default: "Chiếc cốc Cốc Nối của bạn đã đi cùng những khoảnh khắc nào? Chúng tôi muốn lắng nghe câu chuyện của bạn." },
    { key: "ctaText", type: "text", label: "Text CTA", default: "Gửi câu chuyện qua Telegram" },
    { key: "ctaUrl", type: "url", label: "Link CTA (Telegram, Form, ...)", default: "https://t.me/cocnoi" },
    {
      key: "stories",
      type: "repeatable",
      label: "Câu chuyện đã chia sẻ",
      itemLabel: "Câu chuyện",
      fields: [
        { key: "authorName", type: "text", label: "Tên người chia sẻ", required: true },
        { key: "location", type: "text", label: "Địa điểm/Thành phố" },
        { key: "content", type: "textarea", label: "Nội dung câu chuyện", required: true },
        { key: "image", type: "image", label: "Ảnh kèm" },
        { key: "date", type: "text", label: "Ngày (định dạng tự do)" },
      ],
      default: [],
    },
  ],
}
```

**Page render:**
```tsx
const config = await getSiteConfig();
const { title, intro, ctaText, ctaUrl, stories } = config.communityYourStories;

return (
  <div className="max-w-4xl mx-auto px-8 py-20">
    <h1 className="font-playfair text-5xl mb-6">{title}</h1>
    <p className="text-lg text-stone-700 mb-8">{intro}</p>
    
    {stories.length === 0 ? (
      <div className="bg-cream rounded p-8 text-center">
        <p className="mb-4">Hãy là người đầu tiên chia sẻ câu chuyện.</p>
        <a href={ctaUrl} target="_blank" rel="noopener" className="btn-primary">
          {ctaText}
        </a>
      </div>
    ) : (
      <div className="space-y-8">
        {stories.map((s, i) => (
          <article key={i} className="border-l-4 border-terracotta pl-6">
            <p className="text-stone-700 italic">"{s.content}"</p>
            <footer className="mt-3 text-sm text-stone-500">
              {s.authorName}
              {s.location && ` · ${s.location}`}
              {s.date && ` · ${s.date}`}
            </footer>
          </article>
        ))}
        <div className="mt-12 text-center">
          <a href={ctaUrl} target="_blank" rel="noopener" className="btn-primary">
            {ctaText}
          </a>
        </div>
      </div>
    )}
  </div>
);
```

### 2.4 `/checkout` redirect

**File:** `src/app/(store)/checkout/page.tsx`

Đảm bảo logic redirect khi cart disabled:

```tsx
import { redirect } from "next/navigation";

export default function CheckoutPage() {
  const cartEnabled = process.env.NEXT_PUBLIC_ENABLE_CART === "true";
  
  if (!cartEnabled) {
    redirect("/cua-hang");
  }
  
  // ... existing checkout UI
}
```

Nếu page đã có guard, confirm work. Nếu chưa, add logic trên.

### 2.5 AdminSidebar prep (defer brand config)

**File:** `src/components/admin/AdminSidebar.tsx` line ~145

Hiện tại hardcode "CỐC NỐI" + "Quản trị viên". Phase 9d **KHÔNG fix** triệt để (Phase 10 brand config sẽ làm), nhưng:

- Add TODO comment rõ ràng:
```tsx
{/* TODO: Phase 10 - read brand name from siteConfig.brand.brandName */}
<h1 className="font-playfair text-xl">CỐC NỐI</h1>
<p className="text-xs text-stone-500">Quản trị viên</p>
```

Hoặc tách thành component `AdminBrand` để Phase 10 dễ refactor:
```tsx
function AdminBrand() {
  // Phase 10: read from siteConfig.brand
  return (
    <>
      <h1 className="font-playfair text-xl">CỐC NỐI</h1>
      <p className="text-xs text-stone-500">Quản trị viên</p>
    </>
  );
}
```

## 3. Acceptance criteria

### 3.1 Footer
- [ ] Footer.tsx không còn `||` fallback string hardcode.
- [ ] Empty DB record → Footer render đúng từ schema default.
- [ ] Existing customize-managed footer text vẫn hiển thị đúng.

### 3.2 Stockists page
- [ ] Schema migration tạo `Stockist` table.
- [ ] `/partners/stockists` với 0 record: render empty state + CTA.
- [ ] `/partners/stockists` với data: render grouped by city.
- [ ] Sample data: insert 2-3 stockist manual qua SQL hoặc Prisma Studio để verify render.

### 3.3 Your stories page
- [ ] Schema section `communityYourStories` xuất hiện trong admin.
- [ ] `/community/your-stories` với 0 stories: render intro + CTA.
- [ ] `/community/your-stories` với stories: render list quote-style.
- [ ] Sửa intro/CTA trong admin reflect frontend.

### 3.4 Checkout
- [ ] `NEXT_PUBLIC_ENABLE_CART=false`: visit `/checkout` redirect to `/cua-hang`.
- [ ] `NEXT_PUBLIC_ENABLE_CART=true`: render checkout UI (existing).

### 3.5 AdminSidebar prep
- [ ] Component `AdminBrand` tách ra (hoặc TODO comment rõ).
- [ ] Hiện tại render "CỐC NỐI" / "Quản trị viên" như cũ.

### 3.6 Build + test
- [ ] `npm run build` pass.
- [ ] `tsc --noEmit` pass.
- [ ] No console errors trên các trang affected.
- [ ] Existing customize sections không bị ảnh hưởng.

## 4. Migration order

1. Branch `feat/phase9d-cleanup` từ master (sau khi 9c merged).
2. Schema additions: `Stockist` model + section `communityYourStories`.
3. Run `npx prisma migrate dev --name phase9d_cleanup`.
4. Update Footer.tsx remove fallbacks.
5. Implement `/partners/stockists` page.
6. Implement `/community/your-stories` page.
7. Confirm `/checkout` redirect logic.
8. Refactor AdminSidebar tách AdminBrand component.
9. Insert sample stockist data manual để test (optional).
10. Build + manual test.
11. Commit 3-4 commits.
12. Push PR.

## 5. Out of scope

- Admin CRUD UI cho Stockist (Phase 11 Pages CMS).
- Admin CRUD UI cho your-stories (Phase 11).
- Brand config externalization (Phase 10).
- Other admin stubs (Pages CMS, Reviews, Complaints, Notifications): Phase 11.

## 6. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Footer break khi schema default thiếu | Verify reader merge default từ Phase 4a, test với empty DB |
| Stockist migration fail trên Neon production | Test trên local SQLite + Neon dev DB trước deploy |
| Your-stories section confict với existing /community/your-stories code | Diff carefully, đảm bảo schema section thay placeholder hardcode |

---

Antigravity reference: Phase 9c phải merged trước. Sau khi 9d merge, Phase 9 closed hoàn toàn. Cốc Nối nav + taxonomy + hero video + cleanup xong.
