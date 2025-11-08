import svgPaths from "../../imports/svg-rgty3nojwf";

export function PatientFooter() {
  return (
    <div className="relative bg-[#d8f0ff] w-full min-h-[497px] flex flex-col" data-name="Footer Section">
      <div className="max-w-[1440px] w-full mx-auto px-[69px] py-[50px] pb-[60px]">
        {/* Logo */}
        <div className="flex gap-[9px] items-center mb-[50px]" data-name="Logo/1">
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p2d52d100} id="Vector 2" stroke="#002035" strokeWidth="12" />
            </svg>
          </div>
          <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px] w-[165px]">
            <p className="leading-[normal]">DentalCareX</p>
          </div>
        </div>

        {/* Footer Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[60px] mb-[40px]">
          {/* Company Info */}
          <div className="flex flex-col gap-[15px]">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] tracking-[-0.34px]">
              Phòng khám nha khoa DentalCareX
            </h3>
            <div className="flex flex-col gap-[20px]">
              <p className="font-['Roboto:Regular',sans-serif] text-[#333333] text-[14px] leading-[21px]">
                Giấy phép hoạt động khám bệnh, chữa bệnh số 2888/HNO-GPHĐ/CL1 do Sở Y tế Thành phố Hà Nội cấp ngày 23/03/2019.
              </p>
            </div>
          </div>

          {/* Opening Hours */}
          <div className="flex flex-col gap-[30px]">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px]">
              Giờ mở cửa
            </h3>
            <div className="flex flex-col gap-[0px]">
              <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] leading-[30px]">
                9h00 - 21h00
              </p>
              <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] leading-[30px]">
                Tất cả các ngày trong tuần
              </p>
            </div>
          </div>

          {/* Address & Contact */}
          <div className="flex flex-col gap-[47px]">
            {/* Address */}
            <div className="flex flex-col gap-[30px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px]">
                Địa chỉ
              </h3>
              <div className="flex flex-col gap-[15px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[25px]">
                  Tầng 2, TTTM Mandarin Garden 2, Phường Tân Mai, Quận Hoàng Mai, Hà Nội
                </p>
                <a 
                  href="https://maps.google.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[16px] text-center tracking-[-0.176px] underline hover:text-[#3fb5ff] transition-colors"
                >
                  View on Maps
                </a>
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-[30px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px]">
                Liên hệ
              </h3>
              <div className="flex flex-col gap-[6px] text-center">
                <a 
                  href="tel:+84583891780"
                  className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[18px] tracking-[-0.198px] hover:text-[#3fb5ff] transition-colors"
                >
                  +84 583891780
                </a>
                <a 
                  href="mailto:info@dentalcarex.com"
                  className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[16px] tracking-[-0.176px] hover:text-[#3fb5ff] transition-colors"
                >
                  info@dentalcarex.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="flex flex-col gap-[80px]">
            {/* Newsletter */}
            <div className="flex flex-col gap-[26px]">
              <div className="flex flex-col gap-[20px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[18px] tracking-[-0.198px]">
                  Gửi Email để nhận được thông tin mới nhất
                </p>
              </div>
              
              {/* Email Input */}
              <div className="relative">
                <div className="relative h-[59px] w-full rounded-[30px] border border-[#1e1e1e]">
                  <input
                    type="email"
                    placeholder="Email của bạn"
                    className="w-full h-full px-[20px] bg-transparent font-['Fz_Poppins:Regular',sans-serif] text-[#444444] text-[16px] rounded-[30px] outline-none"
                  />
                </div>
                <button className="absolute right-[7px] top-[7px] w-[67px] h-[45px] bg-[#3FB5FF] rounded-[22.5px] flex items-center justify-center hover:bg-[#1e8bc3] transition-colors">
                  <svg width="20" height="20" viewBox="0 0 67 45" fill="none">
                    <path d={svgPaths.p2b8b1880} fill="#1E1E1E" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex flex-col gap-[16px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px]">
                Theo dõi
              </h3>
              <div className="flex gap-[20px] justify-center">
                {/* Facebook */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="Facebook">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.p27bac000} fill="#1E1E1E" />
                  </svg>
                </a>
                
                {/* Twitter */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="Twitter">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.p89f1080} fill="#1E1E1E" />
                  </svg>
                </a>
                
                {/* YouTube */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="YouTube">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.pca50b00} fill="#1E1E1E" />
                  </svg>
                </a>
                
                {/* Pinterest */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="Pinterest">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.pd7d3b70} fill="#1E1E1E" />
                  </svg>
                </a>
                
                {/* LinkedIn */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="LinkedIn">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.p2c13c800} fill="#1E1E1E" />
                  </svg>
                </a>
                
                {/* TikTok */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="TikTok">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.pfb8ff00} fill="#1E1E1E" />
                  </svg>
                </a>
                
                {/* Instagram */}
                <a href="#" className="w-[32px] h-[32px] hover:opacity-70 transition-opacity" aria-label="Instagram">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d={svgPaths.p317ef00} fill="#1E1E1E" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
