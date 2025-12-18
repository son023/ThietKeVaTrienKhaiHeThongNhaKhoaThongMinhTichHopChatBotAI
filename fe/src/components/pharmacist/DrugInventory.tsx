import { useState, useEffect } from 'react';
import { Search, Plus, Package, AlertTriangle, RefreshCw, X, CheckCircle } from 'lucide-react';
import { inventoryController, MedicineWithStock, CreateMedicineRequest } from '../../controllers/InventoryController';
import { toast } from 'sonner';

interface DrugInventoryProps {
  onViewDrugProfile: (id: string) => void;
}

interface DrugItem extends MedicineWithStock {
  code: string;
  activeIngredient: string;
  threshold: number;
  status: 'normal' | 'low-stock' | 'out-of-stock' | 'expiring';
}

export function DrugInventory({ onViewDrugProfile }: DrugInventoryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'low-stock' | 'out-of-stock' | 'expiring'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [drugs, setDrugs] = useState<DrugItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<CreateMedicineRequest>({
    name: '',
    unit: '',
    description: '',
    salePrice: 0,
  });
  const [counts, setCounts] = useState({
    all: 0,
    'low-stock': 0,
    'out-of-stock': 0,
    expiring: 0,
  });

  const loadDrugs = async () => {
    setLoading(true);
    try {
      const medicinesWithStock = await inventoryController.getMedicinesWithStock();

      const drugItems: DrugItem[] = medicinesWithStock.map((medicine) => {
        const threshold = 20;
        let status: 'normal' | 'low-stock' | 'out-of-stock' | 'expiring' = 'normal';

        if (medicine.stockQuantity === 0) {
          status = 'out-of-stock';
        } else if (medicine.hasExpiring && medicine.expiringQuantity! > 0) {
          status = 'expiring';
        } else if (medicine.stockStatus === 'low') {
          status = 'low-stock';
        }

        const activeIngredient = medicine.description
          ? medicine.description.split(',')[0].trim()
          : medicine.name.split(' ')[0];

        return {
          ...medicine,
          code: medicine.id.substring(0, 8).toUpperCase(),
          activeIngredient,
          threshold,
          status,
        };
      });

      setDrugs(drugItems);

      setCounts({
        all: drugItems.length,
        'low-stock': drugItems.filter(d => d.status === 'low-stock').length,
        'out-of-stock': drugItems.filter(d => d.status === 'out-of-stock').length,
        expiring: drugItems.filter(d => d.status === 'expiring').length,
      });
    } catch (error) {
      console.error('Error loading drugs:', error);
      toast.error('Không thể tải danh sách thuốc');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrugs();
  }, []);

  const handleSubmitAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên thuốc');
      return;
    }

    setSubmitting(true);
    try {
      await inventoryController.createMedicine({
        name: formData.name.trim(),
        unit: formData.unit?.trim() || undefined,
        description: formData.description?.trim() || undefined,
        salePrice: formData.salePrice && formData.salePrice > 0 ? formData.salePrice : undefined,
      });

      toast.success('Thêm thuốc mới thành công!');
      setShowAddDialog(false);
      resetForm();
      loadDrugs(); // Reload danh sách
    } catch (error: any) {
      console.error('Error creating medicine:', error);
      toast.error(error.message || 'Không thể thêm thuốc mới');
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      unit: '',
      description: '',
      salePrice: 0,
    });
  };

  const filteredDrugs = drugs.filter((drug) => {
    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'low-stock' && drug.status === 'low-stock') ||
      (activeTab === 'out-of-stock' && drug.status === 'out-of-stock') ||
      (activeTab === 'expiring' && drug.status === 'expiring');

    const matchesSearch =
      drug.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.activeIngredient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      drug.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusBadge = (drug: DrugItem) => {
    if (drug.status === 'out-of-stock') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] font-['Fz_Poppins:Medium',sans-serif] text-[12px] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Hết hàng
        </span>
      );
    } else if (drug.status === 'low-stock') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] font-['Fz_Poppins:Medium',sans-serif] text-[12px] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Sắp hết
        </span>
      );
    } else if (drug.status === 'expiring') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#ffeaa7] text-[#d63031] font-['Fz_Poppins:Medium',sans-serif] text-[12px] flex items-center gap-1">
          <AlertTriangle className="w-3 h-3" />
          Sắp hết hạn
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          Bình thường
        </span>
      );
    }
  };

  const tabs = [
    { id: 'all' as const, label: 'Tất cả', count: counts.all },
    { id: 'low-stock' as const, label: 'Sắp hết hàng', count: counts['low-stock'] },
    { id: 'out-of-stock' as const, label: 'Hết hàng', count: counts['out-of-stock'] },
    { id: 'expiring' as const, label: 'Sắp hết hạn', count: counts.expiring },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Quản lý kho thuốc
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Danh sách tất cả các loại thuốc trong kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Thêm thuốc mới
          </button>
          <button
            onClick={loadDrugs}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3295d0] text-[#05619a] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f0f9ff] transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${activeTab === tab.id
              ? 'border-[#3fb5ff] text-[#3fb5ff]'
              : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
              }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#05619a]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm Tên thuốc, Công dụng, Mã thuốc..."
          className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-[#3fb5ff]" />
            <span className="ml-3 text-[#05619a]">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
              <tr>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Mã thuốc
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Tên thuốc (Biệt dược)
                </th>
                <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Công dụng
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Tồn kho
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Ngưỡng CB
                </th>
                <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredDrugs.length > 0 ? (
                filteredDrugs.map((drug) => (
                  <tr
                    key={drug.id}
                    className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                    onClick={() => onViewDrugProfile(drug.id)}
                  >
                    <td className="px-6 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                      {drug.code}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                      {drug.name}
                    </td>
                    <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                      {drug.activeIngredient}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] ${drug.stockQuantity === 0
                          ? 'text-[#dc3545]'
                          : drug.stockQuantity < drug.threshold
                            ? 'text-[#ffc107]'
                            : 'text-[#28a745]'
                          }`}
                      >
                        {drug.stockQuantity} {drug.unit || 'đơn vị'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                      {drug.threshold} {drug.unit || 'đơn vị'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {getStatusBadge(drug)}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Package className="w-12 h-12 text-[#e5e7eb]" />
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                        {loading ? 'Đang tải...' : 'Không tìm thấy thuốc nào'}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Medicine Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#e5e7eb]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">
                Thêm thuốc mới
              </h2>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
                className="p-2 hover:bg-[#f8f9fa] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6c757d]" />
              </button>
            </div>

            {/* Dialog Content */}
            <form onSubmit={handleSubmitAddMedicine} className="p-6 space-y-4">
              {/* Medicine Name */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Tên thuốc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Paracetamol 500mg"
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ví dụ: viên, lọ, hộp..."
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Công dụng / Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập công dụng hoặc mô tả của thuốc..."
                  rows={3}
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent resize-none"
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Giá bán (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.salePrice || ''}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-[#e5e7eb] rounded-lg font-['Fz_Poppins:Regular',sans-serif] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                />
              </div>

              {/* Dialog Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#e5e7eb]">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-[#e5e7eb] text-[#333333] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f8f9fa] transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {submitting ? (
                    <>
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Thêm thuốc
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
