"use client";

import * as React from "react";
import { DayPicker } from "react-day-picker";
import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

export function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("text-xs", className)}
      classNames={{
        months: "flex flex-col space-y-2",
        month: "space-y-2",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "font-medium text-xs",
        nav: "space-x-1 flex items-center",
        nav_button:
          "inline-flex h-6 w-6 items-center justify-center rounded-none border border-input bg-transparent p-0 text-xs text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
        nav_button_next: "ml-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-none w-8 font-normal text-[10px]",
        row: "flex w-full mt-1",
        cell:
          "relative h-7 w-7 text-center text-xs p-0 focus-within:relative focus-within:z-20",
        day: cn(
          "inline-flex h-7 w-7 items-center justify-center rounded-none border border-transparent text-xs font-normal text-foreground hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        ),
        day_today:
          "bg-accent text-accent-foreground border-accent/60 hover:bg-accent",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary/90 border-primary",
        day_outside: "text-muted-foreground/40",
        day_disabled: "text-muted-foreground/50 opacity-50",
        day_range_middle:
          "aria-selected:bg-muted aria-selected:text-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  );
}

