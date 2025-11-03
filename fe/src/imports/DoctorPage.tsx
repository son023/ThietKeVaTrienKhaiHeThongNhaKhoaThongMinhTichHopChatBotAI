import svgPaths from "./svg-bbohpm6xa5";
import imgDoctor11 from "figma:asset/109b509800f5c3abb13b80b15d8c9727c9482514.png";
import imgImage37 from "figma:asset/4c5af2cd576534aecce3a11289d4f63ced94d7dc.png";
import imgImage38 from "figma:asset/6f00a8c1032bb3cde849cd80bd5b3109943a96e7.png";
import imgImage39 from "figma:asset/dfcbd615aec5c5ca792233e24fa4b63826e860c7.png";
import imgDoctor31 from "figma:asset/6623418598ca38c3b0c01ecc918e4af9b46f446a.png";
import imgDoctor61 from "figma:asset/9d67e25944c4c47db83256c71e8889c71787e185.png";
import { img } from "./svg-8r0u0";

function Frame21() {
  return (
    <div className="[grid-area:1_/_2] content-stretch flex gap-[10px] items-center justify-end relative shrink-0">
      <div className="bg-[#fcfeff] box-border content-stretch flex gap-[10px] h-[52px] items-center justify-end overflow-clip p-[10px] relative rounded-[10px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] shrink-0 w-[208px]" data-name="Button/2">
        <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1882c3] text-[16px] text-center">
          <p className="leading-[100.165%]">Đặt lịch ngay</p>
        </div>
      </div>
    </div>
  );
}

function Buttom() {
  return (
    <div className="absolute box-border gap-[10px] grid grid-cols-[repeat(2,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[68px] left-1/2 overflow-clip pl-0 pr-[9px] py-0 top-[59.5px] translate-x-[-50%] w-[745.333px]" data-name="Buttom">
      <div className="[grid-area:1_/_1] [text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#01304e] text-[24px] tracking-[0.5px]">
        <p className="leading-[normal]">Bác sĩ Chỉnh Nha</p>
      </div>
      <Frame21 />
    </div>
  );
}

function Text() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[30px] h-[140px] items-start leading-[0] left-[calc(50%+0.166px)] not-italic top-[149px] tracking-[0.5px] translate-x-[-50%] w-[745px]" data-name="Text">
      <div className="[text-shadow:rgba(0,0,0,0.25)_0px_4px_4px] flex flex-col font-['Fz_Poppins:Bold',sans-serif] justify-center relative shrink-0 text-[#01304e] text-[32px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">PHẠM THỊ NGỌC MAI</p>
      </div>
      <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] justify-center min-w-full relative shrink-0 text-[#333333] text-[0px] w-[min-content]">
        <p className="leading-[normal] mb-0 text-[16px]">Chuyên khoa Chỉnh nha - Niềng răng</p>
        <p className="leading-[normal] text-[16px]">
          <span>{`Hơn `}</span>
          <span className="font-['Fz_Poppins:SemiBold',sans-serif] not-italic">10 năm</span>
          <span>{` kinh nghiệm trong lĩnh vực chỉnh nha chuyên sâu, đã điều trị thành công cho hơn `}</span>
          <span className="font-['Fz_Poppins:SemiBold',sans-serif] not-italic">2.000 ca niềng răng</span>
          <span>{` từ đơn giản đến phức tạp.`}</span>
        </p>
      </div>
    </div>
  );
}

function Content() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[48px] items-start justify-center leading-[0] left-[48.33px] not-italic overflow-clip pl-0 pr-[18px] py-[3px] text-[#333333] text-[16px] top-0 tracking-[0.5px] w-[266px]" data-name="Content">
      <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[18px] justify-center relative shrink-0 w-[266px]">
        <p className="leading-[normal]">Liên hệ</p>
      </div>
      <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] h-[18px] justify-center relative shrink-0 w-[266px]">
        <p className="leading-[normal]">+1234 567 890</p>
      </div>
    </div>
  );
}

function Icon() {
  return (
    <div className="absolute bg-[#3fb5ff] left-0 rounded-[100px] size-[32px] top-[7.5px]" data-name="Icon">
      <div className="absolute aspect-[24/24] left-[22.92%] right-[20.83%] top-1/2 translate-y-[-50%]" data-name="Icon/Outline/phone">
        <div className="absolute inset-[8.33%]" data-name="Mask">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15 15">
            <path clipRule="evenodd" d={svgPaths.p2de16e80} fill="var(--fill-0, #FCFEFF)" fillRule="evenodd" id="Mask" />
          </svg>
        </div>
        <div className="absolute inset-0 mask-alpha mask-intersect mask-no-clip mask-no-repeat mask-position-[2px] mask-size-[20px_20px]" data-name="🎨 Color" style={{ maskImage: `url('${img}')` }}>
          <div className="absolute bg-[#fcfeff] inset-0" data-name="Base" />
        </div>
      </div>
    </div>
  );
}

