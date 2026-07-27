import { Clock, Users, Star, ArrowRight, MapPin, Car, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/currency";
import { stripHtml } from "@/lib/utils";

interface Tour {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  price2?: number | null;
  duration: string;
  maxPersons: number;
  maxPersons2?: number | null;
  thumbnail: string;
  reviewCount: number;
  avgRating: number | null;
  vehicleCount: number;
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
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {tours.map((tour, i) => {
        const accent = cardColors[i % cardColors.length];

        return (
          <Link
            key={tour.id}
            href={`/tours/${tour.slug}`}
            className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-lg shadow-slate-200/50 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/60"
          >
            {/* Top gradient bar */}
            <div className={`h-1.5 w-full bg-linear-to-r ${accent.bar}`} />

            {/* Thumbnail */}
            <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
              {tour.thumbnail ? (
                <Image
                  src={tour.thumbnail}
                  alt={tour.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-slate-300">
                  <Sparkles className="size-10" />
                </div>
              )}

              {/* Rating badge */}
              {tour.avgRating !== null && (
                <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full border border-white/40 bg-slate-950/70 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-md">
                  <Star className="size-3.5 fill-amber-400 text-amber-400" />
                  <span>{tour.avgRating.toFixed(1)}</span>
                  {tour.reviewCount > 0 && (
                    <span className="text-[10px] font-normal text-slate-300">({tour.reviewCount})</span>
                  )}
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
              <div>
                <h3 className="font-heading text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-amber-600">
                  {tour.name}
                </h3>

                {tour.description && (
                  <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {stripHtml(tour.description)}
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
                  Up to {tour.maxPersons} {tour.maxPersons2 ? `(or ${tour.maxPersons2})` : ""}
                </span>
                {tour.vehicleCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    <Car className="size-3" />
                    {tour.vehicleCount} vehicle{tour.vehicleCount !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Bottom — price + CTA */}
              <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
                <div className="leading-tight">
                  <span className="font-heading text-xl font-extrabold text-slate-950">
                    {formatPrice(tour.price, currency)}
                  </span>
                  {tour.price2 != null && (
                    <span className="text-[11px] font-semibold text-amber-600 block">
                      Up to {tour.maxPersons2}: {formatPrice(tour.price2, currency)}
                    </span>
                  )}
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-xl bg-linear-to-r ${accent.bar} px-3.5 py-2 text-xs font-bold text-white shadow-md transition-transform group-hover:translate-x-0.5`}>
                  View details
                  <ArrowRight className="size-3.5" />
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
