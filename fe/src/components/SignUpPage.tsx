import { useState } from 'react';
import svgPaths from "../imports/svg-fyu7v1is0e";
import imgGoogle from "figma:asset/b42ce4579d36569b4824a780a2263c3bd4309458.png";
import imgRectangle688 from "figma:asset/6979f5a5fca46a0febce9ba2dced8a008c729a8b.png";
import { toast } from "sonner@2.0.3";

interface SignUpPageProps {
  onBackToLogin: () => void;
  onSignUp?: (data: SignUpFormData) => void;
  onNavigateToHome?: () => void;
}

export interface SignUpFormData {
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
}

function Group({ onClick }: { onClick: () => void }) {
  return (
    <div className="absolute contents left-[calc(50%+403px)] top-[294px] translate-x-[-50%]">
      <p className="absolute font-['Fz_Poppins:Medium',sans-serif] leading-[1.55] left-[calc(50%+403px)] not-italic text-[#01304e] text-[14px] text-center top-[297px] tracking-[0.28px] translate-x-[-50%] w-[338px]">Liên kết với Google</p>
      <div className="absolute h-[28px] left-[calc(50%+318.174px)] top-[294px] translate-x-[-50%] w-[24.348px]" data-name="Google">
        <img alt="Google logo" className="absolute inset-0 max-w-none object-50%-50% object-contain pointer-events-none size-full" src={imgGoogle} />
      </div>
    </div>
  );
}

function Group2({ onClick }: { onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="absolute contents left-[calc(50%+392px)] top-[278px] translate-x-[-50%] cursor-pointer group"
    >
      <div className="absolute bg-[#fcfeff] h-[60px] left-[calc(50%+392px)] rounded-[10px] top-[278px] translate-x-[-50%] w-[360px] group-hover:bg-[#f0f9ff] group-active:bg-[#e0f2fe] transition-all duration-200">
        <div aria-hidden="true" className="absolute border border-[#05619a] border-solid inset-0 pointer-events-none rounded-[10px] group-hover:border-[#3fb5ff] transition-colors" />
      </div>
      <Group onClick={onClick} />
    </button>
  );
}

