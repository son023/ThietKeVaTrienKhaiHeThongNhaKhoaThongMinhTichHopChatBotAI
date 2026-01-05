import { useState, useEffect } from "react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Sparkles,
  Shield,
  Clock,
  Phone,
  MapPin,
  Mail,
  ChevronLeft,
  ChevronRight,
  Star,
  CheckCircle2,
  Award,
  Users,
  Calendar,
  Heart,
  Activity,
  Stethoscope,
  Crown,
  Smile,
  LogOut,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import UnderContentSimple from "../public/UnderContentSimple";
import imgThumbnail1 from "../../assets/Thumbnail1.png";
import imgDoctor11 from "../../assets/imgDoctor1.png";
import imgDoctor31 from "../../assets/imgDoctor2.png";
import imgDoctor61 from "../../assets/imgDoctor3.png";
import img1 from "../../assets/Thumbnail1.png";
import img4 from "../../assets/Thumbnail1.png";
import { img } from "../../imports/svg-mvrzb";
import imgPortraitHappyManShowingThumbUpOnPinkBackgr20231127051221Utc4 from "../../assets/imgPatient1.png";
import imgWomanSmileToCamera20231127053322Utc1 from "../../assets/imgPatient2.png";
import imgCloseupPortraitOfHappyArabicGuySmilingAtCa20231127051731Utc1 from "../../assets/imgPatient3.png";
import imgHandsomeArabGuyChillingAtHomeSmilingAtCam20231127044927Utc1 from "../../assets/imgPatient4.png";
import { BookAppointmentDialog } from "./BookAppointmentDialog";
import { authController } from "../../controllers/AuthController";

interface PatientHomeProps {
  onNavigate: (page: string) => void;
  onOpenChatbot: () => void;
}

// Services data
const servicesData = [
  {
    id: "1",
    icon: img1,
    title: "Tẩy trắng răng",
    description:
      "Công nghệ tẩy trắng răng hiện đại, an toàn với Laser Whitening và Bleaching chuyên nghiệp.",
    price: "Từ 2.500.000đ",
    features: ["Không đau", "Hiệu quả cao", "Lâu dài"],
  },
  {
    id: "2",
    icon: img4,
    title: "Niềng răng Invisalign",
    description:
      "Niềng răng trong suốt không mắc cài, thoải mái và thẩm mỹ cao, có thể tháo lắp dễ dàng.",
    price: "Từ 85.000.000đ",
    features: ["Trong suốt", "Tháo lắp được", "Không đau"],
  },
  {
    id: "3",
    icon: img,
    title: "Cấy ghép Implant",
    description:
      "Trồng răng Implant công nghệ Mỹ, phục hồi chức năng ăn nhai tự nhiên, tuổi thọ trên 20 năm.",
    price: "Từ 25.000.000đ",
    features: ["Bền vững", "Tự nhiên", "Lâu dài"],
  },
  {
    id: "4",
    icon: img1,
    title: "Bọc răng sứ thẩm mỹ",
    description:
      "Răng sứ Veneer siêu mỏng, tự nhiên, đẹp như răng thật, độ bền cao lên đến 15-20 năm.",
    price: "Từ 5.500.000đ",
    features: ["Thẩm mỹ cao", "Bền đẹp", "Tự nhiên"],
  },
  {
    id: "5",
    icon: img4,
    title: "Vệ sinh răng miệng",
    description:
      "Lấy cao răng, đánh bóng răng, vệ sinh răng miệng chuyên sâu với công nghệ siêu âm hiện đại.",
    price: "Từ 350.000đ",
    features: ["Sạch sâu", "Không đau", "An toàn"],
  },
  {
    id: "6",
    icon: img,
    title: "Nhổ răng khôn",
    description:
      "Nhổ răng khôn an toàn, không đau với công nghệ Piezosurgery, hồi phục nhanh chóng.",
    price: "Từ 1.500.000đ",
    features: ["Không đau", "An toàn", "Nhanh chóng"],
  },
];

// Doctors data
const doctorsData = [
  {
    id: "1",
    image: imgDoctor11,
    name: "BS. Nguyễn Văn A",
    specialty: "Chuyên khoa Chỉnh nha",
    experience: "15 năm kinh nghiệm",
    rating: 4.9,
    reviews: 250,
  },
  {
    id: "2",
    image: imgDoctor31,
    name: "BS. Trần Thị B",
    specialty: "Chuyên khoa Răng sứ thẩm mỹ",
    experience: "12 năm kinh nghiệm",
    rating: 4.8,
    reviews: 180,
  },
  {
    id: "3",
    image: imgDoctor61,
    name: "BS. Lê Văn C",
    specialty: "Chuyên khoa Implant",
    experience: "10 năm kinh nghiệm",
    rating: 4.9,
    reviews: 200,
  },
];

