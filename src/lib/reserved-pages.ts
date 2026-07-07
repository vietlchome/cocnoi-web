// Slug Page gắn với route tĩnh canonical. Không render qua /trang/[slug].
export const RESERVED_PAGE_ROUTES: Record<string, string> = {
  "privacy": "/privacy",
  "terms": "/terms",
};
