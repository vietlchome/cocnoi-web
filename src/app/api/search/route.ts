import { NextResponse } from "next/server";
import { SearchService } from "@/lib/services/search.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";

    if (query.trim().length < 2) {
      return NextResponse.json({
        success: true,
        results: { products: [], posts: [], categories: [] },
      });
    }

    const results = await SearchService.searchAll(query, 5);

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error: any) {
    console.error("Lỗi API Search:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Gặp sự cố máy chủ khi thực hiện tìm kiếm.",
      },
      { status: 500 }
    );
  }
}
