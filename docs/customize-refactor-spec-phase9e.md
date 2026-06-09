# Phase 9e spec - Navigation fixes (submenu + dark mode + HÀNH TRÌNH)

**Branch:** `feat/phase9e-nav-fix`
**Effort:** 3-4h
**Phụ thuộc:** Phase 9d merged
**Loại:** Bug patch + spec gap fix

## 1. Bối cảnh

Phase 9b shipped với 3 bug discovered local test:
1. **HÀNH TRÌNH biến mất**: Antigravity drop HÀNH TRÌNH + đổi tên "CỬA HÀNG" → "Sản phẩm" trong default (deviation từ spec).
2. **Submenu KHÁM PHÁ/CỘNG ĐỒNG/ĐỐI TÁC mất**: Spec 9b chỉ define mega menu cho CỬA HÀNG. Các item khác không có submenu config, dropdown cũ trong `submenuMap` hardcode bị xóa không có thay thế.
3. **Mega menu "đen sì"**: Antigravity tự thêm `dark:bg-zinc-900` + `dark:text-...` variants. Cốc Nối không có design system dark mode, các component khác không có dark variants. OS dark mode → browser auto-detect → mega menu render với background tối, text giữ màu deep-indigo = contrast vỡ.

## 2. Mục tiêu

Patch 3 bug + cải thiện schema architecture cho navigation:
1. **Schema refactor**: thay `hasMegaMenu: boolean` thành `submenuType: enum` (none/simple/mega) + thêm `simpleSubmenu` repeatable field.
2. **Restore HÀNH TRÌNH** + revert "CỬA HÀNG" label.
3. **Migrate dropdown data** từ old `submenuMap` (đã xóa) vào schema default.
4. **HeaderClient render 3 case** dropdown: none, simple, mega.
5. **Remove dark mode variants** trong MegaMenu + MegaMenuMobile components.

## 3. Schema changes

### 3.1 Site-schema.ts - `navigation` section

**File:** `src/config/site-schema.ts`

Edit section `navigation`, field `topNavItems` itemSchema:

**Trước (hiện tại):**
```ts
fields: [
  { key: "label", type: "text", label: "Tên hiển thị", required: true },
  { key: "href", type: "url", label: "Link", required: true },
  { key: "hasMegaMenu", type: "boolean", label: "Có mega menu xổ xuống?", default: false },
  { key: "openInNewTab", type: "boolean", label: "Mở tab mới", default: false },
],
```

**Sau:**
```ts
fields: [
  { key: "label", type: "text", label: "Tên hiển thị", required: true },
  { key: "href", type: "url", label: "Link", required: true },
  { 
    key: "submenuType", 
    type: "select", 
    label: "Loại submenu",
    options: [
      { value: "none", label: "Không có submenu" },
      { value: "simple", label: "Dropdown list đơn giản" },
      { value: "mega", label: "Mega menu (chỉ CỬA HÀNG)" },
    ],
    default: "none",
    required: true,
  },
  {
    key: "simpleSubmenu",
    type: "repeatable",
    label: "Items submenu (chỉ dùng khi loại = Dropdown list)",
    itemLabel: "Item",
    maxItems: 10,
    fields: [
      { key: "label", type: "text", label: "Tên hiển thị", required: true },
      { key: "href", type: "url", label: "Link", required: true },
    ],
    default: [],
  },
  { key: "openInNewTab", type: "boolean", label: "Mở tab mới", default: false },
],
```

### 3.2 Default `topNavItems` data

