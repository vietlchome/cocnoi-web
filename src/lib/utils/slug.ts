/**
 * Sinh slug tiếng Việt thân thiện với SEO (Vietnamese-aware slugifier)
 */
export function slugify(text: string): string {
  if (!text) return '';

  let slug = text.normalize('NFC').toLowerCase();

  // Thay thế các ký tự tiếng Việt có dấu
  slug = slug.replace(/[áàảãạăắằẳẵặâấầẩẫậ]/g, 'a');
  slug = slug.replace(/[éèẻẽẹêếềểễệ]/g, 'e');
  slug = slug.replace(/[íìỉĩị]/g, 'i');
  slug = slug.replace(/[óòỏõọôốồổỗộơớờởỡợ]/g, 'o');
  slug = slug.replace(/[úùủũụưứừửữự]/g, 'u');
  slug = slug.replace(/[ýỳỷỹỵ]/g, 'y');
  slug = slug.replace(/đ/g, 'd');

  // Loại bỏ các ký tự đặc biệt, chỉ giữ lại chữ cái, số và khoảng trắng
  slug = slug.replace(/[^a-z0-9\s-]/g, '');

  // Thay thế nhiều khoảng trắng liên tiếp hoặc dấu gạch ngang bằng 1 dấu gạch ngang
  slug = slug.replace(/[\s-]+/g, '-');

  // Loại bỏ các dấu gạch ngang ở đầu và cuối chuỗi
  slug = slug.replace(/^-+|-+$/g, '');

  return slug;
}
