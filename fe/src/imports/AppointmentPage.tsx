import svgPaths from "./svg-rgty3nojwf";

/**
 * @figmaAssetKey 488899ae9870e43799d3092eddb75564f5e60c9a
 */
function Header2({ className }: { className?: string }) {
  return (
    <div className={className} data-name="Header/2">
      <div className="absolute box-border content-stretch flex gap-[15px] h-[64px] items-center justify-end pl-[6px] pr-0 py-[30px] right-[35px] rounded-[15px] top-[20px]" data-name="Button DangNhap">
        <div className="bg-[#ecf8ff] overflow-clip relative rounded-[100px] shrink-0 size-[56px]">
          <div className="absolute aspect-[44/44] bottom-[21.43%] left-1/2 top-[21.43%] translate-x-[-50%]" data-name="Solid/Status/Notification">
            <div className="absolute inset-[8.33%_18.4%_9.38%_18.4%]" data-name="Icon">
              <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 21 27">
                <path clipRule="evenodd" d={svgPaths.pae7b300} fill="var(--fill-0, #002035)" fillRule="evenodd" id="Icon" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-[#ecf8ff] overflow-clip relative rounded-[100px] shrink-0 size-[56px]">
          <div className="absolute aspect-[21.6774/21.6774] bottom-[30.64%] flex items-center justify-center left-1/2 top-[30.64%] translate-x-[-50%]">
            <div className="flex-none rotate-[270deg] size-[21.677px]">
              <div className="bg-[#002035] overflow-clip relative rounded-[100px] size-full" data-name="ic_arrow_left 2">
                <div className="absolute inset-[23.29%_35.1%_23.43%_31.76%]" data-name="Vector">
                  <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 8 12">
                    <path d={svgPaths.pfaecf00} fill="var(--fill-0, #ECF8FF)" id="Vector" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
      <div className="absolute content-stretch flex font-['Fz_Poppins:SemiBold',sans-serif] gap-[30px] h-[64px] items-center justify-center leading-[0] left-1/2 not-italic text-[#01304e] text-[16px] text-center top-[20px] tracking-[0.5px] translate-x-[-50%] w-[734.4px]" data-name="Header">
        <div className="flex flex-col h-full justify-center relative shrink-0 w-[108px]">
          <p className="leading-[normal]">Trang chủ</p>
        </div>
        <div className="flex flex-col h-full justify-center relative shrink-0 w-[79px]">
          <p className="leading-[normal]">Lịch hẹn</p>
        </div>
        <div className="flex flex-col h-full justify-center relative shrink-0 w-[98px]">
          <p className="leading-[normal]">Thanh toán</p>
        </div>
        <div className="flex flex-col h-full justify-center relative shrink-0 w-[143px]">
          <p className="leading-[normal]">Hồ sơ bệnh án</p>
        </div>
        <div className="flex flex-col h-full justify-center relative shrink-0 w-[74px]">
          <p className="leading-[normal]">Chatbot</p>
        </div>
      </div>
    </div>
  );
}

function Frame() {
  return (
    <div className="content-stretch flex flex-col font-['Fz_Poppins:Medium',sans-serif] items-start leading-[0] not-italic relative shrink-0 text-[#333333] text-[16px] tracking-[0.5px]" data-name="Frame">
      <div className="flex flex-col justify-end relative shrink-0 w-[310px]">
        <p className="leading-[30px]">9h00 - 21h00</p>
      </div>
      <div className="flex flex-col justify-end relative shrink-0 w-[310px]">
        <p className="leading-[30px]">Tất cả các ngày trong tuần</p>
      </div>
    </div>
  );
}

function Frame257() {
  return (
    <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-[241px]">
      <Frame />
    </div>
  );
}

function Frame258() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[calc(50%-144.5px)] top-0 translate-x-[-50%] w-[241px]">
      <p className="font-['Fz_Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center text-nowrap tracking-[-0.34px] whitespace-pre">Giờ mở cửa</p>
      <Frame257 />
    </div>
  );
}

