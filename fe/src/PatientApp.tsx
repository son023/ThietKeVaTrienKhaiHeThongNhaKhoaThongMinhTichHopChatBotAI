import { useState, useEffect } from "react";
import {
  Routes,
  Route,
  useNavigate,
  useLocation,
  Navigate,
} from "react-router-dom";
import { NewPatientHeader } from "./components/public/NewPatientHeader";
import { PatientFooter } from "./components/patient/PatientFooter";
import { PatientHome } from "./components/patient/PatientHome";
import { PatientDashboard } from "./components/patient/PatientDashboard";
import { PatientAppointments } from "./components/patient/PatientAppointments";
import { PatientMedicalRecords } from "./components/patient/PatientMedicalRecords";
import { PatientPayment } from "./components/patient/PatientPayment";
import { PatientProfile } from "./components/patient/PatientProfile";
// import { PatientChatbot } from './components/patient/PatientChatbot';

interface PatientAppProps {
  onLogout: () => void;
  onGoHome: () => void;
}

export default function PatientApp({ onLogout, onGoHome }: PatientAppProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentPage, setCurrentPage] = useState("home");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  useEffect(() => {
    if (location.pathname.startsWith("/patient/dashboard")) {
      setCurrentPage("dashboard");
    } else if (location.pathname.startsWith("/patient/appointments")) {
      setCurrentPage("appointments");
    } else if (location.pathname.startsWith("/patient/payment")) {
      setCurrentPage("payment");
    } else if (location.pathname.startsWith("/patient/medical-records")) {
      setCurrentPage("medical-records");
    } else if (location.pathname.startsWith("/patient/profile")) {
      setCurrentPage("profile");
    } else {
      setCurrentPage("home");
    }
  }, [location.pathname]);

  const handleNavigate = (page: string) => {
    switch (page) {
      case "home":
        navigate("/patient");
        break;
      case "dashboard":
        navigate("/patient/dashboard");
        break;
      case "appointments":
        navigate("/patient/appointments");
        break;
      case "payment":
        navigate("/patient/payment");
        break;
      case "medical-records":
        navigate("/patient/medical-records");
        break;
      case "profile":
        navigate("/patient/profile");
        break;
      default:
        navigate("/patient");
        break;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#fcfeff]">
      {/* Fixed DoctorHeader */}
      <NewPatientHeader
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onLogout={onLogout}
      />

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Routes>
          <Route
            path="/patient"
            element={<PatientHome onNavigate={handleNavigate} />}
          />
          <Route
            path="/patient/dashboard"
            element={<PatientDashboard onNavigate={handleNavigate} />}
          />
          <Route
            path="/patient/appointments"
            element={<PatientAppointments />}
          />
          <Route path="/patient/payment" element={<PatientPayment />} />
          <Route
            path="/patient/medical-records"
            element={<PatientMedicalRecords />}
          />
          <Route path="/patient/profile" element={<PatientProfile />} />
          {/* fallback trong PatientApp */}
          <Route path="*" element={<Navigate to="/patient" replace />} />
        </Routes>
      </main>

      {/* Footer */}
      <PatientFooter />

      {/* Chatbot */}
      {/*<PatientChatbot */}
      {/*  isOpen={isChatbotOpen}*/}
      {/*  onClose={() => setIsChatbotOpen(false)}*/}
      {/*/>*/}
    </div>
  );
}
