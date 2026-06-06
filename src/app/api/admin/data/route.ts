import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';

export async function GET() {
  try {
    // 1. Kiểm tra phân quyền quản trị (ADMIN)
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json(
        { error: authError.message || 'Unauthorized' },
        { status: authError.message.includes('Forbidden') ? 403 : 401 }
      );
    }

    // 2. Lấy số lượng thực tế từ cơ sở dữ liệu
    const inquiriesCount = await prisma.orderInquiry.count();
    const productsCount = await prisma.product.count();
    const postsCount = await prisma.post.count();

    const pendingInquiriesCount = await prisma.orderInquiry.count({
      where: { status: 'PENDING' },
    });

    // 3. Lấy danh sách 10 yêu cầu tư vấn mới nhất
    const realInquiries = await prisma.orderInquiry.findMany({
      include: {
        product: {
          include: {
            category: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Ánh xạ sang cấu trúc giao diện Dashboard cũ để giữ nguyên khả năng hiển thị
    const mappedInquiries = realInquiries.map((inq: any) => ({
      id: inq.id,
      product_id: inq.productId || '',
      customer_name: inq.customerName,
      phone: inq.phone,
      email: inq.email,
      address: inq.note || '',
      quantity: inq.quantity,
      note: inq.note,
      status: inq.status === 'CONVERTED' ? 'COMPLETED' : inq.status, // Đồng bộ CONVERTED -> COMPLETED để hiển thị màu xanh lá ở dashboard cũ
      created_at: inq.createdAt.toISOString(),
      product: inq.product
        ? {
            id: inq.product.id,
            name_vn: inq.product.name,
            category: inq.product.category?.name || 'Cốc gốm',
            price_pair: inq.product.price,
            description_vn: inq.product.description,
          }
        : {
            id: '',
            name_vn: 'Thiết kế gốm B2B riêng',
            category: 'B2B Custom',
            price_pair: 0,
            description_vn: '',
          },
    }));

    // 4. Lấy danh sách sản phẩm
    const products = await prisma.product.findMany({
      include: {
        color: true,
        size: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedProducts = products.map((p: any) => ({
      ...p,
      name_vn: p.name,
      price_pair: p.price,
      size: p.size?.name || null,
    }));

    // 5. Lấy danh sách bài viết blog
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalInquiries: inquiriesCount,
        pendingInquiries: pendingInquiriesCount,
        totalProducts: productsCount,
        totalPosts: postsCount,
      },
      inquiries: mappedInquiries,
      products: mappedProducts,
      posts,
    });
  } catch (error: any) {
    console.error('Admin Summary GET Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gặp lỗi kết nối cơ sở dữ liệu.' },
      { status: 500 }
    );
  }
}
