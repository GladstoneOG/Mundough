"use client";

import { useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { twMerge } from "tailwind-merge";

type DialogProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Dialog({ open, onClose, title, children, footer }: DialogProps) {
  const container = useMemo(() => {
    if (typeof window === "undefined") return null;
    const el = document.createElement("div");
    el.setAttribute("data-dialog-root", "");
    return el;
  }, []);

  useEffect(() => {
    if (!container || typeof window === "undefined") return;
    document.body.appendChild(container);
    return () => {
      document.body.removeChild(container);
    };
  }, [container]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open || !container) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/30 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl rounded-3xl bg-cream p-6 shadow-xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            {title ? (
              <h2 className="text-xl font-semibold text-cocoa">{title}</h2>
            ) : null}
          </div>
          <Button
            type="button"
            aria-label="Close dialog"
            variant="ghost"
            className="h-10 w-10 rounded-full bg-caramel/10 text-caramel"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className={twMerge("mt-6 space-y-4 text-sm text-cocoa/80")}>{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-3">{footer}</div> : null}
      </div>
    </div>,
    container,
  );
}
