import { MessageSquare } from "lucide-react";

export const metadata = {
  title: "Câu chuyện của bạn - #cocnoiwithyou",
  description: "Mỗi đôi cốc kể một câu chuyện. Đây là những khoảnh khắc các bạn đã chia sẻ với chúng tôi.",
};

export default function YourStoriesPage() {
  return (
    <main className="w-full bg-canvas py-20 md:py-28 text-primary">
      <div className="max-w-5xl mx-auto px-4 md:px-8 text-center">
        <header className="mb-16">
          <span className="font-quicksand text-xs font-bold uppercase tracking-widest text-accent block mb-3">
            #cocnoiwithyou
          </span>
          <h1 className="font-playfair text-4xl md:text-6xl font-bold text-primary mb-4">
            Câu chuyện của bạn
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary max-w-xl mx-auto leading-relaxed">
            Mỗi đôi cốc kể một câu chuyện. Đây là những khoảnh khắc ý nghĩa các bạn đã chia sẻ cùng chúng tôi trong hành trình kết nối.
          </p>
        </header>
        
        {/* UGC gallery placeholder */}
        <div className="bg-[#FAF8F5] border border-dashed border-border/80 rounded-4 p-16 text-center max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[300px]">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-12 h-12 text-accent/30 mb-4">
            <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
            <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
          </svg>
          <p className="font-bvp text-sm text-secondary max-w-md">
            Thư viện ảnh UGC đang được thiết lập. Hệ thống tự động đồng bộ hình ảnh từ mạng xã hội sẽ được ra mắt trong thời gian tới.
          </p>
        </div>

        {/* CTA share info */}
        <div className="mt-16 max-w-2xl mx-auto bg-[#FAF8F5] border border-border/60 rounded-4 p-8 md:p-10 flex flex-col items-center">
          <MessageSquare className="w-8 h-8 text-accent mb-4" />
          <h2 className="font-playfair text-2xl font-bold text-primary mb-3">
            Chia sẻ khoảnh khắc của bạn
          </h2>
          <p className="font-bvp text-sm text-secondary leading-relaxed mb-1">
            Gửi câu chuyện hoặc gắn thẻ (tag) <span className="text-accent font-bold">#cocnoiwithyou</span> và <span className="text-accent font-bold">@cocnoi</span> trên Instagram / Facebook.
          </p>
          <p className="font-bvp text-xs text-secondary/70">
            Chúng tôi rất vui lòng được lan tỏa những kết nối ấm áp từ bạn.
          </p>
        </div>
      </div>
    </main>
  );
}
