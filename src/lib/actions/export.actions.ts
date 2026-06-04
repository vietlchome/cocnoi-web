"use server";

import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

export async function exportOrdersToCsv() {
  await requireAdmin();

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        },
        customer: true,
      },
      orderBy: { createdAt: "desc" }
    });

    // Tạo header cho CSV
    const headers = [
      "Mã đơn hàng",
      "Ngày đặt",
      "Loại đơn (B2B/Lẻ)",
      "Trạng thái",
      "Trạng thái thanh toán",
      "Tổng tiền hàng",
      "Chiết khấu",
      "Giá trị cuối",
      "Đã trả",
      "Còn nợ",
      "Tên khách hàng",
      "SĐT",
      "Địa chỉ giao hàng",
      "Chi tiết sản phẩm"
    ];

    const rows = orders.map(order => {
      let customerName = "Khách lẻ";
      let phone = "";
      let addressStr = order.shippingAddress;
      
      try {
        const addr = JSON.parse(order.shippingAddress);
        customerName = addr.customerName || customerName;
        phone = addr.phone || phone;
        addressStr = addr.address || addressStr;
      } catch (e) {
        // Fallback
      }

      // Xử lý chuỗi chi tiết sản phẩm
      const productDetails = order.items.map(i => `${i.product.name} (x${i.quantity})`).join("; ");

      return [
        order.id,
        new Date(order.createdAt).toLocaleString("vi-VN"),
        order.orderType || "Bán lẻ",
        order.status,
        order.paymentStatus ? "Đã thanh toán" : "Chưa thanh toán",
        (order.totalAmount + order.discount).toString(),
        order.discount.toString(),
        order.totalAmount.toString(),
        (order.paidAmount || 0).toString(),
        (order.debtAmount || 0).toString(),
        customerName.replace(/,/g, " "),
        phone,
        addressStr.replace(/,/g, " ").replace(/\n/g, " "),
        productDetails.replace(/,/g, " ")
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    // Thêm BOM để Excel đọc đúng tiếng Việt UTF-8
    const csvWithBOM = "\uFEFF" + csvContent;

    return { success: true, data: csvWithBOM };
  } catch (error: any) {
    console.error("Lỗi xuất CSV Đơn hàng:", error);
    return { success: false, error: "Lỗi hệ thống khi trích xuất dữ liệu." };
  }
}

export async function exportCustomersToCsv() {
  await requireAdmin();

  try {
    const customers = await prisma.customer.findMany({
      include: {
        orders: {
          select: { totalAmount: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    const headers = [
      "Mã khách hàng",
      "Họ Tên",
      "Số điện thoại",
      "Email",
      "Phân loại",
      "Ngày tham gia",
      "Tổng chi tiêu",
      "Số đơn hàng"
    ];

    const rows = customers.map(customer => {
      const orderCount = customer.orders.length;
      const totalSpent = customer.orders.reduce((acc, order) => acc + order.totalAmount, 0);
      
      return [
        customer.id,
        (customer.name || "").replace(/,/g, " "),
        customer.phone || "",
        customer.email || "",
        customer.customerType,
        new Date(customer.createdAt).toLocaleString("vi-VN"),
        totalSpent.toString(),
        orderCount.toString()
      ].join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const csvWithBOM = "\uFEFF" + csvContent;

    return { success: true, data: csvWithBOM };
  } catch (error: any) {
    console.error("Lỗi xuất CSV Khách hàng:", error);
    return { success: false, error: "Lỗi hệ thống khi trích xuất dữ liệu." };
  }
}
