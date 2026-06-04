import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";

export async function PATCH(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json(
        { error: "Thiếu thông tin bắt buộc (id, status)" },
        { status: 400 }
      );
    }

    // Tạm thời mock ở Module 1 do bảng OrderInquiry đã được lược bỏ khỏi schema mới
    return NextResponse.json({ success: true, data: { id, status } });
  } catch (error: any) {
    console.error("Admin Inquiries PATCH Error:", error);
    return NextResponse.json(
      { error: error.message || "Không thể cập nhật trạng thái đơn." },
      { status: error.message?.includes("Forbidden") ? 403 : 401 }
    );
  }
}
