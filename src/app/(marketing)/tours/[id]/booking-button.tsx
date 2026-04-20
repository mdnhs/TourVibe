"use client";

import { useState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface BookingButtonProps {
  tourId: string;
}

export function BookingButton({ tourId }: BookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleBookNow = async () => {
    try {
      setLoading(true);
      const { data: session } = await authClient.getSession();
      
      if (!session) {
        toast.error("Please login to book a tour");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

  return (
    <button 
      disabled={loading}
      onClick={handleBookNow}
      className="group mt-5 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 py-3.5 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-900/30 disabled:opacity-70 disabled:cursor-not-allowed"
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
  );
}
