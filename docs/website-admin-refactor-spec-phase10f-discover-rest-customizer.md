# Phase 10f spec - Text các trang Khám phá còn lại vào Customizer [Bước 2, nhân rộng]

**Branch:** `feat/phase10f-discover-rest`
**Effort:** 4-6h
**Phụ thuộc:** Phase 10e merged (mẫu discover_story đã chạy)
**Loại:** Content-editability wiring qua Customizer (KHÔNG đụng DB/migration)
**Executor:** Antigravity / Claude Code

## 1. Mục tiêu

Nhân mô hình của 10e ra 3 trang Khám phá còn lại, cho admin sửa text trong Customizer, giữ nguyên layout/ảnh trang trí/icon ở code:
- `/discover` (trang tổng) -> section `discover_index`
- `/discover/our-human` -> section `discover_human`
- `/discover/our-craft` -> section `discover_craft`

(`/discover/our-values` đã quản qua section `our_values` sẵn có, KHÔNG đụng.)

Làm y hệt cách 10e (`discover_story`): thêm section vào `SITE_SCHEMA` + validator + reader, route đọc config với fallback default, thêm vào nhóm customizer.

KHÔNG đụng: Prisma/DB, layout/class/gradient/icon của các trang, các section khác.

## 2. Quy tắc bắt buộc

- **KHÔNG em-dash `—`**. **KHÔNG dark mode.** Light theme.
- Mirror đúng pattern `discover_story` (10e) và `our_values`.
- **Default của mỗi field = ĐÚNG chuỗi đang có trong file trang tương ứng** (copy verbatim từ code hiện tại, không tự viết lại, không đổi chữ). Các mảng (members/steps/cards) copy đủ phần tử hiện có.
- Text để trống -> route dùng default (không trắng).
- TypeScript strict, Next.js 16, Tailwind v4 token dự án.
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- Tách commit theo trang: discover_index / discover_human / discover_craft.

## 3. Scope

Nguồn nội dung default (copy verbatim từ các file này):
- `src/app/(store)/discover/page.tsx`
- `src/app/(store)/discover/our-human/page.tsx`
- `src/app/(store)/discover/our-craft/page.tsx`

### 3.1 Section `discover_index` (trang /discover)

Fields:
- `eyebrow` text (default "Khám Phá")
- `title` text (default "Khám phá Cốc Nối")
- `subtitle` textarea (default "Câu chuyện, con người, quy trình, và giá trị làm nên thương hiệu.")
- `cards` repeatable, itemSchema:
  - `en` text, `title` text, `desc` textarea, `href` url
  - default = 4 card hiện tại (Our Story/Human/Craft/Values với href, title, desc verbatim từ file)

Route `discover/page.tsx`: async, đọc `config.discover_index`, render hero + map `cards` (giữ nguyên class card, hover). Fallback về mảng default nếu rỗng.

### 3.2 Section `discover_human` (trang /discover/our-human)

Fields:
- `eyebrow` text (default "Our Human")
- `title` text (default "Những đôi tay làm nên Cốc Nối")
- `subtitle` textarea (default = câu mô tả hero hiện tại)
- `members` repeatable, itemSchema:
  - `name` text, `role` text, `desc` textarea, `tag` text, `initial` text
  - default = 4 thành viên hiện tại (verbatim)
- `memberBadge` text (default "Nghệ nhân Bát Tràng truyền thống") - dòng dưới mỗi thẻ
- `ctaHeading` text (default "Đồng hành cùng Cốc Nối")
- `ctaText` textarea (default = đoạn CTA hiện tại)
- `ctaButtonText` text (default "Tìm hiểu cơ hội hợp tác")
- `ctaButtonHref` url (default "/partners")

Route `our-human/page.tsx`: async, đọc `config.discover_human`. Thay mảng `members` cứng bằng config (fallback default). Giữ nguyên: avatar đất sét, gradient chấm, icon Sparkles/CheckCircle, class, `style` màu inline. `initial` và `tag` vẫn render đúng vị trí cũ.

### 3.3 Section `discover_craft` (trang /discover/our-craft)

