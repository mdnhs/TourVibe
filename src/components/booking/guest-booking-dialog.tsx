"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock, Loader2, Lock, ShieldCheck, UserRound, Users } from "lucide-react";
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
  maxPersons: number;
  vehicles: PickerVehicle[];
}

export function GuestBookingDialog({
  open,
  onOpenChange,
  tourId,
  hourlyRate,
  currency,
  minHours,
  maxPersons,
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
    hours: Math.max(minHours, 6),
    persons: Math.min(maxPersons, 4),
  });
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => Math.round(hourlyRate * (schedule.hours || minHours) * 100) / 100,
    [hourlyRate, schedule.hours, minHours],
  );
  const advance = Math.round(total * 0.2 * 100) / 100;
  const balance = Math.round((total - advance) * 100) / 100;
  const due = paymentType === "ADVANCE" ? advance : total;

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
          persons: schedule.persons,
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
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-2xl max-h-[92vh]">
        {/* Header */}
        <DialogHeader className="border-b bg-linear-to-br from-slate-50 to-white px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-linear-to-br from-indigo-500 to-violet-600 text-white shadow-sm">
              <UserRound className="size-5" />
            </div>
            <div className="space-y-0.5">
              <DialogTitle className="text-lg">Book as guest</DialogTitle>
              <DialogDescription className="text-xs">
                No account needed · we confirm via WhatsApp
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[calc(92vh-8rem)] flex-col">
          <div className="grid gap-5 overflow-y-auto px-6 py-5 sm:grid-cols-[1fr_300px]">
            {/* Left: contact + schedule */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <UserRound className="size-3.5" /> Your details
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="guest-name" className="text-xs">
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
                <div className="space-y-1.5">
                  <Label htmlFor="guest-whatsapp" className="text-xs">
                    WhatsApp <span className="text-destructive">*</span>
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
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="guest-email" className="text-xs">
                  Email{" "}
                  <span className="font-normal text-muted-foreground">(optional)</span>
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

              <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
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
                    htmlFor="g-pay-full"
                    className="relative flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border-2 p-3 transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id="g-pay-full" value="FULL" className="sr-only" />
                    <div className="flex w-full items-center justify-between">
                      <span className="text-sm font-semibold">Pay in full</span>
                      <span className="text-sm font-bold">{formatPrice(total, currency)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">Booking confirmed instantly.</span>
                  </Label>
                  <Label
                    htmlFor="g-pay-advance"
                    className="relative flex cursor-pointer flex-col items-start gap-0.5 rounded-xl border-2 p-3 transition-colors hover:bg-accent/50 has-[:checked]:border-primary has-[:checked]:bg-primary/5"
                  >
                    <RadioGroupItem id="g-pay-advance" value="ADVANCE" className="sr-only" />
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
