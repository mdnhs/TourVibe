"use client";

import * as React from "react";
import { DriverTrackerMap } from "@/components/driver-tracker-map";
import { DirectionsPanel } from "./directions-panel";
import type { DriverLocation } from "@/app/api/drivers/locations/route";
import type { Destination, RouteResult } from "./directions-panel";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface TrackingClientProps {
  initialDrivers: DriverLocation[];
  hideDirections?: boolean;
}

export function TrackingClient({
  initialDrivers,
  hideDirections = false,
}: TrackingClientProps) {
  const [drivers, setDrivers] = React.useState<DriverLocation[]>(initialDrivers);
  const [destination, setDestination] = React.useState<Destination | null>(
    null,
  );
  const [activeRoute, setActiveRoute] = React.useState<RouteResult | null>(
    null,
  );

  // Clear route when destination changes
  const handleDestinationChange = (dest: Destination | null) => {
    setDestination(dest);
    if (!dest) setActiveRoute(null);
  };

  return (
    <div className="flex h-full flex-col gap-6 lg:flex-row lg:items-start">
      {/* Directions sidebar */}
      {!hideDirections && (
        <div className="w-full shrink-0 lg:w-80 xl:w-96">
          <div className="rounded-2xl border bg-card p-5 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-xs text-primary">
                ↗
              </span>
              Get Directions
            </h3>
            <DirectionsPanel
              drivers={drivers}
              destination={destination}
              activeRoute={activeRoute}
              onDestinationChange={handleDestinationChange}
              onRouteChange={setActiveRoute}
            />
          </div>
        </div>
      )}

      {/* Map with Styled Frame */}
      <div
        className={cn(
          "flex-1",
          hideDirections ? "h-full" : "h-[calc(100vh-16rem)] min-h-[500px]",
        )}
      >
        <div className="relative h-full overflow-hidden rounded-[2rem] border border-border/50 bg-muted/30 p-2 shadow-[0_32px_80px_rgba(0,0,0,0.1)] dark:shadow-[0_32px_80px_rgba(0,0,0,0.4)]">
          {/* Top bar inside frame */}
          <div className="mb-2 flex items-center justify-between px-3 py-1.5">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="size-2.5 rounded-full bg-red-400/80" />
                <span className="size-2.5 rounded-full bg-amber-400/80" />
                <span className="size-2.5 rounded-full bg-emerald-400/80" />
              </div>
            </div>
            <div className="flex items-center gap-1.5 rounded-full bg-background/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground backdrop-blur-sm border border-border/50">
              <MapPin className="size-2.5 text-primary" />
              Live Fleet Tracking
            </div>
            <div className="w-10" />
          </div>

          {/* Map itself */}
          <div className="relative h-[calc(100%-3rem)] w-full overflow-hidden rounded-[1.5rem] border border-border/50 shadow-inner">
            <DriverTrackerMap
              initialDrivers={initialDrivers}
              className="h-full"
              pollInterval={20_000}
              destination={destination}
              activeRoute={activeRoute}
              onDriversChange={setDrivers}
              show3DToggle={true}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
