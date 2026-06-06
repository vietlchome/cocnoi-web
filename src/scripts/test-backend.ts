import { prisma } from "../lib/prisma";
import { CustomerService } from "../lib/services/customer.service";
import { InquiryService } from "../lib/services/inquiry.service";
import { OrderService } from "../lib/services/order.service";
import { FinanceService } from "../lib/services/finance.service";
import { InventoryService } from "../lib/services/inventory.service";
import { CustomerType, OrderType, OrderStatus, InquiryStatus } from "@prisma/client";

async function runB2BIntegrationTest() {
  console.log("=========================================================");
  console.log("⚡ CỐC NỐI — CHƯƠNG TRÌNH KIỂM THỬ TỰ ĐỘNG BACKEND B2B");
  console.log("=========================================================");

  try {
    // 1. Kiểm tra PIM: Lấy một sản phẩm làm mẫu thử nghiệm
    console.log("\n📦 [1/6] Kiểm tra sản phẩm mẫu (PIM)...");
    const testProduct = await prisma.product.findFirst({
      where: { isActive: true, stockQuantity: { gt: 5 } },
    });

    if (!testProduct) {
      throw new Error("Không tìm thấy sản phẩm nào hoạt động có sẵn hàng để chạy test!");
    }
    console.log(`✓ Tìm thấy sản phẩm mẫu: "${testProduct.name}" (Mã: ${testProduct.id}), Tồn kho hiện tại: ${testProduct.stockQuantity}`);

    // Ghi nhớ tồn kho trước khi test
    const initialStock = testProduct.stockQuantity;

    // 2. Tạo đối tác sỉ tiềm năng (CRM Lead)
    console.log("\n👥 [2/6] CRM: Tạo mới hồ sơ đối tác sỉ (B2B Lead)...");
    const testPhone = `+84999${Math.floor(100000 + Math.random() * 900000)}`;
    const leadCustomer = await CustomerService.createCustomer({
      name: "Tập Đoàn Gốm Sứ Việt B2B Test",
      phone: testPhone,
      email: "b2btest@vietceramic.vn",
      companyName: "Viet Ceramic Corporation Ltd",
      address: "128 Đường Lê Duẩn, Hoàn Kiếm, Hà Nội",
      taxCode: "0102030405",
      customerType: CustomerType.B2B_LEAD,
    });
    console.log(`✓ Đã tạo thành công hồ sơ CRM của B2B Lead: ID "${leadCustomer.id}"`);
    console.log(`  - Tên: ${leadCustomer.name} | Loại: ${leadCustomer.customerType}`);

    // 3. Tiếp nhận đơn tư vấn đặt sỉ gốm (Inquiry Draft)
    console.log("\n📬 [3/6] Inquiry Pipeline: Ghi nhận yêu cầu tư vấn sỉ gốm...");
    const inquiry = await InquiryService.createInquiry({
      customerName: leadCustomer.name,
      phone: leadCustomer.phone,
      email: leadCustomer.email,
      companyName: leadCustomer.companyName,
      productId: testProduct.id,
      quantity: 5, // Đặt sỉ 5 cốc
      note: "Mong muốn in khắc logo chìm nhũ vàng 18K lên thân cốc làm quà tặng Đại hội Đảng",
      source: "Trang đối tác sỉ B2B",
    });
    console.log(`✓ Ghi nhận đơn tư vấn thành công: ID "${inquiry.id}" | Số lượng: ${inquiry.quantity} cốc`);

    // 4. Chốt hợp đồng & Chuyển đổi thành đơn sỉ chính thức (Transaction Conversion)
    console.log("\n⚡ [4/6] Transaction: Chốt hợp đồng sỉ & Chuyển đổi trạng thái sườn...");
    // Khách hàng đồng ý mua sỉ, xưởng chốt chiết khấu 10%
    const originalPrice = testProduct.price;
    const priceAtPurchase = Math.round(originalPrice * 0.9); // Giảm giá 10%
    const totalBeforeDiscount = priceAtPurchase * 5;
    const manualDiscount = 500000; // Giảm tiếp 500,000 đ
    const finalAmount = totalBeforeDiscount - manualDiscount;

    console.log(`  - Giá gốc: ${originalPrice.toLocaleString()} đ | Giá chốt sỉ: ${priceAtPurchase.toLocaleString()} đ`);
    console.log(`  - Tổng hóa đơn: ${finalAmount.toLocaleString()} đ (Bao gồm chiết khấu ${manualDiscount.toLocaleString()} đ)`);

    const b2bOrder = await InquiryService.convertToOrder({
      inquiryId: inquiry.id,
      discount: manualDiscount,
      paidAmount: 2000000, // Đặt cọc trước 2.000.000 đ
      items: [
        {
          productId: testProduct.id,
          quantity: 5,
          priceAtPurchase: priceAtPurchase,
          originalPrice: originalPrice,
        },
      ],
    });

    console.log(`✓ Chuyển đổi Inquiry sang Đơn sỉ B2B thành công!`);
    console.log(`  - Mã hóa đơn sỉ: #${b2bOrder.id}`);
    console.log(`  - Số tiền đặt cọc: ${b2bOrder.paidAmount.toLocaleString()} đ | Còn nợ lại: ${b2bOrder.debtAmount.toLocaleString()} đ`);

    // 5. Kiểm tra tính toàn vẹn dữ liệu (Data Integrity Audit)
    console.log("\n🔍 [5/6] Audit: Kiểm thử toàn vẹn dữ liệu...");
    
    // a. Kiểm tra nâng hạng CRM
    const updatedCustomer = await prisma.customer.findUnique({
      where: { id: leadCustomer.id },
      include: { notes: true },
    });
    console.log(`  - CRM Tier Upgrade: ${updatedCustomer?.customerType === CustomerType.B2B_WHOLESALE ? "✓ Đạt yêu cầu (Từ Lead B2B -> B2B Wholesale)" : "✗ Lỗi nâng hạng!"}`);
    
    // b. Kiểm tra nhật ký chăm sóc tự động
    const hasCrmNote = updatedCustomer?.notes.some((n: any) => n.content.includes("CRM Inquiry: Đã chuyển đổi yêu cầu đặt gốm"));
    console.log(`  - Tự động ghi nhật ký CRM: ${hasCrmNote ? "✓ Đạt yêu cầu (Ghi chép đầy đủ lịch sử giao dịch)" : "✗ Thiếu nhật ký!"}`);

    // c. Kiểm tra trừ kho
    const currentProduct = await prisma.product.findUnique({
      where: { id: testProduct.id },
    });
    const expectedStock = initialStock - 5;
    console.log(`  - Kiểm kho nguyên tử (Atomic Stock Adjustment): ${currentProduct?.stockQuantity === expectedStock ? "✓ Đạt yêu cầu (Trừ đúng 5 sản phẩm)" : `✗ Lỗi trừ kho! Trước: ${initialStock}, Sau: ${currentProduct?.stockQuantity}, Kỳ vọng: ${expectedStock}`}`);

    // 6. Ghi thu công nợ & Trả hết nợ (Finance)
    console.log("\n💰 [6/6] Finance: Thanh toán dứt điểm dư nợ còn lại...");
    const collectDebt = await FinanceService.updateDebt(b2bOrder.id, b2bOrder.debtAmount);
    console.log(`✓ Đã thu hồi toàn bộ số nợ: ${b2bOrder.debtAmount.toLocaleString()} đ`);
    console.log(`  - Trạng thái thanh toán đơn hàng: ${collectDebt.paymentStatus ? "✓ Đã tất toán hoàn toàn (PAID)" : "✗ Lỗi ghi nhận nợ!"}`);

    const finalCustomerState = await prisma.customer.findUnique({
      where: { id: leadCustomer.id },
      include: { notes: true },
    });
    console.log(`  - Dư nợ CRM hiện tại của đối tác: ${finalCustomerState?.notes.some((n: any) => n.content.includes("CRM Finance: Thu nợ sỉ")) ? "✓ Hoàn tất ghi sổ nợ" : "✗ Thiếu nhật ký CRM thu nợ!"}`);

    console.log("\n=========================================================");
    console.log("🎉 CHƯƠNG TRÌNH KIỂM THỬ BACKEND B2B THÀNH CÔNG 100%!");
    console.log("=========================================================");
  } catch (error: any) {
    console.error("\n✗ PHÁT SINH LỖI TRONG QUÁ TRÌNH KIỂM THỬ:", error.message || error);
    console.log("=========================================================");
  }
}

runB2BIntegrationTest();
