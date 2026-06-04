// Bậc phân cấp khách hàng (CRM Tier) — dùng để nâng hạng tự động, không tự ý hạ hạng
export const TIER_RANK: Record<string, number> = {
  RETAIL_LEAD: 1,
  RETAIL_BUYER: 2,
  B2B_LEAD: 3,
  B2B_WHOLESALE: 4,
  B2B_CONSIGNMENT: 4,
  B2B_GIFT: 4,
};

// Luồng chuyển trạng thái đơn hàng hợp lệ
export const ORDER_STATUS_FLOW = ['PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED'] as const;

// Luồng chuyển trạng thái yêu cầu tư vấn hợp lệ
export const INQUIRY_STATUS_FLOW = ['PENDING', 'CONTACTED', 'NEGOTIATING', 'CONVERTED'] as const;

// Cấu hình tài chính & vận chuyển (Đơn vị: VND)
export const SHIPPING_FEE = 30000; // Phí giao hàng tiêu chuẩn
export const FREE_SHIPPING_THRESHOLD = 1000000; // Ngưỡng miễn phí vận chuyển (>= 1,000,000đ)

// Cấu hình quản lý kho
export const LOW_STOCK_THRESHOLD = 5; // Ngưỡng cảnh báo sắp hết hàng
