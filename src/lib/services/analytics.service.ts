import { prisma } from '@/lib/prisma';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';
import { OrderStatus, OrderType, CustomerType, Visibility } from '@prisma/client';

export type DashboardChannel = 'ALL' | 'RETAIL' | 'B2B';

export class AnalyticsService {
  /**
   * Helper to build OrderType filter based on selected channel
   */
  private static getOrderTypeFilter(channel?: DashboardChannel) {
    if (!channel || channel === 'ALL') {
      return undefined;
    }
    if (channel === 'RETAIL') {
      return { equals: OrderType.RETAIL };
    }
    if (channel === 'B2B') {
      return {
        in: [OrderType.B2B_WHOLESALE, OrderType.B2B_CONSIGNMENT, OrderType.B2B_GIFT],
      };
    }
    return undefined;
  }

  /**
   * Lấy các chỉ số tổng quan (Revenue, Sales Count, CRM Customers, Low Stock Warning)
   * Kèm theo phần trăm tăng trưởng so với tháng trước để hiển thị widget cao cấp
   */
  static async getDashboardStats(channel: DashboardChannel = 'ALL') {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const activeStatuses = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PENDING];
    const orderTypeFilter = this.getOrderTypeFilter(channel);

    // 1. Tính tổng doanh thu & đơn hàng (không tính đơn hủy CANCELLED)
    const currentMonthOrders = await prisma.order.findMany({
      where: {
        status: { in: activeStatuses },
        createdAt: { gte: currentMonthStart },
        ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
      },
      select: { totalAmount: true },
    });

