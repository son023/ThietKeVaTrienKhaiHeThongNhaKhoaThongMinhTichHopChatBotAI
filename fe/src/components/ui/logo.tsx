import { Link } from "react-router-dom"; // 1. Bắt buộc import Link
import { cn } from "./utils";

interface LogoProps {
  collapsed?: boolean;
  className?: string;
  variant?: "header" | "sidebar";
}

export const Logo = ({
  collapsed = false,
  className,
  variant = "sidebar", // Mặc định là sidebar (chỉ trang trí)
}: LogoProps) => {
  const expandedSize = "w-10 h-10 text-xl";
  const collapsedSize = "w-8 h-8 text-base";

  // --- LOGIC XỬ LÝ ---
  // Nếu là header: Dùng thẻ 'Link' để điều hướng mượt mà (SPA)
  // Nếu là sidebar: Dùng thẻ 'div' (chỉ hiển thị)
  const Component = variant === "header" ? Link : "div";

  // Nếu là header thì cần prop 'to="/"', sidebar thì không cần gì cả
  const componentProps = variant === "header" ? { to: "/" } : {};

  return (
    // @ts-ignore: Bỏ qua lỗi check type động giữa Link và div để code gọn hơn
    <Component
      {...componentProps}
      className={cn(
        "flex items-center transition-all duration-300 group select-none",
        // Header: hiện bàn tay bấm được. Sidebar: con trỏ thường
        variant === "header" ? "cursor-pointer" : "cursor-default",
        collapsed ? "justify-center gap-0" : "gap-3",
        className
      )}
    >
      {/* --- PHẦN ICON --- */}
      <div
        className={cn(
          "bg-primary rounded-lg flex items-center justify-center shadow-sm transition-all duration-300 shrink-0",
          collapsed ? collapsedSize : expandedSize
        )}
      >
        <span className="text-white filter drop-shadow-sm">🦷</span>
      </div>

      {/* --- PHẦN CHỮ --- */}
      <div
        className={cn(
          "flex flex-col overflow-hidden transition-all duration-300",
          collapsed ? "w-0 opacity-0" : "w-auto opacity-100"
        )}
      >
        <h1
          className={cn(
            "text-xl font-bold text-[#01304e] whitespace-nowrap leading-none"
          )}
        >
          DentalCareX
        </h1>
      </div>
    </Component>
  );
};
