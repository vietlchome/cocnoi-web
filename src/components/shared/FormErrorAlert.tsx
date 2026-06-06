"use client";

import React from "react";
import { AlertCircle, RotateCw, RefreshCw } from "lucide-react";
import type { FriendlyError } from "@/lib/utils/error-messages";

interface FormErrorAlertProps {
  error: FriendlyError;
  onRetry?: () => void;
}

export default function FormErrorAlert({ error, onRetry }: FormErrorAlertProps) {
  if (!error) return null;

  return (
    <div className="p-4 bg-rose-50 border border-rose-200 rounded-3 text-left w-full animate-fade-in shadow-xs">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-bvp text-xs md:text-sm text-rose-700 leading-relaxed mb-3">
            {error.message}
          </p>
          <div className="flex flex-wrap gap-2.5">
            {error.showRetryButton && onRetry && (
              <button 
                type="button"
                onClick={onRetry} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-2 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3.5 h-3.5" />
                <span>Thử lại</span>
              </button>
            )}
            {error.showReloadButton && (
              <button 
                type="button"
                onClick={() => window.location.reload()} 
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-2 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Tải lại trang</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
