import { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Activity, FileText, Edit, ChevronRight } from 'lucide-react';
import { Card } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

export function PatientMedicalRecords() {
  const [selectedTab, setSelectedTab] = useState('personal');

  // Mock data - Personal Information
  const personalInfo = {
    fullName: 'Nguyễn Văn Minh',
    dateOfBirth: '15/05/1990',
    gender: 'Nam',
    phone: '+84 912 345 678',
    email: 'nguyenvanminh@email.com',
    address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
    emergencyContact: 'Nguyễn Thị Lan - 0987 654 321',
    bloodType: 'O+',
    allergies: 'Không có',
    insuranceNumber: 'BH-123456789'
  };

  // Mock data - Treatment Plans
  const treatmentPlans = [
    {
      id: 1,
      name: 'Gói Niềng răng Invisalign',
      startDate: '01/08/2024',
      estimatedEndDate: '01/08/2025',
      progress: 25,
      currentStep: 2,
      totalSteps: 8,
      doctor: 'BS. Trần Thị B',
      status: 'active',
      nextVisit: '20/11/2024',
      description: 'Chỉnh nha bằng khay trong suốt Invisalign',
      totalCost: 65000000,
      paidAmount: 20000000,
      remainingAmount: 45000000
    },
    {
      id: 2,
      name: 'Điều trị tủy răng số 6',
      startDate: '15/09/2024',
      estimatedEndDate: '15/10/2024',
      progress: 100,
      currentStep: 3,
      totalSteps: 3,
      doctor: 'BS. Nguyễn Văn A',
      status: 'completed',
      nextVisit: null,
      description: 'Điều trị tủy răng và bọc sứ',
      totalCost: 8500000,
      paidAmount: 8500000,
      remainingAmount: 0
    }
  ];

  // Mock data - Medical History
  const medicalHistory = [
    {
      id: 1,
      date: '01/11/2024',
      service: 'Khám tổng quát',
      doctor: 'BS. Nguyễn Văn A',
      diagnosis: 'Viêm nướu nhẹ, cần vệ sinh răng miệng tốt hơn',
      treatment: 'Hướng dẫn vệ sinh răng miệng đúng cách',
      prescription: 'Nước súc miệng kháng khuẩn',
      nextVisit: '15/11/2024',
      cost: 200000
    },
    {
      id: 2,
      date: '15/10/2024',
      service: 'Tẩy trắng răng',
      doctor: 'BS. Phạm Thị D',
      diagnosis: 'Răng bị ố vàng do thói quen ăn uống',
      treatment: 'Tẩy trắng răng bằng công nghệ Laser',
      prescription: 'Kem đánh răng chuyên dụng',
      nextVisit: null,
      cost: 3500000
    },
    {
      id: 3,
      date: '01/10/2024',
      service: 'Cạo vôi răng',
      doctor: 'BS. Lê Văn C',
      diagnosis: 'Vôi răng nhiều ở hàm dưới',
      treatment: 'Lấy cao răng và đánh bóng răng',
      prescription: null,
      nextVisit: '01/04/2025',
      cost: 500000
    },
    {
      id: 4,
      date: '15/09/2024',
      service: 'Khám định kỳ',
      doctor: 'BS. Nguyễn Văn A',
      diagnosis: 'Răng số 6 bị sâu sâu, cần điều trị tủy',
      treatment: 'Chụp X-quang, lập kế hoạch điều trị',
      prescription: null,
      nextVisit: '20/09/2024',
      cost: 300000
    }
  ];

  return (
    <div className="w-full bg-[#fcfeff] py-[40px] px-[20px] md:px-[80px]">
      <div className="max-w-[1440px] mx-auto">
        {/* Header */}
        <div className="mb-[32px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px] md:text-[32px] mb-[8px]">
            Hồ sơ bệnh án
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
            Xem thông tin sức khỏe và lịch sử điều trị của bạn
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="grid w-full max-w-[600px] grid-cols-3 mb-[32px]">
            <TabsTrigger value="personal" className="font-['Fz_Poppins:Medium',sans-serif]">
              Thông tin cá nhân
            </TabsTrigger>
            <TabsTrigger value="treatment" className="font-['Fz_Poppins:Medium',sans-serif]">
              Kế hoạch điều trị
            </TabsTrigger>
            <TabsTrigger value="history" className="font-['Fz_Poppins:Medium',sans-serif]">
              Lịch sử khám
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card className="p-[24px] md:p-[32px] border-[#ebf6fc]">
              <div className="flex items-start justify-between mb-[32px]">
                <div className="flex items-center gap-[16px]">
                  <div className="w-[80px] h-[80px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center text-white font-['Fz_Poppins:Bold',sans-serif] text-[32px]">
                    {personalInfo.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[24px] mb-[4px]">
                      {personalInfo.fullName}
                    </h2>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      Mã bệnh nhân: BN-2024-0123
                    </p>
                  </div>
                </div>
                <Button className="bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] hover:bg-[#ebf6fc]">
                  <Edit className="w-[16px] h-[16px] mr-[8px]" />
                  Chỉnh sửa
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px]">
                <div className="space-y-[20px]">
                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Ngày sinh
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <Calendar className="w-[18px] h-[18px] text-[#3fb5ff]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.dateOfBirth}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Giới tính
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <User className="w-[18px] h-[18px] text-[#3fb5ff]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.gender}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Số điện thoại
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <Phone className="w-[18px] h-[18px] text-[#3fb5ff]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.phone}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Email
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <Mail className="w-[18px] h-[18px] text-[#3fb5ff]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-[20px]">
                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Địa chỉ
                    </label>
                    <div className="flex items-start gap-[12px]">
                      <MapPin className="w-[18px] h-[18px] text-[#3fb5ff] flex-shrink-0 mt-[2px]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.address}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Liên hệ khẩn cấp
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <Phone className="w-[18px] h-[18px] text-[#f44336]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.emergencyContact}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Nhóm máu
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <Activity className="w-[18px] h-[18px] text-[#f44336]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.bloodType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                      Dị ứng
                    </label>
                    <div className="flex items-center gap-[12px]">
                      <FileText className="w-[18px] h-[18px] text-[#3fb5ff]" />
                      <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                        {personalInfo.allergies}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-[24px] pt-[24px] border-t border-[#ebf6fc]">
                <label className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[13px] mb-[8px] block">
                  Số bảo hiểm y tế
                </label>
                <div className="flex items-center gap-[12px]">
                  <FileText className="w-[18px] h-[18px] text-[#3fb5ff]" />
                  <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                    {personalInfo.insuranceNumber}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Treatment Plans Tab */}
          <TabsContent value="treatment" className="space-y-[20px]">
            {treatmentPlans.map((plan) => (
              <Card key={plan.id} className="p-[24px] md:p-[32px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all">
                <div className="flex items-start justify-between mb-[24px]">
                  <div className="flex-1">
                    <div className="flex items-center gap-[12px] mb-[8px]">
                      <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px]">
                        {plan.name}
                      </h3>
                      {plan.status === 'active' ? (
                        <span className="px-[12px] py-[4px] bg-[#e8f5e9] text-[#4caf50] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                          Đang điều trị
                        </span>
                      ) : (
                        <span className="px-[12px] py-[4px] bg-[#e3f2fd] text-[#2196f3] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[12px]">
                          Đã hoàn thành
                        </span>
                      )}
                    </div>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] mb-[4px]">
                      {plan.description}
                    </p>
                    <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px]">
                      Bác sĩ điều trị: {plan.doctor}
                    </p>
                  </div>
                  <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#3fb5ff] text-[28px]">
                    {plan.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-[24px]">
                  <div className="flex items-center justify-between mb-[12px]">
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px]">
                      Tiến độ điều trị
                    </span>
                    <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                      Bước {plan.currentStep}/{plan.totalSteps}
                    </span>
                  </div>
                  <Progress value={plan.progress} className="h-[10px]" />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[16px] mb-[24px]">
                  <div className="bg-[#f5fbff] rounded-[12px] p-[16px]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                      Ngày bắt đầu
                    </p>
                    <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                      {plan.startDate}
                    </p>
                  </div>
                  <div className="bg-[#f5fbff] rounded-[12px] p-[16px]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                      Dự kiến kết thúc
                    </p>
                    <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                      {plan.estimatedEndDate}
                    </p>
                  </div>
                  <div className="bg-[#f5fbff] rounded-[12px] p-[16px]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                      Tổng chi phí
                    </p>
                    <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                      {plan.totalCost.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                  <div className="bg-[#f5fbff] rounded-[12px] p-[16px]">
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[12px] mb-[4px]">
                      Còn lại
                    </p>
                    <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#ff9800] text-[14px]">
                      {plan.remainingAmount.toLocaleString('vi-VN')}đ
                    </p>
                  </div>
                </div>

                {plan.nextVisit && (
                  <div className="bg-[#fffbf0] border border-[#ffe082] rounded-[12px] p-[16px] flex items-center justify-between">
                    <div>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#ff9800] text-[13px] mb-[2px]">
                        Lần khám tiếp theo
                      </p>
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#333333] text-[15px]">
                        {plan.nextVisit}
                      </p>
                    </div>
                    <ChevronRight className="w-[20px] h-[20px] text-[#ff9800]" />
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="history" className="space-y-[20px]">
            {medicalHistory.map((record) => (
              <Card key={record.id} className="p-[24px] md:p-[32px] border-[#ebf6fc] hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all">
                <div className="flex flex-col lg:flex-row gap-[24px]">
                  {/* Date */}
                  <div className="lg:w-[120px] flex-shrink-0">
                    <div className="bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[12px] p-[16px] text-white text-center">
                      <p className="font-['Fz_Poppins:Bold',sans-serif] text-[24px]">
                        {record.date.split('/')[0]}
                      </p>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[14px] opacity-90">
                        {record.date.split('/')[1]}/{record.date.split('/')[2]}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-[16px]">
                    <div>
                      <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[4px]">
                        {record.service}
                      </h3>
                      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px]">
                        Bác sĩ: {record.doctor}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                      <div className="bg-[#f5fbff] rounded-[12px] p-[16px]">
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[13px] mb-[8px]">
                          Chẩn đoán:
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                          {record.diagnosis}
                        </p>
                      </div>

                      <div className="bg-[#f5fbff] rounded-[12px] p-[16px]">
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[13px] mb-[8px]">
                          Điều trị:
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                          {record.treatment}
                        </p>
                      </div>
                    </div>

                    {record.prescription && (
                      <div className="bg-[#fff8e1] border border-[#ffe082] rounded-[12px] p-[16px]">
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#ff9800] text-[13px] mb-[4px]">
                          Đơn thuốc:
                        </p>
                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[14px]">
                          {record.prescription}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-[12px] border-t border-[#ebf6fc]">
                      <div>
                        {record.nextVisit && (
                          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[13px]">
                            Tái khám: <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff]">{record.nextVisit}</span>
                          </p>
                        )}
                      </div>
                      <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[16px]">
                        {record.cost.toLocaleString('vi-VN')}đ
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
