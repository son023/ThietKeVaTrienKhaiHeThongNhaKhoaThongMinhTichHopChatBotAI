import { useState } from 'react';
import AdminApp from './AdminApp';

// Doctor Dashboard
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/pages/Dashboard';
import { MyAppointments } from './components/pages/MyAppointments';
import { MyPatients } from './components/pages/MyPatients';
import { PatientDetail } from './components/pages/PatientDetail';
import { TreatmentPlans } from './components/pages/TreatmentPlans';
import { TreatmentPlanDetail } from './components/pages/TreatmentPlanDetail';
import { PersonalPerformance } from './components/pages/PersonalPerformance';
import { AccountSettings } from './components/pages/AccountSettings';

function DoctorApp() {
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
      <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#fcfeff]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [userRole, setUserRole] = useState<'doctor' | 'admin'>('admin');

  if (userRole === 'admin') {
    return <AdminApp />;
  }

  return <DoctorApp />;
}
