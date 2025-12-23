import { Input } from '../ui/input';
import { Button } from '../ui/button';

export function PublicFooter() {
  return (
    <footer className="bg-[var(--surface-tint)] py-12 px-5 md:px-20 border-t border-[var(--border-soft)]">
      <div className="container mx-auto max-w-7xl">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-10">
          <div className="w-6 h-6">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24 24">
              <path d="M17.499 6.00098L17.7031 6.01562H17.8057L17.8281 6.2334L17.9307 6.64551C17.9671 6.7918 18.016 7.18517 17.9941 7.78613C17.9851 8.03442 17.9647 8.25966 17.9443 8.44434C17.8173 8.71365 17.6829 8.98008 17.5479 9.22656C17.4365 9.42976 17.3335 9.60535 17.25 9.74316C17.2085 9.81172 17.1735 9.8678 17.1465 9.91016C17.1368 9.92533 17.1279 9.93775 17.1211 9.94824C16.7691 10.4425 16.4865 10.947 16.2617 11.4414C15.0559 10.5417 13.3534 9.7862 11.291 10.0293C9.78735 10.1798 8.58479 10.7405 7.64941 11.4209C7.35969 10.7539 7.03138 10.159 6.7168 9.68652L6.55078 9.4375L6.36133 9.20605L6.28418 9.10352C6.20872 8.99436 6.13732 8.86526 6.0791 8.73242C6.07067 8.71317 6.06433 8.69425 6.05762 8.67773C6.00509 8.17624 5.99323 7.73024 6.00293 7.37891C6.00874 7.16889 6.0217 7.00758 6.03223 6.90527C6.04112 6.81887 6.04589 6.79888 6.03906 6.83789L6.06836 6.70215L6.09668 6.49023C6.1173 6.33539 6.15954 6.17402 6.21484 6.01562H6.27441C6.63755 6.01562 6.94088 6.06552 7.14258 6.11523C7.17759 6.12386 7.20661 6.13375 7.23047 6.14062L7.58887 6.33496L8.2207 6.51562C11.2039 7.36893 14.0541 6.90708 15.4346 6.48828L15.959 6.3291L16.3633 6.12012C16.3693 6.1184 16.3761 6.11634 16.3838 6.11426C16.4688 6.09135 16.6025 6.06365 16.7783 6.04102C16.9511 6.0188 17.1247 6.00644 17.2754 6.00195C17.4328 5.99727 17.5142 6.00202 17.499 6.00098Z" stroke="#002035" strokeWidth="12" />
            </svg>
          </div>
          <span className="typo-h3 text-[var(--text-strong)]">
            DentalCareX
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-12">
          {/* About */}
          <div className="space-y-4">
            <h3 className="typo-h4 text-[var(--text-strong)]">
              Phòng khám nha khoa DentalCareX
            </h3>
            <p className="text-sm text-[var(--text-regular)] leading-relaxed">
              Giấy phép hoạt động khám bệnh, chữa bệnh số 2888/HNO-GPHĐ/CL1 do Sở Y tế Thành phố Hà Nội cấp ngày 23/03/2019.
            </p>
          </div>

          {/* Opening Hours */}
          <div className="space-y-6">
            <h3 className="typo-h4 text-[var(--text-strong)] text-center md:text-left">
              Giờ mở cửa
            </h3>
            <div className="font-medium text-[var(--text-regular)] text-base space-y-0">
              <p className="leading-8">9h00 - 21h00</p>
              <p className="leading-8">Tất cả các ngày trong tuần</p>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <div className="space-y-6">
              <h3 className="typo-h4 text-[var(--text-strong)]">
                Địa chỉ
              </h3>
              <div className="space-y-3">
                <p className="text-sm text-[var(--text-regular)] leading-6">
                  Tầng 2, TTTM Mandarin Garden 2, Phường Tân Mai, Quận Hoàng Mai, Hà Nội
                </p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-sm text-[var(--accent-light)] font-medium hover:text-[var(--accent)] underline transition-colors"
                >
                  View on Maps
                </a>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="typo-h4 text-[var(--text-strong)]">
                Liên hệ
              </h3>
              <div className="space-y-2">
                <a
                  href="tel:+84583891780"
                  className="block font-medium text-[var(--text-regular)] text-base hover:text-[var(--accent-light)] transition-colors"
                >
                  +84 583891780
                </a>
                <a
                  href="mailto:info@dentalcareX.com"
                  className="block text-sm text-[var(--text-regular)] hover:text-[var(--accent-light)] transition-colors"
                >
                  info@dentalcareX.com
                </a>
              </div>
            </div>
          </div>

          {/* Newsletter & Social */}
          <div className="space-y-12">
            <div className="space-y-6">
              <div className="space-y-4">
                <p className="text-base text-[var(--text-strong)] font-medium">
                  Nhận thông tin mới nhất
                </p>
              </div>

              <div className="relative">
                <Input
                  placeholder="Email của bạn"
                  className="h-14 rounded-full border-[var(--border-soft)] pl-5 pr-20 text-base"
                />
                <Button className="absolute right-2 top-2 h-10 w-16 bg-[var(--accent-light)] hover:bg-[var(--accent)] rounded-full transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 20" fill="none">
                    <path d="M18.7329 14.75L18.7785 12.0917L38.7442 12.434L32.6385 6.11526L34.5562 4.26231L43.8213 13.8506L34.233 23.1157L32.38 21.198L38.6987 15.0923L18.7329 14.75Z" fill="white" />
                  </svg>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="typo-h5 text-[var(--text-strong)] text-center md:text-left">
                Theo dõi
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href="https://facebook.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 text-[var(--text-strong)] hover:text-[var(--accent-light)] transition-colors cursor-pointer"
                >
                  <svg viewBox="0 0 32 32" fill="currentColor">
                    <path d="M13.3333 0C6 0 0 5.98667 0 13.36C0 20.0267 4.88 25.56 11.2533 26.56V17.2267H7.86667V13.36H11.2533V10.4133C11.2533 7.06667 13.24 5.22667 16.2933 5.22667C17.7467 5.22667 19.2667 5.48 19.2667 5.48V8.77333H17.5867C15.9333 8.77333 15.4133 9.8 15.4133 10.8533V13.36H19.12L18.52 17.2267H15.4133V26.56C18.5553 26.0638 21.4163 24.4607 23.4799 22.0401C25.5435 19.6195 26.6738 16.5409 26.6667 13.36C26.6667 5.98667 20.6667 0 13.3333 0Z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-[var(--border-soft)] text-center">
          <p className="text-sm text-[var(--text-regular)] opacity-70">
            © 2024 DentalCareX. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
