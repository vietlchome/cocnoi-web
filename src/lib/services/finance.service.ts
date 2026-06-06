import { prisma } from '@/lib/prisma';
import { CustomerService } from './customer.service';
import { OrderType } from '@prisma/client';

export class FinanceService {
  /**
   * Cập nhật tiền đã thanh toán (thu nợ) và tính toán lại công nợ sỉ
   */
  static async updateDebt(
    orderId: string,
    additionalPaid: number,
    tx?: any
  ) {
    const execute = async (db: any) => {
      // 1. Lấy đơn hàng kiểm tra
      const order = await db.order.findUnique({
        where: { id: orderId },
        select: {
          id: true,
          totalAmount: true,
          paidAmount: true,
          debtAmount: true,
          customerId: true,
          orderType: true,
        },
      });

      if (!order) {
        throw new Error(`Không tìm thấy đơn hàng ID "${orderId}" để cập nhật công nợ!`);
      }

      if (order.orderType === OrderType.RETAIL) {
        throw new Error('Đơn hàng bán lẻ B2C không áp dụng tính năng ghi nợ và thu nợ sỉ!');
      }

      // 2. Tính toán công nợ mới
      const newPaidAmount = Math.max(0, Math.min(order.totalAmount, order.paidAmount + additionalPaid));
      const newDebtAmount = Math.max(0, order.totalAmount - newPaidAmount);
      const paymentStatus = newDebtAmount === 0;

      // 3. Cập nhật đơn hàng
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          paidAmount: newPaidAmount,
          debtAmount: newDebtAmount,
          paymentStatus,
        },
        include: {
          customer: true,
        },
      });

      // 4. Đồng bộ CRM nhật ký thanh toán
      if (order.customerId) {
        const actionText = additionalPaid >= 0 ? 'Thu nợ sỉ' : 'Điều chỉnh giảm thu nợ';
        const formattedAdditional = Math.abs(additionalPaid).toLocaleString();
        const formattedRemaining = newDebtAmount.toLocaleString();
        
        await CustomerService.addNote(
          order.customerId,
          `CRM Finance: ${actionText} số tiền ${formattedAdditional}đ cho đơn hàng B2B #${orderId}. Dư nợ còn lại của đơn: ${formattedRemaining}đ.`,
          db
        );
      }

      return updatedOrder;
    };

    if (tx) {
      return execute(tx);
    } else {
      return prisma.$transaction(execute, { maxWait: 10000, timeout: 30000 });
    }
  }

  /**
   * Lấy tổng quan báo cáo công nợ toàn hệ thống (B2B)
   */
  static async getDebtSummary() {
    const b2bOrders = await prisma.order.findMany({
      where: {
        orderType: { not: OrderType.RETAIL },
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        debtAmount: true,
      },
    });

    let totalB2BAmount = 0;
    let totalB2BPaid = 0;
    let totalB2BDebt = 0;
    let activeDebtOrdersCount = 0;
    let clearedDebtOrdersCount = 0;

    b2bOrders.forEach((o: any) => {
      totalB2BAmount += o.totalAmount;
      totalB2BPaid += o.paidAmount;
      totalB2BDebt += o.debtAmount;

      if (o.debtAmount > 0) {
        activeDebtOrdersCount++;
      } else {
        clearedDebtOrdersCount++;
      }
    });

    return {
      totalB2BAmount,
      totalB2BPaid,
      totalB2BDebt,
      activeDebtOrdersCount,
      clearedDebtOrdersCount,
      totalOrdersCount: b2bOrders.length,
    };
  }

  /**
   * Thống kê danh sách khách hàng sỉ đang nợ tiền sếp (Xếp hạng dư nợ giảm dần)
   */
  static async getDebtByCustomer(params: {
    page?: number;
    pageSize?: number;
  } = {}) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    // 1. Tìm tất cả khách hàng có đơn hàng sỉ còn nợ tiền (debtAmount > 0)
    const customersWithDebt = await prisma.customer.findMany({
      where: {
        orders: {
          some: {
            debtAmount: { gt: 0 },
          },
        },
      },
      include: {
        orders: {
          where: {
            debtAmount: { gt: 0 },
          },
          select: {
            totalAmount: true,
            paidAmount: true,
            debtAmount: true,
          },
        },
      },
    });

    // 2. Tính toán tổng hợp dư nợ trên từng khách hàng
    const formattedCustomers = customersWithDebt.map((c: any) => {
      let totalAmount = 0;
      let paidAmount = 0;
      let debtAmount = 0;

      c.orders.forEach((o: any) => {
        totalAmount += o.totalAmount;
        paidAmount += o.paidAmount;
        debtAmount += o.debtAmount;
      });

      return {
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        companyName: c.companyName,
        address: c.address,
        debtSummary: {
          totalAmount,
          paidAmount,
          debtAmount,
          debtOrdersCount: c.orders.length,
        },
      };
    });

    // 3. Sắp xếp khách hàng có dư nợ nhiều nhất lên đầu
    formattedCustomers.sort((a: any, b: any) => b.debtSummary.debtAmount - a.debtSummary.debtAmount);

    // 4. Phân trang thủ công mảng đã sắp xếp
    const paginatedData = formattedCustomers.slice(skip, skip + pageSize);
    const totalCount = formattedCustomers.length;

    return {
      data: paginatedData,
      totalCount,
      page,
      pageSize,
    };
  }
}
