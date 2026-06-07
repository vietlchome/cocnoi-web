import { NextResponse } from "next/server";
import { ContentService } from "@/lib/services/content.service";
import { getSiteConfig } from "@/lib/site-config";

export async function GET() {
  try {
    // Lấy toàn bộ setting từ CSDL thông qua Service (Service đã xử lý sẵn JSON.parse)
    const settingsMap = await ContentService.getAllThemeSettings();
    const config = await getSiteConfig();

    return NextResponse.json({ success: true, settings: settingsMap, config });
  } catch (error: any) {
    console.error("Theme Settings GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Gặp lỗi truy vấn cấu hình." },
      { status: error.message?.includes("Forbidden") ? 403 : 500 }
    );
  }
}
