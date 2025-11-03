import { AlertCircle, Package, Calendar, TrendingUp, FileText, AlertTriangle } from 'lucide-react';

interface PharmacistDashboardProps {
  onNavigate: (page: string, id?: string) => void;
}

export function PharmacistDashboard({ onNavigate }: PharmacistDashboardProps) {
  const newPrescriptions = [
    {
      id: 'DT001',
      time: '09:30',
      patient: 'Nguyễn Văn A',
      doctor: 'BS. Trần Thị B',
      status: 'Chờ cấp',
    },
    {
      id: 'DT002',
      time: '10:15',
      patient: 'Lê Thị C',
      doctor: 'BS. Phạm Văn D',
      status: 'Chờ cấp',
    },
    {
      id: 'DT003',
      time: '11:00',
      patient: 'Trần Văn E',
      doctor: 'BS. Trần Thị B',
      status: 'Cần xem xét',
    },
  ];

  const lowStockDrugs = [
    { name: 'Paracetamol 500mg', stock: 15, threshold: 50, unit: 'viên' },
    { name: 'Amoxicillin 500mg', stock: 8, threshold: 30, unit: 'viên' },
    { name: 'Ibuprofen 400mg', stock: 12, threshold: 40, unit: 'viên' },
  ];

  const expiringDrugs = [
    { name: 'Vitamin C 1000mg', batch: 'L001', expiry: '15/01/2025', daysLeft: 25 },
    { name: 'Calcium 600mg', batch: 'L002', expiry: '20/02/2025', daysLeft: 60 },
  ];

  const quickActions = [
    { label: 'Duyệt phiếu nhập kho PNK001', type: 'approval' },
    { label: 'Phản hồi từ BS. B về đơn thuốc DT00123', type: 'feedback' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
          Bảng điều khiển
        </h1>
        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
          Chào mừng trở lại, Dược sĩ Nguyễn Văn A
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8 text-[#3fb5ff]" />
            <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e]">
              12
            </span>
          </div>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Đơn thuốc chờ cấp
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <Package className="w-8 h-8 text-[#ffc107]" />
            <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e]">
              8
            </span>
          </div>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Thuốc sắp hết hàng
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-8 h-8 text-[#dc3545]" />
            <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e]">
              5
            </span>
          </div>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Thuốc sắp hết hạn
          </p>
        </div>

        <div className="bg-white p-5 rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-[#28a745]" />
            <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[24px] text-[#01304e]">
              45
            </span>
          </div>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Đơn đã cấp hôm nay
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Đơn thuốc mới */}
        <div className="col-span-2 bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="p-5 border-b border-[#e5e7eb]">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
              Đơn thuốc mới (Chờ cấp phát)
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {newPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-4 rounded-lg border border-[#e5e7eb] hover:border-[#3fb5ff] hover:shadow-md transition-all cursor-pointer"
                onClick={() => onNavigate('prescription-detail', prescription.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#f0f9ff] flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-[#3fb5ff]" />
                    </div>
                    <div>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                        {prescription.patient}
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#05619a]">
                        {prescription.doctor} • {prescription.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full font-['Fz_Poppins:Medium',sans-serif] text-[12px] ${
                        prescription.status === 'Chờ cấp'
                          ? 'bg-[#fff3cd] text-[#856404]'
                          : 'bg-[#f8d7da] text-[#721c24]'
                      }`}
                    >
                      {prescription.status}
                    </span>
                    <button className="px-4 py-2 bg-[#3fb5ff] text-white rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[12px] hover:bg-[#3fb5ff]/90 transition-colors">
                      Xem & Cấp phát
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Việc cần làm nhanh */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="p-5 border-b border-[#e5e7eb]">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
              Việc cần làm nhanh
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-[#fff3cd] border border-[#ffc107] cursor-pointer hover:shadow-md transition-all"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-[#ffc107] flex-shrink-0 mt-0.5" />
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#856404]">
                    {action.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cảnh báo Kho */}
      <div className="grid grid-cols-2 gap-6">
        {/* Thuốc sắp hết hàng */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="p-5 border-b border-[#e5e7eb]">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
              Thuốc sắp hết hàng
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {lowStockDrugs.map((drug, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-[#ffc107] bg-[#fff3cd] cursor-pointer hover:shadow-md transition-all"
                onClick={() => onNavigate('inventory')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.name}
                    </p>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#856404]">
                      Tồn kho: {drug.stock} {drug.unit} / Ngưỡng: {drug.threshold} {drug.unit}
                    </p>
                  </div>
                  <Package className="w-6 h-6 text-[#ffc107]" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thuốc sắp hết hạn */}
        <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
          <div className="p-5 border-b border-[#e5e7eb]">
            <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">
              Thuốc sắp hết hạn
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {expiringDrugs.map((drug, index) => (
              <div
                key={index}
                className="p-4 rounded-lg border border-[#dc3545] bg-[#f8d7da] cursor-pointer hover:shadow-md transition-all"
                onClick={() => onNavigate('inventory')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                      {drug.name}
                    </p>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#721c24]">
                      Lô {drug.batch} • HSD: {drug.expiry} • Còn {drug.daysLeft} ngày
                    </p>
                  </div>
                  <AlertTriangle className="w-6 h-6 text-[#dc3545]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