function Frame1() {
  return (
    <div className="content-stretch flex flex-col font-['Fz_Poppins:Regular',sans-serif] gap-[15px] items-start not-italic relative shrink-0 text-[16px]" data-name="Frame">
      <p className="leading-[25px] relative shrink-0 text-[#333333] w-[245px]">Tầng 2, TTTM Mandarin Garden 2, Phường Tân Mai, Quận Hoàng Mai, Hà Nội</p>
      <p className="[text-decoration-skip-ink:none] [text-underline-position:from-font] decoration-solid leading-[normal] relative shrink-0 text-[#1e1e1e] text-center text-nowrap tracking-[-0.176px] underline whitespace-pre">{`View on Maps `}</p>
    </div>
  );
}

function Frame260() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0">
      <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[29px] justify-center leading-[0] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center tracking-[-0.34px] w-[68px]">
        <p className="leading-[normal]">Địa chỉ</p>
      </div>
      <Frame1 />
    </div>
  );
}

function Frame2() {
  return (
    <div className="content-stretch flex flex-col font-['Fz_Poppins:Regular',sans-serif] gap-[6px] items-start leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-center text-nowrap whitespace-pre" data-name="Frame">
      <p className="relative shrink-0 text-[18px] tracking-[-0.198px]">(123) 456-7890</p>
      <p className="relative shrink-0 text-[16px] tracking-[-0.176px]">info@dentcareX.com</p>
    </div>
  );
}

function Frame261() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0">
      <p className="font-['Fz_Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center text-nowrap tracking-[-0.34px] whitespace-pre">Liên hệ</p>
      <Frame2 />
    </div>
  );
}

function Frame262() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[47px] h-[286px] items-start left-[calc(50%+158.5px)] top-0 translate-x-[-50%] w-[245px]">
      <Frame260 />
      <Frame261 />
    </div>
  );
}

function Frame264() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0">
      <p className="font-['Fz_Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[18px] tracking-[-0.198px] w-[288px]">Gửi Email để nhận được thông tin mới nhất</p>
    </div>
  );
}

function Frame267() {
  return (
    <div className="[grid-area:1_/_1] box-border content-stretch flex gap-[10px] items-center justify-center ml-[9px] mt-[13px] p-[10px] relative">
      <p className="font-['Fz_Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#444444] text-[21px] text-nowrap tracking-[-0.357px] whitespace-pre">Email của bạn</p>
    </div>
  );
}

function Group() {
  return (
    <div className="grid-cols-[max-content] grid-rows-[max-content] inline-grid leading-[0] place-items-start relative shrink-0" data-name="Group">
      <div className="[grid-area:1_/_1] h-[59px] ml-0 mt-0 relative rounded-[30px] w-[306px]">
        <div aria-hidden="true" className="absolute border border-[#1e1e1e] border-solid inset-0 pointer-events-none rounded-[30px]" />
      </div>
      <Frame267 />
    </div>
  );
}

function Frame265() {
  return (
    <div className="absolute h-[45px] left-[231px] top-[7px] w-[67px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 45">
        <g id="Frame 265">
          <rect fill="var(--fill-0, #3FB5FF)" height="45" id="Rectangle 45" rx="22.5" width="67" />
          <path d={svgPaths.p2b8b1880} fill="var(--fill-0, #1E1E1E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame266() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <Group />
      <Frame265 />
    </div>
  );
}

function Frame268() {
  return (
    <div className="content-stretch flex flex-col gap-[26px] items-start relative shrink-0">
      <Frame264 />
      <Frame266 />
    </div>
  );
}

