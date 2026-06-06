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
      <div className="bg-subtle/30 border border-border rounded-4 p-5">
        <h4 className="font-playfair text-base font-semibold text-primary mb-2">Thanh toán khi nhận hàng</h4>
        <p className="font-bvp text-sm text-secondary leading-relaxed">{paymentInfo.codNote}</p>
      </div>
    );
  }

  // bank_transfer: QR + bank info compact (no COD section)
  return (
    <div className="bg-subtle/30 border border-border rounded-4 p-5">
      <h4 className="font-playfair text-base font-semibold text-primary mb-4">Chuyển khoản theo thông tin sau</h4>
      {paymentInfo.showQr && paymentInfo.qrImage && (
        <div className="flex justify-center mb-4">
          <img src={paymentInfo.qrImage} alt="QR chuyển khoản" className="w-40 h-40 rounded-2 border border-border" />
        </div>
      )}
      <div className="flex flex-col gap-2 text-sm">
        <div className="flex justify-between">
          <span className="text-secondary">Ngân hàng</span>
          <span className="font-semibold">{paymentInfo.bankName}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary">Số TK</span>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold">{paymentInfo.accountNumber}</span>
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
        <div className="flex justify-between">
          <span className="text-secondary">Chủ TK</span>
          <span className="font-semibold uppercase">{paymentInfo.accountHolder}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-secondary">Nội dung CK</span>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs">{paymentInfo.transferNote}</span>
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
    </div>
  );
}
