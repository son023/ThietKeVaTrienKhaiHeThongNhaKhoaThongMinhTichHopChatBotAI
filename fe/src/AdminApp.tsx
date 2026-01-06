import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminAppointments } from './components/admin/AdminAppointments';
import { AdminStaff } from './components/admin/AdminStaff';
import { AdminStaffDetail } from './components/admin/AdminStaffDetail';
import { AdminPatients } from './components/admin/AdminPatients';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminFinance } from './components/admin/AdminFinance';
import { AdminReports } from './components/admin/AdminReports';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminServices } from './components/admin/AdminServices';
import { AdminPatientDetail } from './components/admin/AdminPatientDetail';

interface AdminAppProps {
  onLogout?: () => void;
  onGoHome?: () => void;
}

export default function AdminApp({ onLogout, onGoHome }: AdminAppProps = {}) {
  const navigate = useNavigate();
  const location = useLocation();

  // Extract current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/') {
      return 'patients';
    }
    return path.replace('/admin/', '');
  };

  const currentPage = getCurrentPage();

  // Redirect to patients if on admin root
  useEffect(() => {
    if (location.pathname === '/admin' || location.pathname === '/admin/') {
      navigate('/admin/patients', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleNavigate = (page: string) => {
    navigate(`/admin/${page}`);
  };

  const handleNavigateToStaffDetail = (id: string) => {
    navigate(`/admin/staff/${id}`);
  };

  const handleNavigateToPatientDetail = (id: string) => {
    navigate(`/admin/patients/${id}`);
  };

  const handleBackToStaff = () => {
    navigate('/admin/staff');
  };

  const handleBackToPatients = () => {
    navigate('/admin/patients');
  };

  const renderPage = () => {
    const pathParts = location.pathname.split('/').filter(Boolean);
    
    // Handle detail pages
    if (pathParts.length === 3 && pathParts[0] === 'admin') {
      if (pathParts[1] === 'staff') {
        return <AdminStaffDetail 
          staffId={pathParts[2]}
          onBack={handleBackToStaff}
        />;
      }
      if (pathParts[1] === 'patients') {
        return <AdminPatientDetail 
          patientId={pathParts[2]}
          onBack={handleBackToPatients}
        />;
      }
    }

    // Handle main pages
    switch (currentPage) {
      case 'appointments':
        return <AdminAppointments />;
      case 'patients':
        return <AdminPatients onNavigateToPatientDetail={handleNavigateToPatientDetail} />;
      case 'staff':
        return <AdminStaff onNavigateToStaffDetail={handleNavigateToStaffDetail} />;
      case 'services':
        return <AdminServices />;
      case 'inventory':
        return <AdminInventory />;
      case 'finance':
        return <AdminFinance />;
      case 'reports':
        return <AdminReports />;
      case 'settings':
        return <AdminSettings />;
      default:
        return <AdminPatients onNavigateToPatientDetail={handleNavigateToPatientDetail} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfeff]">
      <AdminSidebar currentPage={currentPage} onNavigate={handleNavigate} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onLogout={onLogout} onGoHome={onGoHome} />
        <main className="flex-1 overflow-y-auto bg-[#fcfeff]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
