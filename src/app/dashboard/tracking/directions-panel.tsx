"use client";

import * as React from "react";
import {
  Building2,
  Car,
  Clock,
  Crosshair,
  Landmark,
  Loader2,
  Locate,
  MapPin,
  Mountain,
  Navigation,
  Route,
  Search,
  TreePine,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { DriverLocation } from "@/app/api/drivers/locations/route";

export interface Destination {
  lat: number;
  lng: number;
  name: string;
}

export interface RouteResult {
  driverId: string;
  distanceKm: number;
  durationMin: number;
  coordinates: [number, number][];
}

interface NominatimResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  class: string;
  address?: Record<string, string>;
}

interface DirectionsPanelProps {
  drivers: DriverLocation[];
  destination: Destination | null;
  activeRoute: RouteResult | null;
  onDestinationChange: (dest: Destination | null) => void;
  onRouteChange: (route: RouteResult | null) => void;
}

/* ── helpers ─────────────────────────────────────────────────────────────── */

function parseLatLng(input: string): { lat: number; lng: number } | null {
  const m = input.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
  if (!m) return null;
  const lat = parseFloat(m[1]);
  const lng = parseFloat(m[2]);
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  return { lat, lng };
}

/** Reverse-geocode lat/lng to a human-readable name via Nominatim */
async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "TourVibe/1.0" },
    });
    const data = await res.json();
    if (data?.display_name) {
      return data.display_name.split(", ").slice(0, 3).join(", ");
    }
  } catch { /* ignore */ }
  return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

async function searchPlaces(query: string): Promise<NominatimResult[]> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/search` +
      `?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "en", "User-Agent": "TourVibe/1.0" },
    });
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchRoute(
  fromLng: number, fromLat: number,
  toLng: number, toLat: number,
): Promise<{ distanceKm: number; durationMin: number; coordinates: [number, number][] } | null> {
  try {
    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.code !== "Ok" || !data.routes?.[0]) return null;
    const r = data.routes[0];
    return {
      distanceKm: r.distance / 1000,
      durationMin: r.duration / 60,
      coordinates: r.geometry.coordinates as [number, number][],
    };
  } catch {
    return null;
  }
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}
function formatDur(min: number) {
  if (min < 60) return `${Math.round(min)} min`;
  return `${Math.floor(min / 60)}h ${Math.round(min % 60)}m`;
}

/** Pick an icon based on Nominatim type/class */
function PlaceIcon({ type, cls }: { type: string; cls: string }) {
  const t = `${cls}:${type}`;
  if (t.includes("tourism") || t.includes("attraction") || t.includes("museum"))
    return <Landmark className="size-3.5 shrink-0" />;
  if (t.includes("natural") || t.includes("peak") || t.includes("mountain"))
    return <Mountain className="size-3.5 shrink-0" />;
  if (t.includes("park") || t.includes("forest") || t.includes("wood"))
    return <TreePine className="size-3.5 shrink-0" />;
  if (t.includes("amenity") || t.includes("shop") || t.includes("commercial"))
    return <Building2 className="size-3.5 shrink-0" />;
  return <MapPin className="size-3.5 shrink-0" />;
}

/** Extract a short primary label and a secondary context string */
function parsePlaceName(r: NominatimResult): { primary: string; secondary: string } {
  const parts = r.display_name.split(", ");
  const primary = parts[0];
  const secondary = parts.slice(1, 4).join(", ");
  return { primary, secondary };
}

/* ── component ───────────────────────────────────────────────────────────── */

