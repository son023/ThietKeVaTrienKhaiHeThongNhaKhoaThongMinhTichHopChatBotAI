import { useState, useEffect } from "react";
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
  Eye,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Card } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { authController } from "../../controllers/AuthController";
import { userController, UpdateUserRequestDTO } from "../../controllers/UserController";
import { patientController } from "../../controllers/PatientController";
import { medicalHistoryController, MedicalHistoryDTO } from "../../controllers/MedicalHistoryController";
import { appointmentController, AppointmentDTO } from "../../controllers/AppointmentController";
import { invoiceController, InvoiceDTO } from "../../controllers/InvoiceController";
import { inventoryController, DispenseOrderDTO, DispenseItemDTO } from "../../controllers/InventoryController";
import { labTestController } from "../../controllers/LabTestController";
import { LabTestDTO } from "../../models/LabTest";
import { medicalAttachmentController } from "../../controllers/MedicalAttachmentController";
import { MedicalAttachmentDTO } from "../../models";
import { LabTestDetailDialog } from "../doctor/LabTestDetailDialog";
import { UserDTO } from "../../models";
import { PatientDTO } from "../../models/Patient";

// Interface cho prescription item
interface PrescriptionItem {
  medicineName: string;
  quantity: number;
  dosage: string;
  frequency: string;
  duration: string;
  usageInstructions: string;
}

// Interface cho dữ liệu hiển thị
interface MedicalHistoryRecord {
  id: string;
  date: string;
  service: string;
  doctor: string;
  diagnosis: string[];
  treatment: string[];
  prescription: PrescriptionItem[] | null;
  labTests: LabTestDTO[] | null;
  nextVisit: string | null;
  cost: number;
}

