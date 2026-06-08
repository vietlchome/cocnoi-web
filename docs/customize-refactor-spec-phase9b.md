# Phase 9b spec - Mega menu schema-driven

**Branch:** `feat/phase9b-mega-menu`
**Effort:** 8-10h
**Phụ thuộc:** Phase 9a merged (cần FinishOption table cho cột 3)
**Phase tiếp theo:** 9c (route rename + hero video)

## 1. Mục tiêu

Replace hardcode `submenuMap` trong `HeaderClient.tsx` bằng mega menu schema-driven:
1. **Schema section `navigation`** mới với top-nav items + mega menu config.
2. **MegaMenu component** 3 col auto-pull DB (categories, collections, finishes) + 2 featured card.
3. **HeaderClient refactor** đọc schema, render dynamic.
4. **Mobile accordion** responsive.

KHÔNG đụng route, không rename `/shop` → `/cua-hang` (Phase 9c).

## 2. Scope

### 2.1 Schema config (`src/config/site-schema.ts`)

Add section `navigation`:

```ts
{
  id: "navigation",
  label: "Menu điều hướng",
  description: "Cấu hình menu chính + mega menu CỬA HÀNG",
  icon: "menu",
  fields: [
    {
      key: "topNavItems",
      type: "repeatable",
      label: "Mục menu chính",
      itemLabel: "Mục",
      maxItems: 8,
      fields: [
        { key: "label", type: "text", label: "Tên hiển thị", required: true },
        { key: "href", type: "url", label: "Link", required: true },
        { key: "hasMegaMenu", type: "boolean", label: "Có mega menu xổ xuống?", default: false },
        { key: "openInNewTab", type: "boolean", label: "Mở tab mới", default: false },
      ],
      default: [
        { label: "CỬA HÀNG", href: "/shop", hasMegaMenu: true, openInNewTab: false },
        { label: "KHÁM PHÁ", href: "/discover", hasMegaMenu: false, openInNewTab: false },
        { label: "CỘNG ĐỒNG", href: "/community/nguoi-noi", hasMegaMenu: false, openInNewTab: false },
        { label: "ĐỐI TÁC", href: "/partners", hasMegaMenu: false, openInNewTab: false },
        { label: "HÀNH TRÌNH", href: "/journey", hasMegaMenu: false, openInNewTab: false },
      ],
    },
    {
      key: "megaMenu",
      type: "group",
      label: "Mega menu CỬA HÀNG",
      description: "Tự động kéo dữ liệu từ Category, BST, Hoàn thiện. Chỉ cần config tiêu đề + featured cards.",
      fields: [
        {
          key: "column1",
          type: "group",
          label: "Cột 1 - Danh mục",
          fields: [
            { key: "title", type: "text", label: "Tiêu đề cột", default: "DANH MỤC" },
            { key: "viewAllLabel", type: "text", label: "Text 'Xem tất cả'", default: "→ Xem tất cả sản phẩm" },
          ],
        },
        {
          key: "column2",
          type: "group",
          label: "Cột 2 - Bộ sưu tập",
          fields: [
            { key: "title", type: "text", label: "Tiêu đề cột", default: "BỘ SƯU TẬP" },
            { key: "viewAllLabel", type: "text", label: "Text 'Xem tất cả'", default: "→ Xem tất cả BST" },
          ],
        },
        {
          key: "column3",
          type: "group",
          label: "Cột 3 - Hoàn thiện",
          fields: [
            { key: "title", type: "text", label: "Tiêu đề cột", default: "HOÀN THIỆN" },
            { key: "viewAllLabel", type: "text", label: "Text 'Xem tất cả'", default: "→ Xem tất cả kỹ thuật" },
          ],
        },
        {
          key: "featuredCards",
          type: "repeatable",
          label: "Card nổi bật (tối đa 2)",
          itemLabel: "Card",
          maxItems: 2,
          fields: [
            { key: "title", type: "text", label: "Tiêu đề", required: true },
            { key: "subtitle", type: "text", label: "Phụ đề" },
            { key: "image", type: "image", label: "Ảnh card", required: true },
            { key: "href", type: "url", label: "Link đến", required: true },
            { key: "ctaLabel", type: "text", label: "Text CTA", default: "Khám phá" },
          ],
          default: [
            {
              title: "BST Mộc 2026",
              subtitle: "Bộ sưu tập mới nhất",
              image: "",
              href: "/bst/moc-2026",
              ctaLabel: "Khám phá"
            },
            {
              title: "Bán chạy nhất",
              subtitle: "Top picks",
              image: "",
              href: "/shop?sort=bestsellers",
              ctaLabel: "Xem ngay"
            }
          ],
        },
      ],
    },
  ],
}
```