function Phone() {
  return (
    <div className="h-[48px] relative shrink-0 w-[314px]" data-name="Phone">
      <Content />
      <Icon />
    </div>
  );
}

function Content3() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[48px] items-start justify-center leading-[0] left-[48.33px] not-italic overflow-clip pl-0 pr-[18px] py-[3px] text-[#333333] text-[16px] top-0 tracking-[0.5px] w-[266px]" data-name="Content">
      <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[18px] justify-center relative shrink-0 w-[266px]">
        <p className="leading-[normal]">Mail</p>
      </div>
      <div className="flex flex-col font-['Fz_Poppins:Medium',sans-serif] h-[18px] justify-center relative shrink-0 w-[266px]">
        <p className="leading-[normal]">ngocmai.forwork@gmail.com</p>
      </div>
    </div>
  );
}

function Icon1() {
  return (
    <div className="absolute aspect-[48/48] bg-[#3fb5ff] bottom-[17.71%] left-[calc(50%-141px)] rounded-[100px] top-[15.63%] translate-x-[-50%]" data-name="Icon">
      <div className="absolute h-[12px] left-[8.33px] top-[10px] w-[16px]" data-name="Subtract">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 12">
          <path clipRule="evenodd" d={svgPaths.p2135d900} fill="var(--fill-0, #FCFEFF)" fillRule="evenodd" id="Subtract" />
        </svg>
      </div>
    </div>
  );
}

function Mail() {
  return (
    <div className="h-[48px] relative shrink-0 w-[314px]" data-name="Mail">
      <Content3 />
      <Icon1 />
    </div>
  );
}

function Frame20() {
  return (
    <div className="absolute box-border content-stretch flex gap-[10px] h-[48px] items-start left-[calc(50%+0.333px)] overflow-clip px-[9px] py-0 top-[320px] translate-x-[-50%] w-[745.333px]">
      <Phone />
      <Mail />
    </div>
  );
}

function Content4() {
  return (
    <div className="absolute bg-[#d8f0ff] box-border content-stretch flex flex-col gap-[10px] h-[437px] items-start justify-center left-[calc(50%+223.334px)] overflow-clip px-[44px] py-[57px] rounded-[20px] top-0 translate-x-[-50%] w-[833.333px]" data-name="Content">
      <Buttom />
      <Text />
      <Frame20 />
    </div>
  );
}

function Image() {
  return (
    <div className="absolute bg-[#d8f0ff] h-[437px] left-[calc(50%-446.667px)] overflow-clip rounded-[20px] top-0 translate-x-[-50%] w-[386.667px]" data-name="Image">
      <div className="absolute h-[580px] left-[18px] top-0 w-[382px]" data-name="doctor1 1">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor11} />
      </div>
    </div>
  );
}

function Frame19() {
  return (
    <div className="absolute bg-white gap-[60px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[437px] left-1/2 rounded-[20px] top-[60px] translate-x-[-50%] w-[1280px]">
      <Content4 />
      <Image />
    </div>
  );
}

