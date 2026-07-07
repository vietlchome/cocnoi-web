# Phase 10b-2 spec - Menu builder kiểu Haravan (thay UI generic) [nâng cấp Hạng mục A]

**Branch:** tiếp tục trên `feat/phase10b-menu-screen` (CHƯA merge). Nếu đã lỡ merge 10b, tạo `feat/phase10b2-menu-builder` từ master.
**Effort:** 4-6h
**Phụ thuộc:** 10b (màn `/admin/website/navigation` đã tồn tại)
**Loại:** UI redesign (component mới, KHÔNG đụng schema/DB/storefront)
**Executor:** Antigravity / Claude Code

## 1. Vấn đề

Màn Menu ở 10b đang dùng `SectionEditor` chung để render `navigation`, nên mỗi mục bung hết field ra, nhãn lặp ("Danh sách mục điều hướng" x2, "Items submenu..." x2), nhìn rối, không giống trải nghiệm Haravan.

Mục tiêu: thay phần list bằng **menu builder chuyên dụng kiểu Haravan**:
- Mỗi mục là 1 dòng gọn: tay kéo (grip) + tên + nút hành động (thêm mục con, sửa, xóa).
- Sửa/thêm mở **popup (modal)**, không bung field inline.
- Mục con lồng thụt vào dưới mục cha, kéo thả sắp thứ tự cả cha lẫn con.
- Popup có ô "Liên kết đến" dạng dropdown loại + tự điền URL.

KHÔNG đụng:
- `src/config/site-schema.ts` (giữ nguyên cấu trúc `navigation.topNavItems` + `navigation.megaMenu`).
- `src/lib/site-config-validate.ts`, `updateSiteConfigAction` (giữ nguyên).
- Storefront `Header.tsx`/`MegaMenu.tsx` (dữ liệu không đổi nên header không cần sửa).
- Prisma / DB / migration (không có).

## 2. Quy tắc bắt buộc

- **KHÔNG dùng em-dash `—`**. Dùng dấu phẩy hoặc gạch ngắn `-`.
- **KHÔNG thêm dark mode `dark:*`**. Light theme only.
- **KHÔNG đổi data model**: vẫn lưu mỗi item là `{ label, href, submenuType, simpleSubmenu[], openInNewTab }`, con là `{ label, href }`. Ô "Liên kết đến" chỉ là cách tạo ra `href`, kết quả lưu vẫn là `href` (string URL).
- Giữ đúng giới hạn hiện tại: **1 cấp submenu** (mục cha + `simpleSubmenu`). KHÔNG làm lồng vô hạn (storefront chỉ render 1 cấp + mega menu).
- Code style: TypeScript strict, Next.js 16 App Router, Tailwind v4 (token dự án: `bg-canvas`, `text-primary`, `text-secondary`, `bg-subtle`, `border-border`, `text-accent`, `bg-primary`, `text-canvas`, `rounded-2/3/4`).
- Drag: dùng `@dnd-kit` theo đúng pattern trong `src/components/admin/customize/RepeatableEditor.tsx` (DndContext + SortableContext + useSortable + arrayMove + verticalListSortingStrategy, `@dnd-kit/utilities` CSS).
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- Tách commit: menu builder core / link picker / mega menu panel.

## 3. Scope

### 3.1 Cấu trúc lại `MenuManagerClient.tsx`

Giữ nguyên: save bar sticky (tiêu đề "Menu điều hướng", nút Xem thực tế + Lưu thay đổi), logic `handleSave` + `updateSiteConfigAction(config)` + validation panel + `regroupErrors`.

Thay **phần thân**: thay khối `<SectionEditor schema={SITE_SCHEMA.navigation.fields} .../>` bằng:
1. `<MenuBuilder items={config.navigation.topNavItems} onChange={...} />` cho danh sách mục.
2. Một panel gập "Cấu hình Mega Menu (nâng cao)" bên dưới, bên trong render `SectionEditor` CHỈ cho `navigation.megaMenu` (giữ khả năng chỉnh mega menu columns mà không mất). Mặc định gập lại.

