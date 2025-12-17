import { Link } from "react-router-dom";
import { cn } from "./utils"; // Đảm bảo bạn đã có hàm cn

interface LogoProps {
  collapsed?: boolean; // Prop quyết định trạng thái thu gọn
  className?: string; // Để ghi đè style nếu cần thiết trong tương lai
}

export const Logo = ({ collapsed = false, className }: LogoProps) => {
  // Kích thước chuẩn khi mở rộng
  const expandedSize = "w-10 h-10 text-xl";
  // Kích thước khi thu nhỏ (nên nhỏ lại một chút để vừa vặn sidebar hẹp)
  const collapsedSize = "w-8 h-8 text-base";

  return (
    <Link
      to="/"
      className={cn(
        "flex items-center transition-all duration-300 group select-none",
        // Nếu collapsed thì căn giữa, nếu không thì có khoảng cách gap-3
        collapsed ? "justify-center gap-0" : "gap-3",
        className
      )}
    >
      {/* --- PHẦN ICON --- */}
      <div
        className={cn(
          "bg-primary rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 shrink-0",
          // Logic đổi kích thước dựa trên prop collapsed
          collapsed ? collapsedSize : expandedSize
        )}
      >
        <span className="text-white filter drop-shadow-sm">🦷</span>
      </div>

      {/* --- PHẦN CHỮ (Tên thương hiệu) --- */}
      {/* Sử dụng trick CSS để ẩn hiện mượt mà */}
      <div
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300",
          // Nếu collapsed: chiều rộng = 0, mờ dần.
          // Nếu expanded: chiều rộng tự động, hiện rõ.
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
      >
        <h1
          className={cn(
            "text-xl font-bold text-[#01304e] whitespace-nowrap leading-none",
            // Mẹo nhỏ: Khi hover vào logo, chữ sáng màu lên một chút cho đẹp
            "group-hover:text-primary transition-colors"
          )}
        >
          DentalCareX
        </h1>
      </div>
    </Link>
  );
};