// Testimonials data
const testimonialsData = [
  {
    id: 1,
    image: imgPortraitHappyManShowingThumbUpOnPinkBackgr20231127051221Utc4,
    name: "Nguyễn Văn A",
    rating: 5,
    text: "Dịch vụ tuyệt vời! Tôi rất hài lòng với kết quả niềng răng tại đây. Bác sĩ rất tận tâm và chuyên nghiệp.",
  },
  {
    id: 2,
    image: imgWomanSmileToCamera20231127053322Utc1,
    name: "Trần Thị B",
    rating: 5,
    text: "Phòng khám hiện đại, sạch sẽ. Quy trình làm việc chuyên nghiệp. Tôi đã làm răng sứ và rất hài lòng.",
  },
  {
    id: 3,
    image: imgCloseupPortraitOfHappyArabicGuySmilingAtCa20231127051731Utc1,
    name: "Lê Văn C",
    rating: 5,
    text: "Bác sĩ tư vấn rất kỹ càng, giá cả hợp lý. Sau khi cấy implant, tôi ăn uống rất tốt.",
  },
  {
    id: 4,
    image: imgHandsomeArabGuyChillingAtHomeSmilingAtCam20231127044927Utc1,
    name: "Phạm Văn D",
    rating: 5,
    text: "Đội ngũ y bác sĩ chuyên nghiệp, thân thiện. Tôi rất tin tưởng và sẽ quay lại.",
  },
];

const faqData = [
  {
    question: "Phòng khám có giờ làm việc như thế nào?",
    answer:
      "Chúng tôi làm việc từ 9h00 đến 21h00, tất cả các ngày trong tuần bao gồm cả Lễ và Tết.",
  },
  {
    question: "Tôi có cần đặt lịch trước không?",
    answer:
      "Chúng tôi khuyến khích bạn đặt lịch trước để đảm bảo được phục vụ đúng giờ. Tuy nhiên, chúng tôi cũng nhận khách không cần hẹn trước.",
  },
  {
    question: "Chi phí điều trị có đắt không?",
    answer:
      "Chúng tôi có bảng giá minh bạch và cạnh tranh. Mỗi ca điều trị sẽ được tư vấn chi tiết về chi phí trước khi thực hiện.",
  },
  {
    question: "Phòng khám có chấp nhận bảo hiểm y tế không?",
    answer:
      "Có, chúng tôi chấp nhận đa số các loại bảo hiểm y tế. Vui lòng liên hệ để biết thêm chi tiết.",
  },
];