Khi `MenuBuilder` onChange, cập nhật `config.navigation.topNavItems`; khi panel mega menu đổi, cập nhật `config.navigation.megaMenu`. Vẫn 1 nút Lưu chung.

### 3.2 Component mới `MenuBuilder.tsx`

**File mới:** `src/components/admin/website/MenuBuilder.tsx`

Props:
```ts
interface MenuItem { label: string; href: string; submenuType: "none" | "simple" | "mega"; simpleSubmenu: { label: string; href: string }[]; openInNewTab: boolean; }
interface Props { items: MenuItem[]; onChange: (next: MenuItem[]) => void; disabled?: boolean; }
```

UI:
- Tiêu đề nhỏ "Danh sách mục điều hướng" + đếm số mục (vd "5 mục"). Chỉ hiện MỘT lần (không lặp như bản cũ).
- Danh sách mục cha: `DndContext` + `SortableContext` (verticalListSortingStrategy). Mỗi mục cha là 1 dòng gọn:
  - Trái: grip kéo (GripVertical), chevron mở/gập nếu có `simpleSubmenu.length > 0` hoặc `submenuType==="simple"`.
  - Giữa: `label` (đậm). Dòng phụ mờ nhỏ: hiển thị `href` + badge loại submenu ("Mega"/"Dropdown"/"Không").
  - Phải: nút [+] "Thêm mục con" (chỉ bật khi `submenuType==="simple"`; nếu `none/mega` thì ẩn hoặc disable kèm tooltip), nút sửa (Pencil), nút xóa (Trash2, màu rose).
- Khi mở (chevron expand), render `simpleSubmenu` thụt lề, mỗi con là 1 dòng gọn hơn: grip + label + href mờ + nút sửa + nút xóa. Con cũng kéo thả trong phạm vi mục cha đó (SortableContext lồng, id theo index con).
- Cuối danh sách: nút "＋ Thêm mục điều hướng" mở modal thêm mục cha.

Hành vi:
- Kéo cha: `arrayMove` trên mảng items.
- Kéo con: `arrayMove` trên `simpleSubmenu` của đúng mục cha.
- Xóa cha: confirm ngắn (window.confirm hoặc ConfirmDialog `components/ui` nếu có) rồi bỏ khỏi mảng.
- Xóa con: bỏ khỏi `simpleSubmenu`.
- Thêm/sửa: mở modal (3.3), commit lại vào state qua `onChange`.

### 3.3 Modal thêm/sửa

Dùng `Modal` trong `src/components/ui` nếu có; nếu không, tự dựng overlay + panel bằng Tailwind (KHÔNG dùng browser prompt).

**Modal mục cha (Thêm/Cập nhật liên kết):**
- Tên liên kết -> `label` (text, bắt buộc).
- Loại submenu -> `submenuType` select: "Không có submenu" (none) / "Dropdown list" (simple) / "Mega menu (chỉ CỬA HÀNG)" (mega).
- Liên kết đến -> component `LinkPicker` (3.4), sinh ra `href`.
- Mở tab mới -> `openInNewTab` toggle.
- Nút Hủy / Lưu (Thêm hoặc Cập nhật).

**Modal mục con:**
- Tên liên kết -> `label`.
- Liên kết đến -> `LinkPicker` -> `href`.
- (Con KHÔNG có submenuType, KHÔNG openInNewTab, đúng theo schema con `{label, href}`.)

### 3.4 Component `LinkPicker.tsx`

**File mới:** `src/components/admin/website/LinkPicker.tsx`

Props: `{ value: string; onChange: (href: string) => void; }`

UI: 1 select "Liên kết đến" + (có điều kiện) 1 ô URL.