function Content1() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[30px] h-[180px] items-start leading-[0] left-1/2 not-italic p-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] text-black top-[10px] tracking-[0.5px] translate-x-[-50%] w-[1280px]" data-name="Content 1">
      <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-center relative shrink-0 text-[20px] text-nowrap">
        <p className="leading-[normal] whitespace-pre">Kinh nghiệm làm việc</p>
      </div>
      <div className="flex flex-col font-['Fz_Poppins:Regular',sans-serif] justify-center min-w-full relative shrink-0 text-[16px] w-[min-content]">
        <ul className="list-disc">
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">Năm 2013 – 2018: Bác sĩ tại phòng khám răng thuộc Bệnh viện Y học cổ truyền tỉnh Bắc Ninh</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">Năm 2019: Bác sĩ tại Nha khoa Time Smile</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">Năm 2020 – 2022: Bác sĩ tại Nha khoa Quốc Tế Việt Pháp</span>
          </li>
          <li className="ms-[24px]">
            <span className="leading-[35px]">Năm 2022 đến nay: Bác sĩ Trưởng tại hệ thống nha khoa Dental Care</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Content5() {
  return (
    <div className="absolute h-[341px] leading-[0] left-1/2 not-italic text-black top-[10px] tracking-[0.5px] translate-x-[-50%] w-[1260px]" data-name="Content">
      <div className="absolute flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] justify-center left-0 text-[20px] text-nowrap top-[8px] translate-y-[-50%]">
        <p className="leading-[normal] whitespace-pre">Chứng chỉ và chứng nhận đào tạo</p>
      </div>
      <div className="absolute flex flex-col font-['Fz_Poppins:Regular',sans-serif] justify-center left-0 right-0 text-[16px] top-[194px] translate-y-[-50%]">
        <ul className="list-disc">
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">{`Tốt nghiệp bác sĩ Răng hàm mặt – Trường ĐH Y Hà Nội `}</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">{`Chứng chỉ đào tạo Cấy ghép nha khoa nâng cao: Phẫu thuật ghép xương và nâng xoang của Viện Đào tạo Răng hàm mặt cấp `}</span>
          </li>
          <li className="mb-0 ms-[24px] whitespace-pre-wrap">
            <span className="leading-[35px]">{`Chứng chỉ chương trình đào tạo”Cắm ghép Implant nha khoa” của Viện Đào tạo Răng hàm mặt cấp  `}</span>
          </li>
          <li className="mb-0 ms-[24px] whitespace-pre-wrap">
            <span className="leading-[35px]">{`Chứng chỉ về “Soft tissue augmentation around implants of Dr. Bui Thanh Tung”  `}</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">{`Chứng chỉ hành nghề khám chữa bệnh do Sở Y tế Bắc Ninh cấp `}</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">{`Chứng nhận đào tạo liên tục về Xu hướng Implant trong kỷ nguyên mới của Viện Đào tạo Răng hàm mặt cấp `}</span>
          </li>
          <li className="mb-0 ms-[24px]">
            <span className="leading-[35px]">{`Chứng nhận hoàn thành khóa đào tạo về Phục hình thẩm mỹ răng do HANODENT cấp `}</span>
          </li>
          <li className="ms-[24px]">
            <span className="leading-[35px]">Chứng nhận hoàn thành chương trình Chỉnh nha an toàn của Ormco</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Image1() {
  return (
    <div className="absolute box-border gap-[50px] grid grid-cols-[repeat(3,_minmax(0px,_1fr))] grid-rows-[repeat(1,_minmax(0px,_1fr))] h-[294px] left-1/2 pb-0 pt-[20px] px-0 top-[391px] translate-x-[-50%] w-[1260px]" data-name="Image">
      <div className="[grid-area:1_/_3] aspect-[1200/800] relative self-start shrink-0" data-name="image 37">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage37} />
      </div>
      <div className="[grid-area:1_/_2] aspect-[768/517] relative shrink-0" data-name="image 38">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage38} />
      </div>
      <div className="[grid-area:1_/_1] h-[261px] relative shrink-0 w-[371px]" data-name="image 39">
        <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgImage39} />
      </div>
    </div>
  );
}

function Content2() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[30px] h-[685px] items-start left-1/2 p-[10px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)] top-[222px] translate-x-[-50%] w-[1280px]" data-name="Content 2">
      <Content5 />
      <Image1 />
    </div>
  );
}

function Frame22() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[40px] h-[934px] items-center left-1/2 overflow-clip px-0 py-[10px] top-[557px] translate-x-[-50%] w-[1280px]">
      <Content1 />
      <Content2 />
    </div>
  );
}

function ServicesSection() {
  return (
    <div className="absolute bg-white box-border gap-[60px] grid grid-cols-[repeat(1,_minmax(0px,_1fr))] grid-rows-[repeat(3,_minmax(0px,_1fr))] h-[1551px] left-1/2 px-[80px] py-[60px] top-[104px] translate-x-[-50%] w-[1440px]" data-name="Services Section">
      <Frame19 />
      <Frame22 />
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

function Frame6() {
  return (
    <div className="content-stretch flex gap-[20px] items-start relative shrink-0 w-[241px]">
      <Frame />
    </div>
  );
}

function Frame7() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[30px] items-start left-[calc(50%-144.5px)] top-0 translate-x-[-50%] w-[241px]">
      <p className="font-['Fz_Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center text-nowrap tracking-[-0.34px] whitespace-pre">Giờ mở cửa</p>
      <Frame6 />
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

function Frame8() {
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

function Frame9() {
  return (
    <div className="content-stretch flex flex-col gap-[30px] items-start relative shrink-0">
      <p className="font-['Fz_Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center text-nowrap tracking-[-0.34px] whitespace-pre">Liên hệ</p>
      <Frame2 />
    </div>
  );
}

function Frame10() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[47px] h-[286px] items-start left-[calc(50%+158.5px)] top-0 translate-x-[-50%] w-[245px]">
      <Frame8 />
      <Frame9 />
    </div>
  );
}

function Frame11() {
  return (
    <div className="content-stretch flex flex-col gap-[20px] items-start relative shrink-0">
      <p className="font-['Fz_Poppins:Regular',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[18px] tracking-[-0.198px] w-[288px]">Gửi Email để nhận được thông tin mới nhất</p>
    </div>
  );
}

function Frame14() {
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
      <Frame14 />
    </div>
  );
}

