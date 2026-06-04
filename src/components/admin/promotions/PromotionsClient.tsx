"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Loader2, Gift, Trash2, Calendar, Power, Edit } from 'lucide-react';
import { createPromotion, togglePromotionStatus, deletePromotion, getFilteredPromotionOptions } from '@/lib/actions/promotion.actions';

export default function PromotionsClient({ 
  initialPromotions, 
  categories, 
  productGroups,
  sizes,
  colors
}: { 
  initialPromotions: any[], 
  categories: any[], 
  productGroups: any[],
  sizes: any[],
  colors: any[]
}) {
  const [promotions, setPromotions] = useState(initialPromotions);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [isAutomatic, setIsAutomatic] = useState(false);
  const [code, setCode] = useState('');
  const [type, setType] = useState<'PERCENTAGE' | 'FIXED_AMOUNT'>('PERCENTAGE');
  const [value, setValue] = useState('');
  const [minOrderValue, setMinOrderValue] = useState('0');
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 16));
  const [endDate, setEndDate] = useState('');
  const [usageLimit, setUsageLimit] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [canCombine, setCanCombine] = useState(true);

  // Condition states
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [productCodesStr, setProductCodesStr] = useState('');
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  // Filtered options based on category/collection selection
  const [availableCollections, setAvailableCollections] = useState<string[]>(productGroups.map(g => g.id));
  const [availableSizes, setAvailableSizes] = useState<string[]>(sizes.map(s => s.id));
  const [availableColors, setAvailableColors] = useState<string[]>(colors.map(c => c.id));

  // Reactive filtering
  useEffect(() => {
    async function fetchFilters() {
      if (selectedCategories.length === 0 && selectedCollections.length === 0) {
        // Reset to all if nothing selected
        setAvailableCollections(productGroups.map(g => g.id));
        setAvailableSizes(sizes.map(s => s.id));
        setAvailableColors(colors.map(c => c.id));
        return;
      }
      
      const res = await getFilteredPromotionOptions(selectedCategories, selectedCollections);
      if (res.success && res.data) {
        setAvailableCollections((res.data.collectionIds || []).filter((id): id is string => id !== null));
        setAvailableSizes((res.data.sizeIds || []).filter((id): id is string => id !== null));
        setAvailableColors((res.data.colorIds || []).filter((id): id is string => id !== null));
      }
    }
    fetchFilters();
  }, [selectedCategories, selectedCollections]);

  const resetForm = () => {
    setName('');
    setIsAutomatic(false);
    setCode('');
    setType('PERCENTAGE');
    setValue('');
    setMinOrderValue('0');
    setStartDate(new Date().toISOString().slice(0, 16));
    setEndDate('');
    setUsageLimit('');
    setIsActive(true);
    setCanCombine(true);
    setSelectedCategories([]);
    setSelectedCollections([]);
    setProductCodesStr('');
    setSelectedSizes([]);
    setSelectedColors([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const parseCommaSeparated = (str: string) => 
      str.split(',').map(s => s.trim()).filter(s => s.length > 0);

    const result = await createPromotion({
      name,
      code: isAutomatic ? null : code,
      type,
      isAutomatic,
      value: parseInt(value),
      minOrderValue: parseInt(minOrderValue),
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      isActive,
      canCombine,
      appliedCategoryIds: selectedCategories,
      appliedCollectionIds: selectedCollections,
      appliedProductCodes: parseCommaSeparated(productCodesStr),
      appliedSizes: selectedSizes,
      appliedColors: selectedColors,
    });

    if (result.success) {
      setPromotions([result.data, ...promotions]);
      setIsModalOpen(false);
      resetForm();
    } else {
      alert(result.error);
    }
    setIsLoading(false);
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    const res = await togglePromotionStatus(id, !currentStatus);
    if (res.success) {
      setPromotions(promotions.map(p => p.id === id ? { ...p, isActive: !currentStatus } : p));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa chiến dịch này?')) return;
    const res = await deletePromotion(id);
    if (res.success) {
      setPromotions(promotions.filter(p => p.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-3 shadow-xs border border-border/40 overflow-hidden">
      <div className="p-4 border-b border-border/20 flex justify-between items-center bg-subtle/10">
        <h3 className="font-semibold text-primary">Danh sách Chiến dịch</h3>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="bg-primary text-canvas px-4 py-2 rounded-2 text-sm font-medium flex items-center gap-2 hover:bg-primary/90 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Tạo Chiến dịch
        </button>
      </div>

      <div className="p-0">
        <table className="w-full text-left text-sm">
          <thead className="bg-subtle/20 text-secondary/70 border-b border-border/30">
            <tr>
              <th className="px-6 py-3 font-medium">Tên chiến dịch</th>
              <th className="px-6 py-3 font-medium">Mã code / Loại</th>
              <th className="px-6 py-3 font-medium">Mức giảm</th>
              <th className="px-6 py-3 font-medium">Đã dùng</th>
              <th className="px-6 py-3 font-medium">Trạng thái</th>
              <th className="px-6 py-3 font-medium text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {promotions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-secondary/60">
                  <Gift className="w-10 h-10 mx-auto text-secondary/30 mb-3" />
                  <p>Chưa có chiến dịch khuyến mãi nào.</p>
                </td>
              </tr>
            ) : (
              promotions.map(p => (
                <tr key={p.id} className="hover:bg-subtle/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-primary">{p.name}</div>
                    <div className="text-xs text-secondary/60 flex items-center gap-1 mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(p.startDate).toLocaleDateString('vi-VN')} 
                      {p.endDate ? ` - ${new Date(p.endDate).toLocaleDateString('vi-VN')}` : ' - Không giới hạn'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {p.isAutomatic ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-accent/10 text-accent">
                        TỰ ĐỘNG
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono font-bold bg-subtle/50 border border-border/50 text-secondary">
                        {p.code}
                      </span>
                    )}
                    {!p.canCombine && (
                      <span className="block mt-1 text-[10px] text-error">Không cộng dồn</span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-primary">
                    {p.type === 'PERCENTAGE' ? `${p.value}%` : `${p.value.toLocaleString('vi-VN')}đ`}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-secondary">{p.usedCount}</span>
                    {p.usageLimit && <span className="text-secondary/50"> / {p.usageLimit}</span>}
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => handleToggle(p.id, p.isActive)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isActive ? 'bg-success' : 'bg-border/50'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.isActive ? 'translate-x-4.5' : 'translate-x-1'}`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 text-secondary/50 hover:text-error hover:bg-error/10 rounded-2 transition-colors cursor-pointer">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Creating Promotion */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/20 backdrop-blur-sm p-4">
          <div className="bg-white rounded-4 shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-slide-up">
            <div className="p-5 border-b border-border/20 flex justify-between items-center shrink-0">
              <h2 className="text-lg font-playfair font-bold text-primary">Tạo Chiến dịch Khuyến mãi</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-secondary/50 hover:text-primary cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow bg-[#FAF7F2]/50">
              <form id="promoForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Tên & Loại */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Tên chiến dịch *</label>
                    <input 
                      type="text" required value={name} onChange={e => setName(e.target.value)}
                      placeholder="VD: Khuyến mãi mùa Hè" 
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5 flex flex-col justify-end">
                    <div className="flex items-center gap-2 mb-2">
                      <input 
                        type="checkbox" id="autoCheck"
                        checked={isAutomatic} onChange={e => setIsAutomatic(e.target.checked)}
                        className="w-4 h-4 rounded border-border/40 text-accent focus:ring-accent"
                      />
                      <label htmlFor="autoCheck" className="text-sm font-medium text-primary">Khuyến mãi Tự động (Không cần mã)</label>
                    </div>
                  </div>
                </div>

                {/* Mã giảm giá (nếu không tự động) */}
                {!isAutomatic && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Mã Giảm Giá (Code) *</label>
                    <input 
                      type="text" required={!isAutomatic} value={code} onChange={e => setCode(e.target.value.toUpperCase())}
                      placeholder="VD: SUMMER26" 
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm font-mono uppercase focus:outline-none focus:border-accent"
                    />
                  </div>
                )}

                {/* Mức giảm & Loại */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Loại chiết khấu</label>
                    <select 
                      value={type} onChange={e => setType(e.target.value as any)}
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    >
                      <option value="PERCENTAGE">Phần trăm (%)</option>
                      <option value="FIXED_AMOUNT">Số tiền (VNĐ)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Mức giảm *</label>
                    <input 
                      type="number" required min="1" value={value} onChange={e => setValue(e.target.value)}
                      placeholder={type === 'PERCENTAGE' ? "VD: 10" : "VD: 50000"} 
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Lượt dùng tối đa</label>
                    <input 
                      type="number" min="1" value={usageLimit} onChange={e => setUsageLimit(e.target.value)}
                      placeholder="Để trống = Không giới hạn" 
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Thời gian */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Ngày bắt đầu *</label>
                    <input 
                      type="datetime-local" required value={startDate} onChange={e => setStartDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Ngày kết thúc</label>
                    <input 
                      type="datetime-local" value={endDate} onChange={e => setEndDate(e.target.value)}
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                    <p className="text-[10px] text-secondary/60">Bỏ trống nếu không có ngày hết hạn</p>
                  </div>
                </div>

                {/* Cài đặt nâng cao */}
                <div className="p-5 bg-white border border-border/30 rounded-3 space-y-5">
                  <div className="flex items-center justify-between border-b border-border/20 pb-3">
                    <h4 className="font-semibold text-primary">Phạm vi áp dụng (Lọc điều kiện)</h4>
                    <span className="text-xs text-secondary/60 bg-subtle/50 px-2 py-1 rounded">Bỏ trống = Áp dụng Toàn shop</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nhóm sản phẩm */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary tracking-wider">Áp dụng cho Nhóm SP</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border/20 rounded-2">
                        {categories.map(cat => (
                          <label key={cat.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-subtle/20 p-1.5 rounded-2 w-full">
                            <input 
                              type="checkbox" 
                              checked={selectedCategories.includes(cat.id)} 
                              onChange={(e) => {
                                if (e.target.checked) setSelectedCategories([...selectedCategories, cat.id]);
                                else setSelectedCategories(selectedCategories.filter(id => id !== cat.id));
                              }}
                              className="rounded border-border/40 text-accent focus:ring-accent" 
                            />
                            <span>{cat.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Bộ sưu tập */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary tracking-wider">Áp dụng cho Bộ sưu tập</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border/20 rounded-2">
                        {productGroups.filter(grp => availableCollections.includes(grp.id)).map(grp => (
                          <label key={grp.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-subtle/20 p-1.5 rounded-2 w-full">
                            <input 
                              type="checkbox" 
                              checked={selectedCollections.includes(grp.id)} 
                              onChange={(e) => {
                                if (e.target.checked) setSelectedCollections([...selectedCollections, grp.id]);
                                else setSelectedCollections(selectedCollections.filter(id => id !== grp.id));
                              }}
                              className="rounded border-border/40 text-accent focus:ring-accent" 
                            />
                            <span>{grp.name}</span>
                          </label>
                        ))}
                        {availableCollections.length === 0 && <span className="text-xs text-secondary/50 p-2">Không có bộ sưu tập phù hợp</span>}
                      </div>
                    </div>
                  </div>

                  {/* Mã Sản phẩm */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-secondary tracking-wider">Chỉ định cụ thể Mã Sản phẩm</label>
                    <textarea 
                      rows={2} value={productCodesStr} onChange={e => setProductCodesStr(e.target.value)}
                      placeholder="VD: C01, C02, BTM05 (viết liền phân tách bằng dấu phẩy)"
                      className="w-full p-2.5 bg-white border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Size */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary tracking-wider">Áp dụng cho Size</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border/20 rounded-2">
                        {sizes.filter(s => availableSizes.includes(s.id)).map(size => (
                          <label key={size.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-subtle/20 p-1.5 rounded-2 w-full">
                            <input 
                              type="checkbox" 
                              checked={selectedSizes.includes(size.id)} 
                              onChange={(e) => {
                                if (e.target.checked) setSelectedSizes([...selectedSizes, size.id]);
                                else setSelectedSizes(selectedSizes.filter(id => id !== size.id));
                              }}
                              className="rounded border-border/40 text-accent focus:ring-accent" 
                            />
                            <span>{size.name}</span>
                          </label>
                        ))}
                        {availableSizes.length === 0 && <span className="text-xs text-secondary/50 p-2">Không có size phù hợp</span>}
                      </div>
                    </div>
                    {/* Màu sắc */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-secondary tracking-wider">Áp dụng cho Màu sắc</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-border/20 rounded-2">
                        {colors.filter(c => availableColors.includes(c.id)).map(color => (
                          <label key={color.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-subtle/20 p-1.5 rounded-2 w-full">
                            <input 
                              type="checkbox" 
                              checked={selectedColors.includes(color.id)} 
                              onChange={(e) => {
                                if (e.target.checked) setSelectedColors([...selectedColors, color.id]);
                                else setSelectedColors(selectedColors.filter(id => id !== color.id));
                              }}
                              className="rounded border-border/40 text-accent focus:ring-accent" 
                            />
                            <span>{color.name}</span>
                          </label>
                        ))}
                        {availableColors.length === 0 && <span className="text-xs text-secondary/50 p-2">Không có màu phù hợp</span>}
                      </div>
                    </div>
                  </div>

                  {/* Giá trị đơn tối thiểu */}
                  <div className="space-y-1.5 border-t border-border/20 pt-4">
                    <label className="text-xs font-semibold text-secondary tracking-wider">Giá trị đơn hàng tối thiểu (VNĐ)</label>
                    <input 
                      type="number" required min="0" value={minOrderValue} onChange={e => setMinOrderValue(e.target.value)}
                      className="w-full p-2.5 bg-subtle/10 border border-border/40 rounded-2 text-sm focus:outline-none focus:border-accent"
                    />
                  </div>

                  {/* Checkbox: Được cộng dồn */}
                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" id="canCombineCheck"
                      checked={canCombine} onChange={e => setCanCombine(e.target.checked)}
                      className="w-4 h-4 rounded border-border/40 text-accent focus:ring-accent"
                    />
                    <label htmlFor="canCombineCheck" className="text-sm font-medium text-primary">Cho phép áp dụng cùng lúc với các chương trình khuyến mãi khác (Cộng dồn)</label>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/20">
                  <input 
                    type="checkbox" id="activeCheck"
                    checked={isActive} onChange={e => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-border/40 text-accent focus:ring-accent"
                  />
                  <label htmlFor="activeCheck" className="text-sm font-medium text-primary">Kích hoạt chiến dịch ngay</label>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-border/20 bg-white flex justify-end gap-3 shrink-0">
              <button 
                type="button" onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-2 text-sm font-medium text-secondary hover:bg-subtle/30 transition-colors cursor-pointer"
              >
                Hủy
              </button>
              <button 
                form="promoForm" type="submit" disabled={isLoading}
                className="bg-accent text-white px-5 py-2.5 rounded-2 text-sm font-medium hover:bg-accent-hover transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Lưu Chiến dịch
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
