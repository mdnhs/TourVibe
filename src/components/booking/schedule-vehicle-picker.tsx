"use client";

import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { AlertTriangle, CalendarIcon, CheckCircle2, Loader2, Minus, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const TIME_SLOTS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2);
  const m = i % 2 === 0 ? "00" : "30";
  const value = `${String(h).padStart(2, "0")}:${m}`;
  const period = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return { value, label: `${h12}:${m} ${period}` };
});

export interface PickerVehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  thumbnail?: string;
}

export interface ScheduleVehicleValue {
  date: string;
  time: string;
  vehicleId: string;
  hours: number;
  persons: number;
}

interface ScheduleVehiclePickerProps {
  vehicles: PickerVehicle[];
  minHours: number;
  maxHours?: number;
  maxPersons: number;
  value: ScheduleVehicleValue;
  onChange: (next: ScheduleVehicleValue) => void;
  onAvailabilityChange?: (available: boolean) => void;
}

function toIsoStart(date: string, time: string): string | null {
  if (!date || !time) return null;
  const dt = new Date(`${date}T${time}:00`);
  if (isNaN(dt.getTime())) return null;
  return dt.toISOString();
}

export function ScheduleVehiclePicker({
  vehicles,
  minHours,
  maxHours = 24,
  maxPersons,
  value,
  onChange,
  onAvailabilityChange,
}: ScheduleVehiclePickerProps) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "available" | "unavailable" | "error">("idle");
  const [message, setMessage] = useState<string>("");
  const [dateOpen, setDateOpen] = useState(false);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const set = (patch: Partial<ScheduleVehicleValue>) => {
    onChange({ ...value, ...patch });
  };

  const selectedDate = value.date
    ? (() => {
        const [y, m, d] = value.date.split("-").map(Number);
        return new Date(y, m - 1, d);
      })()
    : undefined;

  const hours = value.hours || minHours;
  const decHours = () => set({ hours: Math.max(minHours, hours - 1) });
  const incHours = () => set({ hours: Math.min(maxHours, hours + 1) });

  const persons = value.persons || 1;
  const decPersons = () => set({ persons: Math.max(1, persons - 1) });
  const incPersons = () => set({ persons: Math.min(maxPersons, persons + 1) });

  useEffect(() => {
    const startIso = toIsoStart(value.date, value.time);
    if (!startIso || !value.vehicleId || !hours) {
      setStatus("idle");
      setMessage("");
      onAvailabilityChange?.(false);
      return;
    }
    const start = new Date(startIso);
    if (start.getTime() < Date.now()) {
      setStatus("error");
      setMessage("Start time must be in the future.");
      onAvailabilityChange?.(false);
      return;
    }
    const end = new Date(start.getTime() + hours * 60 * 60 * 1000);
    const ctrl = new AbortController();
    setChecking(true);
    fetch(
      `/api/vehicles/availability?vehicleId=${encodeURIComponent(value.vehicleId)}&start=${encodeURIComponent(start.toISOString())}&end=${encodeURIComponent(end.toISOString())}`,
      { signal: ctrl.signal },
    )
      .then((r) => r.json())
      .then((data) => {
        if (data.available) {
          setStatus("available");
          setMessage("Vehicle available for this slot.");
          onAvailabilityChange?.(true);
        } else {
          setStatus("unavailable");
          setMessage(data.message || "Unavailable");
          onAvailabilityChange?.(false);
        }
      })
      .catch((err) => {
        if (err.name === "AbortError") return;
        setStatus("error");
        setMessage("Could not check availability. Try again.");
        onAvailabilityChange?.(false);
      })
      .finally(() => setChecking(false));

    return () => ctrl.abort();
  }, [value.date, value.time, value.vehicleId, hours, onAvailabilityChange]);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-date" className="text-xs">
            Date <span className="text-destructive">*</span>
          </Label>
          <Popover open={dateOpen} onOpenChange={setDateOpen} modal={false}>
            <PopoverTrigger
              render={
                <Button
                  id="booking-date"
                  type="button"
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !selectedDate && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="size-4 shrink-0" />
                  {selectedDate ? format(selectedDate, "PP") : "Pick a date"}
                </Button>
              }
            />
            <PopoverContent className="z-60 w-auto p-0" align="start" sideOffset={8}>
              <Calendar
                mode="single"
                defaultMonth={selectedDate ?? today}
                selected={selectedDate}
                onSelect={(d) => {
                  set({ date: d ? format(d, "yyyy-MM-dd") : "" });
                  setDateOpen(false);
                }}
                disabled={(d) => d < today}
                autoFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="booking-time" className="text-xs">
            Start time <span className="text-destructive">*</span>
          </Label>
          <Select value={value.time} onValueChange={(v) => set({ time: v ?? "" })}>
            <SelectTrigger id="booking-time" className="w-full">
              <SelectValue placeholder="Pick a time" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {TIME_SLOTS.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs">
            Duration{" "}
            <span className="font-normal text-muted-foreground">(min {minHours}h)</span>
          </Label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={decHours}
              disabled={hours <= minHours}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-l-md border border-input bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease hours"
            >
              <Minus className="size-4" />
            </button>
            <Input
              type="number"
              min={minHours}
              max={maxHours}
              value={hours}
              onChange={(e) => {
                const v = parseInt(e.target.value || "0", 10);
                if (!Number.isFinite(v)) return;
                set({ hours: Math.min(maxHours, Math.max(minHours, v)) });
              }}
              className="h-9 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={incHours}
              disabled={hours >= maxHours}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-r-md border border-input bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase hours"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">
            Persons{" "}
            <span className="font-normal text-muted-foreground">(max {maxPersons})</span>
          </Label>
          <div className="flex items-center">
            <button
              type="button"
              onClick={decPersons}
              disabled={persons <= 1}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-l-md border border-input bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Decrease persons"
            >
              <Minus className="size-4" />
            </button>
            <Input
              type="number"
              min={1}
              max={maxPersons}
              value={persons}
              onChange={(e) => {
                const v = parseInt(e.target.value || "0", 10);
                if (!Number.isFinite(v)) return;
                set({ persons: Math.min(maxPersons, Math.max(1, v)) });
              }}
              className="h-9 rounded-none border-x-0 text-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              onClick={incPersons}
              disabled={persons >= maxPersons}
              className="inline-flex size-9 shrink-0 items-center justify-center rounded-r-md border border-input bg-background text-foreground hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Increase persons"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label className="flex items-center justify-between text-xs">
          <span>
            Vehicle <span className="text-destructive">*</span>
          </span>
          {vehicles.length > 0 && (
            <span className="font-normal text-muted-foreground">
              {vehicles.length} available
            </span>
          )}
        </Label>
        {vehicles.length === 0 ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            No vehicles are assigned to this tour. Contact support.
          </p>
        ) : (
          <RadioGroup
            value={value.vehicleId}
            onValueChange={(v) => set({ vehicleId: v })}
            className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto pr-1"
          >
            {vehicles.map((v) => (
              <Label
                key={v.id}
                htmlFor={`veh-${v.id}`}
                className="flex cursor-pointer items-center gap-2 rounded-lg border p-2 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id={`veh-${v.id}`} value={v.id} className="shrink-0" />
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="size-9 shrink-0 rounded object-cover border"
                  />
                ) : null}
                <div className="min-w-0 flex-1 text-xs">
                  <div className="truncate font-semibold">
                    {v.make} {v.model}
                  </div>
                  <div className="truncate text-[11px] text-muted-foreground font-mono">
                    {v.licensePlate}
                  </div>
                </div>
              </Label>
            ))}
          </RadioGroup>
        )}
      </div>

      {value.date && value.time && value.vehicleId && (
        <div
          className={
            "flex items-start gap-2 rounded-md p-3 text-xs " +
            (status === "available"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : status === "unavailable" || status === "error"
                ? "border border-red-200 bg-red-50 text-red-800"
                : "border border-slate-200 bg-slate-50 text-slate-600")
          }
        >
          {checking ? (
            <Loader2 className="size-4 animate-spin shrink-0" />
          ) : status === "available" ? (
            <CheckCircle2 className="size-4 shrink-0" />
          ) : (
            <AlertTriangle className="size-4 shrink-0" />
          )}
          <span>{checking ? "Checking availability…" : message}</span>
        </div>
      )}
    </div>
  );
}
