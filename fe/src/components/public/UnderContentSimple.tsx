import { Phone, Mail, Clock, Activity } from 'lucide-react';

export default function UnderContentSimple() {
  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[40px] md:gap-[30px]">
        {/* Contact */}
        <div className="bg-white rounded-[20px] border border-[#ebf6fc] p-[32px] text-center hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all duration-300">
          <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[20px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.3)]">
            <Phone className="w-[28px] h-[28px] text-white" />
          </div>
          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[16px]">
            Liên hệ
          </h3>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] mb-[8px]">
            +84 583891780
          </p>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px]">
            dentist@gmail.com
          </p>
        </div>

        {/* Opening Hours */}
        <div className="bg-white rounded-[20px] border border-[#ebf6fc] p-[32px] text-center hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all duration-300">
          <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[20px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.3)]">
            <Clock className="w-[28px] h-[28px] text-white" />
          </div>
          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[16px]">
            Mở cửa
          </h3>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] mb-[8px]">
            9h00 - 21h00
          </p>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px]">
            Tất cả các ngày trong tuần
          </p>
        </div>

        {/* Top Services */}
        <div className="bg-white rounded-[20px] border border-[#ebf6fc] p-[32px] text-center hover:shadow-[0px_4px_20px_0px_rgba(63,181,255,0.15)] transition-all duration-300">
          <div className="w-[56px] h-[56px] bg-gradient-to-br from-[#3fb5ff] to-[#1e8bc3] rounded-[16px] flex items-center justify-center mx-auto mb-[20px] shadow-[0px_4px_16px_0px_rgba(63,181,255,0.3)]">
            <Activity className="w-[28px] h-[28px] text-white" />
          </div>
          <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[20px] mb-[16px]">
            Dịch vụ hàng đầu
          </h3>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] mb-[8px]">
            Làm trắng răng
          </p>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] mb-[8px]">
            Chỉnh nha (Niềng răng)
          </p>
          <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px]">
            Bọc răng sứ
          </p>
        </div>
      </div>
    </div>
  );
}
