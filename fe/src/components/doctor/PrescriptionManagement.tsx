import { useState, useEffect } from 'react';
import { Search, Calendar, User, FileText, Pill, Loader2, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { medicalHistoryController, MedicalHistoryDTO } from '../../controllers/MedicalHistoryController';
import { appointmentController, AppointmentDTO } from '../../controllers/AppointmentController';
import { patientController } from '../../controllers/PatientController';
import { PatientWithUser } from '../../models/Patient';
import { authController } from '../../controllers/AuthController';
import { CreatePrescriptionEnhanced } from './CreatePrescription';
import { toast } from 'sonner';

interface PrescriptionManagementProps {
  onBack?: () => void;
}

export function PrescriptionManagement({ onBack }: PrescriptionManagementProps) {
  const [medicalHistories, setMedicalHistories] = useState<MedicalHistoryDTO[]>([]);
  const [appointments, setAppointments] = useState<Record<string, AppointmentDTO>>({});
  const [patients, setPatients] = useState<Record<string, PatientWithUser>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHistory, setSelectedHistory] = useState<MedicalHistoryDTO | null>(null);
  
  const currentUser = authController.getCurrentUser();
  const doctorId = currentUser?.id;

  useEffect(() => {
    loadData();
  }, [doctorId]);

  const loadData = async () => {
    if (!doctorId) {
      toast.error('Không xác định bác sĩ');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Lấy tất cả appointments của bác sĩ
      const doctorAppointments = await appointmentController.getByDoctorId(doctorId);
      
      // Lọc chỉ lấy appointments đã hoàn thành hoặc đang khám
      const completedAppointments = doctorAppointments.filter(
        apt => apt.status === 'COMPLETED' || apt.status === 'IN_PROGRESS' || apt.status === 'PROGRESSING'
      );

      // Tạo map appointments
      const aptMap: Record<string, AppointmentDTO> = {};
      completedAppointments.forEach(apt => {
        aptMap[apt.id] = apt;
      });
      setAppointments(aptMap);

      // Lấy medical histories cho các appointments này
      const historiesPromises = completedAppointments.map(apt =>
        medicalHistoryController.getByAppointmentId(apt.id).catch(() => [])
      );
      
      const historiesArrays = await Promise.all(historiesPromises);
      const allHistories = historiesArrays.flat();
      
      setMedicalHistories(allHistories);

      // Lấy thông tin patients
      const patientIds = Array.from(new Set(allHistories.map(h => h.patientId).filter(Boolean)));
      const patientsData = await Promise.all(
        patientIds.map(pid => 
          patientController.getWithUserById(pid).catch(() => null)
        )
      );

      const patientMap: Record<string, PatientWithUser> = {};
      patientsData.forEach((p, idx) => {
        if (p) patientMap[patientIds[idx]] = p;
      });
      setPatients(patientMap);

    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Lỗi tải dữ liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectHistory = (history: MedicalHistoryDTO) => {
    setSelectedHistory(history);
  };

  const handleBackToList = () => {
    setSelectedHistory(null);
    loadData(); // Reload danh sách
  };

  const filteredHistories = medicalHistories.filter(history => {
    const patient = patients[history.patientId];
    const patientName = patient?.user?.fullName?.toLowerCase() || '';
    const symptoms = history.symptoms?.toLowerCase() || '';
    const conditions = (history.conditions || []).map(c => 
      `${c.name || ''} ${c.treatment || ''} ${c.status || ''}`
    ).join(' ').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return patientName.includes(query) || 
           symptoms.includes(query) || 
           conditions.includes(query) ||
           history.id.toLowerCase().includes(query);
  });

  // Nếu đã chọn medical history, hiển thị form tạo đơn thuốc
  if (selectedHistory) {
    const appointment = appointments[selectedHistory.appointmentId];
    
    return (
      <CreatePrescriptionEnhanced
        appointmentId={selectedHistory.appointmentId}
        medicalHistoryId={selectedHistory.id}
        patientId={selectedHistory.patientId}
        onCreated={(prescriptionId) => {
          toast.success('Đã tạo đơn thuốc thành công');
          handleBackToList();
        }}
        onBack={handleBackToList}
      />
    );
  }

  // Hiển thị danh sách medical histories
  return (
    <div className="p-6 bg-neutral-background min-h-screen">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="typo-h2 mb-2">
              Tạo đơn thuốc
            </h1>
            <p className="text-neutral-text/60">
              Chọn hồ sơ khám bệnh để kê đơn thuốc
            </p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack} className="rounded-lg border-neutral-border/50 hover:bg-neutral-muted transition-all">
              Quay lại
            </Button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-text/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, chẩn đoán..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 rounded-xl border-neutral-border/30 bg-neutral-surface focus:border-primary transition-colors h-11 shadow-sm"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
          <span className="text-neutral-text/60">Đang tải dữ liệu...</span>
        </div>
      ) : filteredHistories.length === 0 ? (
        <Card className="rounded-2xl border border-neutral-border/20 bg-neutral-surface shadow-sm">
          <CardContent className="p-16 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-muted flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-neutral-text/30" />
            </div>
            <p className="text-neutral-text/60">
              {searchQuery
                ? 'Không tìm thấy hồ sơ phù hợp'
                : 'Chưa có hồ sơ khám bệnh nào'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredHistories.map((history) => {
            const patient = patients[history.patientId];
            const appointment = appointments[history.appointmentId];

            return (
              <Card
                key={history.id}
                className="group rounded-2xl border border-neutral-border/20 bg-neutral-surface hover:border-primary hover:shadow-md transition-all duration-200 cursor-pointer"
                onClick={() => handleSelectHistory(history)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Patient Info */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-text group-hover:text-primary transition-colors">
                            {patient?.user?.fullName || 'N/A'}
                          </h3>
                          <p className="text-sm text-neutral-text/60 font-mono">
                            Mã BN: {history.patientId.slice(-6)}
                          </p>
                        </div>
                      </div>

                      {/* Medical Info */}
                      <div className="space-y-2 ml-13">
                        {history.symptoms && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-[#333333]/60 mt-0.5" />
                            <div>
                              <p className="text-xs text-[#333333]/60">Triệu chứng</p>
                              <p className="text-sm text-[#333333]">{history.symptoms}</p>
                            </div>
                          </div>
                        )}
                        
                        {history.conditions && history.conditions.length > 0 && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-[#333333]/60 mt-0.5" />
                            <div>
                              <p className="text-xs text-[#333333]/60">Tình trạng ({history.conditions.length})</p>
                              {history.conditions.map((cond, idx) => (
                                <p key={idx} className="text-sm text-[#333333]">
                                  {cond.toothNumber && <span className="font-medium">Răng {cond.toothNumber}: </span>}
                                  {cond.name} {cond.status && <span className="text-[#666666]">({cond.status})</span>}
                                </p>
                              ))}
                            </div>
                          </div>
                        )}

                        {appointment && (
                          <div className="flex items-center gap-2 ml-7">
                            <Calendar className="w-4 h-4 text-neutral-text/60" />
                            <p className="text-xs text-neutral-text/60">
                              {new Date(appointment.appointmentStartTime).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4 rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-all"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectHistory(history);
                      }}
                    >
                      <Pill className="w-4 h-4 mr-2" />
                      Kê đơn
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

