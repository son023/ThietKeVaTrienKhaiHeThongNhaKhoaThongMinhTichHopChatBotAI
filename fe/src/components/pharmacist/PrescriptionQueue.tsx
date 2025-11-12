import { useState } from 'react';
import { Search, RefreshCw, Eye } from 'lucide-react';

interface PrescriptionQueueProps {
  onViewDetail: (id: string) => void;
}

export function PrescriptionQueue({ onViewDetail }: PrescriptionQueueProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'review' | 'dispensed' | 'cancelled'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const prescriptions = [
    {
      id: 'DT001',
      patient: 'Nguyễn Văn A',
      doctor: 'BS. Trần Thị B',
      time: '09:30 - 28/10/2025',
      status: 'pending',
      priority: 'normal',
    },
    {
      id: 'DT002',
      patient: 'Lê Thị C',
      doctor: 'BS. Phạm Văn D',
      time: '10:15 - 28/10/2025',
      status: 'pending',
      priority: 'normal',
    },
    {
      id: 'DT003',
      patient: 'Trần Văn E',
      doctor: 'BS. Trần Thị B',
      time: '11:00 - 28/10/2025',
      status: 'review',
      priority: 'high',
    },
    {
      id: 'DT004',
      patient: 'Phạm Thị F',
      doctor: 'BS. Nguyễn Văn G',
      time: '08:30 - 28/10/2025',
      status: 'dispensed',
      priority: 'normal',
    },
  ];

  const tabs = [
    { id: 'pending' as const, label: 'Chờ cấp', count: 8 },
    { id: 'review' as const, label: 'Cần xem xét', count: 3 },
    { id: 'dispensed' as const, label: 'Đã cấp phát', count: 45 },
    { id: 'cancelled' as const, label: 'Đã hủy', count: 2 },
  ];

  const filteredPrescriptions = prescriptions.filter(
    (p) =>
      p.status === activeTab &&
      (p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.patient.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatusBadge = (status: string, priority: string) => {
    if (status === 'pending') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          Chờ cấp
        </span>
      );
    } else if (status === 'review') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          Cần xem xét
        </span>
      );
    } else if (status === 'dispensed') {
      return (
        <span className="px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          Đã cấp phát
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full bg-[#f8f9fa] text-[#6c757d] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
          Đã hủy
        </span>
      );
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* DoctorHeader */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e] mb-2">
            Đơn thuốc chờ cấp
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            Quản lý và cấp phát đơn thuốc
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#3295d0] text-[#05619a] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f0f9ff] transition-colors">
          <RefreshCw className="w-4 h-4" />
          Tải lại danh sách
        </button>
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
          placeholder="Tìm theo Mã Đơn hoặc Tên Bệnh nhân..."
          className="w-full h-[44px] pl-11 pr-4 rounded-lg border border-[#3295d0] bg-[#fcfeff] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] placeholder:text-[#999999] focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#f8f9fa] border-b border-[#e5e7eb]">
            <tr>
              <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                Mã Đơn
              </th>
              <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                Tên Bệnh nhân
              </th>
              <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                Bác sĩ kê
              </th>
              <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                Thời gian
              </th>
              <th className="px-6 py-4 text-left font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-center font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#01304e]">
                Hành động
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPrescriptions.length > 0 ? (
              filteredPrescriptions.map((prescription) => (
                <tr
                  key={prescription.id}
                  className="border-b border-[#e5e7eb] hover:bg-[#f8f9fa] transition-colors cursor-pointer"
                  onClick={() => onViewDetail(prescription.id)}
                >
                  <td className="px-6 py-4 font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                    {prescription.id}
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                    {prescription.patient}
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
                    {prescription.doctor}
                  </td>
                  <td className="px-6 py-4 font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
                    {prescription.time}
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(prescription.status, prescription.priority)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewDetail(prescription.id);
                        }}
                        className="p-2 rounded-lg bg-[#3fb5ff] text-white hover:bg-[#3fb5ff]/90 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center">
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#6c757d]">
                    Không tìm thấy đơn thuốc nào
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
