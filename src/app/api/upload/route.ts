import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    // 1. Phân quyền: Chỉ ADMIN được tải ảnh lên
    try {
      await requireAdmin();
    } catch (authError: any) {
      return NextResponse.json(
        { success: false, error: authError.message || "Unauthorized" },
        { status: authError.message?.includes("Forbidden") ? 403 : 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null; // e.g. "products"

    if (!file) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy tệp tin tải lên." },
        { status: 400 }
      );
    }

    // 2. Validate MIME type: Phải là hình ảnh
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "Tệp tin tải lên phải là hình ảnh." },
        { status: 400 }
      );
    }

    // 3. Validate File Size: Tối đa 5MB
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { success: false, error: "Kích thước hình ảnh tối đa là 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Xác định đường dẫn thư mục public/uploads
    let uploadDir = join(process.cwd(), "public", "uploads");
    if (folder) {
      // Bảo vệ tránh directory traversal bằng cách chỉ lấy chữ cái và số
      const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      if (safeFolder) {
        uploadDir = join(uploadDir, safeFolder);
      }
    }
    
    // Đảm bảo thư mục tồn tại bằng cách tạo đệ quy
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch (e) {
      // Thư mục đã tồn tại, bỏ qua lỗi
    }

    // Đặt tên file ngẫu nhiên tránh trùng lặp
    const ext = "jpg"; // Vì client crop ép kiểu JPEG
    const filename = `img_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = join(uploadDir, filename);

    // Ghi file vào bộ nhớ
    await writeFile(filePath, buffer);

    // Trả về đường dẫn tĩnh có thể truy cập công khai trên web
    const relativeFolder = folder ? folder.replace(/[^a-zA-Z0-9_-]/g, "") : "";
    const fileUrl = relativeFolder ? `/uploads/${relativeFolder}/${filename}` : `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url: fileUrl });
  } catch (error: any) {
    console.error("Lỗi API upload:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Gặp sự cố máy chủ khi ghi tệp tin." },
      { status: 500 }
    );
  }
}
