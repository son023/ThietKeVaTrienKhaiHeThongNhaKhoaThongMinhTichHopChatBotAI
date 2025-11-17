import { useState } from 'react';
import { ArrowLeft, Plus, Edit, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface DrugProfileProps {
  drugId: string;
  onBack: () => void;
}

export function DrugProfile({ drugId, onBack }: DrugProfileProps) {
  const [activeTab, setActiveTab] = useState<'batches' | 'ledger' | 'info' | 'settings'>('batches');

  // Mock data
  const drug = {
    id: drugId,
    code: 'PAR500',
    name: 'Paracetamol 500mg',
    activeIngredient: 'Paracetamol',
    totalStock: 150,
    unit: 'viên',
    threshold: 50,
  };

  const batches = [
    {
      batchNo: 'L001',
      quantity: 100,
      expiry: '20/12/2026',
      daysUntilExpiry: 420,
      supplier: 'Nhà cung cấp A',
      status: 'normal',
    },
    {
      batchNo: 'L002',
      quantity: 50,
      expiry: '15/05/2025',
      daysUntilExpiry: 200,
      supplier: 'Nhà cung cấp B',
      status: 'expiring',
    },
  ];

  const ledgerRecords = [
    {
      date: '28/10/2025 09:30',
      action: 'Xuất (Cấp phát)',
      quantity: -20,
      person: 'DS. Nguyễn Văn A',
      note: 'Đơn thuốc DT001',
    },
    {
      date: '25/10/2025 14:15',
      action: 'Nhập kho',
      quantity: +50,
      person: 'DS. Nguyễn Văn A',
      note: 'Phiếu nhập PNK001',
    },
    {
      date: '20/10/2025 10:00',
      action: 'Xuất (Cấp phát)',
      quantity: -30,
      person: 'DS. Trần Thị B',
      note: 'Đơn thuốc DT045',
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* DoctorHeader */}
      <div>
        <button
          onClick={onBack}
          className="flex items-center gap-2 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff] hover:text-[#05619a] mb-3 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại Quản lý Kho
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
              {drug.name}
            </h1>
            <div className="flex items-center gap-4">
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                Hoạt chất: {drug.activeIngredient}
              </p>
              <span className="text-[#e5e7eb]">|</span>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                Mã thuốc: {drug.code}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d] mb-1">
              Tổng Tồn kho
            </p>
            <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[32px] text-[#28a745]">
              {drug.totalStock} <span className="text-[18px]">{drug.unit}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#e5e7eb]">
        {[
          { id: 'batches' as const, label: 'Quản lý Lô & Hạn sử dụng' },
          { id: 'ledger' as const, label: 'Lịch sử Nhập/Xuất' },
          { id: 'info' as const, label: 'Thông tin Dược lý' },
          { id: 'settings' as const, label: 'Cài đặt Thuốc' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 font-['Fz_Poppins:Medium',sans-serif] text-[14px] border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-[#3fb5ff] text-[#3fb5ff]'
                : 'border-transparent text-[#6c757d] hover:text-[#3fb5ff]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
        {activeTab === 'batches' && (
          <div>
            <div className="p-5 border-b border-[#e5e7eb] flex items-center justify-between">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
                Danh sách các lô trong kho
              </h2>
              <button
                onClick={() => toast.info('Chức năng nhập lô mới đang được phát triển')}
                className="flex items-center gap-2 px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Nhập lô mới
              </button>
            </div>
            <div className="p-5">
              <table className="w-full">
                <thead className="border-b border-[#e5e7eb]">
                  <tr>
                    <th className="px-4 py-3 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Số lô
                    </th>
                    <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Số lượng
                    </th>
                    <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      HSD
                    </th>
                    <th className="px-4 py-3 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Nhà cung cấp
                    </th>
                    <th className="px-4 py-3 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                      Trạng thái
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {batches.map((batch) => (
                    <tr
                      key={batch.batchNo}
                      className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors"
                    >
                      <td className="px-4 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                        {batch.batchNo}
                      </td>
                      <td className="px-4 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                        {batch.quantity} {drug.unit}
                      </td>
                      <td className="px-4 py-4 text-center font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                        {batch.expiry}
                      </td>
                      <td className="px-4 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                        {batch.supplier}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {batch.status === 'expiring' ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                            <AlertTriangle className="w-3 h-3" />
                            Cảnh báo HSD
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                            Bình thường
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'ledger' && (
          <div>
            <div className="p-5 border-b border-[#e5e7eb]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
                Lịch sử Nhập/Xuất kho
              </h2>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {ledgerRecords.map((record, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-[#e5e7eb] hover:border-[#3fb5ff] transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-3 py-1 rounded-full font-['Fz_Poppins:Medium',sans-serif] text-[12px] ${
                            record.quantity > 0
                              ? 'bg-[#d4edda] text-[#155724]'
                              : 'bg-[#fff3cd] text-[#856404]'
                          }`}
                        >
                          {record.action}
                        </span>
                        <span
                          className={`font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] ${
                            record.quantity > 0 ? 'text-[#28a745]' : 'text-[#ffc107]'
                          }`}
                        >
                          {record.quantity > 0 ? '+' : ''}{record.quantity} {drug.unit}
                        </span>
                      </div>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#6c757d]">
                        {record.date}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#05619a]">
                        {record.person}
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#333333]">
                        {record.note}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'info' && (
          <div className="p-5">
            <div className="space-y-6">
              <div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-3">
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-[#f8f9fa]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                      Tên biệt dược
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.name}
                    </p>
                  </div>
                  <div className="p-4 rounded-lg bg-[#f8f9fa]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                      Hoạt chất chính
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.activeIngredient}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-3">
                  Chỉ định
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-relaxed">
                  Giảm đau, hạ sốt trong các trường hợp: đau đầu, đau răng, đau cơ, đau khớp, đau sau phẫu thuật, sốt do nhiễm khuẩn.
                </p>
              </div>

              <div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-3">
                  Chống chỉ định
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-relaxed">
                  Quá mẫn với Paracetamol, suy gan nặng, suy thận nặng.
                </p>
              </div>

              <div>
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-3">
                  Tác dụng phụ
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-relaxed">
                  Phát ban, mề đay, độc gan (nếu dùng liều cao trong thời gian dài).
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="p-5">
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Ngưỡng cảnh báo tồn kho
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    defaultValue={drug.threshold}
                    className="flex-1 h-[44px] px-4 rounded-lg border border-[#3295d0] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                  />
                  <span className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                    {drug.unit}
                  </span>
                </div>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mt-1">
                  Cảnh báo khi tồn kho xuống dưới ngưỡng này
                </p>
              </div>

              <div>
                <label className="block font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e] mb-2">
                  Nhà cung cấp mặc định
                </label>
                <input
                  type="text"
                  defaultValue="Nhà cung cấp A"
                  className="w-full h-[44px] px-4 rounded-lg border border-[#3295d0] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
                />
              </div>

              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={() => toast.success('Đã lưu cài đặt thành công')}
                  className="px-6 py-3 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#3fb5ff]/90 transition-colors"
                >
                  Lưu thay đổi
                </button>
                <button className="px-6 py-3 bg-white border border-[#e5e7eb] text-[#6c757d] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f8f9fa] transition-colors">
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
