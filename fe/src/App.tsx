import { useState, useEffect } from "react";
import { PublicHeader } from "./components/public/PublicHeader";
import { PublicFooter } from "./components/public/PublicFooter";
import { PublicHomepage } from "./components/public/PublicHomepage";
import { ServicesList } from "./components/public/ServicesList";
import { ServiceDetail } from "./components/public/ServiceDetail";
import { DoctorsListRemote } from "./components/public/DoctorsListRemote";
import { DoctorDetailRemote } from "./components/public/DoctorDetailRemote";
import { BookingPage } from "./components/public/BookingPage";
import { LoginPage } from "./components/public/LoginPage";
import { SignUpPage } from "./components/public/SignUpPage";
import { toast, Toaster } from "sonner";
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";
import { ReceptionistApp } from "./ReceptionistApp";
import PharmacistApp from "./PharmacistApp";
import AdminApp from "./AdminApp";
import LabTechnicianApp from "./LabTechnicianApp";
import { authController } from "./controllers";
import { UserRole } from "./models";
import { PaymentResultPage } from "./components/public/PaymentResultPage";

type Page =
  | "home"
  | "services"
  | "service-detail"
  | "doctors"
  | "doctor-detail"
  | "about"
  | "contact"
  | "login"
  | "signup"
  | "booking"
  | "payment-result";

interface PublicAppProps {
  onLogin?: (
    phone: string,
    role:
      | "doctor"
      | "admin"
      | "pharmacist"
      | "receptionist"
      | "patient"
      | "lab-technician"
  ) => void;
}

