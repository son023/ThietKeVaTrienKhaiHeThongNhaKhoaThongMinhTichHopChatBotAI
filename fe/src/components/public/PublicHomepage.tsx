import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
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
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import UnderContentSimple from "./UnderContentSimple";
import imgThumbnail1 from "../../assets/Thumbnail1.png";
import imgDoctor11 from "../../assets/imgDoctor1.png";
import imgDoctor31 from "../../assets/imgDoctor2.png";
import imgDoctor61 from "../../assets/imgDoctor3.png";
import img1 from "../../assets/img1.png";
import img4 from "../../assets/img4.png";
import img from "../../assets/img1.png";
import imgPatient1 from "../../assets/imgPatient1.png";
import imgPatient2 from "../../assets/imgPatient2.png";
import imgPatient3 from "../../assets/imgPatient3.png";
import imgPatient4 from "../../assets/imgPatient4.png";
import {
  medicalServiceController,
  MedicalServiceDTO,
} from "../../controllers/MedicalServiceController";
import {
  doctorController,
  DoctorWithUser,
} from "../../controllers/DoctorController";

interface PublicHomepageProps {
  onNavigate: (page: string) => void;
  onLoginClick: () => void;
  onBookingClick: () => void;
  onServiceSelect?: (serviceId: string) => void;
}

// 9 Services for carousel (legacy mock data)
const sampleServicesData = [
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
  {
    id: "7",
    icon: img1,
    title: "Điều trị tủy",
    description:
      "Điều trị tủy răng với công nghệ hiện đại, giảm đau tối đa, bảo tồn răng thật tốt nhất.",
    price: "Từ 800.000đ",
    features: ["Hiệu quả", "Bảo tồn răng", "Giảm đau"],
  },
  {
    id: "8",
    icon: img4,
    title: "Hàm giả tháo lắp",
    description:
      "Hàm giả cao cấp, khớp cắn chính xác, thẩm mỹ, phục hồi chức năng ăn nhai hiệu quả.",
    price: "Từ 8.000.000đ",
    features: ["Thoải mái", "Thẩm mỹ", "Bền đẹp"],
  },
  {
    id: "9",
    icon: img,
    title: "Chỉnh nha trẻ em",
    description:
      "Chỉnh nha sớm cho trẻ em, phát hiện và điều chỉnh các vấn đề răng miệng kịp thời.",
    price: "Từ 15.000.000đ",
    features: ["An toàn", "Hiệu quả", "Chuyên nghiệp"],
  },
];

// 6 Doctors for carousel (legacy mock data)
const sampleDoctorsData = [
  {
    id: "1",
    name: "BS. Nguyễn Văn An",
    specialty: "Chuyên gia Niềng răng",
    experience: "15+ năm",
    image: imgDoctor11,
  },
  {
    id: "2",
    name: "BS. Trần Thị Bình",
    specialty: "Chuyên gia Răng sứ thẩm mỹ",
    experience: "12+ năm",
    image: imgDoctor31,
  },
  {
    id: "3",
    name: "BS. Lê Hoàng Cường",
    specialty: "Chuyên gia Cấy ghép Implant",
    experience: "18+ năm",
    image: imgDoctor61,
  },
  {
    id: "4",
    name: "BS. Phạm Minh Quân",
    specialty: "Chuyên gia Chỉnh nha",
    experience: "10+ năm",
    image: imgDoctor31,
  },
  {
    id: "5",
    name: "BS. Đỗ Thị Hương",
    specialty: "Chuyên gia Nha chu",
    experience: "14+ năm",
    image: imgDoctor61,
  },
  {
    id: "6",
    name: "BS. Vũ Đức Thắng",
    specialty: "Chuyên gia Phục hồi",
    experience: "16+ năm",
    image: imgDoctor11,
  },
];

const SPECIALIZATION_MAP: Record<string, string> = {
  GEN: "General Dentistry",
  ENDO: "Endodontics (Noi nha)",
  ORTHO: "Orthodontics (Chinh nha)",
  PERIO: "Periodontics (Nha chu)",
  PROSTH: "Prosthodontics (Phuc hinh rang)",
  IMPL: "Implant Dentistry",
  OMFS: "Oral & Maxillofacial Surgery",
  PEDO: "Pediatric Dentistry",
  COS: "Cosmetic Dentistry",
  OMDIAG: "Oral Medicine",
  RAD: "Radiology",
};

const serviceIconPool = [img1, img4, img];
const doctorPlaceholderImg = imgDoctor11;

