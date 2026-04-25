"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, MapPin, Star, Users, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { formatPrice } from "@/lib/currency";
import { AuthDialog } from "@/components/auth/auth-dialog";

interface BookingBarProps {
  tourId: string;
  name: string;
  price: number;
  duration: string;
  maxPersons: number;
  rating: string | null;
  currency?: string;
}

export function BookingBar({ tourId, name, price, duration, maxPersons, rating, currency }: BookingBarProps) {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const initiateBooking = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tourId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
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

  const handleBookNow = async () => {
    const { data: session } = await authClient.getSession();

    if (!session) {
      setAuthOpen(true);
      return;
    }

    await initiateBooking();
  };

  return (
    <>
      <AuthDialog
        open={authOpen}
        onOpenChange={setAuthOpen}
        onSuccess={initiateBooking}
      />
      <div
        className={`fixed bottom-0 inset-x-0 z-50 px-4 pb-4 sm:px-6 transition-all duration-300
          ${visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0 pointer-events-none"}`}
      >
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-2xl border border-white/80 bg-white/95 shadow-2xl shadow-slate-900/15 backdrop-blur-md">
            <div className="h-1 w-full bg-linear-to-r from-amber-400 via-orange-500 to-cyan-500" />
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              {/* Tour name + price */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="hidden sm:flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30">
                  <MapPin className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-slate-950 leading-none">{name}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">
                    <span className="font-heading font-extrabold text-slate-950">
                      {formatPrice(price, currency)}
                    </span>
                    {" "}· per person · all inclusive
                  </p>
                </div>
              </div>

              {/* Meta pills */}
              <div className="hidden md:flex items-center gap-2 shrink-0">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  <Clock className="size-3" />{duration}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  <Users className="size-3" />Up to {maxPersons}
                </span>
                {rating && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700">
                    <Star className="size-3 fill-amber-500 text-amber-500" />{rating}
                  </span>
                )}
              </div>

              {/* CTA */}
              <button
                disabled={loading}
                onClick={handleBookNow}
                className="group shrink-0 inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed"
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
