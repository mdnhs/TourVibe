import { ShieldCheck, Award, Heart, ArrowRight } from "lucide-react";

export function About({
  title = "Born from a passion for unforgettable Irish roads.",
  titleHighlight = "unforgettable",
  description = "TourVibe was founded by a team of travel enthusiasts who believed that the real Ireland is best discovered from the window of a car — not a tour bus. Every route we offer has been personally driven, refined and handpicked for its scenery, culture and hidden surprises.",
  stats = [
    { value: "8+", label: "Years operating" },
    { value: "50+", label: "Destinations" },
    { value: "98%", label: "Happy guests" },
  ],
}: {
  title?: string;
  titleHighlight?: string;
  description?: string;
  stats?: { value: string; label: string }[];
}) {
  const statColors = [
    "from-amber-400 to-orange-500",
    "from-cyan-400 to-sky-500",
    "from-emerald-400 to-teal-500",
  ];

  return (
    <section id="about" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 size-96 rounded-full bg-indigo-300/8 blur-3xl" />
        <div className="absolute bottom-0 right-0 size-80 rounded-full bg-violet-300/8 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-300/6 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT: story card */}
          <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 p-8 text-white shadow-2xl shadow-indigo-950/40 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Shimmer top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-400/10 blur-3xl" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
              </span>
              Our Story
            </div>

            <h2 className="mt-6 font-heading text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {titleHighlight && title.includes(titleHighlight) ? (
                <>
                  {title.split(titleHighlight)[0]}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">{titleHighlight}</span>
                    <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-amber-400/50 to-orange-400/50" aria-hidden="true" />
                  </span>
                  {title.split(titleHighlight).slice(1).join(titleHighlight)}
                </>
              ) : (
                title
              )}
            </h2>

            <p className="mt-5 text-sm leading-7 text-white/60">
              {description}
            </p>

            {/* Stats row */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {stats.map((s, i) => (
                <div key={s.label} className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-center">
                  <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${statColors[i % statColors.length]}`} />
                  <p className={`font-heading text-xl font-extrabold leading-none bg-gradient-to-r ${statColors[i % statColors.length]} bg-clip-text text-transparent`}>{s.value}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-white/35">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 h-px w-full bg-gradient-to-r from-violet-400/30 via-indigo-400/30 to-transparent" />
            <div className="mt-5 flex items-center gap-2">
              <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" />
              <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 opacity-40" />
            </div>
          </div>

          {/* RIGHT: value cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card 1 */}
            <div
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50
                         transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-100/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "120ms" }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-amber-300/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem] bg-gradient-to-r from-amber-400 to-orange-500" />

              <div className="mt-2 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-bold text-slate-950 leading-snug">Safety first, always</h3>
              <p className="mt-2.5 text-sm leading-7 text-slate-500">
                All our drivers are fully licensed, background-checked and trained in first aid. Your safety is built into every route we operate.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-amber-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500" />
                <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 opacity-40" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50
                         transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-100/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-cyan-300/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem] bg-gradient-to-r from-cyan-400 to-sky-500" />

              <div className="mt-2 flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-lg shadow-cyan-400/30 transition-transform duration-300 group-hover:scale-110">
                <Award className="size-5" />
              </div>
              <h3 className="mt-6 font-heading text-xl font-bold text-slate-950 leading-snug">Award-winning guides</h3>
              <p className="mt-2.5 text-sm leading-7 text-slate-500">
                Our expert local guides bring each destination to life with fascinating stories, insider knowledge and genuine passion for Ireland.
              </p>
              <div className="mt-5 flex items-center gap-1.5 text-xs font-semibold text-cyan-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Learn more <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-4 flex items-center gap-2">
                <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500" />
                <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-cyan-400 to-sky-500 opacity-40" />
              </div>
            </div>

            {/* Card 3 — full width */}
            <div
              className="group relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-6 shadow-lg shadow-slate-200/50 sm:col-span-2
                         transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "280ms" }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-emerald-300/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[2rem] bg-gradient-to-r from-emerald-400 to-teal-500" />

              <div className="flex items-start gap-5">
                <div className="mt-1 flex size-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-400/30 transition-transform duration-300 group-hover:scale-110">
                  <Heart className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-xl font-bold text-slate-950 leading-snug">Crafted with care, every time</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    We don&apos;t do cookie-cutter tours. Every booking is reviewed by our team to ensure the route, vehicle and timing are perfectly matched to your group&apos;s needs — because great travel is all in the details.
                  </p>
                </div>
              </div>
              <div className="mt-5 flex items-center gap-2">
                <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" />
                <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 opacity-40" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
