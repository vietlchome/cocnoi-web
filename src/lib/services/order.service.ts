import { prisma } from '@/lib/prisma';
import { SHIPPING_FEE, FREE_SHIPPING_THRESHOLD } from '@/lib/constants';
import { InventoryService } from './inventory.service';
import { CustomerService } from './customer.service';
import { OrderStatus, OrderType } from '@prisma/client';

export class OrderService {
  /**
   * Tính toán phí giao hàng tiêu chuẩn (Miễn phí cho đơn hàng >= 1,000,000đ)
   */
  static calculateShippingFee(subtotal: number): number {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  }

  /**
   * Xác thực lại giá bán từ Database để chống gian lận từ Client-side (Anti-Spoofing)
   */
  static async verifyPrices(items: { productId: string; quantity: number }[], tx?: any) {
    const client = tx || prisma;
    const verifiedItems: any[] = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await client.product.findUnique({
        where: { id: item.productId },
        select: { price: true, name: true, isActive: true },
      });

      if (!product || !product.isActive) {
        throw new Error(`Sản phẩm "${item.productId}" không tồn tại hoặc đã ngừng kinh doanh!`);
      }

      const originalPrice = product.price;
      const itemSubtotal = originalPrice * item.quantity;
      subtotal += itemSubtotal;

      verifiedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: originalPrice,
        originalPrice: originalPrice,
      });
    }

    return { verifiedItems, subtotal };
  }

  /**
   * Tạo đơn hàng bán lẻ B2C (Khách tự mua trên Web)
   * Sử dụng $transaction để đảm bảo trừ kho và tạo đơn được diễn ra đồng thời, an toàn tuyệt đối
   */
  static async createRetailOrder(data: {
    customerName: string;
    phone: string;
    email?: string | null;
    address: string;
    note?: string | null;
    paymentMethod: 'COD' | 'QR';
    items: { productId: string; quantity: number }[];
  }) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Xác thực giá phía Server (Anti-Spoofing)
      const { verifiedItems, subtotal } = await this.verifyPrices(data.items, tx);
      const shippingFee = this.calculateShippingFee(subtotal);
      const totalAmount = subtotal + shippingFee;

      // 2. Kiểm tra tồn kho & Trừ kho từng sản phẩm
      for (const item of verifiedItems) {
        const hasStock = await InventoryService.checkAvailability(item.productId, item.quantity, tx);
        if (!hasStock) {
          throw new Error('Số lượng tồn kho của một số sản phẩm không đủ để hoàn tất đơn hàng!');
        }
        await InventoryService.decrementStock(item.productId, item.quantity, tx);
      }

      // 3. Tạo/Cập nhật khách hàng trong CRM (Cấp: RETAIL_BUYER)
      const customer = await CustomerService.getOrCreateCustomer({
        name: data.customerName,
        phone: data.phone,
        email: data.email,
        address: data.address,
        customerType: 'RETAIL_BUYER',
      }, tx);

      // 4. Serialize thông tin địa chỉ giao nhận + phương thức thanh toán sang JSON
      const shippingAddressJSON = JSON.stringify({
        address: data.address,
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        paymentMethod: data.paymentMethod,
      });

      // 5. Tạo đơn hàng trong DB
      return tx.order.create({
        data: {
          customerId: customer.id,
          totalAmount,
          shippingAddress: shippingAddressJSON,
          status: OrderStatus.PENDING,
          paymentStatus: false,
          paidAmount: 0,
          debtAmount: 0, // Khách lẻ không ghi nợ sỉ
          orderType: OrderType.RETAIL,
          discount: 0,
          note: data.note || null,
          items: {
            create: verifiedItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Tạo đơn hàng B2B sỉ thỏa thuận (Do Admin tạo tay trên trang quản trị)
   */
  static async createB2BOrder(data: {
    customerId?: string | null;
    customerName: string;
    phone: string;
    email?: string | null;
    companyName?: string | null;
    address?: string | null;
    orderType: 'B2B_WHOLESALE' | 'B2B_CONSIGNMENT' | 'B2B_GIFT';
    discount?: number;
    paidAmount?: number;
    note?: string | null;
    items: {
      productId: string;
      quantity: number;
      priceAtPurchase: number;
      originalPrice: number;
    }[];
  }) {
    return prisma.$transaction(async (tx: any) => {
      // 1. Tính toán giá trị đơn hàng B2B
      let subtotal = 0;
      data.items.forEach((item) => {
        subtotal += item.priceAtPurchase * item.quantity;
      });

      const discount = data.discount ?? 0;
      const totalAmount = Math.max(0, subtotal - discount);
      const paidAmount = data.paidAmount ?? 0;
      const debtAmount = Math.max(0, totalAmount - paidAmount);
      const paymentStatus = debtAmount === 0;

      // 2. Kiểm tra & Trừ kho
      for (const item of data.items) {
        const hasStock = await InventoryService.checkAvailability(item.productId, item.quantity, tx);
        if (!hasStock) {
          throw new Error('Số lượng sản phẩm trong kho không đủ để tạo đơn sỉ!');
        }
        await InventoryService.decrementStock(item.productId, item.quantity, tx);
      }

      // 3. Đồng bộ phân cấp khách hàng tương ứng với kiểu đơn B2B
      const customer = await CustomerService.getOrCreateCustomer({
        name: data.customerName,
        phone: data.phone,
        email: data.email,
        companyName: data.companyName,
        address: data.address,
        customerType: data.orderType as any,
      }, tx);

      // 4. Serialize địa chỉ giao nhận B2B
      const shippingAddressJSON = JSON.stringify({
        address: data.address || '',
        customerName: data.customerName,
        phone: data.phone,
        email: data.email || null,
        companyName: data.companyName || null,
        paymentMethod: 'B2B_DIRECT',
      });

      // 5. Tạo đơn hàng
      return tx.order.create({
        data: {
          customerId: customer.id,
          totalAmount,
          shippingAddress: shippingAddressJSON,
          status: OrderStatus.PENDING,
          paymentStatus,
          paidAmount,
          debtAmount,
          orderType: data.orderType as OrderType,
          discount,
          note: data.note || null,
          items: {
            create: data.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              priceAtPurchase: item.priceAtPurchase,
              originalPrice: item.originalPrice,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
    }, { maxWait: 10000, timeout: 30000 });
  }

  /**
   * Lấy chi tiết đơn hàng
   */
  static async getOrderById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });
  }

  /**
   * Liệt kê danh sách đơn hàng (Có phân trang, bộ lọc status, loại đơn hàng)
   */
  static async listOrders(params: {
    status?: string;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (params.status) {
      where.status = params.status as OrderStatus;
    }

    if (params.type) {
      if (params.type === 'B2B') {
        where.orderType = { not: OrderType.RETAIL }; // Toàn bộ đơn sỉ
      } else {
        where.orderType = params.type as OrderType;
      }
    }

    const [data, totalCount] = await prisma.$transaction([
      prisma.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: true,
          items: {
            include: {
              product: true,
            },
          },
        },
      }),
      prisma.order.count({ where }),
    ]);

    return { data, totalCount, page, pageSize };
  }

  /**
   * Cập nhật trạng thái đơn hàng
   */
  static async updateOrderStatus(id: string, status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED') {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!order) {
      throw new Error('Không tìm thấy đơn hàng để cập nhật trạng thái!');
    }

    if (order.status === OrderStatus.CANCELLED) {
      throw new Error('Đơn hàng đã hủy không thể cập nhật sang trạng thái khác!');
    }

    // Nếu chuyển sang hủy, chạy qua cancelOrder để hoàn kho
    if (status === 'CANCELLED') {
      return this.cancelOrder(id);
    }

    return prisma.order.update({
      where: { id },
      data: { status: status as OrderStatus },
      include: {
        customer: true,
      },
    });
  }

  /**
   * Hủy đơn hàng và hoàn trả lại số lượng tồn kho tự động
   */
  static async cancelOrder(id: string) {
    return prisma.$transaction(async (tx: any) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error('Không tìm thấy đơn hàng cần hủy!');
      }

      if (order.status === OrderStatus.CANCELLED) {
        return order; // Đã hủy từ trước
      }

      // Hoàn lại kho cho từng sản phẩm của đơn hàng
      for (const item of order.items) {
        await InventoryService.incrementStock(item.productId, item.quantity, tx);
      }

      return tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
        include: {
          customer: true,
        },
      });
    }, { maxWait: 10000, timeout: 30000 });
  }
}
