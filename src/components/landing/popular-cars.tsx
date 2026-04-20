import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Star, Thermometer, UserCheck } from "lucide-react";

interface PopularCar {
  id: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  thumbnail: string;
  tourCount: number;
}

interface PopularCarsProps {
  cars: PopularCar[];
}

const cardColors = [
  { bar: "from-amber-400 to-orange-500",   glow: "bg-amber-400/20",   yearBg: "bg-amber-400/15 text-amber-300 border-amber-400/25" },
  { bar: "from-cyan-400 to-sky-500",       glow: "bg-cyan-400/20",    yearBg: "bg-cyan-400/15 text-cyan-300 border-cyan-400/25" },
  { bar: "from-emerald-400 to-teal-500",   glow: "bg-emerald-400/20", yearBg: "bg-emerald-400/15 text-emerald-300 border-emerald-400/25" },
  { bar: "from-violet-400 to-purple-500",  glow: "bg-violet-400/20",  yearBg: "bg-violet-400/15 text-violet-300 border-violet-400/25" },
  { bar: "from-rose-400 to-pink-500",      glow: "bg-rose-400/20",    yearBg: "bg-rose-400/15 text-rose-300 border-rose-400/25" },
  { bar: "from-fuchsia-400 to-violet-500", glow: "bg-fuchsia-400/20", yearBg: "bg-fuchsia-400/15 text-fuchsia-300 border-fuchsia-400/25" },
];

const features = [
  { icon: UserCheck,   label: "Pro driver" },
  { icon: ShieldCheck, label: "Fully insured" },
  { icon: Thermometer, label: "Air conditioned" },
  { icon: Star,        label: "Top rated" },
];

export function PopularCars({ cars }: PopularCarsProps) {
  if (cars.length === 0) return null;

  return (
    <section id="popular-cars" className="relative overflow-hidden bg-slate-950 px-4 py-24 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/3 size-96 rounded-full bg-amber-400/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/3 size-80 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="absolute top-1/2 right-0 size-72 rounded-full bg-violet-400/6 blur-3xl" />
      </div>

      {/* Top edge line */}
      <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300
                            animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
              </span>
              Our Premium Fleet
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl
                         animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Travel in{" "}
              <span className="relative inline-block">
                <span className="relative z-10">comfort</span>
                <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
              </span>{" "}
              &amp; style
            </h2>

            <p
              className="max-w-lg text-sm leading-7 text-white/50 animate-in fade-in duration-500"
              style={{ animationDelay: "140ms" }}
            >
              Every vehicle in our fleet is handpicked for comfort, safety and style — professionally maintained and driven by our expert team.
            </p>
          </div>

          <Link
            href="/tours"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-white/25 hover:bg-white/15
                       animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            Browse tours
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Feature strip ── */}
        <div
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-in fade-in slide-in-from-bottom-3 duration-500"
          style={{ animationDelay: "200ms" }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/5 px-4 py-3 backdrop-blur-sm">
                <Icon className="size-4 shrink-0 text-amber-400" />
                <span className="text-xs font-semibold text-white/70">{f.label}</span>
              </div>
            );
          })}
        </div>

        {/* ── Cards ── */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {cars.map((car, i) => {
            const accent = cardColors[i % cardColors.length];

            return (
              <div
                key={car.id}
                style={{ animationDelay: `${280 + i * 80}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/5
                           backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/8"
              >
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

                {/* Thumbnail */}
                <div className="relative h-52 w-full overflow-hidden bg-white/5">
                  {car.thumbnail ? (
                    <Image
                      src={car.thumbnail}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                      <Car className="size-12 text-white/20" />
                      <span className="text-xs font-medium text-white/30">No image available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

                  {/* Year badge */}
                  <div className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${accent.yearBg}`}>
                    {car.year}
                  </div>

                  {/* Tour count */}
                  {car.tourCount > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm border border-white/15">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {car.tourCount} tour{car.tourCount !== 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-3">
                    <p className="font-heading text-lg font-extrabold leading-tight text-white">
                      {car.make} {car.model}
                    </p>
                    <p className="text-[11px] font-medium text-white/50">Premium fleet vehicle</p>
                  </div>
                </div>

                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-linear-to-r ${accent.bar}`} />

                {/* Content */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  {/* Comfort features */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: UserCheck,   label: "Pro driver" },
                      { icon: ShieldCheck, label: "Insured" },
                      { icon: Thermometer, label: "Air con" },
                      { icon: Star,        label: "Top rated" },
                    ].map((f) => {
                      const Icon = f.icon;
                      return (
                        <div key={f.label} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/60">
                          <Icon className="size-3 text-amber-400 shrink-0" />
                          {f.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/tours"
                    className="group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 py-2.5 text-sm font-bold text-white backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/15"
                  >
                    Book with this vehicle
                    <ArrowRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
