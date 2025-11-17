import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Button } from '../ui/button';

interface DoctorCardProps {
  name: string;
  specialty: string;
  image: string;
  experience?: string;
  onViewProfile?: () => void;
}

export function DoctorCard({ name, specialty, image, experience, onViewProfile }: DoctorCardProps) {
  return (
    <div className="bg-[#fcfeff] rounded-[20px] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.1)] overflow-hidden hover:shadow-[0px_6px_20px_0px_rgba(63,181,255,0.3)] transition-all duration-300">
      {/* Doctor Image */}
      <div className="w-full h-[280px] overflow-hidden">
        <ImageWithFallback
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Doctor Info */}
      <div className="p-[24px] space-y-[16px]">
        <div className="space-y-[8px]">
          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[22px] tracking-[0.5px]">
            {name}
          </h3>
          <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#3fb5ff] text-[16px] tracking-[0.5px]">
            {specialty}
          </p>
          {experience && (
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#666666] text-[14px] tracking-[0.5px]">
              {experience}
            </p>
          )}
        </div>

        <Button
          onClick={onViewProfile}
          className="w-full bg-[#3fb5ff] text-[#fcfeff] rounded-[15px] h-[45px] font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] tracking-[0.5px] hover:bg-[#3fb5ff]/90 transition-all shadow-[0px_4px_4px_0px_rgba(0,0,0,0.15)]"
        >
          Xem hồ sơ
        </Button>
      </div>
    </div>
  );
}