function Frame12() {
  return (
    <div className="absolute h-[45px] left-[231px] top-[7px] w-[67px]">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 67 45">
        <g id="Frame 265">
          <rect fill="var(--fill-0, #3FB5FF)" height="45" id="Rectangle 45" rx="22.5" width="67" />
          <path d={svgPaths.p79bb400} fill="var(--fill-0, #1E1E1E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Frame13() {
  return (
    <div className="content-stretch flex flex-col gap-[10px] items-start relative shrink-0">
      <Group />
      <Frame12 />
    </div>
  );
}

function Frame15() {
  return (
    <div className="content-stretch flex flex-col gap-[26px] items-start relative shrink-0">
      <Frame11 />
      <Frame13 />
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

function Frame16() {
  return (
    <div className="content-stretch flex flex-col gap-[16px] items-start relative shrink-0">
      <p className="font-['Fz_Poppins:SemiBold',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] text-center text-nowrap tracking-[-0.34px] whitespace-pre">Theo dõi</p>
      <Frame3 />
    </div>
  );
}

function Frame17() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[80px] items-start left-[calc(50%+494px)] top-0 translate-x-[-50%] w-[306px]">
      <Frame15 />
      <Frame16 />
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

function Frame5() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[15px] items-start justify-center left-[calc(50%-456px)] top-0 translate-x-[-50%] w-[382px]">
      <div className="flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] h-[44px] justify-center leading-[0] not-italic relative shrink-0 text-[#1e1e1e] text-[20px] tracking-[-0.34px] w-full">
        <p className="leading-[normal]">Phòng khám nha khoa DentalCareX</p>
      </div>
      <Frame4 />
    </div>
  );
}

function Frame18() {
  return (
    <div className="absolute content-stretch flex gap-[60px] items-start left-1/2 top-[156.93px] translate-x-[-50%] w-[1294px]">
      <Frame7 />
      <Frame10 />
      <Frame17 />
      <Frame5 />
    </div>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex font-['Fz_Poppins:SemiBold',sans-serif] gap-[30px] h-[64px] items-center justify-center leading-[0] left-[calc(50%-20px)] not-italic text-[#01304e] text-[16px] text-center top-[20px] tracking-[0.5px] translate-x-[-50%] w-[734.4px]" data-name="Header">
      <div className="flex flex-col h-full justify-center relative shrink-0 w-[108px]">
        <p className="leading-[normal]">Trang chủ</p>
      </div>
      <div className="flex flex-col h-full justify-center relative shrink-0 w-[79px]">
        <p className="leading-[normal]">Dịch vụ</p>
      </div>
      <div className="flex flex-col h-full justify-center relative shrink-0 w-[68px]">
        <p className="leading-[normal]">Bác sĩ</p>
      </div>
      <div className="flex flex-col h-full justify-center relative shrink-0 w-[143px]">
        <p className="leading-[normal]">Về chúng tôi</p>
      </div>
      <div className="flex flex-col h-full justify-center relative shrink-0 w-[74px]">
        <p className="leading-[normal]">Liên hệ</p>
      </div>
    </div>
  );
}

function Logo() {
  return (
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
  );
}

function Doctor1() {
  return (
    <div className="absolute bg-[#afe0ff] h-[357.5px] left-1/2 rounded-[30px] top-0 translate-x-[-50%] w-[330.909px]" data-name="Doctor2">
      <div className="h-[357.5px] overflow-clip relative rounded-[inherit] w-[330.909px]">
        <div className="absolute aspect-[360/360] left-[-3.02%] right-[-5.77%] top-[18px]" data-name="doctor3 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor31} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#3fb5ff] border-[10px] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Doctor() {
  return (
    <div className="absolute bg-[#afe0ff] h-[357.5px] left-[calc(50%-370.909px)] rounded-[30px] top-0 translate-x-[-50%] w-[330.909px]" data-name="Doctor1">
      <div className="h-[357.5px] overflow-clip relative rounded-[inherit] w-[330.909px]">
        <div className="absolute aspect-[711/1080] left-[12.8%] right-[2.58%] top-[0.5px]" data-name="doctor1 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor11} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#1882c3] border-[10px] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Doctor2() {
  return (
    <div className="absolute bg-[#afe0ff] h-[357.5px] left-[calc(50%+370.909px)] rounded-[30px] top-0 translate-x-[-50%] w-[330.909px]" data-name="Doctor3">
      <div className="h-[357.5px] overflow-clip relative rounded-[inherit] w-[330.909px]">
        <div className="absolute aspect-[280/289] left-[5.3%] right-[7.06%] top-[48.5px]" data-name="doctor6 1">
          <img alt="" className="absolute inset-0 max-w-none object-50%-50% object-cover pointer-events-none size-full" src={imgDoctor61} />
        </div>
      </div>
      <div aria-hidden="true" className="absolute border-[#3fb5ff] border-[10px] border-solid inset-0 pointer-events-none rounded-[30px]" />
    </div>
  );
}

function Slider() {
  return (
    <div className="absolute gap-[40px] grid grid-cols-[repeat(9,_minmax(0px,_1fr))] grid-rows-[repeat(3,_minmax(0px,_1fr))] h-[357.5px] left-[11.15%] overflow-clip right-[14.35%] top-[1680px]" data-name="Slider">
      <Doctor1 />
      <Doctor />
      <Doctor2 />
    </div>
  );
}

function IcArrowLeft() {
  return (
    <div className="relative shrink-0 size-[86px]" data-name="ic_arrow_left 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 86 86">
        <g id="ic_arrow_left 1">
          <rect fill="var(--fill-0, #F5F5DC)" height="86" rx="43" width="86" />
          <path d={svgPaths.p1f70ce00} fill="var(--fill-0, #05619A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ArrowLeft() {
  return (
    <div className="absolute box-border content-stretch flex flex-col gap-[10px] h-[357px] items-center justify-center left-[calc(50%-641px)] overflow-clip px-0 py-[114px] top-[1680.5px] translate-x-[-50%] w-[84px]" data-name="Arrow Left">
      <IcArrowLeft />
    </div>
  );
}

function IcArrowRight() {
  return (
    <div className="absolute left-[-0.73px] size-[86px] top-[130px]" data-name="ic_arrow_right 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 86 86">
        <g id="ic_arrow_right 1">
          <rect fill="var(--fill-0, #F5F5DC)" height="86" rx="43" width="86" />
          <path d={svgPaths.p19939200} fill="var(--fill-0, #05619A)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function ArrowRight() {
  return (
    <div className="absolute h-[357.5px] left-[calc(50%+595.181px)] overflow-clip top-[1680px] translate-x-[-50%] w-[83.636px]" data-name="Arrow Right">
      <IcArrowRight />
    </div>
  );
}

export default function DoctorPage() {
  return (
    <div className="bg-[#fcfeff] content-stretch flex flex-col gap-[1165px] items-center relative size-full" data-name="DoctorPage">
      <ServicesSection />
      <div className="absolute bg-[#d8f0ff] bottom-0 box-border content-stretch flex flex-col gap-[42px] h-[497px] items-start left-0 pb-[60px] pl-[69px] pr-[130px] pt-[50px] right-[-0.14%]" data-name="Footer Section">
        <div aria-hidden="true" className="absolute border-[0.5px] border-black border-solid inset-0 pointer-events-none" />
        <Frame18 />
      </div>
      <div className="bg-[#fcfeff] h-[104px] relative shrink-0 w-[1440px]" data-name="Header/1">
        <Header />
        <Logo />
        <div className="absolute bg-[#fcfeff] box-border content-stretch flex gap-[10px] h-[50px] items-start overflow-clip p-[10px] right-[212px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px]" data-name="Button/2">
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1882c3] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng nhập</p>
          </div>
        </div>
        <div className="absolute bg-[#3fb5ff] box-border content-stretch flex gap-[10px] h-[51px] items-start overflow-clip p-[10px] right-[51px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px]" data-name="Button/1">
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng ký</p>
          </div>
        </div>
      </div>
      <Slider />
      <ArrowLeft />
      <ArrowRight />
    </div>
  );
}