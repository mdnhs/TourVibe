import { Star, Quote, BadgeCheck, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

interface Review {
  name: string;
  role: string;
  quote: string;
  image?: string | null;
}

interface ReviewsProps {
  reviews: Review[];
}

const cardAccents = [
  {
    bar: "from-amber-400 to-orange-500",
    glow: "bg-amber-400/20",
    avatarGrad: "from-amber-400 to-orange-500",
    avatarShadow: "shadow-amber-400/40",
    trip: "🌊 Coastal Tour",
    tripBorder: "border-amber-400/20 bg-amber-400/8 text-amber-300",
    statColor: "text-amber-300",
  },
  {
    bar: "from-cyan-400 to-sky-500",
    glow: "bg-cyan-400/20",
    avatarGrad: "from-cyan-400 to-sky-500",
    avatarShadow: "shadow-cyan-400/40",
    trip: "🏔️ Mountain Tour",
    tripBorder: "border-cyan-400/20 bg-cyan-400/8 text-cyan-300",
    statColor: "text-cyan-300",
  },
  {
    bar: "from-emerald-400 to-teal-500",
    glow: "bg-emerald-400/20",
    avatarGrad: "from-emerald-400 to-teal-500",
    avatarShadow: "shadow-emerald-400/40",
    trip: "🏰 Heritage Tour",
    tripBorder: "border-emerald-400/20 bg-emerald-400/8 text-emerald-300",
    statColor: "text-emerald-300",
  },
  {
    bar: "from-violet-400 to-purple-500",
    glow: "bg-violet-400/20",
    avatarGrad: "from-violet-400 to-purple-500",
    avatarShadow: "shadow-violet-400/40",
    trip: "🌿 Countryside Tour",
    tripBorder: "border-violet-400/20 bg-violet-400/8 text-violet-300",
    statColor: "text-violet-300",
  },
];

export function Reviews({ reviews }: ReviewsProps) {
  return (
    <section
      id="reviews"
      className="relative overflow-hidden px-4 py-24 text-white sm:px-6"
      style={{
        background:
          "radial-gradient(ellipse 110% 55% at 80% 10%, rgba(139,92,246,0.18) 0%, transparent 55%)," +
          "radial-gradient(ellipse 90% 50% at 10% 85%, rgba(99,102,241,0.15) 0%, transparent 50%)," +
          "radial-gradient(ellipse 60% 40% at 50% 50%, rgba(236,72,153,0.07) 0%, transparent 60%)," +
          "#030712",
      }}
    >
      {/* Dot-grid texture */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Color orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 right-1/4 size-[500px] rounded-full bg-violet-600/18 blur-[110px]" />
        <div className="absolute -bottom-24 left-1/4 size-[450px] rounded-full bg-indigo-600/15 blur-[100px]" />
        <div className="absolute top-1/2 -left-20 size-80 rounded-full bg-purple-500/12 blur-3xl" />
        <div className="absolute bottom-1/3 right-0 size-64 rounded-full bg-rose-500/8 blur-3xl" />
      </div>

      {/* Top edge */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent" />

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/25 bg-gradient-to-r from-violet-400/10 to-indigo-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-300 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
              </span>
              Traveler Stories
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight sm:text-5xl animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Loved by{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-violet-300 to-indigo-300 bg-clip-text text-transparent">travelers</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-violet-400/50 to-indigo-400/50" aria-hidden="true" />
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
            className="flex shrink-0 items-center gap-4 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 backdrop-blur-sm animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            <div className="text-center">
              <div className="flex justify-center gap-0.5 mb-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="font-heading text-xl font-bold leading-none bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">4.9</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">Rating</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-heading text-xl font-bold leading-none bg-gradient-to-r from-cyan-300 to-sky-400 bg-clip-text text-transparent">500+</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">Travelers</p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div className="text-center">
              <p className="font-heading text-xl font-bold leading-none bg-gradient-to-r from-emerald-300 to-teal-400 bg-clip-text text-transparent">98%</p>
              <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">Happy</p>
            </div>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {reviews.map((review, i) => {
            const accent = cardAccents[i % cardAccents.length];
            const initials = review.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

            return (
              <div
                key={review.name}
                style={{ animationDelay: `${200 + i * 80}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.06]
                           backdrop-blur-sm transition-all hover:-translate-y-1.5 hover:border-white/20 hover:bg-white/10 hover:shadow-xl hover:shadow-black/40"
              >
                {/* Hover glow */}
                <div className={`pointer-events-none absolute -top-10 -right-10 size-44 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />

                {/* Top gradient bar */}
                <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />

                <div className="flex flex-1 flex-col gap-4 p-6">
                  {/* Trip type + quote icon */}
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold backdrop-blur-sm ${accent.tripBorder}`}>
                      {accent.trip}
                    </span>
                    <Quote className="size-6 text-white/10" />
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
                  <div className={`h-px w-full bg-gradient-to-r ${accent.bar} opacity-20`} />

                  {/* Author */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xs font-bold text-white shadow-md overflow-hidden ${accent.avatarGrad} ${accent.avatarShadow}`}>
                        {review.image ? (
                          <img src={review.image} alt={review.name} className="size-full object-cover" />
                        ) : (
                          initials
                        )}
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
                    <div className={`h-0.5 w-10 rounded-full bg-gradient-to-r ${accent.bar}`} />
                    <div className={`h-0.5 w-4 rounded-full bg-gradient-to-r ${accent.bar} opacity-40`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-12 relative overflow-hidden flex flex-col items-center gap-4 rounded-[2rem] border border-violet-500/25 bg-gradient-to-br from-violet-500/12 via-indigo-500/8 to-violet-500/12 px-8 py-8 text-center backdrop-blur-sm animate-in fade-in slide-in-from-bottom-3 duration-500"
          style={{ animationDelay: "500ms" }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/50">
            <Sparkles className="size-3 text-amber-400" />
            Start your journey
          </div>
          <p className="text-lg font-bold text-white">Ready to create your own story?</p>
          <Link
            href="/tours"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-amber-400/30 transition-all hover:-translate-y-0.5 hover:shadow-amber-400/40"
          >
            Start your adventure
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
