import type { LabelHTMLAttributes } from "react";
import { twMerge } from "tailwind-merge";

export type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={twMerge("text-sm font-medium text-cocoa/80", className)}
      {...props}
    />
  );
}
