import { useState } from 'react';
import AdminApp from './AdminApp';
import PharmacistApp from './PharmacistApp';
import { ReceptionistApp } from './ReceptionistApp';
import { Homepage } from './components/Homepage';
import { LoginPage } from './components/LoginPage';
import { SignUpPage } from './components/SignUpPage';
import { DoctorInfoPage } from './components/DoctorInfoPage';
import { Toaster } from './components/ui/sonner';

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

interface DoctorAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

function DoctorApp({ onLogout, onGoHome }: DoctorAppProps) {
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
        <Header onLogout={onLogout} onGoHome={onGoHome} />
        <main className="flex-1 overflow-y-auto bg-[#fcfeff]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<'doctor' | 'admin' | 'pharmacist' | 'receptionist' | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showSignUp, setShowSignUp] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showDoctorInfo, setShowDoctorInfo] = useState(false);

  const handleLogin = (email: string, role: 'doctor' | 'admin' | 'pharmacist' | 'receptionist') => {
    setUserEmail(email);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setShowSignUp(false);
    setShowLogin(false);
  };

  const handleGoHome = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    setUserEmail('');
    setShowSignUp(false);
    setShowLogin(false);
    setShowDoctorInfo(false);
  };

  if (!isAuthenticated) {
    // Show Doctor Info Page
    if (showDoctorInfo) {
      return (
        <>
          <DoctorInfoPage
            onNavigateToHome={() => {
              setShowDoctorInfo(false);
              setShowLogin(false);
              setShowSignUp(false);
            }}
            onNavigateToLogin={() => {
              setShowDoctorInfo(false);
              setShowLogin(true);
            }}
            onNavigateToSignUp={() => {
              setShowDoctorInfo(false);
              setShowSignUp(true);
            }}
          />
          <Toaster position="top-center" />
        </>
      );
    }

    // Show Sign Up Page
    if (showSignUp) {
      return (
        <>
          <SignUpPage 
            onBackToLogin={() => {
              setShowSignUp(false);
              setShowLogin(true);
            }}
            onNavigateToHome={() => {
              setShowSignUp(false);
              setShowLogin(false);
            }}
          />
          <Toaster position="top-center" />
        </>
      );
    }
    
    // Show Login Page
    if (showLogin) {
      return (
        <>
          <LoginPage 
            onLogin={handleLogin} 
            onNavigateToSignUp={() => {
              setShowLogin(false);
              setShowSignUp(true);
            }}
            onNavigateToHome={() => {
              setShowLogin(false);
            }}
          />
          <Toaster position="top-center" />
        </>
      );
    }
    
    // Show Homepage (Landing Page)
    return (
      <>
        <Homepage 
          onNavigateToLogin={() => setShowLogin(true)}
          onNavigateToSignUp={() => setShowSignUp(true)}
          onNavigateToDoctorInfo={() => setShowDoctorInfo(true)}
        />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === 'admin') {
    return (
      <>
        <AdminApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === 'pharmacist') {
    return (
      <>
        <PharmacistApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === 'receptionist') {
    return (
      <>
        <ReceptionistApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <DoctorApp onLogout={handleLogout} onGoHome={handleGoHome} />
      <Toaster position="top-center" />
    </>
  );
}
