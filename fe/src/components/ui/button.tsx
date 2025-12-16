import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-neutral-surface disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-white hover:bg-primary-light shadow-md shadow-primary/20",
        primary:
          "bg-primary text-white hover:bg-primary-light shadow-md shadow-primary/20",
        secondary:
          "bg-secondary-deep text-white hover:bg-secondary-deep/90 shadow-md shadow-secondary-deep/20",
        outline:
          "border border-primary text-primary bg-transparent hover:bg-primary hover:text-white",
        ghost:
          "bg-transparent text-primary hover:bg-primary hover:text-white",
        accent:
          "bg-accent-pink text-white hover:bg-[#e736a7] shadow-md shadow-accent-pink/25",
      },
      size: {
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
