"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { AuthDialog } from "@/components/auth/auth-dialog";
import { PhoneDialog } from "@/components/booking/phone-dialog";
import { PaymentTypeDialog } from "@/components/booking/payment-type-dialog";

interface BookingButtonProps {
  tourId: string;
  total: number;
  currency?: string;
  className?: string;
}

export function BookingButton({ tourId, total, currency, className }: BookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [payOpen, setPayOpen] = useState(false);

  const submitCheckout = async (paymentType: "ADVANCE" | "FULL") => {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId, paymentType }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else if (data.error === "PHONE_REQUIRED") {
        setPayOpen(false);
        setPhoneOpen(true);
      } else {
        toast.error(data.error || "Failed to initiate booking");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const openPaymentDialog = async () => {
    const { data: session } = await authClient.getSession();
    if (!session) {
      setAuthOpen(true);
      return;
    }
    setPayOpen(true);
  };

  return (
    <>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={() => setPayOpen(true)}
      />
      <PhoneDialog
        open={phoneOpen}
        onOpenChange={setPhoneOpen}
        onSuccess={() => setPayOpen(true)}
      />
      <PaymentTypeDialog
        open={payOpen}
        onOpenChange={setPayOpen}
        total={total}
        currency={currency}
        loading={loading}
        onConfirm={submitCheckout}
      />
      <button
        disabled={loading}
        onClick={openPaymentDialog}
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
