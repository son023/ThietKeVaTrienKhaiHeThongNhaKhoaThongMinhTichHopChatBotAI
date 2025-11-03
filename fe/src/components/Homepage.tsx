import svgPaths from "../imports/svg-5i19ya4t2t";
import imgThumbnail1 from "figma:asset/aa583c269c00ed9fb1e2547ba8d8246ea63e161a.png";
import imgDoctor31 from "figma:asset/6623418598ca38c3b0c01ecc918e4af9b46f446a.png";
import imgDoctor11 from "figma:asset/109b509800f5c3abb13b80b15d8c9727c9482514.png";
import imgDoctor61 from "figma:asset/9d67e25944c4c47db83256c71e8889c71787e185.png";
import img1 from "figma:asset/8a417521017fa4eb7d8b72d33ecb84aa0b46de00.png";
import img4 from "figma:asset/24b132b1edea1faf31c6b6cb20412e1d671749a0.png";
import imgPortraitHappyManShowingThumbUpOnPinkBackgr20231127051221Utc4 from "figma:asset/2468ceb976621e67113fdf99a6994a6b650f88e6.png";
import imgWomanSmileToCamera20231127053322Utc1 from "figma:asset/aa89a3920bf9d1225f218f78f15e3a42fb485ef0.png";
import imgCloseupPortraitOfHappyArabicGuySmilingAtCa20231127051731Utc1 from "figma:asset/85c17a2e34e89782394a3f7cf38edf5531c4893c.png";
import imgHandsomeArabGuyChillingAtHomeSmilingAtCam20231127044927Utc1 from "figma:asset/d4641458e48571d959185fba8b619499c0dda6c9.png";
import { img, img2, img3, img5, img6, img7, imgPortraitHappyManShowingThumbUpOnPinkBackgr20231127051221Utc3 } from "../imports/svg-x7oly";

interface HomepageProps {
  onNavigateToLogin: () => void;
  onNavigateToSignUp: () => void;
  onNavigateToDoctorInfo?: () => void;
}

