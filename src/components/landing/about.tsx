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
        <div className="grid gap-6 sm:gap-8 lg:grid-cols-[0.9fr_1.1fr]">

          {/* LEFT: story card */}
          <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] bg-gradient-to-br from-indigo-950 via-violet-950 to-purple-950 p-6 sm:p-8 text-white shadow-2xl shadow-indigo-950/40 animate-in fade-in slide-in-from-left-4 duration-500">
            {/* Shimmer top line */}
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-400/50 to-transparent" />
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-indigo-400/10 blur-3xl" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-400/10 px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-violet-300">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-violet-400" />
              </span>
              Our Story
            </div>

            <h2 className="mt-4 sm:mt-6 font-heading text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
              {titleHighlight && title.includes(titleHighlight) ? (
                <>
                  {title.split(titleHighlight)[0]}
                  <span className="relative inline-block">
                    <span className="relative z-10 bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">{titleHighlight}</span>
                    <span className="absolute -bottom-0.5 sm:-bottom-1 left-0 h-0.5 sm:h-1 w-full rounded-full bg-gradient-to-r from-amber-400/50 to-orange-400/50" aria-hidden="true" />
                  </span>
                  {title.split(titleHighlight).slice(1).join(titleHighlight)}
                </>
              ) : (
                title
              )}
            </h2>

            <p className="mt-4 sm:mt-5 text-[11px] sm:text-sm leading-relaxed sm:leading-7 text-white/60">
              {description}
            </p>

            {/* Stats row */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-2 sm:gap-3">
              {stats.map((s, i) => (
                <div key={`${s.label || "stat"}-${i}`} className="relative overflow-hidden rounded-lg sm:rounded-xl border border-white/10 bg-white/5 px-2 py-2 sm:px-3 sm:py-3 text-center">
                  <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${statColors[i % statColors.length]}`} />
                  <p className={`font-heading text-lg sm:text-xl font-extrabold leading-none bg-gradient-to-r ${statColors[i % statColors.length]} bg-clip-text text-transparent`}>{s.value}</p>
                  <p className="mt-0.5 sm:mt-1 text-[8px] sm:text-[10px] font-semibold uppercase tracking-widest text-white/35">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 sm:mt-8 h-px w-full bg-gradient-to-r from-violet-400/30 via-indigo-400/30 to-transparent" />
            <div className="mt-4 sm:mt-5 flex items-center gap-2">
              <div className="h-0.5 w-8 sm:w-10 rounded-full bg-gradient-to-r from-violet-400 to-purple-500" />
              <div className="h-0.5 w-3 sm:w-4 rounded-full bg-gradient-to-r from-violet-400 to-purple-500 opacity-40" />
            </div>
          </div>

          {/* RIGHT: value cards */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* Card 1 */}
            <div
              className="group relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-lg shadow-slate-200/50
                         transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-amber-100/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "120ms" }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-amber-300/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[1.25rem] sm:rounded-t-[2rem] bg-gradient-to-r from-amber-400 to-orange-500" />

              <div className="mt-1 sm:mt-2 flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-400/30 transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck className="size-4 sm:size-5" />
              </div>
              <h3 className="mt-4 sm:mt-6 font-heading text-sm sm:text-xl font-bold text-slate-950 leading-snug">Safety first</h3>
              <p className="mt-2 text-[11px] sm:text-sm leading-relaxed sm:leading-7 text-slate-500 line-clamp-2 sm:line-clamp-none">
                All our drivers are licensed, background-checked and first aid trained.
              </p>
              <div className="mt-4 sm:mt-5 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-amber-600">
                Details <ArrowRight className="size-3 sm:size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="group relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-lg shadow-slate-200/50
                         transition-all hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-cyan-100/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "200ms" }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 size-36 rounded-full bg-cyan-300/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[1.25rem] sm:rounded-t-[2rem] bg-gradient-to-r from-cyan-400 to-sky-500" />

              <div className="mt-1 sm:mt-2 flex size-9 sm:size-11 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-cyan-400 to-sky-500 text-white shadow-lg shadow-cyan-400/30 transition-transform duration-300 group-hover:scale-110">
                <Award className="size-4 sm:size-5" />
              </div>
              <h3 className="mt-4 sm:mt-6 font-heading text-sm sm:text-xl font-bold text-slate-950 leading-snug">Top guides</h3>
              <p className="mt-2 text-[11px] sm:text-sm leading-relaxed sm:leading-7 text-slate-500 line-clamp-2 sm:line-clamp-none">
                Our expert local guides bring each destination to life with stories.
              </p>
              <div className="mt-4 sm:mt-5 flex items-center gap-1.5 text-[10px] sm:text-xs font-semibold text-cyan-600">
                Explore <ArrowRight className="size-3 sm:size-3.5 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Card 3 — full width */}
            <div
              className="group relative overflow-hidden rounded-[1.25rem] sm:rounded-[2rem] border border-slate-200/80 bg-white p-4 sm:p-6 shadow-lg shadow-slate-200/50 col-span-2
                         transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/80
                         animate-in fade-in slide-in-from-bottom-4 duration-500"
              style={{ animationDelay: "280ms" }}
            >
              <div className="pointer-events-none absolute -top-10 -right-10 size-48 rounded-full bg-emerald-300/25 blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div className="absolute inset-x-0 top-0 h-1 rounded-t-[1.25rem] sm:rounded-t-[2rem] bg-gradient-to-r from-emerald-400 to-teal-500" />

              <div className="flex items-start gap-3 sm:gap-5">
                <div className="mt-1 flex size-9 sm:size-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-lg shadow-emerald-400/30 transition-transform duration-300 group-hover:scale-110">
                  <Heart className="size-4 sm:size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading text-sm sm:text-xl font-bold text-slate-950 leading-snug">Crafted with care</h3>
                  <p className="mt-1 sm:mt-2 text-[11px] sm:text-sm leading-relaxed sm:leading-7 text-slate-500 line-clamp-2 sm:line-clamp-none">
                    Every booking is reviewed by our team to ensure the route, vehicle and timing are perfectly matched.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
