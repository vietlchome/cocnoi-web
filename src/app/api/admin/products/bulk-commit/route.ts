import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';

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

    const body = await request.json();
    const { mode, rows, conflictResolution } = body;

    if (!mode || !rows || !Array.isArray(rows)) {
      return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 });
    }

    // Load tất cả các maps để lấy ID từ slug/tên ngoài transaction để tối ưu hoá tốc độ
    const categories = await prisma.category.findMany({ select: { id: true, slug: true } });
    const collections = await prisma.productGroup.findMany({ select: { id: true, slug: true } });
    const colors = await prisma.colorOption.findMany({ select: { id: true, name: true } });
    const sizes = await prisma.sizeOption.findMany({ select: { id: true, name: true } });

    const categoryMap = new Map(categories.map(c => [c.slug, c.id]));
    const collectionMap = new Map(collections.map(c => [c.slug, c.id]));
    const colorMap = new Map(colors.map(c => [c.name, c.id]));
    const sizeMap = new Map(sizes.map(s => [s.name, s.id]));

    let created = 0;
    let updated = 0;
    let skipped = 0;

    await prisma.$transaction(async (tx: any) => {
      for (const row of rows) {
        if (row.status === 'ERROR_VALIDATION') {
          skipped++;
          continue;
        }

        const sku = row.sku;

        if (mode === 'create') {
          const rowData = row.data;
          const mappedData = {
            sku: rowData.sku,
            name: rowData.name,
            slug: rowData.slug,
            shortDescription: rowData.shortDescription || null,
            description: rowData.description,
            price: rowData.price,
            compareAtPrice: rowData.compareAtPrice || null,
            stockQuantity: rowData.stockQuantity,
            weight: rowData.weight || 0,
            images: rowData.images || [],
            isActive: rowData.isActive,
            visibility: rowData.visibility,
            categoryId: categoryMap.get(rowData.categorySlug) || null,
            productGroupId: rowData.collectionSlug ? (collectionMap.get(rowData.collectionSlug) || null) : null,
            colorId: rowData.colorName ? (colorMap.get(rowData.colorName) || null) : null,
            sizeId: rowData.sizeName ? (sizeMap.get(rowData.sizeName) || null) : null,
          };

          if (row.status === 'WARNING_DUPLICATE') {
            if (conflictResolution === 'skip') {
              skipped++;
              continue;
            } else if (conflictResolution === 'update') {
              // Bỏ qua không đổi slug của sản phẩm cũ để tránh phá vỡ đường dẫn SEO hiện có
              const { slug, ...updatePayload } = mappedData;
              await tx.product.update({
                where: { sku },
                data: updatePayload,
              });
              updated++;
            } else if (conflictResolution === 'error') {
              throw new Error(`Phát hiện SKU trùng lặp: ${sku}. Giao dịch bị hủy bỏ.`);
            }
          } else {
            await tx.product.create({
              data: mappedData,
            });
            created++;
          }
        } else if (mode === 'stock') {
          if (row.status === 'WARNING_NOT_FOUND') {
            skipped++;
            continue;
          }
          await tx.product.update({
            where: { sku },
            data: { stockQuantity: row.newStock },
          });
          updated++;
        } else if (mode === 'price') {
          if (row.status === 'WARNING_NOT_FOUND') {
            skipped++;
            continue;
          }
          await tx.product.update({
            where: { sku },
            data: {
              price: row.newPrice,
              compareAtPrice: row.newCompareAtPrice || null,
            },
          });
          updated++;
        }
      }
    }, { maxWait: 15000, timeout: 60000 });

    return NextResponse.json({
      success: true,
      created,
      updated,
      skipped,
    });
  } catch (error: any) {
    console.error('Commit Bulk Error:', error);
    return NextResponse.json(
      { error: error.message || 'Lỗi hệ thống khi lưu dữ liệu hàng loạt.' },
      { status: 500 }
    );
  }
}
