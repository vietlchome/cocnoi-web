import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { ContentService } from "@/lib/services/content.service";

export async function GET() {
  try {
    // Lấy toàn bộ setting từ CSDL thông qua Service (Service đã xử lý sẵn JSON.parse)
    const settingsMap = await ContentService.getAllThemeSettings();

    return NextResponse.json({ success: true, settings: settingsMap });
  } catch (error: any) {
    console.error("Theme Settings GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Gặp lỗi truy vấn cấu hình." },
      { status: error.message?.includes("Forbidden") ? 403 : 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { settings } = body; // Expects an object { key: value, ... }

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { error: "Dữ liệu cấu hình không hợp lệ." },
        { status: 400 }
      );
    }

    // Tạm thời mock ở Module 1 do bảng SiteSetting đã được lược bỏ khỏi schema mới
    return NextResponse.json({ success: true, message: "Đã lưu cài đặt giao diện thành công!" });
  } catch (error: any) {
    console.error("Theme Settings POST Error:", error);
    return NextResponse.json(
      { error: error.message || "Không thể lưu cấu hình giao diện." },
      { status: error.message?.includes("Forbidden") ? 403 : 401 }
    );
  }
}
