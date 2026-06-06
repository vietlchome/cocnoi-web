"use client";

import React, { useState } from "react";
import { Check, Copy, CreditCard, DollarSign } from "lucide-react";

interface PaymentInstructionsBlockProps {
  paymentInfo: {
    showQr: boolean;
    qrImage: string;
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    transferNote: string;
    codAvailable: boolean;
    codNote: string;
  };
}

export default function PaymentInstructionsBlock({ paymentInfo }: PaymentInstructionsBlockProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!paymentInfo) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="bg-[#FAF8F5] border border-border/70 rounded-4 p-6 md:p-8 text-left w-full max-w-xl mx-auto shadow-sm">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-border/50">
        <CreditCard className="w-5 h-5 text-accent" style={{ color: "var(--color-terracotta)" }} />
        <h4 className="font-playfair text-lg font-bold text-primary">Hướng dẫn thanh toán</h4>
      </div>

      {paymentInfo.showQr && paymentInfo.qrImage && (
        <div className="flex flex-col items-center mb-6 bg-canvas p-4 rounded-3 border border-border/40 max-w-xs mx-auto">
          <img 
            src={paymentInfo.qrImage} 
            alt="QR Code thanh toán chuyển khoản" 
            className="w-48 h-48 md:w-56 md:h-56 object-contain rounded-2"
          />
          <span className="font-bvp text-[11px] text-secondary mt-2 text-center">
            Quét mã QR bằng ứng dụng ngân hàng của bạn
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {/* Bank Name */}
        <div className="flex justify-between items-center text-xs md:text-sm border-b border-border/40 pb-2.5">
          <span className="font-bvp text-secondary">Ngân hàng</span>
          <span className="font-semibold text-primary">{paymentInfo.bankName}</span>
        </div>

        {/* Account Number */}
        <div className="flex justify-between items-center text-xs md:text-sm border-b border-border/40 pb-2.5">
          <span className="font-bvp text-secondary">Số tài khoản</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-primary">{paymentInfo.accountNumber}</span>
            <button
              onClick={() => handleCopy(paymentInfo.accountNumber, "accountNumber")}
              className="p-1 hover:bg-subtle rounded text-secondary hover:text-accent transition-colors"
              title="Sao chép"
              type="button"
            >
              {copiedField === "accountNumber" ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Account Holder */}
        <div className="flex justify-between items-center text-xs md:text-sm border-b border-border/40 pb-2.5">
          <span className="font-bvp text-secondary">Chủ tài khoản</span>
          <span className="font-semibold text-primary uppercase">{paymentInfo.accountHolder}</span>
        </div>

        {/* Transfer Note */}
        <div className="flex justify-between items-start text-xs md:text-sm border-b border-border/40 pb-2.5">
          <span className="font-bvp text-secondary mt-1">Cú pháp chuyển khoản</span>
          <div className="flex items-center gap-2">
            <span className="font-mono bg-subtle px-2 py-1 rounded text-accent font-semibold text-xs text-right break-all max-w-[200px]">
              {paymentInfo.transferNote}
            </span>
            <button
              onClick={() => handleCopy(paymentInfo.transferNote, "transferNote")}
              className="p-1 hover:bg-subtle rounded text-secondary hover:text-accent transition-colors shrink-0"
              title="Sao chép"
              type="button"
            >
              {copiedField === "transferNote" ? (
                <Check className="w-3.5 h-3.5 text-green-600" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {paymentInfo.codAvailable && (
        <div className="mt-6 pt-5 border-t border-dashed border-border/60">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4.5 h-4.5 text-accent" style={{ color: "var(--color-terracotta)" }} />
            <h5 className="font-playfair text-sm font-bold text-primary">Thanh toán khi nhận hàng (COD)</h5>
          </div>
          <p className="font-bvp text-xs text-secondary leading-relaxed pl-6">
            {paymentInfo.codNote}
          </p>
        </div>
      )}
    </div>
  );
}
