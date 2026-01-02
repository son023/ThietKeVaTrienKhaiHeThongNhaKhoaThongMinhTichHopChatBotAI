import React, {useState, useEffect, useRef, useMemo} from 'react';
import {
  ArrowLeft,
  AlertTriangle,
  Calendar,
  FileText,
  Image as ImageIcon,
  Save,
  Printer,
  Phone,
  Mail,
  Sparkles, ThermometerSun, Stethoscope, Pill, Plus, X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { ScrollArea } from '../ui/scroll-area';
import { DentalChart } from '../DentalChart';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { connectWebSocket, subscribeToAppointmentRollback } from '../../services/websocketService';
import { toast } from 'sonner';
import {PatientWithUser, ToothIssue} from "../../models/Patient";
import {medicalHistoryController, MedicalHistoryDTO} from "../../controllers/MedicalHistoryController";
import {LabTestDTO, LabTestTypeDTO} from "../../models/LabTest";
import {MedicalAttachmentDTO} from "../../models/MedicalAttachment";
import {appointmentController, authController, doctorController, patientController} from "../../controllers";
import {medicalAttachmentController} from "../../controllers/MedicalAttachmentController";
import {labTestController} from "../../controllers/LabTestController";
import {labTestTypeController} from "../../controllers/LabTestTypeController";
import {Badge} from "../ui/badge";
import {LabTestDetailDialog} from "./LabTestDetailDialog";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "../ui/dialog";

interface PatientExaminationProps {
  patientId: string | null;
  appointmentId: string | null;
  onBack: () => void;
  onNavigateToTreatmentPlan: (planId: string) => void;
  onNavigateToAppointments?: () => void;
  onNavigateToCreatePrescription?: (appointmentId?: string, medicalHistoryId?: string) => void;
}

const dentalDiseaseOptions = [
  { value: "CAVITY", label: "Sâu răng" },
  { value: "GINGIVITIS", label: "Viêm nướu" },
  { value: "PULPITIS", label: "Viêm tủy" },
  { value: "PERIODONTAL", label: "Bệnh nha chu" },
  { value: "SENSITIVITY", label: "Ê buốt" },
  { value: "OTHER", label: "Khác" },
];
const noteTemplates = [
  { id: "general", name: "Khám tổng quát", content: "Khám tổng quát:\n- Triệu chứng chính:\n- Khám lâm sàng:\n- Đánh giá:\n- Kế hoạch điều trị:" },
  { id: "filling", name: "Trám răng", content: "Chỉ định trám:\n- Răng số:\n- Vật liệu:\n- Đánh giá sau trám:" },
  { id: "root-canal", name: "Điều trị tủy", content: "Điều trị tủy:\n- Răng số:\n- Chẩn đoán:\n- Tình trạng ống tủy:\n- Kế hoạch:" },
];
const conditionToTool = (issue?: ToothIssue) => {
  const text = `${issue?.description || ""} ${issue?.status || ""}`.toLowerCase();
  if (text.includes("sâu") || text.includes("cavity")) return "cavity";
  if (text.includes("trám") || text.includes("filling")) return "filling";
  if (text.includes("tủy") || text.includes("root")) return "root-canal";
  if (text.includes("nhổ") || text.includes("extract")) return "extraction";
  if (text.includes("implant")) return "implant";
  if (text.includes("sứ") || text.includes("crown")) return "crown";
  return "issue";
};
const mapToothIssuesToChart = (issues?: ToothIssue[]) => {
  const map: Record<string, string[]> = {};
  issues?.forEach((issue) => {
    if (!issue.toothNumber) return;
    const key = issue.toothNumber.toString();
    const condition = conditionToTool(issue);
    map[key] = Array.from(new Set([...(map[key] || []), condition]));
  });
  return map;
};


export function PatientExamination({
                                     patientId,
                                     appointmentId,
                                     onBack,
                                     onNavigateToTreatmentPlan,
                                     onNavigateToAppointments,
                                     onNavigateToCreatePrescription
                                   }: PatientExaminationProps) {
  const [currentNote, setCurrentNote] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isTreatmentPlanDialogOpen, setIsTreatmentPlanDialogOpen] = useState(false);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const [patient, setPatient] = useState<PatientWithUser | null>(null);
  const [histories, setHistories] = useState<MedicalHistoryDTO[]>([]);
  const [labTestTypes, setLabTestTypes] = useState<LabTestTypeDTO[]>([]);
  const [labTests, setLabTests] = useState<LabTestDTO[]>([]);
  const [attachments, setAttachments] = useState<MedicalAttachmentDTO[]>([]);
  const [dentalChartData, setDentalChartData] = useState<Record<string, string[]>>({});
  const [internalNote, setInternalNote] = useState("");
  const [symptoms, setSymptoms] = useState<string>("");
  const [conditions, setConditions] = useState<Array<{
    toothNumber?: number;
    name: string;
    status?: string;
    treatment?: string;
    surface?: string;
  }>>([]);
  const [isAddConditionDialogOpen, setIsAddConditionDialogOpen] = useState(false);
  const [newCondition, setNewCondition] = useState<{
    toothNumber?: number;
    name: string;
    status: string;
    treatment?: string;
    surface?: string;
  }>({
    name: "",
    status: "ACTIVE"
  });
  const [labTestTypeId, setLabTestTypeId] = useState<string>("");
  const [labInstructions, setLabInstructions] = useState("");
  const [labTab, setLabTab] = useState<"request" | "results">("request");
  const [selectedLabTestId, setSelectedLabTestId] = useState<string | null>(null);
  const [isLabTestDialogOpen, setIsLabTestDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [requestingLab, setRequestingLab] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);

  const Info = ({ label, value }: { label: string; value?: string }) => (
      <div>
        <p className="text-sm text-neutral-text/60 mb-1 font-medium">{label}</p>
        <p className="text-neutral-text">{value || "Chưa có thông tin"}</p>
      </div>
  );

  const NoteBlock = ({ value }: { value?: string }) => (
      <div className="bg-neutral-muted p-4 rounded-lg whitespace-pre-wrap font-mono text-sm text-neutral-text border border-neutral-border/30">
        {value || "Không có ghi chú"}
      </div>
  );

  const formatDateTime = (iso?: string) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };


  useEffect(() => {
    if (!appointmentId) return;

    connectWebSocket();
    const navigateCallback = onNavigateToAppointments;
    const unsubscribe = subscribeToAppointmentRollback(
        appointmentId,
        (notification) => {
          toast.error(
              notification.message ||
              "Bắt đầu khám thất bại. Vui lòng quay lại trang lịch hẹn."
          );
          if (navigateCallback) {
            navigateCallback();
          }
        }
    );
    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [appointmentId, onNavigateToAppointments]);

  useEffect(() => {
    const loadData = async () => {
      if (!patientId) {
        setError("Không tìm thấy bệnh nhân.");
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const [patientRes, historyRes, labTypesRes, attachmentRes, labTestsRes] =
            await Promise.all([
              patientController.getWithUserById(patientId),
              medicalHistoryController.getByPatientId(patientId).catch(() => []),
              labTestTypeController.getAll().catch(() => []),
              medicalAttachmentController.getAll().catch(() => []),
              labTestController.getAll().catch(() => []),
            ]);

        setPatient(patientRes);
        setHistories(historyRes);
        setLabTestTypes(labTypesRes);
        setAttachments(attachmentRes);
        setLabTests(labTestsRes);
        setDentalChartData(mapToothIssuesToChart(patientRes.toothIssues));
      } catch (err) {
        setError(
            err instanceof Error ? err.message : "Không tải được dữ liệu khám"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [patientId]);

  const filteredAttachments = useMemo(() => {
    if (!appointmentId) return attachments;
    return attachments.filter(
        (att) => !att.labTestId || att.labTestId === appointmentId
    );
  }, [attachments]);

  const labTestsForAppointment = useMemo(() => {
    if (!appointmentId) return [];
    return labTests.filter((lt) => lt.appointmentId === appointmentId);
  }, [labTests]);

  const resultFiles = useMemo(() => {
    if (!filteredAttachments.length) return [];
    if (selectedLabTestId) {
      return filteredAttachments.filter((f) => f.labTestId === selectedLabTestId);
    }
    return filteredAttachments;
  }, [filteredAttachments, selectedLabTestId]);

  const selectedLabTest = useMemo(
      () => labTestsForAppointment.find((lt) => lt.id === selectedLabTestId),
      [labTestsForAppointment, selectedLabTestId]
  );

  const labStatusMeta: Record<string, { label: string; color: string }> = {
    REQUESTED: { label: "Đã yêu cầu", color: "bg-amber-100 text-amber-800" },
    ACCEPTED: { label: "Đã nhận", color: "bg-sky-100 text-sky-800" },
    IN_PROGRESS: { label: "Đang làm", color: "bg-blue-100 text-blue-800" },
    COMPLETED: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
    COMPLETE: { label: "Hoàn thành", color: "bg-green-100 text-green-800" },
    CANCELLED: { label: "Hủy", color: "bg-red-100 text-red-800" },
  };

  const applyTemplate = (templateId: string) => {
    const template = noteTemplates.find((t) => t.id === templateId);
    if (template) {
      setCurrentNote(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const handleAddCondition = () => {
    if (!newCondition.name || newCondition.name.trim() === "") {
      toast.error("Vui lòng nhập tên tình trạng");
      return;
    }
    setConditions([...conditions, { ...newCondition }]);
    setNewCondition({
      name: "",
      status: "ACTIVE"
    });
    setIsAddConditionDialogOpen(false);
    toast.success("Đã thêm chuẩn đoán lâm sàng");
  };

  const handleRemoveCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const buildConditionsFromChart = () => {
    const conditionsFromChart: Array<{
      toothNumber?: number;
      name?: string;
      status?: string;
      treatment?: string;
      surface?: string;
    }> = [];

    Object.entries(dentalChartData).forEach(([toothNumber, toothConditions]) => {
      if (toothConditions && toothConditions.length > 0) {
        conditionsFromChart.push({
          toothNumber: Number(toothNumber),
          name: toothConditions.join(", "),
          status: "ACTIVE",
          treatment: internalNote?.slice(0, 250) || undefined,
        });
      }
    });

    return conditionsFromChart;
  };

  const upsertMedicalHistoryByAppointment = async () => {
    if (!patientId) {
      throw new Error("Thiếu mã bệnh nhân");
    }
    if (!appointmentId) {
      throw new Error("Không tìm thấy lịch hẹn đang khám");
    }

    const payload = {
      appointmentId,
      patientId,
      symptoms: symptoms.trim() || undefined,
      conditions: conditions.length > 0 ? conditions : undefined,
    };

    return medicalHistoryController.updateByAppointment(payload);
  };

  const handleSaveComplete = async () => {
    if (!patientId) {
      toast.error("Thiếu mã bệnh nhân");
      return;
    }
    if (!appointmentId) {
      toast.error("Không tìm thấy lịch hẹn đang khám");
      return;
    }

    setSaving(true);
    try {
      await upsertMedicalHistoryByAppointment();

      await patientController.updateProfile(patientId, {
        userId: patientId,
        toothIssues: Object.entries(dentalChartData).map(
            ([toothNumber, toothConditions]) => ({
              toothNumber: Number(toothNumber),
              status: "ACTIVE",
              description: toothConditions.join(", "),
            })
        ),
      });

      await appointmentController.updateStatus(appointmentId, "COMPLETED");

      toast.success("Đã lưu và hoàn tất khám");

      setSymptoms("");
      setConditions([]);
      setDentalChartData({});
      setInternalNote("");
    } catch (err) {
      toast.error(
          err instanceof Error ? err.message : "Không thể lưu thông tin khám"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!patientId) {
      toast.error("Thiếu mã bệnh nhân");
      return;
    }
    if (!appointmentId) {
      toast.error("Không tìm thấy lịch hẹn đang khám");
      return;
    }

    setSavingDraft(true);
    try {
      await upsertMedicalHistoryByAppointment();

      toast.success("Đã lưu nháp khám ");
    } catch (err) {
      toast.error(
          err instanceof Error
              ? err.message
              : "Không thể lưu nháp thông tin khám"
      );
    } finally {
      setSavingDraft(false);
    }
  };

  const handleSendLabRequest = async () => {
    if (!patientId || !appointmentId) {
      toast.error("Thiếu thông tin lịch hẹn hoặc bệnh nhân");
      return;
    }
    if (!labTestTypeId) {
      toast.error("Chọn loại lab test trước khi gửi");
      return;
    }
    const doctorId = authController.getCurrentUser()?.id;
    setRequestingLab(true);
    try {
      await labTestController.request({
        appointmentId,
        doctorId,
        labTestTypeId,
        instructions: labInstructions || undefined,
        status: "REQUESTED",
      });
      toast.success("Đã gửi yêu cầu lab test");
      setLabInstructions("");
      setLabTestTypeId("");
    } catch (err) {
      toast.error(
          err instanceof Error ? err.message : "Gửi yêu cầu lab test thất bại"
      );
    } finally {
      setRequestingLab(false);
    }
  };


  const visitHistory = [
    {
      id: 'v1',
      date: '20/10/2025',
      diagnosis: 'Sâu răng 16, 17',
      treatment: 'Trám răng',
      doctor: 'BS. Nguyễn Văn Hùng',
      clinicalNotes: 'Bệnh nhân đến khám với triệu chứng đau răng khi ăn uống.\n\nKhám lâm sàng:\n- Răng 16: Sâu mặt nhai, độ sâu trung bình\n- Răng 17: Sâu mặt xa, độ sâu trung bình\n\nChẩn đoán: Sâu răng độ 2\n\nĐiều trị:\n- Làm sạch ổ sâu\n- Trám composite răng 16, 17\n- Vật liệu: Filtek Z350 XT\n\nTình trạng sau điều trị: Tốt\nHẹn tái khám sau 6 tháng',
      dentalChartNotes: 'Răng 16, 17: Đã trám composite',
      services: ['Khám tổng quát', 'Trám răng composite (2 răng)'],
    },
    {
      id: 'v2',
      date: '15/09/2025',
      diagnosis: 'Viêm nướu nhẹ',
      treatment: 'Cạo vôi răng',
      doctor: 'BS. Nguyễn Văn Hùng',
      clinicalNotes: 'Bệnh nhân đến khám định kỳ.\n\nKhám lâm sàng:\n- Nướu: Sưng nhẹ, chảy máu khi chải răng\n- Vôi răng: Nhiều ở mặt lưỡi răng hàm dưới\n- Túi nha chu: 2-3mm\n\nChẩn đoán: Viêm nướu mạn tính, vôi răng\n\nĐiều trị:\n- Cạo vôi toàn hàm\n- Đánh bóng răng\n- Hướng dẫn vệ sinh răng miệng đúng cách\n\nKhuyến cáo:\n- Chải răng 2 lần/ngày\n- Sử dụng chỉ nha khoa\n- Tái khám sau 3 tháng',
      dentalChartNotes: 'Toàn hàm: Đã cạo vôi',
      services: ['Khám tổng quát', 'Cạo vôi toàn hàm', 'Đánh bóng'],
    },
    {
      id: 'v3',
      date: '10/08/2025',
      diagnosis: 'Khám tổng quát',
      treatment: 'Tư vấn vệ sinh răng miệng',
      doctor: 'BS. Nguyễn Văn Hùng',
      clinicalNotes: 'Bệnh nhân đến khám lần đầu.\n\nTiền sử:\n- Có bệnh tiểu đường type 2, đang điều trị\n- Dị ứng Penicillin\n\nKhám lâm sàng:\n- Răng: Còn đủ 32 răng\n- Nướu: Bình thường, không sưng viêm\n- Khớp cắn: Bình thường\n- Vệ sinh răng miệng: Trung bình\n\nChẩn đoán: Răng miệng bình thường\n\nTư vấn:\n- Hướng dẫn kỹ thuật chải răng đúng cách\n- Khuyến cáo khám định kỳ 6 tháng/lần\n- Lưu ý kiểm soát đường huyết tốt\n\nKế hoạch:\n- Hẹn cạo vôi định kỳ sau 1 tháng',
      dentalChartNotes: 'Toàn hàm: Bình thường',
      services: ['Khám tổng quát', 'Tư vấn'],
    },
  ];


  const handleViewVisit = async (visit: any) => {
    // 1️⃣ set dữ liệu ban đầu
    setSelectedVisit(visit);
    setIsVisitDialogOpen(true);

    try {
      const appointmentId = visit.appointmentId;
      if (!appointmentId) return;

      const appointmentDTO = await appointmentController.getById(appointmentId);
      const doctorDTO = await doctorController.getWithUserById(
          appointmentDTO.doctorId
      );

      // 2️⃣ merge dữ liệu mới
      setSelectedVisit((prev: any) => {
        if (!prev) return prev;

        const merged = {
          ...prev,
          doctorName: doctorDTO.user?.fullName ?? "Chưa có thông tin bác sĩ",
        };


        return merged;
      });
    } catch (error) {
      console.error("Lỗi load appointment", error);
    }
  };




  const renderSnapshot = () => (
      <Card className="rounded-[14px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="rounded-lg border-[#e8e8e8]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Quay lại
              </Button>
              <div>
                <h2 className="text-neutral-text text-lg">
                  {patient?.user?.fullName || "Bệnh nhân"}
                </h2>
                <p className="text-neutral-text/60 text-sm">
                  Mã BN: {patient?.userId || patientId || "-"} •{" "}
                  {patient?.gender || "Khác"}
                </p>
                <div className="flex items-center gap-3 text-sm text-neutral-text/70 mt-1">
                  {patient?.contactPhone && (
                      <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {patient.contactPhone}
                  </span>
                  )}
                  {patient?.user?.email && (
                      <span className="flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {patient.user.email}
                  </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {patient?.bloodType && (
                  <Badge variant="outline" className="border-primary text-primary">
                    Nhóm máu: {patient.bloodType}
                  </Badge>
              )}
              <Button
                  variant="outline"
                  size="sm"
                  className="rounded-lg border-[#e8e8e8]"
              >
                <Printer className="w-4 h-4 mr-2" />
                In hồ sơ
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );

  if (loading) {
    return (
        <div className="p-6">
          <Card className="rounded-[14px] border-[#e8e8e8]">
            <CardContent className="p-6 text-neutral-text/70">
              Đang tải dữ liệu khám...
            </CardContent>
          </Card>
        </div>
    );
  }

  if (error) {
    return (
        <div className="p-6">
          <Card className="rounded-[14px] border-[#e8e8e8]">
            <CardContent className="p-6 text-red-500">{error}</CardContent>
          </Card>
        </div>
    );
  }

  return (
      <div className="p-6 flex flex-col gap-6 bg-[var(--page-bg)] min-h-screen">
        {renderSnapshot()}

        <div className="grid grid-cols-12 gap-5">
          {/* Left column: history & alerts */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="typo-h4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-red-100">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                  </div>
                  Dị ứng
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {patient?.patientAllergies?.length ? (
                    patient.patientAllergies.map((al) => (
                        <div
                            key={`${al.allergyId}-${al.allergyName}-${al.reaction}-${al.note}`}
                            className="p-3 rounded-lg border border-red-200 bg-red-50"
                        >
                          <p className="text-sm text-red-700 font-semibold">
                            {al.allergyName || al.allergyCode || "Dị ứng"}
                          </p>
                          <p className="text-xs text-red-600 mt-1">
                            {al.reaction || al.note || al.severity || "Không có mô tả"}
                          </p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-neutral-text/60">Không có dị ứng</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="typo-h4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-orange-100">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                  </div>
                  Bệnh nền
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {patient?.underlyingDiseases?.length ? (
                    patient.underlyingDiseases.map((dis, idx) => (
                        <div
                            key={`${dis.name}-${dis.status}-${idx}`}
                            className="p-3 rounded-lg border border-orange-200 bg-orange-50"
                        >
                          <p className="text-sm text-orange-700 font-semibold">
                            {dis.name || "Bệnh nền"}
                          </p>
                          <p className="text-xs text-orange-600 mt-1">
                            {dis.note || dis.status || dis.severity || "Không có mô tả"}
                          </p>
                        </div>
                    ))
                ) : (
                    <p className="text-xs text-neutral-text/60">Không có bệnh nền</p>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm h-[360px] overflow-hidden">
              <CardHeader className="p-4 pb-3">
                <CardTitle className="typo-h4 flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-primary/10">
                    <Stethoscope className="w-4 h-4 text-primary" />
                  </div>
                  Lịch sử điều trị
                </CardTitle>
              </CardHeader>
              <ScrollArea className="h-[300px]">
                <div className="px-4 pb-4 space-y-3">
                  {histories.length === 0 && (
                      <p className="text-sm text-neutral-text/60">
                        Chưa có lịch sử điều trị.
                      </p>
                  )}
                  {histories.map((item, idx) => (
                      <Card
                          key={item.id}
                          className="rounded-lg border border-neutral-border/30 hover:border-primary hover:shadow-sm bg-neutral-surface transition-all cursor-pointer"
                          onClick={() => handleViewVisit(item)}
                      >
                        <CardContent className="p-3 space-y-2">
                          <div className="flex items-center gap-2 text-xs text-neutral-text/60">
                            <Calendar className="w-3 h-3" />
                            <span>
                          {item.createdAt
                              ? new Date(item.createdAt).toLocaleDateString("vi-VN")
                              : "N/A"}
                        </span>
                          </div>
                          <p className="text-sm text-[#01304e] line-clamp-1">
                            {item.symptoms || (item.conditions && item.conditions.length > 0
                                ? item.conditions.map(c => c.name).filter(Boolean).join(", ")
                                : "Chưa có thông tin")}
                          </p>
                          <p className="text-xs text-[#333333]/60 line-clamp-2">
                            {item.conditions && item.conditions.length > 0
                                ? `${item.conditions.length} tình trạng: ${item.conditions.map(c =>
                                    c.toothNumber ? `Răng ${c.toothNumber}` : c.name
                                ).filter(Boolean).join(", ")}`
                                : "Không có ghi chú"}
                          </p>
                        </CardContent>
                      </Card>
                  ))}
                </div>
              </ScrollArea>
            </Card>
          </div>

          {/* Middle column: workspace */}
          <div className="col-span-12 lg:col-span-6 space-y-4">
            <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm min-h-[560px]">
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-sm text-neutral-text flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Khu vực khám bệnh
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs defaultValue="notes" className="flex flex-col gap-4">
                  <TabsList className="self-start">
                    <TabsTrigger value="notes">Ghi chú khám</TabsTrigger>
                    <TabsTrigger value="dental">Dental chart</TabsTrigger>
                    <TabsTrigger value="labtests">Lab test</TabsTrigger>
                  </TabsList>

                  <TabsContent value="notes" className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {noteTemplates.map((template) => (
                          <Button
                              key={template.id}
                              variant={
                                selectedTemplate === template.id ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => applyTemplate(template.id)}
                              className={
                                selectedTemplate === template.id
                                    ? "bg-primary hover:bg-primary/90"
                                    : ""
                              }
                          >
                            {template.name}
                          </Button>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {/* Triệu chứng */}
                      <div>
                        <Label className="text-[#01304e] mb-2 block">
                          Triệu chứng
                        </Label>
                        <Textarea
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                            placeholder="Nhập triệu chứng của bệnh nhân..."
                            className="rounded-[10px] h-[100px]"
                        />
                      </div>

                      {/* Chuẩn đoán lâm sàng */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-[#01304e] block">
                            Chuẩn đoán lâm sàng
                          </Label>
                          <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setIsAddConditionDialogOpen(true)}
                              className="rounded-[10px]"
                          >
                            <Plus className="w-4 h-4 mr-1" />
                            Thêm chuẩn đoán
                          </Button>
                        </div>

                        {conditions.length === 0 ? (
                            <div className="border border-dashed border-[#e8e8e8] rounded-[10px] p-6 text-center">
                              <p className="text-sm text-[#666666]">Chưa có chuẩn đoán lâm sàng nào</p>
                              <p className="text-xs text-[#999999] mt-1">Nhấn "Thêm chuẩn đoán" để thêm mới</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                              {conditions.map((condition, index) => (
                                  <div
                                      key={index}
                                      className="border border-[#e8e8e8] rounded-[10px] p-3 bg-[#f5fbff] flex items-start justify-between"
                                  >
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 mb-1">
                                        {condition.toothNumber && (
                                            <Badge variant="outline" className="text-xs">
                                              Răng {condition.toothNumber}
                                            </Badge>
                                        )}
                                        {condition.status && (
                                            <Badge variant="outline" className="text-xs">
                                              {condition.status}
                                            </Badge>
                                        )}
                                      </div>
                                      <p className="text-sm font-medium text-[#01304e]">{condition.name}</p>
                                      {condition.treatment && (
                                          <p className="text-xs text-[#666666] mt-1">Điều trị: {condition.treatment}</p>
                                      )}
                                      {condition.surface && (
                                          <p className="text-xs text-[#666666] mt-1">Bề mặt: {condition.surface}</p>
                                      )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveCondition(index)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </div>
                              ))}
                            </div>
                        )}
                      </div>


                    </div>

                  </TabsContent>

                  <TabsContent value="dental" className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-sm text-neutral-text">
                          Dental chart (đánh dấu trực tiếp trong lúc khám)
                        </p>
                      </div>
                      <Button
                          variant="outline"
                          size="sm"
                          className="rounded-lg"
                          onClick={() =>
                              toast.info("Dental chart được lưu cùng lúc với Lưu khám")
                          }
                      >
                        Tự động lưu khi hoàn tất khám
                      </Button>
                    </div>
                    <div className="border border-[#e8e8e8] rounded-[12px] p-4 bg-white">
                      <DentalChart
                          value={dentalChartData}
                          onChange={setDentalChartData}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="labtests" className="space-y-4">
                    <Tabs value={labTab} onValueChange={(v) => setLabTab(v as "request" | "results")}>
                      <TabsList className="self-start">
                        <TabsTrigger value="request">Tạo yêu cầu</TabsTrigger>
                        <TabsTrigger value="results">Lịch sử</TabsTrigger>
                      </TabsList>

                      <TabsContent value="request" className="space-y-3">
                        <div className="flex items-center gap-2">
                          <ThermometerSun className="w-4 h-4 text-primary" />
                          <p className="text-sm text-neutral-text">Gửi yêu cầu lab test</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-1">
                            <Label className="text-neutral-text mb-1 block">
                              Loại lab test
                            </Label>
                            <Select
                                value={labTestTypeId}
                                onValueChange={setLabTestTypeId}
                            >
                              <SelectTrigger className="rounded-lg">
                                <SelectValue placeholder="Chọn loại lab test" />
                              </SelectTrigger>
                              <SelectContent>
                                {labTestTypes.map((lt) => (
                                    <SelectItem key={lt.id} value={lt.id}>
                                      {lt.name}
                                    </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-neutral-text mb-1 block">
                              Hướng dẫn / ghi chú
                            </Label>
                            <Textarea
                                value={labInstructions}
                                onChange={(e) => setLabInstructions(e.target.value)}
                                placeholder="Ví dụ: yêu cầu kết quả trong ngày, lưu ý dị ứng, ..."
                                className="min-h-[100px]"
                            />
                          </div>
                        </div>
                        <Button
                            onClick={handleSendLabRequest}
                            disabled={requestingLab}
                            className="bg-primary hover:bg-primary/90 rounded-lg"
                        >
                          <ThermometerSun className="w-4 h-4 mr-2" />
                          {requestingLab ? "Đang gửi..." : "Gửi yêu cầu lab test"}
                        </Button>
                      </TabsContent>

                      <TabsContent value="results" className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ThermometerSun className="w-4 h-4 text-primary" />
                            <p className="text-sm text-neutral-text">Lịch sử yêu cầu</p>
                          </div>
                          {labTestsForAppointment.length === 0 ? (
                              <p className="text-sm text-neutral-text/60">
                                Chưa có yêu cầu lab test.
                              </p>
                          ) : (
                              <div className="space-y-2">
                                {labTestsForAppointment.map((lt) => {
                                  const statusMeta =
                                      labStatusMeta[lt.status || ""] ||
                                      labStatusMeta.REQUESTED;
                                  const isCompleted =
                                      lt.status === "COMPLETED" || lt.status === "COMPLETE";
                                  return (
                                      <Card
                                          key={lt.id}
                                          className={`rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm ${
                                              isCompleted ? "cursor-pointer hover:border-primary" : ""
                                          }`}
                                          onClick={() =>
                                              isCompleted
                                                  ? (setSelectedLabTestId(lt.id), setIsLabTestDialogOpen(true))
                                                  : undefined
                                          }
                                      >
                                        <CardContent className="p-3 space-y-1">
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="text-sm text-neutral-text">
                                              {lt.labTestType?.name || "Lab test"}
                                            </div>
                                            <Badge className={statusMeta.color}>{statusMeta.label}</Badge>
                                          </div>
                                          <p className="text-xs text-neutral-text/60">
                                            {lt.instructions || "Không có ghi chú"}
                                          </p>
                                          <p className="text-xs text-neutral-text/60">
                                            Tạo lúc:{" "}
                                            {lt.createdAt
                                                ? new Date(lt.createdAt).toLocaleString("vi-VN")
                                                : "N/A"}
                                          </p>
                                          {isCompleted && (
                                              <p className="text-xs text-primary">
                                                Nhấp để xem kết quả
                                              </p>
                                          )}
                                        </CardContent>
                                      </Card>
                                  );
                                })}
                              </div>
                          )}
                        </div>


                        <div className="space-y-3">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-primary" />
                            <p className="text-sm text-neutral-text">
                              Kết quả / file đính kèm từ lab
                            </p>
                          </div>
                          {resultFiles.length === 0 ? (
                              <p className="text-sm text-neutral-text/60">
                                Chưa có kết quả lab.
                              </p>
                          ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {resultFiles.map((file) => (
                                    <Card
                                        key={file.id}
                                        className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm"
                                    >
                                      <CardContent className="p-3 space-y-1">
                                        <p className="text-sm text-neutral-text line-clamp-1">
                                          {file.filePath || "Tệp không tên"}
                                        </p>
                                        <p className="text-xs text-neutral-text/60">
                                          Loại: {file.type || "khác"}
                                        </p>
                                        <p className="text-xs text-neutral-text/60">
                                          Cập nhật:{" "}
                                          {file.updatedAt
                                              ? new Date(file.updatedAt).toLocaleDateString("vi-VN")
                                              : "N/A"}
                                        </p>
                                      </CardContent>
                                    </Card>
                                ))}
                              </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right column: actions */}
          <div className="col-span-12 lg:col-span-3">
            <div className="lg:sticky top-4 space-y-4">
              <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-sm text-neutral-text">
                    Ghi chú nội bộ
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <Textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Ghi chú cho phụ tá..."
                      className="min-h-[100px] text-sm"
                  />
                </CardContent>
              </Card>

              <Card className="rounded-xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
                <CardContent className="p-4 space-y-2">
                  <Button
                      className="w-full bg-primary hover:bg-primary/90 rounded-lg"
                      onClick={handleSaveComplete}
                      disabled={saving || savingDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {saving ? "Đang lưu..." : "Lưu & Hoàn tất khám"}
                  </Button>
                  <Button
                      variant="outline"
                      className="w-full rounded-lg border-[#e8e8e8]"
                      onClick={handleSaveDraft}
                      disabled={saving || savingDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savingDraft ? "Đang lưu nháp..." : "Lưu nháp"}
                  </Button>
                  <Button
                      variant="outline"
                      className="w-full rounded-lg border-[#e8e8e8]"
                      onClick={() => onNavigateToTreatmentPlan("new")}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Tạo kế hoạch điều trị
                  </Button>

                  {onNavigateToCreatePrescription && (
                      <Button
                          //variant="outline"
                          className="w-full bg-primary hover:bg-primary/90 rounded-lg"
                          onClick={() => onNavigateToCreatePrescription(localStorage.getItem('currentAppointmentId') || undefined, undefined)}
                      >
                        <Pill className="w-4 h-4 mr-2" />
                        Tạo đơn thuốc
                      </Button>
                  )}

                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        <LabTestDetailDialog
            labTest={selectedLabTest || null}
            medicalAttachments={attachments}
            open={isLabTestDialogOpen}
            onOpenChange={(open) => {
              setIsLabTestDialogOpen(open);
              if (!open) {
                setSelectedLabTestId(null);
              }
            }}
        />

        <Dialog open={isAddConditionDialogOpen} onOpenChange={setIsAddConditionDialogOpen}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle>Thêm chuẩn đoán lâm sàng</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div>
                <Label className="text-[#01304e] mb-1 block">
                  Tên tình trạng <span className="text-red-500">*</span>
                </Label>
                <Input
                    value={newCondition.name}
                    onChange={(e) => setNewCondition({ ...newCondition, name: e.target.value })}
                    placeholder="VD: Sâu răng, Viêm nướu..."
                    className="rounded-[10px]"
                />
              </div>

              <div>
                <Label className="text-[#01304e] mb-1 block">
                  Răng số (tùy chọn)
                </Label>
                <Input
                    type="number"
                    min={11}
                    max={48}
                    value={newCondition.toothNumber || ""}
                    onChange={(e) => setNewCondition({
                      ...newCondition,
                      toothNumber: e.target.value ? Number(e.target.value) : undefined
                    })}
                    placeholder="VD: 16, 25..."
                    className="rounded-[10px]"
                />
              </div>

              <div>
                <Label className="text-[#01304e] mb-1 block">
                  Trạng thái
                </Label>
                <Select
                    value={newCondition.status || "ACTIVE"}
                    onValueChange={(value) => setNewCondition({ ...newCondition, status: value })}
                >
                  <SelectTrigger className="rounded-[10px] bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                    <SelectItem value="TREATED">TREATED</SelectItem>
                    <SelectItem value="PENDING">PENDING</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-[#01304e] mb-1 block">
                  Điều trị (tùy chọn)
                </Label>
                <Input
                    value={newCondition.treatment || ""}
                    onChange={(e) => setNewCondition({ ...newCondition, treatment: e.target.value })}
                    placeholder="VD: Trám răng composite..."
                    className="rounded-[10px]"
                />
              </div>

              <div>
                <Label className="text-[#01304e] mb-1 block">
                  Bề mặt (tùy chọn)
                </Label>
                <Input
                    value={newCondition.surface || ""}
                    onChange={(e) => setNewCondition({ ...newCondition, surface: e.target.value })}
                    placeholder="VD: Mặt nhai, Mặt trong..."
                    className="rounded-[10px]"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                    variant="outline"
                    onClick={() => {
                      setIsAddConditionDialogOpen(false);
                      setNewCondition({ name: "", status: "ACTIVE" });
                    }}
                    className="rounded-[10px]"
                >
                  Hủy
                </Button>
                <Button
                    onClick={handleAddCondition}
                    className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
                >
                  Thêm
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-lg bg-white">
            <DialogHeader>
              <DialogTitle className="text-neutral-text">
                Lịch sử khám - {formatDateTime(selectedVisit?.createdAt)}
              </DialogTitle>
              <DialogDescription>
                Thông tin chi tiết về lần khám bệnh
              </DialogDescription>
            </DialogHeader>

            {!selectedVisit ? (
                <p className="text-sm text-neutral-text/60 mt-4">
                  Không có dữ liệu lịch sử khám.
                </p>
            ) : (
                <div className="space-y-4 mt-4">

                  {/* Visit Info */}
                  <div className="grid grid-cols-2 gap-4 p-4 bg-[#d8f0ff]/30 rounded-lg">
                    <Info label="Ngày khám" value={formatDateTime(selectedVisit?.createdAt)} />
                    <Info label="Bác sĩ" value={selectedVisit.doctorName} />
                    <Info label="Triệu chứng" value={selectedVisit.symptoms || "Không có"} />
                    {selectedVisit.conditions && selectedVisit.conditions.length > 0 && (
                        <div>
                          <p className="text-xs text-[#666666] mb-1">Tình trạng ({selectedVisit.conditions.length}):</p>
                          {selectedVisit.conditions.map((cond: any, idx: number) => (
                              <div key={idx} className="text-sm text-[#333333] mb-1 pl-2 border-l-2 border-[#3FB5FF]">
                                {cond.toothNumber && `Răng ${cond.toothNumber}: `}
                                {cond.name} {cond.status && `(${cond.status})`}
                                {cond.treatment && ` - ${cond.treatment}`}
                              </div>
                          ))}
                        </div>
                    )}
                  </div>

                  {/* Clinical Notes */}
                  <Card className="rounded-[15px] border-[#e8e8e8]">
                    <CardHeader>
                      <CardTitle className="text-neutral-text">Ghi chú lâm sàng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NoteBlock value={selectedVisit.clinicalNotes} />
                    </CardContent>
                  </Card>

                  {/* Dental Chart Notes */}
                  <Card className="rounded-[15px] border-[#e8e8e8]">
                    <CardHeader>
                      <CardTitle className="text-neutral-text">Ghi chú sơ đồ răng</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <NoteBlock value={selectedVisit.dentalChartNotes} />
                    </CardContent>
                  </Card>

                  {/* Services */}
                  <Card className="rounded-[15px] border-[#e8e8e8]">
                    <CardHeader>
                      <CardTitle className="text-neutral-text">Dịch vụ đã thực hiện</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {Array.isArray(selectedVisit.services) && selectedVisit.services.length > 0 ? (
                          <div className="space-y-2">
                            {selectedVisit.services.map((service: string, index: number) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-2 p-2 bg-[#d8f0ff]/30 rounded-lg"
                                >
                                  <div className="w-2 h-2 bg-primary rounded-full" />
                                  <span className="text-sm text-neutral-text">
                      {service}
                    </span>
                                </div>
                            ))}
                          </div>
                      ) : (
                          <p className="text-sm text-neutral-text/60">
                            Không có dịch vụ nào
                          </p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsVisitDialogOpen(false)}
                        className="rounded-lg border-[#e8e8e8]"
                    >
                      Đóng
                    </Button>
                    <Button
                        className="bg-primary hover:bg-primary/90 rounded-lg"
                        onClick={() => console.log("In hồ sơ khám")}
                    >
                      In hồ sơ
                    </Button>
                  </div>

                </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
  );

}