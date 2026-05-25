import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

/* eslint-disable react-refresh/only-export-components */
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-slate-950 text-white shadow-[0_14px_40px_rgba(15,23,42,0.18)] hover:-translate-y-0.5 hover:bg-slate-900 hover:shadow-[0_18px_50px_rgba(15,23,42,0.22)]",
        destructive:
          "bg-red-600 text-white shadow-[0_14px_40px_rgba(220,38,38,0.2)] hover:-translate-y-0.5 hover:bg-red-500",
        outline:
          "border border-slate-200 bg-white/80 text-slate-950 shadow-sm hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white",
        secondary:
          "bg-slate-100 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:bg-slate-200",
        ghost: "text-slate-700 hover:bg-slate-100 hover:text-slate-950",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2.5",
        sm: "h-9 rounded-full px-4",
        lg: "h-12 rounded-full px-6",
        icon: "h-10 w-10 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

const Button = React.forwardRef(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
