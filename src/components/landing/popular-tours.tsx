import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Star, Users } from "lucide-react";

interface PopularTour {
  id: string;
  name: string;
  description: string | null;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  avgRating: number | null;
  reviewCount: number;
}

interface PopularToursProps {
  tours: PopularTour[];
}

const cardColors = [
  { bar: "from-amber-400 to-orange-500", glow: "bg-amber-300/25", badge: "bg-amber-400/15 text-amber-700 border-amber-200" },
  { bar: "from-cyan-400 to-sky-500",     glow: "bg-cyan-300/25",  badge: "bg-cyan-400/15 text-cyan-700 border-cyan-200" },
  { bar: "from-emerald-400 to-teal-500", glow: "bg-emerald-300/25", badge: "bg-emerald-400/15 text-emerald-700 border-emerald-200" },
  { bar: "from-violet-400 to-purple-500", glow: "bg-violet-300/25", badge: "bg-violet-400/15 text-violet-700 border-violet-200" },
  { bar: "from-rose-400 to-pink-500",    glow: "bg-rose-300/25",  badge: "bg-rose-400/15 text-rose-700 border-rose-200" },
  { bar: "from-fuchsia-400 to-violet-500", glow: "bg-fuchsia-300/25", badge: "bg-fuchsia-400/15 text-fuchsia-700 border-fuchsia-200" },
];

export function PopularTours({ tours }: PopularToursProps) {
  if (tours.length === 0) return null;

  return (
    <section id="popular-tours" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-1/4 size-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700
                            animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
              </span>
              Popular Tours
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl
                         animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Top-rated{" "}
              <span className="relative inline-block">
                <span className="relative z-10">experiences</span>
                <span
                  className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60"
                  aria-hidden="true"
                />
              </span>{" "}
              on the road
            </h2>
          </div>

          <Link
            href="/tours"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md
                       animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            View all tours
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ── Cards ── */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {tours.map((tour, i) => {
            const accent = cardColors[i % cardColors.length];
            const rating = tour.avgRating ? tour.avgRating.toFixed(1) : null;

            return (
              <Link
                key={tour.id}
                href={`/tours/${tour.id}`}
                style={{ animationDelay: `${200 + i * 80}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white
                           shadow-lg shadow-slate-200/60
                           transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

                {/* Thumbnail */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  {tour.thumbnail ? (
                    <Image
                      src={tour.thumbnail}
                      alt={tour.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                      <span className="text-4xl font-black text-slate-200 select-none">
                        {tour.name.charAt(0)}
                      </span>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-linear-to-t from-slate-950/30 to-transparent" />

                  {/* Price badge */}
                  <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                    <span className="font-heading text-base font-extrabold text-slate-950">
                      ${tour.price.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400"> / person</span>
                  </div>

                  {/* Rating badge */}
                  {rating && (
                    <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-xl bg-white/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      <span className="text-xs font-bold text-slate-950">{rating}</span>
                      {tour.reviewCount > 0 && (
                        <span className="text-[10px] text-slate-400">({tour.reviewCount})</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-linear-to-r ${accent.bar}`} />

                {/* Content */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div className="space-y-1.5">
                    <h3 className="font-heading text-lg font-bold text-slate-950 leading-snug group-hover:text-slate-700 transition-colors">
                      {tour.name}
                    </h3>
                    {tour.description && (
                      <p className="text-xs leading-6 text-slate-500 line-clamp-2">
                        {tour.description}
                      </p>
                    )}
                  </div>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${accent.badge}`}>
                      <Clock className="size-3" />
                      {tour.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                      <Users className="size-3" />
                      Up to {tour.maxPersons}
                    </span>
                  </div>

                  {/* Bottom accent */}
                  <div className="mt-auto flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2">
                      <div className={`h-0.75 w-8 rounded-full bg-linear-to-r ${accent.bar}`} />
                      <div className={`h-0.75 w-3 rounded-full bg-linear-to-r ${accent.bar} opacity-40`} />
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-slate-700">
                      View tour
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
