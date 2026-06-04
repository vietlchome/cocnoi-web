import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  const isAdminRoute = nextUrl.pathname.startsWith('/admin');
  const isAdminApiRoute = nextUrl.pathname.startsWith('/api/admin') || nextUrl.pathname === '/api/upload';
  const isAuthRoute = nextUrl.pathname.startsWith('/login');

  // 1. Bảo vệ API Admin (/api/admin/* và /api/upload)
  if (isAdminApiRoute) {
    if (!isLoggedIn) {
      return new Response(
        JSON.stringify({ success: false, error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    if (userRole !== 'ADMIN') {
      return new Response(
        JSON.stringify({ success: false, error: 'Forbidden' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  // 2. Bảo vệ Route Admin (/admin/*)
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const redirectUrl = new URL('/login', nextUrl);
      redirectUrl.searchParams.set('callbackUrl', nextUrl.pathname);
      return Response.redirect(redirectUrl);
    }
    if (userRole !== 'ADMIN') {
      return Response.redirect(new URL('/', nextUrl));
    }
  }

  // 3. Chuyển hướng khỏi trang /login nếu đã đăng nhập
  if (isAuthRoute && isLoggedIn) {
    return Response.redirect(new URL('/', nextUrl));
  }
});

export const config = {
  // Matcher khớp với:
  // - Tất cả route admin (/admin, /admin/...)
  // - Tất cả API admin (/api/admin, /api/admin/...)
  // - API upload (/api/upload)
  // - Trang login (/login)
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/upload', '/login'],
};
