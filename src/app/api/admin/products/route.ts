import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { ProductService } from "@/lib/services/product.service";

export async function GET(request: Request) {
  try {
    await requireAdmin();
  } catch (authError: any) {
    return NextResponse.json(
      { error: authError.message || "Unauthorized" },
      { status: authError.message?.includes("Forbidden") ? 403 : 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get("all") === "true";
    const query = searchParams.get("query") || searchParams.get("search") || undefined;

    // Mặc định trả về sản phẩm đã xuất bản (isActive: true). Nếu all=true mới hiện cả bản nháp (isActive: undefined).
    const isActive = all ? undefined : true;

    const result = await ProductService.listProducts({
      query,
      isActive,
      pageSize: 200,
    });

    return NextResponse.json({ success: true, data: result.data });
  } catch (error: any) {
    console.error("Admin Product GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Gặp sự cố khi lấy danh sách sản phẩm." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  // 1. Phân quyền: Chỉ ADMIN được tạo sản phẩm qua API này
  try {
    await requireAdmin();
  } catch (authError: any) {
    return NextResponse.json(
      { error: authError.message || "Unauthorized" },
      { status: authError.message?.includes("Forbidden") ? 403 : 401 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, category, price, desc, size, weight, images } = body;

    if (!name || !category || !price) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đủ Tên, Phân loại và Giá bán." },
        { status: 400 }
      );
    }

    let imagesArr: string[] = [];
    if (images) {
      if (Array.isArray(images)) {
        imagesArr = images;
      } else if (typeof images === "string") {
        imagesArr = [images];
      }
    }

    const newProduct = await ProductService.createProduct({
      sku: id ? id.trim() : null,
      name,
      categoryId: category,
      price: Number(price),
      description: desc || "",
      images: imagesArr,
      sizeId: size || null,
      weight: weight ? Number(weight) : null,
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Product POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Gặp sự cố khi thêm sản phẩm." },
      { status: 500 }
    );
  }
}
