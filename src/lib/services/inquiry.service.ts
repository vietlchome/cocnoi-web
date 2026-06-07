import { prisma } from '@/lib/prisma';
import { CustomerService } from './customer.service';
import { OrderService } from './order.service';
import { InventoryService } from './inventory.service';
import { InquiryStatus, CustomerType, InquiryType } from '@prisma/client';
import { normalizePhone } from '@/lib/utils/phone';

export class InquiryService {
  /**
   * Tạo một yêu cầu tư vấn mới (Tự động đồng bộ CRM với hạng B2B_LEAD)
   */
  static async createInquiry(data: {
    customerName: string;
    phone: string;
    email?: string | null;
    companyName?: string | null;
    productId?: string | null;
    quantity?: number;
    note?: string | null;
    source?: string | null;
    inquiryType?: InquiryType;
  }, tx?: any) {
    const client = tx || prisma;
    const normalizedPhone = normalizePhone(data.phone);

    // 1. Đồng bộ khách hàng CRM (Hạng B2B_LEAD cho đơn tư vấn)
    const customer = await CustomerService.getOrCreateCustomer({
      name: data.customerName,
      phone: normalizedPhone,
      email: data.email,
      companyName: data.companyName,
      customerType: 'B2B_LEAD',
    }, client);

    // 2. Tạo yêu cầu tư vấn mới
    const inquiry = await client.orderInquiry.create({
      data: {
        customerName: data.customerName,
        phone: normalizedPhone,
        email: data.email || null,
        companyName: data.companyName || null,
        customerId: customer.id,
        productId: data.productId || null,
        quantity: data.quantity ?? 1,
        note: data.note || null,
        source: data.source || null,
        status: InquiryStatus.PENDING,
        inquiryType: data.inquiryType || InquiryType.RETAIL_B2C,
      },
      include: {
        customer: true,
        product: true,
      },
    });

    // 3. Thêm nhật ký CRM
    await CustomerService.addNote(
      customer.id,
      `Khách hàng gửi yêu cầu tư vấn sỉ mới cho sản phẩm ID "${data.productId || 'N/A'}" (Số lượng: ${data.quantity ?? 1}).`,
      client
    );

    return inquiry;
  }

