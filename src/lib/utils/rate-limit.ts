const requestCounts = new Map<string, { count: number; resetAt: number }>();

/**
 * Kiểm tra xem một IP có vượt quá giới hạn yêu cầu hay không.
 * @param ip Địa chỉ IP của yêu cầu
 * @param limit Số lượng yêu cầu tối đa cho phép trong một khung thời gian
 * @param windowMs Khung thời gian (tính bằng mili giây)
 * @returns true nếu yêu cầu hợp lệ, false nếu bị chặn do vượt quá giới hạn
 */
export function checkRateLimit(ip: string, limit: number = 5, windowMs: number = 60_000): boolean {
  const now = Date.now();
  const entry = requestCounts.get(ip);
  
  if (!entry || now > entry.resetAt) {
    requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  
  if (entry.count >= limit) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Dọn dẹp định kỳ các bản ghi đã hết hạn mỗi 5 phút
if (typeof global !== 'undefined') {
  const intervalKey = '_rateLimitCleanupInterval';
  // Đảm bảo không tạo nhiều interval khi Next.js hot reload trong local dev
  if (!(global as any)[intervalKey]) {
    (global as any)[intervalKey] = setInterval(() => {
      const now = Date.now();
      for (const [ip, entry] of requestCounts) {
        if (now > entry.resetAt) {
          requestCounts.delete(ip);
        }
      }
    }, 5 * 60_000);
  }
}
