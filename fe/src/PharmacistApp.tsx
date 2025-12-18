import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
import { PharmacistHeader } from './components/PharmacistHeader';
import { PharmacistSidebar } from './components/PharmacistSidebar';
import { PharmacistDashboard } from './components/pharmacist/PharmacistDashboard';
import { PrescriptionQueue } from './components/pharmacist/PrescriptionQueue';
import { DrugInventory } from './components/pharmacist/DrugInventory';
import { PrescriptionDetail } from './components/pharmacist/PrescriptionDetail';
import { DrugProfile } from './components/pharmacist/DrugProfile';
import { PharmacyReports } from './components/pharmacist/PharmacyReports';
import { ImportExportManagement } from './components/pharmacist/ImportExportManagement';
import { AccountSettings } from './components/doctor/AccountSettings';
import { NotificationProvider } from './contexts/NotificationContext';
import { authController } from './controllers/AuthController';

interface PharmacistAppProps {
  onLogout: () => void;
  onGoHome?: () => void;
}

export default function PharmacistApp({ onLogout, onGoHome }: PharmacistAppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pharmacistId, setPharmacistId] = useState<string | undefined>(undefined);

  // ✅ Lấy pharmacistId từ currentUser
  useEffect(() => {
    const currentUser = authController.getCurrentUser();
    if (currentUser) {
      setPharmacistId(currentUser.id);
    }
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith('/pharmacist/prescriptions')) {
      if (location.pathname.startsWith('/pharmacist/prescriptions/')) {
        setCurrentPage('prescription-detail');
      } else {
        setCurrentPage('prescriptions');
      }
    } else if (location.pathname.startsWith('/pharmacist/inventory')) {
      if (location.pathname.startsWith('/pharmacist/inventory/')) {
        setCurrentPage('drug-profile');
      } else {
        setCurrentPage('inventory');
      }
    } else if (location.pathname.startsWith('/pharmacist/import-export')) {
      setCurrentPage('import-export');
    } else if (location.pathname.startsWith('/pharmacist/reports')) {
      setCurrentPage('reports');
    } else if (location.pathname.startsWith('/pharmacist/account')) {
      setCurrentPage('account');
    } else {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  const handleSidebarChange = (page: string) => {
    switch (page) {
      case 'dashboard':
        navigate('/pharmacist');
        break;
      case 'prescriptions':
        navigate('/pharmacist/prescriptions');
        break;
      case 'inventory':
        navigate('/pharmacist/inventory');
        break;
      case 'import-export':
        navigate('/pharmacist/import-export');
        break;
      case 'reports':
        navigate('/pharmacist/reports');
        break;
      case 'account':
        navigate('/pharmacist/account');
        break;
      default:
        navigate('/pharmacist');
        break;
    }
  };

  const handleDashboardNavigate = (page: string, id?: string) => {
    if (page === 'prescriptions') {
      navigate('/pharmacist/prescriptions');
    } else if (page === 'inventory') {
      navigate('/pharmacist/inventory');
    } else if (page === 'prescription-detail' && id) {
      navigate(`/pharmacist/prescriptions/${id}`);
    } else if (page === 'drug-profile' && id) {
      navigate(`/pharmacist/inventory/${id}`);
    } else {
      navigate('/pharmacist');
    }
  };

  function PrescriptionDetailRouteWrapper() {
    const { id } = useParams<{ id: string }>();
    if (!id) return <Navigate to="/pharmacist/prescriptions" replace />;
    return (
      <PrescriptionDetail
        prescriptionId={id}
        onBack={() => navigate('/pharmacist/prescriptions')}
      />
    );
  }

  function DrugProfileRouteWrapper() {
    const { id } = useParams<{ id: string }>();
    if (!id) return <Navigate to="/pharmacist/inventory" replace />;
    return (
      <DrugProfile
        drugId={id}
        onBack={() => navigate('/pharmacist/inventory')}
      />
    );
  }

  return (
    <NotificationProvider userId={pharmacistId}>
      <div className="min-h-screen bg-[#f8f9fa]">
        <PharmacistHeader onLogout={onLogout} onGoHome={onGoHome} />
        <PharmacistSidebar currentPage={currentPage} onPageChange={handleSidebarChange} />
        <div className="ml-[260px] mt-[80px]">
          <Routes>
            <Route
              path="/pharmacist"
              element={<PharmacistDashboard onNavigate={handleDashboardNavigate} />}
            />
            <Route
              path="/pharmacist/prescriptions"
              element={
                <PrescriptionQueue
                  onViewDetail={(id) =>
                    navigate(`/pharmacist/prescriptions/${id}`)
                  }
                />
              }
            />
            <Route
              path="/pharmacist/prescriptions/:id"
              element={<PrescriptionDetailRouteWrapper />}
            />
            <Route
              path="/pharmacist/inventory"
              element={
                <DrugInventory
                  onViewDrugProfile={(id) =>
                    navigate(`/pharmacist/inventory/${id}`)
                  }
                />
              }
            />
            <Route
              path="/pharmacist/inventory/:id"
              element={<DrugProfileRouteWrapper />}
            />
            <Route path="/pharmacist/import-export" element={<ImportExportManagement />} />
            <Route path="/pharmacist/reports" element={<PharmacyReports />} />
            <Route path="/pharmacist/account" element={<AccountSettings />} />
            <Route path="*" element={<Navigate to="/pharmacist" replace />} />
          </Routes>
        </div>
      </div>
    </NotificationProvider>
  );
}