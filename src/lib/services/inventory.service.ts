import { prisma } from '@/lib/prisma';
import { LOW_STOCK_THRESHOLD } from '@/lib/constants';

export class InventoryService {
  /**
   * Kiểm tra xem sản phẩm có đủ hàng tồn kho hay không
   */
  static async checkAvailability(productId: string, quantity: number, tx?: any): Promise<boolean> {
    const client = tx || prisma;
    const product = await client.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true, isActive: true },
    });

    if (!product || !product.isActive) {
      return false;
    }

    return product.stockQuantity >= quantity;
  }

  /**
   * Giảm số lượng tồn kho (Khi khách mua hàng thành công)
   * Đảm bảo tồn kho không bao giờ bị âm (< 0)
   */
  static async decrementStock(productId: string, quantity: number, tx?: any) {
    const client = tx || prisma;

    const product = await client.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true, name: true },
    });

    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm ID "${productId}" để trừ kho!`);
    }

    // Tính toán tồn kho mới an toàn (tối thiểu là 0)
    const newStock = Math.max(0, product.stockQuantity - quantity);

    return client.product.update({
      where: { id: productId },
      data: { stockQuantity: newStock },
    });
  }

  /**
   * Tăng số lượng tồn kho (Khi hủy đơn hàng)
   */
  static async incrementStock(productId: string, quantity: number, tx?: any) {
    const client = tx || prisma;

    const product = await client.product.findUnique({
      where: { id: productId },
      select: { stockQuantity: true },
    });

    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm ID "${productId}" để hoàn kho!`);
    }

    return client.product.update({
      where: { id: productId },
      data: { stockQuantity: product.stockQuantity + quantity },
    });
  }

  /**
   * Điều chỉnh tồn kho thủ công (Admin nhập kho / kiểm kho)
   */
  static async adjustStock(productId: string, newQuantity: number) {
    if (newQuantity < 0) {
      throw new Error('Số lượng tồn kho điều chỉnh không được là số âm!');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new Error('Không tìm thấy sản phẩm để điều chỉnh tồn kho!');
    }

    return prisma.product.update({
      where: { id: productId },
      data: { stockQuantity: newQuantity },
    });
  }

  /**
   * Lấy danh sách sản phẩm sắp hết hàng (stockQuantity <= threshold)
   */
  static async getLowStockProducts(threshold = LOW_STOCK_THRESHOLD) {
    return prisma.product.findMany({
      where: {
        isActive: true,
        stockQuantity: { lte: threshold },
      },
      include: {
        category: true,
        color: true,
        size: true,
      },
      orderBy: { stockQuantity: 'asc' },
    });
  }
}
