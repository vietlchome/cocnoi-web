# CLAUDE.md — Context for AI assistants working on cocnoi-web

> File này auto-load vào mọi Claude/Cowork session khi làm việc trong folder `cocnoi-web`. Đọc đầy đủ trước khi đề xuất bất kỳ thay đổi nào về content/copy/visual.

## Bối cảnh ngắn

`cocnoi-web` là source code Next.js của website chính thức **Cốc Nối** (thương hiệu cốc gốm thủ công Việt Nam, mô hình One Person Company). Founder: Việt.

Folder này nằm trong dự án tổng `D:\CỐC NỐI\` chứa toàn bộ tài liệu business + brand. **Single source of truth nằm ở root project, không phải trong codebase.**

## Tài liệu BẮT BUỘC đọc trước khi đụng code

| File | Đọc khi nào | Tại sao |
|------|-------------|---------|
| `D:\CỐC NỐI\README.md` | Đầu mọi session | Index tổng + quy tắc làm việc AI (Section "Quy tắc khi AI làm việc với dự án này") |
| `D:\CỐC NỐI\brand-core.md` | Trước khi viết bất kỳ copy/content/text gì cho website | 4 brand pillar, tone of voice, anti-cliché vocab, target customer |
| `D:\CỐC NỐI\brand-visual.md` | Trước khi đụng visual (color, font, photo, layout) | Bảng màu chính/phụ, typography, photography direction |
| `D:\CỐC NỐI\design-system.md` | Trước khi tạo component spec mới | Component spec + AI prompt guide |
| `D:\CỐC NỐI\07_Website\cocnoi-web\AGENTS.md` | Đầu mọi session technical | Coding rules, Antigravity workflow, Next.js boundaries |
| `D:\CỐC NỐI\07_Website\site-architecture.md` | Khi thay đổi site structure / sitemap | Blueprint sitemap & wireframe |

## 4 Brand Pillar (1 cốt + 3 chiều) — CRITICAL

Đây là **brand truth** từ `brand-core.md` v2.0 (16/05/2026). Schema cũ trong `site-schema.ts` lỗi thời, cần sync với 4 pillar dưới:

| Pillar | Vai trò | Câu hỏi pillar trả lời |
|--------|---------|------------------------|
| **KẾT NỐI** | Cốt lõi | Cốc Nối tồn tại để làm gì? |
| **CHÂN THÀNH** | Chiều sâu | Kết nối ấy có thực chất không? |
| **CHỈN CHU** | Phẩm chất | Kết nối ấy có kỷ luật không? |
| **CỞI MỞ** | Phạm vi | Kết nối ấy mở đến đâu? |

KẾT NỐI là cốt, KHÔNG ngang hàng với 3 pillar còn lại. Mọi quyết định brand tra cứu qua 4 pillar này.

## Anti-cliché vocab (CẤM dùng trong copy)

- "sống chậm", "chậm lại", "slow living"
- "thiền định", "tĩnh tâm", "mindful"
- "về với cội nguồn", "tìm về truyền thống", "gốm cổ"
- "hoài cổ", "xưa cũ", "nostalgic" theo nghĩa lùi về quá khứ
- "siêu phẩm", "đỉnh nhất", "must-have", "đẳng cấp", "sang trọng"
- Scarcity giả ("còn 3 chiếc cuối cùng!", "không mua thì tiếc cả đời")

Thay thế:
- "sống chậm" → "khoảnh khắc thật", "dành thời gian cho nhau"
- "thiền định" → "thật", "có chủ đích", "trọn vẹn"
- "cổ truyền" → "thủ công", "làm tay", "Bát Tràng"

## Rule formatting (Quy tắc 9 trong README)

- **KHÔNG dùng em-dash `—`** (gạch ngang dài). Dùng dấu phẩy, dấu chấm, hoặc gạch nối ngắn `-` thay.
- **Emoji hạn chế tối đa** (<2 cái/post).
- Sentence case, không Title Case ALL CAPS.

## Tone & ngôn xưng

- Tone: ấm áp, chân thật, gần gũi nhưng tinh tế. **Kể chuyện > bán hàng**.
- "mình/bạn" trên MXH.
- "chúng tôi" trên website chính thức.
- "Worldwide brand từ ngày đầu" — KHÔNG positioning là "thương hiệu Việt cần đi quốc tế sau".

## Bảng màu chính (`brand-visual.md`)

Tổng tỷ lệ: 65% Warm White / 25% Deep Indigo / 8% Terracotta / 2% Sand/Dark Brown.

| Tên | Hex | Vai trò |
|-----|-----|---------|
| Warm White | `#FEFCF9` | Background (~65%) |
| Deep Indigo | `#131829` | Text, CTA primary (~25%) |
| Terracotta | `#C2703E` | Accent, highlight (~8%) |
| Cream | `#F4ECE0` | Card bg, modal |
| Sand | `#D4C5B2` | Border, divider |

