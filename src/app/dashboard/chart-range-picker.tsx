"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { DateRange } from "react-day-picker";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const PRESETS: Array<{ value: string; label: string; days: number }> = [
  { value: "7d", label: "7d", days: 7 },
  { value: "14d", label: "14d", days: 14 },
  { value: "30d", label: "30d", days: 30 },
  { value: "90d", label: "90d", days: 90 },
];

function fmt(d: Date) {
  return d.toISOString().slice(0, 10);
}

function parseDay(s: string | null): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

interface ChartRangePickerProps {
  range: string;
  from?: string;
  to?: string;
}

export function ChartRangePicker({ range, from, to }: ChartRangePickerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = React.useState(false);
  const [draft, setDraft] = React.useState<DateRange | undefined>(() => ({
    from: parseDay(from ?? null),
    to: parseDay(to ?? null),
  }));

  const isCustom = range === "custom";

  const updateParams = (next: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [k, v] of Object.entries(next)) {
      if (v === null) params.delete(k);
      else params.set(k, v);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  };

  const setPreset = (value: string) => {
    updateParams({ range: value, from: null, to: null });
  };

  const applyCustom = () => {
    if (!draft?.from || !draft?.to) return;
    updateParams({
      range: "custom",
      from: fmt(draft.from),
      to: fmt(draft.to),
    });
    setOpen(false);
  };

  const customLabel =
    isCustom && from && to
      ? `${new Date(from).toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${new Date(
          to,
        ).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
      : "Custom";

  return (
    <div className="flex flex-wrap items-center gap-1">
      <div className="flex items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5">
        {PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => setPreset(p.value)}
            className={cn(
              "rounded-md px-2.5 py-1 text-xs font-bold transition-colors",
              range === p.value
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-8 gap-1.5 text-xs font-bold",
              isCustom && "border-primary/50 text-primary",
            )}
          >
            <CalendarIcon className="size-3.5" />
            {customLabel}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draft}
            onSelect={setDraft}
            defaultMonth={draft?.from ?? new Date()}
            disabled={{ after: new Date() }}
          />
          <div className="flex items-center justify-end gap-2 border-t border-border/60 p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setDraft(undefined)}
            >
              Clear
            </Button>
            <Button
              size="sm"
              disabled={!draft?.from || !draft?.to}
              onClick={applyCustom}
            >
              Apply
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
