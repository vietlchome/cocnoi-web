/**
 * Chuẩn hóa số điện thoại về định dạng E.164 (+84... cho Việt Nam, hoặc giữ nguyên số nước ngoài có +)
 */
export function normalizePhone(phone: string): string {
  if (!phone) return '';
  
  // Xóa mọi khoảng trắng, dấu gạch ngang, dấu ngoặc
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Xử lý prefix "00" ở đầu (đại diện cho dấu + quốc tế)
  if (normalized.startsWith('00')) {
    normalized = '+' + normalized.slice(2);
  }
  
  // Nếu bắt đầu bằng 0 và theo sau là các chữ số (đặc trưng số VN)
  if (normalized.startsWith('0')) {
    normalized = '+84' + normalized.slice(1);
  }
  
  // Nếu bắt đầu bằng 84 và chưa có dấu +
  if (normalized.startsWith('84') && !normalized.startsWith('+')) {
    normalized = '+' + normalized;
  }
  
  // Nếu chưa có dấu + ở đầu (ví dụ số nước ngoài nhập trực tiếp không có +)
  if (!normalized.startsWith('+') && /^\d+$/.test(normalized)) {
    normalized = '+' + normalized;
  }
  
  // Kiểm tra độ dài chữ số (tiêu chuẩn E.164: 8 đến 15 chữ số không bao gồm dấu +)
  const digitsOnly = normalized.replace(/\+/g, '');
  if (digitsOnly.length < 8 || digitsOnly.length > 15) {
    throw new Error('Số điện thoại không hợp lệ (yêu cầu từ 8 đến 15 chữ số)!');
  }
  
  return normalized;
}

/**
 * Kiểm tra xem một số điện thoại có hợp lệ hay không
 */
export function isValidPhone(phone: string): boolean {
  if (!phone) return false;
  try {
    const norm = normalizePhone(phone);
    const digitsOnly = norm.replace(/\+/g, '');
    return digitsOnly.length >= 8 && digitsOnly.length <= 15;
  } catch {
    return false;
  }
}
