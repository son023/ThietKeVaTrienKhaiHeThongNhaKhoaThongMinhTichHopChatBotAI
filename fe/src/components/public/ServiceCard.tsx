import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';
import { ArrowRight } from 'lucide-react';

interface ServiceCardProps {
  name: string;
  description: string;
  image: string;
  icon?: React.ReactNode;
  price?: string;
  onLearnMore?: () => void;
}

export function ServiceCard({ name, description, image, icon, price, onLearnMore }: ServiceCardProps) {
  return (
    <div 
      onClick={onLearnMore}
      className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.3)] transition-all duration-300 group cursor-pointer"
    >
      {/* Service Image */}
      <div className="w-full h-[200px] overflow-hidden relative">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {icon && (
          <div className="absolute top-[16px] left-[16px] w-[48px] h-[48px] bg-[#3fb5ff] rounded-[12px] flex items-center justify-center text-[#fcfeff] shadow-lg">
            {icon}
          </div>
        )}
      </div>

      {/* Service Info */}
      <div className="p-[24px] space-y-[16px]">
        <div className="space-y-[8px]">
          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] tracking-[0.5px]">
            {name}
          </h3>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[15px] leading-[24px] line-clamp-3">
            {description}
          </p>
        </div>

        {price && (
          <div className="flex items-baseline gap-[8px]">
            <span className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px]">Từ</span>
            <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#3fb5ff] text-[20px]">{price}</span>
          </div>
        )}

        <Button
          onClick={onLearnMore}
          variant="ghost"
          className="w-full justify-between text-[#3fb5ff] hover:text-[#3fb5ff] hover:bg-[#ebf6fc] rounded-[12px] h-[44px] font-['Fz_Poppins:Medium',sans-serif] text-[15px] tracking-[0.5px] group-hover:bg-[#ebf6fc]"
        >
          Tìm hiểu thêm
          <ArrowRight className="w-[18px] h-[18px] group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
