# Phase 10c spec - CMS Trang nội dung [Hạng mục B]

**Branch:** `feat/phase10c-pages-cms`
**Effort:** 6-8h
**Phụ thuộc:** Phase 10b merged
**Loại:** Feature mới đầy đủ (Prisma model + migration + admin CRUD + storefront route)
**Executor:** Antigravity

## 1. Mục tiêu

Xây CMS "Trang nội dung" kiểu Haravan tại `/admin/website/pages` (hiện là stub "Coming Soon"): danh sách trang, Tạo trang, sửa, ẩn/hiện, xóa. Mỗi trang render công khai tại `/trang/[slug]`.

Hiện tại các trang tĩnh (privacy, terms, faq...) là route hard-code. Phase này KHÔNG đụng các route đó. Chỉ thêm hệ thống trang động mới do admin tự tạo (vd "Chính sách đổi trả", "Đối tác xuất khẩu", "Câu chuyện khởi nguồn"...), giống danh sách 10 trang trong Haravan của LC Home.

Nguyên tắc: **mirror pattern `Post`/blog sẵn có.** Không phát minh pattern mới.

## 2. Quy tắc bắt buộc (Antigravity follow)

- **KHÔNG dùng em-dash `—`**.
- **KHÔNG thêm dark mode `dark:*`**. Light theme only.
- **KHÔNG đụng** các route tĩnh cũ (privacy/terms/faq/discover...).
- Code style: TypeScript strict, Next.js 16 App Router, Tailwind v4 (token dự án), Prisma, Zod.
- **Content editor tái sử dụng `RichTextEditor.tsx`** (tiptap) đúng như `PostEditor` đang dùng. Lưu content theo ĐÚNG format mà `Post` đang lưu (mirror chính xác cách `PostEditor` + `content.service` xử lý content, không tự đổi Markdown/HTML).
- Trước khi migration: kiểm tra `DATABASE_URL` trỏ đúng môi trường dev (theo AGENTS.md).
- Test trước push: `npx tsc --noEmit` + `npm run build` PASS + migration chạy clean.
- Commit tách logical: schema+migration / service+actions+validator / admin CRUD / storefront route / docs sync.

## 3. Scope

### 3.1 Prisma model

**File:** `prisma/schema.prisma`

Thêm model `Page` (đơn giản hơn `Post`, dùng cờ `visible` thay enum status để khớp "Hiển thị/Ẩn" của Haravan):

```prisma
model Page {
  id              String   @id @default(cuid())
  title           String
  slug            String   @unique
  content         String   @db.Text   // format mirror Post.content
  excerpt         String?  @db.Text

  metaTitle       String?
  metaDescription String?  @db.Text
  ogImage         String?  // Cloudinary URL

  visible         Boolean  @default(true)  // Hiển thị / Ẩn trên storefront
  sortOrder       Int      @default(0)

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([visible])
  @@index([slug])
}
```

Migration: `npx prisma migrate dev --name phase10c_page_model`

Lưu ý: repo auto-apply `prisma migrate deploy` khi build Vercel (commit ca27b9d), nên chỉ cần tạo migration đúng, không cần thao tác thủ công thêm khi deploy.

### 3.2 Validator

**File mới:** `src/lib/validators/page.schema.ts` (mirror `content.schema.ts`)

- `pageInputSchema`: title (min 1), slug (regex slug hợp lệ, min 1), content (string), excerpt (optional), metaTitle (optional), metaDescription (optional), ogImage (optional url-or-empty), visible (boolean, default true), sortOrder (number, default 0).
- Export type `PageInput`.
- Tái sử dụng util slug hiện có trong `src/lib/utils` (đã có `slug` util) cho auto-generate slug từ title.

### 3.3 Service

**File mới:** `src/lib/services/page.service.ts` (mirror `content.service.ts`)

Hàm:
- `listPages()`: tất cả trang cho admin, orderBy `sortOrder asc, createdAt desc`.
- `getPageById(id)`.
- `getPageBySlugPublic(slug)`: chỉ trả khi `visible = true` (dùng cho storefront).
- `getVisiblePageSlugs()`: danh sách slug visible (cho sitemap).
- `createPage(data)`.
- `updatePage(id, data)`.
- `deletePage(id)`.
- `togglePageVisibility(id, visible)`.

Xử lý lỗi trùng slug (Prisma P2002) trả message rõ ràng.

### 3.4 Server actions

