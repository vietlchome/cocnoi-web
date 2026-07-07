# Phase 10d spec - Quản trị text trang Chính sách + Điều khoản qua CMS [Bước 1]

**Branch:** `feat/phase10d-legal-cms`
**Effort:** 2-3h
**Phụ thuộc:** Phase 10c merged (model Page + PageService + admin CRUD đã có)
**Loại:** Content-editability wiring (dùng lại 10c, có seed dữ liệu, KHÔNG migration mới)
**Executor:** Antigravity / Claude Code

## 1. Mục tiêu

Cho phép admin sửa **phần chữ (body text)** của 2 trang tĩnh Chính sách bảo mật (`/privacy`) và Điều khoản dịch vụ (`/terms`) ngay trong mục "Trang nội dung", trong khi **giữ nguyên**: URL, khung layout (icon, tiêu đề, ngày cập nhật, link cuối trang), giao diện.

Nguyên tắc: body text đọc từ 1 bản ghi `Page` (theo slug cố định), khung trang giữ ở code. Nếu không tìm thấy Page tương ứng thì fallback về nội dung mặc định hard-code (không bao giờ để trang trắng).

KHÔNG đụng:
- Model Page / migration (dùng lại nguyên 10c, không schema mới).
- Admin CRUD Pages (dùng lại màn 10c để sửa, không thêm màn).
- Các trang tĩnh khác (contact/partners/faq/discover) - ngoài phạm vi.

## 2. Quy tắc bắt buộc

- **KHÔNG dùng em-dash `—`**.
- **KHÔNG thêm dark mode `dark:*`**.
- Content lưu dạng HTML (giống Post.content, render qua `dangerouslySetInnerHTML` như `journal/[slug]` và `/trang/[slug]` của 10c).
- Giữ đúng khung hiện tại của mỗi trang (icon Lock/FileText, H1, dòng "Cập nhật lần cuối", link cuối "Quay lại Cửa Hàng").
- TypeScript strict, Next.js 16, Tailwind v4 token dự án.
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS.
- Tách commit: seed + reserved-slug util / refactor route privacy + terms / redirect + sitemap.

## 3. Scope

### 3.1 Khái niệm "trang hệ thống" (reserved slug)

Tạo hằng số dùng chung, ví dụ `src/lib/reserved-pages.ts`:
```ts
// Slug Page gắn với route tĩnh canonical. Không render qua /trang/[slug].
export const RESERVED_PAGE_ROUTES: Record<string, string> = {
  "privacy": "/privacy",
  "terms": "/terms",
};
```

### 3.2 Seed 2 bản ghi Page

Tạo script `prisma/seed-legal-pages.ts` (idempotent, dùng `upsert` theo slug):
- `{ slug: "privacy", title: "Chính sách bảo mật", content: <HTML body hiện tại>, visible: true }`
- `{ slug: "terms", title: "Điều khoản dịch vụ", content: <HTML body hiện tại>, visible: true }`

HTML body = phần thân hiện tại của mỗi trang (các `<section><h2>...</h2><p>...</p><ul>...</ul></section>`), chuyển từ JSX sang chuỗi HTML tương đương. KHÔNG bao gồm khung (icon, H1, dòng ngày, link cuối) - phần đó giữ ở route.

Thêm script vào package.json: `"db:seed-legal": "tsx prisma/seed-legal-pages.ts"`. Chạy 1 lần sau khi code xong (kiểm DATABASE_URL trước, giống 10c). Upsert nên chạy lại nhiều lần vô hại.

### 3.3 Refactor route `/privacy` và `/terms`

Với mỗi trang (`src/app/(store)/privacy/page.tsx`, `src/app/(store)/terms/page.tsx`):
- Chuyển thành async server component.
- Gọi `PageService.getPageBySlugPublic("privacy")` (tương ứng "terms").
- Giữ nguyên khung: wrapper div, icon, H1, dòng "Cập nhật lần cuối", link cuối.
  - H1: dùng `page?.title` nếu có, else giữ chuỗi hard-code hiện tại.
  - Dòng "Cập nhật lần cuối": nếu có page thì format từ `page.updatedAt` (vd "Cập nhật lần cuối: ngày D tháng M năm YYYY"), else giữ chuỗi cũ.
- Phần thân:
  - Nếu `page?.content` có: render `<div className="[giữ nguyên class body cũ]" dangerouslySetInnerHTML={{ __html: page.content }} />`.
  - Nếu không có (chưa seed / bị ẩn / bị xóa): render **nội dung mặc định hard-code y như hiện tại** (fallback). Giữ lại JSX cũ làm fallback trong chính file, không xóa.
