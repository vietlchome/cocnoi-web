import React from "react";
import OrderTrackingClient from "./OrderTrackingClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tra cứu đơn hàng | Cốc Nối",
  description: "Tra cứu tình trạng đơn hàng và gửi đánh giá sản phẩm của bạn tại Cốc Nối.",
};

export default function OrderTrackingPage() {
  return (
    <div className="w-full min-h-[70vh] bg-canvas py-16 px-4 md:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <span className="font-bvp text-[10px] font-bold text-accent uppercase tracking-[0.2em] mb-4 block">
            Cốc Nối Services
          </span>
          <h1 className="font-playfair text-3xl md:text-5xl font-bold text-primary mb-5">
            Tra cứu đơn hàng
          </h1>
          <p className="font-bvp text-sm md:text-base text-secondary/80 max-w-xl mx-auto leading-relaxed">
            Nhập mã đơn hàng điện tử của bạn để kiểm tra tình trạng giao hàng và chia sẻ đánh giá về trải nghiệm sản phẩm cùng Cốc Nối.
          </p>
        </div>
        
        <OrderTrackingClient />
      </div>
    </div>
  );
}
