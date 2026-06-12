"use client";

import { Navigation, Wifi } from "lucide-react";
import { DriverTrackerMap } from "@/components/driver-tracker-map";
import type { DriverLocation } from "@/app/api/drivers/locations/route";

interface LiveTrackingSectionProps {
  initialDrivers: DriverLocation[];
  siteName?: string;
}

export function LiveTrackingSection({ initialDrivers, siteName = "TourVibe" }: LiveTrackingSectionProps) {
  return (
    <section className="py-24 bg-slate-950 text-white overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-10 sm:gap-12 lg:grid-cols-2 lg:items-center">
          {/* Text */}
          <div className="space-y-4 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live GPS Tracking
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl">
              Know exactly where{" "}
              <span className="relative inline-block">
                <span className="relative z-10 text-emerald-400">your driver is</span>
                <span className="absolute -bottom-0.5 sm:-bottom-1 left-0 h-0.5 sm:h-1 w-full rounded-full bg-emerald-400/30" aria-hidden="true" />
              </span>
            </h2>
            <p className="text-sm sm:text-lg text-slate-300 leading-relaxed max-w-lg">
              Every {siteName} driver shares their real-time GPS location during active
              tours. Watch them navigate live — no guessing, no waiting.
            </p>
            <ul className="space-y-2 sm:space-y-3">
              {[
                "Real-time GPS updates every 20 seconds",
                "Driver and vehicle status at a glance",
                "Accessible across all devices",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-slate-300">
                  <div className="flex size-4 sm:size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                    <Navigation className="size-2.5 sm:size-3 text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 sm:px-4 sm:py-2 text-[11px] sm:text-sm">
                <Wifi className="size-3.5 sm:size-4 text-emerald-400" />
                <span>{initialDrivers.length} driver{initialDrivers.length !== 1 ? "s" : ""} live</span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="relative mt-2 lg:mt-0">
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-emerald-500/20 to-blue-500/10 blur-3xl opacity-50" />
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] border border-white/10 shadow-2xl h-[320px] sm:h-[420px]">
              {/* Map header bar */}
              <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between bg-slate-900/90 backdrop-blur-md px-4 py-2 sm:py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-white">Live Status</span>
                </div>
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-500">Updates every 20s</span>
              </div>
              <div className="pt-8 sm:pt-11 h-full">
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
