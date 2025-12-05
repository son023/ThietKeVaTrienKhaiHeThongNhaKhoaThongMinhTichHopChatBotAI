import { useEffect, useState } from 'react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Calendar, Award, Briefcase, GraduationCap, Clock } from 'lucide-react';
import { doctorController, DoctorWithUser } from '../../controllers/DoctorController';
import { doctorDegreeController, DoctorDegreeDTO } from '../../controllers/DoctorDegreeController';

interface DoctorDetailProps {
  doctorId: string;
  onBack: () => void;
  onBooking: (doctorId: string) => void;
}

const SPECIALIZATION_MAP: Record<string, string> = {
  GEN: 'Nha khoa tổng quát',
  ENDO: 'Nội nha',
  ORTHO: 'Chỉnh nha',
  PERIO: 'Nha chu',
  PROSTH: 'Phục hình răng',
  IMPL: 'Cấy ghép Implant',
  OMFS: 'Phẫu thuật hàm mặt',
  PEDO: 'Nha khoa trẻ em',
  COS: 'Thẩm mỹ',
  OMDIAG: 'Răng miệng tổng quát',
  RAD: 'Chẩn đoán hình ảnh',
};

const doctorPlaceholder =
  'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=800&q=80';

export function DoctorDetailRemote({ doctorId, onBack, onBooking }: DoctorDetailProps) {
  const [doctor, setDoctor] = useState<DoctorWithUser | null>(null);
  const [degrees, setDegrees] = useState<DoctorDegreeDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      doctorController.getWithUserById(doctorId),
      doctorDegreeController.getByDoctor(doctorId).catch(() => []),
    ])
      .then(([doctorRes, degreeRes]) => {
        setDoctor(doctorRes);
        setDegrees(degreeRes);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Không tải được bác sĩ')
      )
      .finally(() => setLoading(false));
  }, [doctorId]);

  const getSpecialtyLabel = () => {
    const code = doctor?.specializationCodes?.[0] || '';
    return SPECIALIZATION_MAP[code] || doctor?.workingHospital || 'Nha khoa tổng quát';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfeff] pt-[104px] flex items-center justify-center">
        <p className="text-[#666]">Đang tải thông tin bác sĩ...</p>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="min-h-screen bg-[#fcfeff] pt-[104px] flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error || 'Không tìm thấy bác sĩ'}</p>
        <Button onClick={onBack}>Quay lại</Button>
      </div>
    );
  }

  const doctorName = doctor.user?.fullName || 'Bác sĩ';

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
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
          <div className="lg:col-span-2 space-y-[40px]">
            <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] rounded-[24px] p-[40px] flex gap-[30px]">
              <div className="w-[200px] h-[200px] rounded-[20px] overflow-hidden flex-shrink-0">
                <ImageWithFallback
                  src={doctor.user?.imageUrl || doctorPlaceholder}
                  alt={doctorName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 space-y-[16px]">
                <div>
                  <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] tracking-[0.5px]">
                    {doctorName}
                  </h1>
                  <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[20px] tracking-[0.5px]">
                    {getSpecialtyLabel()}
                  </p>
                </div>
                <div className="flex items-center gap-[20px] flex-wrap">
                  <div className="flex items-center gap-[8px]">
                    <Briefcase className="w-[20px] h-[20px] text-[#666666]" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px]">
                      {doctor.workingHospital || 'Cơ sở khám chữa bệnh'}
                    </span>
                  </div>
                  {doctor.consultationFeeAmount && (
                    <div className="flex items-center gap-[8px]">
                      <Clock className="w-[20px] h-[20px] text-[#666666]" />
                      <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px]">
                        Phí tư vấn: {doctor.consultationFeeAmount.toLocaleString('vi-VN')} VND
                      </span>
                    </div>
                  )}
                  {doctor.licenseNumber && (
                    <div className="flex items-center gap-[8px]">
                      <Award className="w-[20px] h-[20px] text-[#666666]" />
                      <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px]">
                        Mã hành nghề: {doctor.licenseNumber}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[20px]">
              <div className="flex items-center gap-[12px]">
                <GraduationCap className="w-[28px] h-[28px] text-[#3fb5ff]" />
                <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
                  Bằng cấp & chứng chỉ
                </h2>
              </div>
              {degrees.length === 0 ? (
                <p className="text-[#666]">Chưa có thông tin bằng cấp</p>
              ) : (
                <ul className="space-y-[12px] list-disc list-inside text-[#333]">
                  {degrees.map((deg) => (
                    <li key={deg.id}>
                      <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">
                        {deg.degreeName}
                      </span>
                      {deg.institution && <span className="text-[#666]"> · {deg.institution}</span>}
                      {deg.yearObtained && <span className="text-[#666]"> · {deg.yearObtained}</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="space-y-[20px]">
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] p-[24px] border border-[#ebf6fc]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[12px]">
                Đặt lịch với bác sĩ
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] mb-[16px]">
                Chọn bác sĩ {doctorName} cho cuộc hẹn sắp tới của bạn.
              </p>
              <Button
                className="w-full bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 rounded-[12px] h-[48px]"
                onClick={() => onBooking(doctor.userId)}
              >
                Đặt lịch
              </Button>
            </div>

            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] p-[24px] border border-[#ebf6fc] space-y-[12px]">
              <div className="flex items-center gap-[10px]">
                <Clock className="w-[20px] h-[20px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">Giờ làm việc linh hoạt</span>
              </div>
              <div className="flex items-center gap-[10px]">
                <Award className="w-[20px] h-[20px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">Bằng cấp rõ ràng</span>
              </div>
              <div className="flex items-center gap-[10px]">
                <Calendar className="w-[20px] h-[20px] text-[#3fb5ff]" />
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e]">Đặt lịch nhanh chóng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
