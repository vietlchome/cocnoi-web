import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils/slug';
import ExcelJS from 'exceljs';

function getCellString(cell: ExcelJS.Cell): string {
  const val = cell.value;
  if (val === null || val === undefined) return '';
  if (typeof val === 'object') {
    if ('richText' in val && Array.isArray(val.richText)) {
      return val.richText.map((t: any) => t.text || '').join('').trim();
    }
    if ('text' in val) {
      return String(val.text).trim();
    }
    if ('result' in val) {
      return String(val.result).trim();
    }
    return JSON.stringify(val).trim();
  }
  return String(val).trim();
}

function getCellNumber(cell: ExcelJS.Cell): number | null {
  const val = cell.value;
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

export async function POST(request: Request) {
  try {
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json(
        { error: authError.message || 'Unauthorized' },
        { status: authError.message.includes('Forbidden') ? 403 : 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') as 'create' | 'stock' | 'price';

    if (!file) {
      return NextResponse.json({ error: 'Thiếu file tải lên.' }, { status: 400 });
    }

    if (!mode || !['create', 'stock', 'price'].includes(mode)) {
      return NextResponse.json({ error: 'Chế độ hoạt động không hợp lệ.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(buffer);
    } catch (err) {
      return NextResponse.json({ error: 'Không thể đọc file Excel. Định dạng không được hỗ trợ.' }, { status: 400 });
    }

    const sheet = workbook.worksheets[0];
    if (!sheet || sheet.rowCount < 2) {
      return NextResponse.json({ error: 'File Excel trống hoặc không có dòng tiêu đề.' }, { status: 400 });
    }

    // Đọc tất cả các danh mục, bộ sưu tập, màu sắc, kích cỡ có trong DB
    const categories = await prisma.category.findMany({ select: { id: true, slug: true, name: true } });
    const collections = await prisma.productGroup.findMany({ select: { id: true, slug: true, name: true } });
    const colors = await prisma.colorOption.findMany({ select: { id: true, name: true } });
    const sizes = await prisma.sizeOption.findMany({ select: { id: true, name: true } });
    const products = await prisma.product.findMany({ select: { sku: true, name: true } });

    const categorySlugs = new Set(categories.map(c => c.slug));
    const collectionSlugs = new Set(collections.map(c => c.slug));
    const colorNames = new Set(colors.map(c => c.name));
    const sizeNames = new Set(sizes.map(s => s.name));
    const dbSkus = new Set(products.map(p => p.sku).filter(Boolean) as string[]);

    const rows: any[] = [];
    const seenSkus = new Set<string>();

    sheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
      if (rowNum === 1) return; // Bỏ qua header row

      const sku = getCellString(row.getCell(1));
      
      if (mode === 'create') {
        const name = getCellString(row.getCell(2));
        const slug = getCellString(row.getCell(3)) || slugify(name);
        const shortDescription = getCellString(row.getCell(4));
        const description = getCellString(row.getCell(5)) || shortDescription || name;
        const price = getCellNumber(row.getCell(6));
        const compareAtPrice = getCellNumber(row.getCell(7));
        const stockQuantity = getCellNumber(row.getCell(8));
        const weight = getCellNumber(row.getCell(9)) || 0;
        const categorySlug = getCellString(row.getCell(10));
        const collectionSlug = getCellString(row.getCell(11));
        const colorName = getCellString(row.getCell(12));
        const sizeName = getCellString(row.getCell(13));
        const isActiveStr = getCellString(row.getCell(14)).toUpperCase();
        const visibilityStr = getCellString(row.getCell(15)).toUpperCase();
        const imagesStr = getCellString(row.getCell(16));

        const errors: string[] = [];
        let status = 'OK_CREATE';

        // Validations
        if (!sku) {
          errors.push('SKU không được để trống.');
          status = 'ERROR_VALIDATION';
        }
        if (!name) {
          errors.push('Tên sản phẩm không được để trống.');
          status = 'ERROR_VALIDATION';
        }
        if (price === null || price <= 0) {
          errors.push('Giá sản phẩm phải là số lớn hơn 0.');
          status = 'ERROR_VALIDATION';
        }
        if (compareAtPrice !== null && price !== null && compareAtPrice <= price) {
          errors.push('Giá so sánh phải lớn hơn giá bán.');
          status = 'ERROR_VALIDATION';
        }
        if (stockQuantity === null || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
          errors.push('Tồn kho phải là số nguyên không âm.');
          status = 'ERROR_VALIDATION';
        }
        if (weight < 0) {
          errors.push('Trọng lượng phải lớn hơn hoặc bằng 0.');
          status = 'ERROR_VALIDATION';
        }
        if (!categorySlug) {
          errors.push('Category slug không được để trống.');
          status = 'ERROR_VALIDATION';
        } else if (!categorySlugs.has(categorySlug)) {
          errors.push(`Danh mục có slug "${categorySlug}" không tồn tại trong hệ thống.`);
          status = 'ERROR_VALIDATION';
        }
        if (collectionSlug && !collectionSlugs.has(collectionSlug)) {
          errors.push(`Bộ sưu tập có slug "${collectionSlug}" không tồn tại trong hệ thống.`);
          status = 'ERROR_VALIDATION';
        }
        if (colorName && !colorNames.has(colorName)) {
          errors.push(`Màu sắc "${colorName}" không tồn tại trong hệ thống.`);
          status = 'ERROR_VALIDATION';
        }
        if (sizeName && !sizeNames.has(sizeName)) {
          errors.push(`Kích thước "${sizeName}" không tồn tại trong hệ thống.`);
          status = 'ERROR_VALIDATION';
        }

        const visibility = ['PUBLIC', 'B2B_ONLY', 'HIDDEN'].includes(visibilityStr)
          ? visibilityStr
          : 'PUBLIC';
        const isActive = isActiveStr === 'FALSE' || isActiveStr === 'NO' || isActiveStr === '0' ? false : true;
        const images = imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(Boolean) : [];

        // Check trùng lặp SKU trong file Excel
        if (sku) {
          if (seenSkus.has(sku)) {
            errors.push('SKU trùng lặp trong cùng file Excel.');
            status = 'ERROR_VALIDATION';
          } else {
            seenSkus.add(sku);
            if (status !== 'ERROR_VALIDATION' && dbSkus.has(sku)) {
              status = 'WARNING_DUPLICATE';
            }
          }
        }

        rows.push({
          rowNum,
          sku,
          name,
          status,
          errors,
          data: {
            sku,
            name,
            slug,
            shortDescription: shortDescription || null,
            description,
            price: price || 0,
            compareAtPrice: compareAtPrice || null,
            stockQuantity: stockQuantity || 0,
            weight,
            categorySlug,
            collectionSlug: collectionSlug || null,
            colorName: colorName || null,
            sizeName: sizeName || null,
            isActive,
            visibility,
            images,
          },
        });
      } else if (mode === 'stock') {
        const stockQuantity = getCellNumber(row.getCell(2));
        const errors: string[] = [];
        let status = 'OK_UPDATE';

        if (!sku) {
          errors.push('SKU không được để trống.');
          status = 'ERROR_VALIDATION';
        }
        if (stockQuantity === null || stockQuantity < 0 || !Number.isInteger(stockQuantity)) {
          errors.push('Tồn kho mới phải là số nguyên không âm.');
          status = 'ERROR_VALIDATION';
        }

        if (sku) {
          if (seenSkus.has(sku)) {
            errors.push('SKU trùng lặp trong cùng file Excel.');
            status = 'ERROR_VALIDATION';
          } else {
            seenSkus.add(sku);
            if (status !== 'ERROR_VALIDATION' && !dbSkus.has(sku)) {
              status = 'WARNING_NOT_FOUND';
            }
          }
        }

        rows.push({
          rowNum,
          sku,
          status,
          errors,
          newStock: stockQuantity,
        });
      } else if (mode === 'price') {
        const price = getCellNumber(row.getCell(2));
        const compareAtPrice = getCellNumber(row.getCell(3));
        const errors: string[] = [];
        let status = 'OK_UPDATE';

        if (!sku) {
          errors.push('SKU không được để trống.');
          status = 'ERROR_VALIDATION';
        }
        if (price === null || price <= 0) {
          errors.push('Giá mới phải là số lớn hơn 0.');
          status = 'ERROR_VALIDATION';
        }
        if (compareAtPrice !== null && price !== null && compareAtPrice <= price) {
          errors.push('Giá so sánh mới phải lớn hơn giá bán mới.');
          status = 'ERROR_VALIDATION';
        }

        if (sku) {
          if (seenSkus.has(sku)) {
            errors.push('SKU trùng lặp trong cùng file Excel.');
            status = 'ERROR_VALIDATION';
          } else {
            seenSkus.add(sku);
            if (status !== 'ERROR_VALIDATION' && !dbSkus.has(sku)) {
              status = 'WARNING_NOT_FOUND';
            }
          }
        }

        rows.push({
          rowNum,
          sku,
          status,
          errors,
          newPrice: price,
          newCompareAtPrice: compareAtPrice,
        });
      }
    });

    return NextResponse.json({
      success: true,
      preview: rows,
      totalRows: rows.length,
    });
  } catch (error: any) {
    console.error('Upload Parse Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi hệ thống khi phân tích file upload.' },
      { status: 500 }
    );
  }
}
