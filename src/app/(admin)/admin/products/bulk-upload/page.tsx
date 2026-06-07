import BulkUploadClient from '@/components/admin/BulkUploadClient';

export const metadata = {
  title: 'Tải sản phẩm hàng loạt - Cốc Nối Admin',
  description: 'Công cụ tải lên và cập nhật sản phẩm hàng loạt bằng file Excel',
};

export default function BulkUploadPage() {
  return <BulkUploadClient />;
}
