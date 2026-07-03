# Phase 10b spec - Màn Menu riêng (điều hướng) [Hạng mục A]

**Branch:** `feat/phase10b-menu-screen`
**Effort:** 2-3h
**Phụ thuộc:** Phase 10a merged (navigation đã bị ẩn khỏi customizer)
**Loại:** Admin surface mới (tái sử dụng component sẵn có, KHÔNG đụng schema/DB)
**Executor:** Antigravity

## 1. Mục tiêu

Tách bộ dựng menu điều hướng ra thành màn riêng tại `/admin/website/navigation` (hiện là stub "Coming Soon"), kiểu Haravan Menu: thêm/bớt mục, kéo thả sắp thứ tự, menu con lồng nhau.

Điểm mấu chốt: **KHÔNG viết lại logic menu.** Dữ liệu menu đã tồn tại trong `SITE_SCHEMA.navigation` (field `topNavItems` là `repeatable` với `simpleSubmenu` lồng bên trong, đã hỗ trợ drag qua `@dnd-kit` trong `RepeatableEditor`). Việc cần làm là **host slice `navigation` này thành 1 màn độc lập** + lưu riêng.

KHÔNG đụng:
- `src/config/site-schema.ts` (giữ nguyên section `navigation`).
- `SectionEditor.tsx`, `RepeatableEditor.tsx`, các field input.
- Storefront `Header.tsx`/`HeaderClient.tsx` (đã đọc `config.navigation`, không đổi).
- Prisma schema / DB / migration (phase này không có).

## 2. Quy tắc bắt buộc (Antigravity follow)

- **KHÔNG dùng em-dash `—`**.
- **KHÔNG thêm dark mode `dark:*`**. Light theme only.
- **KHÔNG tự đổi label menu mặc định** trong schema.
- Code style: TypeScript strict, Next.js 16 App Router, Tailwind v4 (token dự án).
- Tái sử dụng `updateSiteConfigAction` (đã revalidate `/` layout, header cập nhật ngay).
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- 2 commit logical: màn navigation / sidebar link.

## 3. Scope

### 3.1 Server page

**File:** `src/app/(admin)/admin/website/navigation/page.tsx` (thay stub)

```tsx
import { getSiteConfig } from "@/lib/site-config";
import { requireAdmin } from "@/lib/auth-helpers";
import MenuManagerClient from "@/components/admin/website/MenuManagerClient";

export const metadata = {
  title: "Menu điều hướng | Cốc Nối Admin",
};

export default async function NavigationPage() {
  await requireAdmin();
  const config = await getSiteConfig();
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <MenuManagerClient initialConfig={config} />
    </div>
  );
}
```

### 3.2 Client component

**File mới:** `src/components/admin/website/MenuManagerClient.tsx`

Yêu cầu:
- `"use client"`.
- Nhận `initialConfig: SiteConfig`.
- State `config` khởi tạo từ `initialConfig`.
- Render header màn: tiêu đề "Menu điều hướng", mô tả ngắn ("Quản lý các mục menu chính và menu con hiển thị trên đầu website"), nút "Xem thực tế" (link `/` target blank) + nút "Lưu thay đổi".
- Render `SectionEditor` cho **chỉ** section `navigation`:
  ```tsx
  <SectionEditor
    schema={SITE_SCHEMA.navigation.fields}
    value={(config.navigation || {}) as any}
    onChange={(val) => setConfig((prev) => ({ ...prev, navigation: val }))}
    path="navigation"
    errors={groupedErrors?.navigation}
    disabled={isPending}
  />
  ```
- Save: gọi `updateSiteConfigAction(config)` (gửi full config, chỉ `navigation` thay đổi). Xử lý success/error + validation panel giống `SiteCustomizerClient` (tái dùng cùng pattern `regroupErrors`, `fieldErrors`, `status`).
- Bố cục: save bar sticky trên cùng, dưới là 1 khối chứa SectionEditor (không cần 2 cột vì chỉ 1 section).

**Lưu ý:** copy nguyên các helper `regroupErrors`, khối save bar, validation panel từ `SiteCustomizerClient.tsx` để đồng nhất UX. Chỉ khác: render đúng 1 section `navigation` thay vì rail nhiều section.

### 3.3 Thêm link vào sidebar admin

**File:** `src/components/admin/AdminSidebar.tsx`

Trong `SALES_CHANNELS[0].submenus` (mục "Website"), thêm item "Menu" trỏ `/admin/website/navigation`. Thứ tự đề xuất: Giao diện, Menu, Blogs.

```tsx
const SALES_CHANNELS = [
  {
    title: "Website",
    icon: Globe,
    actionIcon: Eye,
    actionHref: "/",
    submenus: [
      { title: "Giao diện", href: "/admin/customize", icon: Palette },
      { title: "Menu", href: "/admin/website/navigation", icon: Menu },
      { title: "Blogs", href: "/admin/website/blogs", icon: FileEdit },
    ]
  }
];
```

`Menu` icon đã được import sẵn ở đầu file (dòng import lucide-react). Nếu chưa, thêm vào import.

## 4. Acceptance criteria

- [ ] `/admin/website/navigation` render màn Menu (không còn "Coming Soon").
- [ ] Hiển thị danh sách `topNavItems`, kéo thả sắp thứ tự OK (dnd-kit sẵn có).
- [ ] Thêm/xóa 1 mục menu chính OK.
- [ ] Với mục có `submenuType = simple`, thêm/xóa/kéo thả `simpleSubmenu` con OK.
- [ ] Lưu thay đổi -> ra storefront `/`, header cập nhật đúng menu mới.
- [ ] Sidebar admin mục Website có link "Menu", active state đúng khi ở màn này.
- [ ] Customizer (`/admin/customize`) vẫn KHÔNG hiển thị navigation (không hồi quy Phase 10a).
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Out of scope

- Đổi cấu trúc dữ liệu menu (giữ nguyên schema `navigation`).
- Chọn "gắn tới Trang nội dung" trong menu: chờ Phase 10c có model Page rồi mới nâng cấp (khi đó `href` có thể có picker chọn page). Phase này `href` vẫn là ô nhập URL như hiện tại.
- Mega menu config (nằm trong `navigation.megaMenu`, vẫn sửa được qua cùng SectionEditor, không cần xử lý thêm).

## 6. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Save màn Menu ghi đè section khác | KHÔNG. `updateSiteConfigAction` nhận full config; chỉ `navigation` bị đổi trong state, các section khác giữ nguyên từ `initialConfig`. |
| Header không cập nhật sau lưu | `updateSiteConfigAction` đã `revalidatePath('/', 'layout')`, đủ để refresh header. |
| Trùng logic với customizer | Chấp nhận copy helper nhỏ (regroupErrors, save bar) để 2 màn độc lập, dễ bảo trì. |

## 7. Test checklist thủ công (sau khi push)

| Test case | Expected | Pass? |
|---|---|---|
| Vào /admin/website/navigation | Màn Menu hiện danh sách mục | |
| Kéo thả đổi thứ tự 2 mục chính | Thứ tự đổi trên UI | |
| Thêm mục con vào "KHÁM PHÁ" | Item con mới xuất hiện | |
| Bấm Lưu, mở / | Header đổi theo menu mới | |
| Sidebar admin | Có "Menu" dưới Website, active đúng | |
| Mở /admin/customize | Vẫn không thấy section Điều hướng | |
