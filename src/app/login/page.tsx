"use client"

import { useActionState } from 'react'
import { authenticate } from '@/lib/actions/auth.actions'
import { AlertCircle, ArrowLeft, KeyRound } from 'lucide-react'
import Link from 'next/link'

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(authenticate, undefined)

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FEFCF9] font-bvp px-4 select-none">
      <div className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-white rounded-3xl shadow-md border border-border/40 relative overflow-hidden">
        
        {/* Subtle decorative top border in brand accent color */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#C2703E]" />

        {/* Back link */}
        <div className="flex items-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:text-accent transition-colors group cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>Quay lại cửa hàng</span>
          </Link>
        </div>

        {/* Brand header */}
        <div className="text-center space-y-3">
          <div className="mx-auto w-12 h-12 rounded-full bg-[#131829] flex items-center justify-center text-canvas shadow-sm">
            <svg viewBox="0 0 300 300" className="w-7 h-7 fill-current">
              <path d="M198.5,143.2c1.6,2.6,3,4.6,4.1,6.8c6.5,12.8,2.1,26.5-10.7,33.1c-3.9,2-7.9,3.8-11.9,5.6c-5.9,2.6-6.9,7.1-2.8,11.9c4.6,5.4,15,7.1,20.5,2.7c4.6-3.7,8.8-8.2,12.6-12.8c8.2-10,14.6-20.8,14.4-34.4c-0.3-15.7-7.5-28.1-18.7-38.3c-12.2-11.1-26.2-18.5-43.2-17.2c-20.6,1.5-32.6,14.7-40.9,32c-3.8,8-6.3,16.4-3,25.5c1.4,3.8,3.5,6.3,7.5,6.4c4.7,0.1,6.2-3.3,7.1-7.3c1.4-5.9,2.5-11.8,4.2-17.5c3.6-11.4,12.3-17.6,24.4-16.9C177.8,123.7,188.9,132.8,198.5,143.2z" className="fill-[#FEFCF9]" />
              <path d="M94.4,68.8c15.3-16,35.4-18.8,56.1-18.3c20.6,0.5,39.8,6.4,56.6,18.9c9.4,7,18.9,13.9,25.7,23.8c13.7,20.1,20.1,41.8,15.9,66.5c-3.2,18.6-8.2,36.4-19.1,51.8c-13.5,19-32,31.5-55.2,35.7c-26.5,4.8-52.2,2.8-76.4-10.4c-10.7-5.8-19.2-13.9-25-24.7c-1-1.9-2.2-3.6-3.5-5.3c-23.8-30.5-24.2-63.2-10-97.7C66.7,91.7,77.8,78.1,94.4,68.8z M94.3,102.7c-19.6,13.2-25.6,35.1-16.9,56.2c4.2,10.2,10.6,19.2,19,26.3c15.7,13.3,33.2,17.9,52.5,8.7c10.4-4.9,19.1-12.3,26.6-21.1c4.8-5.7,4.6-15-0.3-20.8c-4.8-5.6-10.3-5-13.4,1.7c-1,2.2-1.8,4.5-2.8,6.8c-8.3,19.8-24.7,24.7-42,12c-9-6.6-15.5-15.5-19.3-26c-6.4-18,0.8-31.1,19.2-36.1c4.9-1.3,10-1.9,14.6-3.8c2.3-0.9,4.8-3.8,5.1-6c0.3-2.1-1.8-5.8-3.7-6.5c-4.4-1.6-9.5-2.7-14.1-2.3C109.6,92.9,101.2,96.9,94.3,102.7z" className="fill-[#FEFCF9] opacity-30" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-playfair font-bold text-[#131829]">Đăng nhập Cốc Nối</h1>
            <p className="text-xs text-secondary mt-1 max-w-[280px] mx-auto leading-relaxed">
              Cổng thông tin dành cho Quản trị viên và Đối tác của Cốc Nối Ceramic
            </p>
          </div>
        </div>

        <form action={formAction} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-secondary uppercase tracking-wider" htmlFor="email">
              Địa chỉ Email
            </label>
            <input
              className="w-full text-sm bg-canvas border border-border/80 px-4 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-[#C2703E]/20 focus:border-[#C2703E] transition-all text-[#131829]"
              id="email"
              type="email"
              name="email"
              placeholder="admin@cocnoi.vn"
              required
            />
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-secondary uppercase tracking-wider" htmlFor="password">
                Mật khẩu
              </label>
            </div>
            <input
              className="w-full text-sm bg-canvas border border-border/80 px-4 py-3 rounded-2 focus:outline-none focus:ring-2 focus:ring-[#C2703E]/20 focus:border-[#C2703E] transition-all text-[#131829]"
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              required
            />
          </div>

          {errorMessage && (
            <div className="flex items-center p-3 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg animate-fade-in font-semibold">
              <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending}
            className="w-full px-5 py-3 text-canvas font-bold text-xs bg-[#C2703E] hover:bg-[#a85f34] rounded-2 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed uppercase tracking-wider"
          >
            {isPending ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Đang xác minh...</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5" />
                <span>Đăng nhập hệ thống</span>
              </>
            )}
          </button>
        </form>
        
        {/* Safe footer message */}
        <div className="text-center font-semibold text-[10px] text-secondary/60 pt-2 border-t border-border/30">
          © {new Date().getFullYear()} Cốc Nối Ceramic. All rights reserved.
        </div>
      </div>
    </div>
  )
}