function Frame3() {
  return (
    <div className="h-[32px] relative shrink-0 w-[286.8px]" data-name="Frame">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 287 32">
        <g id="Frame">
          <g id="mdi:facebook">
            <path d={svgPaths.p27bac000} fill="var(--fill-0, #1E1E1E)" id="Vector" />
          </g>
          <path d={svgPaths.p89f1080} fill="var(--fill-0, #1E1E1E)" id="Vector_2" />
          <path d={svgPaths.pca50b00} fill="var(--fill-0, #1E1E1E)" id="Vector_3" />
          <path d={svgPaths.pd7d3b70} fill="var(--fill-0, #1E1E1E)" id="Vector_4" />
          <path d={svgPaths.p2c13c800} fill="var(--fill-0, #1E1E1E)" id="Vector_5" />
          <path d={svgPaths.pfb8ff00} fill="var(--fill-0, #1E1E1E)" id="Vector_6" />
          <path d={svgPaths.p317ef00} fill="var(--fill-0, #1E1E1E)" id="Vector_7" />
        </g>
      </svg>
    </div>
  );
}

function Frame269() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <p className="font-['Fz_Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center text-nowrap tracking-[-0.34px] whitespace-pre">Theo dõi</p>
      <Frame3 />
    </div>
  );
}

function Frame270() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[80px] items-start left-[calc(50%+494px)] top-0 translate-x-[-50%] w-[306px]">
      <Frame268 />
      <Frame269 />
    </div>
  );
}

function Frame4() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] h-[72px] items-start relative shrink-0 w-[355px]" data-name="Frame">
      <div className="basis-0 flex flex-col font-['Roboto:Regular',sans-serif] font-normal grow justify-center leading-[0] min-h-px min-w-px relative shrink-0 text-[#333333] text-[14px] w-[271px]" style={{ fontVariationSettings: "'wdth' 100" }}>
        <p className="leading-[21px]">Giấy phép hoạt động khám bệnh, chữa bệnh số 2888/HNO-GPHĐ/CL1 do Sở Y tếThành phố Hà Nội cấp ngày 23/03/2019.</p>
      </div>
    </div>
  );
}

function Frame256() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15px] items-start justify-center left-[calc(50%-456px)] top-0 translate-x-[-50%] w-[382px]">
      <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[44px] justify-center leading-[0] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] tracking-[-0.34px] w-full">
        <p className="leading-[normal]">Phòng khám nha khoa DentalCareX</p>
      </div>
      <Frame4 />
    </div>
  );
}

function Frame847() {
  return (
    <div className="absolute content-stretch flex gap-[60px] items-start left-1/2 top-[156.93px] translate-x-[-50%] w-[1294px]">
      <Frame258 />
      <Frame262 />
      <Frame270 />
      <Frame256 />
    </div>
  );
}

export default function AppointmentPage() {
  return (
    <div className="bg-[#fcfeff] content-stretch flex flex-col gap-[1165px] items-center relative size-full" data-name="AppointmentPage">
      <div className="absolute bg-[#d8f0ff] bottom-0 box-border content-stretch flex flex-col gap-[42px] h-[497px] items-start left-[-0.14%] pb-[60px] pl-[69px] pr-[130px] pt-[50px] right-0" data-name="Footer Section">
        <div aria-hidden="true" className="absolute border-[0.5px] border-black border-solid inset-0 pointer-events-none" />
        <div className="absolute content-stretch flex gap-[9px] h-[70.528px] items-center left-[calc(50%-553px)] top-[55.1px] translate-x-[-50%] w-[198px]" data-name="Logo/1">
          <div className="relative shrink-0 size-[24px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d={svgPaths.p2d52d100} id="Vector 2" stroke="var(--stroke-0, #002035)" strokeWidth="12" />
            </svg>
          </div>
          <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-end leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px] w-[165px]">
            <p className="leading-[normal]">DentalCareX</p>
          </div>
        </div>
        <Frame847 />
      </div>
      <Header2 className="bg-[#ecf8ff] h-[104px] relative shrink-0 w-[1440px]" />
    </div>
  );
}