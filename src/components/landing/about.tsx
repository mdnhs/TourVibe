import { ShieldCheck, Headset, ArrowRight, Sparkles } from "lucide-react";

export function About() {
  return (
    <section id="about" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">

          {/* ── LEFT: dark hero card ── */}
          <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.35)]
                          animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Decorative orbs inside card */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-amber-400/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-cyan-400/10 blur-3xl" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-amber-400" />
              </span>
              About
            </div>

            <h2 className="mt-6 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              Designed for operators who sell{" "}
              <span className="relative inline-block">
                <span className="relative z-10">memorable</span>
                <span
                  className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60"
                  aria-hidden="true"
                />
              </span>{" "}
              car journeys.
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60">
              TourVibe combines a premium landing page with practical operator
              tooling: login, signup, roles, local database storage and a
              starter dashboard.
            </p>

            {/* Stat pills */}
            <div className="mt-8 flex flex-wrap gap-3">
              {[
                { value: "100%", label: "TypeScript" },
                { value: "v16", label: "Next.js" },
                { value: "MIT", label: "License" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-sm"
                >
                  <p className="font-heading text-lg font-bold text-white leading-none">
                    {item.value}
                  </p>
                  <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/35">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Bottom gradient bar */}
            <div className="mt-8 h-px w-full bg-linear-to-r from-amber-400/40 via-cyan-400/40 to-transparent" />

            <div className="mt-5 flex items-center gap-2 text-xs font-semibold text-white/40">
              <Sparkles className="size-3.5 text-amber-400/60" />
              Production-ready from day one
            </div>
          </div>

          {/* ── RIGHT: feature cards ── */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card 1 */}
            <div
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50
                         transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "120ms" }}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-amber-300/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Top bar */}
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem] bg-linear-to-r from-amber-400 to-orange-500" />

              <div className="mt-2 flex size-11 items-center justify-center rounded-2xl bg-amber-400 text-white shadow-lg
                              transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck className="size-5" />
              </div>

              <h3 className="mt-6 font-heading text-xl font-bold text-slate-950 leading-snug">
                Secure by default
              </h3>
              <p className="mt-2.5 text-sm leading-7 text-slate-500">
                Better Auth handles credentials and sessions, while SQLite keeps
                the setup lightweight for local development and fast iteration.
              </p>

              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>

              {/* Accent dashes */}
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
                <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50
                         transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-slate-200/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "220ms" }}
            >
              {/* Hover glow */}
              <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-cyan-300/20 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Top bar */}
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem] bg-linear-to-r from-cyan-400 to-sky-500" />

              <div className="mt-2 flex size-11 items-center justify-center rounded-2xl bg-cyan-400 text-white shadow-lg
                              transition-transform duration-300 group-hover:scale-110">
                <Headset className="size-5" />
              </div>

              <h3 className="mt-6 font-heading text-xl font-bold text-slate-950 leading-snug">
                Customer support ready
              </h3>
              <p className="mt-2.5 text-sm leading-7 text-slate-500">
                The contact and review sections give your tour brand a more
                trustworthy, service-led presentation from day one.
              </p>

              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>

              {/* Accent dashes */}
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-cyan-400 to-sky-500" />
                <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-cyan-400 to-sky-500 opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
