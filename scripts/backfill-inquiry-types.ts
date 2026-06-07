import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function run() {
  console.log("Bắt đầu thực hiện cập nhật (backfill) inquiryType cho các bản ghi cũ...");
  
  const inquiries = await prisma.orderInquiry.findMany();
  console.log(`Tìm thấy tổng cộng ${inquiries.length} bản ghi yêu cầu tư vấn.`);

  let updatedCount = 0;
  for (const inquiry of inquiries) {
    let type = 'RETAIL_B2C';
    const source = inquiry.source || '';

    if (
      source.includes("Stockist Application") || 
      source.includes("Hợp tác đại lý") || 
      source.includes("STOCKIST") ||
      source.includes("Đại lý")
    ) {
      type = 'WHOLESALE_B2B';
    } else if (
      source.includes("Corporate Gifting Inquiry") || 
      source.includes("Quà tặng doanh nghiệp") || 
      source.includes("CORPORATE") ||
      source.includes("Doanh nghiệp")
    ) {
      type = 'CORPORATE_B2B';
    } else if (
      source.includes("Liên hệ chung") || 
      source.includes("CONTACT") ||
      source.includes("Hỏi đáp")
    ) {
      type = 'CONTACT_GENERAL';
    } else {
      type = 'RETAIL_B2C';
    }

    await prisma.orderInquiry.update({
      where: { id: inquiry.id },
      data: {
        inquiryType: type as any,
      },
    });
    
    updatedCount++;
    console.log(`Cập nhật Inquiry #${inquiry.id}: Source "${source}" -> Type "${type}"`);
  }

  console.log(`Hoàn thành! Đã cập nhật ${updatedCount}/${inquiries.length} bản ghi.`);
}

run()
  .catch(err => {
    console.error("Gặp lỗi khi chạy backfill:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
