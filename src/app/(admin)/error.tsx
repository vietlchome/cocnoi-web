'use client';

import { useEffect } from 'react';
import Link from 'next/link';

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

// TODO: File error.tsx nay nam cung cap voi AdminLayout nen se KHONG bat duoc loi
// xay ra ben trong AdminLayout (nhu ham getCockpitAlerts goi o Server Component).
// Day la dac tinh hoat dong cua Next.js (error boundary chi bat loi cho cac phan tu con).
// Neu can bat loi o cap layout, can cau hinh file global-error.tsx hoac di chuyen
// truy van du lieu xuong cac component con ben duoi.

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('Admin dashboard error caught:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center font-bvp bg-[#FAF7F2]">
      <div className="max-w-xl w-full p-8 rounded-3 bg-white border border-border/60 shadow-sm animate-slide-up">
        {/* Warning Icon */}
        <div className="w-16 h-16 mx-auto mb-6 flex items-center justify-center rounded-full bg-error/10 text-error">
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

        <h1 className="font-playfair text-3xl text-primary mb-2">
          Lỗi hệ thống quản trị
        </h1>
        
        <p className="text-secondary text-sm mb-6">
          Đã có lỗi xảy ra trong quá trình xử lý yêu cầu tại khu vực quản trị.
        </p>

        {/* Detailed Error Section for Debugging */}
        <div className="mb-8 p-4 bg-red-50 border border-red-100 rounded text-left overflow-x-auto max-h-48 text-xs font-mono text-error">
          <p className="font-semibold mb-1">Chi tiết lỗi (Developer/Admin):</p>
          <p className="whitespace-pre-wrap">{error.message || error.toString() || 'Không có thông điệp lỗi cụ thể.'}</p>
          {error.digest && <p className="mt-1 text-gray-500">Digest: {error.digest}</p>}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-pill bg-accent hover:bg-accent-hover text-white text-sm font-medium transition duration-200 shadow-sm cursor-pointer"
          >
            Thử lại
          </button>
          <Link
            href="/admin"
            className="px-6 py-2.5 rounded-pill bg-transparent hover:bg-gray-50 text-primary border border-border text-sm font-medium transition duration-200 cursor-pointer"
          >
            Về Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
