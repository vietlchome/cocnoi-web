import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/utils/slug';

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

    // Load tất cả các maps để lấy ID từ tên ngoài transaction để tối ưu hóa
    const categories = await prisma.category.findMany({ select: { id: true, name: true } });
    const collections = await prisma.productGroup.findMany({ select: { id: true, name: true } });
    const colors = await prisma.colorOption.findMany({ select: { id: true, name: true } });
    const sizes = await prisma.sizeOption.findMany({ select: { id: true, name: true } });
    const existingProducts = await prisma.product.findMany({ select: { slug: true, sku: true } });

    const categoryMap = new Map<string, string>(categories.map((c: { id: string; name: string }) => [c.name, c.id]));
    const collectionMap = new Map<string, string>(collections.map((c: { id: string; name: string }) => [c.name, c.id]));
    const colorMap = new Map<string, string>(colors.map((c: { id: string; name: string }) => [c.name, c.id]));
    const sizeMap = new Map<string, string>(sizes.map((s: { id: string; name: string }) => [s.name, s.id]));

    // In-memory set để check trùng lặp slug/SKU tức thời mà không dính race condition
    const existingSlugs = new Set<string>(existingProducts.map((p: { slug: string; sku: string | null }) => p.slug));
    const existingSkus = new Set<string>(existingProducts.map((p: { slug: string; sku: string | null }) => p.sku).filter(Boolean) as string[]);

    // Query Seed SKU bắt đầu bằng "CN" lớn nhất trong hệ thống một lần duy nhất
    const lastProduct = await prisma.product.findFirst({
      where: { sku: { startsWith: 'CN' } },
      orderBy: { sku: 'desc' },
      select: { sku: true }
    });

    let nextNum = 1;
    if (lastProduct?.sku) {
      const match = lastProduct.sku.match(/^CN(\d+)$/);
      if (match) {
        nextNum = parseInt(match[1], 10) + 1;
      }
    }

    let created = 0;
    let updated = 0;
    let skipped = 0;

    // Retry block phòng thủ khi gặp Prisma P2002 lỗi ghi nhận đồng thời
    let attempt = 0;
    const maxAttempts = 3;
    while (attempt < maxAttempts) {
      try {
        let currentNextNum = nextNum;
        const tempSlugs = new Set<string>(existingSlugs);
        const tempSkus = new Set<string>(existingSkus);

        await prisma.$transaction(async (tx: any) => {
          created = 0;
          updated = 0;
          skipped = 0;

          for (const row of rows) {
            if (row.status === 'ERROR_VALIDATION') {
              skipped++;
              continue;
            }

            if (mode === 'create') {
              const rowData = row.data;
              
              // 1. Tự động sinh SKU sequential tăng dần nếu trống
              let finalSku = rowData.sku;
              if (!finalSku || finalSku.trim() === '') {
                let candidateSku = `CN${String(currentNextNum).padStart(4, '0')}`;
                while (tempSkus.has(candidateSku)) {
                  currentNextNum++;
                  candidateSku = `CN${String(currentNextNum).padStart(4, '0')}`;
                }
                finalSku = candidateSku;
                tempSkus.add(finalSku);
                currentNextNum++;
              } else {
                tempSkus.add(finalSku);
              }

              // 2. Tự động sinh slug độc nhất bằng cách thêm hậu tố -2, -3... nếu trùng
              const baseSlug = rowData.slug || slugify(rowData.name);
              let finalSlug = baseSlug;
              let suffixCounter = 2;
              while (tempSlugs.has(finalSlug)) {
                finalSlug = `${baseSlug}-${suffixCounter}`;
                suffixCounter++;
              }
              tempSlugs.add(finalSlug);

              const mappedData = {
                sku: finalSku,
                name: rowData.name,
                slug: finalSlug,
                shortDescription: rowData.shortDescription || null,
                description: rowData.description,
                price: rowData.price,
                compareAtPrice: rowData.compareAtPrice || null,
                stockQuantity: rowData.stockQuantity,
                weight: rowData.weight || 0,
                capacity: rowData.capacity || 0,
                dimensions: rowData.dimensions || null,
                images: rowData.images || [],
                isActive: rowData.isActive,
                visibility: rowData.visibility,
                categoryId: categoryMap.get(rowData.categoryName) || null,
                productGroupId: rowData.collectionName ? (collectionMap.get(rowData.collectionName) || null) : null,
                colorId: rowData.colorName ? (colorMap.get(rowData.colorName) || null) : null,
                sizeId: rowData.sizeName ? (sizeMap.get(rowData.sizeName) || null) : null,
              };

              if (row.status === 'WARNING_DUPLICATE') {
                if (conflictResolution === 'skip') {
                  skipped++;
                  continue;
                } else if (conflictResolution === 'update') {
                  // Giữ nguyên slug và sku của sản phẩm cũ
                  const { slug, sku, ...updatePayload } = mappedData;
                  await tx.product.update({
                    where: { sku: rowData.sku },
                    data: updatePayload,
                  });
                  updated++;
                } else if (conflictResolution === 'error') {
                  throw new Error(`Phát hiện SKU trùng lặp: ${rowData.sku}. Giao dịch bị hủy bỏ.`);
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
                where: { sku: row.sku },
                data: { stockQuantity: row.newStock },
              });
              updated++;
            } else if (mode === 'price') {
              if (row.status === 'WARNING_NOT_FOUND') {
                skipped++;
                continue;
              }
              await tx.product.update({
                where: { sku: row.sku },
                data: {
                  price: row.newPrice,
                  compareAtPrice: row.newCompareAtPrice || null,
                },
              });
              updated++;
            }
          }
        }, { maxWait: 15000, timeout: 60000 });

        break; // Hoàn thành transaction thành công
      } catch (txError: any) {
        // Nếu dính lỗi trùng SKU/slug do race condition từ DB, tăng attempt và fetch lại seed mới
        if (txError.code === 'P2002') {
          attempt++;
          if (attempt >= maxAttempts) {
            throw txError;
          }
          console.warn(`Prisma P2002 conflict detected during transaction commit. Retrying attempt ${attempt}...`);
          
          // Re-query existing products to refresh the in-memory sets!
          const refreshedProducts = await prisma.product.findMany({ select: { slug: true, sku: true } });
          existingSlugs.clear();
          refreshedProducts.forEach((p: { slug: string; sku: string | null }) => existingSlugs.add(p.slug));
          existingSkus.clear();
          refreshedProducts.forEach((p: { slug: string; sku: string | null }) => {
            if (p.sku) existingSkus.add(p.sku);
          });

          // Re-query Seed
          const lastProductRetry = await prisma.product.findFirst({
            where: { sku: { startsWith: 'CN' } },
            orderBy: { sku: 'desc' },
            select: { sku: true }
          });
          if (lastProductRetry?.sku) {
            const match = lastProductRetry.sku.match(/^CN(\d+)$/);
            if (match) {
              nextNum = parseInt(match[1], 10) + 1;
            }
          }
        } else {
          throw txError;
        }
      }
    }

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
