# Phase 10g spec - Thêm ô ảnh (tùy chọn) cho các trang Khám phá [mức nhẹ nhàng]

**Branch:** `feat/phase10g-discover-images`
**Effort:** 3-4h
**Phụ thuộc:** Phase 10e + 10f merged (các section discover_* đã có)
**Loại:** Thêm image field vào section customizer + render (KHÔNG đụng DB/migration)
**Executor:** Antigravity / Claude Code

## 1. Mục tiêu

Cho admin **upload ảnh** vào các trang Khám phá để đỡ khô khan. Vị trí ảnh do layout cố định sẵn, admin chỉ up ảnh. Ảnh là **tùy chọn**: chưa up thì trang giữ nguyên hình thức hiện tại (trang trí CSS / avatar chữ), không vỡ.

Phạm vi (mức nhẹ nhàng, hợp brand tối giản):
- **discover_human**: ảnh thật cho từng nghệ nhân (thay avatar chữ cái khi có ảnh).
- **discover_story**: 1 ảnh feature giữa hero và phần chữ.
- **discover_craft**: 1 ảnh lớn ở khối kết "Vì sao chúng tôi chọn làm thủ công".
- **discover_index**: 1 thumbnail cho mỗi thẻ trong 4 thẻ dẫn hướng.

KHÔNG đụng: DB/migration, vị trí/bố cục layout (chỉ chèn ảnh vào slot cố định), các section khác.

## 2. Quy tắc bắt buộc

- **KHÔNG em-dash `—`**. **KHÔNG dark mode.** Light theme.
- Ảnh render **mirror pattern sẵn có**: field kiểu `image` sinh URL string (Cloudinary), render bằng `<img src={url} alt={...} className="... object-cover" loading="lazy" />` giống `StorySection.tsx`/`HeroSection.tsx`. `res.cloudinary.com` đã allow trong `next.config.ts`.
- Mọi ô ảnh **optional**, default `""`. Trang chỉ render khối ảnh khi URL không rỗng, else fallback về hiện trạng.
- TypeScript strict, Next.js 16, Tailwind v4 token dự án.
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- Tách commit theo trang.

## 3. Scope

### 3.1 discover_story - ảnh feature

`src/config/site-schema.ts` section `discover_story`, thêm:
- `featureImage`: `{ type: "image", label: "Ảnh feature (giữa tiêu đề và nội dung)", default: "", aspectRatio: 16/9, folder: "discover" }`
- `featureImageAlt`: `{ type: "text", label: "Mô tả ảnh (alt)", default: "" }`

Route `our-story/page.tsx`: giữa `</section>` hero và `<section>` story body, chèn khối ảnh **chỉ khi** `s.featureImage`:
```tsx
{s?.featureImage && (
  <div className="max-w-3xl mx-auto px-4 md:px-8 -mt-6 md:-mt-10">
    <div className="overflow-hidden rounded-4 border border-border/60 aspect-[16/9]">
      <img src={s.featureImage} alt={s.featureImageAlt || s.title || ""} className="w-full h-full object-cover" loading="lazy" />
    </div>
  </div>
)}
```
(Class minh họa, canh cho khớp spacing hiện tại; giữ nền/gradient sẵn có.)

### 3.2 discover_human - ảnh nghệ nhân

Section `discover_human`, thêm vào `members.itemSchema`:
- `image`: `{ type: "image", label: "Ảnh nghệ nhân", default: "", aspectRatio: 1, folder: "discover/human" }`

Route `our-human/page.tsx`, trong khung avatar đất sét: **nếu `art.image`** thì render ảnh phủ kín khung (thay vòng tròn chữ cái), giữ badge `tag` ở dưới; **nếu không** giữ nguyên vòng tròn chữ `initial` như hiện tại.
```tsx
{art.image ? (
  <img src={art.image} alt={art.name} className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
) : (
  /* giữ nguyên khối chữ initial hiện tại */
)}
```
Badge `tag` vẫn nằm trên cùng (z-index) như cũ.

### 3.3 discover_craft - ảnh khối kết

