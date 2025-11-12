import { useState } from 'react';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicHomepage } from './components/public/PublicHomepage';
import { ServicesList } from './components/public/ServicesList';
import { ServiceDetail } from './components/public/ServiceDetail';
import { DoctorsList } from './components/public/DoctorsList';
import { DoctorDetail } from './components/public/DoctorDetail';
import { BookingPage } from './components/public/BookingPage';
import { LoginPage } from './components/public/LoginPage';
import { SignUpPage } from './components/public/SignUpPage';
import {toast, Toaster} from 'sonner';
import DoctorApp from "./DoctorApp";
import PatientApp from "./PatientApp";
import {ReceptionistApp} from "./ReceptionistApp";
import PharmacistApp from "./PharmacistApp";
import AdminApp from "./AdminApp";

type Page = 'home' | 'services' | 'service-detail' | 'doctors' | 'doctor-detail' | 'about' | 'contact' | 'login' | 'signup' | 'booking';

interface PublicAppProps {
    //onLogin: (email: string, role: 'doctor' | 'admin' | 'pharmacist' | 'receptionist' | 'patient') => void;
    onLogin?: (email: string, role: 'doctor' | 'admin' | 'pharmacist' | 'receptionist' | 'patient') => void;
}

function PublicApp({ onLogin }: PublicAppProps) {
    const [currentPage, setCurrentPage] = useState<Page>('home');
    const [selectedServiceId, setSelectedServiceId] = useState<string>('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string>('');
    const [preselectedService, setPreselectedService] = useState<string>('');
    const [preselectedDoctor, setPreselectedDoctor] = useState<string>('');

    const handleNavigate = (page: string) => {
        setCurrentPage(page as Page);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleServiceSelect = (serviceId: string) => {
        console.log('PublicApp handleServiceSelect called with:', serviceId);
        setSelectedServiceId(serviceId);
        setCurrentPage('service-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDoctorSelect = (doctorId: string) => {
        setSelectedDoctorId(doctorId);
        setCurrentPage('doctor-detail');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToServices = () => {
        setCurrentPage('services');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToDoctors = () => {
        setCurrentPage('doctors');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBookingClick = (serviceId?: string, doctorId?: string) => {
        setPreselectedService(serviceId || '');
        setPreselectedDoctor(doctorId || '');
        setCurrentPage('booking');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLoginClick = () => {
        setCurrentPage('login');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSignUpClick = () => {
        setCurrentPage('signup');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleLogin = (email: string, password: string) => {
        // Determine role based on email
        let role: 'doctor' | 'admin' | 'pharmacist' | 'receptionist' | 'patient' = 'patient';

        if (email === 'admin@gmail.com') {
            role = 'admin';
        } else if (email === 'pharmacist@gmail.com') {
            role = 'pharmacist';
        } else if (email === 'receptionist@gmail.com') {
            role = 'receptionist';
        } else if (email === 'doctor@gmail.com') {
            role = 'doctor';
        } else {
            // Default to patient for all other emails
            role = 'patient';
        }

        // Show success message
        toast.success('Đăng nhập thành công!');

        // Call parent login handler if provided
        if (onLogin) {
             onLogin("mail@gmail.com", 'doctor');
        }
    };

    const handleBackToHome = () => {
        setCurrentPage('home');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const renderContent = () => {
        switch (currentPage) {
            case 'login':
                return (
                    <LoginPage
                        onBack={handleBackToHome}
                        onNavigateToSignup={handleSignUpClick}
                        onLogin={handleLogin}
                    />
                );

            case 'signup':
                return (
                    <SignUpPage
                        onBack={handleBackToHome}
                        onNavigateToLogin={handleLoginClick}
                    />
                );

            case 'booking':
                return (
                    <BookingPage
                        onBack={handleBackToHome}
                        preselectedService={preselectedService}
                        preselectedDoctor={preselectedDoctor}
                    />
                );

            case 'home':
                return (
                    <PublicHomepage
                        onNavigate={handleNavigate}
                        onLoginClick={handleLoginClick}
                        onBookingClick={() => handleBookingClick()}
                        onServiceSelect={handleServiceSelect}
                    />
                );

            case 'services':
                return (
                    <ServicesList
                        onServiceSelect={handleServiceSelect}
                        onBooking={(serviceId) => handleBookingClick(serviceId)}
                    />
                );

            case 'service-detail':
                return (
                    <ServiceDetail
                        serviceId={selectedServiceId}
                        onBack={handleBackToServices}
                        onBooking={(serviceId) => handleBookingClick(serviceId)}
                        onServiceSelect={handleServiceSelect}
                    />
                );

            case 'doctors':
                return (
                    <DoctorsList
                        onDoctorSelect={handleDoctorSelect}
                        onBooking={(doctorId) => handleBookingClick(undefined, doctorId)}
                    />
                );

            case 'doctor-detail':
                return (
                    <DoctorDetail
                        doctorId={selectedDoctorId}
                        onBack={handleBackToDoctors}
                        onBooking={(doctorId) => handleBookingClick(undefined, doctorId)}
                    />
                );

            case 'about':
                return (
                    <div className="min-h-screen bg-[#fcfeff] pt-[104px] px-[80px] py-[80px]">
                        <div className="container mx-auto">
                            <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] mb-[40px]">
                                Về chúng tôi
                            </h1>
                            <div className="space-y-[24px] max-w-[800px]">
                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] leading-[1.8]">
                                    DentalCareX là phòng khám nha khoa uy tín hàng đầu tại Việt Nam với hơn 15 năm kinh nghiệm trong lĩnh vực chăm sóc và điều trị răng miệng.
                                </p>
                                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] leading-[1.8]">
                                    Chúng tôi cam kết mang đến cho khách hàng những dịch vụ nha khoa chất lượng cao nhất với công nghệ hiện đại, đội ngũ bác sĩ giàu kinh nghiệm và quy trình chăm sóc chuyên nghiệp.
                                </p>
                            </div>
                        </div>
                    </div>
                );

            case 'contact':
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
                                            Phường Tân Mai, Quận Hoàng Mai<br />
                                            Hà Nội
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[16px]">
                                            Liên hệ
                                        </h3>
                                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[1.6]">
                                            Điện thoại: (123) 456-7890<br />
                                            Email: info@dentalcarex.com
                                        </p>
                                    </div>
                                    <div>
                                        <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[16px]">
                                            Giờ làm việc
                                        </h3>
                                        <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[1.6]">
                                            9h00 - 21h00<br />
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

            default:
                return null;
        }
    };

    // Don't show header/footer on login, signup, and booking pages
    const showHeaderFooter = !['login', 'signup', 'booking'].includes(currentPage);

    return (
        <div className="min-h-screen bg-[#fcfeff]">
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
    const [userRole, setUserRole] = useState<'doctor' | 'admin' | 'pharmacist' | 'receptionist' | 'patient' | null>(null);
    const [userEmail, setUserEmail] = useState<string>('');

    const handleLogin = (email: string, role: 'doctor' | 'admin' | 'pharmacist' | 'receptionist' | 'patient') => {
        setUserEmail(email);
        setUserRole(role);
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail('');
    };

    const handleGoHome = () => {
        setIsAuthenticated(false);
        setUserRole(null);
        setUserEmail('');
    };

    if (userRole === 'admin') {
        return (
            <>
                <AdminApp onLogout={handleLogout} onGoHome={handleGoHome} />
                <Toaster position="top-center" />
            </>
        );
    }

    if (userRole === 'pharmacist') {
        return (
            <>
                <PharmacistApp onLogout={handleLogout} onGoHome={handleGoHome} />
                <Toaster position="top-center" />
            </>
        );
    }

    if (userRole === 'receptionist') {
        return (
            <>
                <ReceptionistApp onLogout={handleLogout} onGoHome={handleGoHome} />
                <Toaster position="top-center" />
            </>
        );
    }

    if (userRole === 'patient') {
        return (
            <>
                <PatientApp onLogout={handleLogout} onGoHome={handleGoHome} />
                <Toaster position="top-center" />
            </>
        );
    }

    if (userRole === 'doctor') {
        return (
            <>
                <DoctorApp onLogout={handleLogout} onGoHome={handleGoHome}/>
                <Toaster position="top-center"/>
            </>
        );
    }

    return (
        <>
            {/*<PublicApp onLogin={handleLogin} />*/}
            <PatientApp onLogout={handleLogout} onGoHome={handleGoHome} />
            <Toaster position="top-center" />
        </>
    );
}
