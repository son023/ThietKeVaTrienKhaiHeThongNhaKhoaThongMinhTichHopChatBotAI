import { useState } from 'react';
import svgPaths from "../imports/svg-dzu7ssuvmm";
import imgGoogle from "figma:asset/b42ce4579d36569b4824a780a2263c3bd4309458.png";
import imgRectangle687 from "figma:asset/58183c1b0169d35122c1687c55c4079f99dd3851.png";
import { toast } from "sonner@2.0.3";

interface LoginPageProps {
  onLogin: (email: string, role: 'doctor' | 'admin' | 'pharmacist' | 'receptionist') => void;
  onNavigateToSignUp: () => void;
  onNavigateToHome?: () => void;
}

function Group2({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="absolute bg-[#fcfeff] h-[50px] left-[calc(50%+391px)] rounded-[10px] top-[381px] translate-x-[-50%] w-[360px] cursor-pointer hover:bg-[#f0f9ff] active:bg-[#e0f2fe] transition-all duration-200 flex items-center justify-center gap-3 group"
    >
      <div aria-hidden="true" className="absolute border border-[#05619a] border-solid inset-0 pointer-events-none rounded-[10px] group-hover:border-[#3fb5ff] transition-colors" />
      <div className="h-[23.333px] w-[30.795px] relative z-10 flex items-center justify-center" data-name="Google">
        <img alt="Google logo" className="size-full object-contain" src={imgGoogle} />
      </div>
      <p className="font-['Fz_Poppins:Medium',sans-serif] text-[#01304e] text-[14px] tracking-[0.28px] relative z-10 leading-[1.55]">
        Đăng nhập bằng Google
      </p>
    </button>
  );
}

