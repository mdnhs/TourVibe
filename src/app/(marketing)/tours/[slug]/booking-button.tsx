"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { WhatsappDialog } from "@/components/booking/whatsapp-dialog";
import { BookingDialog } from "@/components/booking/booking-dialog";
import { GuestBookingDialog } from "@/components/booking/guest-booking-dialog";
import type { PickerVehicle } from "@/components/booking/schedule-vehicle-picker";

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

interface BookingButtonProps {
  tourId: string;
  tour?: TourPricingInfo;
  hourlyRate?: number;
  currency?: string;
  minHours?: number;
  maxPersons?: number;
  vehicles: PickerVehicle[];
  className?: string;
}

export function BookingButton({
  tourId,
  tour,
  hourlyRate = 0,
  currency,
  minHours = 1,
  maxPersons = 4,
  vehicles,
  className,
}: BookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [whatsappOpen, setWhatsappOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);
  const [guestOpen, setGuestOpen] = useState(false);

  const submitCheckout = async (payload: {
    paymentType: "ADVANCE" | "FULL";
    vehicleId: string;
    startTime: string;
    hours: number;
    persons: number;
  }) => {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId, ...payload }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "WHATSAPP_REQUIRED") {
        setBookingOpen(false);
        setWhatsappOpen(true);
      } else if (data.error === "VEHICLE_UNAVAILABLE") {
        toast.error(data.message);
      } else {
        toast.error(data.error || data.message || "Failed to initiate booking");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      setGuestOpen(true);
      return;
    }
    setBookingOpen(true);
  };

  return (
    <>
      <WhatsappDialog
        open={whatsappOpen}
        onOpenChange={setWhatsappOpen}
        onSuccess={() => setBookingOpen(true)}
      />
      <BookingDialog
        open={bookingOpen}
        onOpenChange={setBookingOpen}
        tour={tour}
        hourlyRate={hourlyRate}
        currency={currency}
        minHours={minHours}
        maxPersons={maxPersons}
        vehicles={vehicles}
        loading={loading}
        onConfirm={submitCheckout}
      />
      <GuestBookingDialog
        open={guestOpen}
        onOpenChange={setGuestOpen}
        tourId={tourId}
        tour={tour}
        hourlyRate={hourlyRate}
        currency={currency}
        minHours={minHours}
        maxPersons={maxPersons}
        vehicles={vehicles}
      />
      <button
        disabled={loading}
        onClick={handleBookNow}
        className={`group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-bold text-slate-950 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-100 disabled:opacity-70 disabled:cursor-not-allowed${className ? ` ${className}` : " mt-5 w-full"}`}
      >
        {loading ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            Book this tour
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </>
        )}
      </button>
    </>
  );
}