Fields:
- `eyebrow` text (default "Our Craft")
- `title` text (default "Quy trình thủ công, từ đất đến cốc")
- `subtitle` textarea (default = câu mô tả hero hiện tại)
- `steps` repeatable, itemSchema:
  - `num` text, `title` text, `desc` textarea
  - default = 7 bước hiện tại (verbatim)
- `closingHeading` text (default "Vì sao chúng tôi chọn làm thủ công?")
- `closingText` textarea (default = đoạn kết hiện tại)
- `primaryButtonText` text (default "Mua sắm ngay")
- `primaryButtonHref` url (default "/cua-hang")
- `secondaryButtonText` text (default "Xem 4 Brand Pillar")
- `secondaryButtonHref` url (default "/discover/our-values")

Route `our-craft/page.tsx`: async, đọc `config.discover_craft`. Thay mảng `steps` cứng bằng config (fallback default). Giữ nguyên: số thứ tự lớn mờ, icon Award, gradient, 2 nút style khác nhau, class.

### 3.4 Validator + reader (cho cả 3 section)

- `src/lib/site-config-validate.ts`: thêm nhánh Zod cho `discover_index`, `discover_human`, `discover_craft`, mirror cách `discover_story`/`our_values` (object field optional + default; repeatable là mảng object item schema).
- `src/lib/site-config.ts`: reader trả 3 section với default khi DB chưa có key. KHÔNG để undefined.

### 3.5 Customizer

`src/components/admin/settings/SiteCustomizerClient.tsx`:
- Thêm `discover_index`, `discover_human`, `discover_craft` vào nhóm "Trang nội dung khác" (đặt cạnh `discover_story`).
- Thêm icon cho 3 key vào `SECTION_ICONS` (gợi ý: discover_index = Compass, discover_human = Users, discover_craft = Hammer; lucide bất kỳ đều được).

## 4. Acceptance criteria

- [ ] Customizer nhóm Trang nội dung khác có: Trang Khám phá (tổng), Trang Con người, Trang Quy trình.
- [ ] Sửa text/thành viên/bước rồi Lưu, mở trang tương ứng thấy đổi.
- [ ] Thêm/bớt member (human) và step (craft) qua repeatable hoạt động.
- [ ] Để trống field: route dùng default, không trắng.
- [ ] Layout/gradient/icon/ảnh trang trí của 3 trang KHÔNG đổi.
- [ ] `our-values` và các section khác không bị ảnh hưởng.
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Thứ tự thực thi

1. Branch `feat/phase10f-discover-rest` từ master.
2. Thêm 3 section vào `site-schema.ts` (copy default verbatim từ 3 file trang).
3. Validator + reader cho 3 section.
4. Refactor 3 route (giữ layout, fallback default).
5. Thêm 3 key vào `SECTION_GROUPS` + `SECTION_ICONS`.
6. `npx tsc --noEmit` + `npm run build` PASS.
7. Test mục 4, commit tách theo trang, dừng chờ review (chưa push).

## 6. Out of scope

- `/discover/our-values` (đã có `our_values`).
- Ảnh thật (các trang này dùng trang trí CSS + avatar chữ cái, không có ảnh upload).
- Đa ngôn ngữ.

## 7. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Default lệch nội dung gốc | Copy verbatim từ file trang, không tự viết lại |
| Config trống làm trắng mảng | Fallback về mảng default khi rỗng |
| Thêm nhiều section làm validate fail | Field optional + default, mirror discover_story đã chạy |
| Lệch layout | Chỉ thay text/mảng data, giữ nguyên JSX bao quanh |

## 8. Test thủ công (sau push)

| Test case | Expected | Pass? |
|---|---|---|
| Customizer > Trang Con người, sửa 1 tên nghệ nhân, Lưu | /discover/our-human đổi tên | |
| Thêm 1 nghệ nhân | Thẻ mới xuất hiện đúng layout | |
| Customizer > Trang Quy trình, sửa 1 bước | /discover/our-craft đổi bước | |
| Customizer > Trang Khám phá, sửa mô tả 1 card | /discover đổi card | |
| Xóa hết 1 field | Trang dùng default, không trắng | |
| So sánh layout 3 trang trước/sau | Y hệt, chỉ chữ đổi | |
```