Section `discover_craft`, thêm:
- `closingImage`: `{ type: "image", label: "Ảnh khối kết", default: "", aspectRatio: 16/9, folder: "discover" }`
- `closingImageAlt`: `{ type: "text", label: "Mô tả ảnh (alt)", default: "" }`

Route `our-craft/page.tsx`, trong section kết (trước icon Award hoặc trên heading), **chỉ khi** có `closingImage`: chèn ảnh bo góc, max-w-2xl mx-auto, aspect-[16/9], mb hợp lý. Giữ nguyên icon Award + heading + text + 2 nút.

### 3.4 discover_index - thumbnail thẻ

Section `discover_index`, thêm vào `cards.itemSchema`:
- `image`: `{ type: "image", label: "Ảnh thẻ", default: "", aspectRatio: 16/9, folder: "discover" }`

Route `discover/page.tsx`, trong mỗi card link: **nếu `s.image`** render thumbnail trên đầu card (aspect-[16/9], rounded, object-cover, mb) rồi tới eyebrow/title/desc; **nếu không** giữ card text-only như hiện tại. Giữ nguyên hover/border.

### 3.5 Validator + reader

- `src/lib/site-config-validate.ts`: bổ sung các field ảnh mới vào 4 section (string optional, cho phép URL-or-empty theo regex ảnh đang dùng `^(https?:\/\/.+|\/[^\/].*|)$`; item `image` trong members/cards cũng vậy).
- `src/lib/site-config.ts`: default rỗng cho các field ảnh mới (mirror cách field ảnh khác được đọc).

## 4. Acceptance criteria

- [ ] Customizer 4 section discover có ô upload ảnh (feature/member/closing/card) dùng uploader Cloudinary sẵn có.
- [ ] Up ảnh nghệ nhân -> `/discover/our-human` hiện ảnh thay avatar chữ; chưa up -> vẫn avatar chữ.
- [ ] Up ảnh feature -> `/discover/our-story` hiện khối ảnh; chưa up -> không có khối ảnh, layout không vỡ.
- [ ] Up ảnh khối kết craft + thumbnail card index render đúng; bỏ trống thì fallback hiện trạng.
- [ ] Layout/spacing/gradient/hover các trang không vỡ ở cả 2 trạng thái (có ảnh / không ảnh).
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Thứ tự thực thi

1. Branch `feat/phase10g-discover-images` từ master.
2. Thêm field ảnh vào 4 section trong `site-schema.ts` + validator + reader.
3. Refactor 4 route chèn slot ảnh có điều kiện (giữ fallback).
4. `npx tsc --noEmit` + `npm run build` PASS.
5. Test mục 4 (thử cả có ảnh lẫn bỏ trống), commit tách theo trang, dừng chờ review (chưa push).

## 6. Out of scope

- Ảnh cho từng bước quy trình (7 ảnh) - đã chốt dùng 1 ảnh khối kết thay thế.
- Hero image cho mọi trang.
- our-values (đã quản qua our_values).
- Tối ưu next/image responsive nâng cao (dùng `<img>` như StorySection là đủ giai đoạn này).

## 7. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Chưa có ảnh làm trang trống chỗ | Ảnh optional, chỉ render khi có URL, else giữ hiện trạng |
| Ảnh nghệ nhân méo trong khung tròn/vuông | `object-cover` + aspectRatio uploader = 1 |
| Domain ảnh không load | Cloudinary đã allow trong next.config; ảnh ngoài khác cần thêm domain |
| Lệch layout khi có ảnh | Slot đặt trong khung cố định, test cả 2 trạng thái |

## 8. Test thủ công (sau push)

| Test case | Expected | Pass? |
|---|---|---|
| Up ảnh 1 nghệ nhân, Lưu | Ảnh hiện trong khung, badge tag còn | |
| Xóa ảnh nghệ nhân đó | Quay lại avatar chữ, không vỡ | |
| Up ảnh feature our-story | Khối ảnh hiện giữa hero và chữ | |
| Không up ảnh craft/card | Trang giữ nguyên như trước | |
| Up thumbnail 1 card index | Card có ảnh trên đầu | |
| Kiểm layout 4 trang 2 trạng thái | Không vỡ | |
```