- `metadata`: giữ tĩnh như hiện tại (đủ tốt cho legal page). Không bắt buộc động.

Kết quả: URL, khung, look không đổi; chỉ body lấy từ CMS, sửa được ở "Trang nội dung".

### 3.4 Tránh trùng URL với `/trang/[slug]`

Vì đã có Page slug "privacy"/"terms", route `/trang/[slug]` của 10c sẽ vô tình phục vụ `/trang/privacy`. Tránh trùng nội dung:
- Trong `src/app/(store)/trang/[slug]/page.tsx`: nếu `slug` nằm trong `RESERVED_PAGE_ROUTES` thì `redirect(RESERVED_PAGE_ROUTES[slug])` (301 tới canonical `/privacy`). Đặt check này TRƯỚC khi fetch/notFound.
- Sitemap (`src/app/sitemap.ts`): khi liệt kê visible pages, **bỏ qua** slug thuộc `RESERVED_PAGE_ROUTES` (vì `/privacy`, `/terms` đã có URL canonical riêng, không thêm `/trang/privacy`). Nếu privacy/terms chưa có trong sitemap ở dạng canonical thì thêm `/privacy`, `/terms` tĩnh.

### 3.5 Admin (không cần code mới)

2 trang này xuất hiện trong danh sách "Trang nội dung" như Page bình thường, sửa body bằng RichTextEditor của 10c. Tùy chọn nâng cao (nếu dễ): trong `PagesListClient`, với slug reserved hiển thị badge nhỏ "Trang hệ thống" và ẩn nút Xóa (tránh admin lỡ xóa làm mất nội dung, dù đã có fallback). Nếu tốn công thì bỏ qua, fallback đã đủ an toàn.

## 4. Acceptance criteria

- [ ] Chạy `npm run db:seed-legal` tạo 2 Page slug privacy + terms (idempotent).
- [ ] `/privacy` và `/terms` hiển thị y như trước (khung + body), nhưng body lấy từ Page.
- [ ] Sửa body trong "Trang nội dung" (slug privacy) rồi mở `/privacy` thấy đổi.
- [ ] Ẩn hoặc xóa Page privacy: `/privacy` vẫn hiện nội dung mặc định fallback, không trắng, không lỗi.
- [ ] `/trang/privacy` redirect 301 về `/privacy` (không render trùng).
- [ ] Sitemap không có `/trang/privacy` hay `/trang/terms`; có `/privacy`, `/terms`.
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Thứ tự thực thi

1. Branch `feat/phase10d-legal-cms` từ master.
2. `src/lib/reserved-pages.ts`.
3. `prisma/seed-legal-pages.ts` + script package.json.
4. Refactor `privacy/page.tsx` + `terms/page.tsx` (giữ fallback).
5. `/trang/[slug]` redirect reserved + sitemap loại reserved.
6. (Tùy chọn) badge "Trang hệ thống" + ẩn Xóa trong PagesListClient.
7. `npx tsc --noEmit` + `npm run build` PASS.
8. Kiểm DATABASE_URL, chạy `npm run db:seed-legal` một lần.
9. Test mục 4, commit tách logical, dừng chờ review (chưa push).

## 6. Out of scope

- Các trang Khám phá (our-story...) - làm ở bước 2 bằng field customizer, không phải phase này.
- Contact/Partners (có form).
- FAQ (đã quản qua customizer).
- Đánh dấu system-page ở tầng schema (hiện suy ra từ reserved list là đủ).

## 7. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Xóa/ẩn Page làm trang trắng | Fallback hard-code giữ trong route, luôn có nội dung |
| Trùng nội dung /privacy vs /trang/privacy | Redirect reserved slug về canonical + loại khỏi sitemap |
| Seed ghi đè nội dung admin đã sửa | Dùng upsert nhưng chỉ chạy seed 1 lần thủ công; KHÔNG đưa seed vào build tự động |
| HTML content chứa mã lạ | Nội dung do admin nhập qua RichTextEditor, render giống journal/[slug] đã có |

## 8. Test thủ công (sau push)

| Test case | Expected | Pass? |
|---|---|---|
| Mở /privacy | Giống trước, body từ CMS | |
| Sửa body privacy trong admin, lưu | /privacy đổi theo | |
| Ẩn Page privacy | /privacy vẫn hiện fallback | |
| Mở /trang/privacy | Redirect về /privacy | |
| Xem /sitemap.xml | Có /privacy /terms, không có /trang/privacy | |
| Mở /terms | Tương tự privacy | |
```
