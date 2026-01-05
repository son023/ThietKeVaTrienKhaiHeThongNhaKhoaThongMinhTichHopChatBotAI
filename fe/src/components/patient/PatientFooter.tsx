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
                href="https://www.google.com/maps/place/T%C3%B2a+Nh%C3%A0+Mandarin+Garden+2+T%C3%A2n+Mai/@20.9845849,105.8475139,782m/data=!3m2!1e3!4b1!4m6!3m5!1s0x3135ad0c54a2faf1:0x3ccf8b6f3e067dd1!8m2!3d20.9845849!4d105.8475139!16s%2Fg%2F11sf7n3trh?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D"
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
              <p
                className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[18px] tracking-[-0.198px]"
              >
                +84 583891780
              </p>
              <p
                className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[16px] tracking-[-0.176px]"
              >
                info@dentalcarex.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