```ts
default: [
  { 
    label: "CỬA HÀNG", 
    href: "/cua-hang", 
    submenuType: "mega", 
    simpleSubmenu: [],
    openInNewTab: false 
  },
  { 
    label: "KHÁM PHÁ", 
    href: "/discover", 
    submenuType: "simple",
    simpleSubmenu: [
      { label: "Câu chuyện của chúng tôi", href: "/discover/our-story" },
      { label: "Người làm gốm", href: "/discover/our-human" },
      { label: "Quy trình thủ công", href: "/discover/our-craft" },
      { label: "Giá trị cốt lõi", href: "/discover/our-values" },
    ],
    openInNewTab: false 
  },
  { 
    label: "CỘNG ĐỒNG", 
    href: "/community/nguoi-noi", 
    submenuType: "simple",
    simpleSubmenu: [
      { label: "Người Nối", href: "/community/nguoi-noi" },
      { label: "Câu chuyện của bạn", href: "/community/your-stories" },
    ],
    openInNewTab: false 
  },
  { 
    label: "ĐỐI TÁC", 
    href: "/partners", 
    submenuType: "simple",
    simpleSubmenu: [
      { label: "Cửa hàng đối tác", href: "/partners/stockists" },
      { label: "Trở thành đối tác", href: "/partners/become-a-stockist" },
      { label: "Quà tặng doanh nghiệp", href: "/partners/corporate-gifting" },
    ],
    openInNewTab: false 
  },
  { 
    label: "HÀNH TRÌNH", 
    href: "/journey", 
    submenuType: "none",
    simpleSubmenu: [],
    openInNewTab: false 
  },
],
```

### 3.3 Backward compatibility

Reader (`src/lib/site-config.ts`) cần handle existing DB records có `hasMegaMenu: boolean`:

```ts
function migrateNavItem(item: any) {
  // Phase 9e migration: hasMegaMenu boolean → submenuType enum
  if ("hasMegaMenu" in item && !("submenuType" in item)) {
    item.submenuType = item.hasMegaMenu ? "mega" : "none";
    delete item.hasMegaMenu;
  }
  if (!item.simpleSubmenu) item.simpleSubmenu = [];
  return item;
}
```

Apply trong `getSiteConfig` khi đọc `navigation.topNavItems`. Migration lazy, không cần Prisma migration mới.

### 3.4 Zod validator

**File:** `src/lib/site-config-validate.ts`

Update schema `navigation`:
```ts
const NavItemSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  submenuType: z.enum(["none", "simple", "mega"]).default("none"),
  simpleSubmenu: z.array(z.object({
    label: z.string().min(1),
    href: z.string().min(1),
  })).default([]),
  openInNewTab: z.boolean().default(false),
});
```

Backward compat: pre-process step convert `hasMegaMenu` → `submenuType` trước validate.

## 4. Component changes

### 4.1 HeaderClient.tsx

**File:** `src/components/shared/HeaderClient.tsx`

Render logic 3 case:

```tsx
{topNavItems.map((item, i) => {
  const isHovered = hoveredItem === i;
  
  return (
    <div
      key={i}
      className="relative"
      onMouseEnter={() => setHoveredItem(i)}
      onMouseLeave={() => setHoveredItem(null)}
    >
      <Link 
        href={item.href} 
        target={item.openInNewTab ? "_blank" : undefined}
        className="text-deep-indigo hover:text-terracotta transition-colors font-playfair tracking-wider"
      >
        {item.label}
        {item.submenuType !== "none" && (
          <ChevronDown className="inline ml-1 w-3 h-3" />
        )}
      </Link>
      
      {/* Case 1: Mega menu */}
      {item.submenuType === "mega" && isHovered && megaMenuContent}
      
      {/* Case 2: Simple dropdown */}
      {item.submenuType === "simple" && isHovered && item.simpleSubmenu?.length > 0 && (
        <SimpleSubmenu items={item.simpleSubmenu} />
      )}
      
      {/* Case 3: none - just link, no dropdown */}
    </div>
  );
})}
```

### 4.2 SimpleSubmenu component (mới)

**File:** `src/components/store/SimpleSubmenu.tsx`

