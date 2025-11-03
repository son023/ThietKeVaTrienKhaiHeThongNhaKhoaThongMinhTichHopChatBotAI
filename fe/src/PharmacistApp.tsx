import { useState } from 'react';
import { PharmacistHeader } from './components/PharmacistHeader';
import { PharmacistSidebar } from './components/PharmacistSidebar';
import { PharmacistDashboard } from './components/pharmacist/PharmacistDashboard';
import { PrescriptionQueue } from './components/pharmacist/PrescriptionQueue';
import { DrugInventory } from './components/pharmacist/DrugInventory';
import { PrescriptionDetail } from './components/pharmacist/PrescriptionDetail';
import { DrugProfile } from './components/pharmacist/DrugProfile';
import { PharmacyReports } from './components/pharmacist/PharmacyReports';
import { ImportExportManagement } from './components/pharmacist/ImportExportManagement';
import { AccountSettings } from './components/pages/AccountSettings';

interface PharmacistAppProps {
  onLogout: () => void;
  onGoHome?: () => void;
}

export default function PharmacistApp({ onLogout, onGoHome }: PharmacistAppProps) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState<string | null>(null);
  const [selectedDrugId, setSelectedDrugId] = useState<string | null>(null);

  const handleNavigate = (page: string, id?: string) => {
    if (page === 'prescription-detail' && id) {
      setSelectedPrescriptionId(id);
      setCurrentPage('prescription-detail');
    } else if (page === 'drug-profile' && id) {
      setSelectedDrugId(id);
      setCurrentPage('drug-profile');
    } else {
      setCurrentPage(page);
      setSelectedPrescriptionId(null);
      setSelectedDrugId(null);
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PharmacistDashboard onNavigate={handleNavigate} />;
      case 'prescriptions':
        return (
          <PrescriptionQueue
            onViewDetail={(id) => handleNavigate('prescription-detail', id)}
          />
        );
      case 'inventory':
        return (
          <DrugInventory
            onViewDrugProfile={(id) => handleNavigate('drug-profile', id)}
          />
        );
      case 'prescription-detail':
        return selectedPrescriptionId ? (
          <PrescriptionDetail
            prescriptionId={selectedPrescriptionId}
            onBack={() => setCurrentPage('prescriptions')}
          />
        ) : (
          <PharmacistDashboard onNavigate={handleNavigate} />
        );
      case 'drug-profile':
        return selectedDrugId ? (
          <DrugProfile
            drugId={selectedDrugId}
            onBack={() => setCurrentPage('inventory')}
          />
        ) : (
          <DrugInventory
            onViewDrugProfile={(id) => handleNavigate('drug-profile', id)}
          />
        );
      case 'import-export':
        return <ImportExportManagement />;
      case 'reports':
        return <PharmacyReports />;
      case 'account':
        return <AccountSettings />;
      default:
        return <PharmacistDashboard onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <PharmacistHeader onLogout={onLogout} onGoHome={onGoHome} />
      <PharmacistSidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="ml-[260px] mt-[80px]">
        {renderPage()}
      </div>
    </div>
  );
}
