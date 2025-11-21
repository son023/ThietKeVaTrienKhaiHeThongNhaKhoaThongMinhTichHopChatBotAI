import { useState } from "react";
import { LabTechnicianSidebar } from "./components/LabTechnicianSidebar";
import { LabTechnicianHeader } from "./components/LabTechnicianHeader";
import { LabTechnicianDashboard } from "./components/labtechnician/LabTechnicianDashboard";
import { TestQueue } from "./components/labtechnician/TestQueue";
import { TestResults } from "./components/labtechnician/TestResults";
import { Equipment } from "./components/labtechnician/Equipment";
import { LabReports } from "./components/labtechnician/LabReports";
import { LabAccountSettings } from "./components/labtechnician/LabAccountSettings";

interface LabTechnicianAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function LabTechnicianApp({
  onLogout,
  onGoHome,
}: LabTechnicianAppProps) {
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <LabTechnicianDashboard
            onNavigateToTest={(id) => {
              setSelectedTestId(id);
              setCurrentPage("test-queue");
            }}
          />
        );
      case "test-queue":
        return <TestQueue selectedTestId={selectedTestId} />;
      case "test-results":
        return <TestResults />;
      case "equipment":
        return <Equipment />;
      case "reports":
        return <LabReports />;
      case "settings":
        return <LabAccountSettings />;
      default:
        return (
          <LabTechnicianDashboard
            onNavigateToTest={(id) => {
              setSelectedTestId(id);
              setCurrentPage("test-queue");
            }}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <LabTechnicianSidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <LabTechnicianHeader onLogout={onLogout} onGoHome={onGoHome} />
        <main className="flex-1 overflow-y-auto bg-background">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