const testimonials = [
  {
    id: "1",
    name: "Anh Minh Tuấn",
    role: "Khách hàng",
    image: imgPatient1,
    rating: 5,
    comment:
      "Dịch vụ tuyệt vời! Bác sĩ tận tâm, nhiệt tình. Răng tôi đã trắng sáng hơn rất nhiều sau khi tẩy trắng ở đây. Rất hài lòng với kết quả.",
  },
  {
    id: "2",
    name: "Chị Thanh Lan",
    role: "Khách hàng",
    image: imgPatient2,
    rating: 5,
    comment:
      "Phòng khám hiện đại, sạch sẽ. Tôi rất hài lòng với dịch vụ niềng răng Invisalign ở đây. Bác sĩ tư vấn rất chi tiết và chu đáo.",
  },
  {
    id: "3",
    name: "Anh Khaled",
    role: "Khách hàng",
    image: imgPatient3,
    rating: 5,
    comment:
      "Tôi đã trồng răng Implant tại đây và rất hài lòng. Quy trình chuyên nghiệp, không đau, răng mọc tự nhiên như răng thật.",
  },
  {
    id: "4",
    name: "Anh Hassan",
    role: "Khách hàng",
    image: imgPatient4,
    rating: 5,
    comment:
      "Đội ngũ bác sĩ giàu kinh nghiệm và thân thiện. Giá cả hợp lý, dịch vụ tốt. Tôi sẽ quay lại và giới thiệu cho bạn bè.",
  },
];

