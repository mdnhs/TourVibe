import Link from "next/link";
import { ArrowRight, MapPinned, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface HeroProps {
  stats: { value: string; label: string }[];
  flagshipTour?: { name: string; duration: string; vehicleCount: number };
  flagshipDriver?: { name: string };
  userCount: number;
  adminCredentials: { email: string; password: string };
}

export function Hero({
  stats,
  flagshipTour,
  flagshipDriver,
  userCount,
  adminCredentials,
}: HeroProps) {
  return (
    <section className="px-6 pb-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 pt-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-8">
            <Badge className="rounded-full bg-amber-100 px-4 py-1 text-amber-800 hover:bg-amber-100">
              Better Auth + SQLite + RBAC
            </Badge>
            <div className="space-y-5">
              <h1 className="max-w-3xl font-heading text-5xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
                Road-trip booking and driver operations in one clean platform.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-slate-600">
                TourVibe helps you sell car-based tours, assign drivers, manage
                bookings and keep tourists informed through an eye-catching
                customer experience.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/signup">
                <Button className="h-12 rounded-full bg-slate-950 px-6 text-white hover:bg-slate-800">
                  Start Free Setup
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  variant="outline"
                  className="h-12 rounded-full border-amber-300 bg-amber-50 px-6 text-amber-900 hover:bg-amber-100"
                >
                  Open Dashboard
                </Button>
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-3xl border border-white/70 bg-white/80 px-5 py-4 shadow-lg shadow-slate-200/40 backdrop-blur"
                >
                  <p className="font-heading text-3xl font-semibold text-slate-950">
                    {stat.value}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 size-40 rounded-full bg-cyan-200/50 blur-3xl" />
            <div className="absolute -right-6 bottom-12 size-48 rounded-full bg-amber-200/60 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950 p-7 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
              <div className="grid gap-4">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-white/60">
                        Today’s flagship ride
                      </p>
                      <h2 className="mt-2 font-heading text-2xl font-semibold">
                        {flagshipTour?.name || "Coastal Highway Escape"}
                      </h2>
                    </div>
                    <div className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-300">
                      On schedule
                    </div>
                  </div>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                        Driver
                      </p>
                      <p className="mt-2 text-lg font-medium">
                        {flagshipDriver?.name || "Nadia Rahman"}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white/6 p-4">
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">
                        Duration
                      </p>
                      <p className="mt-2 text-lg font-medium">
                        {flagshipTour?.duration || "Full Day"}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-gradient-to-br from-amber-400 to-orange-500 p-5 text-slate-950">
                    <MapPinned className="size-5" />
                    <p className="mt-8 text-sm font-medium uppercase tracking-[0.24em]">
                      Options
                    </p>
                    <p className="mt-2 font-heading text-3xl font-semibold">
                      {flagshipTour?.vehicleCount || 12} cars
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/8 p-5">
                    <Users className="size-5 text-cyan-300" />
                    <p className="mt-8 text-sm font-medium uppercase tracking-[0.24em] text-white/50">
                      Live Guests
                    </p>
                    <p className="mt-2 font-heading text-3xl font-semibold">
                      {userCount} riders
                    </p>
                  </div>
                </div>
                <div className="rounded-[1.5rem] border border-dashed border-white/15 bg-white/5 p-5 text-sm leading-7 text-white/70">
                  Seeded super admin for local testing:
                  <span className="block font-medium text-white">
                    {adminCredentials.email}
                  </span>
                  <span className="block font-medium text-white">
                    {adminCredentials.password}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
