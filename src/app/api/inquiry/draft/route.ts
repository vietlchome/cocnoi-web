import { NextResponse } from 'next/server';
import { InquiryService } from '@/lib/services/inquiry.service';
import { checkRateLimit } from '@/lib/utils/rate-limit';

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(ip, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Quá nhiều yêu cầu. Vui lòng thử lại sau 1 phút.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { customerName, phone, email, companyName, productId, quantity, note, source } = body;

    if (!phone) {
      return NextResponse.json({ error: 'Số điện thoại là bắt buộc để capture lead!' }, { status: 400 });
    }

    // Capture thông tin lead nháp thời gian thực
    const inquiry = await InquiryService.saveDraft({
      customerName: customerName ? customerName.trim() : 'Lead Vãng Lai',
      phone: phone.trim(),
      email: email || null,
      companyName: companyName || null,
      productId: productId || null,
      quantity: quantity ? parseInt(quantity.toString()) : 1,
      note: note || null,
      source: source || 'Form B2B nháp',
    });

    return NextResponse.json({ success: true, data: inquiry }, { status: 200 });
  } catch (error: any) {
    console.error('Draft Inquiry capture error:', error);
    return NextResponse.json({ error: error.message || 'Gặp sự cố kết nối máy chủ.' }, { status: 500 });
  }
}
