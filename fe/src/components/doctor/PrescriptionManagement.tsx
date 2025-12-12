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
    const diagnosis = history.diagnosis?.toLowerCase() || '';
    const disease = history.disease?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    
    return patientName.includes(query) || 
           diagnosis.includes(query) || 
           disease.includes(query) ||
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
    <div className="p-6 bg-[#fcfeff]">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-[#01304e] text-2xl font-semibold mb-2">
              Tạo đơn thuốc
            </h1>
            <p className="text-[#333333]/60">
              Chọn hồ sơ khám bệnh để kê đơn thuốc
            </p>
          </div>
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              Quay lại
            </Button>
          )}
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#333333]/40" />
          <Input
            type="text"
            placeholder="Tìm kiếm theo tên bệnh nhân, chẩn đoán..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-[10px] border-[#e8e8e8]"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#3FB5FF]" />
          <span className="ml-3 text-[#333333]/60">Đang tải dữ liệu...</span>
        </div>
      ) : filteredHistories.length === 0 ? (
        <Card className="rounded-[15px] border-[#e8e8e8]">
          <CardContent className="p-12 text-center">
            <FileText className="w-12 h-12 text-[#333333]/20 mx-auto mb-3" />
            <p className="text-[#333333]/60">
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
                className="rounded-[15px] border-[#e8e8e8] hover:border-[#3FB5FF] hover:shadow-lg transition-all cursor-pointer"
                onClick={() => handleSelectHistory(history)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* Patient Info */}
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#3FB5FF]/10 flex items-center justify-center">
                          <User className="w-5 h-5 text-[#3FB5FF]" />
                        </div>
                        <div>
                          <h3 className="text-[#01304e] font-semibold">
                            {patient?.user?.fullName || 'N/A'}
                          </h3>
                          <p className="text-sm text-[#333333]/60">
                            Mã BN: {history.patientId.slice(-6)}
                          </p>
                        </div>
                      </div>

                      {/* Medical Info */}
                      <div className="space-y-2 ml-13">
                        {history.diagnosis && (
                          <div className="flex items-start gap-2">
                            <FileText className="w-4 h-4 text-[#333333]/60 mt-0.5" />
                            <div>
                              <p className="text-xs text-[#333333]/60">Chẩn đoán</p>
                              <p className="text-sm text-[#333333]">{history.diagnosis}</p>
                            </div>
                          </div>
                        )}
                        
                        {history.disease && (
                          <div className="flex items-start gap-2">
                            <Badge variant="outline" className="text-xs">
                              {history.disease}
                            </Badge>
                          </div>
                        )}

                        {appointment && (
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-[#333333]/60" />
                            <p className="text-xs text-[#333333]/60">
                              {new Date(appointment.appointmentStartTime).toLocaleString('vi-VN')}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-4"
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