export function PublicHomepage({
  onNavigate,
  onLoginClick,
  onBookingClick,
  onServiceSelect,
}: PublicHomepageProps) {
  const [servicesData, setServicesData] = useState<MedicalServiceDTO[]>([]);
  const [doctorsData, setDoctorsData] = useState<DoctorWithUser[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorWithUser | null>(
    null
  );
  const [servicesLoading, setServicesLoading] = useState(false);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [servicesError, setServicesError] = useState<string | null>(null);
  const [doctorsError, setDoctorsError] = useState<string | null>(null);
  const [currentServiceIndex, setCurrentServiceIndex] = useState(0);
  const [currentDoctorIndex, setCurrentDoctorIndex] = useState(0);

  useEffect(() => {
    setServicesLoading(true);
    medicalServiceController
      .getAll()
      .then((data) => {
        setServicesData(data);
        setServicesError(null);
        setCurrentServiceIndex(0);
      })
      .catch((err) =>
        setServicesError(
          err instanceof Error ? err.message : "Khong tai duoc dich vu"
        )
      )
      .finally(() => setServicesLoading(false));
  }, []);

  useEffect(() => {
    setDoctorsLoading(true);
    doctorController
      .getWithUserDetails()
      .then((data) => {
        setDoctorsData(data);
        setDoctorsError(null);
        setSelectedDoctor(data[0] || null);
        setCurrentDoctorIndex(0);
      })
      .catch((err) =>
        setDoctorsError(
          err instanceof Error ? err.message : "Khong tai duoc bac si"
        )
      )
      .finally(() => setDoctorsLoading(false));
  }, []);

  // Services carousel - show 3 at a time
  const servicesPerPage = 3;
  const totalServicePages =
    servicesData.length > 0
      ? Math.ceil(servicesData.length / servicesPerPage)
      : 1;

  const handlePrevService = () => {
    setCurrentServiceIndex((prev) =>
      prev === 0 ? Math.max(totalServicePages - 1, 0) : prev - 1
    );
  };

  const handleNextService = () => {
    setCurrentServiceIndex((prev) =>
      prev === Math.max(totalServicePages - 1, 0) ? 0 : prev + 1
    );
  };

  const getVisibleServices = () => {
    if (!servicesData.length) return [];
    const start = currentServiceIndex * servicesPerPage;
    return servicesData.slice(start, start + servicesPerPage);
  };

  // Doctors carousel - show 3 at a time
  const doctorsPerPage = 3;
  const totalDoctorPages =
    doctorsData.length > 0 ? Math.ceil(doctorsData.length / doctorsPerPage) : 1;

  const handlePrevDoctor = () => {
    setCurrentDoctorIndex((prev) =>
      prev === 0 ? Math.max(totalDoctorPages - 1, 0) : prev - 1
    );
  };

  const handleNextDoctor = () => {
    setCurrentDoctorIndex((prev) =>
      prev === Math.max(totalDoctorPages - 1, 0) ? 0 : prev + 1
    );
  };

  const getVisibleDoctors = () => {
    if (!doctorsData.length) return [];
    const start = currentDoctorIndex * doctorsPerPage;
    return doctorsData.slice(start, start + doctorsPerPage);
  };

  const formatServiceFeatures = (service: MedicalServiceDTO) => {
    const features = [
      SPECIALIZATION_MAP[service.serviceType || ""] || service.serviceType,
      service.serviceTime ? `${service.serviceTime} phut` : null,
      service.status ? `Trang thai: ${service.status}` : null,
    ].filter(Boolean) as string[];
    return features.length ? features : ["Dich vu nha khoa"];
  };

  const formatServicePrice = (service: MedicalServiceDTO) =>
    service.price ? `${service.price.toLocaleString("vi-VN")} VND` : "Lien he";

  const getDoctorName = (doctor?: DoctorWithUser | null) =>
    doctor?.user?.fullName || "Bac si nha khoa";

  const getDoctorSpecialty = (doctor?: DoctorWithUser | null) => {
    const spec = doctor?.specializationCodes?.[0];
    const code = spec?.code || "";
    return (
      spec?.displayName ||
      SPECIALIZATION_MAP[code] ||
      doctor?.workingHospital ||
      "Nha khoa tong quat"
    );
  };

  const getDoctorSubtitle = (doctor?: DoctorWithUser | null) => {
    if (!doctor) return "Tan tam - chuyen nghiep";
    if (doctor.consultationFeeAmount) {
      return `Phi tu van ${doctor.consultationFeeAmount.toLocaleString(
        "vi-VN"
      )} VND`;
    }
    return doctor.workingHospital || "Tan tam - chuyen nghiep";
  };

  return (
    <div className="bg-[#fcfeff] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#e3f4fc] via-[#f0f9ff] to-[#fcfeff] pt-[120px] pb-[80px] px-[20px] sm:px-[40px] lg:px-[80px] overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-[20%] right-[10%] w-[200px] h-[200px] bg-[#3fb5ff]/10 rounded-full blur-[80px]" />
        <div className="absolute bottom-[10%] left-[5%] w-[150px] h-[150px] bg-[#3fb5ff]/10 rounded-full blur-[60px]" />

        <div className="max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-2 gap-[60px] items-center">
            {/* Left Content */}
            <div className="space-y-[32px] z-10">
              <div className="inline-flex items-center gap-[8px] bg-[#ebf6fc] px-[20px] py-[10px] rounded-full">
                <Sparkles className="w-[18px] h-[18px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px]">
                  Phòng khám nha khoa hàng đầu Việt Nam
                </span>
              </div>

              <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] sm:text-[56px] lg:text-[64px] leading-[1.1]">
                Kiến tạo nụ cười
                <br />
                <span className="text-[#3fb5ff]">hoàn hảo</span> cho bạn
              </h1>

              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] leading-[1.7] max-w-[560px]">
                Chăm sóc răng miệng toàn diện với công nghệ hiện đại nhất, đội
                ngũ bác sĩ giàu kinh nghiệm và quy trình điều trị chuẩn quốc tế.
              </p>

              <div className="flex flex-wrap gap-[16px]">
                <Button
                  onClick={onBookingClick}
                  // Mặc định là variant="default" (Nền xanh, chữ trắng) nên không cần ghi
                  // Thêm class 'group' để icon bên trong bắt được sự kiện hover của nút cha
                  variant="primary"
                  className="group h-auto px-10 py-[18px] rounded-2xl text-lg shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50"
                >
                  Đặt lịch ngay
                  <Calendar className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button
                  onClick={() => onNavigate("services")}
                  variant="outline"
                  className="h-auto px-10 py-[18px] rounded-2xl text-lg"
                >
                  Xem dịch vụ
                </Button>
              </div>

              {/* Social Proof */}
              <div className="flex flex-wrap items-center gap-[24px] pt-[16px]">
                <div className="flex -space-x-3">
                  {[imgPatient1, imgPatient2, imgPatient3].map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt="Customer"
                      className="w-[44px] h-[44px] rounded-full border-3 border-[#fcfeff] object-cover"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-[6px] mb-[4px]">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-[16px] h-[16px] fill-[#fbbf24] text-[#fbbf24]"
                      />
                    ))}
                  </div>
                  <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[14px]">
                    Hơn 10,000+ khách hàng hài lòng
                  </p>
                </div>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative z-10">
              <div className="relative">
                <div className="absolute -top-[20px] -right-[20px] w-full h-full bg-gradient-to-br from-[#3fb5ff]/20 to-[#3fb5ff]/5 rounded-[32px] blur-[2px]" />
                <img
                  src={imgThumbnail1}
                  alt="Dental Care"
                  className="relative w-full h-auto object-contain drop-shadow-[0px_20px_40px_rgba(63,181,255,0.25)] rounded-[24px]"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Under Content Section - Contact, Opening Hours, Top Services */}
      <section className="bg-[#fcfeff] py-[60px] px-[20px] sm:px-[40px] lg:px-[80px]">
        <div className="w-full max-w-[1400px] mx-auto">
          <UnderContentSimple />
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-[#fcfeff] py-[60px] px-[20px] sm:px-[40px] lg:px-[80px] border-y border-[#ebf6fc]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-[40px]">
            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[16px] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
                <Users className="w-[32px] h-[32px] text-[#fcfeff]" />
              </div>
              <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] mb-[8px]">
                10K+
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
                Khách hàng tin tưởng
              </p>
            </div>
            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[16px] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
                <Award className="w-[32px] h-[32px] text-[#fcfeff]" />
              </div>
              <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] mb-[8px]">
                15+
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
                Năm kinh nghiệm
              </p>
            </div>
            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[16px] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
                <Heart className="w-[32px] h-[32px] text-[#fcfeff]" />
              </div>
              <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] mb-[8px]">
                98%
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
                Khách hàng hài lòng
              </p>
            </div>
            <div className="text-center">
              <div className="w-[64px] h-[64px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[16px] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.3)]">
                <Shield className="w-[32px] h-[32px] text-[#fcfeff]" />
              </div>
              <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] mb-[8px]">
                100%
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
                An toàn vệ sinh
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-[#fcfeff] to-[#f8fcff] py-[80px] px-[20px] sm:px-[40px] lg:px-[80px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="grid md:grid-cols-3 gap-[32px]">
            <div className="bg-[#fcfeff] rounded-[24px] p-[32px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_32px_0px_rgba(63,181,255,0.15)] transition-all duration-300 border border-[#ebf6fc]">
              <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#e3f4fc] to-[#d6edfa] rounded-[14px] flex items-center justify-center mb-[20px]">
                <Clock className="w-[28px] h-[28px] text-[#3fb5ff]" />
              </div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[12px]">
                Làm việc 24/7
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6]">
                Phòng khám hoạt động 24/7, sẵn sàng phục vụ bạn mọi lúc mọi nơi
              </p>
            </div>

            <div className="bg-[#fcfeff] rounded-[24px] p-[32px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_32px_0px_rgba(63,181,255,0.15)] transition-all duration-300 border border-[#ebf6fc]">
              <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#e3f4fc] to-[#d6edfa] rounded-[14px] flex items-center justify-center mb-[20px]">
                <Shield className="w-[28px] h-[28px] text-[#3fb5ff]" />
              </div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[12px]">
                An toàn tuyệt đối
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6]">
                Quy trình vệ sinh khử trùng nghiêm ngặt theo tiêu chuẩn quốc tế
              </p>
            </div>

            <div className="bg-[#fcfeff] rounded-[24px] p-[32px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_32px_0px_rgba(63,181,255,0.15)] transition-all duration-300 border border-[#ebf6fc]">
              <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#e3f4fc] to-[#d6edfa] rounded-[14px] flex items-center justify-center mb-[20px]">
                <Sparkles className="w-[28px] h-[28px] text-[#3fb5ff]" />
              </div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[12px]">
                Công nghệ hiện đại
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6]">
                Trang thiết bị y tế hiện đại nhất, công nghệ điều trị tiên tiến
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Doctors Section */}
      <section className="bg-gradient-to-br from-[#f0f9ff] to-[#e3f4fc] py-[100px] px-[20px] sm:px-[40px] lg:px-[80px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] bg-[#fcfeff] px-[20px] py-[10px] rounded-full mb-[16px] shadow-sm">
              <Award className="w-[18px] h-[18px] text-[#3fb5ff]" />
              <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px]">
                Đội ngũ chuyên gia
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Đội ngũ bác sĩ
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] max-w-[600px] mx-auto">
              Bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp, cam kết mang
              đến dịch vụ tốt nhất
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-[60px] items-center mb-[60px]">
            {/* Left - Doctor Image */}
            <div className="relative">
              <div className="relative bg-[#fcfeff] rounded-[32px] p-[40px] shadow-[0px_10px_40px_0px_rgba(0,0,0,0.08)]">
                {selectedDoctor ? (
                  <>
                    <img
                      src={
                        selectedDoctor.user?.imageUrl || doctorPlaceholderImg
                      }
                      alt={getDoctorName(selectedDoctor)}
                      className="w-full h-[500px] object-cover rounded-[24px]"
                    />
                    <div className="absolute bottom-[60px] left-[60px] right-[60px] bg-[#fcfeff]/95 backdrop-blur-sm rounded-[20px] p-[24px] shadow-lg">
                      <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[22px] mb-[8px]">
                        {getDoctorName(selectedDoctor)}
                      </h3>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#3fb5ff] text-[16px] mb-[12px]">
                        {getDoctorSpecialty(selectedDoctor)}
                      </p>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] leading-[1.6]">
                        {getDoctorSubtitle(selectedDoctor)}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="h-[500px] flex items-center justify-center text-[#666]">
                    Dang tai thong tin bac si...
                  </div>
                )}
              </div>
            </div>

            {/* Right - Description */}
            <div className="space-y-[32px]">
              <div>
                <h3 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[32px] mb-[20px] leading-[1.3]">
                  Phát triển không ngừng với đội ngũ bác sĩ xuất sắc
                </h3>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px] leading-[1.7] mb-[24px]">
                  Đội ngũ bác sĩ của chúng tôi được đào tạo bài bản, có bằng cấp
                  và chứng chỉ hành nghề đầy đủ. Với kinh nghiệm nhiều năm và kỹ
                  năng chuyên môn cao, chúng tôi cam kết mang đến cho bạn dịch
                  vụ chăm sóc răng miệng tốt nhất.
                </p>
              </div>

              <div className="space-y-[20px]">
                <div className="flex items-start gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#e3f4fc] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-[24px] h-[24px] text-[#3fb5ff]" />
                  </div>
                  <div>
                    <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px] mb-[6px]">
                      Bằng cấp quốc tế
                    </h4>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6]">
                      Được đào tạo tại các trường đại học nha khoa hàng đầu thế
                      giới
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#e3f4fc] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-[24px] h-[24px] text-[#3fb5ff]" />
                  </div>
                  <div>
                    <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px] mb-[6px]">
                      Kinh nghiệm phong phú
                    </h4>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6]">
                      Hơn 10 năm thực hành lâm sàng và nghiên cứu chuyên sâu
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-[16px]">
                  <div className="w-[48px] h-[48px] bg-[#e3f4fc] rounded-[12px] flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-[24px] h-[24px] text-[#3fb5ff]" />
                  </div>
                  <div>
                    <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[17px] mb-[6px]">
                      Cập nhật công nghệ mới
                    </h4>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.6]">
                      Thường xuyên tham gia các khóa đào tạo và hội thảo quốc tế
                    </p>
                  </div>
                </div>
              </div>
              <Button
                onClick={() => onNavigate("doctors")}
                // Mặc định là variant="default" (Nền xanh, chữ trắng) nên không cần ghi
                // Thêm class 'group' để icon bên trong bắt được sự kiện hover của nút cha
                variant="primary"
                className="group h-auto px-10 py-[18px] rounded-2xl text-lg shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50"
              >
                Xem tất cả bác sĩ
              </Button>
            </div>
          </div>

          {/* Doctors Carousel */}
          <div className="relative">
            <div className="rounded-[24px] bg-[#fcfeff] p-[40px] shadow-[0px_8px_32px_0px_rgba(0,0,0,0.08)]">
              <div className="flex items-center justify-between mb-[32px]">
                <div>
                  <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] mb-[8px]">
                    Gặp gỡ đội ngũ của chúng tôi
                  </h3>
                  <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px]">
                    {doctorsData.length} bác sĩ giàu kinh nghiệm
                  </p>
                </div>
                <div className="flex gap-[12px]">
                  <button
                    onClick={handlePrevDoctor}
                    className="w-[48px] h-[48px] bg-[#ebf6fc] hover:bg-[#3fb5ff] rounded-[14px] flex items-center justify-center transition-all group shadow-sm hover:shadow-md"
                  >
                    <ChevronLeft className="w-[24px] h-[24px] text-[#3fb5ff] group-hover:text-[#fcfeff]" />
                  </button>
                  <button
                    onClick={handleNextDoctor}
                    className="w-[48px] h-[48px] bg-[#ebf6fc] hover:bg-[#3fb5ff] rounded-[14px] flex items-center justify-center transition-all group shadow-sm hover:shadow-md"
                  >
                    <ChevronRight className="w-[24px] h-[24px] text-[#3fb5ff] group-hover:text-[#fcfeff]" />
                  </button>
                </div>
              </div>

              {/* Carousel Track */}
              <div className="overflow-hidden">
                <div className="grid md:grid-cols-3 gap-[24px]">
                  {getVisibleDoctors().map((doctor) => (
                    <div
                      key={doctor.userId || doctor.id}
                      className="transition-all duration-500 ease-in-out transform hover:scale-[1.02]"
                    >
                      <div
                        onClick={() => setSelectedDoctor(doctor)}
                        className={`group bg-gradient-to-b from-[#f8fcff] to-[#fcfeff] rounded-[20px] overflow-hidden border-2 hover:shadow-[0px_8px_24px_0px_rgba(63,181,255,0.15)] transition-all cursor-pointer ${selectedDoctor &&
                          (selectedDoctor.userId || selectedDoctor.id) ===
                          (doctor.userId || doctor.id)
                          ? "border-[#3fb5ff] shadow-[0px_8px_24px_0px_rgba(63,181,255,0.15)]"
                          : "border-[#ebf6fc] hover:border-[#3fb5ff]"
                          }`}
                      >
                        <div className="aspect-[3/4] overflow-hidden bg-gradient-to-br from-[#e3f4fc] to-[#d6edfa]">
                          <img
                            src={doctor.user?.imageUrl || doctorPlaceholderImg}
                            alt={getDoctorName(doctor)}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ease-in-out"
                          />
                        </div>
                        <div className="p-[24px] text-center">
                          <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[19px] mb-[6px]">
                            {getDoctorName(doctor)}
                          </h4>
                          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#3fb5ff] text-[15px] mb-[8px]">
                            {getDoctorSpecialty(doctor)}
                          </p>
                          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#999999] text-[13px]">
                            {getDoctorSubtitle(doctor)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex justify-center gap-[8px] mt-[32px]">
                {Array.from({ length: totalDoctorPages }).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentDoctorIndex(index)}
                    className={`h-[8px] rounded-full transition-all duration-500 ease-in-out ${index === currentDoctorIndex
                      ? "w-[32px] bg-[#3fb5ff]"
                      : "w-[8px] bg-[#d6edfa] hover:bg-[#3fb5ff]/50"
                      }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-[#fcfeff] py-[100px] px-[20px] sm:px-[40px] lg:px-[80px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] bg-[#ebf6fc] px-[20px] py-[10px] rounded-full mb-[16px]">
              <Sparkles className="w-[18px] h-[18px] text-[#3fb5ff]" />
              <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px]">
                Dịch vụ chất lượng cao
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Các loại dịch vụ
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] max-w-[600px] mx-auto">
              Cung cấp đa dạng dịch vụ nha khoa với công nghệ hiện đại nhất
            </p>
          </div>

          {/* Services Carousel */}
          <div className="relative">
            <div className="flex items-center justify-between mb-[32px]">
              <div className="flex gap-[12px]">
                <button
                  onClick={handlePrevService}
                  className="w-[48px] h-[48px] bg-[#ebf6fc] hover:bg-[#3fb5ff] rounded-[14px] flex items-center justify-center transition-all group shadow-sm hover:shadow-md"
                >
                  <ChevronLeft className="w-[24px] h-[24px] text-[#3fb5ff] group-hover:text-[#fcfeff]" />
                </button>
                <button
                  onClick={handleNextService}
                  className="w-[48px] h-[48px] bg-[#ebf6fc] hover:bg-[#3fb5ff] rounded-[14px] flex items-center justify-center transition-all group shadow-sm hover:shadow-md"
                >
                  <ChevronRight className="w-[24px] h-[24px] text-[#3fb5ff] group-hover:text-[#fcfeff]" />
                </button>
              </div>
              <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#999999] text-[14px]">
                {currentServiceIndex + 1} / {totalServicePages}
              </p>
            </div>

            {/* Carousel Track */}
            <div className="overflow-hidden">
              <div className="grid md:grid-cols-3 gap-[32px]">
                {getVisibleServices().map((service, index) => (
                  <div
                    key={service.id}
                    onClick={() => onServiceSelect?.(service.id)}
                    className="group bg-[#fcfeff] rounded-[24px] overflow-hidden shadow-[0px_4px_20px_0px_rgba(0,0,0,0.08)] hover:shadow-[0px_12px_40px_0px_rgba(63,181,255,0.2)] transition-all duration-300 border border-[#ebf6fc] cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <div className="relative h-[240px] bg-gradient-to-br from-[#e3f4fc] to-[#d6edfa] flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg2MywxODEsMjU1LDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50" />
                      <img
                        src={
                          service.imgUrl ||
                          serviceIconPool[
                          (currentServiceIndex * servicesPerPage + index) %
                          serviceIconPool.length
                          ]
                        }
                        alt={service.serviceName}
                        className="relative w-[120px] h-[120px] object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-[32px]">
                      <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[22px] mb-[12px]">
                        {service.serviceName}
                      </h3>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[1.7] mb-[20px] line-clamp-3">
                        {SPECIALIZATION_MAP[service.serviceType || ""] ||
                          service.description ||
                          "Dich vu y te"}
                      </p>

                      <div className="flex flex-wrap gap-[8px] mb-[20px]">
                        {formatServiceFeatures(service).map((feature, idx) => (
                          <span
                            key={`${service.id}-feature-${idx}`}
                            className="px-[12px] py-[6px] bg-[#ebf6fc] text-[#3fb5ff] rounded-[8px] font-['Fz_Poppins:Medium',sans-serif] text-[13px]"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-[20px] border-t border-[#ebf6fc]">
                        <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[18px]">
                          {formatServicePrice(service)}
                        </p>
                        <span className="text-[#3fb5ff] font-['Fz_Poppins:Medium',sans-serif] text-[15px] group-hover:underline group-hover:translate-x-[4px] transition-transform inline-block">
                          Chi tiết →
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-[8px] mt-[40px]">
              {Array.from({ length: totalServicePages }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentServiceIndex(index)}
                  className={`h-[8px] rounded-full transition-all ${index === currentServiceIndex
                    ? "w-[32px] bg-[#3fb5ff]"
                    : "w-[8px] bg-[#d6edfa] hover:bg-[#3fb5ff]/50"
                    }`}
                />
              ))}
            </div>
          </div>

          <div className="text-center mt-[48px]">
            <Button
              onClick={() => onNavigate("services")}
              // Mặc định là variant="default" (Nền xanh, chữ trắng) nên không cần ghi
              // Thêm class 'group' để icon bên trong bắt được sự kiện hover của nút cha
              variant="primary"
              className="group h-auto px-10 py-[18px] rounded-2xl text-lg shadow-xl shadow-primary/40 hover:shadow-2xl hover:shadow-primary/50"
            >
              Xem tất cả dịch vụ
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-gradient-to-br from-[#f8fcff] via-[#f0f9ff] to-[#e3f4fc] py-[100px] px-[20px] sm:px-[40px] lg:px-[80px]">
        <div className="max-w-[1400px] mx-auto">
          <div className="text-center mb-[60px]">
            <div className="inline-flex items-center gap-[8px] bg-[#fcfeff] px-[20px] py-[10px] rounded-full mb-[16px] shadow-sm">
              <Star className="w-[18px] h-[18px] text-[#fbbf24] fill-[#fbbf24]" />
              <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[14px]">
                Đánh giá 5 sao
              </span>
            </div>
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Đánh giá từ khách hàng
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px] max-w-[600px] mx-auto">
              Hàng ngàn khách hàng tin tưởng và hài lòng với dịch vụ của chúng
              tôi
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-[32px]">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-[#fcfeff] rounded-[24px] p-[32px] shadow-[0px_4px_20px_0px_rgba(0,0,0,0.06)] hover:shadow-[0px_8px_32px_0px_rgba(63,181,255,0.15)] transition-all duration-300 border border-[#ebf6fc]"
              >
                <div className="flex items-start gap-[20px] mb-[24px]">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-[64px] h-[64px] rounded-full object-cover border-2 border-[#ebf6fc]"
                  />
                  <div className="flex-1">
                    <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[4px]">
                      {testimonial.name}
                    </h4>
                    <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] mb-[8px]">
                      {testimonial.role}
                    </p>
                    <div className="flex gap-[4px]">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-[16px] h-[16px] fill-[#fbbf24] text-[#fbbf24]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[15px] leading-[1.7] italic">
                  "{testimonial.comment}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-[#fcfeff] py-[100px] px-[20px] sm:px-[40px] lg:px-[80px]">
        <div className="max-w-[900px] mx-auto">
          <div className="text-center mb-[60px]">
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[42px] mb-[16px]">
              Câu hỏi thường gặp
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[18px]">
              Giải đáp các thắc mắc phổ biến của khách hàng
            </p>
          </div>

          <Accordion type="single" collapsible className="space-y-[16px]">
            <AccordionItem
              value="item-1"
              className="rounded-[16px] border border-slate-200 bg-white transition-colors hover:border-primary data-[state=open]:bg-neutral-muted data-[state=open]:border-primary last:border-b"
            >
              <AccordionTrigger className="bg-transparent px-[24px] py-[22px] font-semibold text-[17px] text-secondary-deep hover:no-underline transition-colors hover:text-primary">
                Chi phí điều trị tại phòng khám như thế nào?
              </AccordionTrigger>

              <AccordionContent className="px-[24px] pb-[24px] text-[15px] leading-[1.7] font-normal text-primary">
                Chi phí điều trị phụ thuộc vào loại dịch vụ và tình trạng răng
                miệng của bạn. Chúng tôi cam kết báo giá minh bạch, rõ ràng
                trước khi bắt đầu điều trị. Bạn có thể đặt lịch tư vấn miễn phí
                để được báo giá chi tiết.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-2"
              className="rounded-[16px] border border-slate-200 bg-white transition-colors hover:border-primary data-[state=open]:bg-neutral-muted data-[state=open]:border-primary last:border-b"
            >
              <AccordionTrigger className="bg-transparent px-[24px] py-[22px] font-semibold text-[17px] text-secondary-deep hover:no-underline transition-colors hover:text-primary">
                Có đau khi điều trị nha khoa không?
              </AccordionTrigger>
              <AccordionContent className="px-[24px] pb-[24px] text-[15px] leading-[1.7] font-normal text-primary">
                Chúng tôi sử dụng công nghệ hiện đại và thuốc tê an toàn để đảm
                bảo quá trình điều trị không đau và thoải mái nhất. Bác sĩ sẽ
                luôn theo dõi và điều chỉnh để bạn cảm thấy thoải mái.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-3"
              className="rounded-[16px] border border-slate-200 bg-white transition-colors hover:border-primary data-[state=open]:bg-neutral-muted data-[state=open]:border-primary last:border-b"
            >
              <AccordionTrigger className="bg-transparent px-[24px] py-[22px] font-semibold text-[17px] text-secondary-deep hover:no-underline transition-colors hover:text-primary">
                Làm sao để đặt lịch hẹn tại phòng khám?
              </AccordionTrigger>
              <AccordionContent className="px-[24px] pb-[24px] text-[15px] leading-[1.7] font-normal text-primary">
                Bạn có thể đặt lịch hẹn trực tuyến qua website, gọi hotline
                (123) 456-7890, hoặc nhắn tin qua fanpage Facebook của chúng
                tôi. Chúng tôi sẽ xác nhận lịch hẹn trong vòng 30 phút.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="item-4"
              className="rounded-[16px] border border-slate-200 bg-white transition-colors hover:border-primary data-[state=open]:bg-neutral-muted data-[state=open]:border-primary last:border-b"
            >
              <AccordionTrigger className="bg-transparent px-[24px] py-[22px] font-semibold text-[17px] text-secondary-deep hover:no-underline transition-colors hover:text-primary">
                Phòng khám có bảo hành dịch vụ không?
              </AccordionTrigger>
              <AccordionContent className="px-[24px] pb-[24px] text-[15px] leading-[1.7] font-normal text-primary">
                Có, chúng tôi cam kết bảo hành cho tất cả các dịch vụ theo quy
                định. Thời gian bảo hành tùy thuộc vào từng loại dịch vụ và sẽ
                được ghi rõ trong hợp đồng điều trị.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative bg-gradient-to-r from-[#3fb5ff] via-[#2da5e8] to-[#1e8bc3] py-[100px] px-[20px] sm:px-[40px] lg:px-[80px] overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMTAgNjAgTSAwIDEwIEwgNjAgMTAgTSAyMCAwIEwgMjAgNjAgTSAwIDIwIEwgNjAgMjAgTSAzMCAwIEwgMzAgNjAgTSAwIDMwIEwgNjAgMzAgTSA0MCAwIEwgNDAgNjAgTSAwIDQwIEwgNjAgNDAgTSA1MCAwIEwgNTAgNjAgTSAwIDUwIEwgNjAgNTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="absolute top-[10%] right-[15%] w-[300px] h-[300px] bg-[#fcfeff]/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-[15%] left-[10%] w-[250px] h-[250px] bg-[#fcfeff]/10 rounded-full blur-[80px]" />

        <div className="max-w-[1400px] mx-auto text-center relative z-10">
          <div className="max-w-[800px] mx-auto">
            <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#fcfeff] text-[42px] sm:text-[48px] mb-[24px] leading-[1.2]">
              Sẵn sàng để có một nụ cười đẹp?
            </h2>
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#fcfeff]/90 text-[20px] mb-[48px] leading-[1.6]">
              Đặt lịch hẹn ngay hôm nay và nhận ưu đãi đặc biệt cho khách hàng
              mới.
            </p>

            <div className="flex flex-col sm:flex-row gap-[16px] justify-center items-center">
              <button
                onClick={onBookingClick}
                className="group bg-[#fcfeff] text-[#3fb5ff] px-[48px] py-[20px] rounded-[16px] font-['Fz_Poppins:Bold',sans-serif] text-[18px] hover:bg-[#fcfeff]/95 transition-all shadow-[0px_8px_24px_0px_rgba(0,0,0,0.15)] hover:shadow-[0px_12px_32px_0px_rgba(0,0,0,0.2)] hover:translate-y-[-2px]"
              >
                Đặt lịch miễn phí
                <Calendar className="inline-block w-[22px] h-[22px] ml-[12px] group-hover:translate-x-[4px] transition-transform" />
              </button>
            </div>

            {/* Contact Info */}
            <div className="flex flex-wrap justify-center items-center gap-[32px] mt-[48px] pt-[32px] border-t border-[#fcfeff]/20">
              <div className="flex items-center gap-[12px]">
                <Phone className="w-[20px] h-[20px] text-[#fcfeff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[16px]">
                  (123) 456-7890
                </span>
              </div>
              <div className="flex items-center gap-[12px]">
                <MapPin className="w-[20px] h-[20px] text-[#fcfeff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[16px]">
                  Hà Nội, Việt Nam
                </span>
              </div>
              <div className="flex items-center gap-[12px]">
                <Mail className="w-[20px] h-[20px] text-[#fcfeff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[16px]">
                  info@dentalcarex.com
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
