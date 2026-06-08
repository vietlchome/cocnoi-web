import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
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
      
      // Query metadata from DB to build dropdown lists
      const categories = await prisma.category.findMany({ select: { name: true } });
      const groups = await prisma.productGroup.findMany({ select: { name: true } });
      const colors = await prisma.colorOption.findMany({ select: { name: true } });
      const sizes = await prisma.sizeOption.findMany({ select: { name: true } });

      sheet.columns = [
        { header: 'Tên SP*', key: 'name', width: 28 },
        { header: 'Giá (VND)*', key: 'price', width: 18 },
        { header: 'Tồn kho*', key: 'stockQuantity', width: 12 },
        { header: 'Category*', key: 'categoryName', width: 20 },
        { header: 'BST', key: 'collectionName', width: 20 },
        { header: 'Màu', key: 'colorName', width: 15 },
        { header: 'Cỡ', key: 'sizeName', width: 15 },
        { header: 'SKU', key: 'sku', width: 18 },
        { header: 'Mô tả ngắn', key: 'shortDescription', width: 35 },
        { header: 'Mô tả dài', key: 'description', width: 45 },
        { header: 'Giá so sánh', key: 'compareAtPrice', width: 18 },
        { header: 'Trọng lượng (g)', key: 'weight', width: 18 },
        { header: 'Dung tích (ml)', key: 'capacity', width: 18 },
        { header: 'Kích thước', key: 'dimensions', width: 18 },
        { header: 'Trạng thái', key: 'status', width: 18 },
        { header: 'Ảnh URLs', key: 'images', width: 45 },
      ];

      // Add demo row with DB fallbacks
      sheet.addRow({
        name: 'Cốc Nối Bát Tràng Đất Sét',
        price: 150000,
        stockQuantity: 100,
        categoryName: categories[0]?.name || 'Cốc gốm mộc',
        collectionName: groups[0]?.name || '',
        colorName: colors[0]?.name || '',
        sizeName: sizes[0]?.name || '',
        sku: 'CN0001',
        shortDescription: 'Cốc gốm thủ công làm tay tinh xảo từ đất sét cao lanh.',
        description: 'Chi tiết mô tả sản phẩm ở định dạng Markdown hoặc văn bản thường.',
        compareAtPrice: 180000,
        weight: 350,
        capacity: 350,
        dimensions: 'Ø8.5 × H11cm',
        status: 'Đang bán',
        images: 'https://res.cloudinary.com/demo/image/upload/sample.jpg',
      });

      // Data Validations
      const categoryList = categories.length > 0 ? categories.map((c: { name: string }) => c.name) : ['Cốc gốm mộc'];
      const groupList = groups.length > 0 ? groups.map((g: { name: string }) => g.name) : ['Bát Tràng Heritage'];
      const colorList = colors.length > 0 ? colors.map((c: { name: string }) => c.name) : ['Mộc'];
      const sizeList = sizes.length > 0 ? sizes.map((s: { name: string }) => s.name) : ['M'];

      const categoryFormula = `"${categoryList.join(',')}"`;
      const groupFormula = `"${groupList.join(',')}"`;
      const colorFormula = `"${colorList.join(',')}"`;
      const sizeFormula = `"${sizeList.join(',')}"`;
      const statusFormula = '"Đang bán,Ẩn (chỉ B2B custom),Ngừng kinh doanh"';

      for (let i = 2; i <= 500; i++) {
        sheet.getCell(`D${i}`).dataValidation = {
          type: 'list',
          allowBlank: false,
          formulae: [categoryFormula],
          showErrorMessage: true,
          errorTitle: 'Category không hợp lệ',
          error: 'Vui lòng chọn từ dropdown danh sách'
        };

        sheet.getCell(`E${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [groupFormula],
          showErrorMessage: true,
          errorTitle: 'BST không hợp lệ',
          error: 'Vui lòng chọn từ dropdown danh sách'
        };

        sheet.getCell(`F${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [colorFormula],
          showErrorMessage: true,
          errorTitle: 'Màu không hợp lệ',
          error: 'Vui lòng chọn từ dropdown danh sách'
        };

        sheet.getCell(`G${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [sizeFormula],
          showErrorMessage: true,
          errorTitle: 'Cỡ không hợp lệ',
          error: 'Vui lòng chọn từ dropdown danh sách'
        };

        sheet.getCell(`O${i}`).dataValidation = {
          type: 'list',
          allowBlank: true,
          formulae: [statusFormula],
          showErrorMessage: true,
          errorTitle: 'Trạng thái không hợp lệ',
          error: 'Vui lòng chọn từ dropdown danh sách'
        };
      }

      // Hover Comments
      sheet.getCell('A1').note = 'Tên sản phẩm hiển thị';
      sheet.getCell('B1').note = 'Giá bán (đơn vị VND), không nhập dấu chấm/phẩy';
      sheet.getCell('H1').note = 'Để trống = hệ thống tự sinh CN0001, CN0002...';
      sheet.getCell('O1').note = 'Để trống = mặc định Đang bán';

    } else if (mode === 'stock') {
      fileName = 'template-update-stock.xlsx';
      sheet.columns = [
        { header: 'SKU*', key: 'sku', width: 22 },
        { header: 'Tồn kho mới*', key: 'stockQuantity', width: 18 },
      ];
      sheet.addRow({
        sku: 'CN0001',
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
        sku: 'CN0001',
        price: 160000,
        compareAtPrice: 190000,
      });
    }

    const headerRow = sheet.getRow(1);
    headerRow.height = 25;

    headerRow.eachCell((cell, colNum) => {
      const isRequired = mode === 'create' ? colNum <= 4 : cell.value?.toString().includes('*');

      cell.font = {
        name: 'Arial',
        size: 10,
        bold: true,
        color: { argb: isRequired ? 'FFFF0000' : 'FF000000' }
      };

      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF2F2F2' },
      };

      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'medium', color: { argb: 'FFBFBFBF' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } },
      };
    });

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
