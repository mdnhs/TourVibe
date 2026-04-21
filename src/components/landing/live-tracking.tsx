"use client";

import { Navigation, Wifi } from "lucide-react";
import { DriverTrackerMap } from "@/components/driver-tracker-map";
import type { DriverLocation } from "@/app/api/drivers/locations/route";

interface LiveTrackingSectionProps {
  initialDrivers: DriverLocation[];
}

export function LiveTrackingSection({ initialDrivers }: LiveTrackingSectionProps) {
  return (
    <section className="py-20 bg-slate-950 text-white overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-4 py-1.5 text-sm font-medium text-emerald-400">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Live GPS Tracking
            </div>
            <h2 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
              Know exactly where
              <span className="block text-emerald-400">your driver is</span>
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Every TourVibe driver shares their real-time GPS location during active
              tours. Watch them navigate to tourist spots live — no guessing, no
              waiting.
            </p>
            <ul className="space-y-3">
              {[
                "Real-time GPS updates every 20 seconds",
                "Driver name, vehicle and current spot name",
                "Online / offline status at a glance",
                "Accessible from admin, driver & tourist dashboards",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-slate-300">
                  <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Navigation className="size-3 text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-sm">
                <Wifi className="size-4 text-emerald-400" />
                <span>{initialDrivers.length} driver{initialDrivers.length !== 1 ? "s" : ""} live right now</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-emerald-500/10 to-blue-500/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl h-[420px]">
              {/* Map header bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center gap-2 bg-slate-900/80 backdrop-blur-sm px-4 py-2.5 border-b border-white/10">
                <span className="size-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-medium text-slate-300">Live Driver Tracking</span>
                <span className="ml-auto text-xs text-slate-500">Auto-refreshes every 20s</span>
              </div>
              <div className="pt-9 h-full">
                <DriverTrackerMap
                  initialDrivers={initialDrivers}
                  className="h-full"
                  pollInterval={20_000}
                  showControls={false}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