function Frame({ isChecked, onChange }: { isChecked: boolean; onChange: () => void }) {
  return (
    <div className="absolute content-stretch flex gap-[9px] items-start left-[calc(50%+222.5px)] top-[830px] translate-x-[-50%]">
      <div 
        onClick={onChange}
        className="relative shrink-0 size-[13px] cursor-pointer hover:border-[#3fb5ff] transition-colors"
      >
        <div aria-hidden="true" className="absolute border border-[#05619a] border-solid inset-0 pointer-events-none" />
        {isChecked && (
          <div className="absolute inset-[2px] bg-[#3fb5ff] flex items-center justify-center">
            <svg className="w-[9px] h-[9px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </div>
      <p 
        onClick={onChange}
        className="absolute font-['Fz_Poppins:Regular',sans-serif] leading-[1.55] left-[160.5px] not-italic text-[#00446f] text-[14px] text-center text-nowrap top-[-4px] tracking-[0.28px] translate-x-[-50%] whitespace-pre cursor-pointer hover:text-[#3fb5ff] transition-colors"
      >
        Tôi đồng ý với Điều khoản và Điều kiện
      </p>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute contents left-[calc(50%+390px)] top-[363px] translate-x-[-50%]">
      <p className="absolute font-['Fz_Poppins:Regular',sans-serif] leading-[1.55] left-[calc(50%+390px)] not-italic text-[#01304e] text-[18px] text-center top-[363px] tracking-[0.27px] translate-x-[-50%] w-[52px]">Hoặc</p>
      <div className="absolute h-0 left-[calc(50%+272.5px)] top-[377px] translate-x-[-50%] w-[179px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 179 1">
            <line id="Line 8" stroke="var(--stroke-0, #05619A)" strokeLinecap="round" strokeWidth="0.5" x1="0.25" x2="178.75" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
      <div className="absolute h-0 left-[calc(50%+508px)] top-[377px] translate-x-[-50%] w-[178px]">
        <div className="absolute bottom-0 left-0 right-0 top-[-0.5px]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 178 1">
            <line id="Line 9" stroke="var(--stroke-0, #05619A)" strokeLinecap="round" strokeWidth="0.5" x1="0.25" x2="177.75" y1="0.25" y2="0.25" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Envelope() {
  return (
    <div className="absolute left-[calc(50%+242px)] size-[20px] top-[434px] translate-x-[-50%]" data-name="envelope 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20 20">
        <g clipPath="url(#clip0_2006_572)" id="envelope 1">
          <path d={svgPaths.p1eabe80} fill="var(--fill-0, #00446F)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_2006_572">
            <rect fill="white" height="20" width="20" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group3({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+392px)] top-[414px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[60px] left-[calc(50%+392px)] rounded-[10px] top-[414px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập Email của bạn"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[60px] justify-center leading-[0] left-[calc(50%+261px)] not-italic text-[14px] text-[#333333] top-[444px] tracking-[0.28px] translate-y-[-50%] w-[147px] outline-none placeholder:text-[darkgrey]"
      />
      <Envelope />
    </div>
  );
}

function User() {
  return (
    <div className="absolute h-[20px] left-[calc(50%+238.087px)] top-[515px] translate-x-[-50%] w-[17.391px]" data-name="user (2) 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g clipPath="url(#clip0_2006_566)" id="user (2) 1">
          <path d={svgPaths.p3ad25500} fill="var(--fill-0, #00446F)" id="Vector" />
          <path d={svgPaths.p2fb2ff00} fill="var(--fill-0, #00446F)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_2006_566">
            <rect fill="white" height="20" width="17.3913" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group6({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+392px)] top-[495px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[60px] left-[calc(50%+392px)] rounded-[10px] top-[495px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập họ tên của bạn"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[60px] justify-center leading-[0] left-[calc(50%+255px)] not-italic text-[14px] text-[#333333] top-[525px] tracking-[0.28px] translate-y-[-50%] w-[304px] outline-none placeholder:text-[darkgrey]"
      />
      <User />
    </div>
  );
}

function User1() {
  return (
    <div className="absolute h-[20px] left-[calc(50%+238.087px)] top-[600px] translate-x-[-50%] w-[17.391px]" data-name="user (2) 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g clipPath="url(#clip0_2006_566)" id="user (2) 1">
          <path d={svgPaths.p3ad25500} fill="var(--fill-0, #00446F)" id="Vector" />
          <path d={svgPaths.p2fb2ff00} fill="var(--fill-0, #00446F)" id="Vector_2" />
        </g>
        <defs>
          <clipPath id="clip0_2006_566">
            <rect fill="white" height="20" width="17.3913" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Group7({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+392px)] top-[580px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[60px] left-[calc(50%+392px)] rounded-[10px] top-[580px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="tel"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Nhập số điện thoại"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[60px] justify-center leading-[0] left-[calc(50%+254.609px)] not-italic text-[14px] text-[#333333] top-[610px] tracking-[0.28px] translate-y-[-50%] w-[316.522px] outline-none placeholder:text-[darkgrey]"
      />
      <User1 />
    </div>
  );
}

function Lock() {
  return (
    <div className="absolute h-[20px] left-[calc(50%+238.087px)] top-[683px] translate-x-[-50%] w-[17.391px]" data-name="lock 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="lock 1">
          <path d={svgPaths.p2480fe80} fill="var(--fill-0, #00446F)" id="Vector" />
          <path d={svgPaths.p32ee2180} fill="var(--fill-0, #FCFEFF)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group4({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+392px)] top-[663px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[60px] left-[calc(50%+392px)] rounded-[10px] top-[663px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Mật khẩu"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[60px] justify-center leading-[0] left-[calc(50%+254.609px)] not-italic text-[14px] text-[#333333] top-[693px] tracking-[0.28px] translate-y-[-50%] w-[316.522px] outline-none placeholder:text-[darkgrey]"
      />
      <Lock />
    </div>
  );
}

function Lock1() {
  return (
    <div className="absolute h-[20px] left-[calc(50%+238.087px)] top-[766px] translate-x-[-50%] w-[17.391px]" data-name="lock 1">
      <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 18 20">
        <g id="lock 1">
          <path d={svgPaths.p2480fe80} fill="var(--fill-0, #00446F)" id="Vector" />
          <path d={svgPaths.p32ee2180} fill="var(--fill-0, #FCFEFF)" id="Vector_2" />
        </g>
      </svg>
    </div>
  );
}

function Group5({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <div className="absolute contents left-[calc(50%+392px)] top-[746px] translate-x-[-50%]">
      <div className="absolute bg-[#fcfeff] h-[60px] left-[calc(50%+392px)] rounded-[10px] top-[746px] translate-x-[-50%] w-[360px]">
        <div aria-hidden="true" className="absolute border border-[#3295d0] border-solid inset-0 pointer-events-none rounded-[10px]" />
      </div>
      <input
        type="password"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Xác nhận mật khẩu"
        className="absolute bg-transparent flex flex-col font-['Fz_Poppins:Regular',sans-serif] h-[60px] justify-center leading-[0] left-[calc(50%+255.478px)] not-italic text-[14px] text-[#333333] top-[776px] tracking-[0.28px] translate-y-[-50%] w-[316.522px] outline-none placeholder:text-[darkgrey]"
      />
      <Lock1 />
    </div>
  );
}

function Group8({ 
  onSubmit,
  email,
  fullName,
  phone,
  password,
  confirmPassword,
  agreedToTerms,
  setEmail,
  setFullName,
  setPhone,
  setPassword,
  setConfirmPassword,
  setAgreedToTerms
}: {
  onSubmit: () => void;
  email: string;
  fullName: string;
  phone: string;
  password: string;
  confirmPassword: string;
  agreedToTerms: boolean;
  setEmail: (value: string) => void;
  setFullName: (value: string) => void;
  setPhone: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setAgreedToTerms: (value: boolean) => void;
}) {
  return (
    <div className="absolute contents left-[calc(50%+390px)] top-[204px] translate-x-[-50%]">
      <p className="absolute capitalize font-['Fz_Poppins:SemiBold',sans-serif] leading-[1.25] left-[calc(50%+197px)] not-italic text-[#01304e] text-[42px] text-nowrap top-[204px] whitespace-pre">Tạo tài khoản mới</p>
      <button 
        onClick={onSubmit}
        className="absolute bg-[#3fb5ff] box-border content-stretch flex h-[56px] items-center justify-between left-[calc(50%+392px)] overflow-clip p-[10px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[869px] translate-x-[-50%] w-[224px] cursor-pointer hover:bg-[#3fb5ff]/90 transition-colors" 
        data-name="Button/1"
      >
        <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
          <p className="leading-[100.165%]">Đăng ký</p>
        </div>
      </button>
      <Group2 onClick={() => toast.info('Tính năng liên kết với Google đang được phát triển')} />
      <Frame isChecked={agreedToTerms} onChange={() => setAgreedToTerms(!agreedToTerms)} />
      <Group1 />
      <Group3 value={email} onChange={setEmail} />
      <Group6 value={fullName} onChange={setFullName} />
      <Group7 value={phone} onChange={setPhone} />
      <Group4 value={password} onChange={setPassword} />
      <Group5 value={confirmPassword} onChange={setConfirmPassword} />
    </div>
  );
}

function Header({ onBackToLogin, onNavigateToHome }: { onBackToLogin: () => void; onNavigateToHome?: () => void }) {
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

export function SignUpPage({ onBackToLogin, onSignUp, onNavigateToHome }: SignUpPageProps) {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const handleSubmit = () => {
    // Validation
    if (!email || !fullName || !phone || !password || !confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!email.includes('@')) {
      toast.error('Email không hợp lệ');
      return;
    }

    if (password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Vui lòng đồng ý với Điều khoản và Điều kiện');
      return;
    }

    const formData: SignUpFormData = {
      email,
      fullName,
      phone,
      password,
      confirmPassword,
      agreedToTerms,
    };

    if (onSignUp) {
      onSignUp(formData);
    } else {
      toast.success('Đăng ký thành công! Bạn sẽ được chuyển đến trang đăng nhập.');
      setTimeout(() => {
        onBackToLogin();
      }, 2000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="bg-[#fcfeff] relative h-screen w-screen overflow-hidden" data-name="SignUpPage" onKeyPress={handleKeyPress}>
      {/* Fixed Header */}
      <div className="fixed bg-[#fcfeff] h-[104px] left-0 right-0 top-0 z-50 shadow-[0px_2px_8px_0px_rgba(0,0,0,0.05)]" data-name="Header/1">
        <Header onBackToLogin={onBackToLogin} onNavigateToHome={onNavigateToHome} />
        <Logo />
        <button 
          onClick={onBackToLogin}
          className="absolute bg-[#fcfeff] box-border content-stretch flex gap-[10px] h-[50px] items-start overflow-clip p-[10px] right-[212px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px] cursor-pointer hover:bg-[#f5f5f5] transition-colors" 
          data-name="Button/2"
        >
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#1882c3] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng nhập</p>
          </div>
        </button>
        <button 
          onClick={handleSubmit}
          className="absolute bg-[#3fb5ff] box-border content-stretch flex gap-[10px] h-[51px] items-start overflow-clip p-[10px] right-[51px] rounded-[15px] shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)] top-[29px] w-[144px] cursor-pointer hover:bg-[#3fb5ff]/90 transition-colors" 
          data-name="Button/1"
        >
          <div className="basis-0 flex flex-col font-['Fz_Poppins:SemiBold',sans-serif] grow h-full justify-center leading-[0] min-h-px min-w-px not-italic relative shrink-0 text-[#fcfeff] text-[16px] text-center">
            <p className="leading-[100.165%]">Đăng ký</p>
          </div>
        </button>
      </div>

      {/* Content - Scrollable */}
      <div className="absolute inset-0 top-[104px] overflow-y-auto">
        <div className="relative min-h-full pb-20">
          <Group8 
            onSubmit={handleSubmit}
            email={email}
            fullName={fullName}
            phone={phone}
            password={password}
            confirmPassword={confirmPassword}
            agreedToTerms={agreedToTerms}
            setEmail={setEmail}
            setFullName={setFullName}
            setPhone={setPhone}
            setPassword={setPassword}
            setConfirmPassword={setConfirmPassword}
            setAgreedToTerms={setAgreedToTerms}
          />
          <div className="absolute h-[1004px] left-[calc(50%-338px)] rounded-tr-[10px] top-0 translate-x-[-50%] w-[808px]">
            <div aria-hidden="true" className="absolute inset-0 pointer-events-none rounded-tr-[10px]">
              <div className="absolute bg-[#d9d9d9] inset-0 rounded-tr-[10px]" />
              <img alt="" className="absolute max-w-none object-50%-50% object-cover rounded-tr-[10px] size-full" src={imgRectangle688} />
              <div className="absolute bg-[rgba(0,0,0,0.3)] inset-0 rounded-tr-[10px]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
