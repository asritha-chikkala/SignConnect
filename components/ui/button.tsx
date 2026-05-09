import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 focus-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-cyan-300 via-cyan-400 to-violet-400 text-black shadow-[0_0_30px_rgba(0,229,255,0.3)] hover:brightness-110 active:scale-[0.99]",
        outline:
          "glass border border-cyan-300/30 text-cyan-100 hover:border-cyan-300/60 hover:bg-cyan-200/10",
        ghost: "text-white hover:bg-white/10",
        danger:
          "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_0_30px_rgba(255,69,96,0.35)] hover:brightness-110",
      },
      size: {
        default: "h-10",
        lg: "h-12 px-5 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
