import { prisma } from '@/lib/prisma';
import { normalizePhone } from '@/lib/utils/phone';
import { TIER_RANK } from '@/lib/constants';
import { CustomerType } from '@prisma/client';

export class CustomerService {
  // ---------------------------------------------------------
  // CORE CRM LOGIC
  // ---------------------------------------------------------

  /**
   * Tính toán và nâng hạng khách hàng (Chỉ nâng cấp, không bao giờ hạ cấp)
   */
  static resolveCustomerType(existingType: string, newType?: string): CustomerType {
    if (!newType) return existingType as CustomerType;
    const existingRank = TIER_RANK[existingType] || 0;
    const newRank = TIER_RANK[newType] || 0;
    
    // Nếu hạng mới cao hơn hạng cũ, cập nhật lên hạng mới
    return newRank > existingRank ? (newType as CustomerType) : (existingType as CustomerType);
  }

  /**
   * Lấy thông tin khách hàng hiện tại hoặc tạo mới nếu chưa tồn tại (Dùng khi checkout/điền form)
   */
  static async getOrCreateCustomer(data: {
    name: string;
    phone: string;
    email?: string | null;
    companyName?: string | null;
    address?: string | null;
    customerType?: 'RETAIL_LEAD' | 'RETAIL_BUYER' | 'B2B_LEAD' | 'B2B_WHOLESALE' | 'B2B_CONSIGNMENT' | 'B2B_GIFT';
  }, tx?: any) {
    const client = tx || prisma;
    const normalizedPhone = normalizePhone(data.phone);

    // 1. Tìm kiếm khách hàng theo SĐT duy nhất
    const existingCustomer = await client.customer.findUnique({
      where: { phone: normalizedPhone },
    });

    if (existingCustomer) {
      // 2. Nếu đã tồn tại, tính toán nâng cấp phân cấp (customerType)
      const resolvedType = this.resolveCustomerType(
        existingCustomer.customerType,
        data.customerType
      );

      // Cập nhật thông tin nếu có thông tin mới hơn (giữ nguyên email/address cũ nếu thông tin mới trống)
      return client.customer.update({
        where: { id: existingCustomer.id },
        data: {
          name: data.name || existingCustomer.name,
          email: data.email || existingCustomer.email,
          companyName: data.companyName || existingCustomer.companyName,
          address: data.address || existingCustomer.address,
          customerType: resolvedType,
        },
      });
    }

    // 3. Nếu chưa tồn tại, tiến hành tạo mới sạch sẽ
    return client.customer.create({
      data: {
        name: data.name,
        phone: normalizedPhone,
        email: data.email || null,
        companyName: data.companyName || null,
        address: data.address || null,
        customerType: (data.customerType as CustomerType) || CustomerType.RETAIL_LEAD,
      },
    });
  }

  // ---------------------------------------------------------
  // CRUD OPERATIONS
  // ---------------------------------------------------------

  /**
   * Tạo khách hàng thủ công (Admin thêm tay)
   */
  static async createCustomer(data: {
    name: string;
    phone: string;
    email?: string | null;
    companyName?: string | null;
    address?: string | null;
    taxCode?: string | null;
    customerType?: 'RETAIL_LEAD' | 'RETAIL_BUYER' | 'B2B_LEAD' | 'B2B_WHOLESALE' | 'B2B_CONSIGNMENT' | 'B2B_GIFT';
  }) {
    const normalizedPhone = normalizePhone(data.phone);

    // Kiểm tra trùng SĐT
    const existing = await prisma.customer.findUnique({
      where: { phone: normalizedPhone },
    });
    if (existing) {
      throw new Error(`Số điện thoại "${data.phone}" đã được liên kết với một khách hàng khác trên hệ thống CRM!`);
    }

    return prisma.customer.create({
      data: {
        name: data.name,
        phone: normalizedPhone,
        email: data.email || null,
        companyName: data.companyName || null,
        address: data.address || null,
        taxCode: data.taxCode || null,
        customerType: (data.customerType as CustomerType) || CustomerType.RETAIL_LEAD,
      },
    });
  }

