import { useState } from 'react';
import { Search, Plus, Package, AlertTriangle } from 'lucide-react';

interface DrugInventoryProps {
  onViewDrugProfile: (id: string) => void;
}

export function DrugInventory({ onViewDrugProfile }: DrugInventoryProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'low-stock' | 'out-of-stock' | 'expiring'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const drugs = [
    {
      id: 'DRUG001',
      code: 'PAR500',
      name: 'Paracetamol 500mg',
      activeIngredient: 'Paracetamol',
      stock: 150,
      threshold: 50,
      unit: 'viên',
      status: 'normal',
    },
    {
      id: 'DRUG002',
      code: 'AMO500',
      name: 'Amoxicillin 500mg',
      activeIngredient: 'Amoxicillin',
      stock: 8,
      threshold: 30,
      unit: 'viên',
      status: 'low-stock',
    },
    {
      id: 'DRUG003',
      code: 'IBU400',
      name: 'Ibuprofen 400mg',
      activeIngredient: 'Ibuprofen',
      stock: 0,
      threshold: 40,
      unit: 'viên',
      status: 'out-of-stock',
    },
    {
      id: 'DRUG004',
      code: 'VIT1000',
      name: 'Vitamin C 1000mg',
      activeIngredient: 'Ascorbic Acid',
      stock: 80,
      threshold: 30,
      unit: 'viên',
      status: 'expiring',
    },
  ];

  const tabs = [
    { id: 'all' as const, label: 'Tất cả', count: 120 },
    { id: 'low-stock' as const, label: 'Sắp hết hàng', count: 8 },
    { id: 'out-of-stock' as const, label: 'Hết hàng', count: 3 },
    { id: 'expiring' as const, label: 'Sắp hết hạn', count: 5 },
  ];

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

  const getStatusBadge = (drug: typeof drugs[0]) => {
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Quản lý Kho thuốc
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Danh sách tất cả các loại thuốc trong kho
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3295d0] text-[#05619a] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f0f9ff] transition-colors">
            <Plus className="w-4 h-4" />
            Nhập kho
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors">
            <Plus className="w-4 h-4" />
            Thêm thuốc mới
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${
              activeTab === tab.id
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
          placeholder="Tìm Tên thuốc, Hoạt chất, Mã thuốc..."
          className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
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
                Hoạt chất
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
                      className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] ${
                        drug.stock === 0
                          ? 'text-[#dc3545]'
                          : drug.stock < drug.threshold
                          ? 'text-[#ffc107]'
                          : 'text-[#28a745]'
                      }`}
                    >
                      {drug.stock} {drug.unit}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                    {drug.threshold} {drug.unit}
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
                      Không tìm thấy thuốc nào
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
