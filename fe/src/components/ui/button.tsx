import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-surface disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        // DEFAULT: Nút chính.
        // Hover: Dùng màu strong (đậm hơn) để tạo cảm giác bấm.
        // Shadow: Shadow màu primary tạo hiệu ứng phát sáng nhẹ.
        default:
          "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-strong hover:shadow-primary/40",

        // PRIMARY: (Giống Default - giữ lại để tương thích ngược nếu cần)
        primary:
          "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary-strong hover:shadow-primary/40",

        // DESTRUCTIVE: Nút hành động nguy hiểm (Xóa/Hủy)
        destructive: "bg-red-500 text-white shadow-md hover:bg-red-600",

        // OUTLINE: Nút phụ.
        // Bình thường: Viền xanh, nền trong suốt.
        // Hover: "Fill" đầy màu xanh, chữ trắng.
        outline:
          "border-2 border-primary bg-white text-primary hover:bg-primary hover:text-white hover:border-primary",

        // SECONDARY: Nút phụ thứ cấp.
        // Dùng màu secondary (Deep Blue/Beige) tùy setup của bạn.
        secondary: "bg-secondary text-white shadow-md hover:bg-secondary/90",

        // GHOST: Dùng cho Navbar/Sidebar.
        // Bình thường: Nền trong suốt, Chữ xanh (hoặc màu xám đậm).
        // Hover: Nền Primary, Chữ Trắng (Đúng yêu cầu).
        ghost:
          "bg-transparent text-primary hover:bg-primary hover:text-white hover:shadow-md",

        // LINK: Dạng link thuần túy
        link: "text-primary underline-offset-4 hover:underline",

        // ACCENT: Nút nhấn đặc biệt (CTA Sale/Hot)
        accent:
          "bg-accent-pink text-white shadow-lg shadow-accent-pink/30 hover:bg-[#e736a7]",

        // SUBTLE: Nút chìm (Text only)
        // Bình thường: Nền trong, chữ Primary.
        // Hover: Nền vẫn trong, chữ đậm hơn (Primary Strong).
        // Active (Click): Chữ đậm hơn nữa (Dark Blue).
        subtle:
          "bg-transparent text-primary hover:bg-transparent hover:text-primary-strong active:text-[#004B7D]",
      },
      size: {
        msm: "h-8 text-sm",
        sm: "h-9 px-3 text-sm",
        default: "h-11 px-4 text-base",
        lg: "h-12 px-5 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
