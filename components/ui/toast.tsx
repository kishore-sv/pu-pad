"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-none border p-3 pr-8 text-xs shadow-sm transition-all data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full",
  {
    variants: {
      variant: {
        default: "bg-background text-foreground border-border",
        destructive:
          "group destructive border-destructive/40 bg-destructive/10 text-destructive dark:border-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const ToastContext = React.createContext<{
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  onDismiss?: () => void;
} | null>(null);

type ToastProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof toastVariants>;

export function Toast({ className, variant, ...props }: ToastProps) {
  return (
    <div
      data-slot="toast"
      className={cn(toastVariants({ variant }), className)}
      {...props}
    />
  );
}

export function ToastTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="toast-title"
      className={cn("font-medium leading-tight", className)}
      {...props}
    />
  );
}

export function ToastDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="toast-description"
      className={cn("text-muted-foreground mt-1", className)}
      {...props}
    />
  );
}

export function ToastCloseButton({
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      aria-label="Close"
      data-slot="toast-close"
      className={cn(
        "ring-ring/50 hover:bg-muted absolute right-1 top-1 rounded-none px-2 py-1 text-xs text-muted-foreground outline-none ring-0 focus-visible:ring-1",
        className
      )}
      {...props}
    >
      ×
    </button>
  );
}

export type ToastState = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

type ToastProviderProps = {
  children: React.ReactNode;
};

type ToastInternalState = ToastState & {
  open: boolean;
};

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = React.useState<ToastInternalState[]>([]);

  const dismiss = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = React.useCallback(
    (toast: Omit<ToastState, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [
        ...prev,
        {
          ...toast,
          id,
          open: true,
        },
      ]);
      setTimeout(() => dismiss(id), 4000);
    },
    [dismiss]
  );

  const value = React.useMemo(
    () => ({
      push,
    }),
    [push]
  );

  return (
    <ToastDispatchContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center space-y-2 pb-4 sm:items-end sm:px-4">
        {toasts.map((toast) => (
          <ToastContext.Provider
            key={toast.id}
            value={{
              id: toast.id,
              title: toast.title,
              description: toast.description,
              variant: toast.variant,
              onDismiss: () => dismiss(toast.id),
            }}
          >
            <Toast variant={toast.variant}>
              <div className="flex flex-1 flex-col">
                {toast.title && (
                  <ToastTitle>{toast.title}</ToastTitle>
                )}
                {toast.description && (
                  <ToastDescription>{toast.description}</ToastDescription>
                )}
              </div>
              <ToastCloseButton onClick={() => dismiss(toast.id)} />
            </Toast>
          </ToastContext.Provider>
        ))}
      </div>
    </ToastDispatchContext.Provider>
  );
}

const ToastDispatchContext = React.createContext<{
  push: (toast: Omit<ToastState, "id">) => void;
} | null>(null);

export function useToastDispatch() {
  const ctx = React.useContext(ToastDispatchContext);
  if (!ctx) {
    throw new Error("useToastDispatch must be used within ToastProvider");
  }
  return ctx;
}

