# Tasks for Customize Refactor (Theme Settings)

## ACTIVE — Phase 3a (Library only, no admin wiring)

**Spec:** `docs/customize-refactor-spec-phase3a.md`.

Build `FieldRenderer` / `SectionEditor` / `RepeatableEditor` + sub `*FieldInput` components under `src/components/admin/customize/`. Add sandbox route `/admin/sandbox/customize-preview` for manual verification. Do NOT touch `SiteCustomizerClient.tsx`, `settings.actions.ts`, schema, or `getSiteConfig`. Phase 3b (rewrite admin form + migration + delete dead code) starts only after Phase 3a is merged.

## TODO Phase 3b (after 3a)

- **Convert FAQ Fields**: Convert `faq.itemsRetail` and `faq.itemsB2b` from `type: "json"` to `type: "repeatable"` with `itemSchema: { q: text, a: textarea }`.
- **Differentiate Data Omission**: Distinguish between "no data" and "user deleted intentionally" (currently using `!== ''` logic, which is too loose).
- **Stricter Image Validation**: Validate image field values more strictly (must be a valid URL format or path format).
- **Rename schema namespace**: Rename namespace `footer.address/phone/email` to `contact.*`. The `footer` namespace should only keep newsletter and copyright fields. Keep original legacy aliases in place.
- **Cleanup**: `prisma/seed.js` has seed `main_config` which is not consumed. Phase 3 or a separate cleanup PR should delete this database entry (or rewrite it to match flat keys + JSON blob matching the new schema).

## TODO Phase 4

- **Public Endpoint Separation**: Create a public endpoint `/api/site-config` (or rename `/api/admin/settings` GET) to clearly separate admin-only configuration operations from public config consumption.

## TODO Future

- **Server-Side Config (props injection)**: Convert client-side customizer dependent components (`Header`/`Footer`/`FloatingActions`) from client-side API fetching to Server Components that receive resolved `config` via props. This will eliminate client-side fetching delay and prevent Flash of Unstyled Content (FOUC).

## Phase 2 - Documented Behavior Changes

- **Campaign Quote Floating Snippet**: The floating quote snippet in the campaign visual card changed from displaying `"Đất có linh hồn......"` to `"Đất có linh hồn, gốm có sinh m..."`. This is an intentional bug fix because the pre-migration code used two different fallback defaults for the same DB key `campaign_hero_quote` (`"Đất có linh hồn..."` on line 214 vs the full quote `"Đất có linh hồn, gốm có sinh mệnh. Người thợ chỉ là người đánh thức vẻ đẹp ẩn sâu trong đó."` on line 224). The refactored code correctly slices the unified schema default value.
- **Dynamic Year Copyright**: The copyright notice year is kept dynamic in the `Footer.tsx` storefront rendering via `&copy; {new Date().getFullYear()}`, appending the customizer-configured copyright text (default: `"CỐC NỐI. Bảo lưu mọi quyền."`). The year prefix is excluded from the schema default string to ensure it never becomes stale.