    const lastMonthOrders = await prisma.order.findMany({
      where: {
        status: { in: activeStatuses },
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd },
        ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
      },
      select: { totalAmount: true },
    });

    const currentRevenue = currentMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const lastRevenue = lastMonthOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const currentSalesCount = currentMonthOrders.length;
    const lastSalesCount = lastMonthOrders.length;

    // Tính tăng trưởng doanh thu (%)
    let revenueGrowth = 100;
    if (lastRevenue > 0) {
      revenueGrowth = Math.round(((currentRevenue - lastRevenue) / lastRevenue) * 100);
    } else if (currentRevenue === 0) {
      revenueGrowth = 0;
    }

    // Tính tăng trưởng số đơn hàng (%)
    let salesGrowth = 100;
    if (lastSalesCount > 0) {
      salesGrowth = Math.round(((currentSalesCount - lastSalesCount) / lastSalesCount) * 100);
    } else if (currentSalesCount === 0) {
      salesGrowth = 0;
    }

    // 2. Tổng số khách hàng CRM (phân loại theo kênh lẻ/sỉ)
    let customerWhereClause = {};
    if (channel === 'RETAIL') {
      customerWhereClause = {
        customerType: { in: [CustomerType.RETAIL_LEAD, CustomerType.RETAIL_BUYER] },
      };
    } else if (channel === 'B2B') {
      customerWhereClause = {
        customerType: {
          in: [
            CustomerType.B2B_LEAD,
            CustomerType.B2B_WHOLESALE,
            CustomerType.B2B_CONSIGNMENT,
            CustomerType.B2B_GIFT,
          ],
        },
      };
    }
    const customerCount = await prisma.customer.count({
      where: customerWhereClause,
    });

    // 3. Số sản phẩm sắp hết hàng (phân loại theo sản phẩm bán lẻ công khai/sản phẩm sỉ B2B_ONLY)
    let productWhereClause: any = {
      isActive: true,
      stockQuantity: { lte: LOW_STOCK_THRESHOLD },
    };
    if (channel === 'RETAIL') {
      productWhereClause.visibility = Visibility.PUBLIC;
    } else if (channel === 'B2B') {
      productWhereClause.visibility = Visibility.B2B_ONLY;
    }
    const lowStockCount = await prisma.product.count({
      where: productWhereClause,
    });

    // 4. Doanh thu lũy kế trọn đời (Tất cả đơn hàng từ trước đến nay)
    const allActiveOrders = await prisma.order.findMany({
      where: {
        status: { in: activeStatuses },
        ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
      },
      select: { totalAmount: true },
    });
    const lifetimeRevenue = allActiveOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    return {
      revenue: currentRevenue,
      revenueGrowth,
      salesCount: currentSalesCount,
      salesGrowth,
      customerCount,
      lowStockCount,
      lifetimeRevenue,
    };
  }

  /**
   * Lấy danh sách hóa đơn mới nhất (Recent Orders)
   */
  static async getRecentOrders(limit = 5, channel: DashboardChannel = 'ALL') {
    const orderTypeFilter = this.getOrderTypeFilter(channel);
    return prisma.order.findMany({
      take: limit,
      where: orderTypeFilter ? { orderType: orderTypeFilter } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        customer: true,
      },
    });
  }

  /**
   * Thống kê doanh thu theo chu kỳ phục vụ vẽ biểu đồ đường/cột (Recharts)
   */
  static async getRevenueByPeriod(period: 'daily' | 'weekly' | 'monthly', channel: DashboardChannel = 'ALL') {
    const now = new Date();
    const result: { label: string; revenue: number; ordersCount: number }[] = [];
    const orderTypeFilter = this.getOrderTypeFilter(channel);

    if (period === 'daily') {
      // 7 ngày qua
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
        const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

        const orders = await prisma.order.findMany({
          where: {
            status: { not: OrderStatus.CANCELLED },
            createdAt: { gte: startOfDay, lte: endOfDay },
            ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
          },
          select: { totalAmount: true },
        });

        const dayRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        
        // Định dạng nhãn VD: "25/05"
        const label = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

        result.push({
          label,
          revenue: dayRevenue,
          ordersCount: orders.length,
        });
      }
    } else if (period === 'weekly') {
      // 4 tuần qua
      for (let i = 3; i >= 0; i--) {
        const startOfWeek = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
        startOfWeek.setHours(0, 0, 0, 0);
        
        const endOfWeek = new Date(startOfWeek.getTime() + 7 * 24 * 60 * 60 * 1000 - 1000);

        const orders = await prisma.order.findMany({
          where: {
            status: { not: OrderStatus.CANCELLED },
            createdAt: { gte: startOfWeek, lte: endOfWeek },
            ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
          },
          select: { totalAmount: true },
        });

        const weekRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const label = `Tuần ${4 - i}`;

        result.push({
          label,
          revenue: weekRevenue,
          ordersCount: orders.length,
        });
      }
    } else if (period === 'monthly') {
      // 6 tháng qua
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
        const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

        const orders = await prisma.order.findMany({
          where: {
            status: { not: OrderStatus.CANCELLED },
            createdAt: { gte: startOfMonth, lte: endOfMonth },
            ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
          },
          select: { totalAmount: true },
        });

        const monthRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
        const label = `Tháng ${date.getMonth() + 1}`;

        result.push({
          label,
          revenue: monthRevenue,
          ordersCount: orders.length,
        });
      }
    }

    return result;
  }

  /**
   * Thống kê Top sản phẩm bán chạy nhất
   */
  static async getTopProducts(limit = 5, channel: DashboardChannel = 'ALL') {
    const orderTypeFilter = this.getOrderTypeFilter(channel);

    // 1. Lấy tất cả OrderItem của các đơn hàng không bị CANCELLED
    const orderItems = await prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: OrderStatus.CANCELLED },
          ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
        },
      },
      include: {
        product: true,
      },
    });

    // 2. Nhóm và tính toán số lượng bán + doanh thu theo từng sản phẩm
    const productStatsMap: {
      [productId: string]: {
        name: string;
        sku: string;
        price: number;
        coverImage: string | null;
        soldQuantity: number;
        totalRevenue: number;
      };
    } = {};

    orderItems.forEach((item) => {
      if (!item.product) return;

      const pId = item.productId;
      const imagesArr = item.product.images || [];
      const coverImage = imagesArr[0] || null;

      if (!productStatsMap[pId]) {
        productStatsMap[pId] = {
          name: item.product.name,
          sku: item.product.sku || 'N/A',
          price: item.product.price,
          coverImage,
          soldQuantity: 0,
          totalRevenue: 0,
        };
      }

      productStatsMap[pId].soldQuantity += item.quantity;
      productStatsMap[pId].totalRevenue += item.priceAtPurchase * item.quantity;
    });

    // 3. Chuyển Map thành Array và sắp xếp theo số lượng bán giảm dần
    const sortedProducts = Object.values(productStatsMap).sort(
      (a, b) => b.soldQuantity - a.soldQuantity
    );

    return sortedProducts.slice(0, limit);
  }

  /**
   * Thống kê số lượng đơn hàng theo Trạng Thái phục vụ Pie Chart
   */
  static async getOrdersByStatus(channel: DashboardChannel = 'ALL') {
    const statuses = Object.values(OrderStatus);
    const result: { status: string; count: number; name: string }[] = [];
    const orderTypeFilter = this.getOrderTypeFilter(channel);

    const statusTranslations: { [key: string]: string } = {
      PENDING: 'Chờ xử lý',
      PROCESSING: 'Đang chuẩn bị',
      SHIPPED: 'Đang giao hàng',
      DELIVERED: 'Đã giao hàng',
      CANCELLED: 'Đã hủy đơn',
    };

    for (const status of statuses) {
      const count = await prisma.order.count({
        where: {
          status,
          ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
        },
      });

      result.push({
        status,
        name: statusTranslations[status] || status,
        count,
      });
    }

    return result;
  }

  /**
   * Operational Cockpit Alerts: Dành cho trang Overview (Trang chủ Admin)
   */
  static async getCockpitAlerts() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // 1. Doanh thu hôm nay & Hôm qua
    const todayOrders = await prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PENDING] },
        createdAt: { gte: startOfDay },
      },
      select: { totalAmount: true },
    });
    const todayRevenue = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    const startOfYesterday = new Date(startOfDay.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayOrders = await prisma.order.findMany({
      where: {
        status: { in: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PENDING] },
        createdAt: { gte: startOfYesterday, lt: startOfDay },
      },
      select: { totalAmount: true },
    });
    const yesterdayRevenue = yesterdayOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // 2. Cảnh báo thời gian thực (Time-sensitive Alerts)
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgoAlert = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // - Đơn B2C chưa đóng gói quá 24h
    const urgentRetailOrdersCount = await prisma.order.count({
      where: { 
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
        orderType: 'RETAIL',
        createdAt: { lt: yesterday }
      },
    });

    // - Đơn B2C chờ xử lý chung (Dành cho Sidebar Badge)
    const pendingRetailOrdersCount = await prisma.order.count({
      where: { 
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
        orderType: 'RETAIL',
      },
    });

    // - Đơn B2B chờ xử lý chung
    const pendingB2BOrdersCount = await prisma.order.count({
      where: { 
        status: { in: [OrderStatus.PENDING, OrderStatus.PROCESSING] },
        orderType: { in: ['B2B_WHOLESALE', 'B2B_CONSIGNMENT', 'B2B_GIFT'] }
      },
    });

    // - Yêu cầu tư vấn mới
    const pendingInquiriesCount = await prisma.orderInquiry.count({
      where: { status: 'PENDING' },
    });

    // - Khách sỉ B2B đang "Thương lượng" quá 3 ngày chưa chốt
    const staleInquiriesCount = await prisma.orderInquiry.count({
      where: { 
        status: 'NEGOTIATING',
        updatedAt: { lt: threeDaysAgo }
      },
    });

    // - Công nợ B2B quá hạn 30 ngày (Dòng tiền bị kẹt)
    const overdueDebtOrdersCount = await prisma.order.count({
      where: {
        debtAmount: { gt: 0 },
        createdAt: { lt: thirtyDaysAgoAlert }
      }
    });

    // - Sản phẩm cảnh báo tồn kho toàn hệ thống
    const lowStockCount = await prisma.product.count({
      where: {
        isActive: true,
        stockQuantity: { lte: LOW_STOCK_THRESHOLD },
      },
    });

    // - Đánh giá 1-2 sao cần CSKH can thiệp
    const badReviewsCount = await prisma.review.count({
      where: { rating: { lte: 2 } },
    });

    return {
      todayRevenue,
      yesterdayRevenue,
      urgentRetailOrdersCount,
      pendingRetailOrdersCount,
      pendingB2BOrdersCount,
      pendingInquiriesCount,
      staleInquiriesCount,
      overdueDebtOrdersCount,
      lowStockCount,
      badReviewsCount,
    };
  }

  /**
   * Strategic Insights: Dành cho trang Phân tích (Analytics)
   */
  static async getStrategicInsights(channel: DashboardChannel = 'ALL') {
    const activeStatuses = [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED, OrderStatus.PENDING];
    const orderTypeFilter = this.getOrderTypeFilter(channel);

    // 1. Tất cả đơn hàng hợp lệ
    const allOrders = await prisma.order.findMany({
      where: {
        status: { in: activeStatuses },
        ...(orderTypeFilter ? { orderType: orderTypeFilter } : {}),
      },
      include: {
        items: true,
      }
    });

    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // ---------------------------------------------------------
    // A. CUSTOMER INSIGHTS
    // ---------------------------------------------------------
    // AOV (Average Order Value)
    const aov = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Tỉ lệ Khách mới vs Khách quay lại
    const customerOrderCounts: Record<string, number> = {};
    let newCustomers = 0;
    let returningCustomers = 0;

    allOrders.forEach(o => {
      if (o.customerId) {
        customerOrderCounts[o.customerId] = (customerOrderCounts[o.customerId] || 0) + 1;
      }
    });
    
    Object.values(customerOrderCounts).forEach(count => {
      if (count === 1) newCustomers++;
      if (count > 1) returningCustomers++;
    });

    const totalCustomersWithOrders = newCustomers + returningCustomers;
    const returningRate = totalCustomersWithOrders > 0 
      ? Math.round((returningCustomers / totalCustomersWithOrders) * 100) 
      : 0;

    // --- LTV (Lifetime Value) ---
    const ltv = totalCustomersWithOrders > 0 ? Math.round(totalRevenue / totalCustomersWithOrders) : 0;

    // --- Repurchase Cycle (Chu kỳ mua lặp) ---
    let totalDaysBetweenOrders = 0;
    let returningInstances = 0;
    
    // Group orders by customerId
    const ordersByCustomer: Record<string, typeof allOrders> = {};
    allOrders.forEach(o => {
      if (o.customerId) {
        if (!ordersByCustomer[o.customerId]) ordersByCustomer[o.customerId] = [];
        ordersByCustomer[o.customerId].push(o);
      }
    });

    Object.values(ordersByCustomer).forEach(customerOrders => {
      if (customerOrders.length > 1) {
        // Sort by date ascending
        customerOrders.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        for (let i = 1; i < customerOrders.length; i++) {
          const diffTime = Math.abs(customerOrders[i].createdAt.getTime() - customerOrders[i - 1].createdAt.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          totalDaysBetweenOrders += diffDays;
          returningInstances++;
        }
      }
    });

    const repurchaseCycleDays = returningInstances > 0 ? Math.round(totalDaysBetweenOrders / returningInstances) : 0;

    // --- Tỉ trọng Gốm Custom (B2B) vs Có sẵn (Retail) ---
    const customRevenue = allOrders.filter(o => o.orderType === 'B2B_WHOLESALE' || o.orderType === 'B2B_CONSIGNMENT' || o.orderType === 'B2B_GIFT').reduce((sum, o) => sum + o.totalAmount, 0);
    const customSplit = totalRevenue > 0 ? Math.round((customRevenue / totalRevenue) * 100) : 0;

    // ---------------------------------------------------------
    // B. PRODUCT INTELLIGENCE
    // ---------------------------------------------------------
    // Tốc độ tiêu thụ dự kiến (Inventory Velocity) dựa trên 30 ngày qua
    const thirtyDaysAgo = new Date(new Date().getTime() - 30 * 24 * 60 * 60 * 1000);
    const recentOrders = allOrders.filter(o => o.createdAt >= thirtyDaysAgo);
    
    const productSalesLast30Days: Record<string, number> = {};
    recentOrders.forEach(o => {
      o.items.forEach(item => {
        if (item.productId) {
          productSalesLast30Days[item.productId] = (productSalesLast30Days[item.productId] || 0) + item.quantity;
        }
      });
    });

    // Lấy thông tin tồn kho
    const productsInDB = await prisma.product.findMany({
      where: { id: { in: Object.keys(productSalesLast30Days) } },
      select: { id: true, name: true, stockQuantity: true }
    });

    const inventoryVelocity = productsInDB.map(p => {
      const soldIn30Days = productSalesLast30Days[p.id];
      const dailySalesRate = soldIn30Days / 30;
      const daysUntilStockout = dailySalesRate > 0 ? Math.round(p.stockQuantity / dailySalesRate) : 999;
      return {
        id: p.id,
        name: p.name,
        stockQuantity: p.stockQuantity,
        soldLast30Days: soldIn30Days,
        daysUntilStockout
      };
    }).filter(p => p.daysUntilStockout > 0 && p.daysUntilStockout <= 60) // Cảnh báo nung gốm: hết hàng trong <= 60 ngày
      .sort((a, b) => a.daysUntilStockout - b.daysUntilStockout)
      .slice(0, 6);

    // ---------------------------------------------------------
    // C. EFFICIENCY & PROMOTIONS
    // ---------------------------------------------------------
    // Tỉ lệ "Nghiện" khuyến mãi (Promotion Penetration)
    const promotedOrders = allOrders.filter(o => (o.discount || 0) > 0).length;
    const promotionPenetration = totalOrders > 0 ? Math.round((promotedOrders / totalOrders) * 100) : 0;

    // Tỉ lệ chuyển đổi B2B
    let b2bConversionRate = 0;
    if (channel !== 'RETAIL') {
      const allInquiries = await prisma.orderInquiry.count();
      const convertedInquiries = await prisma.orderInquiry.count({
        where: { status: 'CONVERTED' }
      });
      b2bConversionRate = allInquiries > 0 ? Math.round((convertedInquiries / allInquiries) * 100) : 0;
    }

    // --- Công nợ (Debt Ratio) ---
    const totalDebt = allOrders.reduce((sum, o) => sum + (o.debtAmount || 0), 0);
    const debtRatio = totalRevenue > 0 ? Math.round((totalDebt / totalRevenue) * 100) : 0;

    // --- Tỉ lệ vỡ hỏng (Breakage Rate - Giả lập từ đánh giá xấu) ---
    const badReviews = await prisma.review.count({ where: { rating: { lte: 2 } } });
    const totalReviews = await prisma.review.count();
    const breakageRate = totalReviews > 0 ? Math.round((badReviews / totalReviews) * 100) : 0;

    return {
      customerInsights: {
        aov,
        newCustomers,
        returningCustomers,
        returningRate,
        ltv,
        repurchaseCycleDays,
        customSplit
      },
      productIntelligence: {
        inventoryVelocity,
        breakageRate
      },
      efficiency: {
        promotionPenetration,
        b2bConversionRate,
        debtRatio
      }
    };
  }
}

