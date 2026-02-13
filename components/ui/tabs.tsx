"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  onChange: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | null>(null);

type TabsProps = {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
};

export function Tabs({
  value: controlledValue,
  defaultValue,
  onValueChange,
  children,
  className,
}: TabsProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? ""
  );
  const value = controlledValue ?? uncontrolledValue;

  const handleChange = React.useCallback(
    (next: string) => {
      if (controlledValue === undefined) {
        setUncontrolledValue(next);
      }
      onValueChange?.(next);
    },
    [controlledValue, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ value, onChange: handleChange }}>
      <div data-slot="tabs" className={cn("flex flex-col gap-3", className)}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

type TabsListProps = React.HTMLAttributes<HTMLDivElement>;

export function TabsList({ className, ...props }: TabsListProps) {
  return (
    <div
      data-slot="tabs-list"
      className={cn(
        "bg-muted flex h-8 items-center gap-1 rounded-none px-1 py-1",
        className
      )}
      {...props}
    />
  );
}

type TabsTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  value: string;
};

export function TabsTrigger({
  value,
  className,
  ...props
}: TabsTriggerProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsTrigger must be used within Tabs");
  }
  const selected = ctx.value === value;
  return (
    <button
      type="button"
      data-slot="tabs-trigger"
      data-state={selected ? "active" : "inactive"}
      onClick={() => ctx.onChange(value)}
      className={cn(
        "data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:border-border text-muted-foreground inline-flex h-6 items-center rounded-none border border-transparent px-2 text-xs font-medium outline-none ring-0 focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50",
        className
      )}
      {...props}
    />
  );
}

type TabsContentProps = React.HTMLAttributes<HTMLDivElement> & {
  value: string;
};

export function TabsContent({
  value,
  className,
  ...props
}: TabsContentProps) {
  const ctx = React.useContext(TabsContext);
  if (!ctx) {
    throw new Error("TabsContent must be used within Tabs");
  }
  const selected = ctx.value === value;
  if (!selected) return null;
  return (
    <div
      data-slot="tabs-content"
      className={cn("mt-1", className)}
      {...props}
    />
  );
}

