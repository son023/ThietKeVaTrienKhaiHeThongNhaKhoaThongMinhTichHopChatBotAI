import { useState } from "react";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Activity,
  FileText,
  Edit,
  ChevronRight,
} from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";

export function PatientMedicalRecords() {
  const [selectedTab, setSelectedTab] = useState("personal");

  // Mock data - Personal Information
  const personalInfo = {
    fullName: "Nguyễn Văn Minh",
    dateOfBirth: "15/05/1990",
    gender: "Nam",
    phone: "+84 912 345 678",
    email: "nguyenvanminh@email.com",
    address: "123 Đường ABC, Phường XYZ, Quận 1, TP.HCM",
    emergencyContact: "Nguyễn Thị Lan - 0987 654 321",
    bloodType: "O+",
    allergies: "Không có",
    insuranceNumber: "BH-123456789",
  };

  // Mock data - Treatment Plans
  const treatmentPlans = [
    {
      id: 1,
      name: "Gói Niềng răng Invisalign",
      startDate: "01/08/2024",
      estimatedEndDate: "01/08/2025",
      progress: 25,
      currentStep: 2,
      totalSteps: 8,
      doctor: "BS. Trần Thị B",
      status: "active",
      nextVisit: "20/11/2024",
      description: "Chỉnh nha bằng khay trong suốt Invisalign",
      totalCost: 65000000,
      paidAmount: 20000000,
      remainingAmount: 45000000,
    },
    {
      id: 2,
      name: "Điều trị tủy răng số 6",
      startDate: "15/09/2024",
      estimatedEndDate: "15/10/2024",
      progress: 100,
      currentStep: 3,
      totalSteps: 3,
      doctor: "BS. Nguyễn Văn A",
      status: "completed",
      nextVisit: null,
      description: "Điều trị tủy răng và bọc sứ",
      totalCost: 8500000,
      paidAmount: 8500000,
      remainingAmount: 0,
    },
  ];

  // Mock data - Medical History
  const medicalHistory = [
    {
      id: 1,
      date: "01/11/2024",
      service: "Khám tổng quát",
      doctor: "BS. Nguyễn Văn A",
      diagnosis: "Viêm nướu nhẹ, cần vệ sinh răng miệng tốt hơn",
      treatment: "Hướng dẫn vệ sinh răng miệng đúng cách",
      prescription: "Nước súc miệng kháng khuẩn",
      nextVisit: "15/11/2024",
      cost: 200000,
    },
    {
      id: 2,
      date: "15/10/2024",
      service: "Tẩy trắng răng",
      doctor: "BS. Phạm Thị D",
      diagnosis: "Răng bị ố vàng do thói quen ăn uống",
      treatment: "Tẩy trắng răng bằng công nghệ Laser",
      prescription: "Kem đánh răng chuyên dụng",
      nextVisit: null,
      cost: 3500000,
    },
    {
      id: 3,
      date: "01/10/2024",
      service: "Cạo vôi răng",
      doctor: "BS. Lê Văn C",
      diagnosis: "Vôi răng nhiều ở hàm dưới",
      treatment: "Lấy cao răng và đánh bóng răng",
      prescription: null,
      nextVisit: "01/04/2025",
      cost: 500000,
    },
    {
      id: 4,
      date: "15/09/2024",
      service: "Khám định kỳ",
      doctor: "BS. Nguyễn Văn A",
      diagnosis: "Răng số 6 bị sâu sâu, cần điều trị tủy",
      treatment: "Chụp X-quang, lập kế hoạch điều trị",
      prescription: null,
      nextVisit: "20/09/2024",
      cost: 300000,
    },
  ];

  return (
    <div className="w-full bg-[var(--page-bg)] py-10 px-5 md:px-20 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="typo-h1 text-[var(--text-strong)] mb-2">
            Hồ sơ bệnh án
          </h1>
          <p className="text-base text-[var(--text-regular)] opacity-70">
            Xem thông tin sức khỏe và lịch sử điều trị của bạn
          </p>
        </div>

        {/* Tabs */}
        <Tabs
          value={selectedTab}
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="grid w-80 max-w-2xl grid-cols-2 mb-8 bg-[var(--page-bg)] border border-[var(--border-soft)] rounded-xl shadow-sm">
            <TabsTrigger value="personal" className="font-medium">
              Thông tin cá nhân
            </TabsTrigger>
            {/* <TabsTrigger value="treatment" className="font-medium">
              Kế hoạch điều trị
            </TabsTrigger> */}
            <TabsTrigger value="history" className="font-medium">
              Lịch sử khám
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                    {personalInfo.fullName.charAt(0)}
                  </div>
                  <div>
                    <h2 className="typo-h2 text-[var(--text-strong)] mb-1">
                      {personalInfo.fullName}
                    </h2>
                    <p className="text-sm text-[var(--text-regular)] opacity-70">
                      Mã bệnh nhân: BN-2024-0123
                    </p>
                  </div>
                </div>
                <Button className="bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] hover:bg-[var(--accent-ghost)]">
                  <Edit className="w-4 h-4 mr-2" />
                  Chỉnh sửa
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-5">
                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Ngày sinh
                    </label>
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.dateOfBirth}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Giới tính
                    </label>
                    <div className="flex items-center gap-3">
                      <User className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.gender}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Số điện thoại
                    </label>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.phone}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Email
                    </label>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Địa chỉ
                    </label>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4.5 h-4.5 text-[var(--accent-light)] flex-shrink-0 mt-0.5" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.address}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Liên hệ khẩn cấp
                    </label>
                    <div className="flex items-center gap-3">
                      <Phone className="w-4.5 h-4.5 text-red-500" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.emergencyContact}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Nhóm máu
                    </label>
                    <div className="flex items-center gap-3">
                      <Activity className="w-4.5 h-4.5 text-red-500" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.bloodType}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                      Dị ứng
                    </label>
                    <div className="flex items-center gap-3">
                      <FileText className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                      <span className="font-medium text-[var(--text-strong)] text-sm">
                        {personalInfo.allergies}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-[var(--border-soft)]">
                <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                  Số bảo hiểm y tế
                </label>
                <div className="flex items-center gap-3">
                  <FileText className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                  <span className="font-medium text-[var(--text-strong)] text-sm">
                    {personalInfo.insuranceNumber}
                  </span>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Treatment Plans Tab */}
          <TabsContent value="treatment" className="space-y-5">
            {treatmentPlans.map((plan) => (
              <Card
                key={plan.id}
                className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg transition-all"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="typo-h3 text-[var(--text-strong)]">
                        {plan.name}
                      </h3>
                      {plan.status === "active" ? (
                        <span className="px-3 py-1.5 bg-green-50 text-green-600 rounded-lg font-medium text-xs">
                          Đang điều trị
                        </span>
                      ) : (
                        <span className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg font-medium text-xs">
                          Đã hoàn thành
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--text-regular)] opacity-70 mb-1">
                      {plan.description}
                    </p>
                    <p className="font-medium text-[var(--accent-light)] text-sm">
                      Bác sĩ điều trị: {plan.doctor}
                    </p>
                  </div>
                  <span className="text-3xl font-bold text-[var(--accent-light)]">
                    {plan.progress}%
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-[var(--text-regular)] opacity-70 text-sm">
                      Tiến độ điều trị
                    </span>
                    <span className="font-semibold text-[var(--text-strong)] text-sm">
                      Bước {plan.currentStep}/{plan.totalSteps}
                    </span>
                  </div>
                  <Progress value={plan.progress} className="h-2.5" />
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                      Ngày bắt đầu
                    </p>
                    <p className="font-semibold text-[var(--text-strong)] text-sm">
                      {plan.startDate}
                    </p>
                  </div>
                  <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                      Dự kiến kết thúc
                    </p>
                    <p className="font-semibold text-[var(--text-strong)] text-sm">
                      {plan.estimatedEndDate}
                    </p>
                  </div>
                  <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                      Tổng chi phí
                    </p>
                    <p className="font-semibold text-[var(--text-strong)] text-sm">
                      {plan.totalCost.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                  <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                    <p className="text-xs text-[var(--text-regular)] opacity-70 mb-1">
                      Còn lại
                    </p>
                    <p className="font-semibold text-orange-600 text-sm">
                      {plan.remainingAmount.toLocaleString("vi-VN")}đ
                    </p>
                  </div>
                </div>

                {plan.nextVisit && (
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-orange-600 text-xs mb-0.5">
                        Lần khám tiếp theo
                      </p>
                      <p className="font-semibold text-[var(--text-strong)] text-sm">
                        {plan.nextVisit}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-orange-500" />
                  </div>
                )}
              </Card>
            ))}
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="history" className="space-y-5">
            {medicalHistory.map((record) => (
              <Card
                key={record.id}
                className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] hover:shadow-lg transition-all"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Date */}
                  <div className="lg:w-32 flex-shrink-0">
                    <div className="bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] rounded-2xl p-4 text-white text-center">
                      <p className="text-3xl font-bold">
                        {record.date.split("/")[0]}
                      </p>
                      <p className="font-medium text-sm opacity-90 mt-1">
                        {record.date.split("/")[1]}/{record.date.split("/")[2]}
                      </p>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="typo-h4 text-[var(--text-strong)] mb-1">
                        {record.service}
                      </h3>
                      <p className="font-medium text-[var(--text-regular)] opacity-70 text-sm">
                        Bác sĩ: {record.doctor}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                        <p className="font-medium text-[var(--accent-light)] text-xs mb-2">
                          Chẩn đoán:
                        </p>
                        <p className="text-sm text-[var(--text-regular)]">
                          {record.diagnosis}
                        </p>
                      </div>

                      <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                        <p className="font-medium text-[var(--accent-light)] text-xs mb-2">
                          Điều trị:
                        </p>
                        <p className="text-sm text-[var(--text-regular)]">
                          {record.treatment}
                        </p>
                      </div>
                    </div>

                    {record.prescription && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                        <p className="font-medium text-orange-600 text-xs mb-1">
                          Đơn thuốc:
                        </p>
                        <p className="text-sm text-[var(--text-regular)]">
                          {record.prescription}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-[var(--border-soft)]">
                      <div>
                        {record.nextVisit && (
                          <p className="text-sm text-[var(--text-regular)] opacity-70">
                            Tái khám:{" "}
                            <span className="font-semibold text-[var(--accent-light)]">
                              {record.nextVisit}
                            </span>
                          </p>
                        )}
                      </div>
                      <p className="font-semibold text-[var(--text-strong)] text-base">
                        {record.cost.toLocaleString("vi-VN")}đ
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
