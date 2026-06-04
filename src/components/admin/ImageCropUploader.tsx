"use client";

import { useState, useRef, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Upload, X, Check, Image as ImageIcon, Loader } from "lucide-react";

interface ImageCropUploaderProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  aspectRatio?: number; // Ví dụ: 16/9, 1, 1.91
  recommendedSize?: string;
  folder?: string; // Tên thư mục con lưu ảnh (vd: "products")
}

// Hàm bổ trợ chuyển đổi hình ảnh sang Canvas để thực hiện crop phía Client
const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Tránh lỗi CORS canvas
    image.src = url;
  });

interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: PixelCrop
): Promise<Blob | null> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  // Đặt kích thước canvas bằng kích thước vùng crop thực tế
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Vẽ phần ảnh được cắt lên canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Chuyển đổi canvas thành Blob
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg", 0.9);
  });
};

export default function ImageCropUploader({
  label,
  value,
  onChange,
  aspectRatio,
  recommendedSize,
  folder,
}: ImageCropUploaderProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result as string);
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUpload = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      // 1. Cắt ảnh bằng Canvas API phía Client
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Không thể cắt hình ảnh.");

      // 2. Chuẩn bị dữ liệu tải lên
      const formData = new FormData();
      formData.append("file", croppedBlob, "upload.jpg");
      if (folder) {
        formData.append("folder", folder);
      }

      // 3. Tải lên server qua API
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Tải ảnh lên máy chủ thất bại.");

      const data = await res.json();
      if (data.success && data.url) {
        onChange(data.url); // Trả URL về cho Form cha
        setImageSrc(null); // Đóng modal crop
      } else {
        alert(data.error || "Gặp lỗi khi tải ảnh.");
      }
    } catch (error: any) {
      alert(error.message || "Đã xảy ra lỗi khi cắt và tải ảnh.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full flex flex-col gap-2 font-bvp text-xs">
      <div className="flex flex-col gap-0.5">
        <label className="font-bold text-secondary">{label}</label>
        {recommendedSize && (
          <span className="text-[10px] text-accent font-semibold">
            Kích thước khuyến dùng: {recommendedSize}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4 p-4 border border-border/80 rounded-3 bg-canvas/30">
        {/* Preview Frame */}
        <div className="w-20 h-20 shrink-0 rounded-2 border border-border/60 bg-subtle flex items-center justify-center overflow-hidden relative group">
          {value ? (
            <>
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange("")}
                className="absolute inset-0 bg-brick/80 text-canvas opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer text-[10px] font-bold"
              >
                Xóa ảnh
              </button>
            </>
          ) : (
            <ImageIcon className="w-6 h-6 text-secondary/40" />
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-grow flex flex-col gap-1.5">
          <input
            type="file"
            accept="image/*"
            onChange={onFileChange}
            ref={fileInputRef}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 border border-border hover:border-accent hover:text-accent font-bold rounded-2 bg-canvas transition-colors cursor-pointer w-fit"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>{value ? "Thay ảnh khác" : "Chọn ảnh tải lên"}</span>
          </button>
          <p className="text-[10px] text-secondary">
            {value ? "Bấm nút trên để thay thế ảnh hiện tại." : "Hỗ trợ định dạng JPG, PNG, WEBP."}
          </p>
        </div>
      </div>

      {/* Modal Crop Ảnh (Chỉ hiện khi đã chọn file) */}
      {imageSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/80 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-canvas border border-border rounded-4 w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between bg-subtle/30">
              <div>
                <h4 className="font-playfair font-bold text-base text-primary">Cắt hình ảnh đúng tỉ lệ</h4>
                <p className="font-bvp text-xs text-secondary mt-0.5">
                  Di chuyển và phóng to ảnh để khớp đúng vùng hiển thị
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImageSrc(null)}
                className="text-secondary hover:text-primary p-1 border border-border rounded-2 hover:bg-canvas transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Cropper Container */}
            <div className="relative flex-grow min-h-[350px] bg-[#1e293b]">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Modal Controls Footer */}
            <div className="px-6 py-4 border-t border-border/60 bg-subtle/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <span className="text-[10px] font-bold text-secondary uppercase shrink-0">Thu phóng:</span>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-border rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0 justify-end">
                <button
                  type="button"
                  onClick={() => setImageSrc(null)}
                  className="px-4 py-2 border border-border hover:bg-subtle text-secondary rounded-2 transition-colors text-xs font-bold w-1/2 sm:w-auto cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={uploading}
                  className="px-5 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/50 text-canvas font-bold rounded-2 transition-colors flex items-center justify-center gap-1.5 text-xs w-1/2 sm:w-auto cursor-pointer"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang xử lý...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Cắt & Tải ảnh lên</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