  /**
   * Lưu nháp / Capture thông tin Lead thời gian thực (Real-time Lead Capture)
   * Sử dụng để bắt thông tin khi khách đang gõ form sỉ để sale bám đuổi (chống rớt lead)
   */
  static async saveDraft(data: {
    customerName: string;
    phone: string;
    email?: string | null;
    companyName?: string | null;
    productId?: string | null;
    quantity?: number;
    note?: string | null;
    source?: string | null;
    inquiryType?: InquiryType;
  }) {
    const normalizedPhone = normalizePhone(data.phone);

    // Cần tối thiểu SĐT để capture CRM
    if (!normalizedPhone) {
      throw new Error('Số điện thoại là bắt buộc để capture lead sỉ!');
    }

    return prisma.$transaction(async (tx: any) => {
      // 1. Lưu khách hàng CRM nháp (B2B_LEAD)
      const customer = await CustomerService.getOrCreateCustomer({
        name: data.customerName || 'Lead Vãng Lai',
        phone: normalizedPhone,
        email: data.email,
        companyName: data.companyName,
        customerType: 'B2B_LEAD',
      }, tx);

      // 2. Tìm yêu cầu tư vấn PENDING gần nhất của khách này cho sản phẩm này để cập nhật đè (Tránh spam nhiều bản ghi nháp)
      const existingPendingInquiry = await tx.orderInquiry.findFirst({
        where: {
          customerId: customer.id,
          productId: data.productId || null,
          status: InquiryStatus.PENDING,
        },
        orderBy: { createdAt: 'desc' },
      });

      if (existingPendingInquiry) {
        // Cập nhật đè dữ liệu nháp mới nhất
        return tx.orderInquiry.update({
          where: { id: existingPendingInquiry.id },
          data: {
            customerName: data.customerName || existingPendingInquiry.customerName,
            email: data.email || existingPendingInquiry.email,
            companyName: data.companyName || existingPendingInquiry.companyName,
            quantity: data.quantity ?? existingPendingInquiry.quantity,
            note: data.note || existingPendingInquiry.note,
            source: data.source || existingPendingInquiry.source,
            inquiryType: data.inquiryType || existingPendingInquiry.inquiryType,
          },
          include: {
            customer: true,
            product: true,
          },
        });
      }

      // 3. Nếu chưa có đơn tư vấn PENDING nào, tạo mới dạng PENDING
      return tx.orderInquiry.create({
        data: {
          customerName: data.customerName || 'Lead Vãng Lai',
          phone: normalizedPhone,
          email: data.email || null,
          companyName: data.companyName || null,
          customerId: customer.id,
          productId: data.productId || null,
          quantity: data.quantity ?? 1,
          note: data.note || null,
          source: data.source || null,
          status: InquiryStatus.PENDING,
          inquiryType: data.inquiryType || InquiryType.RETAIL_B2C,
        },
        include: {
          customer: true,
          product: true,
        },
      });
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Lấy chi tiết yêu cầu tư vấn
   */
  static async getInquiryById(id: string) {
    return prisma.orderInquiry.findUnique({
      where: { id },
      include: {
        customer: true,
        product: true,
        convertedOrder: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Liệt kê danh sách đơn tư vấn (Phân trang, lọc status, tìm kiếm)
   */
  static async listInquiries(params: {
    status?: string;
    query?: string;
    inquiryType?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.status) {
      where.status = params.status as InquiryStatus;
    }

    if (params.inquiryType) {
      where.inquiryType = params.inquiryType as any;
    }

    if (params.query) {
      where.OR = [
        { customerName: { contains: params.query, mode: 'insensitive' } },
        { phone: { contains: params.query, mode: 'insensitive' } },
        { companyName: { contains: params.query, mode: 'insensitive' } },
      ];
    }

    const [data, totalCount] = await prisma.$transaction([
      prisma.orderInquiry.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          product: true,
          convertedOrder: true,
        },
      }),
      prisma.orderInquiry.count({ where }),
    ]);

    return { data, totalCount, page, pageSize };
  }

  /**
   * Cập nhật trạng thái pipeline đơn tư vấn + Ghi chú CRM chăm sóc
   */
  static async updateStatus(id: string, status: 'PENDING' | 'CONTACTED' | 'NEGOTIATING' | 'CONVERTED' | 'CANCELLED') {
    const inquiry = await prisma.orderInquiry.findUnique({
      where: { id },
      select: { status: true, customerId: true },
    });

    if (!inquiry) {
      throw new Error('Không tìm thấy yêu cầu tư vấn cần cập nhật!');
    }

    if (inquiry.status === InquiryStatus.CONVERTED) {
      throw new Error('Yêu cầu tư vấn đã chuyển thành hợp đồng thành công, không được sửa trạng thái!');
    }

    return prisma.$transaction(async (tx: any) => {
      const updated = await tx.orderInquiry.update({
        where: { id },
        data: { status: status as InquiryStatus },
        include: {
          customer: true,
          product: true,
        },
      });

      if (inquiry.customerId) {
        await CustomerService.addNote(
          inquiry.customerId,
          `Trạng thái yêu cầu tư vấn #${id} được cập nhật từ "${inquiry.status}" sang "${status}".`,
          tx
        );
      }

      return updated;
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Chuyển đổi Yêu cầu tư vấn sỉ (Inquiry B2B) thành Hợp đồng sỉ B2B thực tế (Order B2B)
   * Sử dụng Transaction để đảm bảo tính nhất quán tuyệt đối giữa: CRM + Inquiry + Inventory + Order
   */
  static async convertToOrder(data: {
    inquiryId: string;
    shippingAddress?: string | null;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
      originalPrice: number;
    }[];
    discount?: number;
    paidAmount?: number;
    note?: string | null;
  }) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Kiểm tra tồn tại và hợp lệ của Inquiry
      const inquiry = await tx.orderInquiry.findUnique({
        where: { id: data.inquiryId },
        include: { customer: true },
      });

      if (!inquiry) {
        throw new Error('Không tìm thấy yêu cầu tư vấn để chuyển đổi!');
      }

      if (inquiry.status === InquiryStatus.CONVERTED) {
        throw new Error('Yêu cầu tư vấn này đã được chuyển đổi thành hợp đồng sỉ từ trước!');
      }

      // 2. Tạo đơn hàng B2B thông qua OrderService
      // Chú ý: Ta phải chuyển đối tượng transaction tx vào trong OrderService.createB2BOrder để nó chạy chung transaction
      // Do đó, ta sẽ viết logic tạo đơn trực tiếp tại đây hoặc gọi OrderService.createB2BOrder nhưng truyền tx vào.
      // Vì OrderService.createB2BOrder đã tự gọi prisma.$transaction, ta không thể gọi lồng trực tiếp.
      // Thay vào đó, ta sẽ bóc tách logic tạo đơn sỉ B2B để chạy chung tx ở đây:

      let subtotal = 0;
      data.items.forEach((item) => {
        subtotal += item.priceAtPurchase * item.quantity;
      });

      const discount = data.discount ?? 0;
      const totalAmount = Math.max(0, subtotal - discount);
      const paidAmount = data.paidAmount ?? 0;
      const debtAmount = Math.max(0, totalAmount - paidAmount);
      const paymentStatus = debtAmount === 0;

      // Trừ tồn kho
      for (const item of data.items) {
        const hasStock = await InventoryService.checkAvailability(item.productId, item.quantity, tx);
        if (!hasStock) {
          throw new Error(`Sản phẩm ID "${item.productId}" không đủ hàng tồn kho để lập hợp đồng sỉ!`);
        }
        
        // Trừ kho
        await InventoryService.decrementStock(item.productId, item.quantity, tx);
      }

      // CRM Upgrade
      const customer = await CustomerService.getOrCreateCustomer({
        name: inquiry.customerName,
        phone: inquiry.phone,
        email: inquiry.email,
        companyName: inquiry.companyName,
        address: data.shippingAddress,
        customerType: 'B2B_WHOLESALE', // Nâng cấp từ B2B_LEAD lên B2B_WHOLESALE chính thức!
      }, tx);

      // Địa chỉ giao sỉ B2B
      const shippingAddressJSON = JSON.stringify({
        address: data.shippingAddress || '',
        customerName: inquiry.customerName,
        phone: inquiry.phone,
        email: inquiry.email || null,
        companyName: inquiry.companyName || null,
        paymentMethod: 'B2B_CONVERTED',
      });

      // Tạo đơn sỉ B2B
      const order = await tx.order.create({
        data: {
          customerId: customer.id,
          sourceInquiryId: inquiry.id,
          totalAmount,
          shippingAddress: shippingAddressJSON,
          status: 'PENDING',
          paymentStatus,
          paidAmount,
          debtAmount,
          orderType: 'B2B_WHOLESALE',
          discount,
          note: data.note || `Chốt hợp đồng từ đơn tư vấn sỉ #${inquiry.id}`,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              originalPrice: item.originalPrice,
            })),
          },
        },
      });

      // 3. Cập nhật Inquiry: Đánh dấu là CONVERTED và lưu liên kết convertedOrderId
      await tx.orderInquiry.update({
        where: { id: inquiry.id },
        data: {
          status: InquiryStatus.CONVERTED,
          convertedOrderId: order.id,
          convertedAt: new Date(),
        },
      });

      // 4. Ghi nhật ký CRM chăm sóc khách hàng
      await CustomerService.addNote(
        customer.id,
        `Chuyển đổi thành công Đơn tư vấn #${inquiry.id} thành hợp đồng sỉ chính thức #${order.id} (Trị giá: ${totalAmount.toLocaleString()}đ, đã trả: ${paidAmount.toLocaleString()}đ).`,
        tx
      );

      return order;
    }, { maxWait: 10000, timeout: 30000 });
  }
}


