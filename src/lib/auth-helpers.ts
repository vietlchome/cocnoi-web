import { auth } from '@/auth';

/**
 * Xác thực xem người dùng hiện tại có quyền quản trị (ADMIN) hay không
 * Ném ra lỗi Unauthorized nếu không hợp lệ, ngược lại trả về thông tin session của user
 */
export async function requireAdmin() {
  const session = await auth();

  if (!session || !session.user) {
    throw new Error('Unauthorized: Bạn chưa đăng nhập hệ thống!');
  }

  if (session.user.role !== 'ADMIN') {
    throw new Error('Forbidden: Quyền truy cập bị từ chối! Yêu cầu vai trò ADMIN.');
  }

  return session;
}