export function DirectionsPanel({
  drivers,
  destination,
  activeRoute,
  onDestinationChange,
  onRouteChange,
}: DirectionsPanelProps) {
  const [query, setQuery] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<NominatimResult[]>([]);
  const [isSearching, setIsSearching] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [activeIdx, setActiveIdx] = React.useState(-1);
  const [isRouting, setIsRouting] = React.useState<string | null>(null);
  const [isGettingGPS, setIsGettingGPS] = React.useState(false);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = React.useRef(false);

  /* Debounced search as user types */
  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    // Skip search when query was set programmatically by a selection
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      return;
    }

    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // If input looks like lat,lng — skip API, show a direct-use option
    if (parseLatLng(trimmed)) {
      setSuggestions([]);
      setIsOpen(true); // show the coords shortcut
      return;
    }

    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      const results = await searchPlaces(trimmed);
      setSuggestions(results);
      setIsOpen(results.length > 0);
      setIsSearching(false);
      setActiveIdx(-1);
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* Close dropdown on outside click */
  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectSuggestion(r: NominatimResult) {
    const { primary } = parsePlaceName(r);
    const dest: Destination = {
      lat: parseFloat(r.lat),
      lng: parseFloat(r.lon),
      name: primary + (r.display_name.split(", ")[1] ? `, ${r.display_name.split(", ")[1]}` : ""),
    };
    justSelectedRef.current = true;
    setQuery(dest.name);
    setSuggestions([]);
    setIsOpen(false);
    onDestinationChange(dest);
    onRouteChange(null);
  }

  function selectLatLng() {
    const coords = parseLatLng(query.trim())!;
    const dest: Destination = {
      ...coords,
      name: `${coords.lat.toFixed(5)}, ${coords.lng.toFixed(5)}`,
    };
    justSelectedRef.current = true;
    setIsOpen(false);
    setSuggestions([]);
    onDestinationChange(dest);
    onRouteChange(null);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const coordMode = !!parseLatLng(query.trim());
    const total = coordMode ? 1 : suggestions.length;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, total - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (coordMode) {
        selectLatLng();
      } else if (activeIdx >= 0 && suggestions[activeIdx]) {
        selectSuggestion(suggestions[activeIdx]);
      } else if (suggestions[0]) {
        selectSuggestion(suggestions[0]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  }

  function handleUseMyLocation() {
    if (!("geolocation" in navigator)) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsGettingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords;
        const name = await reverseGeocode(lat, lng);
        justSelectedRef.current = true;
        setQuery(name);
        setSuggestions([]);
        setIsOpen(false);
        onDestinationChange({ lat, lng, name });
        onRouteChange(null);
        setIsGettingGPS(false);
      },
      (err) => {
        setIsGettingGPS(false);
        toast.error(
          err.code === 1
            ? "Location permission denied. Please allow access in your browser."
            : "Could not get your location. Try again.",
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function handleClear() {
    setQuery("");
    setSuggestions([]);
    setIsOpen(false);
    onDestinationChange(null);
    onRouteChange(null);
  }

  async function handleGetDirections(driver: DriverLocation) {
    if (!destination) return;
    setIsRouting(driver.id);
    onRouteChange(null);

    const result = await fetchRoute(driver.lng, driver.lat, destination.lng, destination.lat);
    setIsRouting(null);

    if (!result) {
      toast.error("Route unavailable — showing straight-line distance.");
      const km = haversine(driver.lat, driver.lng, destination.lat, destination.lng);
      onRouteChange({
        driverId: driver.id,
        distanceKm: km,
        durationMin: (km / 50) * 60,
        coordinates: [[driver.lng, driver.lat], [destination.lng, destination.lat]],
      });
      return;
    }

    onRouteChange({ driverId: driver.id, ...result });
  }

  const isCoordInput = !!parseLatLng(query.trim());

  return (
    <div className="flex flex-col gap-4">
      {/* ── Search input ──────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Destination
        </p>

        <div ref={containerRef} className="relative">
          <div className="flex gap-2">
            <div className="relative flex flex-1 items-center">
              {isSearching ? (
                <Loader2 className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : (
                <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              )}
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); onRouteChange(null); }}
                onFocus={() => (suggestions.length > 0 || isCoordInput) && setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search place or lat, lng"
                className="pl-8 pr-8 h-9 text-sm"
                autoComplete="off"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* GPS button */}
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-9 w-9 shrink-0 px-0"
              onClick={handleUseMyLocation}
              disabled={isGettingGPS}
              title="Use my current location"
            >
              {isGettingGPS ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Locate className="size-3.5" />
              )}
            </Button>
          </div>

          {/* ── Suggestions dropdown ───────────────────────────────────────── */}
          {isOpen && (
            <div className="absolute top-full z-50 mt-1 w-full overflow-hidden rounded-xl border bg-popover shadow-lg">

              {/* Coordinate shortcut */}
              {isCoordInput && (
                <button
                  onClick={selectLatLng}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent transition-colors",
                    activeIdx === 0 && "bg-accent",
                  )}
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <Crosshair className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Use coordinates</p>
                    <p className="text-xs text-muted-foreground font-mono">{query.trim()}</p>
                  </div>
                </button>
              )}

              {/* Place results */}
              {!isCoordInput && suggestions.map((r, i) => {
                const { primary, secondary } = parsePlaceName(r);
                return (
                  <button
                    key={r.place_id}
                    onClick={() => selectSuggestion(r)}
                    className={cn(
                      "flex w-full items-center gap-2.5 px-3 py-2.5 text-left hover:bg-accent transition-colors border-t first:border-t-0",
                      activeIdx === i && "bg-accent",
                    )}
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <PlaceIcon type={r.type} cls={r.class} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{primary}</p>
                      {secondary && (
                        <p className="text-xs text-muted-foreground truncate">{secondary}</p>
                      )}
                    </div>
                    <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground capitalize">
                      {r.type.replace(/_/g, " ")}
                    </span>
                  </button>
                );
              })}

              {/* No results */}
              {!isCoordInput && !isSearching && query.trim().length >= 2 && suggestions.length === 0 && (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-muted-foreground">No places found.</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Try a different name or enter coordinates like{" "}
                    <span className="font-mono">23.685, 90.356</span>
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Active destination chip */}
        {destination && (
          <div className="flex items-start justify-between gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <div className="flex items-start gap-2 min-w-0">
              <MapPin className="mt-0.5 size-3.5 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug truncate">
                  {destination.name}
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  {destination.lat.toFixed(4)}, {destination.lng.toFixed(4)}
                </p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="size-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Driver cards ──────────────────────────────────────────────────── */}
      {destination && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {drivers.length > 0 ? `${drivers.length} Driver${drivers.length !== 1 ? "s" : ""} Online` : "No Drivers Online"}
          </p>

          {drivers.length === 0 && (
            <p className="text-xs text-muted-foreground">
              No driver has shared their location yet.
            </p>
          )}

          {drivers.map((d) => {
            const sl = haversine(d.lat, d.lng, destination.lat, destination.lng);
            const isActive = activeRoute?.driverId === d.id;
            const loading = isRouting === d.id;

            return (
              <div
                key={d.id}
                className={cn(
                  "rounded-xl border p-3 transition-colors",
                  isActive ? "border-primary/30 bg-primary/5" : "bg-background",
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <Car className="size-3.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{d.name}</p>
                      {(d.vehicleMake || d.vehicleModel) && (
                        <p className="text-xs text-muted-foreground truncate">
                          {[d.vehicleMake, d.vehicleModel].filter(Boolean).join(" ")}
                          {d.vehicleLicense && ` · ${d.vehicleLicense}`}
                        </p>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isActive ? "default" : "outline"}
                    className="h-7 shrink-0 px-2 text-xs"
                    onClick={() => handleGetDirections(d)}
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="size-3 animate-spin" />
                    ) : (
                      <Route className="size-3" />
                    )}
                    {isActive ? "Reroute" : "Directions"}
                  </Button>
                </div>

                {isActive && activeRoute ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-muted/60 px-2 py-1.5 text-center">
                      <p className="text-xs text-muted-foreground">Road dist.</p>
                      <p className="text-sm font-bold">{formatDist(activeRoute.distanceKm)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/60 px-2 py-1.5 text-center">
                      <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                        <Clock className="size-3" />ETA
                      </p>
                      <p className="text-sm font-bold">{formatDur(activeRoute.durationMin)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                    <Navigation className="size-3" />
                    ~{formatDist(sl)} straight line
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {!destination && (
        <p className="text-xs text-muted-foreground">
          Search for a destination above to see distances and get turn-by-turn directions from each driver.
        </p>
      )}
    </div>
  );
}
