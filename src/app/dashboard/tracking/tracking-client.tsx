"use client";

import * as React from "react";
import { DriverTrackerMap } from "@/components/driver-tracker-map";
import { DirectionsPanel } from "./directions-panel";
import type { DriverLocation } from "@/app/api/drivers/locations/route";
import type { Destination, RouteResult } from "./directions-panel";
import { cn } from "@/lib/utils";

interface TrackingClientProps {
  initialDrivers: DriverLocation[];
  hideDirections?: boolean;
}

export function TrackingClient({ initialDrivers, hideDirections = false }: TrackingClientProps) {
  const [drivers, setDrivers] = React.useState<DriverLocation[]>(initialDrivers);
  const [destination, setDestination] = React.useState<Destination | null>(null);
  const [activeRoute, setActiveRoute] = React.useState<RouteResult | null>(null);

  // Clear route when destination changes
  const handleDestinationChange = (dest: Destination | null) => {
    setDestination(dest);
    if (!dest) setActiveRoute(null);
  };

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start h-full">
      {/* Directions sidebar */}
      {!hideDirections && (
        <div className="w-full lg:w-80 xl:w-96 shrink-0">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <h3 className="mb-3 font-semibold text-sm flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-md bg-primary/10 text-primary text-xs">↗</span>
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

      {/* Map */}
      <div className={cn(
        "min-h-[420px] flex-1",
        hideDirections ? "h-full" : "h-[calc(100vh-16rem)]"
      )}>
        <DriverTrackerMap
          initialDrivers={initialDrivers}
          className="h-full"
          pollInterval={20_000}
          destination={destination}
          activeRoute={activeRoute}
          onDriversChange={setDrivers}
        />
      </div>
    </div>
  );
}
