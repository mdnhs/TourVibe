import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, Star, Users, MapPin, Sparkles } from "lucide-react";

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

const categories = ["Coastal", "Heritage", "Mountain", "City", "Countryside", "Adventure"];

const cardColors = [
  {
    bar: "from-amber-400 to-orange-500",
    glow: "bg-amber-400/20",
    catBg: "bg-gradient-to-r from-amber-400 to-orange-500",
    catText: "text-white",
    btnFrom: "from-amber-500 to-orange-600",
    btnShadow: "shadow-amber-500/30",
    priceBadge: "from-amber-400/90 to-orange-500/90",
  },
  {
    bar: "from-cyan-400 to-sky-500",
    glow: "bg-cyan-400/20",
    catBg: "bg-gradient-to-r from-cyan-400 to-sky-500",
    catText: "text-white",
    btnFrom: "from-cyan-500 to-sky-600",
    btnShadow: "shadow-cyan-500/30",
    priceBadge: "from-cyan-400/90 to-sky-500/90",
  },
  {
    bar: "from-emerald-400 to-teal-500",
    glow: "bg-emerald-400/20",
    catBg: "bg-gradient-to-r from-emerald-400 to-teal-500",
    catText: "text-white",
    btnFrom: "from-emerald-500 to-teal-600",
    btnShadow: "shadow-emerald-500/30",
    priceBadge: "from-emerald-400/90 to-teal-500/90",
  },
  {
    bar: "from-violet-400 to-purple-500",
    glow: "bg-violet-400/20",
    catBg: "bg-gradient-to-r from-violet-400 to-purple-500",
    catText: "text-white",
    btnFrom: "from-violet-500 to-purple-600",
    btnShadow: "shadow-violet-500/30",
    priceBadge: "from-violet-400/90 to-purple-500/90",
  },
  {
    bar: "from-rose-400 to-pink-500",
    glow: "bg-rose-400/20",
    catBg: "bg-gradient-to-r from-rose-400 to-pink-500",
    catText: "text-white",
    btnFrom: "from-rose-500 to-pink-600",
    btnShadow: "shadow-rose-500/30",
    priceBadge: "from-rose-400/90 to-pink-500/90",
  },
  {
    bar: "from-fuchsia-400 to-violet-500",
    glow: "bg-fuchsia-400/20",
    catBg: "bg-gradient-to-r from-fuchsia-400 to-violet-500",
    catText: "text-white",
    btnFrom: "from-fuchsia-500 to-violet-600",
    btnShadow: "shadow-fuchsia-500/30",
    priceBadge: "from-fuchsia-400/90 to-violet-500/90",
  },
];

export function PopularTours({ tours }: PopularToursProps) {
  if (tours.length === 0) return null;

  return (
    <section id="popular-tours" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-1/4 size-96 rounded-full bg-cyan-300/12 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-96 rounded-full bg-amber-300/12 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-emerald-600" />
              </span>
              Most Loved Tours
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Handpicked{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">adventures</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-50" aria-hidden="true" />
              </span>{" "}
              across Ireland
            </h2>

            <p
              className="max-w-lg text-sm leading-7 text-slate-500 animate-in fade-in duration-500"
              style={{ animationDelay: "140ms" }}
            >
              Each tour is personally curated by our team — chosen for its scenery, culture and the memories it creates.
            </p>
          </div>

          <Link
            href="/tours"
            className="group inline-flex shrink-0 items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/35 hover:from-indigo-500 hover:to-violet-500 animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            Explore all tours
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {tours.map((tour, i) => {
            const accent = cardColors[i % cardColors.length];
            const rating = tour.avgRating ? tour.avgRating.toFixed(1) : null;
            const category = categories[i % categories.length];

            return (
              <div
                key={tour.id}
                style={{ animationDelay: `${200 + i * 80}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative flex flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white
                           shadow-lg shadow-slate-200/60
                           transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/60"
              >
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

                {/* Thumbnail */}
                <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                  {tour.thumbnail ? (
                    <Image
                      src={tour.thumbnail}
                      alt={tour.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-slate-100 to-slate-200">
                      <MapPin className="size-10 text-slate-300" />
                      <span className="text-xs font-semibold text-slate-300">Ireland</span>
                    </div>
                  )}

                  {/* Dark gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent" />

                  {/* Category tag */}
                  <div className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm shadow-sm ${accent.catBg} ${accent.catText}`}>
                    {category}
                  </div>

                  {/* Rating */}
                  {rating && (
                    <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-slate-950 shadow-lg backdrop-blur-sm">
                      <Star className="size-3 fill-amber-400 text-amber-400" />
                      {rating}
                    </div>
                  )}
                  {!rating && (
                    <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50/95 px-2.5 py-1 text-[10px] font-bold text-emerald-700 backdrop-blur-sm">
                      <Sparkles className="size-2.5" />
                      New
                    </div>
                  )}

                  {/* Price */}
                  <div className="absolute bottom-3 left-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-white/60">From</p>
                    <p className="font-heading text-2xl font-extrabold leading-none text-white drop-shadow">
                      ${tour.price.toLocaleString()}
                      <span className="text-xs font-normal text-white/60"> /person</span>
                    </p>
                  </div>

                  {/* Duration */}
                  <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-sm border border-white/20">
                    <Clock className="size-3" />
                    {tour.duration}
                  </div>
                </div>

                {/* Top gradient bar */}
                <div className={`h-1 w-full bg-gradient-to-r ${accent.bar}`} />

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <h3 className="font-heading text-lg font-bold text-slate-950 leading-snug group-hover:text-slate-700 transition-colors">
                      {tour.name}
                    </h3>
                    {tour.description && (
                      <p className="mt-1 text-xs leading-6 text-slate-500 line-clamp-2">{tour.description}</p>
                    )}
                  </div>

                  {/* Includes row */}
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-slate-50 to-slate-50/80 px-3 py-2 border border-slate-100">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                      <Users className="size-3.5 text-slate-400" />
                      Up to {tour.maxPersons} guests
                    </div>
                    <div className="h-3.5 w-px bg-slate-200" />
                    {tour.reviewCount > 0 ? (
                      <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
                        <Star className="size-3 fill-amber-400 text-amber-400" />
                        {tour.reviewCount} review{tour.reviewCount !== 1 ? "s" : ""}
                      </div>
                    ) : (
                      <div className="text-[11px] font-medium text-emerald-600">Be the first to review</div>
                    )}
                  </div>

                  {/* CTA */}
                  <Link
                    href={`/tours/${tour.id}`}
                    className={`group/btn mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-2.5 text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 ${accent.btnFrom} ${accent.btnShadow}`}
                  >
                    Book this tour
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