Danh sách loại (map sang route cố định của dự án):
```
Trang chủ                -> "/"
Cửa hàng (tất cả SP)     -> "/cua-hang"
Khám phá                 -> "/discover"
Cộng đồng                -> "/community/nguoi-noi"
Đối tác                  -> "/partners"
Hành trình (Blog)        -> "/journal"
Liên hệ                  -> "/contact"
Câu hỏi thường gặp       -> "/faq"
URL tùy chỉnh            -> (ô text tự nhập)
```
Hành vi:
- Chọn loại cố định: set `href` = route tương ứng, ẩn ô text (hoặc show read-only href để người dùng thấy).
- Chọn "URL tùy chỉnh": hiện ô text, `onChange` theo text nhập.
- Khi mở modal sửa: suy ra loại đang chọn bằng cách so `value` với bảng route; khớp thì chọn loại đó, không khớp thì chọn "URL tùy chỉnh" và đổ `value` vào ô text.

Ghi chú: giữ bảng route ở một hằng số trong file để sau này dễ mở rộng (thêm "Trang nội dung" sau khi Phase 10c xong).

## 4. Acceptance criteria

- [ ] `/admin/website/navigation`: danh sách mục hiển thị dạng dòng gọn (grip + tên + nút), KHÔNG bung field inline, KHÔNG lặp nhãn.
- [ ] Kéo thả sắp thứ tự mục cha OK; kéo thả mục con trong 1 cha OK.
- [ ] Nút [+] thêm mục con chỉ bật khi loại = Dropdown list.
- [ ] Mở rộng/thu gọn mục cha để xem mục con.
- [ ] Thêm mục cha qua modal (Tên + Loại + Liên kết đến + Mở tab mới), lưu vào danh sách.
- [ ] Sửa mục (cha/con) qua modal, giá trị đổ đúng vào form, cập nhật lại.
- [ ] Xóa mục (cha/con) có xác nhận.
- [ ] LinkPicker: chọn loại cố định tự điền URL; "URL tùy chỉnh" cho gõ tay; mở sửa suy ra đúng loại từ href.
- [ ] Panel "Cấu hình Mega Menu (nâng cao)" vẫn chỉnh được `navigation.megaMenu`.
- [ ] Bấm Lưu -> ra `/` header cập nhật đúng; các section khác trong site config KHÔNG bị mất (vẫn gửi full config).
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Out of scope (fast-follow sau)

- Picker đích cụ thể kiểu Haravan cấp 2 (chọn 1 Nhóm sản phẩm / Bộ sưu tập / Trang nội dung cụ thể). Sẽ thêm sau: Bộ sưu tập/Nhóm SP đọc từ DB, Trang nội dung sau khi Phase 10c xong. Lúc đó chỉ cần mở rộng `LinkPicker` (thêm loại + second dropdown nạp từ props).
- Lồng menu sâu hơn 1 cấp.
- Đổi data model sang lưu `linkType` + `targetId` (hiện suy ra từ href là đủ).

## 6. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Kéo thả con nhầm sang cha khác | Mỗi mục cha 1 SortableContext riêng, id con gắn theo cha |
| Mất mega menu config | Giữ panel SectionEditor cho `navigation.megaMenu` |
| Lưu làm mất section khác | Vẫn `updateSiteConfigAction(config)` với full config từ initialConfig |
| href sai khi đổi loại submenu = mega nhưng có submenu cũ | Không tự xóa `simpleSubmenu`; chỉ ẩn nút thêm con khi không phải simple |

## 7. Test thủ công (sau push)

| Test case | Expected | Pass? |
|---|---|---|
| Vào màn Menu | Dòng gọn kiểu Haravan, không lặp nhãn | |
| Kéo đổi thứ tự 2 mục cha | Thứ tự đổi | |
| Mở "KHÁM PHÁ", kéo 2 mục con | Thứ tự con đổi | |
| Thêm mục cha "Ưu đãi" link /journal | Modal, chọn Hành trình, lưu, xuất hiện | |
| Sửa 1 mục có href /cua-hang | LinkPicker tự chọn "Cửa hàng" | |
| Xóa 1 mục con | Có confirm, xóa xong | |
| Lưu rồi mở / | Header đúng menu mới | |
| Mở panel Mega Menu | Chỉnh được tiêu đề cột | |
```