### 2.2 Reader update

`src/lib/site-config.ts`:
- Khi đọc section `navigation`, merge default từ schema nếu DB chưa có (Phase 4a đã có pattern này).
- Type-safe: thêm `NavigationConfig` type.

### 2.3 MegaMenu component (mới)

**File:** `src/components/store/MegaMenu.tsx`

Server component (vì fetch DB):

```tsx
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";

type MegaMenuProps = {
  config: NavigationConfig["megaMenu"];
};

export async function MegaMenu({ config }: MegaMenuProps) {
  const [categories, collections, finishes] = await Promise.all([
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
    prisma.finishOption.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="absolute top-full left-0 w-screen bg-warm-white shadow-xl pt-3 z-50">
      <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-8">
        {/* Col 1 - Danh mục */}
        <div className="col-span-3">
          <h3 className="font-playfair text-sm tracking-[0.15em] text-deep-indigo mb-4 uppercase">
            {config.column1.title}
          </h3>
          <ul className="space-y-2.5">
            {categories.map(cat => (
              <li key={cat.id}>
                <Link 
                  href={`/shop?category=${cat.slug}`}
                  className="text-deep-indigo hover:text-terracotta transition-colors"
                >
                  {cat.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/shop" className="text-terracotta text-sm">
                {config.column1.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 2 - BST */}
        <div className="col-span-3">
          <h3 className="font-playfair text-sm tracking-[0.15em] text-deep-indigo mb-4 uppercase">
            {config.column2.title}
          </h3>
          <ul className="space-y-2.5">
            {collections.map(c => (
              <li key={c.id}>
                <Link 
                  href={`/shop?collection=${c.slug}`}
                  className="text-deep-indigo hover:text-terracotta transition-colors"
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/shop?view=collections" className="text-terracotta text-sm">
                {config.column2.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Col 3 - Hoàn thiện */}
        <div className="col-span-3">
          <h3 className="font-playfair text-sm tracking-[0.15em] text-deep-indigo mb-4 uppercase">
            {config.column3.title}
          </h3>
          <ul className="space-y-2.5">
            {finishes.map(f => (
              <li key={f.id}>
                <Link 
                  href={`/shop?finish=${f.slug}`}
                  className="text-deep-indigo hover:text-terracotta transition-colors"
                >
                  {f.name}
                </Link>
              </li>
            ))}
            <li className="pt-2">
              <Link href="/shop?view=finishes" className="text-terracotta text-sm">
                {config.column3.viewAllLabel}
              </Link>
            </li>
          </ul>
        </div>

        {/* Featured cards */}
        <div className="col-span-3 grid grid-rows-2 gap-3">
          {config.featuredCards.map((card, i) => (
            <Link key={i} href={card.href} className="block group">
              <div className="relative aspect-[4/3] overflow-hidden rounded">
                {card.image ? (
                  <Image
                    src={card.image}
                    alt={card.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 1024px) 0vw, 250px"
                  />
                ) : (
                  <div className="absolute inset-0 bg-cream flex items-center justify-center text-stone-400 text-sm">
                    No image
                  </div>
                )}
              </div>
              <h4 className="font-playfair text-deep-indigo mt-2">{card.title}</h4>
              {card.subtitle && (
                <p className="text-xs text-stone-600">{card.subtitle}</p>
              )}
              <span className="text-terracotta text-xs">{card.ctaLabel} →</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

Cache với `unstable_cache`:
```ts
import { unstable_cache } from "next/cache";

const getCachedNavData = unstable_cache(
  async () => {
    return await Promise.all([...]);
  },
  ["mega-menu-data"],
  { revalidate: 300 } // 5 minutes
);
```

Invalidate cache khi:
- Tạo/xóa Category, Collection, Finish (server action revalidatePath hoặc revalidateTag).

### 2.4 HeaderClient refactor

`src/components/shared/HeaderClient.tsx`:

Remove hardcode `submenuMap`. Đọc `config.navigation`:

```tsx
"use client";

