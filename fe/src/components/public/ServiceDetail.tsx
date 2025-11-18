import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { Calendar, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { ServiceCard } from './ServiceCard';

interface ServiceDetailProps {
  serviceId: string;
  onBack: () => void;
  onBooking: (serviceId: string) => void;
  onServiceSelect: (serviceId: string) => void;
}

const mockServiceDetails = {
  '1': {
    id: '1',
    name: 'Tẩy trắng răng',
    shortDescription: 'Công nghệ tẩy trắng răng hiện đại, an toàn, giúp răng trắng sáng tự nhiên.',
    image: 'https://images.unsplash.com/photo-1654373535457-383a0a4d00f9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWV0aCUyMHdoaXRlbmluZ3xlbnwxfHx8fDE3NjIxMzk0MDB8MA&ixlib=rb-4.1.0&q=80&w=1080',
    price: '2.500.000đ - 5.000.000đ',
    duration: '60 - 90 phút',
    overview: 'Tẩy trắng răng là phương pháp thẩm mỹ nha khoa giúp làm sáng màu răng, loại bỏ các vết ố vàng do thực phẩm, thuốc lá hay lão hóa tự nhiên gây ra. Tại DentalCareX, chúng tôi sử dụng công nghệ tẩy trắng răng Laser Whitening và Bleaching Home hiện đại nhất hiện nay.',
    benefits: [
      'Răng trắng sáng tức thì sau 60 phút',
      'An toàn tuyệt đối, không làm hại men răng',
      'Kết quả bền lâu từ 1-3 năm',
      'Không đau, không ê buốt',
      'Màu sắc trắng tự nhiên, không giả tạo',
      'Tăng tự tin trong giao tiếp'
    ],
    process: [
      {
        step: 1,
        title: 'Khám và tư vấn',
        description: 'Bác sĩ khám tổng quát, đánh giá tình trạng răng miệng và tư vấn phương pháp phù hợp'
      },
      {
        step: 2,
        title: 'Vệ sinh răng miệng',
        description: 'Lấy cao răng, đánh bóng để chuẩn bị cho quá trình tẩy trắng'
      },
      {
        step: 3,
        title: 'Bảo vệ nướu',
        description: 'Che phủ nướu bằng gel chuyên dụng để bảo vệ mô mềm'
      },
      {
        step: 4,
        title: 'Thoa gel tẩy trắng',
        description: 'Thoa gel tẩy trắng lên bề mặt răng và kích hoạt bằng đèn laser'
      },
      {
        step: 5,
        title: 'Hoàn tất',
        description: 'Loại bỏ gel, vệ sinh và tư vấn chăm sóc sau tẩy trắng'
      }
    ],
    aftercare: [
      'Tránh ăn uống thực phẩm có màu trong 48 giờ đầu',
      'Không hút thuốc lá trong thời gian này',
      'Vệ sinh răng miệng đúng cách 2 lần/ngày',
      'Tái khám định kỳ sau 6 tháng',
      'Sử dụng kem đánh răng cho răng nhạy cảm nếu cần'
    ],
    relatedServices: ['4', '5', '7']
  },
  // Add more service details as needed
};

export function ServiceDetail({ serviceId, onBack, onBooking, onServiceSelect }: ServiceDetailProps) {
  const service = mockServiceDetails[serviceId as keyof typeof mockServiceDetails] || mockServiceDetails['1'];

  // Mock related services
  const relatedServices = [
    {
      id: '4',
      name: 'Bọc răng sứ thẩm mỹ',
      description: 'Răng sứ cao cấp Cercon, Emax, Veneer siêu mỏng. Thẩm mỹ hoàn hảo.',
      image: 'https://images.unsplash.com/photo-1675516161546-1894798c71de?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjcm93bnxlbnwxfHx8fDE3NjIxNTQwNTF8MA&ixlib=rb-4.1.0&q=80&w=1080',
      price: '5.500.000đ'
    },
    {
      id: '5',
      name: 'Vệ sinh răng miệng',
      description: 'Lấy cao răng, đánh bóng răng chuyên nghiệp.',
      image: 'https://images.unsplash.com/photo-1693692273603-3b9e13789298?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjbGVhbmluZ3xlbnwxfHx8fDE3NjIxNTQwNDl8MA&ixlib=rb-4.1.0&q=80&w=1080',
      price: '350.000đ'
    },
  ];

  return (
    <div className="min-h-screen bg-[#fcfeff] pt-[104px]">
      {/* Back Button */}
      <div className="container mx-auto px-20 py-[30px]">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-[#3fb5ff] hover:text-[#3fb5ff]/80 hover:bg-[#ebf6fc] font-['Fz_Poppins:Medium',sans-serif] text-[16px]"
        >
          ← Quay lại danh sách dịch vụ
        </Button>
      </div>

      <div className="container mx-auto px-20 pb-[80px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-[40px]">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-[40px]">
            {/* Service DoctorHeader */}
            <div className="space-y-[24px]">
              <h1 className="font-['Fz_Poppins:Bold',sans-serif] text-[#01304e] text-[40px] tracking-[0.5px]">
                {service.name}
              </h1>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[18px] leading-[30px]">
                {service.shortDescription}
              </p>

              {/* Quick Info */}
              <div className="flex flex-wrap gap-[20px]">
                <div className="flex items-center gap-[10px] bg-[#ebf6fc] rounded-[12px] px-[20px] py-[12px]">
                  <DollarSign className="w-[20px] h-[20px] text-[#3fb5ff]" />
                  <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                    {service.price}
                  </span>
                </div>
                <div className="flex items-center gap-[10px] bg-[#ebf6fc] rounded-[12px] px-[20px] py-[12px]">
                  <Clock className="w-[20px] h-[20px] text-[#3fb5ff]" />
                  <span className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[15px]">
                    {service.duration}
                  </span>
                </div>
              </div>
            </div>

            {/* Service Image */}
            <div className="w-full h-[400px] rounded-[24px] overflow-hidden">
              <ImageWithFallback
                src={service.image}
                alt={service.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Overview */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[20px]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[28px] tracking-[0.5px]">
                Tổng quan
              </h2>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[28px]">
                {service.overview}
              </p>
            </div>

            {/* Benefits */}
            <div className="bg-gradient-to-br from-[#ebf6fc] to-[#d6edfa] rounded-[20px] p-[32px] space-y-[24px]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[28px] tracking-[0.5px]">
                Lợi ích
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[16px]">
                {service.benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-[12px] items-start">
                    <CheckCircle className="w-[24px] h-[24px] text-[#3fb5ff] flex-shrink-0 mt-[2px]" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[15px] leading-[24px]">
                      {benefit}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Process */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[32px]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[28px] tracking-[0.5px]">
                Quy trình thực hiện
              </h2>
              <div className="space-y-[24px]">
                {service.process.map((step, index) => (
                  <div key={index} className="flex gap-[20px]">
                    <div className="w-[48px] h-[48px] rounded-full bg-[#3fb5ff] text-[#fcfeff] flex items-center justify-center flex-shrink-0 font-['Fz_Poppins:SemiBold',sans-serif] text-[20px]">
                      {step.step}
                    </div>
                    <div className="flex-1 pt-[4px]">
                      <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[18px] mb-[8px]">
                        {step.title}
                      </h3>
                      <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[24px]">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Aftercare */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[32px] space-y-[24px]">
              <h2 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[28px] tracking-[0.5px]">
                Chăm sóc sau điều trị
              </h2>
              <ul className="space-y-[12px]">
                {service.aftercare.map((care, index) => (
                  <li key={index} className="flex gap-[12px] items-start">
                    <span className="w-[6px] h-[6px] bg-[#3fb5ff] rounded-full mt-[10px] flex-shrink-0" />
                    <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[15px] leading-[26px]">
                      {care}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - DoctorSidebar */}
          <div className="space-y-[24px]">
            {/* Booking Card */}
            <div className="bg-gradient-to-br from-[#3fb5ff] to-[#1e90c7] rounded-[20px] p-[28px] space-y-[24px] sticky top-[120px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[22px] tracking-[0.5px] text-center">
                Đặt lịch hẹn
              </h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#fcfeff] text-[15px] text-center leading-[24px]">
                Nhận tư vấn miễn phí từ đội ngũ bác sĩ chuyên môn cao
              </p>
              <Button
                onClick={() => onBooking(service.id)}
                className="w-full bg-[#fcfeff] text-[#3fb5ff] rounded-[15px] h-[52px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] hover:bg-[#fcfeff]/90 shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)]"
              >
                <Calendar className="w-[20px] h-[20px] mr-[8px]" />
                Chọn ngày giờ
              </Button>
              <div className="text-center border-t border-[#fcfeff]/30 pt-[20px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#fcfeff] text-[14px]">
                  Hoặc gọi trực tiếp
                </p>
                <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#fcfeff] text-[20px] mt-[8px]">
                  (123) 456-7890
                </p>
              </div>
            </div>

            {/* Related Services */}
            <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.08)] p-[24px] space-y-[20px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] tracking-[0.5px]">
                Dịch vụ liên quan
              </h3>
              <div className="space-y-[16px]">
                {relatedServices.map((relatedService) => (
                  <div
                    key={relatedService.id}
                    onClick={() => onServiceSelect(relatedService.id)}
                    className="group cursor-pointer"
                  >
                    <div className="flex gap-[12px] p-[12px] rounded-[12px] hover:bg-[#ebf6fc] transition-all">
                      <div className="w-[60px] h-[60px] rounded-[8px] overflow-hidden flex-shrink-0">
                        <ImageWithFallback
                          src={relatedService.image}
                          alt={relatedService.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[14px] mb-[4px] group-hover:text-[#3fb5ff] transition-colors">
                          {relatedService.name}
                        </h4>
                        <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#3fb5ff] text-[13px]">
                          {relatedService.price}
                        </p>
                      </div>
                    </div>
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
