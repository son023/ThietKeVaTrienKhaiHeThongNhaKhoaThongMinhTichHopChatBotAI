import { useState } from 'react';
import { ArrowLeft, Phone, Mail, Calendar, User, FileText, Clipboard, Activity } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { DentalChart } from '../DentalChart';
import { Textarea } from '../ui/textarea';

interface AdminPatientDetailProps {
  patientId: string | null;
  onBack: () => void;
}

export function AdminPatientDetail({ patientId, onBack }: AdminPatientDetailProps) {
  const [selectedHistoryVisit, setSelectedHistoryVisit] = useState<string | null>(null);

  // Mock patient data
  const patient = {
    id: patientId || 'BN001',
    name: 'Nguyễn Văn An',
    phone: '0901234567',
    email: 'an.nguyen@email.com',
    dob: '15/03/1990',
    gender: 'Nam',
    address: '123 Nguyễn Huệ, Q.1, TP.HCM',
    insurance: 'DN1234567890',
    emergencyContact: 'Nguyễn Thị Bình - 0912345678',
    totalVisits: 12,
    lastVisit: '25/10/2025',
  };

  const medicalHistory = [
    {
      id: '1',
      date: '25/10/2025',
      diagnosis: 'Sâu răng số 16',
      treatment: 'Trám răng',
      doctor: 'BS. Nguyễn Văn Hùng',
      notes: 'Bệnh nhân đến khám với triệu chứng đau răng hàm trên bên phải. Sau khi khám phát hiện sâu răng số 16. Đã tiến hành trám răng bằng vật liệu composite.',
    },
    {
      id: '2',
      date: '15/09/2025',
      diagnosis: 'Vôi răng',
      treatment: 'Cạo vôi răng',
      doctor: 'BS. Trần Thị Mai',
      notes: 'Cạo vôi răng toàn hàm. Tình trạng nướu tốt, không có viêm nha chu.',
    },
    {
      id: '3',
      date: '20/07/2025',
      diagnosis: 'Khám định kỳ',
      treatment: 'Khám tổng quát',
      doctor: 'BS. Nguyễn Văn Hùng',
      notes: 'Khám định kỳ 6 tháng. Tình trạng răng miệng ổn định.',
    },
  ];

  const treatmentPlans = [
    {
      id: 'KH001',
      name: 'Kế hoạch niềng răng',
      status: 'active',
      progress: 65,
      startDate: '01/06/2024',
      estimatedEnd: '01/06/2026',
    },
  ];

  const prescriptions = [
    {
      medicine: 'Amoxicillin 500mg',
      dosage: '1 viên x 3 lần/ngày',
      duration: '7 ngày',
      notes: 'Uống sau ăn',
    },
    {
      medicine: 'Paracetamol 500mg',
      dosage: '1 viên khi đau',
      duration: '3 ngày',
      notes: 'Không quá 4g/ngày',
    },
  ];

  return (
    <div className="p-6 bg-[#fcfeff]">
      {/* DoctorHeader */}
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={onBack} className="mb-4 rounded-[10px] border-[#e8e8e8]">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Quay lại danh sách
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[#01304e] mb-2">{patient.name}</h1>
            <div className="flex flex-wrap gap-4 text-sm text-[#333333]/60">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                Mã BN: {patient.id}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                {patient.phone}
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {patient.email}
              </div>
            </div>
          </div>
          <Badge className="bg-blue-500">
            {patient.totalVisits} lần khám
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Patient Info */}
        <div className="space-y-4">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Thông tin bệnh nhân</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-[#333333]/60">Ngày sinh</p>
                <p className="text-[#333333]">{patient.dob} ({new Date().getFullYear() - 1990} tuổi)</p>
              </div>
              <div>
                <p className="text-sm text-[#333333]/60">Giới tính</p>
                <p className="text-[#333333]">{patient.gender}</p>
              </div>
              <div>
                <p className="text-sm text-[#333333]/60">Địa chỉ</p>
                <p className="text-[#333333]">{patient.address}</p>
              </div>
              <div>
                <p className="text-sm text-[#333333]/60">BHYT</p>
                <p className="text-[#333333]">{patient.insurance}</p>
              </div>
              <div>
                <p className="text-sm text-[#333333]/60">Liên hệ khẩn cấp</p>
                <p className="text-[#333333]">{patient.emergencyContact}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Kế hoạch điều trị</CardTitle>
            </CardHeader>
            <CardContent>
              {treatmentPlans.map((plan) => (
                <div key={plan.id} className="p-3 bg-[#d8f0ff]/30 rounded-[10px]">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[#333333]">{plan.name}</p>
                    <Badge className="bg-green-500">Đang điều trị</Badge>
                  </div>
                  <div className="space-y-1 text-sm text-[#333333]/60">
                    <p>Tiến độ: {plan.progress}%</p>
                    <p>Từ {plan.startDate} đến {plan.estimatedEnd}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Clinical Notes */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="text-[#01304e]">Hồ sơ lâm sàng</CardTitle>
              <p className="text-sm text-[#333333]/60">Chế độ xem - Admin chỉ có quyền xem, không chỉnh sửa</p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="dental-chart">
                <TabsList>
                  <TabsTrigger value="dental-chart">Sơ đồ răng</TabsTrigger>
                  <TabsTrigger value="clinical">Ghi chú lâm sàng</TabsTrigger>
                  <TabsTrigger value="prescription">Đơn thuốc</TabsTrigger>
                </TabsList>

                <TabsContent value="dental-chart" className="mt-4">
                  <div className="bg-white rounded-[10px] border border-[#e8e8e8] overflow-x-auto">
                    <div className="p-6 min-w-[900px]">
                      <DentalChart />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="clinical" className="mt-4">
                  <div className="space-y-3">
                    <div className="p-4 bg-gray-50 rounded-[10px]">
                      <h4 className="text-[#333333] mb-2">Lần khám gần nhất</h4>
                      <div className="space-y-2 text-sm">
                        <p><strong>Chẩn đoán:</strong> {medicalHistory[0].diagnosis}</p>
                        <p><strong>Điều trị:</strong> {medicalHistory[0].treatment}</p>
                        <p><strong>Bác sĩ:</strong> {medicalHistory[0].doctor}</p>
                        <p><strong>Ngày:</strong> {medicalHistory[0].date}</p>
                      </div>
                      <div className="mt-3 p-3 bg-white rounded-[8px]">
                        <p className="text-sm text-[#333333]/60 mb-1">Ghi chú:</p>
                        <p className="text-sm text-[#333333]">{medicalHistory[0].notes}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-50 rounded-[10px]">
                      <p className="text-sm text-[#333333]">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Admin chỉ có quyền xem thông tin lâm sàng, không thể chỉnh sửa.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="prescription" className="mt-4">
                  <div className="space-y-3">
                    {prescriptions.map((prescription, index) => (
                      <div key={index} className="p-4 bg-white border border-[#e8e8e8] rounded-[10px]">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-[#333333]">{prescription.medicine}</p>
                            <p className="text-sm text-[#333333]/60 mt-1">
                              {prescription.dosage} - {prescription.duration}
                            </p>
                            {prescription.notes && (
                              <p className="text-sm text-blue-600 mt-1">* {prescription.notes}</p>
                            )}
                          </div>
                          <Clipboard className="w-5 h-5 text-[#3FB5FF]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Medical History */}
          <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#01304e]">
                <Activity className="w-5 h-5 text-[#3FB5FF]" />
                Lịch sử khám bệnh
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {medicalHistory.map((visit) => (
                  <div 
                    key={visit.id}
                    className={`p-4 rounded-[10px] border cursor-pointer transition-all ${
                      selectedHistoryVisit === visit.id 
                        ? 'border-[#3FB5FF] bg-[#d8f0ff]/30' 
                        : 'border-[#e8e8e8] hover:border-[#3FB5FF]/50'
                    }`}
                    onClick={() => setSelectedHistoryVisit(selectedHistoryVisit === visit.id ? null : visit.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-[#3FB5FF]" />
                        <p className="text-[#333333]">{visit.date}</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-50">
                        {visit.treatment}
                      </Badge>
                    </div>
                    <p className="text-sm text-[#333333]/60 mb-1">
                      <strong>Chẩn đoán:</strong> {visit.diagnosis}
                    </p>
                    <p className="text-sm text-[#333333]/60">
                      <strong>Bác sĩ:</strong> {visit.doctor}
                    </p>
                    
                    {selectedHistoryVisit === visit.id && (
                      <div className="mt-3 p-3 bg-white rounded-[8px] border border-[#e8e8e8]">
                        <p className="text-sm text-[#333333]/60 mb-1">Ghi chú chi tiết:</p>
                        <p className="text-sm text-[#333333]">{visit.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
