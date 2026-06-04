import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const DUMMY_REVIEWS = [
  { rating: 5, comment: "Cốc rất đẹp, men mộc mạc đúng kiểu mình thích. Gói hàng cẩn thận bằng rơm khô rất ấn tượng. Cảm ơn shop!", customerName: "Nguyễn Hà Anh" },
  { rating: 4, comment: "Cầm rất đầm tay, uống trà giữ ấm tốt. Cốc này dùng để chill buổi sáng thì hết sảy.", customerName: "Trần Minh" },
  { rating: 5, comment: "Sản phẩm thực tế còn đẹp hơn trên ảnh. Nước men có độ bóng tự nhiên rất sang.", customerName: "Lê Hoàng Yến" },
  { rating: 5, comment: "Tuyệt vời! Rất hài lòng với chất lượng gốm Bát Tràng truyền thống. Xứng đáng 5 sao.", customerName: "Phạm Quang" },
  { rating: 4, comment: "Men tro lên màu đẹp, tinh tế. Dịch vụ chăm sóc khách hàng của Cốc Nối rất tốt.", customerName: "Hoàng Oanh" },
  { rating: 5, comment: "Mua làm quà tặng đối tác, hộp quà bằng gỗ và rơm rất chỉn chu. Đối tác khen nức nở.", customerName: "Vũ Hải" },
];

async function main() {
  console.log("Bắt đầu tự động tạo đánh giá mẫu (Seed Reviews)...");

  // Lấy 3 sản phẩm nổi bật
  const products = await prisma.product.findMany({
    where: { isActive: true },
    take: 3,
  });

  if (products.length === 0) {
    console.log("Không tìm thấy sản phẩm nào để đánh giá.");
    return;
  }

  // Xóa các dummy order/reviews cũ (nếu có - tuỳ chọn) để khỏi đầy rác
  // await prisma.review.deleteMany({});
  
  for (const product of products) {
    // Mỗi SP tạo 3-4 đánh giá
    const numReviews = Math.floor(Math.random() * 2) + 3; 

    for (let i = 0; i < numReviews; i++) {
      const dummyReview = DUMMY_REVIEWS[Math.floor(Math.random() * DUMMY_REVIEWS.length)];
      
      // 1. Tạo đơn hàng ảo (DELIVERED)
      const order = await prisma.order.create({
        data: {
          totalAmount: product.price,
          shippingAddress: JSON.stringify({ name: dummyReview.customerName, address: "Hà Nội" }),
          status: "DELIVERED",
          paymentStatus: true,
          paidAmount: product.price,
          orderType: "RETAIL",
          items: {
            create: [
              {
                productId: product.id,
                quantity: 1,
                priceAtPurchase: product.price,
              },
            ],
          },
        },
      });

      // 2. Thêm đánh giá cho đơn hàng đó
      await prisma.review.create({
        data: {
          orderId: order.id,
          productId: product.id,
          rating: dummyReview.rating,
          comment: dummyReview.comment,
          customerName: dummyReview.customerName,
        },
      });
      
      console.log(`Đã thêm đánh giá ${dummyReview.rating} sao cho [${product.name}] (Đơn: ${order.id})`);
    }
  }

  console.log("Hoàn thành tạo dữ liệu mẫu!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
