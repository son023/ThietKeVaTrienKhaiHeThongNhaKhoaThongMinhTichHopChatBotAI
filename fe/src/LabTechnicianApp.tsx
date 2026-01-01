import { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { LabTechnicianSidebar } from "./components/LabTechnicianSidebar";
import { LabTechnicianHeader } from "./components/LabTechnicianHeader";
import { LabTechnicianDashboard } from "./components/labtechnician/LabTechnicianDashboard";
import { TestQueue } from "./components/labtechnician/TestQueue";
import { TestResults } from "./components/labtechnician/TestResults";
import { Equipment } from "./components/labtechnician/Equipment";
import { LabReports } from "./components/labtechnician/LabReports";
import { LabAccountSettings } from "./components/labtechnician/LabAccountSettings";
import { NotificationProvider } from "./contexts/NotificationContext";
import { authController } from "./controllers/AuthController";

interface LabTechnicianAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function LabTechnicianApp({
  onLogout,
  onGoHome,
}: LabTechnicianAppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [labTechnicianId, setLabTechnicianId] = useState<string>();

  useEffect(() => {
    const user = authController.getCurrentUser();
    if (user) setLabTechnicianId(user.id);
  }, []);

  useEffect(() => {
    if (location.pathname.startsWith("/lab/test-queue")) {
      setCurrentPage("test-queue");
    } else if (location.pathname.startsWith("/lab/test-results")) {
      setCurrentPage("test-results");
    } else if (location.pathname.startsWith("/lab/equipment")) {
      setCurrentPage("equipment");
    } else if (location.pathname.startsWith("/lab/reports")) {
      setCurrentPage("reports");
    } else if (location.pathname.startsWith("/lab/settings")) {
      setCurrentPage("settings");
    } else {
      setCurrentPage("dashboard");
    }
  }, [location.pathname]);

  const handleSidebarNavigate = (page: string) => {
    switch (page) {
      case "dashboard":
        // hỗ trợ cả /lab và /lab/dashboard, điều hướng về /lab
        navigate("/lab");
        break;
      case "test-queue":
        navigate("/lab/test-queue");
        break;
      case "test-results":
        navigate("/lab/test-results");
        break;
      case "equipment":
        navigate("/lab/equipment");
        break;
      case "reports":
        navigate("/lab/reports");
        break;
      case "settings":
        navigate("/lab/settings");
        break;
      default:
        navigate("/lab");
        break;
    }
  };

  return (
    <NotificationProvider userId={labTechnicianId}>
      <div className="flex h-screen bg-neutral-background">
        <LabTechnicianSidebar
          currentPage={currentPage}
          onNavigate={handleSidebarNavigate}
        />
        <div className="flex-1 flex flex-col overflow-hidden">
          <LabTechnicianHeader onLogout={onLogout} onGoHome={onGoHome} />
        <main className="flex-1 overflow-y-auto bg-neutral-background">
          <Routes>
            <Route
              path="/lab"
              element={
                <LabTechnicianDashboard
                  onNavigateToTest={(id) => {
                    setSelectedTestId(id);
                    navigate("/lab/test-queue");
                  }}
                />
              }
            />
            <Route
              path="/lab/dashboard"
              element={
                <LabTechnicianDashboard
                  onNavigateToTest={(id) => {
                    setSelectedTestId(id);
                    navigate("/lab/test-queue");
                  }}
                />
              }
            />
            <Route
              path="/lab/test-queue"
              element={<TestQueue selectedTestId={selectedTestId} />}
            />
            <Route path="/lab/test-results" element={<TestResults />} />
            <Route path="/lab/equipment" element={<Equipment />} />
            <Route path="/lab/reports" element={<LabReports />} />
            <Route path="/lab/settings" element={<LabAccountSettings />} />

            <Route path="*" element={<Navigate to="/lab" replace />} />
          </Routes>
        </main>
      </div>
    </div>
    </NotificationProvider>
  );
}