```tsx
import Link from "next/link";

type SimpleSubmenuProps = {
  items: { label: string; href: string }[];
};

export function SimpleSubmenu({ items }: SimpleSubmenuProps) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-3 min-w-[220px] z-50">
      <div className="bg-warm-white shadow-lg rounded border border-sand py-2">
        {items.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="block px-4 py-2 text-deep-indigo hover:bg-cream hover:text-terracotta transition-colors text-sm"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Lưu ý quan trọng:**
- Wrapper dùng `pt-3` thay `mt-3` để giữ hover bridge (đã fix trong hotfix trước).
- Background `bg-warm-white` (CSS variable `--color-warm-white` = `#FEFCF9`).
- **KHÔNG có `dark:*` variants nào.**

### 4.3 MegaMenu.tsx - remove dark mode

**File:** `src/components/store/MegaMenu.tsx`

Remove tất cả `dark:` Tailwind class variants. Component này render trong Cốc Nối branded UI, không support dark mode.

**Grep & remove:**
```
dark:bg-zinc-900 → remove
dark:bg-deep-indigo → remove
dark:text-... → remove
dark:border-... → remove
```

Sau khi clean:
```tsx
<div className="absolute top-full left-0 w-screen bg-warm-white shadow-xl pt-3 z-50">
  <div className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-12 gap-8">
    {/* Columns + featured cards với bg-warm-white, text-deep-indigo, hover text-terracotta */}
  </div>
</div>
```

### 4.4 MegaMenuMobile.tsx - remove dark mode

Tương tự MegaMenu.tsx. Remove tất cả `dark:` variants.

### 4.5 Mobile drawer menu update

**File:** `src/components/store/MegaMenuMobile.tsx` (hoặc tương đương)

Handle 3 case submenu trong mobile accordion:
- `submenuType=none`: simple link, click → navigate + close drawer.
- `submenuType=simple`: accordion expand → render simpleSubmenu items dọc.
- `submenuType=mega`: accordion expand → render 3 group (Danh mục/BST/Hoàn thiện) + featured cards stack dưới (như Phase 9b).

```tsx
{topNavItems.map((item, i) => {
  if (item.submenuType === "none") {
    return <MobileSimpleLink key={i} {...item} />;
  }
  if (item.submenuType === "simple") {
    return <MobileAccordionSimple key={i} {...item} />;
  }
  if (item.submenuType === "mega") {
    return <MobileAccordionMega key={i} config={megaMenuConfig} />;
  }
})}
```

## 5. Acceptance criteria

### 5.1 Schema
- [ ] Section `navigation.topNavItems` itemSchema có 5 fields: label, href, submenuType, simpleSubmenu, openInNewTab.
- [ ] `submenuType` field là enum select với 3 options: none/simple/mega.
- [ ] `simpleSubmenu` repeatable field với items {label, href}.
- [ ] Default 5 top-nav items với submenu data đầy đủ.

### 5.2 Backward compatibility
- [ ] DB record có `hasMegaMenu: true` được auto-migrate thành `submenuType: "mega"` khi read.
- [ ] DB record có `hasMegaMenu: false` → `submenuType: "none"`.
- [ ] Item thiếu `simpleSubmenu` → fallback empty array.
- [ ] Không cần Prisma migration mới (lazy migration trong reader).

### 5.3 Desktop render
- [ ] 5 top-nav items hiển thị: CỬA HÀNG, KHÁM PHÁ, CỘNG ĐỒNG, ĐỐI TÁC, HÀNH TRÌNH.
- [ ] Hover CỬA HÀNG → mega menu 3 col xổ xuống (giữ pattern Phase 9b).
- [ ] Hover KHÁM PHÁ → simple dropdown 4 items.
- [ ] Hover CỘNG ĐỒNG → simple dropdown 2 items.
- [ ] Hover ĐỐI TÁC → simple dropdown 3 items.
- [ ] Hover HÀNH TRÌNH → không có submenu (just link).
- [ ] Click item submenu → navigate đúng URL.

