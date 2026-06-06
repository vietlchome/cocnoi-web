# Tasks for Customize Refactor (Theme Settings)

## CLOSED — Phase 3a & 3b (Refactor Library + Admin Form Wiring + Migration)

- **Phase 3a**: Built `FieldRenderer` / `SectionEditor` / `RepeatableEditor` + 10 fields inputs. Checked in-memory controlled states in Sandbox route `/admin/sandbox/customize-preview`.
- **Phase 3b**: Wired SectionEditor to the main customization admin form `/admin/customize` (reduced `SiteCustomizerClient.tsx` from 475 to under 110 lines). Implemented Zod-validated `updateSiteConfigAction` and idempotent migration script `scripts/migrate-settings-to-sections.ts` to pack settings into JSON blobs. Cleaned up legacy unimported files (`HomepageCustomizerClient.tsx`) and seed data.

---

## ACTIVE — Phase 4 (FAQ schema, refactoring fields, advanced controls)

- **[x] Phase 4a - Convert FAQ Fields**: Convert `faq.itemsRetail` and `faq.itemsB2b` from `type: "json"` to `type: "repeatable"` with `itemSchema: { question: text, answer: textarea }`.
- **[x] Phase 4a - Rename schema namespace**: Rename namespace `footer.address/phone/email` to `contact.*`. The `footer` namespace keeps newsletter and copyright fields, and adds `legal` group. Fallback reader implemented.
- **[x] Phase 4a - Compliance, SEO, & Analytics**: Added ecommerce compliance (Nghị định 52) legal info group, SEO properties (robots, favicon, OG image) mapped via Metadata API, and GA4 / Facebook / TikTok analytics tracking tags conditionally loaded in store layout.
- **[x] Phase 4b - Product Picker**: Added `manualProductIds: type "product-picker"` field, built custom `ProductPickerFieldInput` component, and wired it in admin Customizer. Storefront home page reads from config.
- **[x] Phase 4b - Stricter Image Validation**: Image paths matching regex `^(https?:\/\/.+|\/[^\/].*|)$` (allowing absolute path or full URL, or empty string).
- **[x] Phase 4b - Cleanup GA**: Removed duplicate GoogleAnalytics injection from root layout to prevent double tracking.
- **[x] Phase 4c - CTA URLs**: Added header `topBarLink`, converted hero `ctaPrimary` & `ctaSecondary` to group fields (`{text, url}`), added campaign `cta` group field. Handled nested sub-field aliases in group resolver.
- **[x] Phase 4c - Section Visibility & Order**: Added section layout configuration under `homepage.sections` (repeatable list of sections with `key` and `visible` properties). Refactored storefront `page.tsx` using Option A (sub-components) to dynamically map and render homepage sections.
- **[ ] Differentiate Data Omission**: Distinguish between "no data" and "user deleted intentionally" (currently using `!== ''` logic, which is too loose).
- **[ ] Public Endpoint Separation**: Create a public endpoint `/api/site-config` (or rename `/api/admin/settings` GET) to clearly separate admin-only configuration operations from public config consumption.
- **[x] Phase 4d - Advanced Customizer Controls & Repeatable Upgrades**: Added repeatable upgrades (story image alts for SEO, values Lucide icon picker, social repeatable platform links). Implemented smooth drag-reorder via `@dnd-kit` in `RepeatableEditor` and `ProductPickerFieldInput` (replacing old ↑/↓ buttons). Flattened Zod validation errors to arbitrary depth, displayed flat error panel at customize screen top, and regrouped for section level inline validation display.

---

## TODO Future — Phase 5

- **[ ] Draft/Preview/Publish states**: Implement settings staging, allowing admins to edit config in draft mode and preview before publishing to live storefront.
- **[ ] Server-Side Config (props injection)**: Convert client-side customizer dependent components (`Header`/`Footer`/`FloatingActions`) from client-side API fetching to Server Components that receive resolved `config` via props. This will eliminate client-side fetching delay and prevent Flash of Unstyled Content (FOUC).

---

## Phase 2 - Documented Behavior Changes

- **Campaign Quote Floating Snippet**: The floating quote snippet in the campaign visual card changed from displaying `"Đất có linh hồn......"` to `"Đất có linh hồn, gốm có sinh m..."`. This is an intentional bug fix because the pre-migration code used two different fallback defaults for the same DB key `campaign_hero_quote` (`"Đất có linh hồn..."` on line 214 vs the full quote `"Đất có linh hồn, gốm có sinh mệnh. Người thợ chỉ là người đánh thức vẻ đẹp ẩn sâu trong đó."` on line 224). The refactored code correctly slices the unified schema default value.
- **Dynamic Year Copyright**: The copyright notice year is kept dynamic in the `Footer.tsx` storefront rendering via `&copy; {new Date().getFullYear()}`, appending the customizer-configured copyright text (default: `"CỐC NỐI. Bảo lưu mọi quyền."`). The year prefix is excluded from the schema default string to ensure it never becomes stale.
