import type { NextAuthConfig } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
// Không import Prisma ở đây để tránh lỗi Edge Runtime trong Middleware

export const authConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      // LUU Y QUAN TRONG: Khong duoc import Prisma hoac thuc hien bat ky truy van database nao o day.
      // File nay duoc tai va chay boi Middleware tren Edge Runtime. Khi do, Prisma hoac cac thu vien
      // Node.js truyen thong se gay ra loi.
      // Ham authorize o day bat buoc phai tra ve null. Logic xac thuc/truy van thuc te duoc viet tai src/auth.ts (Node Runtime).
      async authorize(credentials) {
        // Validation logic sẽ được mở rộng ở auth.ts (vì cần prisma để tra cứu DB)
        // Đây chỉ là khung để next-auth nhận diện Provider
        return null; 
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.role = token.role as string;
        session.user.id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/login',
  }
} satisfies NextAuthConfig
