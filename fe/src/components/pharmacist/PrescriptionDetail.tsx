import { useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Flag, Printer, Save } from 'lucide-react';
import { toast } from 'sonner';

interface PrescriptionDetailProps {
  prescriptionId: string;
  onBack: () => void;
}

export function PrescriptionDetail({ prescriptionId, onBack }: PrescriptionDetailProps) {
  const [activeTab, setActiveTab] = useState<'prescription' | 'interactions' | 'history'>('prescription');
  const [pharmacistNotes, setPharmacistNotes] = useState('');

  // Mock data
  const patient = {
    id: 'BN001',
    name: 'Nguyễn Văn A',
    age: 35,
    gender: 'Nam',
    phone: '0901234567',
    allergies: ['PENICILLIN', 'SULFONAMID'],
    currentMedications: ['Aspirin 100mg', 'Atorvastatin 20mg'],
  };

  const prescription = {
    id: prescriptionId,
    doctor: 'BS. Trần Thị B',
    date: '28/10/2025 09:30',
    doctorNotes: 'Bệnh nhân viêm họng cấp, kê đơn kháng sinh và giảm đau. Lưu ý kiểm tra dị ứng.',
    medications: [
      {
        id: 'MED001',
        name: 'Paracetamol 500mg',
        quantity: 20,
        unit: 'viên',
        dosage: '2 viên/lần, ngày 3 lần sau ăn',
        stockStatus: 'available',
        stockCount: 150,
      },
      {
        id: 'MED002',
        name: 'Amoxicillin 500mg',
        quantity: 30,
        unit: 'viên',
        dosage: '1 viên/lần, ngày 3 lần trước ăn',
        stockStatus: 'low',
        stockCount: 35,
      },
      {
        id: 'MED003',
        name: 'Vitamin C 1000mg',
        quantity: 10,
        unit: 'viên',
        dosage: '1 viên/ngày sau ăn sáng',
        stockStatus: 'available',
        stockCount: 80,
      },
    ],
  };

  const interactions = [
    {
      type: 'warning',
      level: 'medium',
      message: 'Tương tác trung bình: Amoxicillin & Aspirin (thuốc đang dùng)',
      detail: 'Có thể tăng nguy cơ chảy máu. Khuyến cáo theo dõi.',
    },
  ];

  const dispensingHistory = [
    {
      id: 'DT-001',
      date: '15/10/2025',
      doctor: 'BS. Phạm Văn D',
      medications: ['Ibuprofen 400mg', 'Omeprazole 20mg'],
      status: 'Đã cấp phát',
    },
    {
      id: 'DT-002',
      date: '01/10/2025',
      doctor: 'BS. Trần Thị B',
      medications: ['Paracetamol 500mg'],
      status: 'Đã cấp phát',
    },
  ];

  const handleDispense = () => {
    toast.success('Đơn thuốc đã được cấp phát thành công!');
    setTimeout(() => onBack(), 1500);
  };

  const handleSendForReview = () => {
    toast.info('Đã gửi yêu cầu xem xét lại cho Bác sĩ');
  };

  return (
    <div className="p-6 space-y-6">
      {/* DoctorHeader */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={onBack}
            className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff] hover:text-[#05619a] mb-2 transition-colors"
          >
            ← Quay lại danh sách
          </button>
          <h1 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[28px] text-[#01304e]">
            Đơn thuốc #{prescription.id}
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#05619a]">
            {prescription.doctor} • {prescription.date}
          </p>
        </div>
      </div>

      {/* Allergy Alert */}
      {patient.allergies.length > 0 && (
        <div className="bg-[#f8d7da] border-2 border-[#dc3545] rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-[#dc3545] flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#721c24] mb-1">
              🛑 CẢNH BÁO DỊ ỨNG
            </p>
            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#721c24]">
              {patient.allergies.join(', ')}
            </p>
          </div>
        </div>
      )}

      {/* Main Content - 3 Columns */}
      <div className="grid grid-cols-12 gap-6">
        {/* Column 1: Patient Info */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-5">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-4">
              Thông tin Bệnh nhân
            </h3>
            <div className="space-y-3">
              <div>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d]">
                  Tên bệnh nhân
                </p>
                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                  {patient.name}
                </p>
              </div>
              <div>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d]">
                  Mã BN
                </p>
                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                  {patient.id}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d]">
                    Tuổi
                  </p>
                  <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                    {patient.age}
                  </p>
                </div>
                <div>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d]">
                    Giới tính
                  </p>
                  <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                    {patient.gender}
                  </p>
                </div>
              </div>
              <div>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d]">
                  SĐT
                </p>
                <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#01304e]">
                  {patient.phone}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-5">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-4">
              Bác sĩ kê đơn
            </h3>
            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#05619a] mb-3">
              {prescription.doctor}
            </p>
            <div className="bg-[#f8f9fa] rounded p-3">
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                Ghi chú của Bác sĩ:
              </p>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#333333]">
                {prescription.doctorNotes}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-5">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-4">
              Thuốc đang sử dụng
            </h3>
            <ul className="space-y-2">
              {patient.currentMedications.map((med, index) => (
                <li
                  key={index}
                  className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#333333] flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3fb5ff]"></span>
                  {med}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Column 2: Prescription Details */}
        <div className="col-span-6 space-y-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm">
            {/* Tabs */}
            <div className="flex items-center gap-2 border-b border-[#e5e7eb] px-5">
              {[
                { id: 'prescription' as const, label: 'Chi tiết Đơn thuốc' },
                { id: 'interactions' as const, label: 'Cảnh báo Tương tác (AI)' },
                { id: 'history' as const, label: 'Lịch sử cấp phát' },
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
            <div className="p-5">
              {activeTab === 'prescription' && (
                <div className="space-y-4">
                  {prescription.medications.map((med) => (
                    <div
                      key={med.id}
                      className="p-4 rounded-lg border border-[#e5e7eb] hover:border-[#3fb5ff] transition-all"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-1">
                            {med.name}
                          </p>
                          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#05619a]">
                            Số lượng: {med.quantity} {med.unit}
                          </p>
                        </div>
                        {med.stockStatus === 'available' ? (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#d4edda] text-[#155724] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                            <CheckCircle className="w-3 h-3" />
                            Còn hàng ({med.stockCount})
                          </span>
                        ) : med.stockStatus === 'low' ? (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#fff3cd] text-[#856404] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                            <AlertTriangle className="w-3 h-3" />
                            Sắp hết ({med.stockCount})
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#f8d7da] text-[#721c24] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                            <XCircle className="w-3 h-3" />
                            Hết hàng
                          </span>
                        )}
                      </div>
                      <div className="bg-[#f8f9fa] rounded p-3">
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d] mb-1">
                          Liều dùng:
                        </p>
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[13px] text-[#333333]">
                          {med.dosage}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'interactions' && (
                <div className="space-y-4">
                  {interactions.length > 0 ? (
                    interactions.map((interaction, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border-2 border-[#ffc107] bg-[#fff3cd]"
                      >
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-[#ffc107] flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] text-[#856404] mb-2">
                              ⚠️ {interaction.message}
                            </p>
                            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#856404]">
                              {interaction.detail}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="w-12 h-12 text-[#28a745] mx-auto mb-3" />
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#28a745]">
                        Không phát hiện tương tác thuốc
                      </p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  {dispensingHistory.map((record) => (
                    <div
                      key={record.id}
                      className="p-4 rounded-lg border border-[#e5e7eb]"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] text-[#3fb5ff]">
                          {record.id}
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[12px] text-[#6c757d]">
                          {record.date}
                        </p>
                      </div>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#05619a] mb-2">
                        {record.doctor}
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[13px] text-[#333333]">
                        {record.medications.join(', ')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 3: Actions */}
        <div className="col-span-3 space-y-4">
          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-5">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-4">
              Ghi chú của Dược sĩ
            </h3>
            <textarea
              value={pharmacistNotes}
              onChange={(e) => setPharmacistNotes(e.target.value)}
              placeholder="Nhập ghi chú nội bộ hoặc gửi cho Bác sĩ..."
              className="w-full h-[120px] p-3 rounded-lg border border-[#3295d0] font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] resize-none focus:outline-none focus:ring-2 focus:ring-[#3fb5ff] focus:border-transparent"
            />
          </div>

          <div className="bg-white rounded-lg border border-[#e5e7eb] shadow-sm p-5 space-y-3">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e] mb-4">
              Hành động
            </h3>
            <button
              onClick={handleDispense}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#28a745] text-white rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#218838] transition-colors"
            >
              <CheckCircle className="w-5 h-5" />
              Hoàn tất & Cấp phát
            </button>
            <button
              onClick={handleSendForReview}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#ffc107] text-[#856404] rounded-lg font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] hover:bg-[#e0a800] transition-colors"
            >
              <Flag className="w-5 h-5" />
              Gửi BS xem xét lại
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#3295d0] text-[#05619a] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f0f9ff] transition-colors">
              <Printer className="w-5 h-5" />
              In nhãn thuốc
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#3295d0] text-[#05619a] rounded-lg font-['Fz_Poppins:Medium',sans-serif] text-[14px] hover:bg-[#f0f9ff] transition-colors">
              <Save className="w-5 h-5" />
              Lưu nháp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
