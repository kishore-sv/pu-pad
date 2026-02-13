"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      richColors
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast: "rounded-none text-xs",
        },
      }}
    />
  );
}

