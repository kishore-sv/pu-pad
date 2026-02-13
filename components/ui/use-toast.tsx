"use client";

import { useCallback } from "react";
import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

export function useToast() {
  const toast = useCallback((options: ToastOptions) => {
    const fn =
      options.variant === "destructive"
        ? sonnerToast.error
        : sonnerToast.success;

    fn(options.title ?? "", {
      description: options.description,
    });
  }, []);

  return { toast };
}

export const toast = sonnerToast;


