"use client";

import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon, Star } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar, CalendarDayButton } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DateRangePickerProps {
  className?: string;
  date: DateRange | undefined;
  setDate: (date: DateRange | undefined) => void;
  dayCounts?: Record<string, number>;
}

export function DateRangePicker({
  className,
  date,
  setDate,
  dayCounts,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Use taller cells only when we have counts to show
  const cellSize = dayCounts ? "60px" : "40px";

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen} modal={false}>
        <PopoverTrigger>
          <Button
            id="date"
            variant="outline"
            size="sm"
            className={cn(
              "w-[240px] justify-start text-left font-normal h-8",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM dd, y")} &ndash;{" "}
                  {format(date.to, "MMM dd, y")}
                </>
              ) : (
                format(date.from, "MMM dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start" sideOffset={8}>
          <Calendar
            mode="range"
            defaultMonth={date?.from ?? new Date()}
            selected={date}
            onSelect={setDate}
            numberOfMonths={1}
            captionLayout="label"
            style={
              {
                "--cell-size": dayCounts ? "44px" : "28px",
              } as React.CSSProperties
            }
            components={
              dayCounts
                ? {
                    DayButton: ({ children, modifiers, day, ...props }) => {
                      const key = format(day.date, "yyyy-MM-dd");
                      const count = !modifiers.outside
                        ? dayCounts[key]
                        : undefined;
                      const hasCount = count != null && count > 0;

                      return (
                        <CalendarDayButton
                          day={day}
                          modifiers={modifiers}
                          {...props}
                          className={cn(
                            props.className,
                            !hasCount && "justify-center",
                          )}
                        >
                          <span>{children}</span>
                          {hasCount && (
                            <span className="flex items-center gap-0.5 text-[10px] font-bold leading-none text-yellow-500">
                              <Star className="size-2 fill-current" />
                              {count}
                            </span>
                          )}
                        </CalendarDayButton>
                      );
                    },
                  }
                : undefined
            }
          />
          {date && (
            <div className="border-t px-3 py-2 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setDate(undefined);
                  setOpen(false);
                }}
              >
                Clear
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
