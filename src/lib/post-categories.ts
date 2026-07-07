export const POST_CATEGORY_VALUES = {
  uncategorized: "UNCATEGORIZED",
  nguoiNoi: "UNSUNG_HEROES",
  cauChuyenCocNoi: "JOURNEY",
  kienThucCamHung: "KNOWLEDGE",
} as const;

export type PostCategoryValue =
  (typeof POST_CATEGORY_VALUES)[keyof typeof POST_CATEGORY_VALUES];

export const POST_CATEGORY_OPTIONS = [
  {
    value: POST_CATEGORY_VALUES.uncategorized,
    label: "Chưa phân loại",
    description: "Dùng tạm khi bài viết chưa được gán vào chuyên mục chính.",
  },
  {
    value: POST_CATEGORY_VALUES.nguoiNoi,
    label: "Người-Nối",
    description: "Chân dung những người thầm lặng gìn giữ sự gắn kết.",
  },
  {
    value: POST_CATEGORY_VALUES.cauChuyenCocNoi,
    label: "Câu chuyện Cốc Nối",
    description:
      "Bài viết về thương hiệu, làm nghề, collection, khách hàng và nhật ký vận hành của Cốc Nối.",
  },
  {
    value: POST_CATEGORY_VALUES.kienThucCamHung,
    label: "Kiến thức & Cảm hứng",
    description:
      "Bài viết SEO, chia sẻ kiến thức gốm, quà tặng và các nguồn cảm hứng xoay quanh lối sống thủ công.",
  },
] as const;

const POST_CATEGORY_LABEL_MAP: Record<string, string> = Object.fromEntries(
  POST_CATEGORY_OPTIONS.map((option) => [option.value, option.label])
);

const POST_CATEGORY_DESCRIPTION_MAP: Record<string, string> = Object.fromEntries(
  POST_CATEGORY_OPTIONS.map((option) => [option.value, option.description])
);

export function getPostCategoryLabel(category?: string | null): string {
  if (!category) return "Chưa phân loại";
  return POST_CATEGORY_LABEL_MAP[category] || "Chưa phân loại";
}

export function getPostCategoryDescription(category?: string | null): string {
  if (!category) return POST_CATEGORY_DESCRIPTION_MAP[POST_CATEGORY_VALUES.uncategorized];
  return (
    POST_CATEGORY_DESCRIPTION_MAP[category] ||
    POST_CATEGORY_DESCRIPTION_MAP[POST_CATEGORY_VALUES.uncategorized]
  );
}
