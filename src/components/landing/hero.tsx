"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Clock,
  ExternalLink,
  MapPinned,
  Mountain,
  Navigation,
  RotateCcw,
  Star,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map";

interface HeroProps {
  stats: { value: string; label: string }[];
  flagshipTour?: { name: string; duration: string; vehicleCount: number };
  flagshipDriver?: { name: string };
  userCount: number;
  adminCredentials: { email: string; password: string };
}

const locations = [
  {
    id: 1,
    name: "Dublin",
    description: "Ireland's vibrant capital city",
    hours: "Open year round",
    rating: 4.8,
    reviews: 12453,
    color: "bg-amber-400",
    ring: "ring-amber-400/30",
    lng: -6.2603,
    lat: 53.3498,
  },
  {
    id: 2,
    name: "Galway",
    description: "The City of the Tribes on the west coast",
    hours: "Open year round",
    rating: 4.7,
    reviews: 6821,
    color: "bg-cyan-400",
    ring: "ring-cyan-400/30",
    lng: -9.0568,
    lat: 53.2707,
  },
  {
    id: 3,
    name: "Cork",
    description: "The rebel city of southern Ireland",
    hours: "Open year round",
    rating: 4.6,
    reviews: 5340,
    color: "bg-emerald-400",
    ring: "ring-emerald-400/30",
    lng: -8.4756,
    lat: 51.8985,
  },
];

// ─── 3D controller — must live inside <Map> to use useMap() ──────────────────
function MapController() {
  const { map, isLoaded } = useMap();
  const [is3D, setIs3D] = useState(true); // default true

  // Enter 3D on load
  useEffect(() => {
    if (!map || !isLoaded) return;
    map.setPaintProperty("water", "fill-color", "rgba(34, 211, 238, 0.35)");
    map.setPaintProperty("water", "fill-opacity", 1);

    map.easeTo({ pitch: 60, bearing: -20, duration: 800 });

    const handleMove = () => setIs3D(map.getPitch() > 10);
    map.on("move", handleMove);
    return () => {
      map.off("move", handleMove);
    };
  }, [map, isLoaded]);

  const toggle = () => {
    if (is3D) {
      map?.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    } else {
      map?.easeTo({ pitch: 60, bearing: -20, duration: 800 });
    }
  };

  if (!isLoaded) return null;

  return (
    <div className="absolute bottom-3 left-3 z-10">
      <button
        onClick={toggle}
        className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-md backdrop-blur transition hover:bg-white"
      >
        {is3D ? (
          <>
            <RotateCcw className="size-3.5" />
            2D View
          </>
        ) : (
          <>
            <Mountain className="size-3.5" />
            3D View
          </>
        )}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

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
          {/* Left column */}
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

          {/* Right column */}
          <div className="relative">
            <div className="absolute -left-10 top-10 size-40 rounded-full bg-cyan-200/50 blur-3xl" />
            <div className="absolute -right-6 bottom-12 size-48 rounded-full bg-amber-200/60 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-slate-950/5 p-2 text-white shadow-[0_40px_120px_rgba(15,23,42,0.45)]">
              <div className="grid gap-2">
                <div className="relative h-[480px] w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5">
                  <Map
                    center={[-7.6921, 53.1424]}
                    zoom={6}
                    theme="light"
                    // OpenFreeMap liberty style supports 3D buildings
                    styles={{
                      light: "https://tiles.openfreemap.org/styles/liberty",
                    }}
                  >
                    <MapControls
                      position="top-right"
                      showZoom
                      showCompass
                      showLocate
                      showFullscreen
                    />

                    {/* 3D toggle button */}
                    <MapController />

                    {locations.map((loc) => (
                      <MapMarker
                        key={loc.id}
                        longitude={loc.lng}
                        latitude={loc.lat}
                      >
                        <MarkerContent>
                          <div
                            className={`size-3 cursor-pointer rounded-full ring-4 transition-transform hover:scale-125 ${loc.color} ${loc.ring}`}
                          />
                          <MarkerLabel
                            position="bottom"
                            className="text-slate-800 font-medium text-[11px]"
                          >
                            {loc.name}
                          </MarkerLabel>
                        </MarkerContent>
                        <MarkerTooltip>{loc.description}</MarkerTooltip>
                        <MarkerPopup className="w-56 p-0">
                          <div className="space-y-2 p-3">
                            <div>
                              <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Tour Stop
                              </span>
                              <h3 className="font-semibold leading-tight text-foreground">
                                {loc.name}
                              </h3>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="size-3.5 fill-amber-400 text-amber-400" />
                              <span className="font-medium">{loc.rating}</span>
                              <span className="text-muted-foreground">
                                ({loc.reviews.toLocaleString()} reviews)
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                              <Clock className="size-3.5" />
                              <span>{loc.hours}</span>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <Button size="sm" className="h-8 flex-1">
                                <Navigation className="mr-1.5 size-3.5" />
                                Directions
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                              >
                                <ExternalLink className="size-3.5" />
                              </Button>
                            </div>
                          </div>
                        </MarkerPopup>
                      </MapMarker>
                    ))}
                  </Map>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