  /**
   * Cập nhật thông tin khách hàng
   */
  static async updateCustomer(
    id: string,
    data: Partial<{
      name: string;
      phone: string;
      email: string | null;
      companyName: string | null;
      address: string | null;
      taxCode: string | null;
      customerType: 'RETAIL_LEAD' | 'RETAIL_BUYER' | 'B2B_LEAD' | 'B2B_WHOLESALE' | 'B2B_CONSIGNMENT' | 'B2B_GIFT';
    }>
  ) {
    const existingCustomer = await prisma.customer.findUnique({ where: { id } });
    if (!existingCustomer) {
      throw new Error('Không tìm thấy khách hàng cần cập nhật!');
    }

    const updateData: any = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.companyName !== undefined) updateData.companyName = data.companyName || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.taxCode !== undefined) updateData.taxCode = data.taxCode || null;
    if (data.customerType !== undefined) updateData.customerType = data.customerType as CustomerType;

    // Kiểm tra SĐT nếu thay đổi
    if (data.phone !== undefined) {
      const normalizedPhone = normalizePhone(data.phone);
      if (normalizedPhone !== existingCustomer.phone) {
        const duplicate = await prisma.customer.findUnique({
          where: { phone: normalizedPhone },
        });
        if (duplicate) {
          throw new Error(`Số điện thoại "${data.phone}" đã trùng với một khách hàng khác!`);
        }
        updateData.phone = normalizedPhone;
      }
    }

    return prisma.customer.update({
      where: { id },
      data: updateData,
    });
  }

  /**
   * Xóa khách hàng (Hệ thống cascade sẽ tự động xóa CustomerNote liên kết)
   */
  static async deleteCustomer(id: string) {
    return prisma.customer.delete({ where: { id } });
  }

  /**
   * Lấy chi tiết khách hàng và toàn bộ lịch sử giao dịch (Đơn hàng, Yêu cầu tư vấn, Ghi chú)
   */
  static async getCustomerById(id: string) {
    return prisma.customer.findUnique({
      where: { id },
      include: {
        notes: {
          orderBy: { createdAt: 'desc' },
        },
        orders: {
          orderBy: { createdAt: 'desc' },
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
        inquiries: {
          orderBy: { createdAt: 'desc' },
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Liệt kê danh sách khách hàng (Có phân trang, lọc theo phân cấp và tìm kiếm)
   */
  static async listCustomers(params: {
    query?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.query) {
      where.OR = [
        { name: { contains: params.query, mode: 'insensitive' } },
        { phone: { contains: params.query, mode: 'insensitive' } },
        { email: { contains: params.query, mode: 'insensitive' } },
        { companyName: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    if (params.type) {
      where.customerType = params.type as CustomerType;
    }

    const [data, totalCount] = await prisma.$transaction([
      prisma.customer.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where }),
    ]);

    return { data, totalCount, page, pageSize };
  }

  // ---------------------------------------------------------
  // NOTE & FINANCE OPERATIONS
  // ---------------------------------------------------------

  /**
   * Thêm ghi chú/nhật ký chăm sóc khách hàng
   */
  static async addNote(customerId: string, content: string, tx?: any) {
    const client = tx || prisma;
    const customer = await client.customer.findUnique({ where: { id: customerId } });
    if (!customer) {
      throw new Error('Không tìm thấy khách hàng cần thêm ghi chú!');
    }

    return client.customerNote.create({
      data: {
        customerId,
        content,
      },
    });
  }

  /**
   * Tổng hợp công nợ của khách hàng (Đơn hàng B2B)
   */
  static async getCustomerDebtSummary(customerId: string) {
    const orders = await prisma.order.findMany({
      where: {
        customerId,
        orderType: { not: 'RETAIL' }, // Lọc bỏ đơn bán lẻ
      },
      select: {
        totalAmount: true,
        paidAmount: true,
        debtAmount: true,
      },
    });

    let totalAmount = 0;
    let paidAmount = 0;
    let debtAmount = 0;

    orders.forEach((o: any) => {
      totalAmount += o.totalAmount;
      paidAmount += o.paidAmount;
      debtAmount += o.debtAmount;
    });

    return { totalAmount, paidAmount, debtAmount, orderCount: orders.length };
  }
}
