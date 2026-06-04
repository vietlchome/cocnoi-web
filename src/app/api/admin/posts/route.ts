import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { title, content, excerpt, type } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Vui lòng cung cấp đủ Tiêu đề và Nội dung bài viết." },
        { status: 400 }
      );
    }

    // Tạm thời mock ở Module 1 do bảng Post đã được lược bỏ khỏi schema mới
    const newPost = {
      id: "mock_post_id",
      title,
      slug: "mock-slug",
      excerpt: excerpt || null,
      content,
      type: type || "JOURNAL",
      created_at: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: newPost }, { status: 201 });
  } catch (error: any) {
    console.error("Admin Post POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Gặp sự cố khi lưu bài viết." },
      { status: error.message?.includes("Forbidden") ? 403 : 401 }
    );
  }
}
