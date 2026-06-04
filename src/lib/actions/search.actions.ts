"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { Order, Product, Customer, OrderInquiry } from "@prisma/client";

export interface GlobalSearchResult {
  id: string;
  type: "ORDER" | "PRODUCT" | "CUSTOMER" | "INQUIRY";
  title: string;
  subtitle: string;
  href: string;
  status?: string;
  date?: Date;
}

export async function globalSearch(query: string): Promise<GlobalSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return [];
  }

  await requireAdmin();

  const searchTerm = query.trim();

  const [orders, products, customers, inquiries] = await Promise.all([
    prisma.order.findMany({
      where: {
        OR: [
          { id: { contains: searchTerm, mode: "insensitive" } },
        ]
      },
      include: { customer: true },
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
    
    prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { sku: { contains: searchTerm, mode: "insensitive" } },
        ]
      },
      take: 5,
    }),

    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm } },
          { email: { contains: searchTerm, mode: "insensitive" } },
        ]
      },
      take: 5,
    }),

    prisma.orderInquiry.findMany({
      where: {
        OR: [
          { customerName: { contains: searchTerm, mode: "insensitive" } },
          { phone: { contains: searchTerm } },
          { companyName: { contains: searchTerm, mode: "insensitive" } },
        ]
      },
      take: 5,
      orderBy: { createdAt: "desc" }
    })
  ]);

  const results: GlobalSearchResult[] = [];

  // Chuẩn hóa kết quả Đơn hàng
  orders.forEach((o: any) => {
    results.push({
      id: o.id,
      type: "ORDER",
      title: `Đơn hàng #${o.id.slice(-6).toUpperCase()}`,
      subtitle: o.customer?.name ? `Khách hàng: ${o.customer.name}` : `Giá trị: ${o.totalAmount.toLocaleString('vi-VN')}đ`,
      href: `/admin/orders/${o.orderType === 'RETAIL' ? 'retail' : 'b2b'}?search=${o.id}`,
      status: o.status,
      date: o.createdAt
    });
  });

  // Chuẩn hóa kết quả Sản phẩm
  products.forEach((p: Product) => {
    results.push({
      id: p.id,
      type: "PRODUCT",
      title: p.name,
      subtitle: p.sku ? `SKU: ${p.sku} - Tồn kho: ${p.stockQuantity}` : `Tồn kho: ${p.stockQuantity}`,
      href: `/admin/products/${p.id}`,
      status: p.isActive ? "Đang bán" : "Ngừng bán"
    });
  });

  // Chuẩn hóa kết quả Khách hàng
  customers.forEach((c: Customer) => {
    results.push({
      id: c.id,
      type: "CUSTOMER",
      title: c.name,
      subtitle: `${c.phone} ${c.companyName ? `- ${c.companyName}` : ''}`,
      href: `/admin/customers/${c.id}`,
      status: c.customerType
    });
  });

  // Chuẩn hóa kết quả Yêu cầu tư vấn
  inquiries.forEach((i: OrderInquiry) => {
    results.push({
      id: i.id,
      type: "INQUIRY",
      title: `Yêu cầu từ: ${i.customerName}`,
      subtitle: `${i.phone} ${i.companyName ? `- ${i.companyName}` : ''}`,
      href: `/admin/inquiries?search=${i.phone}`,
      status: i.status,
      date: i.createdAt
    });
  });

  return results;
}
