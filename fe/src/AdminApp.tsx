import { useState } from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { AdminHeader } from './components/AdminHeader';
import { AdminDashboard } from './components/admin/AdminDashboard';
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
  const [currentPage, setCurrentPage] = useState('admin-dashboard');
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case 'admin-dashboard':
        return <AdminDashboard />;
      case 'admin-appointments':
        return <AdminAppointments />;
      case 'admin-patients':
        return <AdminPatients onNavigateToPatientDetail={(id) => {
          setSelectedPatientId(id);
          setCurrentPage('admin-patient-detail');
        }} />;
      case 'admin-patient-detail':
        return <AdminPatientDetail 
          patientId={selectedPatientId}
          onBack={() => setCurrentPage('admin-patients')}
        />;
      case 'admin-staff':
        return <AdminStaff onNavigateToStaffDetail={(id) => {
          setSelectedStaffId(id);
          setCurrentPage('admin-staff-detail');
        }} />;
      case 'admin-staff-detail':
        return <AdminStaffDetail 
          staffId={selectedStaffId}
          onBack={() => setCurrentPage('admin-staff')}
        />;
      case 'admin-services':
        return <AdminServices />;
      case 'admin-inventory':
        return <AdminInventory />;
      case 'admin-finance':
        return <AdminFinance />;
      case 'admin-reports':
        return <AdminReports />;
      case 'admin-settings':
        return <AdminSettings />;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-[#fcfeff]">
      <AdminSidebar currentPage={currentPage} onNavigate={setCurrentPage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader onLogout={onLogout} onGoHome={onGoHome} />
        <main className="flex-1 overflow-y-auto bg-[#fcfeff]">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
