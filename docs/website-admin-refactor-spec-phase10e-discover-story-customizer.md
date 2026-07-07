# Phase 10e spec - Đưa text trang "Câu chuyện" (our-story) vào Customizer [Bước 2, trang thử]

**Branch:** `feat/phase10e-discover-story`
**Effort:** 2-3h
**Phụ thuộc:** master (10a-10d merged)
**Loại:** Content-editability wiring qua Customizer (KHÔNG đụng DB/migration)
**Executor:** Antigravity / Claude Code

## 1. Mục tiêu

Cho admin sửa **phần chữ** của trang `/discover/our-story` trong mục Giao diện (Customizer), giữ nguyên **layout, gradient, icon, bố cục, spacing** ở code. Đây là trang mẫu cho Bước 2; làm xong đúng ý sẽ nhân ra our-human / our-craft / discover sau.

Mô hình giống các section customizer sẵn có (`our_values`, `story`): thêm 1 section mới `discover_story` vào site config, route đọc text từ config, fallback về text mặc định hard-code nếu config trống.

KHÔNG đụng:
- Prisma / DB / migration.
- Layout, class, gradient, icon, cấu trúc JSX của trang (chỉ thay chuỗi text tĩnh bằng giá trị từ config).
- Các trang discover khác (our-human/our-craft/our-values/discover index).

## 2. Quy tắc bắt buộc

- **KHÔNG dùng em-dash `—`**. **KHÔNG dark mode**. Light theme.
- Mirror đúng pattern section `our_values` sẵn có: thêm vào `SITE_SCHEMA`, validator `site-config-validate`, reader `site-config`, và render trong customizer.
- Text field nào để trống thì route dùng **default hard-code** (không để trắng đoạn).
- TypeScript strict, Next.js 16, Tailwind v4 token dự án.
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- Tách commit: schema+validator / route wiring / customizer group.

## 3. Scope

### 3.1 Thêm section `discover_story` vào schema

**File:** `src/config/site-schema.ts`

Thêm section mới (đặt cạnh `our_values` / `story` cho hợp nhóm):
```ts
discover_story: {
  label: "Trang Câu chuyện (/discover/our-story)",
  fields: {
    eyebrow:   { type: "text", label: "Chữ nhỏ trên tiêu đề", default: "Our Story" },
    title:     { type: "text", label: "Tiêu đề chính", default: "Câu chuyện Cốc Nối" },
    subtitle:  { type: "textarea", label: "Câu mô tả dưới tiêu đề", default: "Khởi nguồn từ xưởng gốm nhỏ tại Bát Tràng, nối sợi dây gắn kết giữa người với người." },
    paragraphs: {
      type: "repeatable",
      label: "Các đoạn thân bài",
      default: [
        { text: "Chúng ta thấy chiếc cốc ở khắp mọi nơi: ở nhà, ở trường, hay ngay trên bàn làm việc. Nó gần gũi đến mức đôi khi ta quên mất rằng: mỗi chiếc cốc đều có thể là một khởi đầu cho những tâm sự và sẻ chia." },
        { text: "Cái tên Cốc Nối ra đời từ một chữ \"Nối\" mang nhiều lớp nghĩa. Đó là sự kết nối giữa những người thân thương đang cần một khoảnh khắc thật để hiểu nhau. Đó là sự giao thoa của những miền đất, nơi mỗi loại men gốm đều kể một câu chuyện riêng. Đó còn là kỳ vọng nối truyền thống trăm năm của gốm thủ công Bát Tràng vào nhịp thở đầy năng lượng của năm 2026, cân bằng giữa mỹ thuật và công năng sử dụng." },
        { text: "Trong một thế giới mà chỉ một cái chạm là có thể gửi tin, gọi video, thì những kết nối \"thật\" lại trở nên xa xỉ. Mỗi chiếc Cốc Nối gửi đến bạn một lời nhắn: những gì đi từ trái tim, sẽ chạm được đến trái tim." },
      ],
      itemSchema: { text: { type: "textarea", label: "Nội dung đoạn", default: "" } },
    },
    quote:        { type: "text", label: "Câu trích dẫn", default: "Kết tình thân, Nối tinh thần." },
    quoteCite:    { type: "text", label: "Câu trích dẫn (EN)", default: "Crafted bonds. Connected souls." },
    ctaEyebrow:   { type: "text", label: "CTA - chữ nhỏ", default: "Tiếp tục tìm hiểu" },
    ctaHeading:   { type: "text", label: "CTA - tiêu đề", default: "Bốn trụ cột định hình thương hiệu" },
    ctaButtonText:{ type: "text", label: "CTA - nhãn nút", default: "Khám phá 4 Brand Pillar" },
    ctaButtonHref:{ type: "url",  label: "CTA - đường dẫn", default: "/discover/our-values" },
  }
}
```