export function PatientHome({ onNavigate, onOpenChatbot }: PatientHomeProps) {
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [selectedDoctor, setSelectedDoctor] = useState(doctorsData[1]); // Default to second doctor
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ id: string; fullName: string; phone: string; email?: string } | null>(null);

  const nextService = () => {
    setCurrentServiceIndex((prev) => (prev + 1) % servicesData.length);
  };

  const prevService = () => {
    setCurrentServiceIndex(
      (prev) => (prev - 1 + servicesData.length) % servicesData.length
    );
  };

  const nextTestimonial = () => {
    setCurrentTestimonialIndex((prev) => (prev + 1) % testimonialsData.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonialIndex(
      (prev) => (prev - 1 + testimonialsData.length) % testimonialsData.length
    );
  };

  const visibleServices = [
    servicesData[currentServiceIndex],
    servicesData[(currentServiceIndex + 1) % servicesData.length],
    servicesData[(currentServiceIndex + 2) % servicesData.length],
  ];

  useEffect(() => {
    const user = authController.getCurrentUser();
    if (user) {
      setCurrentUser({
        id: user.id,
        fullName: user.fullName || '',
        phone: user.phone || '',
        email: user.email,
      });
    }
  }, []);

  const handleBookingSuccess = () => {
    onNavigate("appointments");
  };

  const handleLogout = async () => {
    try {
      await authController.logout();
      onNavigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div className="w-full bg-white mt-[40px]">
      {/* Book Appointment Dialog */}
      {currentUser && (
        <BookAppointmentDialog
          isOpen={showBookingDialog}
          onClose={() => setShowBookingDialog(false)}
          onSuccess={handleBookingSuccess}
          patientId={currentUser.id}
          patientName={currentUser.fullName}
          patientPhone={currentUser.phone}
          patientEmail={currentUser.email}
        />
      )}
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] py-[80px] px-[20px] md:px-[80px] overflow-hidden">
        <div className="absolute top-[20px] right-[20px] md:right-[80px] z-10">
          {/* <button
            onClick={handleLogout}
            className="flex items-center gap-[8px] px-[16px] py-[8px] bg-white/90 hover:bg-white text-[#01304e] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[14px] shadow-md hover:shadow-lg transition-all"
          >
            <LogOut className="w-[16px] h-[16px]" />
            <span>Đăng xuất</span>
          </button> */}
        </div>
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
            <div className="space-y-[32px]">
              <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-white/80 rounded-[100px] shadow-sm">
                <Sparkles className="w-[20px] h-[20px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px]">
                  Công nghệ nha khoa hiện đại
                </span>
              </div>

              <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] md:text-[64px] leading-[1.1]">
                Nụ cười tự tin
                <br />
                <span className="text-[#3fb5ff]">Bắt đầu tại đây</span>
              </h1>

              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] leading-[1.8]">
                Phòng khám nha khoa DentalCareX - Nơi mang đến những giải pháp
                chăm sóc răng miệng toàn diện với công nghệ tiên tiến và đội ngũ
                bác sĩ giàu kinh nghiệm.
              </p>

              <div className="flex flex-wrap gap-[16px]">
                <button
                  onClick={() => setShowBookingDialog(true)}
                  className="px-[32px] py-[16px] bg-[#3fb5ff] text-[#01304e] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#1e8bc3] hover:shadow-[0px_8px_24px_0px_rgba(63,181,255,0.4)] transition-all"
                >
                  Đặt lịch hẹn ngay
                </button>
                <button
                  onClick={onOpenChatbot}
                  className="px-[32px] py-[16px] bg-white border-2 border-[#3fb5ff] text-[#3fb5ff] rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#ebf6fc] transition-all">
                  Tư vấn miễn phí
                </button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-[24px] pt-[24px]">
                <div className="space-y-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <Users className="w-[24px] h-[24px] text-[#3fb5ff]" />
                    <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px]">
                      10K+
                    </span>
                  </div>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Bệnh nhân hài lòng
                  </p>
                </div>

                <div className="space-y-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <Award className="w-[24px] h-[24px] text-[#3fb5ff]" />
                    <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px]">
                      15+
                    </span>
                  </div>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Năm kinh nghiệm
                  </p>
                </div>

                <div className="space-y-[8px]">
                  <div className="flex items-center gap-[8px]">
                    <Stethoscope className="w-[24px] h-[24px] text-[#3fb5ff]" />
                    <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[28px]">
                      20+
                    </span>
                  </div>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    Bác sĩ chuyên khoa
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="relative z-10">
                <ImageWithFallback
                  src={imgThumbnail1}
                  alt="DentalCareX"
                  className="w-full h-auto rounded-[24px] shadow-[0px_20px_60px_0px_rgba(0,0,0,0.15)]"
                />
              </div>
              <div className="absolute top-[-20px] right-[-20px] w-[200px] h-[200px] bg-[#3fb5ff]/10 rounded-full blur-[60px]" />
              <div className="absolute bottom-[-40px] left-[-40px] w-[300px] h-[300px] bg-[#1e8bc3]/10 rounded-full blur-[80px]" />
            </div>
          </div>
        </div>
      </section>

      {/* Under Content - Contact Info, Hours, Services */}
      <UnderContentSimple />

      {/* Services Section */}
      <section className="py-[80px] px-[20px] md:px-[80px] bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-[#ebf6fc] rounded-[100px] mb-[16px]">
              <Activity className="w-[20px] h-[20px] text-[#3fb5ff]" />
              <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[14px]">
                Dịch vụ của chúng tôi
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Giải pháp chăm sóc răng miệng toàn diện
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] max-w-[600px] mx-auto">
              Chúng tôi cung cấp đầy đủ các dịch vụ nha khoa từ cơ bản đến nâng
              cao với công nghệ hiện đại nhất
            </p>
          </div>

          {/* Services Carousel */}
          <div className="relative">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-[24px]">
              {visibleServices.map((service, index) => (
                <div
                  key={`${service.id}-${index}`}
                  className="bg-white border border-[#ebf6fc] rounded-[20px] p-[32px] hover:shadow-[0px_8px_32px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer group"
                >
                  <div className="w-[80px] h-[80px] bg-gradient-to-br from-[#ebf6fc] to-[#d6edfa] rounded-[16px] flex items-center justify-center mb-[24px] group-hover:scale-110 transition-transform">
                    <img
                      src={service.icon}
                      alt={service.title}
                      className="w-[48px] h-[48px]"
                    />
                  </div>
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[22px] mb-[12px]">
                    {service.title}
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6] mb-[20px]">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap gap-[8px] mb-[20px]">
                    {service.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-[12px] py-[6px] bg-[#f0f9ff] text-[#3fb5ff] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between pt-[20px] border-t border-[#ebf6fc]">
                    <span className="font-['Fz_Poppins:Bold',sans-serif] text-[#3fb5ff] text-[18px]">
                      {service.price}
                    </span>
                    <button className="text-[#3fb5ff] hover:text-[#1e8bc3] transition-colors">
                      <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[14px]">
                        Xem chi tiết →
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Navigation Buttons */}
            <button
              onClick={prevService}
              className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white border-2 border-[#3fb5ff] rounded-full flex items-center justify-center hover:bg-[#3fb5ff] hover:text-white transition-all shadow-lg"
            >
              <ChevronLeft className="w-[24px] h-[24px]" />
            </button>
            <button
              onClick={nextService}
              className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white border-2 border-[#3fb5ff] rounded-full flex items-center justify-center hover:bg-[#3fb5ff] hover:text-white transition-all shadow-lg"
            >
              <ChevronRight className="w-[24px] h-[24px]" />
            </button>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="py-[80px] px-[20px] md:px-[80px] bg-[#f8fcff]">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-white rounded-[100px] mb-[16px] shadow-sm">
              <Heart className="w-[20px] h-[20px] text-[#3fb5ff]" />
              <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[14px]">
                Đội ngũ bác sĩ
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Bác sĩ giàu kinh nghiệm
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] max-w-[600px] mx-auto">
              Đội ngũ bác sĩ chuyên môn cao, tận tâm và nhiệt huyết
            </p>
          </div>

          {/* Featured Doctor Display */}
          <div className="mb-[60px] bg-white rounded-[32px] p-[40px] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.08)]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[40px] items-center">
              <div className="relative">
                <ImageWithFallback
                  src={selectedDoctor.image}
                  alt={selectedDoctor.name}
                  className="w-full h-[400px] object-cover rounded-[24px]"
                />
              </div>
              <div className="space-y-[24px]">
                <div>
                  <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[32px] mb-[8px]">
                    {selectedDoctor.name}
                  </h3>
                  <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[20px] mb-[8px]">
                    {selectedDoctor.specialty}
                  </p>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
                    {selectedDoctor.experience} kinh nghiệm
                  </p>
                </div>
                <div className="flex items-center gap-[8px]">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-[20px] h-[20px] fill-[#ffd700] text-[#ffd700]"
                    />
                  ))}
                  <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#666666] text-[16px] ml-[8px]">
                    {selectedDoctor.rating} ({selectedDoctor.reviews} đánh giá)
                  </span>
                </div>
              </div>
            </div>
          </div>

          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[32px] text-center">
            Nhấn vào bác sĩ để xem chi tiết
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-[32px]">
            {doctorsData.map((doctor) => (
              <div
                key={doctor.id}
                onClick={() => setSelectedDoctor(doctor)}
                className={`bg-white rounded-[24px] overflow-hidden transition-all cursor-pointer group ${selectedDoctor.id === doctor.id
                  ? "shadow-[0px_8px_32px_0px_rgba(63,181,255,0.3)] ring-2 ring-[#3fb5ff]"
                  : "hover:shadow-[0px_8px_32px_0px_rgba(63,181,255,0.15)]"
                  }`}
              >
                <div className="relative h-[300px] overflow-hidden">
                  <ImageWithFallback
                    src={doctor.image}
                    alt={doctor.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-[20px] left-[20px] right-[20px]">
                    <div className="flex items-center gap-[8px] mb-[8px]">
                      <Star className="w-[16px] h-[16px] fill-[#ffd700] text-[#ffd700]" />
                      <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-white text-[14px]">
                        {doctor.rating} ({doctor.reviews} đánh giá)
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-[24px]">
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[22px] mb-[8px]">
                    {doctor.name}
                  </h3>
                  <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[15px] mb-[4px]">
                    {doctor.specialty}
                  </p>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                    {doctor.experience}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-[80px] px-[20px] md:px-[80px] bg-white">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-[#ebf6fc] rounded-[100px] mb-[16px]">
              <Smile className="w-[20px] h-[20px] text-[#3fb5ff]" />
              <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[14px]">
                Khách hàng nói gì
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Đánh giá từ khách hàng
            </h2>
          </div>

          <div className="relative max-w-[800px] mx-auto">
            <div className="bg-gradient-to-br from-[#f0f9ff] to-[#e0f2fe] rounded-[24px] p-[48px]">
              <div className="flex flex-col items-center text-center">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden mb-[24px] ring-4 ring-white shadow-lg">
                  <ImageWithFallback
                    src={testimonialsData[currentTestimonialIndex].image}
                    alt={testimonialsData[currentTestimonialIndex].name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex gap-[4px] mb-[20px]">
                  {[
                    ...Array(testimonialsData[currentTestimonialIndex].rating),
                  ].map((_, i) => (
                    <Star
                      key={i}
                      className="w-[20px] h-[20px] fill-[#ffd700] text-[#ffd700]"
                    />
                  ))}
                </div>

                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#01304e] text-[18px] leading-[1.8] mb-[24px] italic">
                  "{testimonialsData[currentTestimonialIndex].text}"
                </p>

                <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px]">
                  {testimonialsData[currentTestimonialIndex].name}
                </h4>
              </div>
            </div>

            {/* Navigation */}
            <button
              onClick={prevTestimonial}
              className="absolute left-[-60px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white border-2 border-[#3fb5ff] rounded-full flex items-center justify-center hover:bg-[#3fb5ff] hover:text-white transition-all shadow-lg"
            >
              <ChevronLeft className="w-[24px] h-[24px]" />
            </button>
            <button
              onClick={nextTestimonial}
              className="absolute right-[-60px] top-1/2 -translate-y-1/2 w-[48px] h-[48px] bg-white border-2 border-[#3fb5ff] rounded-full flex items-center justify-center hover:bg-[#3fb5ff] hover:text-white transition-all shadow-lg"
            >
              <ChevronRight className="w-[24px] h-[24px]" />
            </button>

            {/* Dots */}
            <div className="flex justify-center gap-[8px] mt-[32px]">
              {testimonialsData.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  className={`w-[10px] h-[10px] rounded-full transition-all ${index === currentTestimonialIndex
                    ? "bg-[#3fb5ff] w-[32px]"
                    : "bg-[#d6edfa]"
                    }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-[80px] px-[20px] md:px-[80px] bg-[#f8fcff]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] px-[16px] py-[8px] bg-white rounded-[100px] mb-[16px] shadow-sm">
              <CheckCircle2 className="w-[20px] h-[20px] text-[#3fb5ff]" />
              <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[14px]">
                Câu hỏi thường gặp
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Giải đáp thắc mắc
            </h2>
          </div>

          <Accordion type="single" collapsible className="space-y-[16px]">
            {faqData.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-white border border-[#ebf6fc] rounded-[16px] px-[24px] overflow-hidden"
              >
                <AccordionTrigger className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] text-left hover:no-underline py-[20px]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px] leading-[1.8] pb-[20px]">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-[80px] px-[20px] md:px-[80px] bg-[#3fb5ff]">
        <div className="max-w-[1000px] mx-auto text-center">
          <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-white text-[42px] md:text-[48px] mb-[24px]">
            Sẵn sàng cho nụ cười rạng rỡ?
          </h2>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-white/90 text-[18px] mb-[40px] max-w-[700px] mx-auto">
            Đặt lịch hẹn ngay hôm nay để được tư vấn miễn phí từ đội ngũ bác sĩ
            chuyên nghiệp của chúng tôi
          </p>
          <div className="flex flex-wrap gap-[16px] justify-center">
            <button
              onClick={() => setShowBookingDialog(true)}
              className="px-[32px] py-[16px] bg-transparent border-2 border-white text-white rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:shadow-[0px_8px_24px_0px_rgba(255,255,255,0.3)] transition-all"
            >
              Đặt lịch hẹn ngay
            </button>
            <div
              className="px-[32px] py-[16px] bg-transparent border-2 border-white text-white rounded-[12px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] inline-flex items-center gap-[8px]"
            >
              <Phone className="w-[20px] h-[20px]" />
              Gọi ngay: +84 583891780
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
