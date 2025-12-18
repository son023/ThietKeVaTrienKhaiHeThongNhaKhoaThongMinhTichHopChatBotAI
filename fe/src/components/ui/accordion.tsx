"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";

import { cn } from "./utils";

function Accordion({
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />;
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b last:border-b-0", className)}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // 1. Layout & Animation
          "group flex flex-1 items-center justify-between py-4 font-medium transition-all outline-none text-left text-sm",
          "rounded-md px-4", // Giữ padding để nội dung không sát mép

          // 2. LOGIC MÀU SẮC (SỬA Ở ĐÂY):
          // Luôn luôn nền trắng
          "bg-white",
          // Mặc định chữ màu tối (#333), Hover chuyển sang màu Primary (#3FB5FF)
          "text-foreground hover:text-primary",

          // 3. Các trạng thái khác (Focus, Disabled, Rotate Icon)
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "disabled:pointer-events-none disabled:opacity-50",
          "[&[data-state=open]>svg]:rotate-180",

          className
        )}
        {...props}
      >
        {children}
        <ChevronDownIcon
          // Icon cũng sẽ đổi màu theo text khi hover (nhờ class group-hover)
          className="pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-200 text-muted-foreground group-hover:text-primary"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div className={cn("pt-0 pb-4", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
