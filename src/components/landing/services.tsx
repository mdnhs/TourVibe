import { LucideIcon } from "lucide-react";

interface Service {
  title: string;
  description: string;
  icon: LucideIcon;
}

interface ServicesProps {
  services: Service[];
}

const cardAccents = [
  { bar: "from-amber-400 to-orange-500",   iconBg: "bg-amber-400",   glow: "bg-amber-300/30",   text: "text-amber-700",   lightBg: "bg-amber-50",   border: "border-amber-200" },
  { bar: "from-cyan-400 to-sky-500",       iconBg: "bg-cyan-400",    glow: "bg-cyan-300/30",    text: "text-cyan-700",    lightBg: "bg-cyan-50",    border: "border-cyan-200" },
  { bar: "from-emerald-400 to-teal-500",   iconBg: "bg-emerald-400", glow: "bg-emerald-300/30", text: "text-emerald-700", lightBg: "bg-emerald-50", border: "border-emerald-200" },
  { bar: "from-violet-400 to-purple-500",  iconBg: "bg-violet-400",  glow: "bg-violet-300/30",  text: "text-violet-700",  lightBg: "bg-violet-50",  border: "border-violet-200" },
  { bar: "from-rose-400 to-pink-500",      iconBg: "bg-rose-400",    glow: "bg-rose-300/30",    text: "text-rose-700",    lightBg: "bg-rose-50",    border: "border-rose-200" },
  { bar: "from-fuchsia-400 to-violet-500", iconBg: "bg-fuchsia-400", glow: "bg-fuchsia-300/30", text: "text-fuchsia-700", lightBg: "bg-fuchsia-50", border: "border-fuchsia-200" },
];

export function Services({ services }: ServicesProps) {
  const [featured, ...rest] = services;
  const featuredAccent = cardAccents[0];

  return (
    <section id="services" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 size-96 rounded-full bg-cyan-300/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* ── Header ── */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-cyan-700
                            animate-in fade-in slide-in-from-left-4 duration-500">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-cyan-600" />
              </span>
              What We Offer
            </div>

            <h2
              className="font-heading text-4xl font-extrabold tracking-tight text-slate-950 sm:text-5xl
                         animate-in fade-in slide-in-from-left-4 duration-500"
              style={{ animationDelay: "80ms" }}
            >
              Every journey,{" "}
              <span className="relative inline-block">
                <span className="relative z-10">perfectly</span>
                <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
              </span>{" "}
              arranged
            </h2>
          </div>

          <p
            className="max-w-sm text-sm leading-7 text-slate-500 animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "160ms" }}
          >
            From scenic coastal drives to private airport transfers — we handle every detail so you can focus on the experience.
          </p>
        </div>

        {/* ── Bento grid ── */}
        <div className="mt-12 grid gap-5 md:grid-cols-3">

          {/* Featured card — spans 2 cols */}
          {featured && (() => {
            const Icon = featured.icon;
            return (
              <div
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-slate-950
                           shadow-xl shadow-slate-900/20 md:col-span-2
                           transition-all hover:-translate-y-1 hover:shadow-2xl"
                style={{ animationDelay: "200ms" }}
              >
                {/* Glow orbs inside dark card */}
                <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-amber-400/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-cyan-400/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                <div className={`h-1.5 w-full bg-linear-to-r ${featuredAccent.bar}`} />

                <div className="space-y-6 p-7">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-14 items-center justify-center rounded-2xl text-slate-950 shadow-lg transition-transform duration-300 group-hover:scale-110 ${featuredAccent.iconBg}`}>
                      <Icon className="size-6" />
                    </div>
                    <span className="font-heading text-5xl font-black text-white/8 select-none leading-none">01</span>
                  </div>

                  <div className="space-y-3">
                    <div className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${featuredAccent.border} ${featuredAccent.lightBg} ${featuredAccent.text}`}>
                      Most Popular
                    </div>
                    <h3 className="font-heading text-2xl font-bold text-white leading-snug">
                      {featured.title}
                    </h3>
                    <p className="text-sm leading-7 text-white/60 max-w-md">
                      {featured.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <div className={`h-0.75 w-8 rounded-full bg-linear-to-r ${featuredAccent.bar}`} />
                    <div className={`h-0.75 w-3 rounded-full bg-linear-to-r ${featuredAccent.bar} opacity-40`} />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Remaining cards */}
          {rest.map((service, i) => {
            const Icon = service.icon;
            const accent = cardAccents[(i + 1) % cardAccents.length];

            return (
              <div
                key={service.title}
                style={{ animationDelay: `${280 + i * 70}ms` }}
                className="group animate-in fade-in slide-in-from-bottom-4 duration-500
                           relative overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white
                           shadow-lg shadow-slate-200/60
                           transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80"
              >
                <div className={`pointer-events-none absolute -top-12 -right-12 size-40 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${accent.glow}`} />
                <div className={`h-1.5 w-full bg-linear-to-r ${accent.bar}`} />

                <div className="space-y-5 p-6">
                  <div className="flex items-start justify-between">
                    <div className={`flex size-12 items-center justify-center rounded-2xl text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${accent.iconBg}`}>
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
                    <div className={`h-0.75 w-8 rounded-full bg-linear-to-r ${accent.bar}`} />
                    <div className={`h-0.75 w-3 rounded-full bg-linear-to-r ${accent.bar} opacity-40`} />
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
