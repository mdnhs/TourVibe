import { Clock, Users, Star, ArrowRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";

interface Tour {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  duration: string;
  maxPersons: number;
  thumbnail: string;
  reviewCount: number;
  avgRating: number | null;
}

interface ToursListProps {
  tours: Tour[];
  currency?: string;
}

const cardColors = [
  { bar: "from-amber-400 to-orange-500",   glow: "bg-amber-300/25",   badge: "bg-amber-400/15 text-amber-700 border-amber-200" },
  { bar: "from-cyan-400 to-sky-500",       glow: "bg-cyan-300/25",    badge: "bg-cyan-400/15 text-cyan-700 border-cyan-200" },
  { bar: "from-emerald-400 to-teal-500",   glow: "bg-emerald-300/25", badge: "bg-emerald-400/15 text-emerald-700 border-emerald-200" },
  { bar: "from-violet-400 to-purple-500",  glow: "bg-violet-300/25",  badge: "bg-violet-400/15 text-violet-700 border-violet-200" },
  { bar: "from-rose-400 to-pink-500",      glow: "bg-rose-300/25",    badge: "bg-rose-400/15 text-rose-700 border-rose-200" },
  { bar: "from-fuchsia-400 to-violet-500", glow: "bg-fuchsia-300/25", badge: "bg-fuchsia-400/15 text-fuchsia-700 border-fuchsia-200" },
];

export function ToursList({ tours, currency }: ToursListProps) {
  if (tours.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2rem] border border-slate-200/80 bg-white py-24 text-center shadow-lg shadow-slate-200/50">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-slate-100">
          <MapPin className="size-7 text-slate-400" />
        </div>
        <h3 className="mt-5 font-heading text-xl font-bold text-slate-900">No tours found</h3>
        <p className="mt-2 max-w-xs text-sm leading-6 text-slate-500">
          Try adjusting your filters or search term to discover more experiences.
        </p>
        <div className="mt-5 flex items-center gap-2">
          <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
          <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, i) => {
        const accent = cardColors[i % cardColors.length];
        const rating = tour.avgRating ? tour.avgRating.toFixed(1) : null;

        return (
          <Link
            key={tour.id}
            href={`/tours/${tour.slug}`}
            style={{ animationDelay: `${i * 60}ms` }}
            className="group animate-in fade-in slide-in-from-bottom-3 duration-500
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
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-linear-to-br from-slate-100 to-slate-200">
                  <MapPin className="size-10 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-0 bg-linear-to-t from-slate-950/35 to-transparent" />

              {/* Price badge */}
              <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 px-3 py-1.5 shadow-lg backdrop-blur-sm">
                <span className="font-heading text-base font-extrabold text-slate-950">
                  {formatPrice(tour.price, currency)}
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

              {/* New badge */}
              {!rating && (
                <div className="absolute bottom-3 right-3 rounded-xl border border-emerald-200 bg-emerald-50/95 px-2.5 py-1.5 shadow-lg backdrop-blur-sm">
                  <span className="text-[10px] font-bold text-emerald-700">New</span>
                </div>
              )}
            </div>

            {/* Top gradient bar */}
            <div className={`h-1 w-full bg-linear-to-r ${accent.bar}`} />

            {/* Content */}
            <div className="flex flex-1 flex-col gap-4 p-5">
              <div className="space-y-1.5">
                <h3 className="font-heading text-lg font-bold text-slate-950 leading-snug line-clamp-1 group-hover:text-slate-700 transition-colors">
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

              {/* Bottom */}
              <div className="mt-auto flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <div className={`h-0.75 w-8 rounded-full bg-linear-to-r ${accent.bar}`} />
                  <div className={`h-0.75 w-3 rounded-full bg-linear-to-r ${accent.bar} opacity-40`} />
                </div>
                <span className="flex items-center gap-1 text-xs font-semibold text-slate-400 transition-colors group-hover:text-slate-700">
                  View details
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