### 3.2 Validator + reader

- `src/lib/site-config-validate.ts`: thêm nhánh Zod cho `discover_story` mirror cách `our_values` được validate (object với các field trên, tất cả optional/có default, `paragraphs` là mảng `{ text: string }`).
- `src/lib/site-config.ts`: đảm bảo reader trả về `discover_story` với default khi DB chưa có key `section.discover_story` (mirror our_values). KHÔNG để undefined gây lỗi route.

### 3.3 Refactor route `/discover/our-story`

**File:** `src/app/(store)/discover/our-story/page.tsx`

- Chuyển thành async server component, `const config = await getSiteConfig();` lấy `const s = config.discover_story;`.
- Thay các chuỗi tĩnh bằng `s.field` với **fallback** về default cũ (dùng `||` hoặc `?? default`), ví dụ `{s?.title || "Câu chuyện Cốc Nối"}`.
- `paragraphs`: map `s?.paragraphs` (nếu rỗng thì dùng mảng default cũ) render mỗi `<p>` trong khối `.space-y-8`. Giữ nguyên class.
- CTA: text + href từ config, giữ nguyên style nút + icon ArrowRight.
- **GIỮ NGUYÊN toàn bộ**: gradient radial, class, `<section>` layout, icon, spacing, blockquote style. Chỉ thay nội dung chữ.
- `metadata`: có thể để tĩnh như hiện tại, hoặc chuyển `generateMetadata` đọc title/subtitle từ config (tùy chọn, không bắt buộc).

### 3.4 Hiện section trong Customizer

**File:** `src/components/admin/settings/SiteCustomizerClient.tsx`

- Thêm `discover_story` vào nhóm "Trang nội dung khác" trong `SECTION_GROUPS`.
- Thêm icon cho `discover_story` vào `SECTION_ICONS` (vd `BookOpen` hoặc `MessageSquare`).

## 4. Acceptance criteria

- [ ] Customizer có mục "Trang Câu chuyện" trong nhóm Trang nội dung khác, chỉnh được các field.
- [ ] Sửa tiêu đề/đoạn văn/quote/CTA rồi Lưu, mở `/discover/our-story` thấy đổi.
- [ ] Thêm/bớt đoạn thân bài qua repeatable hoạt động.
- [ ] Để trống 1 field: route hiển thị default cũ, không trắng.
- [ ] Layout, gradient, icon, spacing của trang KHÔNG đổi so với trước.
- [ ] Các section customizer khác không bị ảnh hưởng (lưu vẫn gửi full config).
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Thứ tự thực thi

1. Branch `feat/phase10e-discover-story` từ master.
2. Thêm section vào `site-schema.ts`.
3. Validator + reader (`site-config-validate.ts`, `site-config.ts`).
4. Refactor route `our-story/page.tsx` (giữ layout, fallback default).
5. Thêm vào `SECTION_GROUPS` + `SECTION_ICONS` customizer.
6. `npx tsc --noEmit` + `npm run build` PASS.
7. Test mục 4, commit tách logical, dừng chờ review (chưa push).

## 6. Out of scope

- our-human / our-craft / discover index / các trang khác (nhân ra sau khi mẫu này OK).
- Ảnh trong trang (hiện trang này không có ảnh nội dung, chỉ text + trang trí CSS).
- Đa ngôn ngữ.

## 7. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Config trống làm trắng đoạn | Fallback default hard-code cho mọi field |
| Thêm section làm validate fail toàn config | Field optional + default, mirror our_values đã chạy |
| Lệch layout khi thay text | Chỉ thay chuỗi, giữ nguyên class/JSX bao quanh |

## 8. Test thủ công (sau push)

| Test case | Expected | Pass? |
|---|---|---|
| Customizer > Trang Câu chuyện | Hiện các field, sửa được | |
| Sửa tiêu đề + Lưu | /discover/our-story đổi tiêu đề | |
| Thêm 1 đoạn thân bài | Trang hiện thêm đoạn | |
| Xóa hết 1 field text | Trang dùng default, không trắng | |
| So sánh layout trước/sau | Giao diện y hệt, chỉ chữ đổi | |
```
