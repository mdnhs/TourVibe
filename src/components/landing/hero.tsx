"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import {
  Clock,
  ExternalLink,
  MapPin,
  Mountain,
  Navigation,
  RotateCcw,
  Search,
  Star,
  Users,
  Car,
  MessageSquareText,
  ChevronRight,
  Wind,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Map as MapComponent,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MarkerPopup,
  MarkerTooltip,
  useMap,
} from "@/components/ui/map";
import Image from "next/image";

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

const statIcons = [MapPin, Car, MessageSquareText, Users];
const statColors = [
  {
    iconBg: "bg-amber-400/15",
    icon: "text-amber-400",
    bar: "bg-gradient-to-r from-amber-400 to-amber-300",
  },
  {
    iconBg: "bg-cyan-400/15",
    icon: "text-cyan-400",
    bar: "bg-gradient-to-r from-cyan-400 to-cyan-300",
  },
  {
    iconBg: "bg-emerald-400/15",
    icon: "text-emerald-400",
    bar: "bg-gradient-to-r from-emerald-400 to-emerald-300",
  },
  {
    iconBg: "bg-violet-400/15",
    icon: "text-violet-400",
    bar: "bg-gradient-to-r from-violet-400 to-violet-300",
  },
];

// ─── 3D controller ────────────────────────────────────────────────────────────
function MapController() {
  const { map, isLoaded } = useMap();
  const [is3D, setIs3D] = useState(true);

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
    if (is3D) map?.easeTo({ pitch: 0, bearing: 0, duration: 800 });
    else map?.easeTo({ pitch: 60, bearing: -20, duration: 800 });
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
            <RotateCcw className="size-3.5" /> 2D View
          </>
        ) : (
          <>
            <Mountain className="size-3.5" /> 3D View
          </>
        )}
      </button>
    </div>
  );
}

