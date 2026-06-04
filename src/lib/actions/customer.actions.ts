'use server';

import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth-helpers';
import { CustomerService } from '@/lib/services/customer.service';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@/lib/validators/customer.schema';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// =========================================================
// 1. GET OR CREATE CUSTOMER (PUBLIC - USED DURING CHECKOUT)
// =========================================================

export async function getOrCreateCustomer(data: z.infer<typeof CreateCustomerSchema>) {
  try {
    const validated = CreateCustomerSchema.parse(data);
    const customer = await CustomerService.getOrCreateCustomer({
      name: validated.name,
      phone: validated.phone,
      email: validated.email,
      companyName: validated.companyName,
      address: validated.address,
      customerType: validated.customerType,
    });
    return customer;
  } catch (error: any) {
    console.error('Lỗi khi getOrCreateCustomer Server Action:', error);
    throw error;
  }
}

// =========================================================
// 2. CREATE CUSTOMER MANUALLY (ADMIN ONLY - CRM BOARD)
// =========================================================

export async function createCustomer(data: z.infer<typeof CreateCustomerSchema>) {
  await requireAdmin();

  try {
    const validated = CreateCustomerSchema.parse(data);
    const customer = await CustomerService.createCustomer(validated);

    revalidatePath('/admin/customers');
    return { success: true, data: customer };
  } catch (error: any) {
    console.error('Lỗi khi tạo khách hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi tạo khách hàng.' };
  }
}

// =========================================================
// 3. LIST CUSTOMERS (ADMIN ONLY - PAGINATION & SEARCH)
// =========================================================

export async function getCustomers(params?: { query?: string; type?: string; page?: number; pageSize?: number }) {
  await requireAdmin();

  try {
    const result = await CustomerService.listCustomers(params || {});
    return { success: true, data: result.data, totalCount: result.totalCount };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách khách hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy danh sách khách hàng.' };
  }
}

// =========================================================
// 4. GET CUSTOMER DETAILS (ADMIN ONLY - CRM SINGLE BOARD)
// =========================================================

export async function getCustomerDetails(id: string) {
  await requireAdmin();

  try {
    const customer = await CustomerService.getCustomerById(id);
    if (!customer) {
      return { success: false, error: 'Không tìm thấy khách hàng yêu cầu!' };
    }

    // Tính toán thêm báo cáo tổng hợp công nợ của khách hàng để hiển thị
    const debtSummary = await CustomerService.getCustomerDebtSummary(id);

    return {
      success: true,
      data: {
        ...customer,
        debtSummary,
      },
    };
  } catch (error: any) {
    console.error('Lỗi khi lấy chi tiết khách hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi xem chi tiết khách hàng.' };
  }
}

// =========================================================
// 5. UPDATE CUSTOMER (ADMIN ONLY)
// =========================================================

export async function updateCustomer(id: string, data: z.infer<typeof UpdateCustomerSchema>) {
  await requireAdmin();

  try {
    const validated = UpdateCustomerSchema.parse(data);
    const updated = await CustomerService.updateCustomer(id, validated);

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${id}`);
    return { success: true, data: updated };
  } catch (error: any) {
    console.error('Lỗi khi cập nhật khách hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi cập nhật khách hàng.' };
  }
}

// =========================================================
// 6. DELETE CUSTOMER (ADMIN ONLY)
// =========================================================

export async function deleteCustomer(id: string) {
  await requireAdmin();

  try {
    await CustomerService.deleteCustomer(id);

    revalidatePath('/admin/customers');
    return { success: true };
  } catch (error: any) {
    console.error('Lỗi khi xóa khách hàng:', error);
    return { success: false, error: error.message || 'Lỗi khi xóa khách hàng.' };
  }
}

// =========================================================
// 7. ADD CARE NOTE (ADMIN ONLY)
// =========================================================

export async function addCustomerNote(customerId: string, content: string) {
  await requireAdmin();

  try {
    if (!content || !content.trim()) {
      return { success: false, error: 'Nội dung ghi chú chăm sóc không được để trống!' };
    }

    const note = await CustomerService.addNote(customerId, content.trim());

    revalidatePath('/admin/customers');
    revalidatePath(`/admin/customers/${customerId}`);
    return { success: true, data: note };
  } catch (error: any) {
    console.error('Lỗi khi thêm ghi chú chăm sóc:', error);
    return { success: false, error: error.message || 'Lỗi khi thêm ghi chú.' };
  }
}
