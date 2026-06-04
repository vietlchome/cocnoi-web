'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function StoreError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // In chi tiet loi ra console de kiem tra, tranh hien thi ra giao dien cho nguoi dung
    console.error('Storefront error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center font-bvp bg-canvas">
      <div className="max-w-md w-full py-12 px-6 rounded-3 bg-subtle border border-border/40 shadow-sm animate-slide-up">
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-accent/10 text-accent">
          <svg
            className="w-8 h-8"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        <h1 className="font-playfair text-3xl text-primary mb-4">
          Đã xảy ra lỗi
        </h1>

        <p className="text-secondary text-sm md:text-base mb-8 leading-relaxed">
          Hệ thống gặp sự cố ngoài ý muốn khi đang tải trang. Quý khách vui lòng thử lại hoặc quay về trang chủ để tiếp tục mua sắm.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-pill bg-accent hover:bg-accent-hover text-white text-sm font-medium transition duration-200 shadow-sm cursor-pointer"
          >
            Thử lại
          </button>
          <Link
            href="/"
            className="px-6 py-2.5 rounded-pill bg-transparent hover:bg-subtle text-primary border border-border text-sm font-medium transition duration-200 cursor-pointer"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}
