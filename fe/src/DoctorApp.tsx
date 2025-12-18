import { useEffect, useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { authController, doctorController } from './controllers';
import type { DoctorWithUser } from './controllers/DoctorController';
import { PrescriptionManagement } from './components/doctor/PrescriptionManagement';

// Doctor Dashboard
import { DoctorSidebar } from './components/DoctorSidebar';
import { DoctorHeader } from './components/DoctorHeader';
import { Dashboard } from './components/doctor/Dashboard';
import { MyAppointments } from './components/doctor/MyAppointments';
import { MyPatients } from './components/doctor/MyPatients';
import {PatientExamination} from './components/doctor/PatientExamination';
import { TreatmentPlans } from './components/doctor/TreatmentPlans';
import { TreatmentPlanDetail } from './components/doctor/TreatmentPlanDetail';
import { PersonalPerformance } from './components/doctor/PersonalPerformance';
import { AccountSettings } from './components/doctor/AccountSettings';

interface DoctorAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function DoctorApp({ onLogout, onGoHome }: DoctorAppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedTreatmentPlanId, setSelectedTreatmentPlanId] = useState<string | null>(null);
  const [doctor, setDoctor] = useState<DoctorWithUser | null>(null);
  const [isLoadingDoctor, setIsLoadingDoctor] = useState(true);


  // thêm bên cạnh các state khác
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [selectedMedicalHistoryId, setSelectedMedicalHistoryId] = useState<string | null>(null);



  const currentUser = authController.getCurrentUser();
  const doctorId = currentUser?.id || null;

  // hàm tiện ích để mở màn tạo đơn thuốc
  const goCreatePrescription = (payload: {
    appointmentId?: string;
    medicalHistoryId?: string;
    patientId?: string;
  }) => {
    setSelectedAppointmentId(payload.appointmentId || null);
    setSelectedMedicalHistoryId(payload.medicalHistoryId || null);
    setSelectedPatientId(payload.patientId || null);
    setCurrentPage('create-prescription');
    navigate('/doctor/create-prescription');
  };

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorId) {
        setIsLoadingDoctor(false);
        return;
      }
      try {
        const data = await doctorController.getWithUserById(doctorId);
        setDoctor(data);
      } catch (error) {
        console.error('Failed to load doctor profile', error);
      } finally {
        setIsLoadingDoctor(false);
      }
    };
    fetchDoctor();
  }, [doctorId]);

  useEffect(() => {
    if (location.pathname.startsWith('/doctor/appointments')) {
      setCurrentPage('appointments');
    } else if (location.pathname.startsWith('/doctor/patients')) {
      if (location.pathname.includes('/examination')) {
        setCurrentPage('patient-examination');
      } else {
        setCurrentPage('patients');
      }
    } else if (location.pathname.startsWith('/doctor/create-prescription')) {
      setCurrentPage('create-prescription');
    } else if (location.pathname.startsWith('/doctor/treatment-plans')) {
      if (location.pathname.startsWith('/doctor/treatment-plans/')) {
        setCurrentPage('treatment-plan-detail');
      } else {
        setCurrentPage('treatment-plans');
      }
    } else if (location.pathname.startsWith('/doctor/performance')) {
      setCurrentPage('performance');
    } else if (location.pathname.startsWith('/doctor/account')) {
      setCurrentPage('account');
    } else {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  const handleSidebarNavigate = (page: string) => {
    switch (page) {
      case 'dashboard':
        navigate('/doctor');
        break;
      case 'appointments':
        navigate('/doctor/appointments');
        break;
      case 'patients':
        navigate('/doctor/patients');
        break;
      case 'create-prescription':
        navigate('/doctor/create-prescription');
        break;
      case 'performance':
        navigate('/doctor/performance');
        break;
      case 'account':
        navigate('/doctor/account');
        break;
      default:
        navigate('/doctor');
        break;
    }
  };

  function PatientExaminationRoute() {
    const params = useParams<{ patientId: string }>();
    const patientId = params.patientId || selectedPatientId || null;
    if (!patientId) {
      return <Navigate to="/doctor/patients" replace />;
    }
    if (patientId !== selectedPatientId) {
      setSelectedPatientId(patientId);
    }
    return (
      <PatientExamination
        patientId={patientId}
        appointmentId={selectedAppointmentId}
        onBack={() => navigate('/doctor/patients')}
        onNavigateToAppointments={() => navigate('/doctor/appointments')}
        onNavigateToTreatmentPlan={(planId) => {
          setSelectedTreatmentPlanId(planId);
          navigate(`/doctor/treatment-plans/${planId}`);
        }}
        onNavigateToCreatePrescription={(appointmentId, medicalHistoryId) =>
          goCreatePrescription({ appointmentId, medicalHistoryId, patientId: selectedPatientId || undefined })
        }
      />
    );
  }

  function TreatmentPlanDetailRoute() {
    const params = useParams<{ planId: string }>();
    const planId = params.planId || selectedTreatmentPlanId;
    if (!planId) {
      return <Navigate to="/doctor/treatment-plans" replace />;
    }
    if (planId !== selectedTreatmentPlanId) {
      setSelectedTreatmentPlanId(planId);
    }
    return (
      <TreatmentPlanDetail
        planId={planId}
        onBack={() => navigate('/doctor/treatment-plans')}
      />
    );
  }


  return (
    <div className="flex h-screen bg-[#fcfeff]">
      <DoctorSidebar currentPage={currentPage} onNavigate={handleSidebarNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader
          onLogout={onLogout}
          onGoHome={onGoHome}
          doctor={doctor || undefined}
          isLoading={isLoadingDoctor}
        />
        <main className="flex-1 overflow-y-auto bg-[#fcfeff]">
          <Routes>
            <Route
              path="/doctor"
              element={
                <Dashboard
                  doctorId={doctorId}
                  onNavigateToPatient={(id) => {
                    setSelectedPatientId(id);
                    navigate(`/doctor/patients/${id}/examination`);
                  }}
                />
              }
            />
            <Route
              path="/doctor/appointments"
              element={
                <MyAppointments
                  doctorId={doctorId}
                  onNavigateToPatient={(patientId, appointmentId) => {
                    setSelectedPatientId(patientId);
                    setSelectedAppointmentId(appointmentId || null);
                    navigate(`/doctor/patients/${patientId}/examination`);
                  }}
                />
              }
            />
            <Route
              path="/doctor/patients"
              element={
                <MyPatients
                  onNavigateToPatient={(id) => {
                    setSelectedPatientId(id);
                    navigate(`/doctor/patients/${id}/examination`);
                  }}
                  onNavigateToAppointments={() => navigate('/doctor/appointments')}
                />
              }
            />
            <Route
              path="/doctor/patients/:patientId/examination"
              element={<PatientExaminationRoute />}
            />
            <Route
              path="/doctor/create-prescription"
              element={
                <PrescriptionManagement
                  onBack={() => navigate('/doctor')}
                />
              }
            />
            <Route
              path="/doctor/treatment-plans"
              element={
                <TreatmentPlans
                  onNavigateToPlan={(id) => {
                    setSelectedTreatmentPlanId(id);
                    navigate(`/doctor/treatment-plans/${id}`);
                  }}
                />
              }
            />
            <Route
              path="/doctor/treatment-plans/:planId"
              element={<TreatmentPlanDetailRoute />}
            />
            <Route path="/doctor/performance" element={<PersonalPerformance />} />
            <Route path="/doctor/account" element={<AccountSettings />} />

            {/* fallback trong DoctorApp */}
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
