import { getSiteConfig } from "@/lib/site-config";
import Link from "next/link";
import { Compass, ShoppingBag, Mail } from "lucide-react";

export const metadata = {
  title: "Tìm cửa hàng Cốc Nối - Find a Stockist",
  description: "Danh sách concept store, café, gallery đang bán sản phẩm Cốc Nối.",
};

export default async function StockistsPage() {
  const config = await getSiteConfig();
  const contactEmail = config.contact?.email || "";

  // TODO Phase sau: load stockists từ DB
  const stockists: any[] = [];

  return (
    <main className="w-full bg-canvas py-20 md:py-28 text-primary">
      <div className="max-w-4xl mx-auto px-4 md:px-8">
        <header className="text-center mb-16">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">Find a Stockist</span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4 animate-fade-in">
            Tìm cửa hàng gần bạn
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-xl mx-auto leading-relaxed">
            Cốc Nối hiện có mặt tại các concept store, café, gallery sau. Danh sách cập nhật liên tục.
          </p>
        </header>

        {stockists.length === 0 ? (
          <div className="bg-[#FAF8F5] border border-dashed border-border/80 rounded-4 p-12 text-center max-w-3xl mx-auto">
            <Compass className="w-12 h-12 text-accent/30 mx-auto mb-4" />
            <h2 className="font-playfair text-2xl font-bold text-primary mb-3">
              Sắp ra mắt tại các cửa hàng đối tác
            </h2>
            <p className="font-bvp text-sm text-secondary mb-8 max-w-md mx-auto leading-relaxed">
              Hiện Cốc Nối đang trong giai đoạn ra mắt. Bạn có thể đặt hàng trực tiếp qua website hoặc liên hệ để nhận thông báo khi có cửa hàng đối tác tại khu vực của bạn.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2 font-bvp font-semibold text-canvas bg-primary hover:bg-[#0E1220] transition-colors text-xs"
                style={{ backgroundColor: "var(--color-deep-indigo)" }}
              >
                <ShoppingBag className="w-4 h-4 text-accent" />
                Đặt hàng online
              </Link>
              {contactEmail && (
                <a 
                  href={`mailto:${contactEmail}`} 
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2 font-bvp font-semibold text-primary bg-subtle hover:bg-border/60 transition-colors text-xs border border-border"
                >
                  <Mail className="w-4 h-4 text-secondary" />
                  Liên hệ Cốc Nối
                </a>
              )}
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {/* Render stockist list khi có data */}
          </div>
        )}

        <div className="mt-16 bg-[#FAF8F5] border border-border/60 rounded-4 p-8 md:p-10 text-center max-w-3xl mx-auto">
          <h2 className="font-playfair text-2xl font-bold text-primary mb-3">
            Bạn sở hữu concept store hoặc café?
          </h2>
          <p className="font-bvp text-sm text-secondary mb-6 leading-relaxed max-w-md mx-auto">
            Trở thành đối tác phân phối sản phẩm Cốc Nối để cùng mang những kết nối thật đến khách hàng với chính sách wholesale tốt nhất.
          </p>
          <Link 
            href="/partners/become-a-stockist" 
            className="inline-flex items-center gap-2 text-accent font-semibold text-sm hover:underline"
            style={{ color: "var(--color-terracotta)" }}
          >
            Đăng ký làm đại lý phân phối <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