type HeaderClientProps = {
  config: SiteConfig;
  megaMenuContent: React.ReactNode;  // server-rendered MegaMenu passed as prop
};

export function HeaderClient({ config, megaMenuContent }: HeaderClientProps) {
  const { topNavItems } = config.navigation;
  const [hoveredItem, setHoveredItem] = useState<number | null>(null);
  
  return (
    <header>
      <nav className="flex items-center gap-8">
        {topNavItems.map((item, i) => (
          <div
            key={i}
            className="relative"
            onMouseEnter={() => setHoveredItem(i)}
            onMouseLeave={() => setHoveredItem(null)}
          >
            <Link href={item.href} target={item.openInNewTab ? "_blank" : undefined}>
              {item.label}
            </Link>
            {item.hasMegaMenu && hoveredItem === i && megaMenuContent}
          </div>
        ))}
      </nav>
    </header>
  );
}
```

**Server component wrapper** (`src/components/shared/Header.tsx` hoặc parent):

```tsx
import { getSiteConfig } from "@/lib/site-config";
import { MegaMenu } from "@/components/store/MegaMenu";
import { HeaderClient } from "./HeaderClient";

export async function Header() {
  const config = await getSiteConfig();
  const megaMenuContent = <MegaMenu config={config.navigation.megaMenu} />;
  
  return <HeaderClient config={config} megaMenuContent={megaMenuContent} />;
}
```

### 2.5 Mobile accordion

Breakpoint `<lg` (1024px):
- Hamburger menu (icon đã có).
- Click mở off-canvas full-height drawer.
- Top-nav items list dọc.
- Item có `hasMegaMenu = true` (CỬA HÀNG): click expand accordion show 3 group:
  - Group 1 "DANH MỤC" với list categories.
  - Group 2 "BỘ SƯU TẬP" với list collections.
  - Group 3 "HOÀN THIỆN" với list finishes.
  - Featured cards stack dưới cùng.

Component mới `src/components/store/MegaMenuMobile.tsx`:
- Render same data, layout accordion vertical.
- Click item → close drawer + navigate.

## 3. Acceptance criteria

### 3.1 Schema
- [ ] Section `navigation` xuất hiện trong `/admin/customize`.
- [ ] Default 5 top-nav items load đúng.
- [ ] Mega menu config 3 cột + 2 featured cards (placeholder image).
- [ ] Sửa title cột, viewAllLabel persist + reflect trên storefront.

### 3.2 Desktop mega menu
- [ ] Hover "CỬA HÀNG" → mega menu xổ xuống.
- [ ] Cột 1 list categories từ DB (sort theo sortOrder).
- [ ] Cột 2 list collections từ DB.
- [ ] Cột 3 list 5 finishes từ Phase 9a.
- [ ] Click category/BST/finish → URL có query param đúng (`?category=`, `?collection=`, `?finish=`).
- [ ] 2 featured card render image + title + CTA.
- [ ] Hover bridge OK (giữ `pt-3` từ hotfix).
- [ ] Items khác (KHÁM PHÁ, CỘNG ĐỒNG, ĐỐI TÁC, HÀNH TRÌNH) render simple link, không có mega.

### 3.3 Mobile menu
- [ ] Hamburger toggle drawer.
- [ ] CỬA HÀNG accordion expand 3 group + featured.
- [ ] Click item navigate + close drawer.
- [ ] Items khác render simple link.

### 3.4 Performance
- [ ] Mega menu DB queries cached 5 phút (unstable_cache).
- [ ] Cache invalidate khi tạo/sửa Category, Collection, Finish.
- [ ] No FOUC khi load page.

### 3.5 Build + test
- [ ] `npm run build` pass.
- [ ] `tsc --noEmit` pass.
- [ ] No console errors.
- [ ] Lighthouse mobile home: không regression LCP.

## 4. Out of scope

- Route rename `/shop` → `/cua-hang` (Phase 9c).
- Hero video (Phase 9c).
- Footer cleanup (Phase 9d).
- Stub pages (Phase 9d).

## 5. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Cache stale khi update taxonomy | Server action revalidate tag `mega-menu-data` |
| Mobile drawer animation lag | CSS transform thay JS animation |
| Mega menu broken khi DB queries fail | Fallback empty list + console warn |

---

Antigravity reference: Phase 9a phải merged trước (cần FinishOption). Start với schema config, sau đó MegaMenu component, cuối cùng HeaderClient refactor.