function PublicApp({ onLogin }: PublicAppProps) {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [selectedServiceId, setSelectedServiceId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [preselectedService, setPreselectedService] = useState<string>("");
  const [preselectedDoctor, setPreselectedDoctor] = useState<string>("");
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleServiceSelect = (serviceId: string) => {
    console.log("PublicApp handleServiceSelect called with:", serviceId);
    setSelectedServiceId(serviceId);
    setCurrentPage("service-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDoctorSelect = (doctorId: string) => {
    setSelectedDoctorId(doctorId);
    setCurrentPage("doctor-detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToServices = () => {
    setCurrentPage("services");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBackToDoctors = () => {
    setCurrentPage("doctors");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleBookingClick = (serviceId?: string, doctorId?: string) => {
    const currentUser = authController.getCurrentUser();
    if (!currentUser) {
      setPreselectedService(serviceId || "");
      setPreselectedDoctor(doctorId || "");
      setShowLoginPrompt(true);
      return;
    }

    setPreselectedService(serviceId || "");
    setPreselectedDoctor(doctorId || "");
    setCurrentPage("booking");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLoginClick = () => {
    setCurrentPage("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSignUpClick = () => {
    setCurrentPage("signup");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleConfirmLoginPrompt = () => {
    setShowLoginPrompt(false);
    setCurrentPage("login");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCloseLoginPrompt = () => {
    setShowLoginPrompt(false);
  };

  const handleLoginSuccess = (userRole: string) => {
    // Map UserRole enum to app role type
    let role:
      | "doctor"
      | "admin"
      | "pharmacist"
      | "receptionist"
      | "patient"
      | "lab-technician" = "patient";

    switch (userRole) {
      case "ADMIN":
        role = "admin";
        break;
      case "DOCTOR":
        role = "doctor";
        break;
      case "PHARMACIST":
        role = "pharmacist";
        break;
      case "RECEPTIONIST":
        role = "receptionist";
        break;
      case "LAB_TECHNICIAN":
        role = "lab-technician";
        break;
      case "PATIENT":
      default:
        role = "patient";
        break;
    }

    // Call parent login handler if provided
    if (onLogin) {
      // Get user from localStorage to get phone
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
      onLogin(currentUser.phone, role);
    }
  };

  const handleBackToHome = () => {
    setCurrentPage("home");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderContent = () => {
    switch (currentPage) {
      case "login":
        return (
          <LoginPage
            onBack={handleBackToHome}
            onNavigateToSignup={handleSignUpClick}
            onLoginSuccess={handleLoginSuccess}
          />
        );

      case "signup":
        return (
          <SignUpPage
            onBack={handleBackToHome}
            onNavigateToLogin={handleLoginClick}
          />
        );

      case "booking":
        return (
          <BookingPage
            onBack={handleBackToHome}
            preselectedService={preselectedService}
            preselectedDoctor={preselectedDoctor}
          />
        );

      case "home":
        return (
          <PublicHomepage
            onNavigate={handleNavigate}
            onLoginClick={handleLoginClick}
            onBookingClick={() => handleBookingClick()}
            onServiceSelect={handleServiceSelect}
          />
        );

      case "services":
        return (
          <ServicesList
            onServiceSelect={handleServiceSelect}
            onBooking={(serviceId) => handleBookingClick(serviceId)}
          />
        );

      case "service-detail":
        return (
          <ServiceDetail
            serviceId={selectedServiceId}
            onBack={handleBackToServices}
            onBooking={(serviceId) => handleBookingClick(serviceId)}
            onServiceSelect={handleServiceSelect}
          />
        );

      case "doctors":
        return (
          <DoctorsListRemote
            onDoctorSelect={handleDoctorSelect}
            onBooking={(doctorId) => handleBookingClick(undefined, doctorId)}
          />
        );

      case "doctor-detail":
        return (
          <DoctorDetailRemote
            doctorId={selectedDoctorId}
            onBack={handleBackToDoctors}
            onBooking={(doctorId) => handleBookingClick(undefined, doctorId)}
          />
        );

      case "about":
        return (
          <div className="min-h-screen bg-[#fcfeff] pt-[104px] px-[80px] py-[80px]">
            <div className="container mx-auto">
              <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] mb-[40px]">
                Về chúng tôi
              </h1>
              <div className="space-y-[24px] max-w-[800px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] leading-[1.8]">
                  DentalCareX là phòng khám nha khoa uy tín hàng đầu tại Việt
                  Nam với hơn 15 năm kinh nghiệm trong lĩnh vực chăm sóc và điều
                  trị răng miệng.
                </p>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] leading-[1.8]">
                  Chúng tôi cam kết mang đến cho khách hàng những dịch vụ nha
                  khoa chất lượng cao nhất với công nghệ hiện đại, đội ngũ bác
                  sĩ giàu kinh nghiệm và quy trình chăm sóc chuyên nghiệp.
                </p>
              </div>
            </div>
          </div>
        );

      case "contact":
        return (
          <div className="min-h-screen bg-[#fcfeff] pt-[104px] px-[80px] py-[80px]">
            <div className="container mx-auto">
              <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] mb-[40px]">
                Liên hệ
              </h1>
              <div className="grid grid-cols-2 gap-[60px]">
                <div className="space-y-[32px]">
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[16px]">
                      Địa chỉ
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[1.6]">
                      Tầng 2, TTTM Mandarin Garden 2<br />
                      Phường Tân Mai, Quận Hoàng Mai
                      <br />
                      Hà Nội
                    </p>
                  </div>
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[16px]">
                      Liên hệ
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[1.6]">
                      Điện thoại: (123) 456-7890
                      <br />
                      Email: info@dentalcarex.com
                    </p>
                  </div>
                  <div>
                    <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[16px]">
                      Giờ làm việc
                    </h3>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[1.6]">
                      9h00 - 21h00
                      <br />
                      Tất cả các ngày trong tuần
                    </p>
                  </div>
                </div>
                <div className="bg-[#ebf6fc] rounded-[20px] p-[40px]">
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[24px]">
                    Gửi tin nhắn
                  </h3>
                  <form className="space-y-[16px]">
                    <input
                      type="text"
                      placeholder="Họ và tên"
                      className="w-full h-[48px] rounded-[12px] border border-[#d6edfa] px-[16px] font-['Fz_Poppins:Regular',sans-serif] text-[15px]"
                    />
                    <input
                      type="tel"
                      placeholder="Số điện thoại"
                      className="w-full h-[48px] rounded-[12px] border border-[#d6edfa] px-[16px] font-['Fz_Poppins:Regular',sans-serif] text-[15px]"
                    />
                    <textarea
                      placeholder="Tin nhắn"
                      rows={5}
                      className="w-full rounded-[12px] border border-[#d6edfa] px-[16px] py-[12px] font-['Fz_Poppins:Regular',sans-serif] text-[15px]"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#3fb5ff] text-[#fcfeff] py-[14px] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#3fb5ff]/90 transition-all"
                    >
                      Gửi tin nhắn
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        );

      case "payment-result":
        return (
          <PaymentResultPage
            onNavigate={handleNavigate}
          />
        );

      default:
        return null;
    }
  };

  // Don't show header/footer on login, signup, and booking pages
  const showHeaderFooter = !["login", "signup", "booking"].includes(
    currentPage
  );

  return (
    <div className="min-h-screen bg-[#fcfeff]">
      {showLoginPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-lg font-semibold text-[#01304e]">
              Bạn cần đăng nhập để đặt lịch
            </h3>
            <p className="text-sm text-gray-600">
              Vui lòng đăng nhập trước khi tiếp tục đặt lịch khám.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCloseLoginPrompt}
                className="px-4 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
              >
                Để sau
              </button>
              <button
                onClick={handleConfirmLoginPrompt}
                className="px-4 py-2 rounded-lg bg-[#3fb5ff] text-white hover:bg-[#35a4e6]"
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}

      {showHeaderFooter && (
        <PublicHeader
          onNavigate={handleNavigate}
          onLoginClick={handleLoginClick}
          onBookingClick={() => handleBookingClick()}
        />
      )}

      {renderContent()}

      {showHeaderFooter && <PublicFooter />}
    </div>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<
    "doctor" | "admin" | "pharmacist" | "receptionist" | "patient" | "lab-technician" | null
  >(null);
  const [userPhone, setUserPhone] = useState<string>("");

  useEffect(() => {
    const currentUser = authController.getCurrentUser();
    if (currentUser) {
      let role:
        | "doctor"
        | "admin"
        | "pharmacist"
        | "receptionist"
        | "patient"
        | "lab-technician" = "patient";

      switch (currentUser.primaryRole) {
        case "ADMIN":
          role = "admin";
          break;
        case "DOCTOR":
          role = "doctor";
          break;
        case "PHARMACIST":
          role = "pharmacist";
          break;
        case "RECEPTIONIST":
          role = "receptionist";
          break;
        case "LAB_TECHNICIAN":
          role = "lab-technician";
          break;
        case "PATIENT":
        default:
          role = "patient";
          break;
      }

      setUserPhone(currentUser.phone);
      setUserRole(role);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (
    phone: string,
    role: "doctor" | "admin" | "pharmacist" | "receptionist" | "patient" | "lab-technician"
  ) => {
    setUserPhone(phone);
    setUserRole(role);
    setIsAuthenticated(true);
  };

  const handleLogout = async () => {
    try {
      await authController.logout();
      setIsAuthenticated(false);
      setUserRole(null);
      setUserPhone("");
      toast.success("Đăng xuất thành công!");
    } catch (error) {
      toast.error("Có lỗi khi đăng xuất");
    }
  };

  const handleGoHome = async () => {
    try {
      await authController.logout();
      setIsAuthenticated(false);
      setUserRole(null);
      setUserPhone("");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (userRole === "admin") {
    return (
      <>
        <AdminApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === "pharmacist") {
    return (
      <>
        <PharmacistApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === "receptionist") {
    return (
      <>
        <ReceptionistApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === "patient") {
    return (
      <>
        <PatientApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === "doctor") {
    return (
      <>
        <DoctorApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (userRole === "lab-technician") {
    return (
      <>
        <LabTechnicianApp onLogout={handleLogout} onGoHome={handleGoHome} />
        <Toaster position="top-center" />
      </>
    );
  }

  return (
    <>
      <PublicApp onLogin={handleLogin} />
      {/* <PharmacistApp onLogout={handleLogout} onGoHome={handleGoHome} /> */}
      <Toaster position="top-center" />
    </>
  );
}
