import { useState } from 'react';
import AdminApp from './AdminApp';
import PharmacistApp from './PharmacistApp';
import { ReceptionistApp } from './ReceptionistApp';
import PatientApp from './PatientApp';
import PublicApp from './App';
import { Toaster } from './components/ui/sonner';

// Doctor Dashboard
import { DoctorSidebar } from './components/DoctorSidebar';
import { DoctorHeader } from './components/DoctorHeader';
import { Dashboard } from './components/doctor/Dashboard';
import { MyAppointments } from './components/doctor/MyAppointments';
import { MyPatients } from './components/doctor/MyPatients';
import { PatientDetail } from './components/doctor/PatientDetail';
import { TreatmentPlans } from './components/doctor/TreatmentPlans';
import { TreatmentPlanDetail } from './components/doctor/TreatmentPlanDetail';
import { PersonalPerformance } from './components/doctor/PersonalPerformance';
import { AccountSettings } from './components/doctor/AccountSettings';

interface DoctorAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function DoctorApp({ onLogout, onGoHome }: DoctorAppProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [selectedTreatmentPlanId, setSelectedTreatmentPlanId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigateToPatient={(id) => {
          setSelectedPatientId(id);
          setCurrentPage('patient-detail');
        }} />;
      case 'appointments':
        return <MyAppointments onNavigateToPatient={(id) => {
          setSelectedPatientId(id);
          setCurrentPage('patient-detail');
        }} />;
      case 'patients':
        return <MyPatients onNavigateToPatient={(id) => {
          setSelectedPatientId(id);
          setCurrentPage('patient-detail');
        }} />;
      case 'patient-detail':
        return <PatientDetail 
          patientId={selectedPatientId} 
          onBack={() => setCurrentPage('patients')}
          onNavigateToTreatmentPlan={(planId) => {
            setSelectedTreatmentPlanId(planId);
            setCurrentPage('treatment-plan-detail');
          }}
        />;
      case 'treatment-plans':
        return <TreatmentPlans onNavigateToPlan={(id) => {
          setSelectedTreatmentPlanId(id);
          setCurrentPage('treatment-plan-detail');
        }} />;
      case 'treatment-plan-detail':
        return <TreatmentPlanDetail 
          planId={selectedTreatmentPlanId}
          onBack={() => setCurrentPage('treatment-plans')}
        />;
      case 'performance':
        return <PersonalPerformance />;
      case 'account':
        return <AccountSettings />;
      default:
        return <Dashboard onNavigateToPatient={(id) => {
          setSelectedPatientId(id);
          setCurrentPage('patient-detail');
        }} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfeff]">
      <DoctorSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DoctorHeader onLogout={onLogout} onGoHome={onGoHome} />
        <main className="flex-1 overflow-y-auto bg-[#fcfeff]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
