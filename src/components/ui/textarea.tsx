"use client";

import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={twMerge(
      "w-full rounded-xl border border-caramel/30 bg-white/90 px-4 py-2 text-sm text-cocoa shadow-sm placeholder:text-cocoa/60 focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/30",
      className
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
