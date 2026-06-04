import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/auth-helpers';

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
    
    // Thư mục lưu trữ tĩnh trong Next.js
    let uploadDir = path.join(process.cwd(), 'public', 'uploads');
    let relativeFolder = '';
    if (folder) {
      // Bảo vệ tránh directory traversal bằng cách chỉ lấy chữ cái và số
      relativeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, "");
      if (relativeFolder) {
        uploadDir = path.join(uploadDir, relativeFolder);
      }
    }
    
    // Tạo thư mục nếu chưa tồn tại
    await mkdir(uploadDir, { recursive: true });

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

      // Tạo tên tệp độc nhất bằng timestamp + tên ngẫu nhiên + đuôi mở rộng gốc
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const extension = path.extname(file.name) || '.jpg';
      const cleanFileName = `${uniqueSuffix}${extension}`;
      
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const filePath = path.join(uploadDir, cleanFileName);
      await writeFile(filePath, buffer);

      // Đường dẫn tĩnh truy cập từ trình duyệt
      const fileUrl = relativeFolder ? `/uploads/${relativeFolder}/${cleanFileName}` : `/uploads/${cleanFileName}`;
      uploadedUrls.push(fileUrl);
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
