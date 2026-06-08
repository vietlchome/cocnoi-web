import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Users, Heart, Sparkles, MessageSquare, Briefcase, Building, Quote, CheckCircle } from "lucide-react";
import PartnerCarousel from "@/components/store/PartnerCarousel";

export const revalidate = 0; // Vô hiệu hóa bộ nhớ đệm để tải các câu chuyện trực tiếp từ database

export default async function NguoiNoiCampaignPage() {
  const posts = await prisma.post.findMany({
    where: {
      status: "PUBLISHED",
      publishedAt: { lte: new Date() },
      category: "UNSUNG_HEROES" // Chỉ lấy các bài viết thuộc danh mục Người Nối
    },
    orderBy: { publishedAt: "desc" },
  });

  const teamMembers = [
    {
      name: "Nghệ nhân Lê Minh",
      role: "Trực giác ngọn lửa lò (32 năm kinh nghiệm)",
      desc: "Người giữ ấm nhiệt độ nung Bát Tràng. Không cần máy móc cảm biến phức tạp, bác Minh điều tiết ngọn lửa bằng trực giác và kinh nghiệm tích lũy, giúp lớp men tro chín ngọt đồng đều.",
      tag: "Trưởng thợ lò",
      initial: "M",
    },
    {
      name: "Chị Nguyễn Thị Hương",
      role: "Xoay tay vuốt mộc độc bản (18 năm kinh nghiệm)",
      desc: "Với đôi bàn tay bền bỉ và sự nhạy bén nghệ thuật, chị Hương đã định hình hàng vạn chiếc cốc. Mỗi sản phẩm đều có sự cân đối hoàn mỹ nhưng vẫn giữ lại vết hằn tay mộc mạc.",
      tag: "Nghệ nhân tạo hình",
      initial: "H",
    },
    {
      name: "Chị Lâm Mỹ Duyên",
      role: "Họa nét cọ hoa văn mộc (12 năm kinh nghiệm)",
      desc: "Chăm chút từng nét vẽ thanh tao trên chất liệu gốm mộc chưa nung. Đôi tay khéo léo của chị Duyên thổi hồn vào đất sét những nét hoa cỏ tự nhiên, biến chiếc cốc thành tác phẩm độc bản.",
      tag: "Nghệ nhân họa tiết",
      initial: "D",
    },
    {
      name: "Anh Trần Chí Tâm",
      role: "Phủ men tro tự nhiên (15 năm kinh nghiệm)",
      desc: "Chuyên gia chế tạo và phối men tro từ vỏ trấu và gỗ cây tự nhiên. Kỹ thuật tráng dội khéo léo của anh Tâm đảm bảo lớp men chín đều, lên màu mộc mạc đặc trưng riêng có của Cốc Nối.",
      tag: "Thợ tráng men",
      initial: "T",
    },
    {
      name: "Cô Phạm Thị Lan",
      role: "Làm sạch & Gọt mộc chi tiết (8 năm kinh nghiệm)",
      desc: "Người thợ tỉ mỉ gọt dũa từng chi tiết thừa trên phôi cốc thô sau khi rời khuôn máy. Sự chỉn chu ở bước hoàn thiện này giúp các góc cạnh cốc mềm mại, tạo xúc cảm trọn vẹn khi cầm nắm.",
      tag: "Thợ hoàn thiện thô",
      initial: "L",
    },
    {
      name: "Anh Ngô Quốc Việt",
      role: "Bảo quản & Đóng gói chỉn chu (10 năm kinh nghiệm)",
      desc: "Người chịu trách nhiệm cuối cùng trước khi cốc rời xưởng. Từng chiếc cốc được anh Việt kiểm định nghiêm ngặt, bọc rơm khô tự nhiên và đặt vào hộp xi măng thô mộc đầy tính trân trọng.",
      tag: "Trưởng khâu đóng gói",
      initial: "V",
    },
  ];



  return (
    <div className="bg-canvas text-primary overflow-hidden min-h-screen">
      
      {/* HERO SECTION */}
      <section className="relative py-20 md:py-28 flex items-center justify-center border-b border-border/40 bg-[#FAF8F5]">
        <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:24px_24px] opacity-10"></div>
        <div className="max-w-[900px] mx-auto px-4 text-center relative z-10">
          <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-4 block">
            Chiến dịch thương hiệu
          </span>
          <h1 className="font-playfair font-bold text-4xl md:text-6xl text-primary leading-tight mb-6">
            Người Nối
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary leading-relaxed max-w-2xl mx-auto mb-8">
            Chúng tôi tin rằng gốm mộc không tự nói chuyện. Linh hồn của Cốc Nối thuộc về ba nhóm Người Nối thầm lặng: những người thợ trực tiếp chế tác, những đối tác đồng hành chia sẻ giá trị, và những con người đang ngày đêm kết nối yêu thương trong xã hội.
          </p>
          <div className="flex flex-wrap gap-4 justify-center font-bvp text-xs font-semibold text-secondary">
            <a href="#team" className="bg-primary text-canvas px-5 py-3 rounded-2 hover:bg-[#0E1220] transition-colors">
              1. Nhân sự Cốc Nối
            </a>
            <a href="#partners" className="border border-border bg-canvas px-5 py-3 rounded-2 hover:border-accent hover:text-accent transition-colors">
              2. Đối tác & Khách hàng
            </a>
            <a href="#unsung-heroes" className="border border-border bg-canvas px-5 py-3 rounded-2 hover:border-accent hover:text-accent transition-colors">
              3. Người Nối - Unsung Heroes
            </a>
          </div>
        </div>
      </section>

      {/* QUICK STATS BOARD */}
      <section className="py-12 border-b border-border/40 bg-canvas">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center bg-[#FAF8F5] border border-border/60 p-8 rounded-4">
            <div className="flex flex-col items-center p-2">
              <Users className="w-7 h-7 text-accent mb-2" />
              <h4 className="font-playfair text-2xl md:text-3xl font-bold text-primary">12</h4>
              <p className="font-bvp text-xs text-secondary mt-1 font-medium">Người thợ thủ công gắn bó tại xưởng</p>
            </div>
            <div className="flex flex-col items-center p-2 border-y md:border-y-0 md:border-x border-border/60">
              <Briefcase className="w-7 h-7 text-accent mb-2" />
              <h4 className="font-playfair text-2xl md:text-3xl font-bold text-primary">45+</h4>
              <p className="font-bvp text-xs text-secondary mt-1 font-medium">Đối tác doanh nghiệp tin chọn quà tặng</p>
            </div>
            <div className="flex flex-col items-center p-2">
              <Sparkles className="w-7 h-7 text-accent mb-2" />
              <h4 className="font-playfair text-2xl md:text-3xl font-bold text-primary">10,000+</h4>
              <p className="font-bvp text-xs text-secondary mt-1 font-medium">Thông điệp kết nối thật đã gửi trao</p>
            </div>
          </div>
        </div>
      </section>

      {/* TỆP 1: NHÂN SỰ CỐC NỐI */}
      <section id="team" className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8 border-b border-border/40">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-xl">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
              Tệp 01 / Nhân lực nội bộ
            </span>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-primary">
              Những bàn tay giữ hồn đất mộc
            </h2>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mt-3 text-justify">
              Những nghệ nhân lâu năm đứng sau chất lượng vượt trội từng mẻ cốc của Cốc Nối. Họ nhào nặn đất sét, giữ lửa lò nung và chăm chút từng khâu đóng gói bằng cả tấm lòng.
            </p>
          </div>
          <span className="font-playfair text-accent/20 font-bold text-7xl hidden md:block select-none">
            01
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          {teamMembers.map((art, idx) => (
            <div 
              key={idx} 
              className="grid grid-cols-1 sm:grid-cols-12 gap-6 bg-[#FAF8F5] border border-border/60 p-6 md:p-8 rounded-4 hover:border-accent transition-all duration-300 hover:shadow-md group"
            >
              {/* Clay avatar frame */}
              <div className="sm:col-span-4 relative aspect-square bg-[#EFE9DF] rounded-3 border border-border flex items-center justify-center p-6 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:12px_12px] opacity-15"></div>
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-canvas text-sm font-playfair font-bold group-hover:scale-105 transition-transform duration-300">
                  {art.initial}
                </div>
                <span className="absolute bottom-2 left-2 right-2 text-center bg-accent text-canvas font-bvp text-[8px] font-bold py-0.5 rounded-1 uppercase tracking-wider">
                  {art.tag}
                </span>
              </div>

              <div className="sm:col-span-8 flex flex-col justify-between">
                <div>
                  <h3 className="font-playfair text-xl font-bold text-primary">{art.name}</h3>
                  <span className="font-bvp text-[11px] text-accent font-semibold block mb-3 mt-1 uppercase tracking-wider">{art.role}</span>
                  <p className="font-bvp text-xs leading-relaxed text-secondary text-justify">{art.desc}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-secondary font-bvp font-bold mt-4 pt-3 border-t border-border/60">
                  <CheckCircle className="w-3.5 h-3.5 text-accent" />
                  <span>Chứng chỉ kỹ thuật Bát Tràng truyền thống</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* TỆP 2: ĐỐI TÁC & KHÁCH HÀNG B2B */}
      <section id="partners" className="py-20 md:py-28 bg-[#FAF8F5] border-b border-border/40">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
            <div className="max-w-xl">
              <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
                Tệp 02 / Đồng hành phát triển
              </span>
              <h2 className="font-playfair font-bold text-3xl md:text-4xl text-primary">
                Cùng lan tỏa những kết nối thật
              </h2>
              <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mt-3 text-justify">
                Chúng tôi tự hào đồng hành cùng các quán café specialty, các cửa hàng concept và các doanh nghiệp trong hành trình gửi trao thông điệp trân quý đến cộng đồng.
              </p>
            </div>
            <span className="font-playfair text-accent/20 font-bold text-7xl hidden md:block select-none">
              02
            </span>
          </div>

          <PartnerCarousel />
        </div>
      </section>

      {/* TỆP 3: UNSUNG HEROES */}
      <section id="unsung-heroes" className="py-20 md:py-28 max-w-[1280px] mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 md:mb-16">
          <div className="max-w-xl">
            <span className="font-quicksand font-bold text-xs uppercase tracking-widest text-accent mb-3 block">
              Tệp 03 / Tuyên dương đóng góp
            </span>
            <h2 className="font-playfair font-bold text-3xl md:text-4xl text-primary">
              Những câu chuyện vinh danh xã hội
            </h2>
            <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mt-3 text-justify">
              Những Người Nối âm thầm xung quanh chúng ta. Họ là bất kỳ ai đang nỗ lực dệt nên sự gắn kết yêu thương, mang mọi người xích lại gần nhau hơn bằng những hành động chân thành, giản dị.
            </p>
          </div>
          <span className="font-playfair text-accent/20 font-bold text-7xl hidden md:block select-none">
            03
          </span>
        </div>

        <div className="flex flex-col gap-12">
          {/* Database-sourced posts */}
          {posts.length > 0 && (
            <div className="flex flex-col gap-12">
              {posts.map((post: any) => (
                <Link href={`/journal/${(post as any).slug || post.id}`} key={post.id} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-start border border-border/60 rounded-4 p-6 md:p-10 bg-canvas hover:border-accent transition-colors cursor-pointer group block">
                  <div className="lg:col-span-4 relative aspect-square md:aspect-video lg:aspect-square bg-[#EFE9DF] rounded-3 border border-border flex items-center justify-center p-8 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#C2703E_1px,transparent_1px)] [background-size:16px_16px] opacity-15"></div>
                    <Users className="w-12 h-12 text-accent group-hover:scale-110 transition-transform duration-300" />
                    <span className="absolute bottom-4 left-4 bg-primary text-canvas font-bvp text-[9px] font-bold px-2.5 py-1 rounded-1 uppercase tracking-wider">
                      Mới Đăng
                    </span>
                  </div>
                  <div className="lg:col-span-8 flex flex-col items-start gap-4">
                    <span className="font-bvp text-xs text-accent font-bold uppercase tracking-wider">Cộng đồng Người Nối</span>
                    <h3 className="font-playfair text-xl md:text-3xl font-bold text-primary group-hover:text-accent transition-colors">{post.title}</h3>
                    {post.excerpt && <p className="font-bvp text-sm text-secondary italic font-medium text-justify">"{post.excerpt}"</p>}
                    <p className="font-bvp text-sm text-secondary leading-relaxed whitespace-pre-wrap line-clamp-3 text-justify">{post.content}</p>
                    <div className="border-t border-border w-full pt-4 mt-2 flex items-center justify-between text-xs text-secondary font-bvp">
                      <span>Ngày đăng: {new Date(post.createdAt).toLocaleDateString("vi-VN")}</span>
                      <span className="font-playfair font-semibold text-accent italic flex items-center gap-1 group-hover:underline">
                        Đọc câu chuyện <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

        </div>

        {/* CALL TO ACTION */}
        <div className="mt-24 text-center max-w-xl mx-auto border-t border-border/40 pt-16">
          <MessageSquare className="w-8 h-8 text-accent mx-auto mb-4" />
          <h3 className="font-playfair text-2xl font-bold text-primary mb-3">Kể cho chúng tôi nghe câu chuyện của bạn</h3>
          <p className="font-bvp text-xs md:text-sm text-secondary leading-relaxed mb-6">
            Bạn có biết một "Người Nối" trong cuộc sống của mình? Một người luôn âm thầm kết nối yêu thương hay mang lại hơi ấm bằng những cử chỉ bình dị? Hãy chia sẻ câu chuyện ấy với chúng tôi để cùng lan tỏa sự ấm áp.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-2 bg-primary text-canvas font-bvp font-medium text-xs px-6 py-3.5 rounded-2 hover:bg-[#0E1220] transition-colors"
          >
            <span>Gửi câu chuyện kết nối</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

    </div>
  );
}