function Frame({ isChecked, onChange }: { isChecked: boolean; onChange: () => void }) {
  return (
    <div className="absolute content-stretch flex gap-[9px] items-start left-[calc(50%+186.5px)] top-[684px] translate-x-[-50%]">
      <div 
        onClick={onChange}
        className="relative shrink-0 size-[18px] cursor-pointer hover:border-[#3fb5ff] transition-colors"
      >
        <div aria-hidden="true" className="absolute border border-[#05619a] border-solid inset-0 pointer-events-none rounded-[2px]" />
        {isChecked && (
          <div className="absolute inset-[2px] bg-[#3fb5ff] rounded-[1px] flex items-center justify-center">
            <svg className="w-[12px] h-[12px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <p 
        onClick={onChange}
        className="absolute font-['Fz_Poppins:Regular',sans-serif] leading-[1.55] left-[99px] not-italic text-[#00446f] text-[14px] text-center text-nowrap top-[-2px] tracking-[0.28px] translate-x-[-50%] whitespace-pre cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        Duy trì đăng nhập
      </p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(50%+392.5px)] top-[462px] translate-x-[-50%]">
      <p className="absolute font-['Fz_Poppins:Regular',sans-serif] leading-[1.55] left-[calc(50%+391px)] not-italic text-[#01304e] text-[16px] text-center top-[462px] tracking-[0.24px] translate-x-[-50%] w-[44.966px]">Hoặc</p>
      <div className="absolute h-0 left-[calc(50%+289px)] top-[476px] translate-x-[-50%] w-[148px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 148 1">
            <line id="Line 8" stroke="var(--stroke-0, #05619A)" strokeLinecap="round" strokeWidth="0.5" x1="0.25" x2="147.75" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[calc(50%+495.5px)] top-[476px] translate-x-[-50%] w-[149px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 149 1">
            <line id="Line 9" stroke="var(--stroke-0, #05619A)" strokeLinecap="round" strokeWidth="0.5" x1="0.25" x2="148.75" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Envelope() {
  return (
    <div className="absolute h-[16.667px] left-[calc(50%+236.087px)] top-[534.67px] translate-x-[-50%] w-[17.391px]" data-name="envelope 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17">
        <g clipPath="url(#clip0_2003_250)" id="envelope 1">
          <path d={svgPaths.p639d00} fill="var(--fill-0, #00446F)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_2003_250">
            <rect fill="white" height="16.6667" width="17.3913" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group3({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+390px)] top-[518px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[50px] left-[calc(50%+390px)] rounded-[10px] top-[518px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập Email của bạn"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[50px] justify-center leading-[0] left-[calc(50%+262px)] not-italic text-[14px] text-[#333333] top-[543px] tracking-[0.28px] translate-y-[-50%] w-[199px] outline-none placeholder:text-[darkgrey]"
      />
      <Envelope />
    </div>
  );
}

function Lock() {
  return (
    <div className="absolute h-[16.667px] left-[calc(50%+237.087px)] top-[617.67px] translate-x-[-50%] w-[17.391px]" data-name="lock 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 17">
        <g clipPath="url(#clip0_2003_246)" id="lock 1">
          <path d={svgPaths.p2ad9bf80} fill="var(--fill-0, #00446F)" id="Vector" />
          <path d={svgPaths.p160a000} fill="var(--fill-0, #FCFEFF)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_2003_246">
            <rect fill="white" height="16.6667" width="17.3913" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group4({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+391px)] top-[601px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[50px] left-[calc(50%+391px)] rounded-[10px] top-[601px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mật khẩu"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[50px] justify-center leading-[0] left-[calc(50%+260px)] not-italic text-[14px] text-[#333333] top-[626px] tracking-[0.28px] translate-y-[-50%] w-[311px] outline-none placeholder:text-[darkgrey]"
      />
      <Lock />
    </div>
  );
}

function Group5({ onSubmit, email, password, setEmail, setPassword, keepLoggedIn, setKeepLoggedIn, onNavigateToSignUp }: {
  onSubmit: () => void;
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  keepLoggedIn: boolean;
  setKeepLoggedIn: (value: boolean) => void;
  onNavigateToSignUp: () => void;
}) {
  return (
    <div className="absolute contents left-[calc(50%+387.25px)] top-[254px] translate-x-[-50%]">
      <p className="absolute capitalize font-['Fz_Poppins:SemiBold',sans-serif] leading-[1.25] left-[calc(50%+180px)] not-italic text-[#01304e] text-[42px] text-nowrap top-[254px] whitespace-pre">Mừng bạn quay lại</p>
      <button 
        onClick={onSubmit}
        className="absolute bg-[#3fb5ff] box-border content-stretch flex h-[56px] items-center justify-between left-[calc(50%+387px)] overflow-clip p-[10px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[727px] translate-x-[-50%] w-[224px] cursor-pointer hover:bg-[#3fb5ff]/90 transition-colors" 
        data-name="Button/1"
      >
        <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
          <p className="leading-[100.165%]">Đăng nhập</p>
        </div>
      </button>
      <Group2 onClick={() => toast.info('Tính năng đăng nhập Google đang được phát triển')} />
      <p className="absolute font-['Switzer:Regular',sans-serif] leading-[0] left-[calc(50%+386.5px)] not-italic text-[#05619a] text-[0px] text-[14px] text-black text-center text-nowrap top-[804px] translate-x-[-50%] whitespace-pre">
        <span className="font-['Fz_Poppins:Regular',sans-serif] leading-[1.55] tracking-[0.28px]">Chưa có tài khoản?</span>
        <span className="font-['Fz_Poppins:Regular',sans-serif] leading-[0.95]"> </span>
        <button 
          onClick={onNavigateToSignUp}
          className="font-['Fz_Poppins:Medium',sans-serif] leading-[1.55] tracking-[0.28px] underline decoration-solid [text-decoration-skip-ink:none] [text-underline-position:from-font] cursor-pointer hover:text-[#3fb5ff] transition-colors"
        >
          Tạo tài khoản mới
        </button>
      </p>
      <button 
        onClick={() => toast.info('Chức năng Quên mật khẩu đang được phát triển')}
        className="[text-decoration-skip-ink:none] [text-underline-position:from-font] absolute decoration-solid font-['Fz_Poppins:Regular',sans-serif] leading-[1.55] left-[calc(50%+537px)] not-italic text-[#01304e] text-[14px] text-center text-nowrap top-[684px] tracking-[0.28px] translate-x-[-50%] underline whitespace-pre cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        Quên mật khẩu?
      </button>
      <Frame isChecked={keepLoggedIn} onChange={() => setKeepLoggedIn(!keepLoggedIn)} />
      <Group1 />
      <Group3 value={email} onChange={setEmail} />
      <Group4 value={password} onChange={setPassword} />
    </div>
  );
}

function Header({ onNavigateToHome }: { onNavigateToHome?: () => void }) {
  return (
    <div className="absolute content-stretch flex font-['Fz_Poppins:SemiBold',sans-serif] gap-[30px] h-[64px] items-center justify-center leading-[0] left-[calc(50%-20px)] not-italic text-[#01304e] text-[16px] text-center top-[20px] tracking-[0.5px] translate-x-[-50%] w-[734.4px]" data-name="Header">
      <button 
        onClick={onNavigateToHome || (() => toast.info('Chức năng Trang chủ đang được phát triển'))}
        className="flex flex-col h-full justify-center relative shrink-0 w-[108px] cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        <p className="leading-[normal]">Trang chủ</p>
      </button>
      <button 
        onClick={() => toast.info('Chức năng Dịch vụ đang được phát triển')}
        className="flex flex-col h-full justify-center relative shrink-0 w-[79px] cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        <p className="leading-[normal]">Dịch vụ</p>
      </button>
      <button 
        onClick={() => toast.info('Chức năng Bác sĩ đang được phát triển')}
        className="flex flex-col h-full justify-center relative shrink-0 w-[68px] cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        <p className="leading-[normal]">Bác sĩ</p>
      </button>
      <button 
        onClick={() => toast.info('Chức năng Về chúng tôi đang được phát triển')}
        className="flex flex-col h-full justify-center relative shrink-0 w-[143px] cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        <p className="leading-[normal]">Về chúng tôi</p>
      </button>
      <button 
        onClick={() => toast.info('Chức năng Liên hệ đang được phát triển')}
        className="flex flex-col h-full justify-center relative shrink-0 w-[74px] cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        <p className="leading-[normal]">Liên hệ</p>
      </button>
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

export function LoginPage({ onLogin, onNavigateToSignUp, onNavigateToHome }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);

  const handleSubmit = () => {
    if (!email || !password) {
      toast.error('Vui lòng nhập đầy đủ email và mật khẩu');
      return;
    }

    // Kiểm tra admin
    if (email.toLowerCase() === 'admin@gmail.com') {
      toast.success('Đăng nhập thành công với quyền Quản trị viên!');
      onLogin(email, 'admin');
      return;
    }

    // Kiểm tra pharmacist
    if (email.toLowerCase() === 'pharmacist@gmail.com') {
      toast.success('Đăng nhập thành công với quyền Dược sĩ!');
      onLogin(email, 'pharmacist');
      return;
    }

    // Kiểm tra receptionist
    if (email.toLowerCase() === 'receptionist@gmail.com') {
      toast.success('Đăng nhập thành công với quyền Lễ tân!');
      onLogin(email, 'receptionist');
      return;
    }

    // Kiểm tra doctor (bất kỳ email nào khác)
    if (email.includes('@')) {
      toast.success('Đăng nhập thành công với quyền Bác sĩ!');
      onLogin(email, 'doctor');
      return;
    }

    toast.error('Email không hợp lệ');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-[#fcfeff] relative h-screen w-screen overflow-hidden" data-name="LoginPage">
      {/* Fixed Header */}
      <div className="fixed bg-[#fcfeff] h-[104px] left-0 right-0 top-0 z-50 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.05)]" data-name="Header/1">
        <Header onNavigateToHome={onNavigateToHome} />
        <Logo />
        <button 
          onClick={handleSubmit}
          className="absolute bg-[#fcfeff] box-border content-stretch flex gap-[10px] h-[50px] items-start overflow-clip p-[10px] right-[212px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px] cursor-pointer hover:bg-[#f5f5f5] transition-colors" 
          data-name="Button/2"
        >
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1882c3] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng nhập</p>
          </div>
        </button>
        <button 
          onClick={onNavigateToSignUp}
          className="absolute bg-[#3fb5ff] box-border content-stretch flex gap-[10px] h-[51px] items-start overflow-clip p-[10px] right-[51px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px] cursor-pointer hover:bg-[#3fb5ff]/90 transition-colors" 
          data-name="Button/1"
        >
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng ký</p>
          </div>
        </button>
      </div>

      {/* Content - Scrollable */}
      <div 
        className="absolute inset-0 top-[104px] overflow-y-auto" 
        onKeyPress={handleKeyPress}
      >
        <div className="relative min-h-full">
          <Group5 
            onSubmit={handleSubmit}
            email={email}
            password={password}
            setEmail={setEmail}
            setPassword={setPassword}
            keepLoggedIn={keepLoggedIn}
            setKeepLoggedIn={setKeepLoggedIn}
            onNavigateToSignUp={onNavigateToSignUp}
          />
          <div className="absolute h-[976px] left-[calc(50%-325.5px)] rounded-tr-[10px] top-0 translate-x-[-50%] w-[801px]">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tr-[10px]">
              <div className="absolute bg-[#d9d9d9] inset-0 rounded-tr-[10px]" />
              <div className="absolute inset-0 overflow-hidden rounded-tr-[10px]">
                <img alt="" className="absolute h-[123.84%] left-0 max-w-none top-[-17.73%] w-full" src={imgRectangle687} />
              </div>
              <div className="absolute bg-[rgba(0,0,0,0.2)] inset-0 rounded-tr-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
