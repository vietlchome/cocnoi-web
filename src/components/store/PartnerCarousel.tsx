"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Sparkles, Building, Briefcase } from "lucide-react";

interface Partner {
  name: string;
  type: string;
  quote: string;
  logoText: string;
  tag: string;
}

export default function PartnerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  
  // Drag refs
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const isDragging = useRef(false);
  const lastDragTime = useRef(0);

  const partners: Partner[] = [
    {
      name: "Lộc Vừng Specialty Coffee (Hà Nội)",
      type: "Cốc riêng cho quán Café",
      quote: "Chúng tôi chọn những chiếc cốc dáng tròn trơn phác của Cốc Nối để khách ghé quán có thể cầm giữ trọn vẹn vị ấm nóng của hạt cà phê và mở ra những cuộc chuyện trò chân thành nhất.",
      logoText: "LV",
      tag: "Café Specialty",
    },
    {
      name: "Sài Gòn Books (TP. Hồ Chí Minh)",
      type: "Quà tặng doanh nghiệp",
      quote: "Đôi cốc Cốc Nối đồng điệu nhưng khác biệt nhẹ ở họa tiết là món quà ý nghĩa nhất chúng tôi gửi tặng tác giả và đối tác, thể hiện tinh thần trân trọng sự đồng điệu cùng khác biệt.",
      logoText: "SB",
      tag: "Doanh nghiệp",
    },
    {
      name: "Gieo Concept Store (Đà Nẵng)",
      type: "Nhà phân phối chính thức",
      quote: "Cốc Nối là sản phẩm gốm mộc bán chạy nhất tại hệ thống của Gieo. Khách hàng yêu thích chiếc cốc vì chất đất sông Hồng đanh thép và tinh thần chỉn chu trong từng chi tiết đóng gói.",
      logoText: "GC",
      tag: "Nhà phân phối",
    },
    {
      name: "Yên Cafe & Bistro (Đà Nẵng)",
      type: "Cốc vẽ họa tiết thủ công",
      quote: "Những nét cọ mộc mạc vẽ tay trên dáng cốc của Cốc Nối mang lại cảm giác bình yên lạ thường cho thực khách mỗi sáng ghé quán. Đây không chỉ là chiếc cốc, mà là một tác phẩm nghệ thuật.",
      logoText: "YC",
      tag: "Café & Bistro",
    },
    {
      name: "Trạm Đọc (Hà Nội)",
      type: "Quà tặng sự kiện văn hóa",
      quote: "Mỗi buổi ra mắt sách, chiếc cốc Cốc Nối mang thông điệp chạm khảm chắt chiu trở thành mảnh ghép hoàn hảo để kết nối độc giả và tác giả. Một món quà truyền cảm hứng sâu sắc.",
      logoText: "TĐ",
      tag: "Sự kiện văn hóa",
    },
    {
      name: "Ruộng Organic Hub (TP. Hồ Chí Minh)",
      type: "Đại lý bán lẻ xanh",
      quote: "Sản phẩm gốm lành tính, nung nhiệt độ cao an toàn tuyệt đối là lý do Ruộng tin tưởng giới thiệu Cốc Nối đến cộng đồng tiêu dùng bền vững. Khách hàng cực kỳ an tâm khi sử dụng hàng ngày.",
      logoText: "RO",
      tag: "Cửa hàng Organic",
    },
    {
      name: "Bản Sắc Việt Homestay (Sapa)",
      type: "Trải nghiệm văn hóa bản địa",
      quote: "Đặt chiếc cốc đất nung mộc mạc bên hiên nhà gỗ ngắm mây sương Sapa, Cốc Nối mang đến cho khách lưu trú trải nghiệm văn hóa truyền thống trọn vẹn và cảm giác gần gũi với thiên nhiên.",
      logoText: "BS",
      tag: "Du lịch & Nghỉ dưỡng",
    },
    {
      name: "Hạt Cát Concept (Nha Trang)",
      type: "Quà tặng thiết kế riêng",
      quote: "Sự tinh tế trong khâu đóng gói tỉ mỉ bằng hộp xi măng và rơm khô của Cốc Nối làm nâng tầm giá trị món quà tặng của doanh nghiệp chúng tôi. Sự phản hồi từ khách hàng cực kỳ tích cực.",
      logoText: "HC",
      tag: "Quà tặng VIP",
    },
  ];

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % partners.length);
  }, [partners.length]);

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + partners.length) % partners.length);
  }, [partners.length]);

  const handleDragStart = (clientX: number) => {
    touchStartX.current = clientX;
    touchEndX.current = 0;
    isDragging.current = true;
  };

  const handleDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    touchEndX.current = clientX;
  };

  const handleDragEnd = () => {
    if (!isDragging.current || !touchEndX.current) {
      isDragging.current = false;
      return;
    }
    
    const distance = touchStartX.current - touchEndX.current;
    if (Math.abs(distance) > 50) {
      lastDragTime.current = Date.now();
      if (distance > 0) handleNext();
      else handlePrev();
    } else if (Math.abs(distance) > 10) {
      lastDragTime.current = Date.now();
    }
    
    isDragging.current = false;
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Set up auto slide
  useEffect(() => {
    if (!isHovered) {
      autoPlayRef.current = setInterval(() => {
        handleNext();
      }, 5000); // Slide every 5 seconds
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isHovered, handleNext]);

  const getCardStyleClasses = (diff: number) => {
    if (diff === 0) {
      // Center item: Highlighted, larger, fully opaque, layered on top
      return "opacity-100 scale-100 md:scale-105 z-30 translate-x-0 border-accent/80 shadow-[0_20px_40px_rgba(194,112,62,0.12)] bg-canvas ring-1 ring-accent/20";
    }
    if (diff === -1) {
      // Left sibling: Smaller, dimmer, shifted left
      return "opacity-40 scale-85 z-20 -translate-x-[35%] sm:-translate-x-[60%] md:-translate-x-[75%] lg:-translate-x-[85%] cursor-pointer bg-canvas/80 border-border/40 hover:opacity-75 blur-[0.5px]";
    }
    if (diff === 1) {
      // Right sibling: Smaller, dimmer, shifted right
      return "opacity-40 scale-85 z-20 translate-x-[35%] sm:translate-x-[60%] md:translate-x-[75%] lg:translate-x-[85%] cursor-pointer bg-canvas/80 border-border/40 hover:opacity-75 blur-[0.5px]";
    }
    
    // Out of sight items: Kept absolute but pushed off screen and completely invisible
    if (diff < 0) {
      return "opacity-0 scale-75 z-10 -translate-x-[150%] pointer-events-none blur-sm";
    }
    return "opacity-0 scale-75 z-10 translate-x-[150%] pointer-events-none blur-sm";
  };

  return (
    <div 
      className="w-full relative py-6 flex flex-col items-center"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 3D Coverflow Container */}
      <div 
        className="relative w-full h-[400px] flex items-center justify-center overflow-hidden px-4 cursor-grab active:cursor-grabbing"
        onTouchStart={(e) => handleDragStart(e.targetTouches[0].clientX)}
        onTouchMove={(e) => handleDragMove(e.targetTouches[0].clientX)}
        onTouchEnd={handleDragEnd}
        onMouseDown={(e) => handleDragStart(e.clientX)}
        onMouseMove={(e) => handleDragMove(e.clientX)}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
      >
        {partners.map((partner, idx) => {
          let diff = idx - activeIndex;
          // Loop around wrap logic to get the shortest circular path
          if (diff < -4) diff += partners.length;
          if (diff > 4) diff -= partners.length;

          const isCenter = diff === 0;
          const cardStyle = getCardStyleClasses(diff);

          return (
            <div
              key={idx}
              onClick={(e) => {
                if (Date.now() - lastDragTime.current < 200) {
                  e.stopPropagation();
                  return;
                }
                if (diff !== 0) setActiveIndex(idx);
              }}
              className={`absolute w-[290px] sm:w-[360px] md:w-[420px] h-[340px] rounded-4 border p-6 md:p-8 flex flex-col justify-between transition-all duration-700 ease-out select-none ${cardStyle}`}
            >
              <div>
                <div className="flex items-center justify-between border-b border-border/30 pb-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#EFE9DF] border border-border flex items-center justify-center font-playfair font-bold text-xs text-primary shadow-inner">
                      {partner.logoText}
                    </div>
                    <div>
                      <h4 className="font-playfair text-xs font-bold text-primary">{partner.name.split(" (")[0]}</h4>
                      {partner.name.includes("(") && (
                        <span className="font-bvp text-[9px] text-secondary font-medium">
                          {partner.name.substring(partner.name.indexOf("("))}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="font-bvp text-[8px] md:text-[9px] font-bold text-accent bg-accent/10 border border-accent/20 px-2.5 py-1 rounded-1 uppercase tracking-wider">
                    {partner.tag}
                  </span>
                </div>
                
                <div className="relative">
                  <Quote className={`w-6 h-6 text-accent/25 absolute -left-2 -top-2.5 transition-transform duration-500 ${isCenter ? "scale-110 rotate-12" : "scale-90"}`} />
                  <p className="font-bvp text-xs leading-relaxed text-secondary italic text-justify pl-5 pr-2 pt-1">
                    "{partner.quote}"
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border/30 flex items-center justify-between">
                <div>
                  <span className="font-bvp text-[9px] text-accent font-semibold block uppercase tracking-wider">
                    {partner.type}
                  </span>
                  <span className="font-bvp text-[9px] text-secondary/70 mt-0.5 block">
                    Đồng hành cùng Cốc Nối
                  </span>
                </div>
                {isCenter ? (
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                ) : (
                  <Building className="w-4 h-4 text-secondary/40" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center gap-6 mt-6 relative z-30">
        {/* Prev Button */}
        <button
          onClick={handlePrev}
          aria-label="Đối tác trước"
          className="w-10 h-10 rounded-full border border-border bg-canvas hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm hover:shadow group"
        >
          <ChevronLeft className="w-5 h-5 text-secondary group-hover:text-accent transition-colors" />
        </button>

        {/* Paginate Dots */}
        <div className="flex items-center gap-2">
          {partners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              aria-label={`Chuyển đến đối tác ${idx + 1}`}
              className={`transition-all duration-500 rounded-full ${
                idx === activeIndex 
                  ? "bg-accent w-5 h-2" 
                  : "bg-border/60 hover:bg-accent/40 w-2 h-2"
              }`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNext}
          aria-label="Đối tác tiếp theo"
          className="w-10 h-10 rounded-full border border-border bg-canvas hover:border-accent hover:text-accent flex items-center justify-center transition-all duration-300 active:scale-95 shadow-sm hover:shadow group"
        >
          <ChevronRight className="w-5 h-5 text-secondary group-hover:text-accent transition-colors" />
        </button>
      </div>
    </div>
  );
}
