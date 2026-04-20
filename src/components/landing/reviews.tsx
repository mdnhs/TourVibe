import { Star, Quote, BadgeCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

interface Review {
  name: string;
  role: string;
  quote: string;
}

interface ReviewsProps {
  reviews: Review[];
}

const cardAccents = [
  { bar: "from-amber-400 to-orange-500",   glow: "bg-amber-400/15",   avatar: "bg-amber-400/20 text-amber-300",   trip: "🌊 Coastal Tour" },
  { bar: "from-cyan-400 to-sky-500",       glow: "bg-cyan-400/15",    avatar: "bg-cyan-400/20 text-cyan-300",    trip: "🏔️ Mountain Tour" },
  { bar: "from-emerald-400 to-teal-500",   glow: "bg-emerald-400/15", avatar: "bg-emerald-400/20 text-emerald-300", trip: "🏰 Heritage Tour" },
  { bar: "from-violet-400 to-purple-500",  glow: "bg-violet-400/15",  avatar: "bg-violet-400/20 text-violet-300",  trip: "🌿 Countryside Tour" },
  { bar: "from-rose-400 to-pink-500",      glow: "bg-rose-400/15",    avatar: "bg-rose-400/20 text-rose-300",    trip: "🌅 Sunset Drive" },
  { bar: "from-fuchsia-400 to-violet-500", glow: "bg-fuchsia-400/15", avatar: "bg-fuchsia-400/20 text-fuchsia-300", trip: "🏙️ City Tour" },
];

export function Reviews({ reviews }: ReviewsProps) {
  return (
    <section id="reviews" className="relative overflow-hidden bg-slate-950 px-4 py-24 text-white sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-400/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-cyan-400/8 blur-3xl" />
        <div className="absolute top-1/2 -left-24 size-72 rounded-full bg-emerald-400/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-300
                            animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-cyan-400" />
              </span>
              Traveler Stories
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl
                         animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Loved by{" "}
              <span className="relative inline-block">
                <span className="relative z-10">travelers</span>
                <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
              </span>{" "}
              worldwide
            </h2>

            <p
              className="max-w-md text-sm leading-7 text-white/50 animate-in fade-in duration-500"
              style={{ animationDelay: "140ms" }}
            >
              Real words from real adventurers — unfiltered experiences straight from the road.
            </p>
          </div>

          {/* Stats cluster */}
          <div
            className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm
                       animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            <div className="text-center">
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-heading text-xl font-bold leading-none text-white">4.9</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">Rating</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-heading text-xl font-bold leading-none text-white">500+</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">Travelers</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-heading text-xl font-bold leading-none text-white">98%</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">Happy</p>
            </div>
          </div>
        </div>

        {/* ── Cards ── */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((review, i) => {
            const accent = cardAccents[i % cardAccents.length];
            const initials = review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div
                key={review.name}
                style={{ animationDelay: `${200 + i * 80}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative flex flex-col overflow-hidden rounded-[2rem] border border-white/8 bg-white/5
                           backdrop-blur-sm transition-all hover:-translate-y-1 hover:border-white/15 hover:bg-white/8"
              >
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -top-10 -right-10 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

                {/* Top gradient bar */}
                <div className={`h-1.5 w-full bg-linear-to-r ${accent.bar}`} />

                <div className="flex flex-1 flex-col gap-4 p-6">
                  {/* Trip type + quote icon */}
                  <div className="flex items-center justify-between">
                    <span className="rounded-full border border-white/10 bg-white/8 px-3 py-1 text-[11px] font-semibold text-white/60">
                      {accent.trip}
                    </span>
                    <Quote className="size-6 text-white/15" />
                  </div>

                  {/* Stars */}
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className="size-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="flex-1 text-sm leading-7 text-white/70">
                    &ldquo;{review.quote}&rdquo;
                  </p>

                  {/* Divider */}
                  <div className="h-px w-full bg-white/8" />

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${accent.avatar}`}>
                        {initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none">{review.name}</p>
                        <p className="mt-1 text-xs text-white/40">{review.role}</p>
                      </div>
                    </div>
                    {/* Verified badge */}
                    <div className="flex items-center gap-1 rounded-full border border-emerald-400/25 bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                      <BadgeCheck className="size-3" />
                      Verified
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div className="flex items-center gap-2">
                    <div className={`h-0.75 w-8 rounded-full bg-linear-to-r ${accent.bar}`} />
                    <div className={`h-0.75 w-3 rounded-full bg-linear-to-r ${accent.bar} opacity-40`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Bottom CTA ── */}
        <div
          className="mt-12 flex flex-col items-center gap-4 rounded-[2rem] border border-white/8 bg-white/5 px-8 py-8 text-center backdrop-blur-sm
                     animate-in fade-in slide-in-from-bottom-3 duration-500"
          style={{ animationDelay: "500ms" }}
        >
          <p className="text-sm text-white/50">Ready to create your own story?</p>
          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 rounded-xl bg-amber-400 px-6 py-2.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-400/25 transition-all hover:-translate-y-0.5 hover:bg-amber-300"
          >
            Start your adventure
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
