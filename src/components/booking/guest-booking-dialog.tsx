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
import { cn } from "@/lib/utils";
import { formatPrice } from "@/lib/currency";
import { isValidE164, normalizeWhatsapp } from "@/lib/whatsapp";
import {
  ScheduleVehiclePicker,
  type PickerVehicle,
  type ScheduleVehicleValue,
} from "./schedule-vehicle-picker";

interface TourPricingInfo {
  price: number;
  hourlyRate: number;
  durationHours: number;
  maxPersons: number;
  price2?: number | null;
  hourlyRate2?: number | null;
  baseHours2?: number | null;
  maxPersons2?: number | null;
}

interface GuestBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourId: string;
  tour?: TourPricingInfo;
  hourlyRate?: number;
  currency?: string;
  minHours?: number;
  maxPersons?: number;
  vehicles: PickerVehicle[];
}

export function GuestBookingDialog({
  open,
  onOpenChange,
  tourId,
  tour,
  hourlyRate = 0,
  currency,
  minHours = 1,
  maxPersons = 4,
  vehicles,
}: GuestBookingDialogProps) {
  const tourData: TourPricingInfo = useMemo(() => {
    if (tour) return tour;
    return {
      price: hourlyRate * minHours,
      hourlyRate,
      durationHours: minHours,
      maxPersons,
    };
  }, [tour, hourlyRate, minHours, maxPersons]);

  const effectiveMaxPersons = useMemo(() => {
    return tourData.maxPersons2 && tourData.maxPersons2 > tourData.maxPersons
      ? tourData.maxPersons2
      : tourData.maxPersons;
  }, [tourData]);

  const effectiveMinHours = tourData.durationHours || minHours || 1;

  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [paymentType, setPaymentType] = useState<"ADVANCE" | "FULL">("FULL");
  const [schedule, setSchedule] = useState<ScheduleVehicleValue>({
    date: "",
    time: "",
    vehicleId: "",
    hours: Math.max(effectiveMinHours, 4),
    persons: Math.min(effectiveMaxPersons, 4),
  });
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);

  const activeVariant = useMemo(() => {
    const isV2 =
      tourData.price2 != null &&
      tourData.maxPersons2 != null &&
      schedule.persons > (tourData.maxPersons || 1);

    if (isV2) {
      return {
        isV2: true,
        basePrice: tourData.price2!,
        baseHours: tourData.baseHours2 || tourData.durationHours || 1,
        extraHourlyRate: tourData.hourlyRate2 ?? 0,
        maxPersons: tourData.maxPersons2!,
      };
    }
    return {
      isV2: false,
      basePrice: tourData.price,
      baseHours: tourData.durationHours || 1,
      extraHourlyRate: tourData.hourlyRate || 0,
      maxPersons: tourData.maxPersons || 1,
    };
  }, [tourData, schedule.persons]);

  const pricingBreakdown = useMemo(() => {
    const hours = Math.max(1, schedule.hours || activeVariant.baseHours);
    const extraHours = Math.max(0, hours - activeVariant.baseHours);
    const extraPrice = Math.round(extraHours * activeVariant.extraHourlyRate * 100) / 100;
    const totalPrice = Math.round((activeVariant.basePrice + extraPrice) * 100) / 100;

    return {
      hours,
      extraHours,
      extraPrice,
      totalPrice,
    };
  }, [activeVariant, schedule.hours]);

  const total = pricingBreakdown.totalPrice;
  const advance = Math.round(total * 0.2 * 100) / 100;
  const balance = Math.round((total - advance) * 100) / 100;
  const due = paymentType === "ADVANCE" ? advance : total;

  const ready = !!schedule.date && !!schedule.time;

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
      toast.error("Pick a date and start time first");
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
          vehicleId: schedule.vehicleId || (vehicles[0]?.id ?? ""),
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

              {tourData.price2 != null ? (
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-slate-700">Select Pricing Variant</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSchedule((prev) => ({
                          ...prev,
                          persons: Math.min(prev.persons, tourData.maxPersons || 1),
                        }))
                      }
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                        !activeVariant.isV2
                          ? "border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <span className="text-xs font-bold text-slate-900">Up to {tourData.maxPersons} guests</span>
                      <span className="text-[11px] font-semibold text-emerald-600">{formatPrice(tourData.price, currency)} base</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSchedule((prev) => ({
                          ...prev,
                          persons: Math.max(prev.persons, (tourData.maxPersons || 1) + 1),
                        }))
                      }
                      className={cn(
                        "flex flex-col items-start rounded-xl border p-2.5 text-left transition-all cursor-pointer",
                        activeVariant.isV2
                          ? "border-amber-600 bg-amber-50/70 ring-2 ring-amber-600/20 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <span className="text-xs font-bold text-slate-900">Up to {tourData.maxPersons2} guests</span>
                      <span className="text-[11px] font-semibold text-amber-600">{formatPrice(tourData.price2, currency)} base</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border bg-slate-50/80 px-3.5 py-2 text-xs">
                  <span className="font-semibold text-slate-600">Group Capacity</span>
                  <span className="font-bold text-slate-900">Up to {tourData.maxPersons} guests</span>
                </div>
              )}

              <ScheduleVehiclePicker
                vehicles={vehicles}
                minHours={effectiveMinHours}
                maxPersons={effectiveMaxPersons}
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

              <div className="rounded-xl border bg-slate-50/80 p-4 space-y-2.5">
                <dl className="space-y-2 text-sm">
                  <div className="flex items-center justify-between text-slate-600">
                    <dt className="flex items-center gap-1.5 text-xs">
                      Up to {activeVariant.maxPersons} guests ({activeVariant.baseHours}h included)
                    </dt>
                    <dd className="font-semibold text-slate-900">{formatPrice(activeVariant.basePrice, currency)}</dd>
                  </div>

                  {pricingBreakdown.extraHours > 0 && (
                    <div className="flex items-center justify-between text-slate-600 text-xs">
                      <dt className="flex items-center gap-1">
                        + {pricingBreakdown.extraHours} extra hr ({formatPrice(activeVariant.extraHourlyRate, currency)}/h)
                      </dt>
                      <dd className="font-semibold text-slate-900">{formatPrice(pricingBreakdown.extraPrice, currency)}</dd>
                    </div>
                  )}

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
