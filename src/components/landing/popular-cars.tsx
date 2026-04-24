import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Car, ShieldCheck, Star, Thermometer, UserCheck, Zap } from "lucide-react";

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
  {
    bar: "from-amber-400 to-orange-500",
    glow: "bg-amber-400/25",
    yearBg: "bg-amber-400/15 text-amber-200 border-amber-400/30",
    btnBorder: "border-amber-400/30 hover:border-amber-400/60 hover:bg-amber-400/10 text-amber-300 hover:text-amber-200",
  },
  {
    bar: "from-cyan-400 to-sky-500",
    glow: "bg-cyan-400/25",
    yearBg: "bg-cyan-400/15 text-cyan-200 border-cyan-400/30",
    btnBorder: "border-cyan-400/30 hover:border-cyan-400/60 hover:bg-cyan-400/10 text-cyan-300 hover:text-cyan-200",
  },
  {
    bar: "from-emerald-400 to-teal-500",
    glow: "bg-emerald-400/25",
    yearBg: "bg-emerald-400/15 text-emerald-200 border-emerald-400/30",
    btnBorder: "border-emerald-400/30 hover:border-emerald-400/60 hover:bg-emerald-400/10 text-emerald-300 hover:text-emerald-200",
  },
  {
    bar: "from-violet-400 to-purple-500",
    glow: "bg-violet-400/25",
    yearBg: "bg-violet-400/15 text-violet-200 border-violet-400/30",
    btnBorder: "border-violet-400/30 hover:border-violet-400/60 hover:bg-violet-400/10 text-violet-300 hover:text-violet-200",
  },
  {
    bar: "from-rose-400 to-pink-500",
    glow: "bg-rose-400/25",
    yearBg: "bg-rose-400/15 text-rose-200 border-rose-400/30",
    btnBorder: "border-rose-400/30 hover:border-rose-400/60 hover:bg-rose-400/10 text-rose-300 hover:text-rose-200",
  },
  {
    bar: "from-fuchsia-400 to-violet-500",
    glow: "bg-fuchsia-400/25",
    yearBg: "bg-fuchsia-400/15 text-fuchsia-200 border-fuchsia-400/30",
    btnBorder: "border-fuchsia-400/30 hover:border-fuchsia-400/60 hover:bg-fuchsia-400/10 text-fuchsia-300 hover:text-fuchsia-200",
  },
];

const features = [
  { icon: UserCheck,   label: "Pro driver",      color: "text-amber-400" },
  { icon: ShieldCheck, label: "Fully insured",   color: "text-emerald-400" },
  { icon: Thermometer, label: "Air conditioned", color: "text-cyan-400" },
  { icon: Star,        label: "Top rated",       color: "text-violet-400" },
];

export function PopularCars({ cars }: PopularCarsProps) {
  if (cars.length === 0) return null;

  return (
    <section
      id="popular-cars"
      className="relative overflow-hidden px-4 py-24 sm:px-6"
      style={{
        background:
          "radial-gradient(ellipse 120% 60% at 10% 20%, rgba(217,119,6,0.14) 0%, transparent 55%)," +
          "radial-gradient(ellipse 90% 50% at 90% 80%, rgba(6,182,212,0.12) 0%, transparent 50%)," +
          "radial-gradient(ellipse 70% 40% at 50% 110%, rgba(124,58,237,0.10) 0%, transparent 50%)," +
          "#020617",
      }}
    >
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)",
          backgroundSize: "32px 32px",
        }}
      />

      {/* Color orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/4 size-[500px] rounded-full bg-amber-500/15 blur-[100px]" />
        <div className="absolute -bottom-24 right-1/4 size-[450px] rounded-full bg-cyan-500/12 blur-[100px]" />
        <div className="absolute top-1/2 -right-24 size-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute top-1/3 -left-16 size-72 rounded-full bg-orange-500/8 blur-3xl" />
      </div>

      {/* Top edge line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/25 bg-gradient-to-r from-amber-400/10 to-orange-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
              </span>
              Our Premium Fleet
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight text-white sm:text-5xl animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Travel in{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">comfort</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-amber-400/60 to-orange-400/60" aria-hidden="true" />
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
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-indigo-400/15 animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            Browse tours
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Feature strip */}
        <div
          className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 animate-in fade-in slide-in-from-bottom-3 duration-500"
          style={{ animationDelay: "200ms" }}
        >
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.label} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3 backdrop-blur-sm transition-colors hover:border-white/20 hover:bg-white/12">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-white/8">
                  <Icon className={`size-3.5 ${f.color}`} />
                </div>
                <span className="text-xs font-semibold text-white/70">{f.label}</span>
              </div>
            );
          })}
        </div>

        {/* Cards */}
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {cars.map((car, i) => {
            const accent = cardColors[i % cardColors.length];

            return (
              <div
                key={car.id}
                style={{ animationDelay: `${280 + i * 80}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.06]
                           backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -top-12 -right-12 size-44 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

                {/* Thumbnail */}
                <div className="relative h-52 w-full overflow-hidden bg-white/5">
                  {car.thumbnail ? (
                    <Image
                      src={car.thumbnail}
                      alt={`${car.make} ${car.model}`}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-108"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3">
                      <Car className="size-12 text-white/20" />
                      <span className="text-xs font-medium text-white/30">No image available</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/10 to-transparent" />

                  {/* Year badge */}
                  <div className={`absolute left-3 top-3 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm ${accent.yearBg}`}>
                    {car.year}
                  </div>

                  {/* Tour count */}
                  {car.tourCount > 0 && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-white/80 backdrop-blur-sm border border-white/15">
                      <Zap className="size-2.5 text-amber-400" />
                      {car.tourCount} tour{car.tourCount !== 1 ? "s" : ""}
                    </div>
                  )}

                  {/* Name overlay */}
                  <div className="absolute bottom-3 left-3">
                    <p className="font-heading text-lg font-extrabold leading-tight text-white drop-shadow">
                      {car.make} {car.model}
                    </p>
                    <p className="text-[11px] font-medium text-white/50">Premium fleet vehicle</p>
                  </div>
                </div>

                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />

                {/* Content */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  {/* Comfort features */}
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { icon: UserCheck,   label: "Pro driver",  color: "text-amber-400" },
                      { icon: ShieldCheck, label: "Insured",     color: "text-emerald-400" },
                      { icon: Thermometer, label: "Air con",     color: "text-cyan-400" },
                      { icon: Star,        label: "Top rated",   color: "text-violet-400" },
                    ].map((f) => {
                      const Icon = f.icon;
                      return (
                        <div key={f.label} className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-white/60 border border-white/5">
                          <Icon className={`size-3 shrink-0 ${f.color}`} />
                          {f.label}
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA */}
                  <Link
                    href="/tours"
                    className={`group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-sm font-bold backdrop-blur-sm transition-all hover:-translate-y-0.5 ${accent.btnBorder}`}
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
