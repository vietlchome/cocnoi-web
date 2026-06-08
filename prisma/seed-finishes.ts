import { PrismaClient } from "@prisma/client";
import { slugify } from "../src/lib/utils/slug";

const prisma = new PrismaClient();

const FINISHES = [
  { name: "Vẽ tay thủ công", slug: "ve-tay-thu-cong", description: "Họa tiết vẽ trực tiếp bằng cọ trên bề mặt gốm.", sortOrder: 1 },
  { name: "Tráng men màu", slug: "trang-men-mau", description: "Phủ lớp men màu, bao gồm cả bóng và mát.", sortOrder: 2 },
  { name: "Tráng men hỏa biến", slug: "trang-men-hoa-bien", description: "Men chảy và hỏa biến, mỗi sản phẩm 1 vẻ duy nhất.", sortOrder: 3 },
  { name: "Khắc/dập nổi & chìm", slug: "khac-dap-noi-chim", description: "Họa tiết tạo bằng kỹ thuật khắc tay hoặc khuôn dập.", sortOrder: 4 },
  { name: "Nung củi", slug: "nung-cui", description: "Nung trong lò củi truyền thống Bát Tràng, tro củi tạo hiệu ứng tự nhiên.", sortOrder: 5 },
];

async function main() {
  console.log("Starting database seeding and backfilling...");

  // 1. Seed finishes
  for (const f of FINISHES) {
    await prisma.finishOption.upsert({
      where: { slug: f.slug },
      create: f,
      update: f,
    });
  }
  console.log(`Seeded ${FINISHES.length} finishes.`);

  // 2. Backfill existing products with "Tráng men màu"
  const defaultFinish = await prisma.finishOption.findUnique({ where: { slug: "trang-men-mau" } });
  if (!defaultFinish) throw new Error("Default finish not found");

  const productsWithoutFinish = await prisma.product.findMany({
    where: { finishes: { none: {} } },
    select: { id: true }
  });

  for (const p of productsWithoutFinish) {
    await prisma.product.update({
      where: { id: p.id },
      data: { finishes: { connect: [{ id: defaultFinish.id }] } }
    });
  }
  console.log(`Backfilled ${productsWithoutFinish.length} products with default finish.`);

  // 3. Slugify existing SizeOption records
  const sizes = await prisma.sizeOption.findMany();
  console.log(`Checking slugs for ${sizes.length} sizes...`);

  let updatedSizesCount = 0;
  for (const size of sizes) {
    const slug = slugify(size.name);
    console.log(`Size "${size.name}" -> slug: "${slug}"`);
    await prisma.sizeOption.update({
      where: { id: size.id },
      data: { slug }
    });
    updatedSizesCount++;
  }
  console.log(`Successfully updated ${updatedSizesCount} size options with slugs.`);
}

main()
  .catch((e) => {
    console.error("Error seeding finishes:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
