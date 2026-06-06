import { NextResponse } from "next/server";
import { getSiteConfig } from "@/lib/site-config";

export const revalidate = 300; // ISR cache 5 phut

/**
 * Public endpoint tra ve toan bo site config cho storefront.
 * Khong yeu cau auth - tat ca du lieu o day deu duoc hien thi cong khai tren website.
 * Cache 5 phut de giam tai cho database.
 */
export async function GET() {
  try {
    const config = await getSiteConfig();
    return NextResponse.json({ success: true, data: config }, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      }
    });
  } catch (error: any) {
    console.error("GET /api/site-config error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch config" },
      { status: 500 }
    );
  }
}
