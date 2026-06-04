import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

// Basic slugify helper
function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove Vietnamese accents
    .replace(/[đĐ]/g, "d")
    .replace(/[^a-z0-9 -]/g, "") // Remove invalid chars
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/-+/g, "-") // Collapse dashes
    .trim();
}

export async function POST(request: Request) {
  // 1. Phân quyền: Chỉ ADMIN được tạo sản phẩm qua API này
  try {
    await requireAdmin();
  } catch (authError: any) {
    return NextResponse.json(
      { error: authError.message || "Unauthorized" },
      { status: authError.message.includes("Forbidden") ? 403 : 401 }
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

    // Kiểm tra xem mã sản phẩm thủ công có bị trùng lặp không
    if (id) {
      const existingProduct = await prisma.product.findUnique({
        where: { id: id.trim() }
      });
      if (existingProduct) {
        return NextResponse.json(
          { error: `Mã sản phẩm "${id.trim()}" đã tồn tại trên hệ thống. Vui lòng chọn mã khác.` },
          { status: 400 }
        );
      }
    }

    const baseSlug = slugify(name);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    let imagesJson = "[]";
    if (images) {
      if (Array.isArray(images)) {
        imagesJson = JSON.stringify(images);
      } else if (typeof images === "string") {
        imagesJson = JSON.stringify([images]);
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        id: id ? id.trim() : undefined, // Nếu có mã do người dùng nhập thì lưu, không thì cuid tự động sinh
        name: name,
        slug: slug,
        categoryId: category,
        price: Number(price),
        description: desc || "",
        images: imagesJson,
        sizeId: size || null,
        weight: weight ? Number(weight) : null,
      },
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
