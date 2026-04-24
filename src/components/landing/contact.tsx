import { Mail, Phone, Headset, MapPin, ArrowRight, Sparkles } from "lucide-react";
import { ContactForm } from "./contact-form";

export function Contact({
  email = "hello@tourvibe.ie",
  phone = "+353 1 800 0000",
  location = "Dublin, Ireland",
}: {
  email?: string;
  phone?: string;
  location?: string;
}) {
  const contactItems = [
    {
      icon: Mail,
      label: "Email Us",
      value: email,
      accent: { iconGrad: "from-amber-400 to-orange-500", bar: "from-amber-400 to-orange-500" },
    },
    {
      icon: Phone,
      label: "Call Us",
      value: phone,
      accent: { iconGrad: "from-cyan-400 to-sky-500", bar: "from-cyan-400 to-sky-500" },
    },
    {
      icon: Headset,
      label: "24/7 Support",
      value: "Always on call",
      accent: { iconGrad: "from-emerald-400 to-teal-500", bar: "from-emerald-400 to-teal-500" },
    },
    {
      icon: MapPin,
      label: "Based In",
      value: location,
      accent: { iconGrad: "from-violet-400 to-purple-500", bar: "from-violet-400 to-purple-500" },
    },
  ];

  return (
    <section id="contact" className="relative overflow-hidden px-4 py-24 sm:px-6">
      {/* Background glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 right-1/4 size-96 rounded-full bg-indigo-300/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/4 size-80 rounded-full bg-violet-300/10 blur-3xl" />
        <div className="absolute top-1/2 right-0 size-64 rounded-full bg-amber-300/8 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-2">

          {/* LEFT: info + CTA */}
          <div
            className="relative overflow-hidden rounded-[2rem] border border-indigo-100 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/60 p-8 shadow-lg shadow-indigo-100/50 animate-in fade-in slide-in-from-left-4 duration-500"
          >
            <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full bg-indigo-300/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-12 -left-12 size-48 rounded-full bg-violet-300/15 blur-3xl" />

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-indigo-700">
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75" />
                <span className="relative inline-flex size-1.5 rounded-full bg-indigo-600" />
              </span>
              Get in Touch
            </div>

            <h2 className="mt-6 font-heading text-3xl font-extrabold leading-tight tracking-tight text-slate-950 sm:text-4xl">
              Ready to plan your{" "}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">next adventure</span>
                <span className="absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-indigo-400/40 to-violet-400/40" aria-hidden="true" />
              </span>
              ?
            </h2>

            <p className="mt-4 text-sm leading-7 text-slate-500">
              Whether you have a specific destination in mind or just want to explore — our team is here to help you build the perfect Irish road trip.
            </p>

            {/* Contact info items */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {contactItems.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white/80 p-4 shadow-sm"
                  >
                    <div className={`absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r ${item.accent.bar}`} />
                    <div className={`flex size-8 items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm ${item.accent.iconGrad}`}>
                      <Icon className="size-3.5" />
                    </div>
                    <p className="mt-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.label}</p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-900 leading-snug">{item.value}</p>
                  </div>
                );
              })}
            </div>

            {/* CTA buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href="/tours"
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:-translate-y-0.5 hover:shadow-indigo-500/35"
              >
                Book a tour
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </a>
              <a
                href="/#about"
                className="group inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-900"
              >
                <Sparkles className="size-3.5 text-amber-500" />
                Learn more
              </a>
            </div>

            <div className="mt-6 h-px w-full bg-gradient-to-r from-indigo-400/40 via-violet-400/30 to-transparent" />
            <div className="mt-4 flex items-center gap-2">
              <div className="h-0.5 w-10 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
              <div className="h-0.5 w-4 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 opacity-40" />
            </div>
          </div>

          {/* RIGHT: contact form */}
          <div
            className="animate-in fade-in slide-in-from-right-4 duration-500"
            style={{ animationDelay: "120ms" }}
          >
            <div className="rounded-[2rem] bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 p-px shadow-2xl shadow-indigo-200/60 h-full">
              <div className="h-full rounded-[calc(2rem-1px)] bg-white p-7">
                <div className="mb-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-indigo-500">Send a message</p>
                  <h3 className="mt-1 font-heading text-xl font-bold text-slate-950">We&apos;d love to hear from you</h3>
                  <p className="mt-1 text-xs text-slate-500">We reply within 24 hours.</p>
                </div>
                <ContactForm />
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
