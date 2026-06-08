"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Loader2, Lock, MapPin, ShieldCheck, Users } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/currency";
import {
  ScheduleVehiclePicker,
  type PickerVehicle,
  type ScheduleVehicleValue,
} from "./schedule-vehicle-picker";

interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hourlyRate: number;
  currency?: string;
  minHours: number;
  maxPersons: number;
  vehicles: PickerVehicle[];
  loading?: boolean;
  onConfirm: (payload: {
    paymentType: "ADVANCE" | "FULL";
    vehicleId: string;
    startTime: string;
    hours: number;
    persons: number;
  }) => void;
}

export function BookingDialog({
  open,
  onOpenChange,
  hourlyRate,
  currency,
  minHours,
  maxPersons,
  vehicles,
  loading,
  onConfirm,
}: BookingDialogProps) {
  const [schedule, setSchedule] = useState<ScheduleVehicleValue>({
    date: "",
    time: "",
    vehicleId: "",
    hours: Math.max(minHours, 6),
    persons: Math.min(maxPersons, 4),
  });
  const [available, setAvailable] = useState(false);
  const [paymentType, setPaymentType] = useState<"ADVANCE" | "FULL">("FULL");

  const total = useMemo(
    () => Math.round(hourlyRate * (schedule.hours || minHours) * 100) / 100,
    [hourlyRate, schedule.hours, minHours],
  );
  const advance = Math.round(total * 0.2 * 100) / 100;
  const balance = Math.round((total - advance) * 100) / 100;

  const ready =
    !!schedule.date && !!schedule.time && !!schedule.vehicleId && available;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    const startTime = new Date(`${schedule.date}T${schedule.time}:00`).toISOString();
    onConfirm({
      paymentType,
      vehicleId: schedule.vehicleId,
      startTime,
      hours: schedule.hours,
      persons: schedule.persons,
    });
  };

  const due = paymentType === "ADVANCE" ? advance : total;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl max-h-[92vh]">
        {/* Header */}
        <DialogHeader className="border-b bg-linear-to-br from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-emerald-500 to-teal-600 text-white shadow-sm">
              <MapPin className="size-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg">Book this tour</DialogTitle>
              <DialogDescription className="text-xs">
                {formatPrice(hourlyRate, currency)} / hour · secure checkout
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-8rem)] flex-col">
          <div className="grid gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-[1fr_300px]">
            {/* Left: trip details */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock className="size-3.5" /> Trip details
              </div>
              <ScheduleVehiclePicker
                vehicles={vehicles}
                minHours={minHours}
                maxPersons={maxPersons}
                value={schedule}
                onChange={setSchedule}
                onAvailabilityChange={setAvailable}
              />
            </div>

            {/* Right: summary + payment */}
            <div className="space-y-4 sm:border-l sm:pl-5">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <ShieldCheck className="size-3.5" /> Order summary
              </div>

              <div className="rounded-xl border bg-slate-50/80 p-4">
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <dt className="flex items-center gap-1.5">
                      <Clock className="size-3.5 text-slate-400" />
                      {schedule.hours} {schedule.hours === 1 ? "hour" : "hours"} × {formatPrice(hourlyRate, currency)}
                    </dt>
                    <dd>{formatPrice(total, currency)}</dd>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <dt className="flex items-center gap-1.5">
                      <Users className="size-3.5 text-slate-400" />
                      {schedule.persons} {schedule.persons === 1 ? "guest" : "guests"}
                    </dt>
                    <dd className="text-slate-400">included</dd>
                  </div>
                  <div className="my-1 border-t border-dashed" />
                  <div className="flex items-end justify-between">
                    <dt className="font-semibold text-slate-900">Total</dt>
                    <dd className="text-xl font-extrabold text-slate-900">{formatPrice(total, currency)}</dd>
                  </div>
                  {paymentType === "ADVANCE" && (
                    <div className="flex items-center justify-between rounded-lg bg-amber-50 px-2.5 py-1.5 text-xs font-medium text-amber-700">
                      <span>Due now (20%)</span>
                      <span>{formatPrice(advance, currency)}</span>
                    </div>
                  )}
                </dl>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Payment option
                </Label>
                <RadioGroup
                  value={paymentType}
                  onValueChange={(v) => setPaymentType(v as "ADVANCE" | "FULL")}
                  className="gap-2"
                >
                  <Label
                    htmlFor="pay-full"
                    className="relative flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border-2 p-3 transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id="pay-full" value="FULL" className="sr-only" />
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">Pay in full</span>
                      <span className="text-sm font-bold">{formatPrice(total, currency)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Booking confirmed instantly.</span>
                  </Label>
                  <Label
                    htmlFor="pay-advance"
                    className="relative flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border-2 p-3 transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id="pay-advance" value="ADVANCE" className="sr-only" />
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">20% advance</span>
                      <span className="text-sm font-bold">{formatPrice(advance, currency)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {formatPrice(balance, currency)} due before tour date.
                    </span>
                  </Label>
                </RadioGroup>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="space-y-3 border-t bg-slate-50/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <span className="text-slate-500">Due now</span>
                <span className="ml-2 text-lg font-bold text-slate-900">{formatPrice(due, currency)}</span>
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading || !ready} className="min-w-44">
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="size-3.5" />
                      Continue to payment
                    </>
                  )}
                </Button>
              </DialogFooter>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <CheckCircle2 className="size-3 text-emerald-500" />
              Secure payment via Stripe · Instant confirmation
            </p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
