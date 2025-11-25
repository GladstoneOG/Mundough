"use client";

import { forwardRef } from "react";
import type { ButtonHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "outline" | "ghost";
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const base = "inline-flex items-center justify-center gap-2 rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-60";
    type Variant = NonNullable<ButtonProps["variant"]>;
    const variants: Record<Variant, string> = {
      primary:
        "bg-caramel text-cream shadow-sm hover:bg-caramel/90 focus-visible:outline-cocoa",
      outline:
        "border border-caramel/40 bg-transparent text-caramel hover:bg-caramel/10 focus-visible:outline-caramel",
      ghost:
        "text-caramel hover:bg-caramel/10 focus-visible:outline-caramel",
    };

    return (
      <button
        ref={ref}
        className={twMerge(base, variants[variant], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