**File mới:** `src/lib/actions/page.actions.ts` (mirror `content.actions.ts`)

- `createPageAction(input)`, `updatePageAction(id, input)`, `deletePageAction(id)`, `togglePageVisibilityAction(id, visible)`.
- Mỗi action: `requireAdmin()` + validate Zod + gọi service + `revalidatePath`:
  - `/admin/website/pages`
  - `/trang/[slug]` tương ứng (revalidate cụ thể slug), và `revalidatePath('/', 'layout')` nếu cần cập nhật menu/footer link.
- Trả `{ success, error?, fieldErrors? }` theo pattern hiện có.

### 3.5 Admin CRUD

Mirror `AdminContentClient` + `PostsList` + `PostEditor`.

**Files:**
- `src/app/(admin)/admin/website/pages/page.tsx` (thay stub): server component, `requireAdmin()`, `listPages()`, render `PagesListClient`.
- `src/app/(admin)/admin/website/pages/create/page.tsx`: render `PageEditorClient` (mode create).
- `src/app/(admin)/admin/website/pages/[id]/page.tsx`: fetch `getPageById`, render `PageEditorClient` (mode edit). notFound nếu không có.
- `src/components/admin/website/PagesListClient.tsx`: bảng danh sách (cột: Tiêu đề, Tình trạng badge Hiển thị/Ẩn, Slug, Ngày cập nhật, Thao tác sửa/xóa), nút "Tạo trang", ô tìm kiếm, toggle ẩn/hiện nhanh. Cột Thao tác dùng sticky right (theo bài học Phase 9f) để nút Xóa không bị cắt.
- `src/components/admin/website/PageEditorClient.tsx`: form gồm title (auto-gen slug, cho sửa slug thủ công), `RichTextEditor` cho content, excerpt, khối SEO (metaTitle/metaDescription/ogImage), toggle `visible`. Nút Lưu + Xóa. Mirror `PostEditor.tsx`.

**UX chi tiết khớp Haravan (ảnh tham chiếu):**
- Danh sách có badge "Hiển thị" (xanh) / "Ẩn" (xám).
- Nút "Tạo trang" góc phải trên.
- Header màn: "Trang nội dung".

### 3.6 Storefront route

**File mới:** `src/app/(store)/trang/[slug]/page.tsx`

- `generateMetadata`: lấy page theo slug, set title (metaTitle fallback title), description (metaDescription fallback excerpt), og image.
- Component: `getPageBySlugPublic(slug)`, nếu null -> `notFound()`. Render tiêu đề + content. Render content ĐÚNG cách `journal/[slug]/page.tsx` render `Post.content` (mirror y hệt cách hiển thị, kể cả sanitize/parse nếu có).
- Style trang theo layout store hiện có (dùng container + typography sẵn có, tham khảo trang `privacy`/`terms` cho khung wrapper).

**Chọn prefix `/trang/`** để tránh đụng các segment tĩnh gốc (`cua-hang`, `discover`, `journal`, `contact`, `faq`, `privacy`, `terms`, `about`, `partners`, `community`, `don-hang`, `checkout`). KHÔNG dùng catch-all `/[slug]` ở gốc store vì rủi ro nuốt route và 404.

**Sitemap:** cập nhật `src/app/sitemap.ts` thêm các trang visible (`getVisiblePageSlugs()` -> `/trang/{slug}`).

### 3.7 Sidebar admin

**File:** `src/components/admin/AdminSidebar.tsx`

Thêm vào `SALES_CHANNELS[0].submenus` (mục Website) item "Trang nội dung" -> `/admin/website/pages`. Thứ tự đề xuất: Giao diện, Menu, Trang nội dung, Blogs. Icon dùng `FileText` (đã import) hoặc `List`.

`isActive` đã có sẵn xử lý riêng cho `/admin/website/pages` (dòng phân biệt tiền tố), tận dụng.

### 3.8 (Tùy chọn, khuyến nghị) Gắn Page vào Menu

Sau khi có model Page, nâng field `href` trong menu builder (Phase 10b) để có gợi ý chọn trang. Nếu làm, thêm dạng field/picker liệt kê `/trang/{slug}`. **Không bắt buộc trong phase này** nếu vượt effort; có thể tách thành enhancement riêng. Nếu skip, menu vẫn nhập URL `/trang/...` thủ công được.

## 4. Acceptance criteria

