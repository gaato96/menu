"use client";

import type { ButtonHTMLAttributes } from "react";

import { buttonVariants, type ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * A plain <button type="submit"> that blocks the enclosing <form>'s Server
 * Action from firing unless the browser confirm() is accepted. No client
 * state, no dialog component — this is the one place in the ABM screens
 * where a native confirm() is the right amount of ceremony for "delete this
 * forever, no undo".
 */
export function ConfirmSubmitButton({
  confirmMessage,
  className,
  variant,
  size,
  children,
  ...props
}: ButtonProps & { confirmMessage: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="submit"
      className={cn(buttonVariants({ variant, size }), className)}
      onClick={(event) => {
        if (!window.confirm(confirmMessage)) event.preventDefault();
      }}
      {...props}
    >
      {children}
    </button>
  );
}
