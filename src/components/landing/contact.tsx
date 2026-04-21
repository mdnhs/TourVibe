import { Mail, Phone, Headset, MapPin, ArrowRight } from "lucide-react";

const contactItems = [
  {
    icon: Mail,
    label: "Email Us",
    value: "hello@tourvibe.ie",
    accent: { iconBg: "bg-amber-400", bar: "from-amber-400 to-orange-500", glow: "bg-amber-300/20" },
  },
  {
    icon: Phone,
    label: "Call Us",
    value: "+353 1 800 0000",
    accent: { iconBg: "bg-cyan-400", bar: "from-cyan-400 to-sky-500", glow: "bg-cyan-300/20" },
  },
  {
    icon: Headset,
    label: "24/7 Support",
    value: "Always on call for you",
    accent: { iconBg: "bg-emerald-400", bar: "from-emerald-400 to-teal-500", glow: "bg-emerald-300/20" },
  },
  {
    icon: MapPin,
    label: "Based In",
    value: "Dublin, Ireland",
    accent: { iconBg: "bg-violet-400", bar: "from-violet-400 to-purple-500", glow: "bg-violet-300/20" },
  },
];

export function Contact() {
  return (
    <section id="contact" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* ── Background glows ── */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/4 size-96 rounded-full bg-amber-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-80 rounded-full bg-cyan-300/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">

          {/* ── LEFT: CTA card ── */}
          <div className="relative overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white p-8 shadow-lg shadow-slate-200/50
                          animate-in fade-in slide-in-from-left-4 duration-500">
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-amber-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-cyan-300/15 blur-3xl" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-amber-700">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-amber-600" />
              </span>
              Get in Touch
            </div>

            <h2 className="mt-6 font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Ready to plan your{" "}
              <span className="relative inline-block">
                <span className="relative z-10">next adventure</span>
                <span className="absolute -bottom-1 left-0 h-1.25 w-full rounded-full bg-amber-400/60" aria-hidden="true" />
              </span>
              ?
            </h2>

            <p className="mt-5 text-sm leading-7 text-slate-500">
              Whether you have a specific destination in mind or just want to explore — our team is here to help you build the perfect Irish road trip.
            </p>

            {/* CTA buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/tours"
                className="group inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-slate-800 hover:shadow-slate-900/30"
              >
                Book a tour
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>

            <div className="mt-8 h-px w-full bg-linear-to-r from-amber-400/40 via-cyan-400/30 to-transparent" />
            <div className="mt-4 flex items-center gap-2">
              <div className="h-0.75 w-8 rounded-full bg-linear-to-r from-amber-400 to-orange-500" />
              <div className="h-0.75 w-3 rounded-full bg-linear-to-r from-amber-400 to-orange-500 opacity-40" />
            </div>
          </div>

          {/* ── RIGHT: contact info grid ── */}
          <div className="animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: "120ms" }}>
            <div className="rounded-[2rem] bg-linear-to-br from-amber-400 via-orange-500 to-cyan-500 p-px shadow-2xl shadow-orange-200/60">
              <div className="h-full rounded-[calc(2rem-1px)] bg-white p-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {contactItems.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        style={{ animationDelay: `${200 + i * 70}ms` }}
                        className="group animate-in fade-in slide-in-from-bottom-3 duration-500
                                   relative overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 p-5
                                   transition-all hover:-translate-y-0.5 hover:border-slate-200 hover:bg-white hover:shadow-md"
                      >
                        <div className={`pointer-events-none absolute -top-6 -right-6 size-24 rounded-full blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${item.accent.glow}`} />
                        <div className={`absolute inset-x-0 top-0 h-0.75 rounded-t-2xl bg-linear-to-r ${item.accent.bar}`} />

                        <div className={`mt-1 flex size-9 items-center justify-center rounded-xl text-white shadow-sm transition-transform duration-300 group-hover:scale-110 ${item.accent.iconBg}`}>
                          <Icon className="size-4" />
                        </div>
                        <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                        <p className="mt-1 text-sm font-semibold text-slate-950 leading-snug">{item.value}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