export function Homepage({ onNavigateToLogin, onNavigateToSignUp, onNavigateToDoctorInfo }: HomepageProps) {
  return (
    <div className="bg-[#fcfeff] flex flex-col items-center relative w-full min-h-screen overflow-x-hidden" data-name="Homepage">
      {/* Header */}
      <div className="bg-[#fcfeff] h-[104px] relative shrink-0 w-full max-w-[1440px] sticky top-0 z-50 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.05)]" data-name="Header/1">
        <div className="absolute content-stretch flex font-['Fz_Poppins:SemiBold',sans-serif] gap-[30px] h-[64px] items-center justify-center leading-[0] left-[calc(50%-20px)] not-italic text-[#01304e] text-[16px] text-center top-[20px] tracking-[0.5px] translate-x-[-50%] w-[734.4px]" data-name="Header">
          <div className="flex flex-col h-full justify-center relative shrink-0 w-[108px] cursor-pointer hover:text-[#3fb5ff] transition-colors">
            <p className="leading-[normal]">Trang chủ</p>
          </div>
          <div className="flex flex-col h-full justify-center relative shrink-0 w-[79px] cursor-pointer hover:text-[#3fb5ff] transition-colors">
            <p className="leading-[normal]">Dịch vụ</p>
          </div>
          <div className="flex flex-col h-full justify-center relative shrink-0 w-[68px] cursor-pointer hover:text-[#3fb5ff] transition-colors">
            <p className="leading-[normal]">Bác sĩ</p>
          </div>
          <div className="flex flex-col h-full justify-center relative shrink-0 w-[143px] cursor-pointer hover:text-[#3fb5ff] transition-colors">
            <p className="leading-[normal]">Về chúng tôi</p>
          </div>
          <div className="flex flex-col h-full justify-center relative shrink-0 w-[74px] cursor-pointer hover:text-[#3fb5ff] transition-colors">
            <p className="leading-[normal]">Liên hệ</p>
          </div>
        </div>
        
        {/* Logo */}
        <div className="absolute content-stretch flex gap-[9px] h-[64px] items-center left-[80px] top-[20px]" data-name="Logo">
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p2d52d100} id="Vector 2" stroke="var(--stroke-0, #002035)" strokeWidth="12" />
            </svg>
          </div>
          <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px] w-[165px]">
            <p className="leading-[normal]">DentalCareX</p>
          </div>
        </div>
        
        {/* Auth Buttons */}
        <button
          onClick={onNavigateToLogin}
          className="absolute bg-[#fcfeff] box-border content-stretch flex gap-[10px] h-[50px] items-center justify-center overflow-clip p-[10px] right-[212px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px] hover:bg-[#f0f0f0] transition-colors cursor-pointer" 
          data-name="Button/2"
        >
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1882c3] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng nhập</p>
          </div>
        </button>
        
        <button
          onClick={onNavigateToSignUp}
          className="absolute bg-[#3fb5ff] box-border content-stretch flex gap-[10px] h-[51px] items-center justify-center overflow-clip p-[10px] right-[51px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px] hover:bg-[#3fb5ff]/90 transition-colors cursor-pointer" 
          data-name="Button/1"
        >
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng ký</p>
          </div>
        </button>
      </div>

      {/* Hero Section */}
      <div className="content-stretch flex flex-col items-center justify-end relative w-full max-w-[1440px]" data-name="Header Section">
        <div className="bg-[#ecf8ff] box-border content-stretch flex gap-[65px] h-[683px] items-center justify-center w-full overflow-clip pl-[20px] pr-[10px] py-[10px]" data-name="Content">
          {/* Hero Image */}
          <div className="absolute h-[546px] left-[calc(50%-297.5px)] overflow-clip top-[64px] translate-x-[-50%] w-[663px]" data-name="Image">
            <div className="absolute h-[428px] left-[89px] rounded-[30px] top-[59px] w-[520px]" data-name="thumbnail 1">
              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none rounded-[30px] size-full" src={imgThumbnail1} />
            </div>
          </div>
          
          {/* Hero Content */}
          <div className="absolute box-border content-stretch flex flex-col gap-[51px] h-[621px] items-start left-[calc(50%+320px)] overflow-clip px-[10px] py-[89px] top-[31px] translate-x-[-50%] w-[546px]" data-name="Main content">
            <div className="flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#01304e] text-[48px] tracking-[0.5px] w-[min-content]">
              <p className="leading-[normal]">Kiến tạo nụ cười hoàn hảo cho bạn</p>
            </div>
            <div className="[text-shadow:rgba(0,0,0,0.25)_0px_3px_4px] flex flex-col font-['Fz_Poppins:Regular',sans-serif] justify-end leading-[0] min-w-full not-italic relative shrink-0 text-[#333333] text-[0px] tracking-[0.5px] w-[min-content]">
              <p className="leading-[normal] text-[16px]">
                <span>Kết hợp </span>
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] not-italic text-[#333333]">Kinh nghiệm chuyên môn</span>
                <span> và </span>
                <span className="font-['Fz_Poppins:SemiBold',sans-serif] not-italic text-[#333333]">Công nghệ hiện đại</span>
                <span> để mang đến nụ cười rạng rỡ, hoàn toàn phù hợp với bạn.</span>
              </p>
            </div>
            
            {/* CTA Buttons */}
            <div className="h-[76px] relative shrink-0 w-full" data-name="Group button">
              <div className="flex flex-row items-center overflow-clip rounded-[inherit] size-full">
                <div className="box-border content-stretch flex gap-[30px] h-[76px] items-center pl-0 pr-[39px] py-[7px] relative w-full">
                  <button 
                    onClick={onNavigateToSignUp}
                    className="bg-[#3fb5ff] box-border content-stretch flex gap-[10px] h-[56px] items-center justify-center overflow-clip p-[10px] relative rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[224px] hover:bg-[#3fb5ff]/90 transition-colors cursor-pointer" 
                    data-name="Button/1"
                  >
                    <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
                      <p className="leading-[100.165%]">Đặt lịch ngay</p>
                    </div>
                  </button>
                  <button className="bg-[#fcfeff] box-border content-stretch flex gap-[10px] h-[56px] items-center justify-center overflow-clip p-[10px] relative rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[224px] hover:bg-[#f0f0f0] transition-colors cursor-pointer" data-name="Button/2">
                    <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1882c3] text-[16px] text-center">
                      <p className="leading-[100.165%]">Xem chi tiết</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Social Media Icons */}
            <div className="content-stretch flex gap-[17px] items-center relative shrink-0" data-name="MXH">
              <div className="overflow-clip relative shrink-0 size-[32px] cursor-pointer hover:opacity-70 transition-opacity" data-name="mdi:facebook">
                <div className="absolute inset-[8.5%_8.33%]" data-name="Vector">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 27">
                    <path d={svgPaths.p33da0d80} fill="var(--fill-0, #01304E)" id="Vector" />
                  </svg>
                </div>
              </div>
              <div className="h-[22.667px] relative shrink-0 w-[27.893px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 28 23">
                  <path d={svgPaths.p34651300} fill="var(--fill-0, #01304E)" id="Vector" />
                </svg>
              </div>
              <div className="h-[18.667px] relative shrink-0 w-[26.667px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 19">
                  <path d={svgPaths.p3449c380} fill="var(--fill-0, #01304E)" id="Vector" />
                </svg>
              </div>
              <div className="relative shrink-0 size-[26.667px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 27">
                  <path d={svgPaths.p36095400} fill="var(--fill-0, #01304E)" id="Vector" />
                </svg>
              </div>
              <div className="relative shrink-0 size-[24px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                  <path d={svgPaths.p2836d300} fill="var(--fill-0, #01304E)" id="Vector" />
                </svg>
              </div>
              <div className="h-[24px] relative shrink-0 w-[20.907px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 24">
                  <path d={svgPaths.p8215b80} fill="var(--fill-0, #01304E)" id="Vector" />
                </svg>
              </div>
              <div className="relative shrink-0 size-[26.667px] cursor-pointer hover:opacity-70 transition-opacity" data-name="Vector">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 27 27">
                  <path d={svgPaths.p18ebca80} fill="var(--fill-0, #01304E)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Info Section */}
        <div className="box-border gap-[30px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[301px] w-full max-w-[1440px] overflow-clip p-[10px]" data-name="Under Content">
          {/* Contact */}
          <div className="relative">
            <div className="absolute box-border content-stretch flex flex-col gap-[15px] h-[189px] items-center justify-center leading-[0] left-[28.86%] not-italic overflow-clip right-[7.72%] top-[46px] tracking-[0.5px]">
              <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[21px] justify-end relative shrink-0 text-[#01304e] text-[20px] w-full">
                <p className="leading-[normal]">Liên hệ</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">+84 583891780</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">dentist@gmail.com</p>
              </div>
            </div>
            <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[189px] items-start left-[35px] px-0 py-[70px] top-[46px] w-[95.833px]">
              <div className="flex items-center justify-center relative shrink-0">
                <div className="flex-none scale-y-[-100%]">
                  <div className="relative size-[48px]" data-name="icon">
                    <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 48 48">
                      <g id="icon">
                        <path d={svgPaths.p3bef7700} fill="var(--fill-0, #3FB5FF)" id="path34" />
                        <path d={svgPaths.p1a184900} fill="var(--fill-0, white)" id="path36" />
                      </g>
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Opening Hours */}
          <div className="relative">
            <div className="absolute content-stretch flex flex-col gap-[15px] h-[199px] items-center justify-center leading-[0] left-[27.21%] not-italic overflow-clip right-[4.41%] top-[41px] tracking-[0.5px]">
              <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[21px] justify-end relative shrink-0 text-[#01304e] text-[20px] w-full">
                <p className="leading-[normal]">Mở cửa</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">9h00 - 21h00</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">Tất cả các ngày trong tuần</p>
              </div>
            </div>
            <div className="absolute h-[199px] left-[20px] top-[41px] w-[103.333px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 104 199">
                <g id="Frame 859">
                  <path d={svgPaths.p20fb1880} fill="var(--fill-0, #3FB5FF)" id="path3" />
                </g>
              </svg>
            </div>
          </div>
          
          {/* Services */}
          <div className="relative">
            <div className="absolute content-stretch flex flex-col gap-[15px] h-[199px] items-center justify-center leading-[0] left-[29.3%] not-italic overflow-clip right-[8.6%] top-[41px] tracking-[0.5px]">
              <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end relative shrink-0 text-[#01304e] text-[20px] w-full">
                <p className="leading-[normal]">Dịch vụ hàng đầu</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">Làm trắng răng</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">Chỉnh nha (Niềng răng)</p>
              </div>
              <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-end relative shrink-0 text-[#333333] text-[16px] w-full">
                <p className="leading-[30px]">Bọc răng sứ</p>
              </div>
            </div>
            <div className="absolute h-[199px] left-[39px] top-[41px] w-[93.833px]">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 94 199">
                <g id="Frame 859">
                  <path d={svgPaths.p740e1c0} id="Vector 3" stroke="var(--stroke-0, #63BFF5)" strokeWidth="20" />
                </g>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Doctors Section */}
      <div className="box-border w-full max-w-[1440px] pb-[60px] pt-[80px] px-[60px]" data-name="Doctors Section">
        {/* Title */}
        <div className="box-border content-stretch flex gap-[10px] h-[92.5px] items-start justify-center overflow-clip px-[55px] py-[46px] w-full" data-name="Title doctor">
          <div className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#002035] text-[36px] text-nowrap tracking-[0.5px]">
            <p className="leading-[normal] whitespace-pre">ĐỘI NGŨ BÁC SĨ</p>
          </div>
        </div>

        {/* Doctor Info */}
        <div className="flex gap-[40px] items-center justify-center mt-[40px]">
          {/* Image */}
          <div className="bg-[#d8f0ff] h-[490px] overflow-clip rounded-[30px] w-[454.545px]">
            <div className="h-[712px] relative w-[469px] ml-[18.73px] mt-[-28px]">
              <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor11} />
            </div>
          </div>
          
          {/* Info */}
          <div className="bg-[#d8f0ff] box-border content-stretch flex flex-col gap-[25px] h-[490px] items-start justify-center overflow-clip px-[44px] py-[36px] rounded-[30px] w-[578.182px]">
            <div className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px] w-[378px]">
              <p className="leading-[normal]">PHẠM THỊ NGỌC MAI</p>
            </div>
            <div className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#01304e] text-[20px] tracking-[0.5px] w-[510px]">
              <p className="leading-[normal]">Bác sĩ chuyên khoa Chỉnh nha</p>
            </div>
            <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#333333] text-[0px] tracking-[0.5px] w-[min-content]">
              <p className="leading-[normal] text-[16px]">
                <span>Đã có </span>
                <span className="font-['Fz_Poppins:Bold',sans-serif] not-italic">8 năm kinh nghiệm</span>
                <span> trong lĩnh vựa </span>
                <span className="font-['Fz_Poppins:Bold',sans-serif] not-italic">Chỉnh nha (Niềng răng)</span>
              </p>
            </div>
            <div className="flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#333333] text-[16px] tracking-[0.5px] w-[min-content]">
              <p className="leading-[normal]">Chứng chỉ chuyên môn tiêu biểu:</p>
            </div>
            <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#333333] text-[16px] tracking-[0.5px] w-[min-content]">
              <ul>
                <li className="list-disc ms-[24px]">
                  <span className="leading-[30px]">Chứng chỉ Chỉnh nha và Khớp cắn cơ bản & nâng cao (Bệnh viện Răng Hàm Mặt Trung ương).</span>
                </li>
              </ul>
            </div>
            {/* Buttons */}
            <div className="content-stretch flex gap-[25px] h-[78px] items-center justify-center overflow-clip relative shrink-0 w-[448px]">
              <button className="basis-0 bg-[#3fb5ff] box-border content-stretch flex gap-[10px] grow h-[55px] items-center justify-center min-h-px min-w-px overflow-clip relative rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 hover:bg-[#3fb5ff]/90 transition-colors cursor-pointer">
                <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[41px] justify-center leading-[0] not-italic relative shrink-0 text-[20px] text-center text-white tracking-[0.5px] w-[211px]">
                  <p className="leading-[normal]">Đặt lịch</p>
                </div>
              </button>
              <button 
                onClick={onNavigateToDoctorInfo}
                className="basis-0 bg-[#fcfeff] box-border content-stretch flex gap-[10px] grow h-[55px] items-center justify-center min-h-px min-w-px overflow-clip relative rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 hover:bg-[#f0f0f0] transition-colors cursor-pointer"
              >
                <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-[61px] justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#3fb5ff] text-[20px] text-center tracking-[0.5px]">
                  <p className="leading-[normal]">Chi tiết</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Doctor Slider */}
        <div className="flex gap-[40px] items-center justify-center mt-[80px] relative">
          {/* Arrow Left */}
          <button className="relative shrink-0 size-[86px] cursor-pointer hover:opacity-80 transition-opacity">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 86 86">
              <g id="ic_arrow_left 1">
                <rect fill="var(--fill-0, #F5F5DC)" height="86" rx="43" width="86" />
                <path d={svgPaths.p1f70ce00} fill="var(--fill-0, #05619A)" id="Vector" />
              </g>
            </svg>
          </button>

          {/* Doctor Cards */}
          <div className="flex gap-[40px] items-center justify-center">
            {/* Doctor 1 */}
            <div className="bg-[#afe0ff] h-[357.5px] rounded-[30px] w-[330.909px] border-[#1882c3] border-[10px] border-solid overflow-hidden">
              <div className="h-[357.5px] overflow-clip relative rounded-[inherit] w-[330.909px]">
                <div className="absolute aspect-[711/1080] left-[12.8%] right-[2.58%] top-[0.5px]">
                  <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor11} />
                </div>
              </div>
            </div>

            {/* Doctor 2 */}
            <div className="bg-[#afe0ff] h-[357.5px] rounded-[30px] w-[330.909px] border-[#3fb5ff] border-[10px] border-solid overflow-hidden">
              <div className="h-[357.5px] overflow-clip relative rounded-[inherit] w-[330.909px]">
                <div className="absolute aspect-[360/360] left-[-3.02%] right-[-5.77%] top-[18px]">
                  <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor31} />
                </div>
              </div>
            </div>

            {/* Doctor 3 */}
            <div className="bg-[#afe0ff] h-[357.5px] rounded-[30px] w-[330.909px] border-[#3fb5ff] border-[10px] border-solid overflow-hidden">
              <div className="h-[357.5px] overflow-clip relative rounded-[inherit] w-[330.909px]">
                <div className="absolute aspect-[280/289] left-[5.3%] right-[7.06%] top-[48.5px]">
                  <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor61} />
                </div>
              </div>
            </div>
          </div>

          {/* Arrow Right */}
          <button className="relative shrink-0 size-[86px] cursor-pointer hover:opacity-80 transition-opacity">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 86 86">
              <g id="ic_arrow_right 1">
                <rect fill="var(--fill-0, #F5F5DC)" height="86" rx="43" width="86" />
                <path d={svgPaths.p19939200} fill="var(--fill-0, #05619A)" id="Vector" />
              </g>
            </svg>
          </button>
        </div>
      </div>

      {/* Services Section */}
      <div className="w-full max-w-[1440px] py-[80px] px-[60px]" data-name="Services Section">
        <div className="flex flex-col items-center gap-[40px]">
          {/* Title */}
          <div className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic text-[#01304e] text-[36px] text-nowrap tracking-[0.5px]">
            <p className="leading-[normal] whitespace-pre">Các loại dịch vụ</p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-3 gap-[30px] w-full">
            {/* Service 1 */}
            <div className="bg-[#d8f0ff] rounded-[20px] p-[30px] flex flex-col gap-[20px] hover:shadow-lg transition-shadow">
              <div className="h-[200px] bg-white rounded-[15px] overflow-hidden">
                <img src={img1} alt="Service" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">Nha khoa tổng quát</h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                Khám và tư vấn tổng quát về sức khỏe răng miệng
              </p>
            </div>

            {/* Service 2 */}
            <div className="bg-[#d8f0ff] rounded-[20px] p-[30px] flex flex-col gap-[20px] hover:shadow-lg transition-shadow">
              <div className="h-[200px] bg-white rounded-[15px] overflow-hidden">
                <img src={img4} alt="Service" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">Chỉnh nha</h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                Niềng răng, chỉnh nha để có nụ cười hoàn hảo
              </p>
            </div>

            {/* Service 3 */}
            <div className="bg-[#d8f0ff] rounded-[20px] p-[30px] flex flex-col gap-[20px] hover:shadow-lg transition-shadow">
              <div className="h-[200px] bg-white rounded-[15px] overflow-hidden">
                <img src={img} alt="Service" className="w-full h-full object-cover" />
              </div>
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[20px] text-[#01304e]">Làm trắng răng</h3>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                Công nghệ làm trắng răng an toàn và hiệu quả
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="w-full max-w-[1440px] py-[80px] px-[60px] bg-[#ecf8ff]" data-name="Testimonials Section">
        <div className="flex flex-col items-center gap-[40px]">
          {/* Title */}
          <div className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic text-[#01304e] text-[36px] text-nowrap tracking-[0.5px]">
            <p className="leading-[normal] whitespace-pre">Khách hàng nói về chúng tôi</p>
          </div>

          {/* Testimonial Cards */}
          <div className="grid grid-cols-4 gap-[30px] w-full">
            <div className="bg-white rounded-[20px] p-[25px] flex flex-col gap-[15px] items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <img src={imgPortraitHappyManShowingThumbUpOnPinkBackgr20231127051221Utc4} alt="Customer" className="w-full h-full object-cover" />
              </div>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                "Dịch vụ tuyệt vời, bác sĩ tận tâm!"
              </p>
              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">Nguyễn Văn A</p>
            </div>

            <div className="bg-white rounded-[20px] p-[25px] flex flex-col gap-[15px] items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <img src={imgWomanSmileToCamera20231127053322Utc1} alt="Customer" className="w-full h-full object-cover" />
              </div>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                "Răng tôi đẹp hơn rất nhiều!"
              </p>
              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">Trần Thị B</p>
            </div>

            <div className="bg-white rounded-[20px] p-[25px] flex flex-col gap-[15px] items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <img src={imgCloseupPortraitOfHappyArabicGuySmilingAtCa20231127051731Utc1} alt="Customer" className="w-full h-full object-cover" />
              </div>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                "Chuyên nghiệp và chu đáo!"
              </p>
              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">Lê Văn C</p>
            </div>

            <div className="bg-white rounded-[20px] p-[25px] flex flex-col gap-[15px] items-center text-center hover:shadow-lg transition-shadow">
              <div className="w-[100px] h-[100px] rounded-full overflow-hidden">
                <img src={imgHandsomeArabGuyChillingAtHomeSmilingAtCam20231127044927Utc1} alt="Customer" className="w-full h-full object-cover" />
              </div>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                "Tôi rất hài lòng với kết quả!"
              </p>
              <p className="font-['Fz_Poppins:SemiBold',sans-serif] text-[16px] text-[#01304e]">Phạm Văn D</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full bg-[#d8f0ff] py-[60px] px-[69px]" data-name="Footer Section">
        <div className="max-w-[1440px] mx-auto flex flex-col gap-[40px]">
          {/* Logo and Info */}
          <div className="grid grid-cols-4 gap-[40px]">
            {/* Logo */}
            <div className="flex flex-col gap-[20px]">
              <div className="content-stretch flex gap-[9px] items-center">
                <div className="relative shrink-0 size-[24px]">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
                    <path d={svgPaths.p2d52d100} id="Vector 2" stroke="var(--stroke-0, #002035)" strokeWidth="12" />
                  </svg>
                </div>
                <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px] w-[165px]">
                  <p className="leading-[normal]">DentalCareX</p>
                </div>
              </div>
              <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] leading-[1.6]">
                Nha khoa uy tín, chất lượng hàng đầu Việt Nam
              </p>
            </div>

            {/* Quick Links */}
            <div className="flex flex-col gap-[15px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">Liên kết nhanh</h3>
              <ul className="flex flex-col gap-[10px]">
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] cursor-pointer hover:text-[#3fb5ff] transition-colors">Trang chủ</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] cursor-pointer hover:text-[#3fb5ff] transition-colors">Dịch vụ</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] cursor-pointer hover:text-[#3fb5ff] transition-colors">Bác sĩ</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333] cursor-pointer hover:text-[#3fb5ff] transition-colors">Liên hệ</li>
              </ul>
            </div>

            {/* Services */}
            <div className="flex flex-col gap-[15px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">Dịch vụ</h3>
              <ul className="flex flex-col gap-[10px]">
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">Nha khoa tổng quát</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">Chỉnh nha</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">Làm trắng răng</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">Implant</li>
              </ul>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-[15px]">
              <h3 className="font-['Fz_Poppins:SemiBold',sans-serif] text-[18px] text-[#01304e]">Liên hệ</h3>
              <ul className="flex flex-col gap-[10px]">
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">+84 583891780</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">dentist@gmail.com</li>
                <li className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">123 Nguyễn Văn Linh, Q7, TP.HCM</li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-[#3fb5ff]/20 pt-[30px] text-center">
            <p className="font-['Fz_Poppins:Regular',sans-serif] text-[14px] text-[#333333]">
              © 2025 DentalCareX. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
