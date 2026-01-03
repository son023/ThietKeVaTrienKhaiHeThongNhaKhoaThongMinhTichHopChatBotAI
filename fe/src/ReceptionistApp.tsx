import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate, useParams } from 'react-router-dom';
import { Search as SearchIcon } from 'lucide-react';
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './components/ui/dialog';
import { Input } from './components/ui/input';
import { Button } from './components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';
import { BookAppointmentDialog } from './components/patient/BookAppointmentDialog';
import { patientController } from './controllers/PatientController';
import { userController } from './controllers/UserController';
import { invoiceController } from './controllers/InvoiceController';
import { PatientWithUser } from './models/Patient';
import { NotificationProvider } from './contexts/NotificationContext';
import { authController } from './controllers';

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
  // Dialog đặt lịch mới dùng chung cho toàn bộ app receptionist
  const [patientSearchOpen, setPatientSearchOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [patients, setPatients] = useState<PatientWithUser[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [patientsError, setPatientsError] = useState<string | null>(null);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<PatientWithUser | null>(null);
  const [appointmentRefreshToken, setAppointmentRefreshToken] = useState(0);
  const [receptionistId, setReceptionistId] = useState<string>();

  useEffect(() => {
    const user = authController.getCurrentUser();
    if (user) setReceptionistId(user.id);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Implement search logic
    console.log('Searching for:', query);
  };

  const handleNewAppointment = () => {
    setPatientSearchOpen(true);
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

  const handleCreateInvoice = async (appointmentId?: string) => {
    try {
      if (appointmentId) {
        const invoices = await invoiceController.getInvoicesByAppointmentId(appointmentId);
        if (invoices && invoices.length > 0) {
          const invoice = invoices[0];
          handleViewInvoice(invoice.id, 'payment');
          return;
        }
      }

      setShowInvoice(true);
      setSelectedInvoiceId(null);
      setCurrentPage('invoices');
      if (appointmentId) {
        navigate(`/receptionist/invoices/new?appointmentId=${appointmentId}`);
      } else {
        navigate('/receptionist/invoices/new');
      }
    } catch (error) {
      console.error('Error finding invoice:', error);
      setShowInvoice(true);
      setSelectedInvoiceId(null);
      setCurrentPage('invoices');
      navigate('/receptionist/invoices/new');
    }
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

  // Tải danh sách bệnh nhân khi mở dialog tìm kiếm
  useEffect(() => {
    if (!patientSearchOpen) return;
    const loadPatients = async () => {
      try {
        setLoadingPatients(true);
        setPatientsError(null);
        const patientList = await patientController.getAll();
        const userMap = await userController.getByIds(
          patientList.map((p) => p.userId)
        );
        const withUser: PatientWithUser[] = patientList.map((p) => ({
          ...p,
          user: userMap[p.userId],
        }));
        setPatients(withUser);
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : 'Không thể tải danh sách bệnh nhân';
        setPatientsError(msg);
      } finally {
        setLoadingPatients(false);
      }
    };
    loadPatients();
  }, [patientSearchOpen]);

  const filteredPatients = useMemo(() => {
    const q = patientSearchQuery.toLowerCase();
    return patients.filter((p) => {
      const name = p.user?.fullName?.toLowerCase() || '';
      const phone = p.contactPhone || p.user?.phone || '';
      const code = p.userId.toLowerCase();
      return (
        name.includes(q) ||
        phone.includes(patientSearchQuery) ||
        code.includes(q)
      );
    });
  }, [patients, patientSearchQuery]);

  const handleSelectPatientForBooking = (patient: PatientWithUser) => {
    setSelectedPatient(patient);
    setPatientSearchOpen(false);
    setBookingDialogOpen(true);
  };

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
        mode="payment"
      />
    );
  }

  return (
    <NotificationProvider userId={receptionistId}>
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
            element={
              <ReceptionistDashboard
                onCreateInvoice={handleCreateInvoice}
                refreshToken={appointmentRefreshToken}
              />
            }
          />
          <Route
            path="/receptionist/appointments"
            element={<ReceptionistAppointments refreshToken={appointmentRefreshToken} />}
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

        <Dialog open={patientSearchOpen} onOpenChange={setPatientSearchOpen}>
          <DialogContent className="w-[90vw] max-w-none bg-white">
            <DialogHeader>
              <DialogTitle>Chọn bệnh nhân để đặt lịch hẹn</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Tìm theo tên, số điện thoại hoặc mã bệnh nhân..."
                  className="pl-10"
                  value={patientSearchQuery}
                  onChange={(e) => setPatientSearchQuery(e.target.value)}
                />
              </div>
              <div className="border rounded-md max-h-[400px] overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Họ tên</TableHead>
                      <TableHead>Số điện thoại</TableHead>
                      <TableHead>Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingPatients ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          Đang tải danh sách bệnh nhân...
                        </TableCell>
                      </TableRow>
                    ) : patientsError ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-red-600">
                          {patientsError}
                        </TableCell>
                      </TableRow>
                    ) : filteredPatients.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                          Không tìm thấy bệnh nhân phù hợp
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPatients.map((p) => (
                        <TableRow
                          key={p.userId}
                          className="cursor-pointer hover:bg-gray-50"
                        >
                          <TableCell>{p.user?.fullName || 'Chưa cập nhật'}</TableCell>
                          <TableCell>
                            {p.contactPhone || p.user?.phone || '-'}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              onClick={() => handleSelectPatientForBooking(p)}
                            >
                              Chọn
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <BookAppointmentDialog
          isOpen={bookingDialogOpen}
          onClose={() => setBookingDialogOpen(false)}
          onSuccess={() => {
            setBookingDialogOpen(false);
            setSelectedPatient(null);
            setAppointmentRefreshToken((prev) => prev + 1);
          }}
          patientId={selectedPatient?.userId}
          patientName={selectedPatient?.user?.fullName}
          patientPhone={selectedPatient?.contactPhone || selectedPatient?.user?.phone}
          patientEmail={selectedPatient?.user?.email}
        />
      </div>
      </div>
    </NotificationProvider>
  );
}
