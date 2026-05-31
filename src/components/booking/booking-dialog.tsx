"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
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
  vehicles: PickerVehicle[];
  loading?: boolean;
  onConfirm: (payload: {
    paymentType: "ADVANCE" | "FULL";
    vehicleId: string;
    startTime: string;
    hours: number;
  }) => void;
}

export function BookingDialog({
  open,
  onOpenChange,
  hourlyRate,
  currency,
  minHours,
  vehicles,
  loading,
  onConfirm,
}: BookingDialogProps) {
  const [schedule, setSchedule] = useState<ScheduleVehicleValue>({
    date: "",
    time: "",
    vehicleId: "",
    hours: minHours,
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
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book this tour</DialogTitle>
          <DialogDescription>
            Rate: {formatPrice(hourlyRate, currency)} / hour. Total updates with selected hours.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <ScheduleVehiclePicker
            vehicles={vehicles}
            minHours={minHours}
            value={schedule}
            onChange={setSchedule}
            onAvailabilityChange={setAvailable}
          />

          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                {schedule.hours} {schedule.hours === 1 ? "hour" : "hours"} × {formatPrice(hourlyRate, currency)}
              </span>
              <span className="font-bold text-slate-900">{formatPrice(total, currency)}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Payment option</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(v) => setPaymentType(v as "ADVANCE" | "FULL")}
              className="gap-2"
            >
              <Label
                htmlFor="pay-advance"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id="pay-advance" value="ADVANCE" className="mt-1" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold">
                    Pay 20% advance ({formatPrice(advance, currency)})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Balance {formatPrice(balance, currency)} due before tour date.
                  </div>
                </div>
              </Label>
              <Label
                htmlFor="pay-full"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id="pay-full" value="FULL" className="mt-1" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold">
                    Pay full ({formatPrice(total, currency)})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Booking confirmed instantly.
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !ready}>
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Continue to payment"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
