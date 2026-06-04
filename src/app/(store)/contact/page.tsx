"use client";

import { useState, useEffect } from "react";
import { Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle } from "lucide-react";

export default function ContactPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setSettings(data.settings);
          }
        }
      } catch (e) {
        console.error("Lỗi khi nạp cấu hình:", e);
      }
    };
    fetchSettings();
  }, []);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("CONTACT");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) {
      setError("Vui lòng điền đầy đủ các trường bắt buộc.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setPhone("");
        setMessage("");
      } else {
        const err = await res.json();
        setError(err.error || "Gửi liên hệ thất bại. Vui lòng thử lại.");
      }
    } catch (err) {
      setError("Lỗi kết nối. Vui lòng kiểm tra lại mạng.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-canvas py-16 md:py-24">
      <div className="max-w-[1280px] mx-auto px-4 md:px-8">
        
        {/* HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-16 md:mb-24">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
            Liên hệ Cốc Nối
          </span>
          <h1 className="font-playfair font-semibold text-4xl md:text-5xl text-primary mb-4">
            Kết Nối Với Chúng Tôi
          </h1>
          <p className="font-bvp text-sm text-secondary leading-relaxed">
            Bạn có thể gửi thắc mắc về sản phẩm, yêu cầu đặt gốm riêng, liên hệ trở thành đại lý phân phối hoặc chia sẻ câu chuyện "Người Nối" tại đây.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left: Contact Coordinates */}
          <div className="lg:col-span-5 flex flex-col gap-8 bg-subtle/50 p-8 rounded-4 border border-border">
            <h3 className="font-playfair text-xl font-bold text-primary mb-2">Thông tin liên hệ</h3>
            
            <div className="flex flex-col gap-6 font-bvp text-sm text-secondary">
              <div className="flex items-start gap-4">
                <MapPin className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-1">Xưởng sản xuất chính</h4>
                  <p>{settings.contact_address || "Xưởng gốm gia đình Cốc Nối, Xóm 3 Giang Cao, Làng cổ Bát Tràng, Gia Lâm, Hà Nội"}</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Phone className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-1">Điện thoại hotline</h4>
                  <p>{settings.contact_phone || "+84 (0) 98 765 4321"}</p>
                  <p className="text-xs text-secondary/75">(Hỗ trợ Zalo tư vấn 24/7)</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <Mail className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-primary text-xs uppercase tracking-wider mb-1">Hòm thư điện tử</h4>
                  <p>{settings.contact_email || "hello@cocnoi.com"}</p>
                  <p>b2b@cocnoi.com (Hợp tác doanh nghiệp)</p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6 mt-2">
              <p className="font-bvp text-xs text-secondary italic leading-relaxed">
                "Một tách trà nóng mở đầu câu chuyện chân tình. Hãy ghé thăm xưởng gốm của chúng tôi tại Bát Tràng bất cứ khi nào bạn rảnh rỗi."
              </p>
            </div>
          </div>

          {/* Right: Contact Form */}
          <div className="lg:col-span-7 bg-canvas border border-border rounded-4 p-8">
            <h3 className="font-playfair text-xl font-bold text-primary mb-6">Gửi tin nhắn gửi trọn tâm tư</h3>

            {success ? (
              <div className="text-center py-10 flex flex-col items-center gap-4 font-bvp">
                <div className="w-14 h-14 rounded-full bg-olive/15 flex items-center justify-center text-olive">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="font-playfair text-xl font-bold text-primary">Tin nhắn đã gửi đi</h4>
                <p className="text-xs md:text-sm text-secondary max-w-sm">
                  Cảm ơn sự chân thành của bạn. Tin nhắn liên hệ đã được lưu trữ vào hệ thống. Đội ngũ Cốc Nối sẽ phản hồi sớm qua email/số điện thoại trong vòng 24 giờ.
                </p>
                <button 
                  onClick={() => setSuccess(false)}
                  className="bg-primary text-canvas text-xs font-semibold px-6 py-3 rounded-2 hover:bg-[#0E1220] transition-colors mt-2"
                >
                  Gửi tin nhắn mới
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5 font-bvp">
                
                {error && (
                  <div className="bg-brick/10 border border-brick/30 text-brick p-3.5 rounded-2 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-secondary mb-1.5 block">Họ tên của bạn *</label>
                    <input 
                      type="text" 
                      placeholder="Nguyễn Văn A"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs bg-canvas border border-border px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-secondary mb-1.5 block">Số điện thoại</label>
                    <input 
                      type="tel" 
                      placeholder="Không bắt buộc"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs bg-canvas border border-border px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary mb-1.5 block">Địa chỉ Email liên hệ *</label>
                  <input 
                    type="email" 
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary mb-1.5 block">Mục đích liên hệ *</label>
                  <select
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent"
                  >
                    <option value="CONTACT">Liên hệ chung / Hỏi đáp gốm</option>
                    <option value="STOCKIST">Đăng ký làm đại lý (Wholesale)</option>
                    <option value="CORPORATE">Quà tặng doanh nghiệp (Corporate Gift)</option>
                    <option value="NGUOI_NOI">Chia sẻ câu chuyện "Người Nối"</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-secondary mb-1.5 block">Nội dung tin nhắn *</label>
                  <textarea 
                    placeholder="Hãy kể cho chúng tôi nghe chi tiết mong muốn của bạn..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full text-xs bg-canvas border border-border px-3.5 py-2.5 rounded-2 text-primary focus:outline-none focus:border-accent h-28 resize-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-canvas font-semibold text-xs py-3 rounded-2 transition-colors flex items-center justify-center gap-2 mt-2 w-full sm:w-auto sm:px-8 self-end"
                >
                  {submitting ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-canvas border-t-transparent rounded-full animate-spin"></span>
                      <span>Đang gửi liên hệ...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi tin nhắn ngay</span>
                    </>
                  )}
                </button>

              </form>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
