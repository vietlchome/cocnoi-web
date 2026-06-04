'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { OrderService } from '@/lib/services/order.service';
import { FinanceService } from '@/lib/services/finance.service';
import { RetailOrderSchema, B2BOrderSchema } from '@/lib/validators/order.schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { OrderStatus } from '@prisma/client';

// =========================================================
// 1. CREATE RETAIL ORDER (PUBLIC - B2C CHECKOUT)
// =========================================================

export async function createRetailOrder(data: z.infer<typeof RetailOrderSchema>) {
  try {
    const validated = RetailOrderSchema.parse(data);
    const order = await OrderService.createRetailOrder(validated);

    // Gửi thông báo qua Telegram
    try {
      const { sendTelegramNotification } = await import('@/lib/utils/telegram');
      
      // Tính tổng số lượng sản phẩm để báo cáo nhanh
      const itemsCount = validated.items.reduce((acc, item) => acc + item.quantity, 0);
      const formattedTotal = order.totalAmount.toLocaleString('vi-VN');

      const telegramMsg = `<b>📦 ĐƠN HÀNG LẺ MỚI TỪ WEBSITE</b>\n\n` +
                          `👤 <b>Tên khách:</b> ${validated.customerName}\n` +
                          `📞 <b>SĐT:</b> ${validated.phone}\n` +
                          `📍 <b>Địa chỉ:</b> ${validated.address}\n\n` +
                          `🛒 <b>Số lượng:</b> ${itemsCount} sản phẩm\n` +
                          `💳 <b>Tổng tiền:</b> ${formattedTotal} ₫\n` +
                          `📝 <b>Ghi chú:</b> <i>${validated.note || 'Không có'}</i>\n\n` +
                          `<i>Cốc Nối Admin - Hãy vào CRM xác nhận đơn hàng ngay!</i>`;
                          
      await sendTelegramNotification(telegramMsg);
    } catch (telegramErr) {
      console.error("Lỗi gửi thông báo Telegram cho đơn hàng:", telegramErr);
      // Bỏ qua lỗi Telegram để không làm gián đoạn luồng đặt hàng của khách
    }

    revalidatePath('/admin/orders');
    return { success: true, data: order };
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng bán lẻ:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi tạo đơn hàng.' };
  }
}

// =========================================================
// 2. CREATE B2B ORDER (ADMIN ONLY)
// =========================================================

export async function createB2BOrder(data: z.infer<typeof B2BOrderSchema>) {
  await requireAdmin();

  try {
    const validated = B2BOrderSchema.parse(data);
    const order = await OrderService.createB2BOrder({
      customerName: validated.customerName,
      phone: validated.phone,
      email: validated.email,
      companyName: validated.companyName,
      address: validated.address,
      orderType: validated.orderType,
      discount: validated.discount,
      paidAmount: validated.paidAmount,
      note: validated.note,
      items: validated.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        originalPrice: item.originalPrice || item.priceAtPurchase,
      })),
    });

    revalidatePath('/admin/orders');
    if (order.customerId) {
      revalidatePath(`/admin/customers/${order.customerId}`);
    }
    return { success: true, data: order };
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn hàng B2B sỉ:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi tạo đơn hàng B2B sỉ.' };
  }
}

// =========================================================
// 3. LIST ORDERS (ADMIN ONLY)
// =========================================================

export async function getOrders(statusFilter?: string, typeFilter?: string, page?: number, pageSize?: number) {
  await requireAdmin();

  try {
    const result = await OrderService.listOrders({
      status: statusFilter,
      type: typeFilter,
      page,
      pageSize,
    });
    return { success: true, data: result.data, totalCount: result.totalCount };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách đơn hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách đơn hàng.' };
  }
}

// =========================================================
// 4. UPDATE ORDER STATUS (ADMIN ONLY)
// =========================================================

export async function updateOrderStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
  await requireAdmin();

  try {
    const order = await OrderService.updateOrderStatus(id, status);

    revalidatePath('/admin/orders');
    if (order.customerId) {
      revalidatePath(`/admin/customers/${order.customerId}`);
    }
    return { success: true, data: order };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật trạng thái đơn hàng.' };
  }
}

// =========================================================
// 5. UPDATE ORDER PAYMENT STATUS (ADMIN ONLY - MANUAL TOGGLE)
// =========================================================

export async function updateOrderPaymentStatus(id: string, paymentStatus: boolean) {
  await requireAdmin();

  try {
    const order = await prisma.order.update({
      where: { id },
      data: { paymentStatus },
    });

    revalidatePath('/admin/orders');
    if (order.customerId) {
      revalidatePath(`/admin/customers/${order.customerId}`);
    }
    return { success: true, data: order };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật thanh toán đơn hàng.' };
  }
}

// =========================================================
// 6. UPDATE ORDER DEBT (ADMIN ONLY - COLLECT DEBT)
// =========================================================

export async function updateOrderDebt(id: string, newPaidAmount: number) {
  await requireAdmin();

  try {
    // Lấy thông tin đơn hàng hiện tại để so sánh
    const order = await prisma.order.findUnique({
      where: { id },
      select: { paidAmount: true, customerId: true },
    });

    if (!order) {
      return { success: false, error: 'Không tìm thấy đơn hàng cần thu nợ!' };
    }

    // Tính toán chênh lệch tiền đóng thêm
    const additionalPaid = newPaidAmount - order.paidAmount;

    // Delegate qua FinanceService để thu nợ & ghi sổ nhật ký CRM tự động
    const updated = await FinanceService.updateDebt(id, additionalPaid);

    revalidatePath('/admin/orders');
    if (order.customerId) {
      revalidatePath(`/admin/customers/${order.customerId}`);
      revalidatePath('/admin/finance');
    }

    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật công nợ:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi cập nhật công nợ.' };
  }
}
