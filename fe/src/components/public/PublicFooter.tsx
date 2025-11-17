import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function PublicFooter() {
  return (
    <footer className="bg-[#d8f0ff] py-[50px] px-[69px] border-t border-black/10">
      <div className="container mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-[9px] mb-[42px]">
          <div className="w-[24px] h-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d="M17.499 6.00098L17.7031 6.01562H17.8057L17.8281 6.2334L17.9307 6.64551C17.9671 6.7918 18.016 7.18517 17.9941 7.78613C17.9851 8.03442 17.9647 8.25966 17.9443 8.44434C17.8173 8.71365 17.6829 8.98008 17.5479 9.22656C17.4365 9.42976 17.3335 9.60535 17.25 9.74316C17.2085 9.81172 17.1735 9.8678 17.1465 9.91016C17.1368 9.92533 17.1279 9.93775 17.1211 9.94824C16.7691 10.4425 16.4865 10.947 16.2617 11.4414C15.0559 10.5417 13.3534 9.7862 11.291 10.0293C9.78735 10.1798 8.58479 10.7405 7.64941 11.4209C7.35969 10.7539 7.03138 10.159 6.7168 9.68652L6.55078 9.4375L6.36133 9.20605L6.28418 9.10352C6.20872 8.99436 6.13732 8.86526 6.0791 8.73242C6.07067 8.71317 6.06433 8.69425 6.05762 8.67773C6.00509 8.17624 5.99323 7.73024 6.00293 7.37891C6.00874 7.16889 6.0217 7.00758 6.03223 6.90527C6.04112 6.81887 6.04589 6.79888 6.03906 6.83789L6.06836 6.70215L6.09668 6.49023C6.1173 6.33539 6.15954 6.17402 6.21484 6.01562H6.27441C6.63755 6.01562 6.94088 6.06552 7.14258 6.11523C7.17759 6.12386 7.20661 6.13375 7.23047 6.14062L7.58887 6.33496L8.2207 6.51562C11.2039 7.36893 14.0541 6.90708 15.4346 6.48828L15.959 6.3291L16.3633 6.12012C16.3693 6.1184 16.3761 6.11634 16.3838 6.11426C16.4688 6.09135 16.6025 6.06365 16.7783 6.04102C16.9511 6.0188 17.1247 6.00644 17.2754 6.00195C17.4328 5.99727 17.5142 6.00202 17.499 6.00098Z" stroke="#002035" strokeWidth="12" />
            </svg>
          </div>
          <span className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#01304e] text-[24px] tracking-[0.5px]">
            DentalCareX
          </span>
        </div>

        <div className="grid grid-cols-4 gap-[60px]">
          {/* About */}
          <div className="space-y-[15px]">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] tracking-[-0.34px]">
              Phòng khám nha khoa DentalCareX
            </h3>
            <p className="font-['Roboto:Regular',sans-serif] text-[#333333] text-[14px] leading-[21px]">
              Giấy phép hoạt động khám bệnh, chữa bệnh số 2888/HNO-GPHĐ/CL1 do Sở Y tế Thành phố Hà Nội cấp ngày 23/03/2019.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-[30px]">
            <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px]">
              Giờ mở cửa
            </h3>
            <div className="font-['Fz_Poppins:Medium',sans-serif] text-[#333333] text-[16px] tracking-[0.5px] space-y-0">
              <p className="leading-[30px]">9h00 - 21h00</p>
              <p className="leading-[30px]">Tất cả các ngày trong tuần</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-[30px]">
            <div className="space-y-[30px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] tracking-[-0.34px]">
                Địa chỉ
              </h3>
              <div className="space-y-[15px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#333333] text-[16px] leading-[25px]">
                  Tầng 2, TTTM Mandarin Garden 2, Phường Tân Mai, Quận Hoàng Mai, Hà Nội
                </p>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[16px] tracking-[-0.176px] underline cursor-pointer">
                  View on Maps
                </p>
              </div>
            </div>

            <div className="space-y-[30px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] tracking-[-0.34px]">
                Liên hệ
              </h3>
              <div className="space-y-[6px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[18px] text-center tracking-[-0.198px]">
                  (123) 456-7890
                </p>
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[16px] text-center tracking-[-0.176px]">
                  info@dentcareX.com
                </p>
              </div>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-[80px]">
            <div className="space-y-[26px]">
              <div className="space-y-[20px]">
                <p className="font-['Fz_Poppins:Regular',sans-serif] text-[#1e1e1e] text-[18px] tracking-[-0.198px]">
                  Gửi Email để nhận được thông tin mới nhất
                </p>
              </div>

              <div className="relative">
                <Input
                  placeholder="Email của bạn"
                  className="h-[59px] rounded-[30px] border-[#1e1e1e] pl-[20px] pr-[80px] font-['Fz_Poppins:Regular',sans-serif] text-[21px] tracking-[-0.357px]"
                />
                <Button className="absolute right-[7px] top-[7px] h-[45px] w-[67px] bg-[#3fb5ff] hover:bg-[#3fb5ff]/90 rounded-[22.5px]">
                  <svg width="24" height="20" viewBox="0 0 24 20" fill="none">
                    <path d="M18.7329 14.75L18.7785 12.0917L38.7442 12.434L32.6385 6.11526L34.5562 4.26231L43.8213 13.8506L34.233 23.1157L32.38 21.198L38.6987 15.0923L18.7329 14.75Z" fill="#1E1E1E" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="space-y-[16px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px]">
                Theo dõi
              </h3>
              <div className="flex items-center gap-[12px]">
                <div className="w-[32px] h-[32px] text-[#1e1e1e] cursor-pointer hover:text-[#3fb5ff]">
                  <svg viewBox="0 0 32 32" fill="currentColor">
                    <path d="M13.3333 0C6 0 0 5.98667 0 13.36C0 20.0267 4.88 25.56 11.2533 26.56V17.2267H7.86667V13.36H11.2533V10.4133C11.2533 7.06667 13.24 5.22667 16.2933 5.22667C17.7467 5.22667 19.2667 5.48 19.2667 5.48V8.77333H17.5867C15.9333 8.77333 15.4133 9.8 15.4133 10.8533V13.36H19.12L18.52 17.2267H15.4133V26.56C18.5553 26.0638 21.4163 24.4607 23.4799 22.0401C25.5435 19.6195 26.6738 16.5409 26.6667 13.36C26.6667 5.98667 20.6667 0 13.3333 0Z" />
                  </svg>
                </div>
                {/* Add more social icons as needed */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
