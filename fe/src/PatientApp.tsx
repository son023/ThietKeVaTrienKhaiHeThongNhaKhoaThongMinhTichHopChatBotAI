import { useState } from 'react';
import { NewPatientHeader } from './components/patient/NewPatientHeader';
import { PatientFooter } from './components/patient/PatientFooter';
import { PatientHome } from './components/patient/PatientHome';
import { PatientDashboard } from './components/patient/PatientDashboard';
import { PatientAppointments } from './components/patient/PatientAppointments';
import { PatientMedicalRecords } from './components/patient/PatientMedicalRecords';
import { PatientPayment } from './components/patient/PatientPayment';
import { PatientProfile } from './components/patient/PatientProfile';
import { PatientChatbot } from './components/patient/PatientChatbot';

interface PatientAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function PatientApp({ onLogout, onGoHome }: PatientAppProps) {
  const [currentPage, setCurrentPage] = useState('home');
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <PatientHome onNavigate={setCurrentPage} />;
      case 'dashboard':
        return <PatientDashboard onNavigate={setCurrentPage} />;
      case 'appointments':
        return <PatientAppointments />;
      case 'payment':
        return <PatientPayment />;
      case 'medical-records':
        return <PatientMedicalRecords />;
      case 'profile':
        return <PatientProfile />;
      default:
        return <PatientHome onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfeff]">
      {/* Fixed Header */}
      <NewPatientHeader 
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />
      
      {/* Main Content */}
      <main className="flex-1 w-full">
        {renderPage()}
      </main>

      {/* Footer */}
      <PatientFooter />

      {/* Chatbot */}
      <PatientChatbot 
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
      />
    </div>
  );
}
