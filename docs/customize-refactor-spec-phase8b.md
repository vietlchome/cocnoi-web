# Phase 8b - Excel Bulk Import + Blog/Journal Editor

**Người thực thi:** Antigravity.
**Người duyệt:** Việt.
**Base branch:** `master` (sau Phase 8a merged).
**Branch name:** `feature/phase-8b-excel-blog`.

**Mục tiêu:** Hai content/operation tools để Việt tự quản lý nội dung + sản phẩm sau khi launch. Excel bulk import giảm friction đăng sản phẩm số lớn. Blog/Journal editor cho content marketing SEO/GEO.

Sau Phase 8b merge → anh ready public launch.

---

## 0. Bối cảnh

Phase 8a (PR #10) merged. Code production-ready cho lead gen launch. Còn thiếu 2 operation tools để Việt tự operate hiệu quả:

1. **Excel bulk import**: Việt quản lý 100+ sản phẩm. Tạo từng cái qua admin form CRUD = friction lớn. Pattern Excel template + bulk upload + preview + commit phổ biến trong VN ecom admin tools.

2. **Blog/Journal editor**: User confirm cần cho SEO/GEO content marketing. Brand handcraft + Bát Tràng heritage = SEO content advantage nếu có blog regularly. Markdown editor (KHÔNG WYSIWYG) cho stable + AI-friendly authoring.

Phase 8b KHÔNG block launch. Có thể launch giai đoạn 0 trước, Phase 8b làm sau soft launch nếu user prefer.

---

## 1. Scope Phase 8b

### Part A - Excel Bulk Operations

**Mục tiêu:** 1 admin page `/admin/products/bulk-upload` với 3 mode:
- **Create**: tạo sản phẩm mới hàng loạt từ Excel.
- **Update stock**: cập nhật `stockQuantity` cho SP existing theo SKU.
- **Update price**: cập nhật `price` (và optional `compareAtPrice`) cho SP existing theo SKU.

**Effort:** ~12h.

### Part B - Blog/Journal Editor

**Mục tiêu:** Markdown-based editor với SEO fields. Draft/publish workflow. Image upload qua Cloudinary integrate.

**Effort:** ~15h.

---

## 2. Detailed task breakdown - Part A (Excel Bulk)

### A1. Page structure

**File mới:** `src/app/(admin)/admin/products/bulk-upload/page.tsx`

UI flow:

```
┌─────────────────────────────────────────────────┐
│  Bulk Upload Sản Phẩm                           │
│                                                  │
│  Chọn thao tác:                                 │
│  ⚪ Tạo sản phẩm mới                            │
│  ⚪ Cập nhật tồn kho                            │
│  ⚪ Cập nhật giá                                │
│                                                  │
│  [Tải template Excel] (link download .xlsx)     │
│                                                  │
│  [Chọn file Excel để upload] (drop zone)        │
│                                                  │
│  → Sau khi upload:                              │
│  ┌─────────────────────────────────────────┐    │
│  │ Preview Table (rows từ Excel)           │    │
│  │ SKU | Tên | Giá | SL | ... | Status     │    │
│  │ ABC | ... | ... | .. | ... | ✓ Sẽ tạo   │    │
│  │ XYZ | ... | ... | .. | ... | ⚠ Trùng SKU │    │
│  │ ... | ... | ... | .. | ... | ✗ Lỗi data │    │
│  └─────────────────────────────────────────┘    │
│                                                  │
│  Conflict handling (radio):                     │
│  ⚪ Skip duplicates                             │
│  ⚪ Update existing                             │
│  ⚪ Báo lỗi và dừng                            │
│                                                  │
│  [Hủy bỏ]              [Xác nhận import]        │
└─────────────────────────────────────────────────┘
```

### A2. Excel template format

**3 template files** (cho 3 mode khác nhau):

**Template Create** (`/api/admin/products/bulk-template?mode=create`):
```
| SKU* | Tên SP* | Slug | Mô tả ngắn | Mô tả dài | Giá* | Giá so sánh | Tồn kho* | Trọng lượng (g) | Category slug | BST slug | Color name | Size name | Trạng thái | Visibility | Ảnh URLs (comma sep) |
```

**Template Update Stock** (`/api/admin/products/bulk-template?mode=stock`):
```
| SKU* | Tồn kho mới* |
```

**Template Update Price** (`/api/admin/products/bulk-template?mode=price`):
```
| SKU* | Giá mới* | Giá so sánh (optional) |
```

Bắt buộc cột `SKU*`. Các cột `*` đỏ trong template = required. Cột khác optional.

**Generate template:** Endpoint `/api/admin/products/bulk-template` server-side dùng `exceljs` tạo file với headers + 1-2 example rows + cell formatting (header bold, required cột đỏ).

### A3. Upload + Parse

**File mới:** `src/app/api/admin/products/bulk-upload/route.ts`

```ts
export async function POST(request: Request) {
  await requireAdmin();
  
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const mode = formData.get('mode') as 'create' | 'stock' | 'price';
  
  if (!file) return NextResponse.json({ error: 'Thiếu file' }, { status: 400 });
  
  // Parse Excel
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  
  // Read rows starting from row 2 (skip header)
  const rows: any[] = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
    if (rowNum === 1) return; // skip header
    rows.push({
      rowNum,
      sku: row.getCell(1).value?.toString().trim(),
      // ... map columns theo mode
    });
  });
  
  // Validate each row (no DB write yet, just preview)
  const preview = rows.map(row => validateRow(row, mode));
  
  return NextResponse.json({ success: true, preview, totalRows: rows.length });
}
```

**Validation rules theo mode:**

**Mode create:**
- SKU required, must unique (check DB)
- Tên SP required
- Giá required, > 0
- Category slug must exist in DB
- BST slug optional, must exist if provided
- Color/Size name optional, must exist
- Ảnh URLs optional, must valid Cloudinary URLs

**Mode stock:**
- SKU required, must exist in DB
- Số lượng tồn required, integer ≥ 0

**Mode price:**
- SKU required, must exist in DB
- Giá required, > 0
- Giá so sánh optional, > giá

Mỗi row có status:
- `OK_CREATE` (mode create, all valid)
- `OK_UPDATE` (mode update, all valid)
- `WARNING_DUPLICATE` (mode create, SKU exists)
- `WARNING_NOT_FOUND` (mode update, SKU không tồn tại)
- `ERROR_VALIDATION` (data sai format)

### A4. Preview UI

**File mới:** `src/components/admin/BulkUploadClient.tsx` (Client Component).

Table render preview với status badges colored:
- Green `OK_CREATE` / `OK_UPDATE`
- Yellow `WARNING_*` (cần user confirm action)
- Red `ERROR_VALIDATION` (skipped, hiện lý do)

Conflict handling radio (Skip / Update / Error stop) chỉ relevant với mode create.

Summary footer: "X rows valid, Y warnings, Z errors. Y rows sẽ được tạo/cập nhật."

### A5. Commit endpoint

**File mới:** `src/app/api/admin/products/bulk-commit/route.ts`

```ts
export async function POST(request: Request) {
  await requireAdmin();
  
  const { mode, rows, conflictResolution } = await request.json();
  
  const result = await prisma.$transaction(async (tx) => {
    let created = 0, updated = 0, skipped = 0;
    
    for (const row of rows) {
      if (row.status === 'ERROR_VALIDATION') {
        skipped++;
        continue;
      }
      
      if (mode === 'create') {
        if (row.status === 'WARNING_DUPLICATE') {
          if (conflictResolution === 'skip') { skipped++; continue; }
          if (conflictResolution === 'update') {
            await tx.product.update({ where: { sku: row.sku }, data: row.data });
            updated++;
          }
        } else {
          await tx.product.create({ data: row.data });
          created++;
        }
      } else if (mode === 'stock') {
        await tx.product.update({ where: { sku: row.sku }, data: { stockQuantity: row.newStock } });
        updated++;
      } else if (mode === 'price') {
        await tx.product.update({ 
          where: { sku: row.sku }, 
          data: { price: row.newPrice, ...(row.newCompareAtPrice && { compareAtPrice: row.newCompareAtPrice }) } 
        });
        updated++;
      }
    }
    
    return { created, updated, skipped };
  });
  
  return NextResponse.json({ success: true, ...result });
}
```

Transaction đảm bảo atomic. Nếu 1 row fail giữa chừng → rollback toàn bộ.

### A6. Install dependency

```bash
pnpm add exceljs
```

ExcelJS hỗ trợ cả `.xlsx` (modern) + `.xls` (legacy). User có thể export từ Excel/Google Sheets.

### A7. AdminSidebar update

Re-enable `/admin/products/bulk-upload` (Phase 8a hide stubs nhưng bulk-upload là feature mới, KHÔNG trong list hidden).

Hoặc nest dưới products menu:
- Sản phẩm (group)
  - Danh sách
  - Tạo mới
  - Bulk upload (mới)

---

## 3. Detailed task breakdown - Part B (Blog Editor)

### B1. Schema (chưa có Post model? Verify)

Per Phase audit, có `BlogPost` model. Check Prisma schema:

Nếu CÓ - good, dùng existing.

Nếu KHÔNG - thêm:
```prisma
model BlogPost {
  id            String       @id @default(cuid())
  title         String
  slug          String       @unique
  excerpt       String?      @db.Text
  content       String       @db.Text   // Markdown raw
  featuredImage String?      // Cloudinary URL
  
  metaTitle     String?      // SEO meta title (fallback to title)
  metaDescription String?    @db.Text   // SEO meta description (fallback to excerpt)
  ogImage       String?      // Cloudinary URL OG (fallback to featuredImage)
  
  authorName    String?      @default("Cốc Nối")
  tags          String[]     @default([])
  category      String?
  
  status        PostStatus   @default(DRAFT)
  publishedAt   DateTime?    // null nếu DRAFT
  scheduledFor  DateTime?    // optional scheduled publish
  
  readingTime   Int?         // tự tính ~200 từ/phút
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  
  @@index([status, publishedAt])
  @@index([slug])
}

enum PostStatus {
  DRAFT
  PUBLISHED
  SCHEDULED
}
```

Migration:
```bash
npx prisma migrate dev --name add_blog_post_model
```

### B2. Admin pages

**Files mới:**

**`src/app/(admin)/admin/website/blogs/page.tsx`** - list view
- Table: title, status badge, publishedAt, category, action buttons (Edit, Delete, Duplicate).
- Tabs filter: All / Draft / Published / Scheduled.
- Search box (title fuzzy).
- New post button → `/admin/website/blogs/new`.

**`src/app/(admin)/admin/website/blogs/new/page.tsx`** + **`[id]/edit/page.tsx`** - editor
- 2-column layout: main editor left (70%), sidebar right (30%).
- Main:
  - Title input (large, font-playfair).
  - Slug auto-gen từ title (editable).
  - Featured image ImageCropUploader (Cloudinary).
  - Markdown editor textarea với toolbar buttons (bold, italic, link, image, heading, list).
  - Preview tab (render Markdown).
- Sidebar:
  - Status select (Draft / Published / Scheduled).
  - Scheduled datetime picker (khi status=Scheduled).
  - Excerpt textarea (max 200 chars).
  - SEO collapse panel:
    - Meta title (fallback title).
    - Meta description (fallback excerpt).
    - OG image (Cloudinary uploader).
  - Tags input (comma-separated → array).
  - Category dropdown (predefined: "Câu chuyện làng nghề", "Hướng dẫn dùng & bảo quản", "Quà tặng", "Văn hoá uống", "Behind the scenes", "Người Nối archive").
  - Save Draft button.
  - Publish button (khi status=Published).
  - Delete button (confirm dialog).

### B3. Markdown editor library

**Option A**: Lightweight DIY với `react-markdown` render + plain textarea + toolbar buttons inject markdown syntax.

**Option B**: `@uiw/react-md-editor` library (npm 200k weekly).

Em recommend **Option A** (lightweight). Lý do:
- Bundle size nhỏ.
- Customize style theo brand dễ.
- Không phụ thuộc 3rd party update.

Cài `react-markdown` + `remark-gfm` (GitHub-flavored markdown: tables, strikethrough, task lists):
```bash
pnpm add react-markdown remark-gfm
```

Toolbar buttons:
- **B** → inject `**bold**`
- *I* → inject `*italic*`
- 🔗 → prompt URL → inject `[text](url)`
- 🖼️ → ImageCropUploader → inject `![alt](cloudinary url)`
- # → inject `## Heading`
- • → inject `- item`
- 1. → inject `1. item`
- `<>` → inject ` ` ` code ` ` `
- Quote → inject `> quote`

### B4. Server actions

**File:** `src/lib/actions/post.actions.ts` (extend existing nếu có).

```ts
export async function createPost(data: {...}): Promise<{ success, postId, error }>
export async function updatePost(id, data: {...}): Promise<{...}>
export async function deletePost(id): Promise<{...}>
export async function publishPost(id): Promise<{...}>  // set status=PUBLISHED + publishedAt=now
export async function unpublishPost(id): Promise<{...}>  // set status=DRAFT
```

Reading time calc: `Math.ceil(content.split(/\s+/).length / 200)` minutes.

### B5. Storefront /journal pages update

**File:** `src/app/(store)/journal/page.tsx` (existing).

Update query: chỉ load `status=PUBLISHED` + `publishedAt <= now`.

Sort by `publishedAt DESC`. Pagination if > 12 posts.

Filter by category dropdown (UI optional Phase 8b).

**File:** `src/app/(store)/journal/[slug]/page.tsx` (existing).

Render markdown content qua `react-markdown` server-side. SEO meta tags từ DB:
```tsx
export async function generateMetadata({ params }) {
  const post = await prisma.blogPost.findUnique({ where: { slug: params.slug } });
  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      images: post.ogImage ? [{ url: post.ogImage }] : [],
    },
  };
}
```

### B6. Cron scheduled publishing (optional)

Vercel Cron Job runs hourly, check posts with `status=SCHEDULED` + `scheduledFor <= now` → auto-publish (set status=PUBLISHED + publishedAt=now).

**File mới:** `src/app/api/cron/publish-scheduled-posts/route.ts` + `vercel.json` config.

Defer to Phase 9 nếu phức tạp. Phase 8b chỉ làm DRAFT/PUBLISHED, scheduled DB field có nhưng cron job làm sau.

### B7. AdminSidebar update

Re-enable `/admin/website/blogs` (Phase 8a hide 8 stubs but blogs là feature mới Phase 8b).

---

## 4. Verify checklist

### Excel Bulk:

1. Vào `/admin/products/bulk-upload`.
2. Mode "Create": download template Excel → fill 5 rows test → upload.
3. Preview table hiện 5 rows với status `OK_CREATE`.
4. Confirm conflict mode "Skip duplicates" → bấm Import.
5. Success message "Created 5, updated 0, skipped 0".
6. Verify `/admin/products` list có 5 SP mới.

7. Mode "Update stock": template stock chỉ 2 cột (SKU + Stock).
8. Fill 3 rows (2 SKU existing, 1 SKU không tồn tại).
9. Preview: 2 rows `OK_UPDATE`, 1 row `WARNING_NOT_FOUND`.
10. Import → success "Updated 2, skipped 1".

11. Mode "Update price": tương tự.

12. Test edge cases: file empty, file format wrong, header missing, SKU duplicate trong cùng file.

### Blog Editor:

1. Vào `/admin/website/blogs` → list view, empty initially.
2. "New post" → editor mở.
3. Type title "Test Bát Tràng story" → slug auto-gen "test-bat-trang-story".
4. Type Markdown content với heading + bold + image upload.
5. Image upload qua Cloudinary → markdown `![alt](https://res.cloudinary.com/...)` inject.
6. Toggle Preview → render đúng HTML.
7. Save Draft → reload list view → post hiện status=DRAFT.
8. Edit → set status=Published → save.
9. View storefront `/journal` → post hiện trong list.
10. Click → `/journal/test-bat-trang-story` → render full markdown.
11. View source: `<title>Test Bát Tràng story</title>` + meta description.
12. Schedule test: set status=Scheduled với `scheduledFor` 5 phút sau.
13. Verify `/journal` chưa hiện (only published). Wait 5 min + manual cron trigger → post publish.

### General:

- `pnpm build` pass.
- `npx tsc --noEmit` clean.
- 0 em-dash trong copy mới.
- Cloudinary integration work cho cả bulk product images + blog editor images.

---

## 5. Non-goals Phase 8b

- ❌ Không setup Vercel Cron (defer Phase 9).
- ❌ Không rich text WYSIWYG (Markdown only).
- ❌ Không real-time collaborative editing.
- ❌ Không bulk delete products (defer).
- ❌ Không export products to Excel (defer).
- ❌ Không AI-assisted writing (Phase 9+ nếu cần).

---

## 6. Checklist PR

- [ ] `exceljs` + `react-markdown` + `remark-gfm` dependencies installed.
- [ ] `BlogPost` model + `PostStatus` enum + migration.
- [ ] `/admin/products/bulk-upload` page + UI + API endpoints (template, parse, commit).
- [ ] `/admin/website/blogs` list + new + edit pages.
- [ ] Storefront `/journal` + `/journal/[slug]` query update (status=PUBLISHED).
- [ ] AdminSidebar enable 2 new pages.
- [ ] post.actions.ts: create/update/delete/publish/unpublish.
- [ ] Cloudinary upload integration trong Markdown image button.
- [ ] No em-dash.
- [ ] PR description 5 screenshot:
  - (a) Bulk upload page mode create với preview table.
  - (b) Bulk upload success summary.
  - (c) Blog editor in action với Markdown.
  - (d) Storefront /journal list.
  - (e) Storefront /journal/[slug] published post.

---

## 7. Sau Phase 8b merge

Anh ready public launch giai đoạn 0:
1. Mua domain Namecheap (~280k/năm).
2. Deploy Vercel Hobby theo `docs/deployment-vercel-hobby.md`.
3. Test production end-to-end.
4. Promote qua Fanpage/IG.
5. Monitor analytics + feedback.

Phase 9+ defer cho đến khi có customer data + business need cụ thể.

---

## 8. Antigravity instructions

1. Đọc spec này full + `D:\CỐC NỐI\07_Website\cocnoi-web\CLAUDE.md`.
2. Tạo branch `feature/phase-8b-excel-blog` từ master.
3. Implement Part A (Excel bulk) trước → test → commit.
4. Implement Part B (Blog editor) → test → commit.
5. Verify §4 toàn bộ.
6. Push + báo lại để Việt test merge.

**Đặc biệt cảnh báo:**
- A3 parse Excel: cần handle edge cases (empty cells, wrong types, encoding UTF-8 cho tiếng Việt).
- B1 nếu schema đã có `BlogPost` model → use existing, không tạo lại. Verify trước.
- B3 Markdown editor: dùng Option A (lightweight DIY) không phải library 3rd party.
- B5 storefront query MUST filter status=PUBLISHED, không leak DRAFT/SCHEDULED.
- B6 cron scheduled: defer hoàn toàn, chỉ làm DRAFT/PUBLISHED manual.
