import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";
import { ReviewService } from "@/lib/services/review.service";
import { getSiteConfig } from "@/lib/site-config";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Sinh metadata động tối ưu cho SEO
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  
  const product = await prisma.product.findUnique({
    where: { slug }
  });

  if (!product || !product.isActive || product.visibility !== 'PUBLIC') {
    return {
      title: "Không Tìm Thấy Sản Phẩm - Cốc Nối",
      description: "Sản phẩm gốm Bát Tràng yêu cầu hiện chưa có hoặc đã hết hàng.",
    };
  }

  // Loại bỏ các thẻ HTML để làm meta description sạch
  const cleanDesc = product.description
    ? product.description.replace(/<[^>]*>/g, '').slice(0, 160)
    : "Sản phẩm cốc gốm thủ công cao cấp được chế tác tỉ mỉ từ những nghệ nhân làng nghề cổ Bát Tràng.";

  return {
    title: `${product.name} | Cốc Gốm Bát Tràng Cao Cấp | Cốc Nối`,
    description: cleanDesc,
    openGraph: {
      title: `${product.name} | Cốc Gốm Bát Tràng Cao Cấp | Cốc Nối`,
      description: cleanDesc,
      type: "website",
    },
  };
}

// Server Component tải dữ liệu từ CSDL thực tế và truyền sang Client Component
export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: {
        select: { id: true, name: true, slug: true }
      },
      color: true,
      size: true,
      productGroup: true
    }
  });

  if (!product || !product.isActive || product.visibility !== 'PUBLIC') {
    notFound();
  }

  // Lấy các sản phẩm anh em cùng Nhóm sản phẩm (Bộ sưu tập)
  let siblings: any[] = [];
  if (product.productGroupId) {
    const rawSiblings = await prisma.product.findMany({
      where: {
        productGroupId: product.productGroupId,
        isActive: true,
        visibility: 'PUBLIC'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        color: {
          select: { name: true, hex: true }
        },
        size: {
          select: { name: true }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    siblings = rawSiblings.map((sib: any) => ({
      id: sib.id,
      name: sib.name,
      slug: sib.slug,
      colorName: sib.color?.name || null,
      colorHex: sib.color?.hex || null,
      size: sib.size?.name || null
    }));
  }

  // Chuyển đổi Date thành chuỗi trước khi chuyển xuống Client Component để tránh lỗi serialization
  const serializedProduct = {
    ...product,
    colorName: product.color?.name || null,
    colorHex: product.color?.hex || null,
    size: product.size?.name || null,
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
  };

  const ratingData = await ReviewService.getProductRating(product.id);
  const config = await getSiteConfig();

  return (
    <ProductDetailClient 
      product={serializedProduct as any} 
      siblings={siblings} 
      ratingData={ratingData} 
      paymentInfo={config.payment_info}
    />
  );
}
