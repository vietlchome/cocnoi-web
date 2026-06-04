'use server';

import { requireAdmin } from '@/lib/auth-helpers';
import { AnalyticsService, DashboardChannel } from '@/lib/services/analytics.service';

// =========================================================
// 1. GET DASHBOARD GENERAL STATISTICS (ADMIN ONLY)
// =========================================================

export async function getDashboardStats(channel: DashboardChannel = 'ALL') {
  await requireAdmin();

  try {
    const stats = await AnalyticsService.getDashboardStats(channel);
    return { success: true, data: stats };
  } catch (error: any) {
    console.error('Lỗi khi lấy chỉ số Dashboard:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy chỉ số thống kê.' };
  }
}

// =========================================================
// 2. GET RECENT ORDERS FEED (ADMIN ONLY)
// =========================================================

export async function getRecentOrders(limit = 5, channel: DashboardChannel = 'ALL') {
  await requireAdmin();

  try {
    const recent = await AnalyticsService.getRecentOrders(limit, channel);
    return { success: true, data: recent };
  } catch (error: any) {
    console.error('Lỗi khi lấy danh sách đơn mới nhất:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy đơn hàng mới.' };
  }
}

// =========================================================
// 3. GET REVENUE BY PERIOD FOR CHARTS (ADMIN ONLY)
// =========================================================

export async function getRevenueByPeriod(
  period: 'daily' | 'weekly' | 'monthly',
  channel: DashboardChannel = 'ALL'
) {
  await requireAdmin();

  try {
    const data = await AnalyticsService.getRevenueByPeriod(period, channel);
    return { success: true, data };
  } catch (error: any) {
    console.error('Lỗi khi lấy doanh thu chu kỳ:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy báo cáo doanh thu.' };
  }
}

// =========================================================
// 4. GET TOP SELLING PRODUCTS (ADMIN ONLY)
// =========================================================

export async function getTopProducts(limit = 5, channel: DashboardChannel = 'ALL') {
  await requireAdmin();

  try {
    const products = await AnalyticsService.getTopProducts(limit, channel);
    return { success: true, data: products };
  } catch (error: any) {
    console.error('Lỗi khi lấy top sản phẩm:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy top sản phẩm.' };
  }
}

// =========================================================
// 5. GET ORDERS COUNT BY STATUS (ADMIN ONLY)
// =========================================================

export async function getOrdersByStatus(channel: DashboardChannel = 'ALL') {
  await requireAdmin();

  try {
    const distribution = await AnalyticsService.getOrdersByStatus(channel);
    return { success: true, data: distribution };
  } catch (error: any) {
    console.error('Lỗi khi lấy cơ cấu đơn hàng theo trạng thái:', error);
    return { success: false, error: error.message || 'Lỗi khi phân nhóm đơn hàng.' };
  }
}

// =========================================================
// 6. GET COCKPIT ALERTS (ADMIN ONLY)
// =========================================================

export async function getCockpitAlerts() {
  await requireAdmin();

  try {
    const alerts = await AnalyticsService.getCockpitAlerts();
    return { success: true, data: alerts };
  } catch (error: any) {
    console.error('Lỗi khi lấy thông báo Cockpit:', error);
    return { success: false, error: error.message || 'Lỗi khi lấy dữ liệu tổng quan.' };
  }
}

// =========================================================
// 7. GET STRATEGIC INSIGHTS (ADMIN ONLY)
// =========================================================

export async function getStrategicInsights(channel: DashboardChannel = 'ALL') {
  await requireAdmin();

  try {
    const insights = await AnalyticsService.getStrategicInsights(channel);
    return { success: true, data: insights };
  } catch (error: any) {
    console.error('Lỗi khi lấy dữ liệu chiến lược:', error);
    return { success: false, error: error.message || 'Lỗi khi tính toán chỉ số chiến lược.' };
  }
}

