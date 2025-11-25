"use client";

import { Toaster } from "react-hot-toast";

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: "#fdf7f2",
          color: "#3a220f",
          borderRadius: "999px",
          paddingInline: "1.25rem",
        },
        success: {
          iconTheme: {
            primary: "#c7702e",
            secondary: "#fff3e6",
          },
        },
      }}
    />
  );
}
