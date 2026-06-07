'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { InquiryService } from '@/lib/services/inquiry.service';
import { CreateInquirySchema, ConvertToOrderSchema } from '@/lib/validators/inquiry.schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// =========================================================
// 1. CREATE INQUIRY (PUBLIC - B2B CONTACT FORM)
// =========================================================

export async function createInquiry(data: z.infer<typeof CreateInquirySchema>) {
  try {
    const validated = CreateInquirySchema.parse(data);
    const inquiry = await InquiryService.createInquiry({
      customerName: validated.customerName,
      phone: validated.phone,
      email: validated.email,
      companyName: validated.companyName,
      productId: validated.productId,
      quantity: validated.quantity,
      note: validated.note,
      source: validated.source,
    });

    revalidatePath('/admin/inquiries');
    return { success: true, data: inquiry };
  } catch (error: any) {
    console.error('Lỗi khi tạo đơn tư vấn:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi tạo đơn tư vấn.' };
  }
}

// =========================================================
// 2. CAPTURE DRAFT LEAD (PUBLIC - REALTIME DEBOUNCED FORM)
// =========================================================

export async function saveDraftLead(data: z.infer<typeof CreateInquirySchema>) {
  try {
    const validated = CreateInquirySchema.parse(data);
    const inquiry = await InquiryService.saveDraft({
      customerName: validated.customerName,
      phone: validated.phone,
      email: validated.email,
      companyName: validated.companyName,
      productId: validated.productId,
      quantity: validated.quantity,
      note: validated.note,
      source: validated.source,
    });

    revalidatePath('/admin/inquiries');
    return { success: true, data: inquiry };
  } catch (error: any) {
    console.error('Lỗi khi capture thông tin lead nháp:', error);
    return { success: false, error: error.message || 'Lỗi hệ thống khi capture lead nháp.' };
  }
}

// =========================================================
// 3. LIST INQUIRIES (ADMIN ONLY)
// =========================================================

export async function getInquiries(statusFilter?: string, query?: string, page?: number, pageSize?: number, inquiryType?: string) {
  await requireAdmin();

  try {
    const result = await InquiryService.listInquiries({
      status: statusFilter,
      query,
      page,
      pageSize,
      inquiryType,
    });
    return { success: true, data: result.data, totalCount: result.totalCount };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách đơn tư vấn:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách đơn tư vấn.' };
  }
}

// =========================================================
// 4. UPDATE INQUIRY PIPELINE STATUS (ADMIN ONLY)
// =========================================================

export async function updateInquiryStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'NEGOTIATING' | 'CONVERTED' | 'CANCELLED') {
  await requireAdmin();

  try {
    const inquiry = await InquiryService.updateStatus(id, status);

    revalidatePath('/admin/inquiries');
    if (inquiry.customerId) {
      revalidatePath(`/admin/customers/${inquiry.customerId}`);
    }
    return { success: true, data: inquiry };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật trạng thái đơn tư vấn:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật trạng thái.' };
  }
}

// =========================================================
// 5. CONVERT INQUIRY TO B2B WHOLESALE CONTRACT (ADMIN ONLY)
// =========================================================

export async function convertInquiryToOrder(data: z.infer<typeof ConvertToOrderSchema>) {
  await requireAdmin();

  try {
    const validated = ConvertToOrderSchema.parse(data);
    const order = await InquiryService.convertToOrder({
      inquiryId: validated.inquiryId,
      shippingAddress: validated.shippingAddress,
      items: validated.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.priceAtPurchase,
        originalPrice: item.originalPrice || item.priceAtPurchase,
      })),
      discount: validated.discount,
      paidAmount: validated.paidAmount,
      note: validated.note,
    });

    revalidatePath('/admin/inquiries');
    revalidatePath('/admin/orders');
    if (order.customerId) {
      revalidatePath(`/admin/customers/${order.customerId}`);
      revalidatePath('/admin/finance');
    }

    return { success: true, data: order };
  } catch (error: any) {
    console.error('Lỗi khi chuyển đổi đơn tư vấn:', error);
    return { success: false, error: error.message || 'Lỗi khi chuyển đổi đơn tư vấn.' };
  }
}
