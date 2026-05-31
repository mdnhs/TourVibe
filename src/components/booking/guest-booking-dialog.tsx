"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/currency";
import { isValidE164, normalizeWhatsapp } from "@/lib/whatsapp";
import {
  ScheduleVehiclePicker,
  type PickerVehicle,
  type ScheduleVehicleValue,
} from "./schedule-vehicle-picker";

interface GuestBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
  hourlyRate: number;
  currency?: string;
  minHours: number;
  vehicles: PickerVehicle[];
}

export function GuestBookingDialog({
  open,
  onOpenChange,
  tourId,
  hourlyRate,
  currency,
  minHours,
  vehicles,
}: GuestBookingDialogProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState<"ADVANCE" | "FULL">("FULL");
  const [schedule, setSchedule] = useState<ScheduleVehicleValue>({
    date: "",
    time: "",
    vehicleId: "",
    hours: minHours,
  });
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => Math.round(hourlyRate * (schedule.hours || minHours) * 100) / 100,
    [hourlyRate, schedule.hours, minHours],
  );
  const advance = Math.round(total * 0.2 * 100) / 100;
  const balance = Math.round((total - advance) * 100) / 100;

  const ready =
    !!schedule.date && !!schedule.time && !!schedule.vehicleId && available;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    const normalizedWa = normalizeWhatsapp(whatsapp);
    if (!isValidE164(normalizedWa)) {
      toast.error(
        "Enter a valid WhatsApp number in international format (e.g. +14155551234)",
      );
      return;
    }
    const trimmedEmail = email.trim();
    if (trimmedEmail && !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      toast.error("Enter a valid email address or leave it blank");
      return;
    }
    if (!ready) {
      toast.error("Pick an available date, time, and vehicle first");
      return;
    }

    setLoading(true);
    try {
      const startTime = new Date(`${schedule.date}T${schedule.time}:00`).toISOString();
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tourId,
          paymentType,
          guestName: name.trim(),
          guestEmail: trimmedEmail || undefined,
          whatsapp: normalizedWa,
          vehicleId: schedule.vehicleId,
          startTime,
          hours: schedule.hours,
        }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "VEHICLE_UNAVAILABLE") {
        toast.error(data.message);
      } else {
        toast.error(data.error || data.message || "Failed to initiate booking");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book as guest</DialogTitle>
          <DialogDescription>
            No account needed. We will use WhatsApp to confirm your booking.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="guest-name">
              Full name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guest-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              disabled={loading}
              placeholder="Jane Smith"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-whatsapp">
              WhatsApp number <span className="text-destructive">*</span>
            </Label>
            <Input
              id="guest-whatsapp"
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              required
              disabled={loading}
              placeholder="+14155551234"
            />
            <p className="text-xs text-muted-foreground">
              Include country code with leading +.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="guest-email">
              Email{" "}
              <span className="text-xs font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="guest-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              placeholder="jane@example.com"
            />
          </div>

          <div className="pt-2">
            <ScheduleVehiclePicker
              vehicles={vehicles}
              minHours={minHours}
              value={schedule}
              onChange={setSchedule}
              onAvailabilityChange={setAvailable}
            />
          </div>

          <div className="rounded-lg border bg-slate-50 p-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">
                {schedule.hours} {schedule.hours === 1 ? "hour" : "hours"} × {formatPrice(hourlyRate, currency)}
              </span>
              <span className="font-bold text-slate-900">{formatPrice(total, currency)}</span>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Label>Payment option</Label>
            <RadioGroup
              value={paymentType}
              onValueChange={(v) => setPaymentType(v as "ADVANCE" | "FULL")}
              className="gap-2"
            >
              <Label
                htmlFor="g-pay-advance"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id="g-pay-advance" value="ADVANCE" className="mt-1" />
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
                htmlFor="g-pay-full"
                className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 hover:bg-accent has-[:checked]:border-primary has-[:checked]:bg-primary/5"
              >
                <RadioGroupItem id="g-pay-full" value="FULL" className="mt-1" />
                <div className="flex-1 text-sm">
                  <div className="font-semibold">
                    Pay full amount ({formatPrice(total, currency)})
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Booking confirmed instantly.
                  </div>
                </div>
              </Label>
            </RadioGroup>
          </div>

          <DialogFooter className="pt-2">
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
