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
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="typo-h2 text-neutral-heading mb-2">
          Bảng điều khiển
        </h1>
        <p className="text-base text-neutral-gray-500">
          Chào mừng trở lại, Dược sĩ Nguyễn Văn A
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-primary">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-primary/10">
              <FileText className="w-7 h-7 text-primary" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              12
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Danh sách đơn thuốc
          </p>
        </div>

        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-accent-orange">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-amber-50">
              <Package className="w-7 h-7 text-amber-600" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              8
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Thuốc sắp hết hàng
          </p>
        </div>

        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-red-50">
              <AlertTriangle className="w-7 h-7 text-red-600" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              5
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Thuốc sắp hết hạn
          </p>
        </div>

        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:border-emerald-500">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-lg bg-emerald-50">
              <TrendingUp className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-3xl font-bold text-neutral-heading">
              45
            </span>
          </div>
          <p className="text-sm text-neutral-gray-600 font-medium">
            Đơn đã cấp hôm nay
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Đơn thuốc mới */}
        <div className="lg:col-span-2 bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Đơn thuốc mới (Chờ cấp phát)
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {newPrescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="p-5 rounded-lg border border-neutral-gray-200 hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer group"
                onClick={() => onNavigate('prescription-detail', prescription.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-neutral-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <Calendar className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-heading mb-1">
                        {prescription.patient}
                      </p>
                      <p className="text-sm text-neutral-gray-500">
                        {prescription.doctor} • {prescription.time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-semibold ${
                        prescription.status === 'Chờ cấp'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-red-100 text-red-800 border border-red-200'
                      }`}
                    >
                      {prescription.status}
                    </span>
                    <button className="px-5 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary-strong transition-all duration-200 shadow-sm hover:shadow">
                      Xem & Cấp phát
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Việc cần làm nhanh */}
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Việc cần làm nhanh
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 rounded-lg bg-amber-50 border border-amber-200 cursor-pointer hover:shadow-md hover:bg-amber-100 transition-all duration-200"
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-900 font-medium leading-relaxed">
                    {action.label}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cảnh báo Kho */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Thuốc sắp hết hàng */}
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Thuốc sắp hết hàng
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {lowStockDrugs.map((drug, index) => (
              <div
                key={index}
                className="p-5 rounded-lg border border-amber-300 bg-amber-50 cursor-pointer hover:shadow-md hover:bg-amber-100 transition-all duration-200 group"
                onClick={() => onNavigate('inventory')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-heading mb-1.5">
                      {drug.name}
                    </p>
                    <p className="text-sm text-amber-800">
                      Tồn kho: <span className="font-semibold">{drug.stock} {drug.unit}</span> / Ngưỡng: {drug.threshold} {drug.unit}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-amber-100 group-hover:bg-amber-200 transition-colors">
                    <Package className="w-6 h-6 text-amber-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Thuốc sắp hết hạn */}
        <div className="bg-neutral-surface rounded-xl border border-neutral-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-neutral-gray-200 bg-neutral-gray-50">
            <h2 className="typo-h4 text-neutral-heading">
              Thuốc sắp hết hạn
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {expiringDrugs.map((drug, index) => (
              <div
                key={index}
                className="p-5 rounded-lg border border-red-300 bg-red-50 cursor-pointer hover:shadow-md hover:bg-red-100 transition-all duration-200 group"
                onClick={() => onNavigate('inventory')}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-neutral-heading mb-1.5">
                      {drug.name}
                    </p>
                    <p className="text-sm text-red-800">
                      Lô {drug.batch} • HSD: {drug.expiry} • Còn <span className="font-semibold">{drug.daysLeft} ngày</span>
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-red-100 group-hover:bg-red-200 transition-colors">
                    <AlertTriangle className="w-6 h-6 text-red-700" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
