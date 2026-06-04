import { NextResponse } from 'next/server';
import { InquiryService } from '@/lib/services/inquiry.service';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, customerName, phone, email, address, quantity, note, companyName, source } = body;

    if (!productId || !customerName || !phone) {
      return NextResponse.json(
        { error: 'Thiếu thông tin bắt buộc (productId, customerName, phone)' },
        { status: 400 }
      );
    }

    // Nếu có địa chỉ, nối vào ghi chú để không làm thất lạc địa chỉ khách hàng
    let combinedNote = note || '';
    if (address) {
      combinedNote = `Địa chỉ: ${address}${note ? ` | Ghi chú: ${note}` : ''}`;
    }

    // Tự động xác định nguồn gửi form nếu chưa truyền lên từ Client
    let sourceStr = source || null;
    if (!sourceStr && productId) {
      const prod = await prisma.product.findUnique({
        where: { id: productId },
        select: { name: true, sku: true },
      });
      if (prod) {
        sourceStr = `Sản phẩm: ${prod.name} (SKU: ${prod.sku || 'N/A'})`;
      }
    }

    const inquiry = await InquiryService.createInquiry({
      productId,
      customerName,
      phone,
      email: email || null,
      companyName: companyName || null,
      quantity: quantity ? parseInt(quantity.toString()) : 1,
      note: combinedNote || null,
      source: sourceStr,
    });

    // Gửi thông báo qua Telegram
    const telegramMsg = `<b>🚨 CÓ YÊU CẦU BÁO GIÁ MỚI</b>\n\n👤 <b>Tên:</b> ${customerName}\n🏢 <b>Đơn vị:</b> ${companyName || 'Cá nhân/Không có'}\n📞 <b>SĐT:</b> ${phone}\n📧 <b>Email:</b> ${email || 'Không có'}\n\n📦 <b>Số lượng dự kiến:</b> ${quantity || 1}\n🔍 <b>Nguồn/Sản phẩm:</b> ${sourceStr || 'N/A'}\n\n📝 <b>Ghi chú:</b> <i>${combinedNote || 'Không có'}</i>\n\n<i>Cốc Nối Admin - Hãy vào CRM kiểm tra!</i>`;
    import('@/lib/utils/telegram').then(m => m.sendTelegramNotification(telegramMsg)).catch(console.error);

    return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
  } catch (error: any) {
    console.error('Inquiry API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gặp sự cố kết nối máy chủ.' },
      { status: 500 }
    );
  }
}
