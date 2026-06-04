# Tasks for Customize Refactor (Theme Settings)

## TODO Phase 3

- **Convert FAQ Fields**: Convert `faq.itemsRetail` and `faq.itemsB2b` from `type: "json"` to `type: "repeatable"` with `itemSchema: { q: text, a: textarea }`.
- **Differentiate Data Omission**: Distinguish between "no data" and "user deleted intentionally" (currently using `!== ''` logic, which is too loose).
- **Stricter Image Validation**: Validate image field values more strictly (must be a valid URL format or path format).
- **Rename schema namespace**: Rename namespace `footer.address/phone/email` to `contact.*`. The `footer` namespace should only keep newsletter and copyright fields. Keep original legacy aliases in place.
- **Cleanup**: `prisma/seed.js` has seed `main_config` which is not consumed. Phase 3 or a separate cleanup PR should delete this database entry (or rewrite it to match flat keys + JSON blob matching the new schema).

## TODO Phase 4

- **Public Endpoint Separation**: Create a public endpoint `/api/site-config` (or rename `/api/admin/settings` GET) to clearly separate admin-only configuration operations from public config consumption.

## TODO Future

- **Server-Side Config (props injection)**: Convert client-side customizer dependent components (`Header`/`Footer`/`FloatingActions`) from client-side API fetching to Server Components that receive resolved `config` via props. This will eliminate client-side fetching delay and prevent Flash of Unstyled Content (FOUC).
