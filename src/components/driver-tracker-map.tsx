"use client";

import * as React from "react";
import { formatDistanceToNow } from "date-fns";
import { Car, Clock, Flag, MapPin, RefreshCw, Wifi, WifiOff } from "lucide-react";

import {
  Map,
  MapControls,
  MapMarker,
  MapRoute,
  MarkerContent,
  MarkerPopup,
  type MapRef,
} from "@/components/ui/map";
import type { DriverLocation } from "@/app/api/drivers/locations/route";
import type { Destination, RouteResult } from "@/app/dashboard/tracking/directions-panel";
import { cn } from "@/lib/utils";

interface DriverTrackerMapProps {
  className?: string;
  pollInterval?: number;
  initialDrivers?: DriverLocation[];
  showControls?: boolean;
  destination?: Destination | null;
  activeRoute?: RouteResult | null;
  /** Called each poll cycle with fresh driver list */
  onDriversChange?: (drivers: DriverLocation[]) => void;
}

/** SQLite CURRENT_TIMESTAMP is UTC but has no timezone suffix — force UTC parse */
function parseUtc(str: string | null): Date | null {
  if (!str) return null;
  return new Date(str.includes("T") ? str : str.replace(" ", "T") + "Z");
}

function isOnline(updatedAt: string | null): boolean {
  const d = parseUtc(updatedAt);
  if (!d) return false;
  return Date.now() - d.getTime() < 60 * 60 * 1000;
}

function relativeTime(str: string | null): string {
  const d = parseUtc(str);
  if (!d) return "";
  return formatDistanceToNow(d, { addSuffix: true });
}

function DriverPin({ online }: { online: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <div
        className={cn(
          "flex size-9 items-center justify-center rounded-full border-2 shadow-lg",
          online
            ? "border-emerald-400 bg-emerald-500 text-white"
            : "border-slate-300 bg-slate-400 text-white",
        )}
      >
        <Car className="size-4" />
      </div>
      {online && (
        <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-white bg-emerald-400 animate-pulse" />
      )}
      <div className={cn("h-2 w-0.5", online ? "bg-emerald-500" : "bg-slate-400")} />
    </div>
  );
}

