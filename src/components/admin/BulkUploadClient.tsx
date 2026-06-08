'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, Upload, Download, AlertTriangle, 
  AlertCircle, CheckCircle2, Loader2, FileSpreadsheet 
} from 'lucide-react';

type UploadMode = 'create' | 'stock' | 'price';
type ConflictResolution = 'skip' | 'update' | 'error';

interface PreviewRow {
  rowNum: number;
  sku: string;
  name?: string;
  status: 'OK_CREATE' | 'OK_UPDATE' | 'WARNING_DUPLICATE' | 'WARNING_NOT_FOUND' | 'ERROR_VALIDATION';
  errors: string[];
  newStock?: number;
  newPrice?: number;
  newCompareAtPrice?: number | null;
  data?: any;
}

export default function BulkUploadClient() {
  const [mode, setMode] = useState<UploadMode>('create');
  const [file, setFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [previewRows, setPreviewRows] = useState<PreviewRow[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [conflictResolution, setConflictResolution] = useState<ConflictResolution>('skip');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Trạng thái sau khi commit thành công
  const [commitResult, setCommitResult] = useState<{
    created: number;
    updated: number;
    skipped: number;
  } | null>(null);
  const [isCommitting, setIsCommitting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleModeChange = (newMode: UploadMode) => {
    setMode(newMode);
    setFile(null);
    setPreviewRows([]);
    setTotalRows(0);
    setErrorMsg(null);
    setCommitResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragActive(true);
    } else if (e.type === 'dragleave') {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      if (validateFileType(selectedFile)) {
        setFile(selectedFile);
        handleUpload(selectedFile);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFileType(selectedFile)) {
        setFile(selectedFile);
        handleUpload(selectedFile);
      }
    }
  };

  const validateFileType = (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext !== 'xlsx') {
      setErrorMsg('Vui lòng chỉ tải lên tệp Excel định dạng .xlsx');
      return false;
    }
    setErrorMsg(null);
    return true;
  };

  const handleUpload = async (uploadingFile: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setCommitResult(null);
    setPreviewRows([]);

    const formData = new FormData();
    formData.append('file', uploadingFile);
    formData.append('mode', mode);

    try {
      const res = await fetch('/api/admin/products/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi phân tích file Excel.');
      }

      setPreviewRows(data.preview || []);
      setTotalRows(data.totalRows || 0);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi mạng khi tải lên tệp.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommit = async () => {
    if (previewRows.length === 0 || isCommitting) return;

    setIsCommitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/admin/products/bulk-commit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode,
          rows: previewRows,
          conflictResolution: mode === 'create' ? conflictResolution : 'skip',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Lỗi ghi nhận dữ liệu hàng loạt.');
      }

      setCommitResult({
        created: data.created,
        updated: data.updated,
        skipped: data.skipped,
      });
      setPreviewRows([]);
      setFile(null);
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi mạng khi thực hiện lưu dữ liệu.');
    } finally {
      setIsCommitting(false);
    }
  };

  const getStatusBadge = (status: PreviewRow['status']) => {
    switch (status) {
      case 'OK_CREATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">✓ SẼ TẠO</span>;
      case 'OK_UPDATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">✓ SẼ CẬP NHẬT</span>;
      case 'WARNING_DUPLICATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">⚠ TRÙNG SKU</span>;
      case 'WARNING_NOT_FOUND':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">⚠ KHÔNG TÌM THẤY</span>;
      case 'ERROR_VALIDATION':
        return <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">✗ LỖI DỮ LIỆU</span>;
    }
  };

  const errorCount = previewRows.filter(r => r.status === 'ERROR_VALIDATION').length;
  const warningCount = previewRows.filter(r => r.status.startsWith('WARNING_')).length;
  const successCount = previewRows.length - errorCount - warningCount;

  return (
    <div className="flex flex-col gap-6 max-w-6xl mx-auto p-4 md:p-6 font-bvp select-none">
      
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/products" 
          className="p-2 border border-gray-200 hover:border-gray-300 hover:bg-gray-50 rounded-xl transition-all"
        >
          <ArrowLeft className="w-4 h-4 text-primary" />
        </Link>
        <div>
          <h1 className="font-playfair text-2xl font-bold text-primary">Tải Lên Sản Phẩm Hàng Loạt</h1>
          <p className="text-xs text-secondary">Thêm mới hoặc cập nhật thông tin sản phẩm bằng tệp Excel</p>
        </div>
      </div>

      {/* Hướng dẫn quy trình nhập hàng loạt */}
      <div className="bg-canvas border border-border/40 rounded-3xl p-6 shadow-xs flex flex-col gap-4">
        <h2 className="font-playfair text-base font-bold text-primary flex items-center gap-2">
          <FileSpreadsheet className="w-5 h-5 text-accent" />
          <span>Quy trình nhập sản phẩm hàng loạt (Excel Bulk Upload)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs text-secondary leading-relaxed">
          <div className="flex flex-col gap-1.5 p-4 bg-[#FAF7F2] rounded-2xl border border-border/10">
            <span className="font-bold text-accent uppercase tracking-widest text-[9px]">Bước 1</span>
            <p className="font-bold text-primary">Thiết lập metadata trước</p>
            <p>Tạo danh mục (Category), Bộ sưu tập (BST), Màu sắc và Kích thước tại mục cấu hình trước khi nhập file.</p>
          </div>
          <div className="flex flex-col gap-1.5 p-4 bg-[#FAF7F2] rounded-2xl border border-border/10">
            <span className="font-bold text-accent uppercase tracking-widest text-[9px]">Bước 2</span>
            <p className="font-bold text-primary">Tải tệp Excel mẫu</p>
            <p>Chọn thao tác phù hợp ở dưới và bấm nút tải template để lấy file chuẩn đã tích hợp dropdown dữ liệu từ DB.</p>
          </div>
          <div className="flex flex-col gap-1.5 p-4 bg-[#FAF7F2] rounded-2xl border border-border/10">
            <span className="font-bold text-accent uppercase tracking-widest text-[9px]">Bước 3</span>
            <p className="font-bold text-primary">Điền thông tin gốm</p>
            <p>Nhập dữ liệu vào tệp. Chỉ chọn các ô phân loại từ danh sách có sẵn. Để trống cột SKU để tự sinh mã CN0001+.</p>
          </div>
          <div className="flex flex-col gap-1.5 p-4 bg-[#FAF7F2] rounded-2xl border border-border/10">
            <span className="font-bold text-accent uppercase tracking-widest text-[9px]">Bước 4</span>
            <p className="font-bold text-primary">Upload & Lưu</p>
            <p>Kéo thả tệp vào vùng tải lên, kiểm tra bảng xem trước để phát hiện lỗi, chọn cơ chế đè/bỏ qua trùng và commit.</p>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <p className="font-semibold leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {commitResult && (
        <div className="flex flex-col gap-4 p-5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <h3 className="font-bold text-sm text-emerald-900">Lưu dữ liệu hàng loạt thành công!</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 bg-white/60 p-3.5 rounded-xl border border-emerald-100 font-bold">
            <div>Tạo mới: <span className="text-emerald-700">{commitResult.created} sản phẩm</span></div>
            <div>Cập nhật: <span className="text-emerald-700">{commitResult.updated} sản phẩm</span></div>
            <div>Bỏ qua: <span className="text-secondary">{commitResult.skipped} dòng</span></div>
          </div>
          <div className="flex justify-end gap-3 mt-1">
            <Link 
              href="/admin/products"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all"
            >
              Xem danh sách sản phẩm
            </Link>
            <button 
              onClick={() => setCommitResult(null)}
              className="px-4 py-2 border border-emerald-300 hover:bg-emerald-100 font-bold rounded-xl transition-all"
            >
              Đóng thông báo
            </button>
          </div>
        </div>
      )}

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white border border-gray-100 p-5 rounded-3xl shadow-xs">
        
        {/* Mode Selector */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Chọn thao tác</label>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
              <input 
                type="radio" 
                name="uploadMode" 
                value="create" 
                checked={mode === 'create'}
                onChange={() => handleModeChange('create')}
                className="accent-accent"
              />
              <div>
                <p className="font-bold text-xs text-primary">Tạo sản phẩm mới hàng loạt</p>
                <p className="text-[10px] text-secondary mt-0.5">Thêm mẫu mã gốm mới vào catalog</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
              <input 
                type="radio" 
                name="uploadMode" 
                value="stock" 
                checked={mode === 'stock'}
                onChange={() => handleModeChange('stock')}
                className="accent-accent"
              />
              <div>
                <p className="font-bold text-xs text-primary">Cập nhật tồn kho sản phẩm</p>
                <p className="text-[10px] text-secondary mt-0.5">Thay đổi số lượng tồn kho theo SKU</p>
              </div>
            </label>
            <label className="flex items-center gap-3 p-3.5 border border-gray-200 rounded-2xl cursor-pointer hover:bg-gray-50 transition-all">
              <input 
                type="radio" 
                name="uploadMode" 
                value="price" 
                checked={mode === 'price'}
                onChange={() => handleModeChange('price')}
                className="accent-accent"
              />
              <div>
                <p className="font-bold text-xs text-primary">Cập nhật giá bán sản phẩm</p>
                <p className="text-[10px] text-secondary mt-0.5">Điều chỉnh giá bán & giá so sánh theo SKU</p>
              </div>
            </label>
          </div>
        </div>

        {/* Template Download */}
        <div className="flex flex-col gap-3 justify-between">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-secondary uppercase tracking-wider">Tải tệp Excel mẫu</label>
            <p className="text-xs text-secondary leading-relaxed">
              Vui lòng tải tệp mẫu chuẩn tương ứng với thao tác đã chọn để đảm bảo định dạng cột khớp chính xác với hệ thống.
            </p>
          </div>
          <a 
            href={`/api/admin/products/bulk-template?mode=${mode}`}
            className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-accent/40 text-accent hover:border-accent hover:bg-accent/5 font-bold text-xs rounded-2xl transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>TẢI TEMPLATE EXCEL ({mode.toUpperCase()})</span>
          </a>
        </div>

        {/* Upload Box / Dropzone */}
        <div className="flex flex-col gap-3">
          <label className="text-xs font-bold text-secondary uppercase tracking-wider">Tải lên file dữ liệu</label>
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex-grow flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
              isDragActive 
                ? 'border-accent bg-accent/5 text-accent' 
                : file 
                  ? 'border-emerald-300 bg-emerald-50/20 text-emerald-800' 
                  : 'border-gray-200 hover:border-gray-300 text-secondary'
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx"
              className="hidden"
            />
            {isLoading ? (
              <>
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <span className="text-xs font-bold">Đang phân tích file...</span>
              </>
            ) : file ? (
              <>
                <FileSpreadsheet className="w-8 h-8 text-emerald-600 animate-bounce" />
                <span className="text-xs font-bold text-emerald-900 truncate max-w-[200px]">{file.name}</span>
                <span className="text-[10px] text-emerald-600">Bấm để thay đổi tệp</span>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 opacity-60" />
                <span className="text-xs font-bold">Kéo thả hoặc Click để tải file</span>
                <span className="text-[9px] opacity-75">Hỗ trợ định dạng .xlsx</span>
              </>
            )}
          </div>
        </div>

      </div>

      {/* Preview Section */}
      {previewRows.length > 0 && (
        <div className="flex flex-col gap-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
          
          <div className="flex items-center justify-between border-b border-gray-100 pb-3 flex-wrap gap-4">
            <div>
              <h2 className="font-playfair text-lg font-bold text-primary">Xem Trước Dòng Dữ Liệu</h2>
              <p className="text-xs text-secondary mt-0.5">Xem trước dòng Excel trước khi lưu chính thức vào DB</p>
            </div>
            
            {/* Conflict resolution logic (Only for create mode) */}
            {mode === 'create' && (
              <div className="flex items-center gap-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Khi trùng SKU:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary">
                  <input 
                    type="radio" 
                    name="conflictResolution" 
                    value="skip" 
                    checked={conflictResolution === 'skip'}
                    onChange={() => setConflictResolution('skip')}
                    className="accent-accent"
                  />
                  <span>Bỏ qua</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary">
                  <input 
                    type="radio" 
                    name="conflictResolution" 
                    value="update" 
                    checked={conflictResolution === 'update'}
                    onChange={() => setConflictResolution('update')}
                    className="accent-accent"
                  />
                  <span>Cập nhật đè</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-primary">
                  <input 
                    type="radio" 
                    name="conflictResolution" 
                    value="error" 
                    checked={conflictResolution === 'error'}
                    onChange={() => setConflictResolution('error')}
                    className="accent-accent"
                  />
                  <span>Báo lỗi hủy</span>
                </label>
              </div>
            )}
          </div>

          {/* Table Container */}
          <div className="w-full overflow-x-auto border border-gray-100 rounded-2xl max-h-[350px]">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-gray-50 text-secondary border-b border-gray-100 sticky top-0 font-bold z-10">
                <tr>
                  <th className="p-3 text-center w-12">Dòng</th>
                  <th className="p-3 w-40">SKU</th>
                  <th className="p-3 w-36">Trạng thái</th>
                  {mode === 'create' ? (
                    <>
                      <th className="p-3 w-44">Tên sản phẩm</th>
                      <th className="p-3 w-28">Giá</th>
                      <th className="p-3 w-24">Tồn kho</th>
                      <th className="p-3 w-28">Danh mục</th>
                    </>
                  ) : mode === 'stock' ? (
                    <th className="p-3 w-40">Tồn kho mới</th>
                  ) : (
                    <>
                      <th className="p-3 w-32">Giá bán mới</th>
                      <th className="p-3 w-36">Giá so sánh mới</th>
                    </>
                  )}
                  <th className="p-3 min-w-[200px]">Chi tiết / Lỗi dữ liệu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-primary font-medium">
                {previewRows.map((row) => (
                  <tr key={row.rowNum} className={row.status === 'ERROR_VALIDATION' ? 'bg-rose-50/10' : ''}>
                    <td className="p-3 text-center text-secondary font-mono">{row.rowNum}</td>
                    <td className="p-3 font-semibold font-mono truncate max-w-[150px]">{row.sku || <span className="text-rose-500 italic">Trống</span>}</td>
                    <td className="p-3">{getStatusBadge(row.status)}</td>
                    
                    {mode === 'create' ? (
                      <>
                        <td className="p-3 truncate max-w-[160px]" title={row.name}>{row.name || '-'}</td>
                        <td className="p-3 font-mono">{row.data?.price ? `${row.data.price.toLocaleString('vi-VN')} đ` : '-'}</td>
                        <td className="p-3 font-mono">{row.data?.stockQuantity ?? '-'}</td>
                        <td className="p-3 font-mono text-secondary">{row.data?.categoryName || '-'}</td>
                      </>
                    ) : mode === 'stock' ? (
                      <td className="p-3 font-mono font-semibold text-primary">{row.newStock ?? '-'}</td>
                    ) : (
                      <>
                        <td className="p-3 font-mono font-semibold text-primary">{row.newPrice ? `${row.newPrice.toLocaleString('vi-VN')} đ` : '-'}</td>
                        <td className="p-3 font-mono text-secondary">{row.newCompareAtPrice ? `${row.newCompareAtPrice.toLocaleString('vi-VN')} đ` : '-'}</td>
                      </>
                    )}
                    
                    <td className="p-3">
                      {row.errors.length > 0 ? (
                        <div className="flex flex-col gap-1">
                          {row.errors.map((err, idx) => (
                            <div key={idx} className="flex items-center gap-1.5 text-rose-600">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              <span>{err}</span>
                            </div>
                          ))}
                        </div>
                      ) : row.status === 'WARNING_DUPLICATE' ? (
                        <span className="text-amber-600">SKU trùng. Sẽ xử lý theo cơ chế đối xung thiết lập.</span>
                      ) : row.status === 'WARNING_NOT_FOUND' ? (
                        <span className="text-amber-600">SKU không có trong DB. Dòng này sẽ bị bỏ qua khi commit.</span>
                      ) : (
                        <span className="text-emerald-600">Hợp lệ</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-gray-100 pt-4 gap-4">
            <div className="text-xs text-secondary font-bold">
              Tổng số: {totalRows} dòng | Hợp lệ: <span className="text-emerald-600">{successCount}</span> | Cảnh báo: <span className="text-amber-600">{warningCount}</span> | Lỗi: <span className="text-rose-600">{errorCount}</span>
            </div>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setPreviewRows([]);
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                disabled={isCommitting}
                className="px-5 py-2.5 border border-gray-200 hover:bg-gray-50 font-bold rounded-xl transition-all cursor-pointer text-xs"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleCommit}
                disabled={isCommitting || successCount + (conflictResolution === 'update' ? warningCount : 0) === 0}
                className="px-6 py-2.5 bg-accent hover:bg-accent-hover disabled:bg-accent/40 text-white font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
              >
                {isCommitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang import...</span>
                  </>
                ) : (
                  <span>Xác nhận import</span>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
