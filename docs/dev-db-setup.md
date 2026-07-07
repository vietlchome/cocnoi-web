# Dev DB Setup - Neon Branch Separation

**Status:** Setup guide
**Effort:** 30-60 phút
**Mục tiêu:** Tách dev DB khỏi production để mọi experiment local không đụng prod data.

## 1. Tại sao cần

`.env.local` hiện tại trỏ Neon **production**. Mọi lệnh Prisma từ máy anh (`prisma migrate dev`, `db push`, `migrate reset`) đều thao tác trên DB live tại cocnoi.com.

Rủi ro: 1 lệnh `db push --accept-data-loss` hay `migrate reset --force` = mất toàn bộ orders, products, customers, blog posts thật.

May mắn các lần trước data prod còn ít nên không bị thiệt hại. Lâu dài phải tách.

## 2. Solution: Neon Branch

Neon hỗ trợ DB branching giống Git branch. Tạo branch `dev` từ `main` (production):

```
Neon Project: cocnoi-prod
├── main  (production, Vercel deploy trỏ vào)
└── dev   (development, local .env.local trỏ vào)
```

**Đặc tính:**
- Copy-on-write từ main (instant, không tốn storage thêm).
- Isolated data: edit branch dev không ảnh hưởng main.
- Riêng connection string.
- Auto-suspend giống main.

## 3. Bước thực hiện

### Bước 1: Tạo dev branch trên Neon Console

1. Login https://console.neon.tech
2. Chọn project `cocnoi-prod` (hoặc tên anh đặt).
3. Sidebar trái → tab **Branches**.
4. Click **"Create branch"**.
5. Form:
   - **Branch name:** `dev`
   - **Parent branch:** `main` (hoặc `production`)
   - **Restore point:** "Current state" (mặc định, clone schema + data hiện tại)
6. Click **Create**.

Branch tạo xong sau ~10 giây.

### Bước 2: Lấy connection string của branch dev

1. Click vào branch `dev` vừa tạo.
2. Tab **Connection Details**.
3. Copy **Connection string** (dạng `postgresql://...@ep-...neon.tech/neondb?sslmode=require`).

Lưu ý: endpoint khác với main (ep-..., khác phần subdomain).

### Bước 3: Update `.env.local`

Mở `D:\CỐC NỐI\07_Website\cocnoi-web\.env.local`.

**Tìm dòng:**
```
DATABASE_URL="postgresql://neondb_owner:...@ep-purple-credit-apl1aamg.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require"
```

**Thay bằng connection string của branch dev** vừa copy.

Save file.

### Bước 4: Verify connection

```bash
cd "D:\CỐC NỐI\07_Website\cocnoi-web"
npx prisma migrate status
```

Expected output:
```
Database schema is up to date!
```

Nếu báo migration pending → đã đúng dev branch (data clone từ main bao gồm migration history). Run:
```bash
npx prisma migrate deploy
```

### Bước 5: Test dev branch hoạt động

```bash
npm run dev
```

Mở `http://localhost:3000`. Verify:
- Site load đầy đủ.
- `/admin/products` thấy products giống prod (vì data clone từ main).
- Mọi thay đổi từ giờ chỉ ảnh hưởng branch dev.

### Bước 6: Setup auto-migrate khi deploy Vercel

Hiện tại Vercel build chỉ chạy `prisma generate`, KHÔNG apply migration. Migration file được commit vào git nhưng không tự apply lên Neon prod. Lâu nay anh apply manual qua `db push` từ local trỏ prod (nguy hiểm).

Sau khi tách dev DB, anh không còn đụng prod nữa. Cần build script tự apply migration trên Vercel:

**Edit `package.json`:**

```json
"scripts": {
  "build": "prisma generate && prisma migrate deploy && next build",
  ...
}
```

Khi push code lên master:
1. Vercel rebuild với `DATABASE_URL` = main branch (production).
2. `prisma migrate deploy` apply pending migrations lên main.
3. `next build` build app.
4. Deploy.

Nếu migration fail → build fail toàn bộ. Tốt - safer than partial apply.

## 4. Workflow mới sau setup

### Khi develop tính năng mới có DB change

1. Local (`.env.local` trỏ dev branch):
   ```bash
   npx prisma migrate dev --name <feature_name>
   ```
   Migration apply lên dev branch local. Test feature.

2. Commit migration file + code:
   ```bash
   git add prisma/migrations/ src/
   git commit -m "feat: ..."
   git push
   ```

3. Vercel rebuild → `prisma migrate deploy` apply lên main branch (prod).

### Khi muốn refresh dev branch với data mới từ prod

Neon Console → Branches → `dev` → **Reset from parent**. Click confirm.

Branch `dev` clone lại snapshot mới nhất từ main. Data dev sync prod.

### Khi muốn rollback dev branch

Branches → `dev` → **Restore** → chọn point in time.

## 5. Cấu hình Vercel envvars (verify)

Vào Vercel Dashboard → project cocnoi-web → Settings → Environment Variables.

Đảm bảo `DATABASE_URL` (Production scope) **trỏ main branch**, KHÔNG phải dev branch.

Nếu cần check:
- Main branch connection string trong Neon Console → Branches → `main` → Connection Details.
- So sánh với Vercel `DATABASE_URL` (Production). Phải giống.

## 6. Quy tắc bắt buộc sau setup

1. **KHÔNG** chỉnh `.env.local` trỏ về prod nữa. Có việc trên prod thì làm qua admin UI tại cocnoi.com.

2. **KHÔNG** chạy `prisma db push` từ local nữa. Migration phải qua file commit.

3. **KHÔNG** chạy `prisma migrate reset` lên prod. Chỉ chạy được trên dev branch.

4. **CHỈ** Vercel auto-deploy mới được apply migration lên main branch.

5. Khi muốn test migration risky, dùng `prisma migrate dev` trên dev branch trước. Nếu OK, commit + push → Vercel apply lên prod.

## 7. Monitoring

Neon free tier:
- 10 branches max (anh chỉ cần 2: main + dev).
- 191.9 compute hours/tháng (cả 2 branches share).
- Auto-suspend sau 5 phút inactive.

Check usage: Neon Console → Settings → Usage.

Nếu compute hours vượt 80%, anh consider:
- Tăng auto-suspend threshold xuống 1 phút.
- Hoặc upgrade Neon Launch plan ($19/tháng).

## 8. Edge cases

**Lỗi: Branch dev không kết nối được**
- Check Neon Console → Branches → `dev` → status "Active" (không phải "Suspended").
- Compute hours còn không.

**Lỗi: Migration trên dev xong push prod fail**
- Migration file SQL có command không tương thích Postgres prod (vd dùng SQLite syntax).
- Test trên dev kỹ hơn trước push.

**Lỗi: Dev branch data lệch prod**
- Anh đã edit dev branch nhiều, không sync.
- Reset from parent (Bước 4) để clone lại snapshot mới.

---

## Checklist sau khi setup

- [ ] Neon dev branch tạo xong, status Active.
- [ ] `.env.local` DATABASE_URL trỏ dev branch.
- [ ] `npx prisma migrate status` OK.
- [ ] `npm run dev` chạy local OK.
- [ ] Verify Vercel env vars `DATABASE_URL` (Production) trỏ main.
- [ ] Edit `package.json` build script thêm `prisma migrate deploy`.
- [ ] Commit + push → Vercel rebuild test → production xanh.
- [ ] Test thay đổi schema trên dev branch không ảnh hưởng prod (vd add 1 test column, verify cocnoi.com không bị affect).

---

**Setup xong = mọi experiment local an toàn 100%, không bao giờ đụng prod nữa.**
