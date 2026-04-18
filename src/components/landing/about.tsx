import { ShieldCheck, Headset } from "lucide-react";

export function About() {
  return (
    <section id="about" className="px-6 py-20">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_40px_120px_rgba(15,23,42,0.4)]">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-amber-300">
            About
          </p>
          <h2 className="mt-4 font-heading text-4xl font-semibold tracking-tight">
            Designed for operators who sell memorable car journeys.
          </h2>
          <p className="mt-5 text-sm leading-7 text-white/70">
            TourVibe combines a premium landing page with practical operator tooling:
            login, signup, roles, local database storage and a starter dashboard.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <ShieldCheck className="size-5 text-amber-600" />
            <h3 className="mt-8 font-heading text-2xl font-semibold text-slate-950">Secure by default</h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Better Auth handles credentials and sessions, while SQLite keeps the setup
              lightweight for local development and fast iteration.
            </p>
          </div>
          <div className="rounded-[2rem] border border-slate-200 bg-white p-6">
            <Headset className="size-5 text-cyan-600" />
            <h3 className="mt-8 font-heading text-2xl font-semibold text-slate-950">
              Customer support ready
            </h3>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              The contact and review sections give your tour brand a more trustworthy,
              service-led presentation from day one.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
