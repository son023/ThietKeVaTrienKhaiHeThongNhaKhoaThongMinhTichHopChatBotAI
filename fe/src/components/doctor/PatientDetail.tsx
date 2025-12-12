import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, AlertTriangle, Calendar, FileText, Image as ImageIcon, Save, Plus, X, Printer, FileCheck, Clock, User, Phone, Mail, MapPin, CreditCard } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { ScrollArea } from '../ui/scroll-area';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { DentalChart } from '../DentalChart';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { connectWebSocket, subscribeToAppointmentRollback } from '../../services/websocketService';
import { toast } from 'sonner';

interface PatientDetailProps {
  patientId: string | null;
  onBack: () => void;
  onNavigateToTreatmentPlan: (planId: string) => void;
  onNavigateToAppointments?: () => void;
  onNavigateToCreatePrescription?: (appointmentId?: string, medicalHistoryId?: string) => void;
}

export function PatientDetail({ patientId, onBack, onNavigateToTreatmentPlan, onNavigateToAppointments, onNavigateToCreatePrescription }: PatientDetailProps) {
  const [currentNote, setCurrentNote] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [isVisitDialogOpen, setIsVisitDialogOpen] = useState(false);
  const [isAppointmentDialogOpen, setIsAppointmentDialogOpen] = useState(false);
  const [isTreatmentPlanDialogOpen, setIsTreatmentPlanDialogOpen] = useState(false);
  const [internalNote, setInternalNote] = useState('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const appointmentId = localStorage.getItem('currentAppointmentId');

    console.log(`[PatientDetail] Mounted, appointmentId from localStorage:`, appointmentId);

    if (appointmentId) {
      console.log(`[PatientDetail] Subscribing to rollback for appointment: ${appointmentId}`);
      console.log(`[PatientDetail] onNavigateToAppointments available:`, !!onNavigateToAppointments);

      connectWebSocket();

      const navigateCallback = onNavigateToAppointments;

      const unsubscribe = subscribeToAppointmentRollback(appointmentId, (notification) => {
        console.log('[PatientDetail] Appointment rollback received:', notification);
        toast.error(notification.message || 'Bắt đầu khám thất bại. Vui lòng quay lại trang lịch hẹn.');

        if (navigateCallback) {
          console.log('[PatientDetail] Navigating to appointments page...');
          localStorage.removeItem('currentAppointmentId');
          navigateCallback();
        } else {
          console.error('[PatientDetail] onNavigateToAppointments is not defined!');
        }
      });

      unsubscribeRef.current = unsubscribe;

      return () => {
        if (unsubscribeRef.current) {
          unsubscribeRef.current();
          unsubscribeRef.current = null;
        }
      };
    } else {
      console.log('[PatientDetail] No appointmentId found in localStorage');
    }

  }, []);

  // Mock patient data
  const patient = {
    id: 'BN001',
    name: 'Nguyễn Văn An',
    age: 35,
    gender: 'Nam',
    phone: '0912 345 678',
    email: 'nguyenvanan@email.com',
    address: '123 Nguyễn Huệ, Quận 1, TP.HCM',
    insurance: 'Bảo hiểm y tế',
    allergies: ['PENICILLIN'],
    conditions: ['TIỂU ĐƯỜNG'],
    bloodType: 'O',
    registrationDate: '10/08/2025',
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

  const handleViewVisit = (visit: any) => {
    setSelectedVisit(visit);
    setIsVisitDialogOpen(true);
  };

  const treatmentPlans = [
    {
      id: 'tp1',
      name: 'Kế hoạch Niềng răng',
      status: 'in-progress',
      progress: 40,
      startDate: '01/09/2025',
      steps: 8,
      completed: 3,
    },
    {
      id: 'tp2',
      name: 'Điều trị tủy răng 26',
      status: 'completed',
      progress: 100,
      startDate: '15/07/2025',
      steps: 4,
      completed: 4,
    },
  ];

  const templates = [
    { id: 'general', name: 'Khám tổng quát', content: 'Khám tổng quát:\n- Tình trạng răng miệng:\n- Nướu:\n- Kết luận:\n- Kế hoạch:' },
    { id: 'scaling', name: 'Cạo vôi', content: 'Cạo vôi răng:\n- Vị trí: Toàn hàm\n- Tình trạng vôi: \n- Kết quả:' },
    { id: 'filling', name: 'Trám răng', content: 'Trám răng:\n- Vị trí răng:\n- Vật liệu:\n- Tình trạng sau trám:' },
  ];

  const xrayImages = [
    { id: '1', name: 'X-quang toàn cảnh', date: '20/10/2025', url: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=400' },
    { id: '2', name: 'CT Cone Beam', date: '15/09/2025', url: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=400' },
    { id: '3', name: 'Ảnh lâm sàng trước điều trị', date: '10/08/2025', url: 'https://images.unsplash.com/photo-1606265752439-1f18756aa5fc?w=400' },
  ];

  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setCurrentNote(template.content);
      setSelectedTemplate(templateId);
    }
  };

  const availableServices = [
    'Khám tổng quát',
    'Trám răng composite',
    'Cạo vôi răng',
    'Đánh bóng răng',
    'Nhổ răng',
    'Điều trị tủy',
    'Bọc răng sứ',
    'Cấy ghép Implant',
    'Niềng răng',
    'Tẩy trắng răng',
    'X-quang răng',
  ];

  const handleSaveComplete = () => {
    console.log('Lưu & Hoàn tất khám:', {
      notes: currentNote,
      internalNote,
      services: selectedServices,
    });
    alert('Đã lưu và hoàn tất khám bệnh!');
  };

  const handleSaveDraft = () => {
    console.log('Lưu nháp:', {
      notes: currentNote,
      internalNote,
    });
    alert('Đã lưu nháp!');
  };

  return (
    <div className="p-6 flex flex-col">
      {/* Fixed DoctorHeader */}
      <div className="bg-white border-b border-[#e8e8e8] p-6 shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="outline" size="sm" onClick={onBack} className="rounded-[10px] border-[#e8e8e8]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex-1">
            <h1 className="text-[#01304e]">{patient.name}</h1>
            <p className="text-[#333333]/60">
              {patient.age} tuổi • {patient.gender} • Mã BN: {patient.id}
            </p>
          </div>
          <div className="flex gap-2">
            {onNavigateToCreatePrescription && (
              <Button
                size="sm"
                className="rounded-[10px] bg-[#3FB5FF] text-white hover:bg-[#35a4e6]"
                onClick={() => onNavigateToCreatePrescription(localStorage.getItem('currentAppointmentId') || undefined, undefined)}
              >
                <FileText className="w-4 h-4 mr-2" />
                Tạo đơn thuốc
              </Button>
            )}
            <Button variant="outline" size="sm" className="rounded-[10px] border-[#e8e8e8]">
              <Printer className="w-4 h-4 mr-2" />
              In hồ sơ
            </Button>
          </div>
        </div>

        {/* Patient Quick Info */}
        <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-[#d8f0ff]/20 rounded-[10px]">
          <div className="flex items-center gap-2">
            <Phone className="w-4 h-4 text-[#3FB5FF]" />
            <div>
              <p className="text-xs text-[#333333]/60">Điện thoại</p>
              <p className="text-sm text-[#333333]">{patient.phone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#3FB5FF]" />
            <div>
              <p className="text-xs text-[#333333]/60">Email</p>
              <p className="text-sm text-[#333333]">{patient.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#3FB5FF]" />
            <div>
              <p className="text-xs text-[#333333]/60">Nhóm máu</p>
              <p className="text-sm text-[#333333]">{patient.bloodType}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#3FB5FF]" />
            <div>
              <p className="text-xs text-[#333333]/60">Ngày đăng ký</p>
              <p className="text-sm text-[#333333]">{patient.registrationDate}</p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        <div className="space-y-2">
          {patient.allergies.length > 0 && (
            <Alert className="border-red-300 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <span className="font-semibold">DỊ ỨNG:</span> {patient.allergies.join(', ')}
              </AlertDescription>
            </Alert>
          )}
          {patient.conditions.length > 0 && (
            <Alert className="border-orange-300 bg-orange-50">
              <AlertTriangle className="w-4 h-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <span className="font-semibold">BỆNH NỀN:</span> {patient.conditions.join(', ')}
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-4 gap-0">
          {/* Column 1: History DoctorSidebar */}
          <div className="border-r border-[#e8e8e8] bg-[#d8f0ff]/30 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e8e8e8] bg-white">
              <h3 className="text-[#01304e]">Lịch sử điều trị</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {visitHistory.map((visit) => (
                  <Card
                    key={visit.id}
                    className="cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[10px] border-[#e8e8e8] shadow-[0px_2px_8px_0px_rgba(159,166,175,0.08)]"
                    onClick={() => handleViewVisit(visit)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-[#333333]/60" />
                        <span className="text-sm text-[#333333]/60">{visit.date}</span>
                      </div>
                      <p className="text-sm text-[#333333] mb-1">{visit.diagnosis}</p>
                      <p className="text-xs text-[#333333]/60">{visit.treatment}</p>
                    </CardContent>
                  </Card>
                ))}

                {/*<div className="mt-6">*/}
                {/*  <h4 className="text-[#01304e] mb-3">Kế hoạch điều trị</h4>*/}
                {/*  {treatmentPlans.map((plan) => (*/}
                {/*    <Card*/}
                {/*      key={plan.id}*/}
                {/*      className="mb-3 cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[10px] border-[#e8e8e8] shadow-[0px_2px_8px_0px_rgba(159,166,175,0.08)]"*/}
                {/*      onClick={() => onNavigateToTreatmentPlan(plan.id)}*/}
                {/*    >*/}
                {/*      <CardContent className="p-3">*/}
                {/*        <div className="flex items-center justify-between mb-2">*/}
                {/*          <p className="text-sm text-[#333333]">{plan.name}</p>*/}
                {/*          <Badge className={plan.status === 'completed' ? 'bg-green-500' : 'bg-[#3FB5FF]'}>*/}
                {/*            {plan.completed}/{plan.steps}*/}
                {/*          </Badge>*/}
                {/*        </div>*/}
                {/*        <div className="w-full bg-gray-200 rounded-full h-2">*/}
                {/*          <div*/}
                {/*            className="bg-[#3FB5FF] h-2 rounded-full transition-all"*/}
                {/*            style={{ width: `${plan.progress}%` }}*/}
                {/*          />*/}
                {/*        </div>*/}
                {/*      </CardContent>*/}
                {/*    </Card>*/}
                {/*  ))}*/}
                {/*</div>*/}
              </div>
            </ScrollArea>
          </div>

          {/* Column 2: Main Workspace */}
          <div className="lg:col-span-2 overflow-hidden flex flex-col">
            <Tabs defaultValue="notes" className="h-full flex flex-col">
              <div className="border-b bg-white px-4">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="notes">Ghi chú lâm sàng</TabsTrigger>
                  {/*<TabsTrigger value="dental-chart">Sơ đồ răng</TabsTrigger>*/}
                  <TabsTrigger value="images">Hình ảnh & X-quang</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="notes" className="flex-1 overflow-hidden m-0">
                <div className="h-full flex flex-col">
                  <div className="p-4 border-b bg-white">
                    <div className="flex gap-2 flex-wrap">
                      {templates.map((template) => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate === template.id ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => applyTemplate(template.id)}
                          className={selectedTemplate === template.id ? 'bg-[#3FB5FF] hover:bg-[#3FB5FF]/90' : ''}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="p-4 space-y-4">
                      <div>
                        <Label className="text-[#01304e] mb-2">Ghi chú lâm sàng</Label>
                        <Textarea
                          value={currentNote}
                          onChange={(e) => setCurrentNote(e.target.value)}
                          placeholder="Nhập ghi chú lâm sàng..."
                          className="min-h-[300px] font-mono"
                        />
                      </div>

                      {/*<div>*/}
                      {/*  <Label className="text-[#01304e] mb-2">Dịch vụ chỉ định</Label>*/}
                      {/*  <Card className="rounded-[10px] border-[#e8e8e8]">*/}
                      {/*    <CardContent className="p-4">*/}
                      {/*      <div className="space-y-2 mb-3">*/}
                      {/*        {selectedServices.map((service, index) => (*/}
                      {/*          <div key={index} className="flex items-center justify-between p-2 bg-[#d8f0ff]/30 rounded-[8px]">*/}
                      {/*            <div className="flex items-center gap-2">*/}
                      {/*              <FileCheck className="w-4 h-4 text-[#3FB5FF]" />*/}
                      {/*              <span className="text-sm text-[#333333]">{service}</span>*/}
                      {/*            </div>*/}
                      {/*            <Button*/}
                      {/*              variant="ghost"*/}
                      {/*              size="sm"*/}
                      {/*              onClick={() => {*/}
                      {/*                setSelectedServices(selectedServices.filter((_, i) => i !== index));*/}
                      {/*              }}*/}
                      {/*            >*/}
                      {/*              <X className="w-4 h-4 text-red-500" />*/}
                      {/*            </Button>*/}
                      {/*          </div>*/}
                      {/*        ))}*/}
                      {/*      </div>*/}
                      {/*      <Select*/}
                      {/*        value=""*/}
                      {/*        onValueChange={(value: any) => {*/}
                      {/*          if (value && !selectedServices.includes(value)) {*/}
                      {/*            setSelectedServices([...selectedServices, value]);*/}
                      {/*          }*/}
                      {/*        }}*/}
                      {/*      >*/}
                      {/*        <SelectTrigger className="rounded-[10px]">*/}
                      {/*          <SelectValue placeholder="Chọn dịch vụ để thêm..." />*/}
                      {/*        </SelectTrigger>*/}
                      {/*        <SelectContent>*/}
                      {/*          {availableServices.map((service) => (*/}
                      {/*            <SelectItem key={service} value={service}>*/}
                      {/*              {service}*/}
                      {/*            </SelectItem>*/}
                      {/*          ))}*/}
                      {/*        </SelectContent>*/}
                      {/*      </Select>*/}
                      {/*    </CardContent>*/}
                      {/*  </Card>*/}
                      {/*</div>*/}
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>

              <TabsContent value="dental-chart" className="flex-1 overflow-hidden m-0">
                <div className="h-full overflow-auto">
                  <div className="p-4 min-w-[900px]">
                    <DentalChart />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="images" className="flex-1 overflow-hidden m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="mb-4">
                      <Button className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
                        <Plus className="w-4 h-4 mr-2" />
                        Upload ảnh mới
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {xrayImages.map((image) => (
                        <Card key={image.id} className="overflow-hidden cursor-pointer hover:border-[#3FB5FF] transition-all rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
                          <div className="aspect-video bg-gray-100 overflow-hidden">
                            <img
                              src={image.url}
                              alt={image.name}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                          <CardContent className="p-3">
                            <p className="text-sm text-[#333333]">{image.name}</p>
                            <p className="text-xs text-[#333333]/60 mt-1">{image.date}</p>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>

          {/* Column 3: Actions & Quick Notes */}
          <div className="border-l border-[#e8e8e8] bg-[#d8f0ff]/30 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[#e8e8e8] bg-white">
              <h3 className="text-[#01304e]">Hành động</h3>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                <Card className="rounded-[15px] border-[#e8e8e8] shadow-[0px_4px_12px_0px_rgba(159,166,175,0.08)]">
                  <CardHeader>
                    <CardTitle className="text-sm text-[#01304e]">Ghi chú nội bộ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="Ghi chú cho phụ tá..."
                      className="min-h-[100px] text-sm"
                    />
                  </CardContent>
                </Card>

                <div className="space-y-2">
                  <Button
                    className="w-full bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
                    onClick={handleSaveComplete}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu & Hoàn tất khám
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-[10px] border-[#e8e8e8]"
                    onClick={handleSaveDraft}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Lưu nháp
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-[10px] border-[#e8e8e8]"
                    onClick={() => setIsTreatmentPlanDialogOpen(true)}
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Tạo Kế hoạch điều trị
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full rounded-[10px] border-[#e8e8e8]"
                    onClick={() => setIsAppointmentDialogOpen(true)}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    Đặt lịch tái khám
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Visit History Dialog */}
      <Dialog open={isVisitDialogOpen} onOpenChange={setIsVisitDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-[10px] bg-white">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">
              Lịch sử khám - {selectedVisit?.date}
            </DialogTitle>
            <DialogDescription>
              Thông tin chi tiết về lần khám bệnh
            </DialogDescription>
          </DialogHeader>

          {selectedVisit && (
            <div className="space-y-4 mt-4">
              {/* Visit Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-[#d8f0ff]/30 rounded-[10px]">
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Ngày khám</p>
                  <p className="text-[#333333]">{selectedVisit.date}</p>
                </div>
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Bác sĩ</p>
                  <p className="text-[#333333]">{selectedVisit.doctor}</p>
                </div>
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Chẩn đoán</p>
                  <p className="text-[#333333]">{selectedVisit.diagnosis}</p>
                </div>
                <div>
                  <p className="text-sm text-[#333333]/60 mb-1">Điều trị</p>
                  <p className="text-[#333333]">{selectedVisit.treatment}</p>
                </div>
              </div>

              {/* Clinical Notes */}
              <Card className="rounded-[15px] border-[#e8e8e8]">
                <CardHeader>
                  <CardTitle className="text-[#01304e]">Ghi chú lâm sàng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-[10px] whitespace-pre-wrap font-mono text-sm text-[#333333]">
                    {selectedVisit.clinicalNotes}
                  </div>
                </CardContent>
              </Card>

              {/* Dental Chart Notes */}
              <Card className="rounded-[15px] border-[#e8e8e8]">
                <CardHeader>
                  <CardTitle className="text-[#01304e]">Ghi chú sơ đồ răng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-[10px] text-sm text-[#333333]">
                    {selectedVisit.dentalChartNotes}
                  </div>
                </CardContent>
              </Card>

              {/* Services */}
              <Card className="rounded-[15px] border-[#e8e8e8]">
                <CardHeader>
                  <CardTitle className="text-[#01304e]">Dịch vụ đã thực hiện</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {selectedVisit.services.map((service: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 p-2 bg-[#d8f0ff]/30 rounded-[10px]"
                      >
                        <div className="w-2 h-2 bg-[#3FB5FF] rounded-full" />
                        <span className="text-sm text-[#333333]">{service}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsVisitDialogOpen(false)}
                  className="rounded-[10px] border-[#e8e8e8]"
                >
                  Đóng
                </Button>
                <Button
                  className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[10px]"
                  onClick={() => {
                    // Could implement print functionality here
                    console.log('In hồ sơ khám');
                  }}
                >
                  In hồ sơ
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Appointment Booking Dialog */}
      <Dialog open={isAppointmentDialogOpen} onOpenChange={setIsAppointmentDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[15px]">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Đặt lịch tái khám</DialogTitle>
            <DialogDescription>
              Tạo lịch hẹn tái khám cho bệnh nhân {patient.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="appointment-date">Ngày hẹn</Label>
                <Input
                  id="appointment-date"
                  type="date"
                  className="rounded-[10px]"
                  defaultValue={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="appointment-time">Giờ hẹn</Label>
                <Select defaultValue="09:00">
                  <SelectTrigger id="appointment-time" className="rounded-[10px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="09:00">09:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="11:00">11:00</SelectItem>
                    <SelectItem value="13:00">13:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="15:00">15:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="appointment-service">Dịch vụ</Label>
              <Select defaultValue="recheck">
                <SelectTrigger id="appointment-service" className="rounded-[10px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recheck">Tái khám</SelectItem>
                  <SelectItem value="general">Khám tổng quát</SelectItem>
                  <SelectItem value="filling">Trám răng</SelectItem>
                  <SelectItem value="cleaning">Cạo vôi răng</SelectItem>
                  <SelectItem value="extraction">Nhổ răng</SelectItem>
                  <SelectItem value="root-canal">Điều trị tủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="appointment-note">Ghi chú</Label>
              <Textarea
                id="appointment-note"
                placeholder="Ghi chú về lịch hẹn..."
                className="rounded-[10px]"
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsAppointmentDialogOpen(false)}
              className="rounded-[10px] border-[#e8e8e8]"
            >
              Hủy
            </Button>
            <Button
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              onClick={() => {
                alert('Đã đặt lịch tái khám thành công!');
                setIsAppointmentDialogOpen(false);
              }}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Xác nhận đặt lịch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Treatment Plan Dialog */}
      <Dialog open={isTreatmentPlanDialogOpen} onOpenChange={setIsTreatmentPlanDialogOpen}>
        <DialogContent className="max-w-2xl rounded-[15px]">
          <DialogHeader>
            <DialogTitle className="text-[#01304e]">Tạo kế hoạch điều trị</DialogTitle>
            <DialogDescription>
              Lập kế hoạch điều trị cho bệnh nhân {patient.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <Label htmlFor="plan-name">Tên kế hoạch</Label>
              <Input
                id="plan-name"
                placeholder="VD: Kế hoạch Niềng răng"
                className="rounded-[10px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="plan-start-date">Ngày bắt đầu</Label>
                <Input
                  id="plan-start-date"
                  type="date"
                  className="rounded-[10px]"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <Label htmlFor="plan-duration">Thời gian dự kiến (tháng)</Label>
                <Input
                  id="plan-duration"
                  type="number"
                  placeholder="6"
                  className="rounded-[10px]"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="plan-description">Mô tả kế hoạch</Label>
              <Textarea
                id="plan-description"
                placeholder="Mô tả chi tiết về kế hoạch điều trị..."
                className="rounded-[10px] min-h-[100px]"
              />
            </div>

            <div>
              <Label>Các bước điều trị</Label>
              <div className="space-y-2 mt-2">
                <div className="flex gap-2">
                  <Input placeholder="Bước 1: Khám và tư vấn" className="rounded-[10px]" />
                  <Button variant="outline" size="sm" className="rounded-[10px]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Bước 2: Lấy dấu răng" className="rounded-[10px]" />
                  <Button variant="outline" size="sm" className="rounded-[10px]">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              variant="outline"
              onClick={() => setIsTreatmentPlanDialogOpen(false)}
              className="rounded-[10px] border-[#e8e8e8]"
            >
              Hủy
            </Button>
            <Button
              className="bg-[#3FB5FF] hover:bg-[#3FB5FF]/90 rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
              onClick={() => {
                alert('Đã tạo kế hoạch điều trị thành công!');
                setIsTreatmentPlanDialogOpen(false);
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Tạo kế hoạch
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
