/**
 * Định dạng số tiền thành VND (ví dụ: 1500000 -> 1.500.000 ₫)
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Định dạng ngày tháng thành DD/MM/YYYY (ví dụ: 29/05/2026)
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '--/--/----';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '--/--/----';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Định dạng số điện thoại E.164 (+84912345678) về dạng dễ đọc (0912 345 678)
 */
export function formatPhone(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // Nếu là số Việt Nam chuẩn E.164 (+84)
  if (phone.startsWith('+84')) {
    const raw = '0' + phone.slice(3);
    // Định dạng 4-3-3: 0912 345 678
    if (raw.length === 10) {
      return `${raw.slice(0, 4)} ${raw.slice(4, 7)} ${raw.slice(7)}`;
    }
  }
  
  return phone;
}
