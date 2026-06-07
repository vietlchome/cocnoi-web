import { NextResponse } from 'next/server';
import { InquiryService } from '@/lib/services/inquiry.service';
import { CustomerService } from '@/lib/services/customer.service';
import { sendTelegramNotification } from '@/lib/utils/telegram';
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
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Vui lòng nhập đầy đủ Tên, Email và Nội dung tin nhắn.' },
        { status: 400 }
      );
    }

    // Nếu là đối tác B2B (Đại lý hoặc Doanh nghiệp quà tặng), bắt buộc SĐT để xử lý Inquiry vào CRM
    if (subject === 'STOCKIST' || subject === 'CORPORATE') {
      if (!phone) {
        return NextResponse.json(
          { error: 'Vui lòng nhập Số điện thoại để đội ngũ B2B Cốc Nối liên hệ tư vấn trực tiếp.' },
          { status: 400 }
        );
      }

      // Tạo B2B Inquiry (hàm này tự động tạo/cập nhật Customer thành B2B_LEAD)
      const inquiry = await InquiryService.createInquiry({
        customerName: name,
        phone,
        email,
        companyName: subject === 'CORPORATE' ? 'Khách hàng Doanh Nghiệp' : 'Đại lý / Stockist',
        note: message,
        quantity: 1,
        source: `Form liên hệ: ${subject === 'CORPORATE' ? 'Quà tặng doanh nghiệp' : 'Hợp tác đại lý'}`,
      });

      // Send Telegram Notification
      const typeLabel = subject === 'CORPORATE' ? '🏢 DOANH NGHIỆP TÌM QUÀ TẶNG' : '🤝 ĐẠI LÝ MUỐN HỢP TÁC';
      const telegramMsg = `<b>${typeLabel}</b>\n\n👤 <b>Tên:</b> ${name}\n📞 <b>SĐT:</b> ${phone}\n📧 <b>Email:</b> ${email}\n\n📝 <b>Lời nhắn:</b> <i>${message}</i>\n\n<i>Cốc Nối Admin - Vui lòng check ngay CRM!</i>`;
      await sendTelegramNotification(telegramMsg);

      return NextResponse.json({ success: true, data: inquiry }, { status: 201 });
    }

    // Với liên hệ bán lẻ / phản hồi chung, nếu có SĐT thì lưu vào CRM làm RETAIL_LEAD để remarketing
    if (phone) {
      try {
        await CustomerService.getOrCreateCustomer({
          name,
          phone,
          email,
          customerType: 'RETAIL_LEAD',
        });
      } catch (err) {
        console.error('Lỗi khi lưu Customer vãng lai từ Contact Form:', err);
      }
    }

    const newMessage = {
      id: 'mock_msg_id',
      name,
      email,
      phone: phone || null,
      subject: subject || 'CONTACT',
      message,
      type: subject || 'CONTACT',
      created_at: new Date().toISOString(),
    };

    // Send Telegram Notification for general contact
    const telegramMsg = `<b>📬 TIN NHẮN TỪ KHÁCH HÀNG</b>\n\n👤 <b>Tên:</b> ${name}\n📞 <b>SĐT:</b> ${phone || 'Không có'}\n📧 <b>Email:</b> ${email}\n📍 <b>Chủ đề:</b> ${subject || 'Liên hệ chung'}\n\n📝 <b>Lời nhắn:</b> <i>${message}</i>`;
    await sendTelegramNotification(telegramMsg);

    return NextResponse.json({ success: true, data: newMessage }, { status: 201 });
  } catch (error: any) {
    console.error('Contact Message API Error:', error);
    return NextResponse.json(
      { error: error.message || 'Gặp sự cố kết nối máy chủ.' },
      { status: 500 }
    );
  }
}
