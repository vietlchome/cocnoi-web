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

// Robust number parsing: strips non-digits (like dots, commas, units)
function parseNumber(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const num = parseInt(String(value).replace(/[^\d]/g, ''), 10);
  return isNaN(num) ? null : num;
}

function mapStatus(label: string | undefined | null): { isActive: boolean; visibility: 'PUBLIC' | 'HIDDEN' } {
  const normalized = (label || 'Đang bán').trim();
  if (normalized === 'Ẩn (chỉ B2B custom)') {
    return { isActive: true, visibility: 'HIDDEN' };
  }
  if (normalized === 'Ngừng kinh doanh') {
    return { isActive: false, visibility: 'PUBLIC' };
  }
  return { isActive: true, visibility: 'PUBLIC' }; // Mặc định Đang bán
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

    const buffer = Buffer.from(await file.arrayBuffer()) as any;
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

    // Đọc các danh mục, bộ sưu tập, màu sắc, kích cỡ có trong DB theo NAME để đối chiếu dropdown
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const collections = await prisma.productGroup.findMany({ select: { id: true, name: true } });
    const colors = await prisma.colorOption.findMany({ select: { id: true, name: true } });
    const sizes = await prisma.sizeOption.findMany({ select: { id: true, name: true } });
    const products = await prisma.product.findMany({ select: { sku: true, name: true } });

    const categoryNames = new Set<string>(categories.map((c: { id: string; name: string }) => c.name));
    const collectionNames = new Set<string>(collections.map((c: { id: string; name: string }) => c.name));
    const colorNames = new Set<string>(colors.map((c: { id: string; name: string }) => c.name));
    const sizeNames = new Set<string>(sizes.map((s: { id: string; name: string }) => s.name));
    const dbSkus = new Set<string>(products.map((p: { sku: string | null; name: string }) => p.sku).filter(Boolean) as string[]);

    const rows: any[] = [];
    const seenSkus = new Set<string>();

    sheet.eachRow({ includeEmpty: false }, (row, rowNum) => {
      if (rowNum === 1) return; // Bỏ qua header row

      if (mode === 'create') {
        const name = getCellString(row.getCell(1));
        const price = parseNumber(row.getCell(2).value);
        const stockQuantity = parseNumber(row.getCell(3).value) ?? 0; // default 0 nếu trống
        const categoryName = getCellString(row.getCell(4));
        const collectionName = getCellString(row.getCell(5));
        const colorName = getCellString(row.getCell(6));
        const sizeName = getCellString(row.getCell(7));
        const sku = getCellString(row.getCell(8));
        const shortDescription = getCellString(row.getCell(9));
        const description = getCellString(row.getCell(10)) || shortDescription || name;
        const compareAtPrice = parseNumber(row.getCell(11).value);
        const weight = parseNumber(row.getCell(12).value) ?? 0; // default 0
        const capacity = parseNumber(row.getCell(13).value) ?? 0; // default 0
        const dimensions = getCellString(row.getCell(14));
        const statusLabel = getCellString(row.getCell(15));
        const imagesStr = getCellString(row.getCell(16));

        const errors: string[] = [];
        let status = 'OK_CREATE';

        // Validations
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
        if (stockQuantity < 0) {
          errors.push('Tồn kho phải là số nguyên không âm.');
          status = 'ERROR_VALIDATION';
        }
        if (weight < 0) {
          errors.push('Trọng lượng phải lớn hơn hoặc bằng 0.');
          status = 'ERROR_VALIDATION';
        }
        if (capacity < 0) {
          errors.push('Dung tích phải lớn hơn hoặc bằng 0.');
          status = 'ERROR_VALIDATION';
        }
        if (!categoryName) {
          errors.push('Tên Category không được để trống.');
          status = 'ERROR_VALIDATION';
        } else if (!categoryNames.has(categoryName)) {
          errors.push(`Danh mục "${categoryName}" không tồn tại trong hệ thống.`);
          status = 'ERROR_VALIDATION';
        }
        if (collectionName && !collectionNames.has(collectionName)) {
          errors.push(`Bộ sưu tập "${collectionName}" không tồn tại trong hệ thống.`);
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

        const mappedStatusValues = mapStatus(statusLabel);
        const images = imagesStr ? imagesStr.split(',').map(url => url.trim()).filter(Boolean) : [];

        // Check trùng lặp SKU trong file Excel (chỉ check nếu điền SKU)
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
          sku: sku || '(Tự động sinh)',
          name,
          status,
          errors,
          data: {
            sku: sku || null,
            name,
            slug: slugify(name),
            shortDescription: shortDescription || null,
            description,
            price: price || 0,
            compareAtPrice: compareAtPrice || null,
            stockQuantity,
            weight,
            capacity,
            dimensions: dimensions || null,
            categoryName,
            collectionName: collectionName || null,
            colorName: colorName || null,
            sizeName: sizeName || null,
            isActive: mappedStatusValues.isActive,
            visibility: mappedStatusValues.visibility,
            images,
          },
        });
      } else if (mode === 'stock') {
        const sku = getCellString(row.getCell(1));
        const stockQuantity = parseNumber(row.getCell(2).value);
        const errors: string[] = [];
        let status = 'OK_UPDATE';

        if (!sku) {
          errors.push('SKU không được để trống.');
          status = 'ERROR_VALIDATION';
        }
        if (stockQuantity === null || stockQuantity < 0) {
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
        const sku = getCellString(row.getCell(1));
        const price = parseNumber(row.getCell(2).value);
        const compareAtPrice = parseNumber(row.getCell(3).value);
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
