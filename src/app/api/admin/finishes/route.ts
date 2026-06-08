import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { FinishService } from "@/lib/services/finish.service";

export async function GET() {
  try {
    await requireAdmin();
  } catch (authError: any) {
    return NextResponse.json(
      { error: authError.message || "Unauthorized" },
      { status: authError.message?.includes("Forbidden") ? 403 : 401 }
    );
  }

  try {
    const finishes = await FinishService.getFinishes();
    return NextResponse.json({ success: true, data: finishes });
  } catch (error: any) {
    console.error("Admin Finishes GET Error:", error);
    return NextResponse.json(
      { error: error.message || "Gặp sự cố khi lấy danh sách kỹ thuật hoàn thiện." },
      { status: 500 }
    );
  }
}
