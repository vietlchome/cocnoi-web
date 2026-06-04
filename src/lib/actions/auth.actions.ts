'use server';

import { signIn, signOut } from '@/auth';
import { AuthError } from 'next-auth';

/**
 * Server Action xử lý đăng nhập bằng Credentials (Email & Password)
 */
export async function authenticate(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    // Gọi signIn của NextAuth sử dụng Credentials provider
    await signIn('credentials', Object.fromEntries(formData));
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Email hoặc mật khẩu không chính xác!';
        default:
          return 'Đã xảy ra lỗi hệ thống khi đăng nhập!';
      }
    }
    // Cần throw error đối với lỗi REDIRECT của NextAuth để nó chuyển trang thành công
    throw error;
  }
}

/**
 * Server Action xử lý đăng xuất và chuyển hướng về trang chủ đăng nhập
 */
export async function logout() {
  try {
    await signOut({ redirectTo: '/login' });
  } catch (error) {
    // NextAuth sử dụng redirect lỗi nội bộ nên cần ném lỗi ra
    throw error;
  }
}
