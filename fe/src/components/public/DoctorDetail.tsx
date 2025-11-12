import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Calendar, Award, Briefcase, GraduationCap, Star, Clock } from 'lucide-react';

interface DoctorDetailProps {
  doctorId: string;
  onBack: () => void;
  onBooking: (doctorId: string) => void;
}

const mockDoctorDetails = {
  '1': {
    id: '1',
    name: 'BS. Nguyễn Văn An',
    specialty: 'Chuyên gia Niềng răng',
    image: 'https://images.unsplash.com/photo-1631596577204-53ad0d6e6978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZW50aXN0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYyMTQ0MzU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '15 năm kinh nghiệm',
    rating: 4.9,
    reviews: 245,
    education: [
      'Bác sĩ Răng Hàm Mặt - Đại học Y Hà Nội',
      'Thạc sĩ Chỉnh nha - Đại học Tokyo, Nhật Bản',
      'Chứng chỉ Invisalign Provider'
    ],
    certifications: [
      'Hội viên Hiệp hội Chỉnh nha Việt Nam',
      'Hội viên Hiệp hội Chỉnh nha Thế giới (WFO)',
      'Chứng chỉ Damon System'
    ],
    experience_detail: 'Với hơn 15 năm kinh nghiệm trong lĩnh vực chỉnh nha, BS. Nguyễn Văn An đã điều trị thành công cho hàng ngàn ca phức tạp. Bác sĩ chuyên về niềng răng không mắc cài Invisalign và các hệ thống mắc cài tự đóng.',
    specializations: [
      'Niềng răng không mắc cài (Invisalign)',
      'Niềng răng mắc cài kim loại và sứ',
      'Niềng răng cho người lớn',
      'Chỉnh nha phối hợp phẫu thuật'
    ],
    schedule: [
      { day: 'Thứ 2', time: '8:00 - 12:00, 14:00 - 18:00' },
      { day: 'Thứ 3', time: '8:00 - 12:00, 14:00 - 18:00' },
      { day: 'Thứ 4', time: '8:00 - 12:00' },
      { day: 'Thứ 5', time: '8:00 - 12:00, 14:00 - 18:00' },
      { day: 'Thứ 6', time: '8:00 - 12:00, 14:00 - 18:00' },
      { day: 'Thứ 7', time: '8:00 - 12:00' },
    ]
  },
  // Add more doctor details as needed
};

export function DoctorDetail({ doctorId, onBack, onBooking }: DoctorDetailProps) {
  const doctor = mockDoctorDetails[doctorId as keyof typeof mockDoctorDetails] || mockDoctorDetails['1'];

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
      {/* Back Button */}
      <div className="container mx-auto px-20 py-[30px]">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-[#3fb5ff] hover:text-[#3fb5ff]/80 hover:bg-[#ebf6fc] font-['Fz_Poppins:Medium',sans-serif] text-[16px]"
        >
          ← Quay lại danh sách bác sĩ
        </Button>
      </div>

      <div className="container mx-auto px-20 pb-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[40px]">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-[40px]">
            {/* Doctor DoctorHeader */}
            <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] rounded-[24px] p-[40px] flex gap-[30px]">
              <div className="w-[200px] h-[200px] rounded-[20px] overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={doctor.image}
                  alt={doctor.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-[16px]">
                <div>
                  <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] tracking-[0.5px]">
                    {doctor.name}
                  </h1>
                  <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[20px] tracking-[0.5px]">
                    {doctor.specialty}
                  </p>
                </div>
                <div className="flex items-center gap-[20px]">
                  <div className="flex items-center gap-[8px]">
                    <Briefcase className="w-[20px] h-[20px] text-[#666666]" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px]">
                      {doctor.experience}
                    </span>
                  </div>
                  <div className="flex items-center gap-[8px]">
                    <Star className="w-[20px] h-[20px] text-[#fbbf24] fill-[#fbbf24]" />
                    <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#333333] text-[16px]">
                      {doctor.rating}
                    </span>
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      ({doctor.reviews} đánh giá)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* About Section */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[20px]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
                Giới thiệu
              </h2>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[28px]">
                {doctor.experience_detail}
              </p>
            </div>

            {/* Education */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[24px]">
              <div className="flex items-center gap-[12px]">
                <GraduationCap className="w-[28px] h-[28px] text-[#3fb5ff]" />
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
                  Học vấn
                </h2>
              </div>
              <ul className="space-y-[12px]">
                {doctor.education.map((edu, index) => (
                  <li key={index} className="flex gap-[12px]">
                    <span className="w-[6px] h-[6px] bg-[#3fb5ff] rounded-full mt-[10px] flex-shrink-0" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[26px]">
                      {edu}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Certifications */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[24px]">
              <div className="flex items-center gap-[12px]">
                <Award className="w-[28px] h-[28px] text-[#3fb5ff]" />
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
                  Chứng chỉ & Thành viên
                </h2>
              </div>
              <ul className="space-y-[12px]">
                {doctor.certifications.map((cert, index) => (
                  <li key={index} className="flex gap-[12px]">
                    <span className="w-[6px] h-[6px] bg-[#3fb5ff] rounded-full mt-[10px] flex-shrink-0" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[26px]">
                      {cert}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Specializations */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[24px]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
                Chuyên môn
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[12px]">
                {doctor.specializations.map((spec, index) => (
                  <div key={index} className="flex gap-[12px] items-start">
                    <span className="w-[6px] h-[6px] bg-[#3fb5ff] rounded-full mt-[10px] flex-shrink-0" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[26px]">
                      {spec}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - DoctorSidebar */}
          <div className="space-y-[24px]">
            {/* Booking Card */}
            <div className="bg-gradient-to-br from-[#3fb5ff] to-[#1e90c7] rounded-[20px] p-[28px] space-y-[24px] sticky top-[120px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[22px] tracking-[0.5px] text-center">
                Đặt lịch hẹn
              </h3>
              <Button
                onClick={() => onBooking(doctor.id)}
                className="w-full bg-[#fcfeff] text-[#3fb5ff] rounded-[15px] h-[52px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#fcfeff]/90 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)]"
              >
                <Calendar className="w-[20px] h-[20px] mr-[8px]" />
                Chọn ngày giờ
              </Button>
              <div className="text-center">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#fcfeff] text-[14px]">
                  Hoặc gọi trực tiếp
                </p>
                <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[18px] mt-[8px]">
                  (123) 456-7890
                </p>
              </div>
            </div>

            {/* Schedule Card */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[24px] space-y-[20px]">
              <div className="flex items-center gap-[12px]">
                <Clock className="w-[24px] h-[24px] text-[#3fb5ff]" />
                <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] tracking-[0.5px]">
                  Lịch làm việc
                </h3>
              </div>
              <div className="space-y-[12px]">
                {doctor.schedule.map((schedule, index) => (
                  <div key={index} className="flex justify-between items-center py-[8px] border-b border-[#ebf6fc] last:border-0">
                    <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[14px]">
                      {schedule.day}
                    </span>
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">
                      {schedule.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