export function DriverTrackerMap({
  className,
  pollInterval = 20_000,
  initialDrivers = [],
  showControls = true,
  destination = null,
  activeRoute = null,
  onDriversChange,
}: DriverTrackerMapProps) {
  const mapRef = React.useRef<MapRef>(null);
  const [drivers, setDrivers] = React.useState<DriverLocation[]>(initialDrivers);
  const [lastRefresh, setLastRefresh] = React.useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  // tick forces re-render every 30 s so relative times stay fresh
  const [, setTick] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const fetchLocations = React.useCallback(async (showLoader = false) => {
    if (showLoader) setIsRefreshing(true);
    try {
      const res = await fetch("/api/drivers/locations", { cache: "no-store" });
      const data = await res.json();
      const fresh: DriverLocation[] = data.drivers ?? [];
      setDrivers(fresh);
      onDriversChange?.(fresh);
      setLastRefresh(new Date());
    } catch {
      /* fail silently */
    } finally {
      if (showLoader) setIsRefreshing(false);
    }
  }, []);

  // Auto-poll
  React.useEffect(() => {
    const id = setInterval(() => fetchLocations(false), pollInterval);
    return () => clearInterval(id);
  }, [fetchLocations, pollInterval]);

  // Fit map to all driver markers whenever the driver list changes (and no active route)
  React.useEffect(() => {
    if (activeRoute) return; // let route effect handle the bounds
    const map = mapRef.current;
    if (!map || drivers.length === 0) return;

    const fit = () => {
      if (drivers.length === 1) {
        map.flyTo({ center: [drivers[0].lng, drivers[0].lat], zoom: 12, duration: 800 });
        return;
      }
      const minLng = Math.min(...drivers.map((d) => d.lng));
      const maxLng = Math.max(...drivers.map((d) => d.lng));
      const minLat = Math.min(...drivers.map((d) => d.lat));
      const maxLat = Math.max(...drivers.map((d) => d.lat));
      map.fitBounds(
        [[minLng, minLat], [maxLng, maxLat]],
        { padding: 80, maxZoom: 13, duration: 800 },
      );
    };

    if (map.isStyleLoaded()) fit();
    else map.once("styledata", fit);
  }, [drivers, activeRoute]);

  // When a route is active, fit bounds to show driver + destination
  React.useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeRoute || !destination) return;

    const driver = drivers.find((d) => d.id === activeRoute.driverId);
    if (!driver) return;

    const fit = () => {
      const lngs = [driver.lng, destination.lng];
      const lats = [driver.lat, destination.lat];
      map.fitBounds(
        [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]],
        { padding: 100, maxZoom: 14, duration: 900 },
      );
    };

    if (map.isStyleLoaded()) fit();
    else map.once("styledata", fit);
  }, [activeRoute, destination, drivers]);

  const defaultCenter: [number, number] =
    drivers.length > 0 ? [drivers[0].lng, drivers[0].lat] : [90.3563, 23.685];

  return (
    <div className={cn("relative", className)}>
      <Map
        ref={mapRef}
        center={defaultCenter}
        zoom={drivers.length > 0 ? 10 : 6}
        className="h-full w-full rounded-xl"
      >
        {showControls && (
          <MapControls showZoom showFullscreen position="bottom-right" />
        )}

        {/* Route polyline */}
        {activeRoute && activeRoute.coordinates.length >= 2 && (
          <MapRoute
            coordinates={activeRoute.coordinates}
            color="#3b82f6"
            width={4}
            opacity={0.85}
          />
        )}

        {/* Destination pin */}
        {destination && (
          <MapMarker longitude={destination.lng} latitude={destination.lat} anchor="bottom">
            <MarkerContent>
              <div className="relative flex flex-col items-center">
                <div className="flex size-9 items-center justify-center rounded-full border-2 border-blue-400 bg-blue-500 text-white shadow-lg">
                  <Flag className="size-4" />
                </div>
                <div className="h-2 w-0.5 bg-blue-500" />
              </div>
            </MarkerContent>
            <MarkerPopup closeButton>
              <div className="min-w-[160px] space-y-1">
                <p className="font-semibold text-sm flex items-center gap-1.5">
                  <Flag className="size-3.5 text-blue-500" />
                  Destination
                </p>
                <p className="text-xs text-muted-foreground leading-snug">{destination.name}</p>
                <p className="text-xs font-mono text-muted-foreground">
                  {destination.lat.toFixed(5)}, {destination.lng.toFixed(5)}
                </p>
                {activeRoute && (
                  <div className="mt-2 grid grid-cols-2 gap-1.5 border-t pt-2">
                    <div className="rounded bg-muted px-1.5 py-1 text-center">
                      <p className="text-[10px] text-muted-foreground">Distance</p>
                      <p className="text-xs font-bold">
                        {activeRoute.distanceKm < 1
                          ? `${Math.round(activeRoute.distanceKm * 1000)} m`
                          : `${activeRoute.distanceKm.toFixed(1)} km`}
                      </p>
                    </div>
                    <div className="rounded bg-muted px-1.5 py-1 text-center">
                      <p className="text-[10px] text-muted-foreground">ETA</p>
                      <p className="text-xs font-bold">
                        {activeRoute.durationMin < 60
                          ? `${Math.round(activeRoute.durationMin)} min`
                          : `${Math.floor(activeRoute.durationMin / 60)}h ${Math.round(activeRoute.durationMin % 60)}m`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </MarkerPopup>
          </MapMarker>
        )}

        {drivers.map((d) => {
          const online = isOnline(d.locationUpdatedAt);
          return (
            <MapMarker key={d.id} longitude={d.lng} latitude={d.lat} anchor="bottom">
              <MarkerContent>
                <DriverPin online={online} />
              </MarkerContent>
              <MarkerPopup closeButton>
                <div className="min-w-[180px] space-y-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={cn(
                        "flex size-8 items-center justify-center rounded-full",
                        online
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500",
                      )}
                    >
                      <Car className="size-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-sm leading-tight">{d.name}</p>
                      <div className="flex items-center gap-1">
                        {online ? (
                          <Wifi className="size-2.5 text-emerald-500" />
                        ) : (
                          <WifiOff className="size-2.5 text-slate-400" />
                        )}
                        <span
                          className={cn(
                            "text-xs",
                            online ? "text-emerald-600" : "text-slate-400",
                          )}
                        >
                          {online ? "Online" : "Last seen"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {(d.vehicleMake || d.vehicleModel) && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Car className="size-3" />
                      {[d.vehicleMake, d.vehicleModel].filter(Boolean).join(" ")}
                      {d.vehicleLicense && (
                        <span className="ml-1 rounded bg-muted px-1 font-mono">
                          {d.vehicleLicense}
                        </span>
                      )}
                    </div>
                  )}

                  {d.locationName && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3 shrink-0" />
                      <span className="truncate">{d.locationName}</span>
                    </div>
                  )}

                  {d.locationUpdatedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="size-3" />
                      {relativeTime(d.locationUpdatedAt)}
                    </div>
                  )}
                </div>
              </MarkerPopup>
            </MapMarker>
          );
        })}
      </Map>

      {/* Status bar — sits above the zoom controls */}
      <div className="absolute bottom-14 left-2 z-10 flex items-center gap-2 rounded-lg border bg-background/90 px-3 py-1.5 text-xs shadow backdrop-blur-sm">
        <span className="font-medium">
          {drivers.length} driver{drivers.length !== 1 ? "s" : ""} live
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-muted-foreground">
          {relativeTime(lastRefresh.toISOString())}
        </span>
        <button
          onClick={() => fetchLocations(true)}
          disabled={isRefreshing}
          className="ml-1 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Refresh"
        >
          <RefreshCw className={cn("size-3", isRefreshing && "animate-spin")} />
        </button>
      </div>
    </div>
  );
}
