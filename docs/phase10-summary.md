# Phase 10 - Tổng kết đợt refactor Website Admin

> Ảnh chụp trạng thái sau đợt Phase 10 (Customizer 2 cột + Menu Haravan + CMS Trang nội dung + quản trị text/ảnh khu Khám phá).
> Cập nhật: 07/07/2026. master @ `c666dfe` (= origin/master).

---

## 1. Đã hoàn thành (đều đã merge vào master + push origin)

| Phase | Nội dung | Trạng thái |
|-------|----------|-----------|
| 10a | Customizer chuyển sang bố cục 2 cột (rail trái gom nhóm + panel phải), ẩn navigation khỏi customizer | Merged |
| 10b | Màn Menu riêng `/admin/website/navigation` (tái dùng SectionEditor cho slice navigation) + link sidebar | Merged |
| 10b-2 | Menu builder kiểu Haravan: dòng gọn, kéo thả, popup sửa (MenuBuilder + LinkPicker) | Merged |
| 10c | CMS Trang nội dung: model `Page` + admin CRUD + route `/trang/[slug]` + sitemap | Merged |
| 10d | Chính sách + Điều khoản đọc text từ CMS, giữ URL/layout (seed + fallback + redirect reserved) | Merged |
| 10e | Trang Câu chuyện (our-story) sửa text qua Customizer (section `discover_story`) | Merged |
| 10f | Nhân ra our-human / our-craft / discover index (sections `discover_human/craft/index`) | Merged |
| 10g | Ô ảnh tùy chọn cho 4 trang Khám phá (ảnh nghệ nhân, feature, khối kết, thumbnail thẻ) | Merged |

Kết quả: gần như mọi text (và ảnh tùy chọn) của khu Khám phá + trang pháp lý đều admin tự sửa được qua giao diện, không cần code.

Nhánh lưu trữ: `wip/pre-phase10-docs-blog` (đã push origin) chứa WIP cũ trước Phase 10 (docs sync lỗi thời + tính năng blog-taxonomy dở dang + script docs:check).

---

## 2. Vấn đề còn tồn (KHÔNG quên)

### Cần quyết / xác nhận
1. **Xác nhận Vercel deploy** bản `c666dfe` (10g) đã Ready xanh. 10g không có migration nên deploy phải trơn.
2. **Branch `wip/pre-phase10-docs-blog`**: quyết 3 thứ bên trong: (a) tính năng blog-taxonomy dở dang - dùng tiếp hay bỏ; (b) docs cũ - đã lỗi thời, bỏ được; (c) script `docs:check` - đáng lấy về master.
3. **Dọn branch thừa**: `feat/phase10f-discover-rest` + loạt `feat/phase9*` local đã merge nhưng chưa xóa.

### Nợ kỹ thuật (hoãn được, có workaround)
4. **BOM trong file migration cũ** (`20260609114342_phase9f_sort_order`): chặn `prisma migrate dev`. Né bằng `prisma migrate diff --from-url` + `prisma migrate deploy` (đã dùng ở 10c). Nên fix gọn vào lần cần migration kế tiếp: strip BOM tất cả file migration + đồng bộ checksum.
5. **`docs:check`**: hiện chỉ nằm trong branch wip, chưa lên master; các spec có tham chiếu. Quyết tạo lại trên master hay bỏ.
6. **Dev = Prod chung một DB Neon**: mọi thao tác thử nghiệm ghi thẳng vào DB thật. Nên tách DB dev riêng (Neon branch database).
7. **Lỗi Neon "Closed" khi dev**: lành tính; fix triệt để bằng Neon serverless adapter (`@prisma/adapter-neon`) - task riêng.

### Nội dung / mở rộng (không phải lỗi)
8. **Ảnh thật chưa có**: ô ảnh ở 10g trống tới khi chụp bộ ảnh nghệ nhân/sản phẩm (roadmap "sắp tới"). Có ảnh thì up vào.
9. **Trang Đối tác `/partners`**: vẫn hardcode text, chưa đưa vào Customizer (Bước 2 nối dài nếu muốn).
10. **README/roadmap gốc dự án** chưa ghi các milestone 10a-10g.

---

## 3. Sự cố đã xử lý trong đợt

- **HEAD git hỏng** (file `.git/HEAD` bị chèn byte NUL): nguyên nhân là hai công cụ git (sandbox + Windows) chạm repo cùng lúc qua network mount. Đã sửa bằng `git symbolic-ref HEAD refs/heads/master`, không mất commit nào. **Phòng ngừa: không để 2 công cụ thao tác git đồng thời trên repo.**
- **Stash -u nuốt file spec/WIP**: đã dọn bằng cách chuyển stash thành branch `wip/pre-phase10-docs-blog`.

---

## 4. Gợi ý ưu tiên khi quay lại

1. Xác nhận Vercel deploy (mục 2.1) - đóng hẳn việc "đã lên prod".
2. Dọn branch thừa (2.3) + quyết branch wip (2.2).
3. Nợ kỹ thuật (2.4 BOM, 2.6 tách DB) gộp làm khi cần migration mới.
4. Nội dung (2.8 ảnh, 2.9 partners) theo nhịp của bạn.
