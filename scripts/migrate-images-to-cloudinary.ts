import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

// Nạp các biến môi trường từ .env.local
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const mappingFile = path.join(process.cwd(), 'public', 'uploads', 'cloudinary-mapping.json');

async function walkDir(dir: string): Promise<string[]> {
  let files: string[] = [];
  if (!fs.existsSync(dir)) return [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      files = files.concat(await walkDir(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

async function run() {
  console.log("Bắt đầu quét thư mục ảnh cục bộ tại:", uploadsDir);
  if (!fs.existsSync(uploadsDir)) {
    console.log("Thư mục uploads không tồn tại, kết thúc sớm.");
    return;
  }
  
  const files = await walkDir(uploadsDir);
  console.log(`Tìm thấy ${files.length} tệp tin.`);

  const mapping: Record<string, string> = {};

  for (const file of files) {
    // Bỏ qua tệp tin mapping của chính nó
    if (file === mappingFile) continue;
    
    // Kiểm tra đuôi mở rộng
    const ext = path.extname(file).toLowerCase();
    if (!['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext)) {
      console.log(`Bỏ qua tệp không phải hình ảnh: ${path.basename(file)}`);
      continue;
    }

    const relativePath = path.relative(uploadsDir, file);
    // Xác định thư mục trên Cloudinary
    const dirName = path.dirname(relativePath);
    const cloudinaryFolder = dirName === '.' ? 'cocnoi/general' : `cocnoi/${dirName.replace(/\\/g, '/')}`;

    console.log(`Đang tải lên: ${relativePath} -> Thư mục: ${cloudinaryFolder}...`);

    try {
      const result = await cloudinary.uploader.upload(file, {
        folder: cloudinaryFolder,
        resource_type: 'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });
      console.log(`Thành công: ${relativePath} -> ${result.secure_url}`);
      
      const webPath = dirName === '.' 
        ? `/uploads/${path.basename(file)}` 
        : `/uploads/${dirName.replace(/\\/g, '/')}/${path.basename(file)}`;
        
      mapping[webPath] = result.secure_url;
    } catch (err) {
      console.error(`Lỗi khi tải lên ${relativePath}:`, err);
    }
  }

  // Lưu file mapping
  fs.writeFileSync(mappingFile, JSON.stringify(mapping, null, 2), 'utf-8');
  console.log(`Đã lưu bản đồ liên kết tại: ${mappingFile}`);
  console.log("Hoàn thành di chuyển hình ảnh!");
}

run().catch(err => {
  console.error("Gặp sự cố khi thực hiện script:", err);
});