// ─── Floating route card ──────────────────────────────────────────────────────
function FloatingRouteCard() {
  return (
    <div className="absolute bottom-26 -right-12 z-20 hidden lg:block animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
      <div className="w-52 rounded-2xl border border-white/60 bg-white/95 p-3.5 shadow-2xl shadow-slate-900/20 backdrop-blur-sm">
        <div className="mb-2.5 flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Active Route
          </span>
          <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600">
            <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live
          </span>
        </div>
        <p className="text-sm font-semibold text-slate-900 leading-tight">
          Wild Atlantic Way
        </p>
        <p className="mt-0.5 text-xs text-slate-500">Dublin → Galway → Cork</p>
        <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
          <div className="text-center">
            <p className="text-xs font-bold text-slate-900">
              2,500
              <span className="text-[9px] font-normal text-slate-400">km</span>
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
              Distance
            </p>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div className="text-center">
            <p className="text-xs font-bold text-slate-900">
              7
              <span className="text-[9px] font-normal text-slate-400">
                days
              </span>
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
              Duration
            </p>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div className="text-center">
            <p className="text-xs font-bold text-amber-500">
              4.8<span className="text-[9px]">★</span>
            </p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wide">
              Rating
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Weather badge ────────────────────────────────────────────────────────────
function WeatherBadge() {
  return (
    <div className="absolute top-16 -left-14 z-20 hidden lg:flex animate-in fade-in slide-in-from-top-4 duration-700 delay-300">
      <div className="flex items-center gap-2 rounded-2xl border border-white/60 bg-white/95 px-3.5 py-2.5 shadow-xl shadow-slate-900/15 backdrop-blur-sm">
        <div className="flex size-8 items-center justify-center rounded-xl bg-sky-50">
          <Wind className="size-4 text-sky-500" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Weather
          </p>
          <p className="text-sm font-semibold text-slate-900">14°C · Breezy</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Hero ────────────────────────────────────────────────────────────────
export function Hero({ stats }: { stats: { value: string; label: string }[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      query.trim() ? `/tours?q=${encodeURIComponent(query.trim())}` : "/tours",
    );
  };

  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-6 sm:px-6">
      {/* ── Full-bleed background cover image ── */}
      <div className="absolute inset-x-0 top-5 h-130 overflow-hidden mx-auto max-w-6xl rounded-[1.5rem]">
        <Image
          src="/cover.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-5">
        <div className="grid gap-12 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-start lg:pt-20">
          {/* ── LEFT: Text + search + stats ── */}
          <div className="space-y-8">
            {/* Pill badge */}
            <div
              className="inline-flex items-center gap-2.5 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md
                         animate-in fade-in slide-in-from-left-4 duration-500"
            >
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-amber-400" />
              </span>
              Your Journey Starts Here
            </div>

            {/* Headline */}
            <div
              className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "100ms" }}
            >
              <h1 className="font-heading max-w-lg text-5xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-6xl">
                Discover{" "}
                <span className="relative inline-block">
                  <span className="relative z-10">Ireland.</span>
                  <span
                    className="absolute -bottom-1 left-0 h-[6px] w-full rounded-full bg-amber-400/70"
                    aria-hidden="true"
                  />
                </span>
              </h1>
              <p className="max-w-md text-base leading-relaxed text-white/75">
                Book your next adventure with our curated selection of scenic
                road trips across the Emerald Isle.
              </p>
            </div>

            {/* Search bar */}
            <form
              onSubmit={handleSearch}
              className="relative flex max-w-lg items-center gap-2 rounded-2xl border border-white/20 bg-white/10 p-1.5 shadow-2xl shadow-slate-900/30 backdrop-blur-md
                         transition-all focus-within:border-amber-400/60 focus-within:bg-white/15 focus-within:ring-4 focus-within:ring-amber-400/20
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <div className="flex flex-1 items-center gap-2 px-3">
                <Search className="size-4 shrink-0 text-white/50" />
                <Input
                  type="text"
                  placeholder="Search tour, city or place..."
                  className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0 focus-visible:ring-offset-0"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button
                type="submit"
                className="h-10 rounded-xl bg-amber-400 px-6 font-semibold text-slate-950 hover:bg-amber-300 transition-colors"
              >
                Search
              </Button>
            </form>

            {/* Quick links */}
            <div
              className="flex flex-wrap items-center gap-2 animate-in fade-in duration-500"
              style={{ animationDelay: "300ms" }}
            >
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/35 mr-1 shrink-0">
                Popular
              </span>
              {[
                { label: "Wild Atlantic Way", emoji: "🌊" },
                { label: "Ring of Kerry", emoji: "🏔️" },
                { label: "Cliffs of Moher", emoji: "🌿" },
              ].map((tag, i) => (
                <button
                  key={tag.label}
                  onClick={() =>
                    router.push(`/tours?q=${encodeURIComponent(tag.label)}`)
                  }
                  style={{ animationDelay: `${320 + i * 60}ms` }}
                  className="group animate-in fade-in slide-in-from-bottom-2 duration-500 flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-medium text-white/70 backdrop-blur-sm transition-all hover:border-amber-400/50 hover:bg-amber-400/15 hover:text-white hover:shadow-lg hover:shadow-amber-400/10 active:scale-95"
                >
                  <span className="text-sm leading-none">{tag.emoji}</span>
                  {tag.label}
                  <ChevronRight className="size-3 text-white/25 transition-all group-hover:translate-x-0.5 group-hover:text-amber-400" />
                </button>
              ))}
            </div>
            {/* Stats grid */}
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-4">
              {stats.map((stat, i) => {
                const Icon = statIcons[i] ?? MapPin;
                const colors = statColors[i] ?? statColors[0];
                return (
                  <div
                    key={stat.label}
                    style={{ animationDelay: `${400 + i * 70}ms` }}
                    className="group animate-in fade-in slide-in-from-bottom-3 duration-500
          relative overflow-hidden rounded-2xl border border-white/15
          bg-white/10 p-4 backdrop-blur-md
          transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15"
                  >
                    {/* Accent glow */}
                    <div
                      className={`pointer-events-none absolute -top-5 -right-5 size-20
            rounded-full opacity-0 blur-xl transition-opacity duration-300
            group-hover:opacity-30 ${colors.bar}`}
                    />

                    {/* Icon */}
                    <div
                      className={`mb-3 inline-flex size-9 items-center justify-center rounded-xl ${colors.iconBg}`}
                    >
                      <Icon className={`size-4 ${colors.icon}`} />
                    </div>

                    {/* Value */}
                    <p className="font-heading text-2xl font-extrabold leading-none text-black tabular-nums">
                      {stat.value}
                    </p>

                    {/* Accent bar */}
                    <div
                      className={`my-2 h-[3px] w-8 rounded-full ${colors.bar}`}
                    />

                    {/* Label */}
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-black/45">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT: Map card ── */}
          <div
            className="relative mt-8 lg:mt-0 animate-in fade-in slide-in-from-right-6 duration-700"
            style={{ animationDelay: "150ms" }}
          >
            {/* Glow orbs */}
            <div className="pointer-events-none absolute -left-12 top-8 size-48 rounded-full bg-cyan-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -right-8 bottom-16 size-56 rounded-full bg-amber-300/30 blur-3xl" />

            {/* Floating cards */}
            <WeatherBadge />
            <FloatingRouteCard />

            {/* Map frame */}
            <div className="relative overflow-hidden rounded-[2rem] border border-white/50 bg-white/5 p-2 shadow-[0_32px_80px_rgba(15,23,42,0.40)] backdrop-blur-sm">
              {/* Top bar inside frame */}
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <span className="size-2.5 rounded-full bg-red-400" />
                    <span className="size-2.5 rounded-full bg-amber-400" />
                    <span className="size-2.5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium text-white/60 backdrop-blur-sm">
                  <MapPin className="size-2.5" />
                  Ireland, EU
                </div>
                <div className="w-10" />
              </div>

              {/* Map itself */}
              <div className="relative h-[460px] w-full overflow-hidden rounded-[1.5rem] border border-white/10">
                <MapComponent
                  center={[-7.6921, 53.1424]}
                  zoom={6}
                  theme="light"
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
                              <Navigation className="mr-1.5 size-3.5" />{" "}
                              Directions
                            </Button>
                            <Button size="sm" variant="outline" className="h-8">
                              <ExternalLink className="size-3.5" />
                            </Button>
                          </div>
                        </div>
                      </MarkerPopup>
                    </MapMarker>
                  ))}
                </MapComponent>
              </div>

              {/* Bottom strip */}
              <div className="mt-2 grid grid-cols-3 divide-x divide-white/10 rounded-2xl bg-slate-900/60 backdrop-blur-sm">
                {locations.map((loc) => (
                  <div
                    key={loc.id}
                    className="flex items-center gap-2 px-3 py-2.5"
                  >
                    <span
                      className={`size-2 shrink-0 rounded-full ${loc.color}`}
                    />
                    <span className="truncate text-xs font-medium text-white/80">
                      {loc.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
