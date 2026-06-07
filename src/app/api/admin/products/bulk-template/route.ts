import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import ExcelJS from 'exceljs';

export async function GET(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json(
        { error: authError.message || 'Unauthorized' },
        { status: authError.message.includes('Forbidden') ? 403 : 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'create';

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Sheet1');

    let fileName = 'template-product-create.xlsx';

    if (mode === 'create') {
      fileName = 'template-product-create.xlsx';
      sheet.columns = [
        { header: 'SKU*', key: 'sku', width: 18 },
        { header: 'Tên SP*', key: 'name', width: 28 },
        { header: 'Slug', key: 'slug', width: 22 },
        { header: 'Mô tả ngắn', key: 'shortDescription', width: 35 },
        { header: 'Mô tả dài', key: 'description', width: 45 },
        { header: 'Giá*', key: 'price', width: 15 },
        { header: 'Giá so sánh', key: 'compareAtPrice', width: 15 },
        { header: 'Tồn kho*', key: 'stockQuantity', width: 12 },
        { header: 'Trọng lượng (g)', key: 'weight', width: 15 },
        { header: 'Category slug', key: 'categorySlug', width: 18 },
        { header: 'BST slug', key: 'collectionSlug', width: 18 },
        { header: 'Color name', key: 'colorName', width: 15 },
        { header: 'Size name', key: 'sizeName', width: 15 },
        { header: 'Trạng thái', key: 'isActive', width: 12 },
        { header: 'Visibility', key: 'visibility', width: 12 },
        { header: 'Ảnh URLs (comma sep)', key: 'images', width: 45 },
      ];

      // Thêm dữ liệu mẫu
      sheet.addRow({
        sku: 'CN-BATTRANG-01',
        name: 'Cốc Nối Bát Tràng Đất Sét',
        slug: 'coc-noi-bat-trang-dat-set',
        shortDescription: 'Cốc gốm thủ công làm tay tinh xảo từ đất sét cao lanh.',
        description: '<p>Chi tiết mô tả sản phẩm ở định dạng HTML hoặc văn bản thường.</p>',
        price: 150000,
        compareAtPrice: 180000,
        stockQuantity: 100,
        weight: 350,
        categorySlug: 'coc-gom-moc',
        collectionSlug: 'bat-trang-heritage',
        colorName: 'Mộc',
        sizeName: 'M',
        isActive: 'TRUE',
        visibility: 'PUBLIC',
        images: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      });
    } else if (mode === 'stock') {
      fileName = 'template-update-stock.xlsx';
      sheet.columns = [
        { header: 'SKU*', key: 'sku', width: 22 },
        { header: 'Tồn kho mới*', key: 'stockQuantity', width: 18 },
      ];
      sheet.addRow({
        sku: 'CN-BATTRANG-01',
        stockQuantity: 120,
      });
    } else if (mode === 'price') {
      fileName = 'template-update-price.xlsx';
      sheet.columns = [
        { header: 'SKU*', key: 'sku', width: 22 },
        { header: 'Giá mới*', key: 'price', width: 18 },
        { header: 'Giá so sánh (optional)', key: 'compareAtPrice', width: 22 },
      ];
      sheet.addRow({
        sku: 'CN-BATTRANG-01',
        price: 160000,
        compareAtPrice: 190000,
      });
    }

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };

    headerRow.eachCell((cell) => {
      const headerText = cell.value?.toString() || '';
      const isRequired = headerText.includes('*');

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isRequired ? 'FFC00000' : 'FF1F4E78' },
      };

      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });

    headerRow.height = 25;

    const buffer = await workbook.xlsx.writeBuffer();

    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    console.error('Template API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi khi tạo template.' },
      { status: 500 }
    );
  }
}