### 5.4 Mobile render
- [ ] Hamburger toggle drawer.
- [ ] 5 top-nav items list dọc.
- [ ] CỬA HÀNG accordion → 3 group (Danh mục/BST/Hoàn thiện) + featured cards stack.
- [ ] KHÁM PHÁ/CỘNG ĐỒNG/ĐỐI TÁC accordion → simple submenu items list dọc.
- [ ] HÀNH TRÌNH → simple link, click navigate + close drawer.

### 5.5 Dark mode bug fix
- [ ] `MegaMenu.tsx` không còn bất kỳ `dark:*` Tailwind class nào.
- [ ] `MegaMenuMobile.tsx` không còn bất kỳ `dark:*` Tailwind class nào.
- [ ] OS dark mode enabled → mega menu vẫn render đúng (light theme Cốc Nối, không phải zinc-900).
- [ ] Text contrast pass WCAG AA (deep-indigo trên warm-white).

### 5.6 Hover bridge
- [ ] SimpleSubmenu wrapper dùng `pt-3` (không `mt-3`).
- [ ] Mouse di chuột nhanh từ top-nav xuống submenu không bị mất hover.

### 5.7 Build + test
- [ ] `npm run build` pass.
- [ ] `tsc --noEmit` pass.
- [ ] No console errors.

## 6. Migration order

1. Branch `feat/phase9e-nav-fix` từ master (sau khi 9d merged).
2. Edit `src/config/site-schema.ts` schema + default data.
3. Edit `src/lib/site-config-validate.ts` Zod schema.
4. Edit `src/lib/site-config.ts` reader với `migrateNavItem` helper.
5. Create `src/components/store/SimpleSubmenu.tsx`.
6. Edit `src/components/shared/HeaderClient.tsx` 3-case render.
7. Edit `src/components/store/MegaMenu.tsx` remove dark mode.
8. Edit `src/components/store/MegaMenuMobile.tsx` remove dark mode + 3-case render.
9. Test local: dark OS mode + light OS mode + mobile viewport.
10. Build + tsc.
11. Commit 3-4 commits.
12. Push PR.

## 7. Out of scope

- Mega menu data source change (giữ auto-pull Category/Collection/Finish như Phase 9b).
- Footer cleanup (đã làm Phase 9d).
- Route rename (đã làm Phase 9c).

## 8. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Existing DB record có `hasMegaMenu` không migrate được | Lazy migration trong reader handle backward compat |
| HeaderClient state conflict giữa mega + simple hover | Single `hoveredItem` state, render branch theo `submenuType` |
| Mobile drawer height overflow khi expand mega | `max-h-screen overflow-y-auto` trong drawer container |
| Dark mode user actually wants dark | Defer dark mode design system thành phase riêng. Hiện tại Cốc Nối light only. |

## 9. Test checklist (anh tự test local sau khi Antigravity push)

| Test case | Expected | Actual? |
|---|---|---|
| Desktop hover CỬA HÀNG | Mega menu 3 col light bg | |
| Desktop hover KHÁM PHÁ | Dropdown 4 items | |
| Desktop hover CỘNG ĐỒNG | Dropdown 2 items | |
| Desktop hover ĐỐI TÁC | Dropdown 3 items | |
| Desktop hover HÀNH TRÌNH | No dropdown, click navigate | |
| OS dark mode enabled, hover CỬA HÀNG | Mega menu vẫn light (không zinc-900) | |
| Mobile hamburger → CỬA HÀNG accordion | 3 group + featured | |
| Mobile hamburger → KHÁM PHÁ accordion | Simple list 4 items | |
| Mouse hover bridge | Không mất hover khi di chuột nhanh | |
| Admin edit topNavItems → save → reload | Render đúng cấu hình mới | |

---

Antigravity reference: đây là patch/bug fix, không phải feature mới. Focus correctness + không break existing functionality.
