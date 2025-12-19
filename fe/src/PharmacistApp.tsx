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

  // ✅ chỉ để highlight sidebar
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [pharmacistId, setPharmacistId] = useState<string>();

  /* ===== lấy user ===== */
  useEffect(() => {
    const user = authController.getCurrentUser();
    if (user) setPharmacistId(user.id);
  }, []);

  /* ===== URL → sidebar ===== */
  useEffect(() => {
    const path = location.pathname;

    if (path.startsWith('/pharmacist/prescriptions')) {
      setCurrentPage('prescriptions');
    } else if (path.startsWith('/pharmacist/inventory')) {
      setCurrentPage('inventory');
    } else if (path.startsWith('/pharmacist/import-export')) {
      setCurrentPage('import-export');
    } else if (path.startsWith('/pharmacist/reports')) {
      setCurrentPage('reports');
    } else if (path.startsWith('/pharmacist/account')) {
      setCurrentPage('account');
    } else {
      setCurrentPage('dashboard');
    }
  }, [location.pathname]);

  /* ===== API CŨ: component con gọi ===== */
  const handleNavigate = (page: string, id?: string) => {
    switch (page) {
      case 'prescriptions':
        navigate('/pharmacist/prescriptions');
        break;
      case 'inventory':
        navigate('/pharmacist/inventory');
        break;
      case 'prescription-detail':
        if (id) navigate(`/pharmacist/prescriptions/${id}`);
        break;
      case 'drug-profile':
        if (id) navigate(`/pharmacist/inventory/${id}`);
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
    }
  };

  /* ===== Sidebar ===== */
  const handleSidebarChange = (page: string) => {
    handleNavigate(page);
  };

  return (
      <NotificationProvider userId={pharmacistId}>
        <div className="flex h-screen">
          <PharmacistSidebar
              currentPage={currentPage}
              onPageChange={handleSidebarChange}
          />
          <div className="flex-1 flex flex-col overflow-hidden">
            <PharmacistHeader onLogout={onLogout} onGoHome={onGoHome} />
            <main className="flex-1 overflow-y-auto">
              <Routes>
                <Route
                    path="/pharmacist"
                    element={<PharmacistDashboard onNavigate={handleNavigate} />}
                />

                <Route
                    path="/pharmacist/prescriptions"
                    element={
                      <PrescriptionQueue
                          onViewDetail={(id) =>
                              handleNavigate('prescription-detail', id)
                          }
                      />
                    }
                />

                <Route
                    path="/pharmacist/prescriptions/:id"
                    element={<PrescriptionDetailWrapper />}
                />

                <Route
                    path="/pharmacist/inventory"
                    element={
                      <DrugInventory
                          onViewDrugProfile={(id) =>
                              handleNavigate('drug-profile', id)
                          }
                      />
                    }
                />

                <Route
                    path="/pharmacist/inventory/:id"
                    element={<DrugProfileWrapper />}
                />

                <Route
                    path="/pharmacist/import-export"
                    element={<ImportExportManagement />}
                />

                <Route
                    path="/pharmacist/reports"
                    element={<PharmacyReports />}
                />

                <Route
                    path="/pharmacist/account"
                    element={<AccountSettings />}
                />

                <Route path="*" element={<Navigate to="/pharmacist" replace />} />
              </Routes>
            </main>
          </div>
        </div>
      </NotificationProvider>
  );
}

/* ===== Wrapper giữ component cũ ===== */

function PrescriptionDetailWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return <Navigate to="/pharmacist/prescriptions" replace />;

  return (
      <PrescriptionDetail
          prescriptionId={id}
          onBack={() => navigate('/pharmacist/prescriptions')}
      />
  );
}

function DrugProfileWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) return <Navigate to="/pharmacist/inventory" replace />;

  return (
      <DrugProfile
          drugId={id}
          onBack={() => navigate('/pharmacist/inventory')}
      />
  );
}