- [ ] Prisma `Page` model + migration `phase10c_page_model` chạy clean.
- [ ] `/admin/website/pages`: danh sách trang, nút "Tạo trang", tìm kiếm, badge Hiển thị/Ẩn.
- [ ] Tạo trang mới: nhập title tự sinh slug, soạn content bằng RichTextEditor, lưu OK.
- [ ] Sửa trang: đổi nội dung, lưu, phản ánh đúng.
- [ ] Toggle Ẩn: trang biến mất khỏi storefront (`/trang/[slug]` trả 404), vẫn còn trong admin.
- [ ] Xóa trang: xóa khỏi DB, nút Xóa không bị cắt (sticky action column).
- [ ] `/trang/[slug]` render đúng tiêu đề + nội dung cho trang visible.
- [ ] Trang không tồn tại hoặc bị ẩn: `/trang/[slug]` trả notFound.
- [ ] Metadata (title/description) đúng theo SEO fields.
- [ ] Sitemap chứa các trang visible.
- [ ] Sidebar admin có "Trang nội dung", active state đúng.
- [ ] `npx tsc --noEmit` + `npm run build` PASS.

## 5. Migration order (Antigravity execute theo thứ tự)

1. Branch `feat/phase10c-pages-cms` từ master.
2. Prisma: thêm model `Page`, run `npx prisma migrate dev --name phase10c_page_model` (kiểm tra `DATABASE_URL` trước).
3. Validator `page.schema.ts`.
4. Service `page.service.ts`.
5. Actions `page.actions.ts`.
6. Admin list `PagesListClient` + route `/admin/website/pages`.
7. Admin editor `PageEditorClient` + routes create + `[id]`.
8. Storefront `/trang/[slug]` + generateMetadata.
9. Sitemap update.
10. Sidebar link.
11. Test: `npx tsc --noEmit` + `npm run build` PASS + tạo/sửa/ẩn/xóa thử.
12. Docs sync (section 7) + `npm run docs:check`.
13. Commit tách logical + push PR.

## 6. Out of scope

- Migrate các trang tĩnh cũ (privacy/terms/faq) sang CMS (làm phase sau nếu muốn).
- Draft/preview/publish nâng cao (chỉ dùng visible on/off).
- Phân quyền chi tiết ngoài `requireAdmin`.
- Đa ngôn ngữ trang.

## 7. Docs sync bắt buộc (theo AGENTS.md)

Vì phase này thêm **route public mới** + **Prisma model mới** + **admin surface mới**, phải rà 6 file:

1. `../_README.md`
2. `../site-architecture.md`
3. `README.md`
4. `docs/cocnoi-web-structure.md` (thêm route `/trang/[slug]`, admin `/admin/website/pages/*`, model `Page`, service/action/validator mới)
5. `docs/web-modules-spec.md` (Mô-đun 5 Content: bổ sung Pages CMS)
6. `AGENTS.md` (nếu cần ghi canonical route mới)

Sau đó chạy `npm run docs:check`. Nếu fail coi như chưa xong.

## 8. Risk + mitigation

| Risk | Mitigation |
|---|---|
| Slug trùng | Unique constraint + bắt P2002, báo lỗi rõ, gợi ý slug khác |
| Route `/trang/[slug]` đụng route khác | Đã chọn prefix riêng `trang`, không catch-all gốc |
| Content format lệch so với blog | Mirror chính xác cách PostEditor + content.service lưu/đọc content |
| Migration lỗi trên prod | `@default` đầy đủ, auto `migrate deploy` khi build; test local trước |
| XSS từ content render | Mirror cách journal/[slug] đã sanitize/parse content (không tự nới lỏng) |

## 9. Test checklist thủ công (sau khi push)

| Test case | Expected | Pass? |
|---|---|---|
| /admin/website/pages | Danh sách + nút Tạo trang | |
| Tạo trang "Chính sách đổi trả" | Lưu OK, xuất hiện trong list | |
| Mở /trang/chinh-sach-doi-tra | Render tiêu đề + nội dung | |
| Toggle Ẩn trang đó | /trang/... trả 404, admin vẫn còn | |
| Sửa nội dung + lưu | Storefront cập nhật | |
| Xóa trang | Biến mất, nút Xóa không bị cắt | |
| Viewport hẹp bảng danh sách | Cột Thao tác vẫn thấy (sticky) | |
| Sitemap.xml | Có /trang/{slug} visible | |
| Sidebar | Có "Trang nội dung", active đúng | |
