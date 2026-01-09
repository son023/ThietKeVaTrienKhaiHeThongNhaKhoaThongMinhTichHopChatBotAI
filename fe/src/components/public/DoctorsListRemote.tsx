import { useEffect, useMemo, useState } from 'react';
import { DoctorCard } from './DoctorCard';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';
import { DoctorWithUser, doctorController } from '../../controllers/DoctorController';

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

interface DoctorsListProps {
  onDoctorSelect?: (doctorId: string) => void;
  onBooking?: (doctorId?: string) => void;
}

export function DoctorsListRemote({ onDoctorSelect, onBooking }: DoctorsListProps) {
  const [doctors, setDoctors] = useState<DoctorWithUser[]>([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    doctorController
      .getWithUserDetails()
      .then((data) => {
        setDoctors(data);
        setError(null);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Không tải được danh sách bác sĩ')
      )
      .finally(() => setLoading(false));
  }, []);

  const specialtyFilters = useMemo(() => {
    const codes = new Set<string>();
    doctors.forEach((doc) => {
      if (doc.specializationCode) {
        codes.add(doc.specializationCode);
      }
    });
    const dynamic = Array.from(codes).map((code) => ({
      id: code,
      label: SPECIALIZATION_MAP[code] || code,
    }));
    return [{ id: 'all', label: 'Tất cả' }, ...dynamic];
  }, [doctors]);

  const filteredDoctors = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return doctors.filter((doctor) => {
      const code = doctor.specializationCode || '';
      const matchesFilter =
        selectedFilter === 'all' ||
        code.toLowerCase() === selectedFilter.toLowerCase();
      const name = doctor.user?.fullName || '';
      const specialtyLabel =
        SPECIALIZATION_MAP[code] || doctor.workingHospital || '';
      const matchesSearch =
        name.toLowerCase().includes(q) || specialtyLabel.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [doctors, searchQuery, selectedFilter]);

  const getSpecialtyLabel = (doc: DoctorWithUser) => {
    const code = doc.specializationCode || '';
    return SPECIALIZATION_MAP[code] || doc.workingHospital || 'Nha khoa tổng quát';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfeff] pt-[104px] flex items-center justify-center">
        <p className="text-[#666]">Đang tải danh sách bác sĩ...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#fcfeff] pt-[104px] flex flex-col items-center justify-center space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()}>Thử lại</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[20px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] tracking-[0.5px]">
            Đội ngũ Bác sĩ
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[20px] tracking-[0.5px] max-w-[800px] mx-auto">
            Danh sách bác sĩ từ hệ thống doctor-service
          </p>
        </div>
      </div>

      <div className="container mx-auto px-20 py-[60px] space-y-[40px]">
        <div className="max-w-[600px] mx-auto">
          <div className="relative">
            <Search className="absolute left-[20px] top-1/2 -translate-y-1/2 text-[#666666] w-[20px] h-[20px]" />
            <Input
              placeholder="Tìm kiếm bác sĩ theo tên hoặc chuyên môn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[56px] rounded-[28px] border-[#d6edfa] pl-[56px] pr-[20px] font-['Fz_Poppins:Regular',sans-serif] text-[16px] shadow-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-[12px]">
          {specialtyFilters.map((filter) => (
            <Button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id)}
              variant={selectedFilter === filter.id ? 'default' : 'outline'}
              className={`rounded-[20px] h-[42px] px-[24px] font-['Fz_Poppins:Medium',sans-serif] text-[15px] tracking-[0.5px] transition-all ${
                selectedFilter === filter.id
                  ? 'bg-[#3fb5ff] text-[#fcfeff] hover:bg-[#3fb5ff]/90 shadow-[0px_4px_8px_0px_rgba(63,181,255,0.3)]'
                  : 'bg-[#fcfeff] text-[#333333] border-[#d6edfa] hover:bg-[#ebf6fc] hover:border-[#3fb5ff]'
              }`}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <div className="text-center">
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
            Hiện có {filteredDoctors.length} bác sĩ
          </p>
        </div>

        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.userId}
                name={doctor.user?.fullName || 'Bác sĩ'}
                specialty={getSpecialtyLabel(doctor)}
                image={doctor.user?.imageUrl || doctorPlaceholder}
                onViewProfile={() => onDoctorSelect?.(doctor.userId)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-[80px] space-y-[20px]">
            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[20px]">
              Không tìm thấy bác sĩ phù hợp
            </p>
            <Button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[50px] px-[30px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#3fb5ff]/90"
            >
              Xem tất cả bác sĩ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