**Mọi thiết kế phải có CẢ 3 màu chính.** Thiếu Terracotta = thiếu sức sống.

## Typography

- Heading: **Playfair Display SemiBold**
- Body Vietnamese: **Be Vietnam Pro**
- Accent: **Quicksand**
- Không dùng quá 2 font trong cùng 1 thiết kế.

## Tech stack hiện tại

- Next.js 16 (App Router)
- Prisma ORM (PostgreSQL production, SQLite dev)
- Tailwind CSS
- Auth.js (NextAuth)
- Zustand
- Deployed via Vercel (local dev → Vercel test → public)

## Tiến độ refactor Customize/Theme Settings

| Phase | Trạng thái | Mục tiêu |
|-------|-----------|----------|
| Phase 1 | ✅ Closed | Schema foundation (`site-schema.ts`) + typed reader (`getSiteConfig`) + zod validator |
| Phase 2 | ✅ Closed | Storefront migrate sang `config.section.field`, bỏ pattern `getSetting(key, fallback)` |
| Phase 3a | ✅ Closed (PR #1) | Library `FieldRenderer/SectionEditor/RepeatableEditor` + 10 `*FieldInput` + sandbox `/admin/sandbox/customize-preview` |
| Phase 3b | ✅ Closed (PR #2) | Rewrite `SiteCustomizerClient` 480→116 dòng, hierarchical action, migration script |
| Phase 4a | ✅ Closed (PR #3) | Footer legal VN, SEO/OG/analytics, FAQ json→repeatable, contact namespace |
| Phase 4b | ✅ Closed (PR #4) | Product picker + GA cleanup + stricter image validation |
| Phase 4c | ✅ Closed (PR #5) | Header/Hero/Campaign CTA URLs, homepage sections visibility/order |
| Phase 4d | 🚧 PR mở | Story alt + Values icon→image, Social repeatable, @dnd-kit, flattenZodErrors recursive |
| Phase 5 | ⏭️ Sau | Public endpoint `/api/site-config`, Draft/Preview/Publish |

## Workflow (theo memory)

- **Antigravity** executes (write code, run commands).
- **Claude trong Cowork** advises + reviews (read code, write specs, verify Antigravity work via `git show`).
- Mount đôi khi cached stale, ưu tiên `git show HEAD:file` khi verify.

## Schema defaults SAI cần fix

`src/config/site-schema.ts` section `values.items.default` hiện có 4 value:
- Mộc Mạc, Chân Thành, Bền Bỉ, Chỉn Chu

KHÔNG khớp với 4 pillar trong `brand-core.md` v2.0:
- KẾT NỐI, CHÂN THÀNH, CHỈN CHU, CỞI MỞ

Cần sync ở phase tiếp.

---

*File này cập nhật khi brand strategy hoặc tech stack thay đổi. Single source of truth là các file trong `D:\CỐC NỐI\`, không phải file này.*
