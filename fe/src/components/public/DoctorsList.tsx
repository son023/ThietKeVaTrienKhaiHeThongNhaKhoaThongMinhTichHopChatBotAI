import { useState } from 'react';
import { DoctorCard } from './DoctorCard';
import { Button } from '../ui/button';
import { Search } from 'lucide-react';
import { Input } from '../ui/input';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  experience: string;
  specialties: string[];
}

const mockDoctors: Doctor[] = [
  {
    id: '1',
    name: 'BS. Nguyễn Văn An',
    specialty: 'Chuyên gia Niềng răng',
    image: 'https://images.unsplash.com/photo-1631596577204-53ad0d6e6978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZW50aXN0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYyMTQ0MzU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '15 năm kinh nghiệm',
    specialties: ['orthodontics', 'general']
  },
  {
    id: '2',
    name: 'BS. Trần Thị Bình',
    specialty: 'Chuyên gia Răng sứ thẩm mỹ',
    image: 'https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkZW50aXN0JTIwc21pbGluZ3xlbnwxfHx8fDE3NjIwNzcyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '12 năm kinh nghiệm',
    specialties: ['cosmetic', 'general']
  },
  {
    id: '3',
    name: 'BS. Lê Hoàng Cường',
    specialty: 'Chuyên gia Cấy ghép Implant',
    image: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MjA2OTA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '18 năm kinh nghiệm',
    specialties: ['implant', 'surgery']
  },
  {
    id: '4',
    name: 'BS. Phạm Thị Dung',
    specialty: 'Nha khoa tổng quát',
    image: 'https://images.unsplash.com/photo-1642979904598-1e82c4202fec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGRlbnRpc3R8ZW58MXx8fHwxNzYyMTQ0MzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '10 năm kinh nghiệm',
    specialties: ['general', 'pediatric']
  },
  {
    id: '5',
    name: 'BS. Hoàng Minh Tuấn',
    specialty: 'Chuyên gia Nha chu',
    image: 'https://images.unsplash.com/photo-1631596577204-53ad0d6e6978?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjBkZW50aXN0JTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYyMTQ0MzU5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '14 năm kinh nghiệm',
    specialties: ['periodontics', 'general']
  },
  {
    id: '6',
    name: 'BS. Võ Thị Mai',
    specialty: 'Nha khoa trẻ em',
    image: 'https://images.unsplash.com/photo-1675526607070-f5cbd71dde92?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmZW1hbGUlMjBkZW50aXN0JTIwc21pbGluZ3xlbnwxfHx8fDE3NjIwNzcyNDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '9 năm kinh nghiệm',
    specialties: ['pediatric', 'general']
  },
  {
    id: '7',
    name: 'BS. Đỗ Văn Hải',
    specialty: 'Chuyên gia Phục hình',
    image: 'https://images.unsplash.com/photo-1615177393114-bd2917a4f74a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYWxlJTIwZG9jdG9yJTIwcHJvZmVzc2lvbmFsfGVufDF8fHx8MTc2MjA2OTA2OXww&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '16 năm kinh nghiệm',
    specialties: ['prosthodontics', 'cosmetic']
  },
  {
    id: '8',
    name: 'BS. Ngô Thị Lan',
    specialty: 'Chuyên gia Nội nha',
    image: 'https://images.unsplash.com/photo-1642979904598-1e82c4202fec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhc2lhbiUyMGRlbnRpc3R8ZW58MXx8fHwxNzYyMTQ0MzYwfDA&ixlib=rb-4.1.0&q=80&w=1080',
    experience: '11 năm kinh nghiệm',
    specialties: ['endodontics', 'general']
  },
];

const specialtyFilters = [
  { id: 'all', label: 'Tất cả' },
  { id: 'general', label: 'Nha khoa tổng quát' },
  { id: 'orthodontics', label: 'Niềng răng' },
  { id: 'cosmetic', label: 'Thẩm mỹ' },
  { id: 'implant', label: 'Cấy ghép Implant' },
  { id: 'surgery', label: 'Phẫu thuật' },
  { id: 'pediatric', label: 'Nha khoa trẻ em' },
  { id: 'periodontics', label: 'Nha chu' },
  { id: 'prosthodontics', label: 'Phục hình' },
  { id: 'endodontics', label: 'Nội nha' },
];

interface DoctorsListProps {
  onDoctorSelect?: (doctorId: string) => void;
  onBooking?: (doctorId?: string) => void;
}

export function DoctorsList({ onDoctorSelect, onBooking }: DoctorsListProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDoctors = mockDoctors.filter(doctor => {
    const matchesFilter = selectedFilter === 'all' || doctor.specialties.includes(selectedFilter);
    const matchesSearch = doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doctor.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[20px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] tracking-[0.5px]">
            Đội ngũ Bác sĩ
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[20px] tracking-[0.5px] max-w-[800px] mx-auto">
            Đội ngũ bác sĩ giàu kinh nghiệm, tận tâm và chuyên nghiệp của chúng tôi
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="container mx-auto px-20 py-[60px] space-y-[40px]">
        {/* Search Bar */}
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

        {/* Filter Buttons */}
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

        {/* Results Count */}
        <div className="text-center">
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[16px]">
            Hiển thị {filteredDoctors.length} bác sĩ
          </p>
        </div>

        {/* Doctors Grid */}
        {filteredDoctors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
            {filteredDoctors.map((doctor) => (
              <DoctorCard
                key={doctor.id}
                name={doctor.name}
                specialty={doctor.specialty}
                image={doctor.image}
                experience={doctor.experience}
                onViewProfile={() => onDoctorSelect?.(doctor.id)}
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

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[30px]">
          <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] tracking-[0.5px]">
            Sẵn sàng đặt lịch hẹn?
          </h2>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] tracking-[0.5px] max-w-[600px] mx-auto">
            Chọn bác sĩ phù hợp và đặt lịch hẹn ngay hôm nay
          </p>
          <Button
            onClick={() => onBooking?.()}
            className="bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[56px] px-[40px] font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] hover:bg-[#3fb5ff]/90 shadow-[0px_4px_10px_0px_rgba(63,181,255,0.4)]"
          >
            Đặt lịch hẹn ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
