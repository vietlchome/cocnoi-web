import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-helpers';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  // 1. Phân quyền: Chỉ ADMIN được tải ảnh lên
  try {
    await requireAdmin();
  } catch (authError: any) {
    return NextResponse.json(
      { error: authError.message || 'Unauthorized' },
      { status: authError.message.includes('Forbidden') ? 403 : 401 }
    );
  }

  try {
    const formData = await req.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string | null;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'Không tìm thấy file nào được tải lên.' }, { status: 400 });
    }

    const uploadedUrls: string[] = [];
    
    let relativeFolder = '';
    if (folder) {
      // Bảo vệ tránh directory traversal bằng cách chỉ lấy chữ cái và số
      relativeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
    }

    for (const file of files) {
      // Đảm bảo file là ảnh
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ error: `File ${file.name} không phải là hình ảnh.` }, { status: 400 });
      }

      // Giới hạn 5MB
      const MAX_SIZE = 5 * 1024 * 1024;
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `Kích thước hình ảnh ${file.name} vượt quá 5MB.` }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Tải lên Cloudinary
      const result = await new Promise<any>((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            folder: relativeFolder ? `cocnoi/${relativeFolder}` : 'cocnoi/general',
            resource_type: 'image',
            // Tối ưu hóa tự động: format webp và chất lượng tự động
            transformation: [{ quality: 'auto', fetch_format: 'auto' }],
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      uploadedUrls.push(result.secure_url);
    }

    return NextResponse.json({ 
      success: true, 
      urls: uploadedUrls,
    });

  } catch (error: any) {
    console.error('Lỗi khi upload ảnh:', error);
    return NextResponse.json({ error: 'Đã xảy ra lỗi hệ thống khi tải ảnh lên.' }, { status: 500 });
  }
}
