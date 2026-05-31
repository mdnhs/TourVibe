"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

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
}

interface ScheduleVehiclePickerProps {
  vehicles: PickerVehicle[];
  durationHours: number;
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
  durationHours,
  value,
  onChange,
  onAvailabilityChange,
}: ScheduleVehiclePickerProps) {
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<"idle" | "available" | "unavailable" | "error">("idle");
  const [message, setMessage] = useState<string>("");

  const todayStr = useMemo(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }, []);

  const set = (patch: Partial<ScheduleVehicleValue>) => {
    onChange({ ...value, ...patch });
  };

  useEffect(() => {
    const startIso = toIsoStart(value.date, value.time);
    if (!startIso || !value.vehicleId) {
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
    const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);
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
  }, [value.date, value.time, value.vehicleId, durationHours, onAvailabilityChange]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="booking-date">
            Date <span className="text-destructive">*</span>
          </Label>
          <Input
            id="booking-date"
            type="date"
            min={todayStr}
            value={value.date}
            onChange={(e) => set({ date: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="booking-time">
            Start time <span className="text-destructive">*</span>
          </Label>
          <Input
            id="booking-time"
            type="time"
            value={value.time}
            onChange={(e) => set({ time: e.target.value })}
            required
          />
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Tour duration: {durationHours} {durationHours === 1 ? "hour" : "hours"}.
      </p>

      <div className="space-y-2">
        <Label>
          Vehicle <span className="text-destructive">*</span>
        </Label>
        {vehicles.length === 0 ? (
          <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700">
            No vehicles are assigned to this tour. Contact support.
          </p>
        ) : (
          <RadioGroup
            value={value.vehicleId}
            onValueChange={(v) => set({ vehicleId: v })}
            className="gap-2"
          >
            {vehicles.map((v) => (
              <Label
                key={v.id}
                htmlFor={`veh-${v.id}`}
                className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id={`veh-${v.id}`} value={v.id} />
                {v.thumbnail ? (
                  <img
                    src={v.thumbnail}
                    alt=""
                    className="size-10 rounded object-cover border"
                  />
                ) : null}
                <div className="flex-1 text-sm">
                  <div className="font-semibold">
                    {v.make} {v.model} ({v.year})
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
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
