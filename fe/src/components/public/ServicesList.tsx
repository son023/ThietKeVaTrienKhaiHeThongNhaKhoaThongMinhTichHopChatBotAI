import { useState } from 'react';
import { ServiceCard } from './ServiceCard';
import { Button } from '../ui/button';
import { Search, Sparkles, Crown, Activity, Stethoscope, Baby, Heart } from 'lucide-react';
import { Input } from '../ui/input';

interface Service {
  id: string;
  name: string;
  description: string;
  image: string;
  price: string;
  categories: string[];
  icon: React.ReactNode;
}

const mockServices: Service[] = [
  {
    id: '1',
    name: 'Tẩy trắng răng',
    description: 'Công nghệ tẩy trắng răng hiện đại, an toàn, giúp răng trắng sáng tự nhiên chỉ trong 60 phút.',
    image: 'https://images.unsplash.com/photo-1654373535457-383a0a4d00f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWV0aCUyMHdoaXRlbmluZ3xlbnwxfHx8fDE3NjIxMzk0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '2.500.000đ',
    categories: ['cosmetic', 'all'],
    icon: <Sparkles className="w-[24px] h-[24px]" />
  },
  {
    id: '2',
    name: 'Niềng răng Invisalign',
    description: 'Niềng răng trong suốt, không mắc cài, thoải mái và thẩm mỹ. Kết quả chính xác với công nghệ 3D.',
    image: 'https://images.unsplash.com/photo-1729541479462-d2a438f4c124?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvcnRob2RvbnRpY3MlMjBicmFjZXN8ZW58MXx8fHwxNzYyMDc5NDY5fDA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '85.000.000đ',
    categories: ['orthodontics', 'all'],
    icon: <Activity className="w-[24px] h-[24px]" />
  },
  {
    id: '3',
    name: 'Cấy ghép Implant',
    description: 'Trồng răng Implant công nghệ Mỹ, phục hồi chức năng ăn nhai tự nhiên, bền đẹp suốt đời.',
    image: 'https://images.unsplash.com/photo-1593022356769-11f762e25ed9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBpbXBsYW50fGVufDF8fHx8MTc2MjA0MTQ3OHww&ixlib=rb-4.1.0&q=80&w=1080',
    price: '25.000.000đ',
    categories: ['implant', 'restoration', 'all'],
    icon: <Stethoscope className="w-[24px] h-[24px]" />
  },
  {
    id: '4',
    name: 'Bọc răng sứ thẩm mỹ',
    description: 'Răng sứ cao cấp Cercon, Emax, Veneer siêu mỏng. Thẩm mỹ hoàn hảo, màu sắc tự nhiên.',
    image: 'https://images.unsplash.com/photo-1675516161546-1894798c71de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjcm93bnxlbnwxfHx8fDE3NjIxNTQwNTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '5.500.000đ',
    categories: ['cosmetic', 'restoration', 'all'],
    icon: <Crown className="w-[24px] h-[24px]" />
  },
  {
    id: '5',
    name: 'Vệ sinh răng miệng',
    description: 'Lấy cao răng, đánh bóng răng chuyên nghiệp. Phòng ngừa sâu răng và bệnh nha chu hiệu quả.',
    image: 'https://images.unsplash.com/photo-1693692273603-3b9e13789298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjbGVhbmluZ3xlbnwxfHx8fDE3NjIxNTQwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '350.000đ',
    categories: ['general', 'all'],
    icon: <Sparkles className="w-[24px] h-[24px]" />
  },
  {
    id: '6',
    name: 'Nhổ răng khôn',
    description: 'Nhổ răng khôn an toàn, không đau với công nghệ Piezotome. Chăm sóc sau nhổ tận tình.',
    image: 'https://images.unsplash.com/photo-1626736985932-c0df2ae07a2e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBzdXJnZXJ5fGVufDF8fHx8MTc2MjE1NDA1MXww&ixlib=rb-4.1.0&q=80&w=1080',
    price: '1.500.000đ',
    categories: ['surgery', 'all'],
    icon: <Stethoscope className="w-[24px] h-[24px]" />
  },
  {
    id: '7',
    name: 'Điều trị tủy răng',
    description: 'Điều trị tủy răng với công nghệ hiện đại, không đau, bảo tồn răng thật tối đa.',
    image: 'https://images.unsplash.com/photo-1693692273603-3b9e13789298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjbGVhbmluZ3xlbnwxfHx8fDE3NjIxNTQwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '1.800.000đ',
    categories: ['general', 'endodontics', 'all'],
    icon: <Heart className="w-[24px] h-[24px]" />
  },
  {
    id: '8',
    name: 'Nha khoa trẻ em',
    description: 'Chăm sóc răng miệng toàn diện cho trẻ em. Không gian thân thiện, bác sĩ tận tâm.',
    image: 'https://images.unsplash.com/photo-1693692273603-3b9e13789298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjbGVhbmluZ3xlbnwxfHx8fDE3NjIxNTQwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '500.000đ',
    categories: ['pediatric', 'all'],
    icon: <Baby className="w-[24px] h-[24px]" />
  },
];

