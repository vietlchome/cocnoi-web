"use client";

import React, { useState } from "react";
import { Check, Copy } from "lucide-react";

interface PaymentInfo {
  showQr: boolean;
  qrImage: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  transferNote: string;
  codAvailable: boolean;
  codNote: string;
}

interface PaymentInstructionsBlockProps {
  paymentInfo: PaymentInfo;
  selectedMethod?: "bank_transfer" | "cod";
}

export default function PaymentInstructionsBlock({ paymentInfo, selectedMethod = "bank_transfer" }: PaymentInstructionsBlockProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!paymentInfo) return null;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (selectedMethod === "cod") {
    // COD: compact block, 2-3 lines, no details
    return (
      <div className="bg-subtle/30 border border-border rounded-4 p-3 font-bvp">
        <h4 className="font-playfair text-sm font-semibold text-primary mb-1">Thanh toán khi nhận hàng</h4>
        <p className="text-xs text-secondary leading-relaxed">{paymentInfo.codNote}</p>
      </div>
    );
  }

  // bank_transfer: QR + bank info compact (no COD section)
  return (
    <div className="bg-subtle/30 border border-border rounded-4 p-3 font-bvp">
      <h4 className="font-playfair text-sm font-semibold text-primary mb-3 text-center">Chuyển khoản ngân hàng</h4>
      
      {paymentInfo.showQr && paymentInfo.qrImage && (
        <div className="flex justify-center mb-3">
          <img src={paymentInfo.qrImage} alt="QR chuyển khoản" className="w-40 h-40 md:w-44 md:h-44 rounded-2 border border-border object-contain bg-white" />
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
        <div>
          <span className="text-secondary block text-[10px]">Ngân hàng</span>
          <span className="font-semibold text-primary">{paymentInfo.bankName}</span>
        </div>
        <div>
          <span className="text-secondary block text-[10px]">Số TK</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono font-bold text-primary">{paymentInfo.accountNumber}</span>
            <button
              onClick={() => handleCopy(paymentInfo.accountNumber, "accountNumber")}
              className="p-0.5 hover:bg-subtle rounded text-secondary hover:text-accent transition-colors"
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
        <div>
          <span className="text-secondary block text-[10px]">Chủ TK</span>
          <span className="font-semibold text-primary uppercase">{paymentInfo.accountHolder}</span>
        </div>
        <div>
          <span className="text-secondary block text-[10px]">Nội dung CK</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-mono text-xs text-accent font-semibold">{paymentInfo.transferNote}</span>
            <button
              onClick={() => handleCopy(paymentInfo.transferNote, "transferNote")}
              className="p-0.5 hover:bg-subtle rounded text-secondary hover:text-accent transition-colors shrink-0"
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
    </div>
  );
}