export function PatientMedicalRecords() {
  const [selectedTab, setSelectedTab] = useState("personal");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPersonal, setIsLoadingPersonal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [medicalHistoryRecords, setMedicalHistoryRecords] = useState<MedicalHistoryRecord[]>([]);

  // Data from API
  const [user, setUser] = useState<UserDTO | null>(null);
  const [patient, setPatient] = useState<PatientDTO | null>(null);

  // Lab test detail dialog state
  const [selectedLabTest, setSelectedLabTest] = useState<LabTestDTO | null>(null);
  const [isLabTestDialogOpen, setIsLabTestDialogOpen] = useState(false);
  const [labTestAttachments, setLabTestAttachments] = useState<MedicalAttachmentDTO[]>([]);

  // State để quản lý collapse/expand cho mỗi record
  const [expandedSections, setExpandedSections] = useState<Record<string, {
    prescription: boolean;
    labTests: boolean;
  }>>({});

  // Form data for editing
  const [profileData, setProfileData] = useState({
    fullName: "",
    dob: "",
    gender: "",
    contactPhone: "",
    email: "",
    address: "",
  });

  // Load personal info on mount
  useEffect(() => {
    loadPersonalInfo();
  }, []);

  // Load medical history when tab changes
  useEffect(() => {
    if (selectedTab === "history") {
      loadMedicalHistoryData();
    }
  }, [selectedTab]);

  const loadPersonalInfo = async () => {
    try {
      setIsLoadingPersonal(true);
      const currentUser = authController.getCurrentUser();
      if (!currentUser?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      // Load user data
      const userData = await userController.getById(currentUser.id);
      setUser(userData);

      // Load patient data
      let patientData = null;
      try {
        patientData = await patientController.getById(currentUser.id);
        setPatient(patientData);
      } catch (error) {
        console.warn("Patient profile not found");
      }

      // Populate form data
      setProfileData({
        fullName: userData.fullName || "",
        dob: patientData?.dob
          ? new Date(patientData.dob).toISOString().split('T')[0]
          : "",
        gender: patientData?.gender || "",
        contactPhone: userData.phone || patientData?.contactPhone || "",
        email: userData.email || "",
        address: patientData?.address || "",
      });
    } catch (error) {
      console.error("Failed to load personal info:", error);
      toast.error("Không thể tải thông tin cá nhân");
    } finally {
      setIsLoadingPersonal(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const currentUser = authController.getCurrentUser();
      if (!currentUser?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      // Update user
      const updateUserData: UpdateUserRequestDTO = {
        fullName: profileData.fullName,
        phone: profileData.contactPhone,
        email: profileData.email,
      };
      await userController.update(currentUser.id, updateUserData);

      // Update patient profile
      try {
        await patientController.upsertProfile(currentUser.id, {
          dob: profileData.dob,
          gender: profileData.gender,
          address: profileData.address,
          contactPhone: profileData.contactPhone,
        });
      } catch (error) {
        console.error("Failed to update patient profile:", error);
        toast.warning("Cập nhật thông tin bệnh nhân thất bại");
      }

      toast.success("Cập nhật thông tin thành công!");
      setIsEditing(false);
      await loadPersonalInfo(); // Reload data
    } catch (error) {
      console.error("Failed to save profile:", error);
      toast.error("Không thể cập nhật thông tin");
    } finally {
      setIsSaving(false);
    }
  };

  const loadMedicalHistoryData = async () => {
    try {
      setIsLoading(true);
      const currentUser = authController.getCurrentUser();
      if (!currentUser?.id) {
        toast.error("Vui lòng đăng nhập");
        return;
      }

      // 1. Lấy medical histories theo patientId
      const medicalHistories = await medicalHistoryController.getByPatientId(currentUser.id);

      // 2. Với mỗi medical history, lấy thông tin appointment, invoice, doctor
      const recordsPromises = medicalHistories.map(async (mh: MedicalHistoryDTO) => {
        if (!mh.appointmentId) {
          return null;
        }

        try {
          // Lấy appointment
          const appointment = await appointmentController.getById(mh.appointmentId);

          // Lấy invoice theo appointmentId
          let invoice: InvoiceDTO | null = null;
          try {
            const invoices = await invoiceController.getInvoicesByAppointmentId(mh.appointmentId);
            invoice = invoices.length > 0 ? invoices[0] : null;
          } catch (error) {
            console.warn("Failed to load invoice for appointment:", mh.appointmentId);
          }

          // Lấy doctor name
          let doctorName = "Bác sĩ";
          try {
            const doctor = await userController.getById(appointment.doctorId);
            doctorName = doctor.fullName || `BS. ${appointment.doctorId.substring(0, 8)}`;
          } catch (error) {
            console.warn("Failed to load doctor name:", appointment.doctorId);
          }

          // Lấy service name từ medicalServices
          const serviceName = appointment.medicalServices && appointment.medicalServices.length > 0
            ? appointment.medicalServices.map(s => s.serviceName).join(", ")
            : "Khám tổng quát";

          // Format date
          const date = appointment.appointmentStartTime
            ? new Date(appointment.appointmentStartTime).toLocaleDateString('vi-VN')
            : mh.createdAt
              ? new Date(mh.createdAt).toLocaleDateString('vi-VN')
              : "N/A";

          // Format diagnosis - chỉ lấy symptoms từ medicalHistory
          const diagnosis: string[] = [];
          if (mh.symptoms) {
            // Nếu symptoms có nhiều dòng (phân cách bởi \n), split thành array
            const symptomsArray = mh.symptoms.split('\n').filter(s => s.trim());
            if (symptomsArray.length > 0) {
              diagnosis.push(...symptomsArray);
            } else {
              diagnosis.push(mh.symptoms);
            }
          }
          if (diagnosis.length === 0) {
            diagnosis.push("Không có chẩn đoán");
          }

          // Format treatment - mỗi item trên 1 dòng
          const treatment: string[] = [];
          if (mh.conditions && mh.conditions.length > 0) {
            mh.conditions.forEach(c => {
              if (c.treatment) {
                treatment.push(c.treatment);
              }
            });
          }
          if (treatment.length === 0) {
            treatment.push("Không có");
          }

          // Lấy đơn thuốc từ inventory-service
          let prescription: PrescriptionItem[] | null = null;
          try {
            const dispenseOrder = await inventoryController.getDispenseOrderByMedicalHistoryId(mh.id);
            if (dispenseOrder) {
              // Lấy danh sách thuốc trong đơn
              const dispenseItems = await inventoryController.getDispenseItemsByOrderId(dispenseOrder.id);

              // Lấy thông tin thuốc cho mỗi item
              prescription = await Promise.all(
                dispenseItems.map(async (item: DispenseItemDTO) => {
                  // Lấy inventory lot để lấy medicineId
                  let medicineName = "Thuốc";
                  try {
                    const lot = await inventoryController.getInventoryLotById(item.inventoryLotId);
                    const medicine = await inventoryController.getMedicineById(lot.medicineId);
                    medicineName = medicine.name || "Thuốc";
                  } catch (error) {
                    console.warn("Failed to load medicine name for item:", item.id);
                  }

                  return {
                    medicineName,
                    quantity: item.quantity,
                    dosage: item.dosage || "N/A",
                    frequency: item.frequency || "N/A",
                    duration: item.duration || "N/A",
                    usageInstructions: item.usageInstructions || "N/A",
                  } as PrescriptionItem;
                })
              );
            }
          } catch (error) {
            console.warn("Failed to load prescription for medical history:", mh.id, error);
          }

          // Lấy kết quả xét nghiệm
          let labTests: LabTestDTO[] | null = null;
          try {
            // Thử lấy theo medicalHistoryId trước
            labTests = await labTestController.getByMedicalHistoryId(mh.id);

            // Nếu không có, thử lấy theo appointmentId
            if (!labTests || labTests.length === 0) {
              try {
                labTests = await labTestController.getByAppointmentId(mh.appointmentId);
              } catch (error) {
                console.warn("Failed to load lab tests by appointmentId:", mh.appointmentId);
              }
            }

            // Nếu vẫn không có, set null
            if (labTests && labTests.length === 0) {
              labTests = null;
            }
          } catch (error) {
            console.warn("Failed to load lab tests for medical history:", mh.id, error);
            labTests = null;
          }

          // Next visit - có thể lấy từ appointment hoặc để null
          const nextVisit = null; // TODO: Lấy từ appointment nếu có

          // Cost từ invoice
          const cost = invoice?.totalAmount || 0;

          return {
            id: mh.id,
            date,
            service: serviceName,
            doctor: doctorName,
            diagnosis,
            treatment,
            prescription,
            labTests,
            nextVisit,
            cost,
          } as MedicalHistoryRecord;
        } catch (error) {
          console.error("Error loading medical history record:", mh.id, error);
          return null;
        }
      });

      const records = (await Promise.all(recordsPromises)).filter(
        (r): r is MedicalHistoryRecord => r !== null
      );

      // Sắp xếp theo date giảm dần (mới nhất trước)
      records.sort((a, b) => {
        try {
          const dateA = new Date(a.date.split('/').reverse().join('-'));
          const dateB = new Date(b.date.split('/').reverse().join('-'));
          return dateB.getTime() - dateA.getTime();
        } catch {
          return 0;
        }
      });

      setMedicalHistoryRecords(records);
    } catch (error) {
      console.error("Failed to load medical history:", error);
      toast.error("Không thể tải lịch sử khám");
    } finally {
      setIsLoading(false);
    }
  };

  // Get result summary for lab test (giống TestResults.tsx)
  const getResultSummary = (test: LabTestDTO): string => {
    if (test.structureJson) {
      try {
        const parsed = JSON.parse(test.structureJson);
        if (typeof parsed === 'string') return parsed;
        if (typeof parsed === 'object' && parsed !== null) {
          // Try to extract a summary from the structure
          if (parsed.result || parsed.summary || parsed.conclusion) {
            return parsed.result || parsed.summary || parsed.conclusion;
          }
          return JSON.stringify(parsed).substring(0, 100) + '...';
        }
      } catch {
        return test.structureJson.substring(0, 100) + '...';
      }
    }
    if (test.abnormalFlag) {
      return `Đánh giá: ${test.abnormalFlag}`;
    }
    return 'Kết quả đã hoàn thành';
  };

  // Handle view lab test detail
  const handleViewLabTest = async (labTest: LabTestDTO) => {
    setSelectedLabTest(labTest);
    setIsLabTestDialogOpen(true);

    // Load attachments nếu cần
    try {
      const attachments = await medicalAttachmentController.getAll();
      setLabTestAttachments(attachments);
    } catch (error) {
      console.warn("Failed to load attachments:", error);
      setLabTestAttachments([]);
    }
  };

  // Toggle function cho prescription
  const togglePrescription = (recordId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        prescription: prev[recordId]?.prescription !== false ? false : true, // Default mở
      }
    }));
  };

  // Toggle function cho lab tests
  const toggleLabTests = (recordId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [recordId]: {
        ...prev[recordId],
        labTests: prev[recordId]?.labTests !== false ? false : true, // Default mở
      }
    }));
  };

  // Format date helper
  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString('vi-VN');
    } catch {
      return dateString;
    }
  };

  // Format gender helper
  const formatGender = (gender: string | null | undefined): string => {
    if (!gender) return "N/A";
    switch (gender.toUpperCase()) {
      case "MALE":
        return "Nam";
      case "FEMALE":
        return "Nữ";
      case "OTHER":
        return "Khác";
      default:
        return gender;
    }
  };

  // Format blood type helper
  const formatBloodType = (bloodType: string | null | undefined): string => {
    if (!bloodType) return "N/A";
    // Convert A_POSITIVE to A+ format
    return bloodType.replace("_POSITIVE", "+").replace("_NEGATIVE", "-").replace("_", "");
  };

  // Format allergies helper
  const formatAllergies = (patientAllergies: any[] | null | undefined): string => {
    if (!patientAllergies || patientAllergies.length === 0) {
      return "Không có";
    }
    return patientAllergies.map(pa => pa.allergyName || "Dị ứng").join(", ");
  };

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
            <TabsTrigger value="history" className="font-medium">
              Lịch sử khám
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="personal">
            {isLoadingPersonal ? (
              <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
                <div className="flex items-center justify-center py-12">
                  <p className="text-[var(--text-regular)]">Đang tải thông tin...</p>
                </div>
              </Card>
            ) : (
              <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-[var(--accent-light)] to-[var(--accent)] rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
                      {user?.fullName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <h2 className="typo-h2 text-[var(--text-strong)] mb-1">
                        {user?.fullName || "Chưa có tên"}
                      </h2>
                      <p className="text-sm text-[var(--text-regular)] opacity-70">
                        {patient?.userId ? `Mã bệnh nhân: ${patient.userId.substring(0, 8).toUpperCase()}` : "Chưa có mã bệnh nhân"}
                      </p>
                    </div>
                  </div>
                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-white border-2 border-[var(--accent-light)] text-[var(--accent-light)] hover:bg-[var(--accent-ghost)]"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Chỉnh sửa
                    </Button>
                  ) : (
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          loadPersonalInfo(); // Reset form
                        }}
                      >
                        Hủy
                      </Button>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-gradient-to-r from-[var(--accent-light)] to-[var(--accent)]"
                        disabled={isSaving}
                      >
                        {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-5">
                    <div>
                      <Label
                        htmlFor="fullName"
                        className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block"
                      >
                        Họ và tên
                      </Label>
                      {isEditing ? (
                        <Input
                          id="fullName"
                          value={profileData.fullName}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              fullName: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <User className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                          <span className="font-medium text-[var(--text-strong)] text-sm">
                            {user?.fullName || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="dateOfBirth"
                        className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block"
                      >
                        Ngày sinh
                      </Label>
                      {isEditing ? (
                        <Input
                          id="dateOfBirth"
                          type="date"
                          value={profileData.dob}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              dob: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                          <span className="font-medium text-[var(--text-strong)] text-sm">
                            {patient?.dob ? formatDate(patient.dob) : "N/A"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="gender"
                        className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block"
                      >
                        Giới tính
                      </Label>
                      {isEditing ? (
                        <select
                          id="gender"
                          value={profileData.gender}
                          onChange={(e) =>
                            setProfileData({ ...profileData, gender: e.target.value })
                          }
                          className="w-full px-3 py-2 border border-[var(--border-soft)] rounded-lg bg-white"
                        >
                          <option value="">Chọn giới tính</option>
                          <option value="MALE">Nam</option>
                          <option value="FEMALE">Nữ</option>
                          <option value="OTHER">Khác</option>
                        </select>
                      ) : (
                        <div className="flex items-center gap-3">
                          <User className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                          <span className="font-medium text-[var(--text-strong)] text-sm">
                            {formatGender(patient?.gender)}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="phone"
                        className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block"
                      >
                        Số điện thoại
                      </Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          value={profileData.contactPhone}
                          onChange={(e) =>
                            setProfileData({ ...profileData, contactPhone: e.target.value })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Phone className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                          <span className="font-medium text-[var(--text-strong)] text-sm">
                            {user?.phone || patient?.contactPhone || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <Label
                        htmlFor="email"
                        className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block"
                      >
                        Email
                      </Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) =>
                            setProfileData({ ...profileData, email: e.target.value })
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-3">
                          <Mail className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                          <span className="font-medium text-[var(--text-strong)] text-sm">
                            {user?.email || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <Label
                        htmlFor="address"
                        className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block"
                      >
                        Địa chỉ
                      </Label>
                      {isEditing ? (
                        <Input
                          id="address"
                          value={profileData.address}
                          onChange={(e) =>
                            setProfileData({
                              ...profileData,
                              address: e.target.value,
                            })
                          }
                        />
                      ) : (
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4.5 h-4.5 text-[var(--accent-light)] flex-shrink-0 mt-0.5" />
                          <span className="font-medium text-[var(--text-strong)] text-sm">
                            {patient?.address || "N/A"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="font-medium text-[var(--text-regular)] opacity-70 text-xs mb-2 block">
                        Số bảo hiểm y tế
                      </label>
                      <div className="flex items-center gap-3">
                        <FileText className="w-4.5 h-4.5 text-[var(--accent-light)]" />
                        <span className="font-medium text-[var(--text-strong)] text-sm">
                          {patient?.insuranceNumber || "N/A"}
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
                          {formatBloodType(patient?.bloodType)}
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
                          {formatAllergies(patient?.patientAllergies)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>


              </Card>
            )}
          </TabsContent>

          {/* Medical History Tab */}
          <TabsContent value="history" className="space-y-5">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-[var(--text-regular)]">Đang tải lịch sử khám...</p>
              </div>
            ) : medicalHistoryRecords.length === 0 ? (
              <Card className="p-6 md:p-8 border-[var(--border-soft)] bg-[var(--surface-bg)] shadow-sm">
                <div className="text-center py-12">
                  <FileText className="w-16 h-16 text-[var(--text-regular)] opacity-30 mx-auto mb-4" />
                  <p className="text-[var(--text-regular)] opacity-70">
                    Chưa có lịch sử khám
                  </p>
                </div>
              </Card>
            ) : (
              medicalHistoryRecords.map((record) => (
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
                          <div className="text-sm text-[var(--text-regular)] space-y-1">
                            {record.diagnosis.map((item, index) => (
                              <div key={index}>{item}</div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-[var(--surface-muted)] rounded-xl p-4">
                          <p className="font-medium text-[var(--accent-light)] text-xs mb-2">
                            Điều trị:
                          </p>
                          <div className="text-sm text-[var(--text-regular)] space-y-1">
                            {record.treatment.map((item, index) => (
                              <div key={index}>{item}</div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Đơn thuốc - CHỈ hiển thị nếu có dữ liệu */}
                      {record.prescription && record.prescription.length > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 shadow-sm">
                          <button
                            onClick={() => togglePrescription(record.id)}
                            className="flex items-center justify-between w-full mb-3 p-2 rounded-lg hover:bg-orange-100 transition-colors duration-200 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                                <FileText className="w-4 h-4 text-orange-600" />
                              </div>
                              <p className="font-semibold text-orange-700 text-sm">
                                Đơn thuốc
                              </p>
                              <span className="text-xs font-medium text-orange-700 bg-orange-200 px-2 py-0.5 rounded-full">
                                {record.prescription.length}
                              </span>
                            </div>
                            <div className="p-1 rounded-md group-hover:bg-orange-200 transition-colors">
                              {expandedSections[record.id]?.prescription !== false ? (
                                <ChevronUp className="w-4 h-4 text-orange-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-orange-600" />
                              )}
                            </div>
                          </button>

                          {expandedSections[record.id]?.prescription !== false && (
                            <div className="space-y-2.5 mt-2">
                              {record.prescription.map((item, index) => (
                                <div key={index} className="bg-white rounded-lg p-3.5 border border-orange-200 shadow-sm hover:shadow-md transition-shadow">
                                  <div className="flex items-start gap-3">
                                    <div className="p-1.5 bg-orange-50 rounded-md mt-0.5">
                                      <FileText className="w-3.5 h-3.5 text-orange-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-semibold text-sm text-[var(--text-strong)] mb-2.5">
                                        {item.medicineName}
                                      </p>
                                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-[var(--text-regular)]">
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-orange-600">Số lượng:</span>
                                          <span>{item.quantity}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-orange-600">Liều dùng:</span>
                                          <span>{item.dosage}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-orange-600">Tần suất:</span>
                                          <span>{item.frequency}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                          <span className="font-medium text-orange-600">Thời gian:</span>
                                          <span>{item.duration}</span>
                                        </div>
                                      </div>
                                      {item.usageInstructions && item.usageInstructions !== "N/A" && (
                                        <div className="mt-2.5 pt-2.5 border-t border-orange-100">
                                          <p className="text-xs text-[var(--text-regular)]">
                                            <span className="font-medium text-orange-600">Hướng dẫn:</span>{" "}
                                            <span className="text-[var(--text-regular)]">{item.usageInstructions}</span>
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Kết quả xét nghiệm - CHỈ hiển thị nếu có dữ liệu */}
                      {record.labTests && record.labTests.length > 0 && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                          <button
                            onClick={() => toggleLabTests(record.id)}
                            className="flex items-center justify-between w-full mb-3 p-2 rounded-lg hover:bg-blue-100 transition-colors duration-200 group"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-1.5 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                                <Activity className="w-4 h-4 text-blue-600" />
                              </div>
                              <p className="font-semibold text-blue-700 text-sm">
                                Kết quả xét nghiệm
                              </p>
                              <span className="text-xs font-medium text-blue-700 bg-blue-200 px-2 py-0.5 rounded-full">
                                {record.labTests.length}
                              </span>
                            </div>
                            <div className="p-1 rounded-md group-hover:bg-blue-200 transition-colors">
                              {expandedSections[record.id]?.labTests !== false ? (
                                <ChevronUp className="w-4 h-4 text-blue-600" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                          </button>

                          {expandedSections[record.id]?.labTests !== false && (
                            <div className="space-y-2.5 mt-2">
                              {record.labTests.map((labTest, index) => {
                                const resultSummary = getResultSummary(labTest);
                                const completedDate = labTest.resultDate
                                  ? new Date(labTest.resultDate).toLocaleDateString('vi-VN')
                                  : labTest.updatedAt
                                    ? new Date(labTest.updatedAt).toLocaleDateString('vi-VN')
                                    : 'N/A';

                                return (
                                  <div key={labTest.id || index} className="bg-white rounded-lg p-3.5 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex items-start gap-3">
                                      <div className="p-1.5 bg-blue-50 rounded-md mt-0.5">
                                        <Activity className="w-3.5 h-3.5 text-blue-600" />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                                          <p className="font-semibold text-sm text-[var(--text-strong)]">
                                            {labTest.labTestType?.name || "Xét nghiệm"}
                                          </p>
                                          {labTest.status && (
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${labTest.status === 'COMPLETE' || labTest.status === 'COMPLETED'
                                                ? 'bg-green-100 text-green-700'
                                                : labTest.status === 'IN_PROGRESS' || labTest.status === 'PROCESSING'
                                                  ? 'bg-yellow-100 text-yellow-700'
                                                  : 'bg-gray-100 text-gray-700'
                                              }`}>
                                              {labTest.status === 'COMPLETE' || labTest.status === 'COMPLETED' ? 'Hoàn thành' :
                                                labTest.status === 'IN_PROGRESS' || labTest.status === 'PROCESSING' ? 'Đang xử lý' :
                                                  labTest.status === 'PENDING' ? 'Chờ xử lý' :
                                                    labTest.status}
                                            </span>
                                          )}
                                        </div>

                                        {/* Tóm tắt kết quả */}
                                        <div className="p-2.5 bg-blue-50 rounded-lg mb-2.5 border border-blue-100">
                                          <p className="font-normal text-[var(--text-regular)] text-xs leading-relaxed">
                                            <span className="font-semibold text-blue-700">Kết quả:</span>{" "}
                                            <span className="text-[var(--text-regular)]">{resultSummary}</span>
                                          </p>
                                        </div>

                                        <div className="flex items-center gap-3 text-xs text-[var(--text-regular)] opacity-75 flex-wrap">
                                          <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                            <span>{completedDate}</span>
                                          </div>
                                          {labTest.abnormalFlag === 'ABNORMAL' && (
                                            <span className="text-red-600 font-semibold flex items-center gap-1">
                                              <span>⚠️</span>
                                              <span>Bất thường</span>
                                            </span>
                                          )}
                                        </div>
                                      </div>

                                      {/* Nút Xem chi tiết */}
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleViewLabTest(labTest)}
                                        className="border-blue-600 text-blue-600 hover:bg-blue-50 hover:border-blue-700 flex-shrink-0 shadow-sm"
                                      >
                                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                                        Xem
                                      </Button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}
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
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Lab Test Detail Dialog */}
      <LabTestDetailDialog
        labTest={selectedLabTest}
        medicalAttachments={labTestAttachments}
        open={isLabTestDialogOpen}
        onOpenChange={setIsLabTestDialogOpen}
      />
    </div>
  );
}
