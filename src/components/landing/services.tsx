import { LucideIcon, Compass, Plane, Users, Map, Headset, Car, Star, Shield, Clock, MapPin, Camera, Heart, Sparkles } from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  Compass, Plane, Users, Map, Headset, Car, Star, Shield, Clock, MapPin, Camera, Heart,
};

interface Service {
  title: string;
  description: string;
  icon: string;
}

interface ServicesProps {
  services: Service[];
  badgeText?: string;
  sectionTitle?: string;
  sectionHighlight?: string;
  sectionSubtitle?: string;
}

const cardAccents = [
  {
    bar: "from-amber-400 to-orange-500",
    iconGradient: "from-amber-400 to-orange-500",
    iconShadow: "shadow-amber-400/40",
    glow: "bg-amber-400/20",
    text: "text-amber-600",
    lightBg: "bg-amber-50",
    border: "border-amber-200",
    featuredGlow1: "bg-amber-500/15",
    featuredGlow2: "bg-orange-400/10",
  },
  {
    bar: "from-cyan-400 to-sky-500",
    iconGradient: "from-cyan-400 to-sky-500",
    iconShadow: "shadow-cyan-400/40",
    glow: "bg-cyan-400/20",
    text: "text-cyan-600",
    lightBg: "bg-cyan-50",
    border: "border-cyan-200",
    featuredGlow1: "bg-cyan-500/15",
    featuredGlow2: "bg-sky-400/10",
  },
  {
    bar: "from-emerald-400 to-teal-500",
    iconGradient: "from-emerald-400 to-teal-500",
    iconShadow: "shadow-emerald-400/40",
    glow: "bg-emerald-400/20",
    text: "text-emerald-600",
    lightBg: "bg-emerald-50",
    border: "border-emerald-200",
    featuredGlow1: "bg-emerald-500/15",
    featuredGlow2: "bg-teal-400/10",
  },
  {
    bar: "from-violet-400 to-purple-500",
    iconGradient: "from-violet-400 to-purple-500",
    iconShadow: "shadow-violet-400/40",
    glow: "bg-violet-400/20",
    text: "text-violet-600",
    lightBg: "bg-violet-50",
    border: "border-violet-200",
    featuredGlow1: "bg-violet-500/15",
    featuredGlow2: "bg-purple-400/10",
  },
  {
    bar: "from-rose-400 to-pink-500",
    iconGradient: "from-rose-400 to-pink-500",
    iconShadow: "shadow-rose-400/40",
    glow: "bg-rose-400/20",
    text: "text-rose-600",
    lightBg: "bg-rose-50",
    border: "border-rose-200",
    featuredGlow1: "bg-rose-500/15",
    featuredGlow2: "bg-pink-400/10",
  },
  {
    bar: "from-fuchsia-400 to-violet-500",
    iconGradient: "from-fuchsia-400 to-violet-500",
    iconShadow: "shadow-fuchsia-400/40",
    glow: "bg-fuchsia-400/20",
    text: "text-fuchsia-600",
    lightBg: "bg-fuchsia-50",
    border: "border-fuchsia-200",
    featuredGlow1: "bg-fuchsia-500/15",
    featuredGlow2: "bg-violet-400/10",
  },
];

function renderTitle(title: string, highlight: string) {
  if (!highlight || !title.includes(highlight)) {
    return <>{title}</>;
  }
  const parts = title.split(highlight);
  return (
    <>
      {parts[0]}
      <span className="relative inline-block">
        <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">{highlight}</span>
        <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-indigo-400/50 to-violet-400/50" aria-hidden="true" />
      </span>
      {parts[1]}
    </>
  );
}

export function Services({
  services,
  badgeText = "What We Offer",
  sectionTitle = "Every journey, perfectly arranged",
  sectionHighlight = "perfectly",
  sectionSubtitle = "From scenic coastal drives to private airport transfers — we handle every detail so you can focus on the experience.",
}: ServicesProps) {
  const [featured, ...rest] = services;
  const featuredAccent = cardAccents[0];

  return (
    <section id="services" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-indigo-300/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-violet-300/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700 animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-indigo-600" />
              </span>
              {badgeText}
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              {renderTitle(sectionTitle, sectionHighlight)}
            </h2>
          </div>

          <p
            className="max-w-sm text-sm leading-7 text-slate-500 animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            {sectionSubtitle}
          </p>
        </div>

        {/* Bento grid */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">

          {/* Featured card — spans 2 cols */}
          {featured && (() => {
            const Icon = iconMap[featured.icon] ?? Compass;
            return (
              <div
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative overflow-hidden rounded-[1.5rem] border border-indigo-900/60 bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950
                           shadow-xl shadow-indigo-950/40 md:col-span-2
                           transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-950/50"
                style={{ animationDelay: "200ms" }}
              >
                {/* Shimmer top line */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />

                {/* Glow orbs */}
                <div className={`pointer-events-none absolute -top-16 -right-16 size-56 rounded-full blur-3xl ${featuredAccent.featuredGlow1}`} />
                <div className={`pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${featuredAccent.featuredGlow2}`} />

                <div className={`h-1.5 w-full bg-gradient-to-r ${featuredAccent.bar}`} />

                <div className="space-y-6 p-7">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${featuredAccent.iconGradient} ${featuredAccent.iconShadow}`}>
                      <Icon className="size-6" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
                      <Sparkles className="size-2.5 text-amber-400" />
                      Most Popular
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-heading text-2xl font-bold text-white leading-snug">
                      {featured.title}
                    </h3>
                    <p className="text-sm leading-7 text-white/60 max-w-md">
                      {featured.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className={`h-0.5 w-10 rounded-full bg-gradient-to-r ${featuredAccent.bar}`} />
                    <div className={`h-0.5 w-4 rounded-full bg-gradient-to-r ${featuredAccent.bar} opacity-40`} />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Remaining cards */}
          {rest.map((service, i) => {
            const Icon = iconMap[service.icon] ?? Compass;
            const accent = cardAccents[(i + 1) % cardAccents.length];

            return (
              <div
                key={service.title}
                style={{ animationDelay: `${280 + i * 70}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white
                           shadow-lg shadow-slate-200/60
                           transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-slate-300/50"
              >
                <div className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />
                <div className={`h-1.5 w-full bg-gradient-to-r ${accent.bar}`} />

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-12 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md transition-transform duration-300 group-hover:scale-110 ${accent.iconGradient} ${accent.iconShadow}`}>
                      <Icon className="size-5" />
                    </div>
                    <span className="font-heading text-4xl font-black text-slate-100 select-none leading-none">
                      {String(i + 2).padStart(2, "0")}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-heading text-xl font-bold text-slate-950 leading-snug">{service.title}</h3>
                    <p className="text-sm leading-7 text-slate-500">{service.description}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className={`h-0.5 w-10 rounded-full bg-gradient-to-r ${accent.bar}`} />
                    <div className={`h-0.5 w-4 rounded-full bg-gradient-to-r ${accent.bar} opacity-40`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