const categoryFilters = [
  { id: 'all', label: 'Tất cả dịch vụ' },
  { id: 'general', label: 'Nha khoa tổng quát' },
  { id: 'cosmetic', label: 'Thẩm mỹ' },
  { id: 'orthodontics', label: 'Niềng răng' },
  { id: 'implant', label: 'Cấy ghép Implant' },
  { id: 'restoration', label: 'Phục hình' },
  { id: 'surgery', label: 'Phẫu thuật' },
  { id: 'pediatric', label: 'Trẻ em' },
  { id: 'endodontics', label: 'Nội nha' },
];

interface ServicesListProps {
  onServiceSelect?: (serviceId: string) => void;
  onBooking?: (serviceId?: string) => void;
}

export function ServicesList({ onServiceSelect, onBooking }: ServicesListProps) {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredServices = mockServices.filter(service => {
    const matchesFilter = service.categories.includes(selectedFilter);
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          service.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[20px]">
          <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[48px] tracking-[0.5px]">
            Dịch vụ của chúng tôi
          </h1>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[20px] tracking-[0.5px] max-w-[800px] mx-auto">
            Cung cấp đa dạng dịch vụ nha khoa chất lượng cao với công nghệ hiện đại
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
              placeholder="Tìm kiếm dịch vụ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-[56px] rounded-[28px] border-[#d6edfa] pl-[56px] pr-[20px] font-['Fz_Poppins:Regular',sans-serif] text-[16px] shadow-sm"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-[12px]">
          {categoryFilters.map((filter) => (
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
            Hiển thị {filteredServices.length} dịch vụ
          </p>
        </div>

        {/* Services Grid */}
        {filteredServices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[30px]">
            {filteredServices.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                description={service.description}
                image={service.image}
                price={service.price}
                icon={service.icon}
                onLearnMore={() => onServiceSelect?.(service.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-[80px] space-y-[20px]">
            <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#666666] text-[20px]">
              Không tìm thấy dịch vụ phù hợp
            </p>
            <Button
              onClick={() => {
                setSelectedFilter('all');
                setSearchQuery('');
              }}
              className="bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[50px] px-[30px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#3fb5ff]/90"
            >
              Xem tất cả dịch vụ
            </Button>
          </div>
        )}
      </div>

      {/* Call to Action Section */}
      <div className="bg-gradient-to-r from-[#ebf6fc] to-[#d6edfa] py-[80px] px-[20px]">
        <div className="container mx-auto px-20 text-center space-y-[30px]">
          <h2 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[36px] tracking-[0.5px]">
            Cần tư vấn về dịch vụ?
          </h2>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] tracking-[0.5px] max-w-[600px] mx-auto">
            Đội ngũ bác sĩ của chúng tôi sẵn sàng tư vấn và hỗ trợ bạn
          </p>
          <Button
            onClick={() => onBooking?.()}
            className="bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[56px] px-[40px] font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] hover:bg-[#3fb5ff]/90 shadow-[0px_4px_10px_0px_rgba(63,181,255,0.4)]"
          >
            Đặt lịch tư vấn ngay
          </Button>
        </div>
      </div>
    </div>
  );
}
