import { useState } from 'react';
import { ReceptionistHeader } from './components/ReceptionistHeader';
import { ReceptionistSidebar } from './components/ReceptionistSidebar';
import { ReceptionistDashboard } from './components/receptionist/ReceptionistDashboard';
import { ReceptionistAppointments } from './components/receptionist/ReceptionistAppointments';
import { ReceptionistPatients } from './components/receptionist/ReceptionistPatients';
import { ReceptionistPatientDetail } from './components/receptionist/ReceptionistPatientDetail';
import { ReceptionistNewAppointment } from './components/receptionist/ReceptionistNewAppointment';
import { ReceptionistReports } from './components/receptionist/ReceptionistReports';
import { ReceptionistInvoice } from './components/receptionist/ReceptionistInvoice';
import { ReceptionistInvoiceList } from './components/receptionist/ReceptionistInvoiceList';
import { ReceptionistAccountSettings } from './components/receptionist/ReceptionistAccountSettings';

interface ReceptionistAppProps {
  onLogout: () => void;
  onGoHome?: () => void;
}

export function ReceptionistApp({ onLogout, onGoHome }: ReceptionistAppProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [showNewAppointment, setShowNewAppointment] = useState(false);
  const [showNewPatient, setShowNewPatient] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [invoiceViewMode, setInvoiceViewMode] = useState<'view' | 'payment'>('view');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
    console.log('Searching for:', query);
  };

  const handleNewAppointment = () => {
    setShowNewAppointment(true);
    setCurrentPage('new-appointment');
  };

  const handleNewPatient = () => {
    setShowNewPatient(true);
    setCurrentPage('new-patient');
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentPage('patient-detail');
  };

  const handleCreateInvoice = () => {
    setShowInvoice(true);
    setSelectedInvoiceId(null);
    setCurrentPage('invoice');
  };

  const handleViewInvoice = (invoiceId: string, mode: 'view' | 'payment' = 'view') => {
    setSelectedInvoiceId(invoiceId);
    setInvoiceViewMode(mode);
    setShowInvoice(true);
    setCurrentPage('invoice');
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setCurrentPage('patients');
  };

  const handleBackToDashboard = () => {
    setShowNewAppointment(false);
    setShowNewPatient(false);
    setShowInvoice(false);
    setCurrentPage('dashboard');
  };

  const handleBackToInvoiceList = () => {
    setShowInvoice(false);
    setSelectedInvoiceId(null);
    setCurrentPage('invoices');
  };

  const renderPage = () => {
    // New Appointment Form
    if (showNewAppointment) {
      return (
        <ReceptionistNewAppointment
          onBack={handleBackToDashboard}
          onComplete={() => {
            handleBackToDashboard();
            // Show success message
          }}
        />
      );
    }

    // Invoice Page
    if (showInvoice) {
      return (
        <ReceptionistInvoice
          invoiceId={selectedInvoiceId || undefined}
          onBack={handleBackToInvoiceList}
          mode={invoiceViewMode}
        />
      );
    }

    // Patient Detail
    if (currentPage === 'patient-detail' && selectedPatientId) {
      return (
        <ReceptionistPatientDetail
          patientId={selectedPatientId}
          onBack={handleBackToPatients}
          onNewAppointment={handleNewAppointment}
          onCreateInvoice={handleCreateInvoice}
        />
      );
    }

    // Main Pages
    switch (currentPage) {
      case 'dashboard':
        return <ReceptionistDashboard onCreateInvoice={handleCreateInvoice} />;
      case 'appointments':
        return <ReceptionistAppointments />;
      case 'patients':
        return <ReceptionistPatients onPatientSelect={handlePatientSelect} />;
      case 'invoices':
        return (
          <ReceptionistInvoiceList
            onViewInvoice={handleViewInvoice}
            onCreateInvoice={handleCreateInvoice}
          />
        );
      case 'reports':
        return <ReceptionistReports />;
      case 'account':
        return <ReceptionistAccountSettings />;
      default:
        return <ReceptionistDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ReceptionistHeader
        onLogout={onLogout}
        onGoHome={onGoHome}
        onNewAppointment={handleNewAppointment}
        onNewPatient={handleNewPatient}
        onSearch={handleSearch}
      />
      <ReceptionistSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-[260px] mt-[80px]">
        {renderPage()}
      </div>
    </div>
  );
}
