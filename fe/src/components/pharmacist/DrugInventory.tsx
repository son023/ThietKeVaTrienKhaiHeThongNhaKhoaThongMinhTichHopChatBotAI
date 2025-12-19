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
        <span className="px-3 py-1.5 rounded-full bg-red-100 text-red-800 border border-red-200 text-xs font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          Hết hàng
        </span>
      );
    } else if (drug.status === 'low-stock') {
      return (
        <span className="px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          Sắp hết
        </span>
      );
    } else if (drug.status === 'expiring') {
      return (
        <span className="px-3 py-1.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200 text-xs font-semibold flex items-center gap-1.5">
          <AlertTriangle className="w-3 h-3" />
          Sắp hết hạn
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold">
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
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="typo-h2 text-neutral-heading mb-2">
            Quản lý kho thuốc
          </h1>
          <p className="text-base text-neutral-gray-500">
            Danh sách tất cả các loại thuốc trong kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddDialog(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Thêm thuốc mới
          </button>
          <button
            onClick={loadDrugs}
            className="flex items-center gap-2 px-5 py-2.5 bg-neutral-surface border border-neutral-info text-neutral-info rounded-lg text-sm font-semibold hover:bg-neutral-muted transition-all duration-200 shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Tải lại
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-gray-200 bg-neutral-surface rounded-t-xl px-2 pt-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all duration-200 rounded-t-lg ${activeTab === tab.id
              ? 'border-primary text-primary bg-neutral-muted'
              : 'border-transparent text-neutral-gray-500 hover:text-primary hover:bg-neutral-gray-50'
              }`}
          >
            {tab.label} <span className="ml-1.5 px-2 py-0.5 rounded-full bg-neutral-gray-100 text-neutral-gray-700 text-xs font-bold">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm Tên thuốc, Công dụng, Mã thuốc..."
          className="w-full h-12 pl-12 pr-4 rounded-xl border border-neutral-gray-200 bg-neutral-surface text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-4">
            <RefreshCw className="w-10 h-10 animate-spin text-primary" />
            <span className="text-sm text-neutral-gray-500">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-gray-50 border-b border-neutral-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Mã thuốc
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Tên thuốc (Biệt dược)
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-neutral-heading">
                    Công dụng
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                    Tồn kho
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                    Ngưỡng CB
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-bold text-neutral-heading">
                    Trạng thái
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-gray-100">
                {filteredDrugs.length > 0 ? (
                  filteredDrugs.map((drug) => (
                    <tr
                      key={drug.id}
                      className="hover:bg-neutral-gray-50 transition-colors cursor-pointer group"
                      onClick={() => onViewDrugProfile(drug.id)}
                    >
                      <td className="px-6 py-4 text-sm font-semibold text-primary">
                        {drug.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-text font-medium">
                        {drug.name}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-gray-500">
                        {drug.activeIngredient}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span
                          className={`text-sm font-bold ${drug.stockQuantity === 0
                            ? 'text-red-600'
                            : drug.stockQuantity < drug.threshold
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                            }`}
                        >
                          {drug.stockQuantity} {drug.unit || 'đơn vị'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-neutral-gray-500">
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
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <Package className="w-12 h-12 text-neutral-gray-300" />
                        <p className="text-sm text-neutral-gray-500 font-medium">
                          {loading ? 'Đang tải...' : 'Không tìm thấy thuốc nào'}
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Medicine Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-surface rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Dialog Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-gray-200 bg-neutral-gray-50 sticky top-0 rounded-t-2xl">
              <h2 className="typo-h4 text-neutral-heading">
                Thêm thuốc mới
              </h2>
              <button
                onClick={() => {
                  setShowAddDialog(false);
                  resetForm();
                }}
                className="p-2 hover:bg-neutral-gray-200 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-neutral-gray-600" />
              </button>
            </div>

            {/* Dialog Content */}
            <form onSubmit={handleSubmitAddMedicine} className="p-6 space-y-5">
              {/* Medicine Name */}
              <div>
                <label className="block text-sm font-semibold text-neutral-heading mb-2">
                  Tên thuốc <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ví dụ: Paracetamol 500mg"
                  className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Unit */}
              <div>
                <label className="block text-sm font-semibold text-neutral-heading mb-2">
                  Đơn vị
                </label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="Ví dụ: viên, lọ, hộp..."
                  className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-neutral-heading mb-2">
                  Công dụng / Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Nhập công dụng hoặc mô tả của thuốc..."
                  rows={3}
                  className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-all"
                />
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-semibold text-neutral-heading mb-2">
                  Giá bán (VNĐ)
                </label>
                <input
                  type="number"
                  value={formData.salePrice || ''}
                  onChange={(e) => setFormData({ ...formData, salePrice: parseInt(e.target.value) || 0 })}
                  min="0"
                  placeholder="0"
                  className="w-full px-4 py-3 border border-neutral-gray-200 rounded-xl text-sm text-neutral-text placeholder:text-neutral-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
              </div>

              {/* Dialog Footer */}
              <div className="flex items-center justify-end gap-3 pt-5 border-t border-neutral-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddDialog(false);
                    resetForm();
                  }}
                  className="px-6 py-3 border border-neutral-gray-200 text-neutral-text rounded-lg text-sm font-semibold hover:bg-neutral-gray-50 transition-all duration-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-strong transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm hover:shadow"
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
