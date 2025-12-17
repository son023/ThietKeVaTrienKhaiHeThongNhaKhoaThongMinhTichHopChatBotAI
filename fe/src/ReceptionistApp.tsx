import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
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
    navigate('/receptionist/new-appointment');
  };

  const handleNewPatient = () => {
    setShowNewPatient(true);
    setCurrentPage('new-patient');
    navigate('/receptionist/new-patient');
  };

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentPage('patient-detail');
    navigate(`/receptionist/patients/${patientId}`);
  };

  const handleCreateInvoice = () => {
    setShowInvoice(true);
    setSelectedInvoiceId(null);
    setCurrentPage('invoices');
    navigate('/receptionist/invoices/new');
  };

  const handleViewInvoice = (invoiceId: string, mode: 'view' | 'payment' = 'view') => {
    setSelectedInvoiceId(invoiceId);
    setInvoiceViewMode(mode);
    setShowInvoice(true);
    setCurrentPage('invoices');
    navigate(`/receptionist/invoices/${invoiceId}`);
  };

  const handleBackToPatients = () => {
    setSelectedPatientId(null);
    setCurrentPage('patients');
    navigate('/receptionist/patients');
  };

  const handleBackToDashboard = () => {
    setShowNewAppointment(false);
    setShowNewPatient(false);
    setShowInvoice(false);
    setCurrentPage('dashboard');
    navigate('/receptionist');
  };

  const handleBackToInvoiceList = () => {
    setShowInvoice(false);
    setSelectedInvoiceId(null);
    setCurrentPage('invoices');
    navigate('/receptionist/invoices');
  };

  // Đồng bộ currentPage với URL để sidebar highlight
  useEffect(() => {
    if (location.pathname.startsWith('/receptionist/appointments')) {
      setCurrentPage('appointments');
    } else if (location.pathname.startsWith('/receptionist/patients')) {
      setCurrentPage('patients');
    } else if (location.pathname.startsWith('/receptionist/invoices')) {
      setCurrentPage('invoices');
    } else if (location.pathname.startsWith('/receptionist/reports')) {
      setCurrentPage('reports');
    } else if (location.pathname.startsWith('/receptionist/account')) {
      setCurrentPage('account');
    } else {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  const handleSidebarChange = (page: string) => {
    switch (page) {
      case 'dashboard':
        navigate('/receptionist');
        break;
      case 'appointments':
        navigate('/receptionist/appointments');
        break;
      case 'patients':
        navigate('/receptionist/patients');
        break;
      case 'invoices':
        navigate('/receptionist/invoices');
        break;
      case 'reports':
        navigate('/receptionist/reports');
        break;
      case 'account':
        navigate('/receptionist/account');
        break;
      default:
        navigate('/receptionist');
        break;
    }
  };

  function ReceptionistPatientDetailRoute() {
    const params = useParams<{ patientId: string }>();
    const patientId = params.patientId || selectedPatientId;
    if (!patientId) {
      return <Navigate to="/receptionist/patients" replace />;
    }
    if (patientId !== selectedPatientId) {
      setSelectedPatientId(patientId);
    }
    return (
      <ReceptionistPatientDetail
        patientId={patientId}
        onBack={handleBackToPatients}
        onNewAppointment={handleNewAppointment}
        onCreateInvoice={handleCreateInvoice}
      />
    );
  }

  function ReceptionistInvoiceRoute() {
    const params = useParams<{ invoiceId: string }>();
    const invoiceId = params.invoiceId || selectedInvoiceId || undefined;
    if (!invoiceId) {
      return <Navigate to="/receptionist/invoices" replace />;
    }
    if (invoiceId !== selectedInvoiceId) {
      setSelectedInvoiceId(invoiceId);
    }
    return (
      <ReceptionistInvoice
        invoiceId={invoiceId}
        onBack={handleBackToInvoiceList}
        mode={invoiceViewMode}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <ReceptionistHeader
        onLogout={onLogout}
        onGoHome={onGoHome}
        onNewAppointment={handleNewAppointment}
        onNewPatient={handleNewPatient}
        onSearch={handleSearch}
      />
      <ReceptionistSidebar currentPage={currentPage} onPageChange={handleSidebarChange} />
      <div className="ml-[260px] mt-[80px]">
        <Routes>
          <Route
            path="/receptionist"
            element={<ReceptionistDashboard onCreateInvoice={handleCreateInvoice} />}
          />
          <Route
            path="/receptionist/appointments"
            element={<ReceptionistAppointments />}
          />
          <Route
            path="/receptionist/patients"
            element={
              <ReceptionistPatients
                onPatientSelect={handlePatientSelect}
              />
            }
          />
          <Route
            path="/receptionist/patients/:patientId"
            element={<ReceptionistPatientDetailRoute />}
          />
          <Route
            path="/receptionist/new-appointment"
            element={
              showNewAppointment ? (
                <ReceptionistNewAppointment
                  onBack={handleBackToDashboard}
                  onComplete={() => {
                    handleBackToDashboard();
                  }}
                />
              ) : (
                <Navigate to="/receptionist" replace />
              )
            }
          />
          <Route
            path="/receptionist/invoices"
            element={
              <ReceptionistInvoiceList
                onViewInvoice={handleViewInvoice}
                onCreateInvoice={handleCreateInvoice}
              />
            }
          />
          <Route
            path="/receptionist/invoices/new"
            element={
              showInvoice ? (
                <ReceptionistInvoice
                  invoiceId={selectedInvoiceId || undefined}
                  onBack={handleBackToInvoiceList}
                  mode={invoiceViewMode}
                />
              ) : (
                <Navigate to="/receptionist/invoices" replace />
              )
            }
          />
          <Route
            path="/receptionist/invoices/:invoiceId"
            element={
              showInvoice ? (
                <ReceptionistInvoiceRoute />
              ) : (
                <Navigate to="/receptionist/invoices" replace />
              )
            }
          />
          <Route
            path="/receptionist/reports"
            element={<ReceptionistReports />}
          />
          <Route
            path="/receptionist/account"
            element={<ReceptionistAccountSettings />}
          />
          <Route path="*" element={<Navigate to="/receptionist" replace />} />
        </Routes>
      </div>
    </div>
  );
}
