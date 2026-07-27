import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

/**
 * Sizes are floors, not suggestions. The person tapping these is standing at a
 * counter with one hand free, so nothing goes below 44px and the board uses 56.
 */
const button = cva(
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand",
  {
    variants: {
      variant: {
        primary: "bg-brand text-brand-fg hover:brightness-95 active:brightness-90",
        neutral: "bg-ink-900 text-ink-50 hover:bg-ink-700",
        outline: "border border-ink-200 bg-white text-ink-900 hover:bg-ink-50",
        ghost: "text-ink-700 hover:bg-ink-100",
        danger: "bg-danger text-white hover:brightness-95",
      },
      size: {
        sm: "min-h-9 px-3 text-sm",
        md: "min-h-touch px-4 text-sm",
        lg: "min-h-touch-lg px-6 text-base",
        icon: "size-touch",
      },
      block: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof button>;

export function Button({ className, variant, size, block, ...props }: ButtonProps) {
  return <button className={cn(button({ variant, size, block }), className)} {...props} />;
}

export { button as buttonVariants };
